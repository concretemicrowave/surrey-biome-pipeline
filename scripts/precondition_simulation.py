"""Does the variance-removal fraction predict when an A-vs-B test has power?

The precondition proposed in the paper -- *measure how much predictor spatial
variance a coarsening destroys, and treat a low fraction as disqualifying rather
than null* -- rests on two observations: Surrey (12.3% removed at 4 km,
unanswerable) and the Fraser Valley transect (48.4% at 25 km, answerable). Two
points establish a direction, not a threshold. This script turns them into a
characterised one on synthetic fields, using no new data.

WHAT IS ANALYTIC AND WHAT IS NOT -- read this before reading the output
----------------------------------------------------------------------
Model B is Model A upscaled, so the information B loses is exactly the
within-cell residual of the predictor field, whose variance IS the quantity
``upscaling_diagnostics`` reports. That the *available* advantage to A grows
with f is therefore an identity, not a finding, and the paper must not present
it as one. This project has twice mistaken an algebraic identity for evidence
(KNOWN_ISSUES V1, the dry_dist decompositions); the same trap is live here.

What is NOT analytic, and is the entire point of the simulation, is the
**power**: at what f does a paired, spatially-blocked CV with this sample size,
this fold structure, this learner and this noise level actually resolve a real
resolution advantage from zero? That depends on the estimator's ability to
exploit the fine residual (a depth-limited forest with max_features="sqrt" may
simply not), on fold-to-fold variance, and on n. It cannot be derived.

DESIGN -- the true effect is held CONSTANT; only f varies
--------------------------------------------------------
Sites are 300 points over a 100 km square, 4 summers, matching Extent 2. Four
"climate" predictors are Gaussian random fields with correlation length L. The
field is a FIXED spatial pattern with a per-summer offset added, not an
independent redraw each summer: a valley's climate pattern is stable and the
years shift it. The response is generated from the predictors at their FINE
locations plus an independent short-range local field standing in for terrain
aspect and stand structure -- which is what Extent 2 found actually drives
stand water stress -- plus noise:

    y = beta * Xbar_fine(s) + gamma * Z_local(s) + eps(s,t)

beta is FIXED across the whole sweep. A genuine resolution advantage therefore
exists everywhere in the sweep, of constant generative size. Sweeping L at
fixed cell size moves f without moving the truth, so any change in detection
rate is power, not effect size.

Two design faults found in calibration and fixed here, recorded so they are not
reintroduced. (i) Correlation lengths at or above the domain width drove the
smoother to a constant, and renormalising then amplified floating-point noise
into a spurious field, making f NON-MONOTONE in L. L is now capped well inside
the domain and the field is reflected rather than wrapped, so it is not forced
periodic. (ii) Redrawing the field independently each summer made the response's
between-summer variance dominate its between-site variance; both models then
predicted the summer level perfectly (CV R^2 ~ 1.00) and the spatial contrast --
the only thing the precondition concerns -- was swamped. The response now
carries no summer term, and the summers are replicate observations with
independent noise.

Models A and B, the folds, the learner and the paired bootstrap CI are
``src.pipeline.experiment``'s own functions, imported and called unmodified.
A reimplementation would generalise a protocol the paper does not use.

FALSIFICATION CRITERIA, FIXED BEFORE THE RUN
--------------------------------------------
The simulation SUPPORTS the precondition only if all three hold:

  F1. Detection rate rises monotonically (Spearman rho >= +0.8) with f across
      the sweep, at constant beta.
  F2. There is a low-f regime with detection rate <= 0.25 -- i.e. a real effect
      is genuinely unrecoverable there, so a null is uninformative rather than
      evidence of no effect.
  F3. There is a high-f regime with detection rate >= 0.80.

If detection is flat in f, the precondition is not doing the work claimed and
the diagnostic should be dropped from the paper rather than reported weakly.
If detection is high even at f ~ 0.12, Surrey's null was informative after all
and the paper's central framing is wrong.

Outputs (never under data/, which is the panel of record):
    data/processed/sim_precondition.csv   per (f-level, seed) results
    data/processed/sim_precondition_summary.csv
"""

from __future__ import annotations

import argparse
import logging
import math

import numpy as np
import pandas as pd
from scipy.ndimage import gaussian_filter

from src.pipeline import experiment as ex
from src.pipeline import paths
from src.pipeline.zonal import CORRIDOR_ID

logger = logging.getLogger(__name__)

# --- fixed study geometry, matched to Extent 2 -------------------------------
N_SITES = 300
N_YEARS = 4
DOMAIN_M = 100_000.0          # 100 km square, the transect's span
CELL_M = 25_000.0             # the transect's headline cell size
GRID_N = 512                  # field is generated on a 512x512 lattice, 195 m

FEATURES = [f"clim{i}" for i in range(4)]
TARGET = "tvwsi"              # same name experiment.py expects

