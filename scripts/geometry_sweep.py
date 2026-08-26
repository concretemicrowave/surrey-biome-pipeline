"""Does the f -> detection calibration hold outside Extent 2's geometry?

`precondition_simulation.py` fixes the study geometry to the Fraser Valley
transect: 300 sites over a 100 km square coarsened to 25 km cells. Every power
figure in the paper, and every number `coarsegate.power_at()` ships, is
transferred from that one geometry. The paper nonetheless states the
precondition as a general rule ("below f ~ 0.4 a null carries no information"),
and a referee is entitled to ask whether the calibration is a property of f or
of the transect.

This sweeps the two geometric knobs the original run held fixed -- domain
extent and coarse cell size -- and asks whether the f -> detection curve moves.

WHAT IS ANALYTIC AND WHAT IS NOT
--------------------------------
f is a property of the field and the cell, so it is fully determined by the
ratio L / cell_m and is expected to track it across geometries. That is an
identity, not a finding, and the sweep must not be reported as showing it.

What is NOT analytic is whether DETECTION at a matched f is the same across
geometries. It need not be: domain / cell_m sets how many distinct coarse
values Model B sees (its cardinality), and the sites are blocked into k = 5
spatial blocks whose physical size scales with the domain. Either could move
power without moving f.

DESIGN -- L is swept in units of cell_m, so f is comparable across geometries
----------------------------------------------------------------------------
The five geometries are chosen to separate the domain / cell RATIO from the
absolute scale:

    transect   100 km / 25 km   ratio  4.0   the published reference
    mid         60 km / 15 km   ratio  4.0   same ratio, 0.6x the scale
    wide       200 km / 25 km   ratio  8.0   more coarse cells, same cell
    fine-cell  100 km / 10 km   ratio 10.0   more coarse cells, same domain
    surrey      30 km /  4 km   ratio  7.5   Extent 1's geometry

`mid` against `transect` is the control: same ratio, different absolute size.
If the calibration depends only on the ratio, those two must coincide.

L levels are cell_m * [1.6, 1.12, 0.8, 0.56, 0.4, 0.28, 0.2, 0.14], which
reproduces the published RANGE_SWEEP_M exactly at the transect geometry, so
that column is a regression test on the refactor as well as a sweep arm.

TWO DESIGN CHOICES, RECORDED SO THEY ARE NOT MISREAD
----------------------------------------------------
(i) L_max = 1.6 * cell_m is <= 0.4 * domain_m in all five, which respects the
    cap fault (i) in `precondition_simulation`'s docstring: a correlation
    length approaching the domain width drives the smoother to a constant and
    makes f non-monotone in L. Checked at import, not assumed.

(ii) LOCAL_RANGE_M stays at 3 km in METRES, not as a fraction of the domain.
    The local driver stands in for terrain aspect and stand structure, which
    have a real physical scale that does not shrink when a study area does. The
    consequence is that the geometries differ in more than one way at once: at
    the surrey geometry the local driver spans 1/10 of the domain against 1/33
    at the transect. A variant holding LOCAL_RANGE_M / domain_m fixed is NOT
    tested here, and a geometry effect found below cannot be attributed to
    domain size alone without it.

GENERALISATION CRITERIA, FIXED BEFORE THE RUN
---------------------------------------------
The calibration generalises only if all three hold:

  G1. Within each geometry taken alone, detection rises with f
      (Spearman rho >= +0.8). If it does not, that geometry is not a
      calibration curve at all.
  G2. The low-f disqualification, which is the paper's actual normative claim,
      holds everywhere: in EVERY geometry, every level with f <= 0.25 has a
      detection rate <= 0.25.
  G3. At matched f, geometries are not separated: binning f at 0.1 and taking
      bins populated by >= 3 geometries, the Wilson intervals of the extreme
      pair overlap in every such bin.

G3 is the one that can fail quietly. If it does, `power_at()` cannot keep
reporting a single number for an f and must either take geometry arguments or
carry the spread as an uncertainty. That is a defect in the shipped tool, not
only in the paper, so it is reported loudly.

Outputs (tagged; never touches the pre-registered sim_precondition*.csv):
    data/processed/geometry_sweep.csv
    data/processed/geometry_sweep_summary.csv
"""