# --- the generative model; BETA IS CONSTANT ACROSS THE SWEEP -----------------
# The three weights are set A PRIORI, not tuned until the criteria pass, which
# would be the same self-confirmation the docstring warns about. With the
# climate composite standardised, equal weights put climate at 1/3 of response
# variance (oracle R^2 ~ 0.33). The rationale is that a practitioner only has a
# resolution question worth asking if climate matters materially to the
# response; a regime where it explains nothing makes the comparison moot rather
# than underpowered, and that is a different claim from the one being tested.
BETA = 1.0                    # weight on the fine-scale climate signal
GAMMA = 1.0                   # weight on the local (terrain/structure) driver
NOISE_SD = 1.0
LOCAL_RANGE_M = 3_000.0       # short-range local driver; survives any coarsening
YEAR_SD = 1.5                 # between-year climate variation

# --- the sweep: correlation length of the climate field ----------------------
# Long L over a fixed cell -> smooth within cells -> little variance removed.
# Short L -> cells average across real structure -> much removed.
# Capped at 40 km, well inside the 100 km domain: see fault (i) in the docstring.
RANGE_SWEEP_M = [40_000, 28_000, 20_000, 14_000, 10_000, 7_000, 5_000, 3_500]


def _field(rng: np.random.Generator, range_m: float) -> np.ndarray:
    """A stationary Gaussian random field on the lattice.

    Gaussian-smoothed white noise rather than a Matern draw: the correlation
    length is set directly by the filter width, which is the knob being swept,
    and it costs an FFT rather than a 260,000-square covariance factorisation.
    Reflected, not wrapped -- a wrapped field is periodic across the domain,
    which at long L is exactly the degeneracy that broke the first calibration.
    Standardisation is done on the SAMPLED values, not the lattice, so every
    sweep level delivers the same predictor variance to the models.
    """
    sigma_px = (range_m / DOMAIN_M) * GRID_N
    return gaussian_filter(rng.standard_normal((GRID_N, GRID_N)), sigma_px,
                           mode="reflect")


def _sample(field: np.ndarray, ix: np.ndarray, iy: np.ndarray) -> np.ndarray:
    return field[iy, ix]


def _z(v: np.ndarray) -> np.ndarray:
    return (v - v.mean()) / v.std()


def make_panel(rng: np.random.Generator, range_m: float) -> pd.DataFrame:
    """One synthetic panel: 300 sites x 4 summers, with a real fine-scale effect."""
    ix = rng.integers(0, GRID_N, N_SITES)
    iy = rng.integers(0, GRID_N, N_SITES)
    x_m = ix * (DOMAIN_M / GRID_N)
    y_m = iy * (DOMAIN_M / GRID_N)

    local = _z(_sample(_field(rng, LOCAL_RANGE_M), ix, iy))
    # The climate pattern is FIXED across summers; only its level moves. See
    # fault (ii): an independent redraw per summer swamps the spatial contrast.
    spatial = {f: _z(_sample(_field(rng, range_m), ix, iy)) for f in FEATURES}
    year_offset = rng.normal(0, YEAR_SD, N_YEARS)

    # The response is spatial: beta on the fine-scale climate mean, gamma on the
    # local driver, and independent noise per site-summer. No summer term -- the
    # four summers are replicate reads of the same spatial truth.
    # Standardised so the climate share of response variance is fixed by the
    # weights alone and does not drift with how many features are averaged.
    xbar = _z(np.mean([spatial[f] for f in FEATURES], axis=0))
    signal = BETA * xbar + GAMMA * local

    rows = []
    for t in range(N_YEARS):
        rows.append(pd.DataFrame({
            CORRIDOR_ID: np.arange(N_SITES),
            "year": 2022 + t, "x_m": x_m, "y_m": y_m,
            TARGET: signal + rng.normal(0, NOISE_SD, N_SITES),
            # Carried for diagnostics only. Never in FEATURES, so no model sees
            # them; blocked_cv is passed the feature list explicitly.
            "_xbar": xbar, "_local": local,
            **{f: spatial[f] + year_offset[t] for f in FEATURES},
        }))
    return pd.concat(rows, ignore_index=True)


def one_run(seed: int, range_m: float, *, n_repeats: int) -> dict:
    """Fit A and B on one synthetic panel; return f and the paired difference."""
    rng = np.random.default_rng(seed)
    df = make_panel(rng, range_m)

    diag = ex.upscaling_diagnostics(df, FEATURES, cell_m=CELL_M)
    f_removed = float(diag["var_removed_frac"].mean())

    a, _ = ex.blocked_cv(df, FEATURES, n_repeats=n_repeats, seed=ex.SEED + seed,
                         target=TARGET)
    b, _ = ex.blocked_cv(ex.upscale(df, FEATURES, cell_m=CELL_M), FEATURES,
                         n_repeats=n_repeats, seed=ex.SEED + seed, target=TARGET)
    d = ex.paired_difference(a, b, "rmse", seed=ex.SEED + seed)

    # A "detection" is the paper's own criterion: the paired interval excludes
    # zero. Signed, because detecting the WRONG direction is not a detection.
    detected = bool(d["ci_lo"] < 0 and d["ci_hi"] < 0)
    # The regime, made visible: what share of response variance climate carries,
    # and the ceiling an oracle knowing the true composite would reach. Without
    # these the detection rates cannot be read against anything.
    climate_share = float((BETA * df["_xbar"]).var() / df[TARGET].var())
    return {"seed": seed, "range_m": range_m, "var_removed_frac": f_removed,
            "d_rmse": d["mean_diff"], "ci_lo": d["ci_lo"], "ci_hi": d["ci_hi"],
            "detected": detected, "climate_share": climate_share,
            "r2_a": float(a["r2"].mean()), "r2_b": float(b["r2"].mean())}