from __future__ import annotations

import argparse
import logging
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, "scripts")
import precondition_simulation as S  # noqa: E402
from src.pipeline import paths  # noqa: E402

log = logging.getLogger("geometry_sweep")

# label, domain_m, cell_m
GEOMETRIES = [
    ("transect",  100_000.0, 25_000.0),
    ("mid",        60_000.0, 15_000.0),
    ("wide",      200_000.0, 25_000.0),
    ("fine-cell", 100_000.0, 10_000.0),
    ("surrey",     30_000.0,  4_000.0),
]

# L as multiples of cell_m; at the transect geometry this is RANGE_SWEEP_M.
L_OVER_CELL = [1.6, 1.12, 0.8, 0.56, 0.4, 0.28, 0.2, 0.14]

# Design choice (i): the correlation length must stay well inside the domain.
L_DOMAIN_CAP = 0.4


def _range_m(mult: float, cell_m: float) -> float:
    """L in metres, rounded: 1.12 * 25000 is 28000.000000000004 in binary float,
    which would silently make the transect arm a different sweep from the one
    the paper reports."""
    return round(mult * cell_m, 6)

for _label, _dom, _cell in GEOMETRIES:
    _lmax = max(L_OVER_CELL) * _cell
    if _lmax > L_DOMAIN_CAP * _dom + 1e-6:
        raise ValueError(
            f"{_label}: L_max {_lmax:.0f} m exceeds {L_DOMAIN_CAP} x domain "
            f"({L_DOMAIN_CAP * _dom:.0f} m); see design choice (i)")
if [_range_m(c, 25_000.0) for c in L_OVER_CELL] != [float(v) for v in S.RANGE_SWEEP_M]:
    raise ValueError("transect arm no longer reproduces RANGE_SWEEP_M")


def run(n_seeds: int, n_repeats: int) -> tuple[pd.DataFrame, pd.DataFrame]:
    rows = []
    for label, domain_m, cell_m in GEOMETRIES:
        for mult in L_OVER_CELL:
            range_m = _range_m(mult, cell_m)
            for seed in range(n_seeds):
                r = S.one_run(seed, range_m, n_repeats=n_repeats,
                              domain_m=domain_m, cell_m=cell_m)
                r["geometry"] = label
                r["l_over_cell"] = mult
                rows.append(r)
            m = pd.DataFrame(rows)
            m = m[(m.geometry == label) & (m.l_over_cell == mult)]
            lo, hi = S.wilson(int(m.detected.sum()), len(m))
            log.info("%-10s L/cell=%.2f  L=%6.0f m  f=%.3f  "
                     "detection=%.2f [%.2f, %.2f]",
                     label, mult, range_m, m.var_removed_frac.mean(),
                     m.detected.mean(), lo, hi)
    per_run = pd.DataFrame(rows)

    summary = (per_run.groupby(["geometry", "domain_m", "cell_m", "l_over_cell"])
               .agg(f_mean=("var_removed_frac", "mean"),
                    f_sd=("var_removed_frac", "std"),
                    d_rmse_mean=("d_rmse", "mean"),
                    detection_rate=("detected", "mean"),
                    climate_share=("climate_share", "mean"),
                    r2_a=("r2_a", "mean"), r2_b=("r2_b", "mean"),
                    n=("seed", "size"))
               .reset_index().sort_values(["geometry", "f_mean"]))
    bounds = [S.wilson(round(r.detection_rate * r.n), int(r.n))
              for r in summary.itertuples()]
    summary["det_lo"] = [lo for lo, _ in bounds]
    summary["det_hi"] = [hi for _, hi in bounds]
    return per_run, summary


def check(summary: pd.DataFrame) -> None:
    """The three criteria fixed in the docstring, evaluated out loud."""
    from scipy.stats import spearmanr

    print("\n=== G1: detection rises with f, WITHIN each geometry ===")
    g1 = True
    for label, g in summary.groupby("geometry"):
        rho = spearmanr(g["f_mean"], g["detection_rate"]).statistic
        ok = rho >= 0.8
        g1 &= bool(ok)
        print(f"   {label:<10} rho = {rho:+.3f}   {'PASS' if ok else 'FAIL'}")

    print("\n=== G2: low-f disqualification (f <= 0.25 -> detection <= 0.25) ===")
    low = summary[summary.f_mean <= 0.25]
    g2 = True
    for label, g in low.groupby("geometry"):
        worst = g["detection_rate"].max()
        ok = worst <= 0.25
        g2 &= bool(ok)
        print(f"   {label:<10} {len(g)} level(s) at f <= 0.25, "
              f"max detection = {worst:.2f}   {'PASS' if ok else 'FAIL'}")
    if low.empty:
        g2 = False
        print("   no level reached f <= 0.25 -- G2 is untested, not passed")

    print("\n=== G3: at matched f, geometries are not separated ===")
    s = summary.assign(bin=(summary.f_mean // 0.1) * 0.1)
    g3, tested = True, 0
    for b, g in s.groupby("bin"):
        if g["geometry"].nunique() < 3:
            continue
        tested += 1
        lo_row = g.loc[g.detection_rate.idxmin()]
        hi_row = g.loc[g.detection_rate.idxmax()]
        overlap = lo_row.det_hi >= hi_row.det_lo
        g3 &= bool(overlap)
        print(f"   f in [{b:.1f}, {b + 0.1:.1f})  {g['geometry'].nunique()} geoms  "
              f"{lo_row.geometry} {lo_row.detection_rate:.2f}"
              f"[{lo_row.det_lo:.2f},{lo_row.det_hi:.2f}] vs "
              f"{hi_row.geometry} {hi_row.detection_rate:.2f}"
              f"[{hi_row.det_lo:.2f},{hi_row.det_hi:.2f}]   "
              f"{'overlap' if overlap else 'SEPARATED'}")
    if not tested:
        g3 = False
        print("   no f bin held >= 3 geometries -- G3 is untested, not passed")

    print(f"\n=== verdict ===\n   G1 {'PASS' if g1 else 'FAIL'}   "
          f"G2 {'PASS' if g2 else 'FAIL'}   G3 {'PASS' if g3 else 'FAIL'}")
    if not (g1 and g2 and g3):
        print("   The calibration is NOT shown to be geometry-independent.\n"
              "   coarsegate.power_at() must take geometry arguments or carry\n"
              "   the across-geometry spread as an uncertainty. See D15.")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--seeds", type=int, default=20)
    p.add_argument("--repeats", type=int, default=5)
    p.add_argument("--tag", default="")
    p.add_argument("--overwrite", action="store_true")
    p.add_argument("-v", "--verbose", action="store_true")
    a = p.parse_args()
    logging.basicConfig(level=logging.INFO if a.verbose else logging.WARNING,
                        format="%(asctime)s %(message)s")
    logging.getLogger("src.pipeline.experiment").setLevel(logging.WARNING)

    out = paths.PROCESSED / f"geometry_sweep{a.tag}.csv"
    if out.exists() and not a.overwrite:
        p.error(f"{out.name} exists. Pass --tag or --overwrite.")

    per_run, summary = run(a.seeds, a.repeats)
    per_run.to_csv(out, index=False)
    summary.to_csv(paths.PROCESSED / f"geometry_sweep_summary{a.tag}.csv",
                   index=False)
    pd.set_option("display.width", 170)
    print(summary.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
    check(summary)
    print("\nSurrey measured f = 0.123 (4 km); transect f = 0.484 (25 km)")


if __name__ == "__main__":
    main()