def wilson(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson score interval for a proportion.

    A detection rate here is k successes out of n=20 synthetic panels, so its
    sampling noise is large -- wide enough that adjacent levels of the sweep
    overlap heavily. Reporting the rates bare invites exactly the over-reading
    of an underpowered comparison that this paper argues against, so the
    interval travels with every rate. Wilson rather than Wald because the rates
    run to 0.95, where Wald's interval leaves the unit range.
    """
    p = k / n
    d = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / d
    half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return centre - half, centre + half


def run(n_seeds: int = 20, n_repeats: int = 5) -> tuple[pd.DataFrame, pd.DataFrame]:
    out = []
    for range_m in RANGE_SWEEP_M:
        for seed in range(n_seeds):
            out.append(one_run(seed, range_m, n_repeats=n_repeats))
            logger.info("L=%6.0f m seed %2d  f=%.3f  dRMSE=%+.4f [%+.4f, %+.4f]%s",
                        range_m, seed, out[-1]["var_removed_frac"],
                        out[-1]["d_rmse"], out[-1]["ci_lo"], out[-1]["ci_hi"],
                        "  DETECTED" if out[-1]["detected"] else "")
    per_run = pd.DataFrame(out)

    summary = (per_run.groupby("range_m")
               .agg(f_mean=("var_removed_frac", "mean"),
                    f_sd=("var_removed_frac", "std"),
                    d_rmse_mean=("d_rmse", "mean"),
                    detection_rate=("detected", "mean"),
                    climate_share=("climate_share", "mean"),
                    r2_a=("r2_a", "mean"), r2_b=("r2_b", "mean"),
                    n=("seed", "size"))
               .reset_index().sort_values("f_mean"))
    bounds = [wilson(round(r.detection_rate * r.n), int(r.n))
              for r in summary.itertuples()]
    summary["det_lo"] = [lo for lo, _ in bounds]
    summary["det_hi"] = [hi for _, hi in bounds]
    return per_run, summary


def check(summary: pd.DataFrame) -> None:
    """The three criteria fixed in the docstring, evaluated out loud."""
    from scipy.stats import spearmanr
    rho = spearmanr(summary["f_mean"], summary["detection_rate"]).statistic
    lo = summary["detection_rate"].min()
    hi = summary["detection_rate"].max()
    rates = summary["detection_rate"].tolist()
    strict = all(b > a for a, b in zip(rates, rates[1:]))
    print("\n=== falsification criteria (fixed before the run) ===")
    print(f"F1 monotone rho >= +0.8      : rho = {rho:+.3f}   "
          f"{'PASS' if rho >= 0.8 else 'FAIL'}")
    # F1 was WORDED "rises monotonically" and OPERATIONALISED as rho >= +0.8.
    # Those are not the same test: rho measures monotone association, and only
    # rho = 1.0 means the sequence itself never falls. Reported separately so
    # the paper cannot inherit the stronger word from the weaker test.
    print(f"   sequence strictly increasing level to level: "
          f"{'yes' if strict else 'NO -- report as a trend, not as monotone'}")
    print(f"F2 a low-f regime <= 0.25    : min = {lo:.2f}       "
          f"{'PASS' if lo <= 0.25 else 'FAIL'}")
    print(f"F3 a high-f regime >= 0.80   : max = {hi:.2f}       "
          f"{'PASS' if hi >= 0.80 else 'FAIL'}")
    # Every rate above is k/20, so it carries real sampling noise. F3 in
    # particular is met on the point estimate while its interval reaches well
    # below the threshold, and the low-f levels are not separable from each
    # other at all. Print the intervals next to the criteria that use them.
    print("\n=== detection rate with 95% Wilson interval (n = 20 per level) ===")
    for r in summary.itertuples():
        print(f"   f = {r.f_mean:.3f}   {r.detection_rate:.2f}   "
              f"[{r.det_lo:.2f}, {r.det_hi:.2f}]")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--seeds", type=int, default=20)
    p.add_argument("--repeats", type=int, default=5)
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()
    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING,
                        format="%(asctime)s %(levelname)s %(message)s")
    # experiment.upscale logs a line per call; it is noise at this volume.
    logging.getLogger("src.pipeline.experiment").setLevel(logging.WARNING)

    per_run, summary = run(args.seeds, args.repeats)
    per_run.to_csv(paths.PROCESSED / "sim_precondition.csv", index=False)
    summary.to_csv(paths.PROCESSED / "sim_precondition_summary.csv", index=False)

    pd.set_option("display.width", 140)
    print(summary.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
    check(summary)
    print(f"\nSurrey measured f = 0.123 (4 km); transect f = 0.484 (25 km)")


if __name__ == "__main__":
    main()
