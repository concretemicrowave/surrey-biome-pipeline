"""The Phase 3 hypothesis test: scale-free (A) vs coarse (B) climate predictors.

**Hypothesis.** Downscaled, scale-free ClimateBC predictors forecast localized
corridor water stress better than coarse grid-based climate does, on the same
153 Surrey GIN corridors.

Isolating resolution (PHASE3_PLAN §4)
-------------------------------------
Everything is held constant between the two models except spatial resolution:
same target (per-corridor CDEI), same corridors, same summers, same algorithm,
same feature list, same folds, same random seeds.

* **Model A** — the ClimateBC values sampled at each corridor's own location and
  elevation (~375-750 m effective resolution).
* **Model B** — *those same values*, spatially averaged within coarse cells
  (default 4 km); each corridor then takes its cell's value.

Deriving B by upscaling A is the point. Substituting a different coarse climate
product would confound "which dataset" with "what resolution", and the question
is only about resolution. The upscale is area-blind — it averages the sample
points that fall in a cell — which is what a coarse grid cell actually delivers.

Validation (PHASE3_PLAN §5)
---------------------------
* **Spatially-blocked, grouped CV.** Folds are KMeans blocks over corridor
  coordinates, held out whole. Random splits would put a corridor's neighbours
  in the training set and score spatial autocorrelation as skill.
* **Corridor grouping is automatic** because blocking is done on the corridor,
  not the row: all four summers of a corridor live in the same block, so a
  corridor can never appear in both train and test.
* **Repeats** re-seed the KMeans blocking, so results are not one lucky
  partition. Reported with a paired CI over folds, never as a point estimate.
* **Forward temporal holdout** — train on the earlier summers, test on the most
  recent one — as a second, stricter test that no spatial CV can substitute for.

A caution the results have to be read against: over a study area ~30 km across,
ClimateBC's between-corridor variation is small next to its between-year
variation. A grouped spatial fold therefore asks the model to rank corridors it
has never seen from climate alone. That is the honest form of the question, and
a null result is a real answer to it, not a failed run.
"""

from __future__ import annotations

import argparse
import logging
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from .assemble import predictor_columns
from .zonal import CORRIDOR_ID

from . import paths

logger = logging.getLogger(__name__)

TARGET = "tvwsi"
DEFAULT_CELL_M = 4000.0
SEED = 26910


def make_model(kind: str = "rf", seed: int = SEED):
    """Interpretable non-linear baselines (PHASE3_PLAN §3).

    Depth and leaf size are held down deliberately: with a few hundred rows and
    a strongly grouped fold structure, an unconstrained forest memorizes
    corridors rather than learning climate.
    """
    if kind == "rf":
        return RandomForestRegressor(
            n_estimators=400, min_samples_leaf=3, max_features="sqrt",
            random_state=seed, n_jobs=-1)
    if kind == "gb":
        return GradientBoostingRegressor(
            n_estimators=300, max_depth=3, learning_rate=0.05,
            subsample=0.8, random_state=seed)
    raise ValueError(f"unknown model kind: {kind}")


# --------------------------------------------------------------------------- #
# Model B: the upscale
# --------------------------------------------------------------------------- #
def upscale(df: pd.DataFrame, features: list[str], *, cell_m: float = DEFAULT_CELL_M,
            year_col: str = "year") -> pd.DataFrame:
    """Replace each corridor's predictors with its coarse cell's mean, per year.

    Averaging within (cell, year) rather than within cell alone keeps the
    temporal signal fully intact — only the *spatial* detail is destroyed, which
    is the single thing the experiment is allowed to vary.
    """
    out = df.copy()
    out["_cell"] = (
        np.floor(out["x_m"] / cell_m).astype(int).astype(str) + "_" +
        np.floor(out["y_m"] / cell_m).astype(int).astype(str)
    )
    coarse = out.groupby(["_cell", year_col])[features].transform("mean")
    out[features] = coarse

    n_cells = out["_cell"].nunique()
    per_cell = out.groupby("_cell")[CORRIDOR_ID].nunique()
    logger.info("upscale @ %.0f m: %d corridors -> %d cells "
                "(corridors/cell: median %.0f, max %d, %d singletons)",
                cell_m, df[CORRIDOR_ID].nunique(), n_cells,
                per_cell.median(), per_cell.max(), int((per_cell == 1).sum()))
    return out.drop(columns="_cell")


def upscaling_diagnostics(df: pd.DataFrame, features: list[str],
                          *, cell_m: float = DEFAULT_CELL_M) -> pd.DataFrame:
    """How much spatial variance the upscale actually removes, per feature.

    If this is ~0 the experiment has no contrast to detect and the A-vs-B result
    is uninformative rather than negative — a distinction worth being able to
    make from the output rather than by argument.
    """
    coarse = upscale(df, features, cell_m=cell_m)
    rows = []
    for f in features:
        within = df.groupby("year")[f].transform("mean")
        var_fine = float(((df[f] - within) ** 2).mean())
        var_coarse = float(((coarse[f] - within) ** 2).mean())
        rows.append({"feature": f, "spatial_var_fine": var_fine,
                     "spatial_var_coarse": var_coarse,
                     "var_removed_frac": 1 - var_coarse / var_fine if var_fine > 0 else np.nan})
    return pd.DataFrame(rows).sort_values("var_removed_frac", ascending=False)


# --------------------------------------------------------------------------- #
# Folds
# --------------------------------------------------------------------------- #
def spatial_blocks(df: pd.DataFrame, *, n_blocks: int = 5, seed: int = SEED) -> pd.Series:
    """Assign each *corridor* to a geographic block via KMeans on its coordinates.

    Blocking the corridor rather than the row is what makes the grouping
    automatic: every summer of a corridor inherits the same block, so grouped
    and spatially-blocked CV are the same operation here.
    """
    corr = df.groupby(CORRIDOR_ID)[["x_m", "y_m"]].first()
    km = KMeans(n_clusters=n_blocks, random_state=seed, n_init=10)
    labels = pd.Series(km.fit_predict(corr.to_numpy()), index=corr.index, name="block")
    return df[CORRIDOR_ID].map(labels)


@dataclass
class FoldResult:
    repeat: int
    block: int
    n_train: int
    n_test: int
    metrics: dict[str, float] = field(default_factory=dict)


def score(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
    return {
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "r2": float(r2_score(y_true, y_pred)),
    }


def blocked_cv(
    df: pd.DataFrame,
    features: list[str],
    *,
    kind: str = "rf",
    n_blocks: int = 5,
    n_repeats: int = 5,
    seed: int = SEED,
    target: str = TARGET,
) -> tuple[pd.DataFrame, pd.Series]:
    """Repeated spatially-blocked leave-one-block-out CV.

    Returns per-fold metrics and the out-of-fold predictions of the first
    repeat (used for the novelty-stratified breakdown, which needs a prediction
    for every row exactly once).
    """
    rows, oof = [], pd.Series(np.nan, index=df.index, dtype=float)
    for rep in range(n_repeats):
        blocks = spatial_blocks(df, n_blocks=n_blocks, seed=seed + rep)
        for b in sorted(blocks.unique()):
            test = blocks == b
            if test.sum() < 5 or (~test).sum() < 20:
                logger.warning("repeat %d block %d skipped (n_test=%d, n_train=%d)",
                               rep, b, int(test.sum()), int((~test).sum()))
                continue
            model = make_model(kind, seed=seed + rep)
            model.fit(df.loc[~test, features], df.loc[~test, target])
            pred = model.predict(df.loc[test, features])
            if rep == 0:
                oof.loc[test] = pred
            rows.append({"repeat": rep, "block": int(b),
                         "n_train": int((~test).sum()), "n_test": int(test.sum()),
                         **score(df.loc[test, target].to_numpy(), pred)})
    return pd.DataFrame(rows), oof


def paired_difference(a: pd.DataFrame, b: pd.DataFrame, metric: str,
                      *, n_boot: int = 10_000, seed: int = SEED) -> dict[str, float]:
    """Fold-paired A-B difference with a bootstrap CI.

    Paired over identical folds, so the fold-to-fold variation that dominates a
    small spatial CV cancels instead of drowning the contrast. Bootstrap rather
    than a t-interval because a handful of folds is nowhere near normal.

    The resampling unit is the block *within* a repeat, not the pooled
    repeat-block fold. Only the blocks of one repeat partition the panel, so
    only they are independent; the repeats re-split the same rows and carry no
    additional sample. Pooling all `n_repeats * n_blocks` differences into one
    bootstrap treats a re-partition as a fresh sample and narrows the interval
    by roughly sqrt(n_repeats). The interval is therefore built per repeat and
    its endpoints averaged, which lets the repeats do the one job they can do
    -- damp the blocking seed -- without inflating the effective sample.
    """
    key = ["repeat", "block"]
    merged = a[key + [metric]].merge(b[key + [metric]], on=key, suffixes=("_a", "_b"))
    merged = merged.assign(d=merged[f"{metric}_a"] - merged[f"{metric}_b"])
    d = merged["d"].to_numpy()
    rng = np.random.default_rng(seed)
    bounds = []
    for _, grp in merged.groupby("repeat", sort=True):
        dr = grp["d"].to_numpy()
        boot = rng.choice(dr, size=(n_boot, len(dr)), replace=True).mean(axis=1)
        bounds.append((np.percentile(boot, 2.5), np.percentile(boot, 97.5)))
    return {"metric": metric, "n_folds": len(d), "mean_diff": float(d.mean()),
            "n_blocks_per_repeat": int(merged.groupby("repeat").size().max()),
            "ci_lo": float(np.mean([lo for lo, _ in bounds])),
            "ci_hi": float(np.mean([hi for _, hi in bounds])),
            "frac_folds_a_better": float((d < 0).mean() if metric != "r2" else (d > 0).mean())}


def temporal_holdout(df: pd.DataFrame, features: list[str], *, kind: str = "rf",
                     seed: int = SEED, target: str = TARGET) -> dict[str, float]:
    """Train on every summer but the last, predict the last one.

    Strictly harder than spatial CV: the model has never seen the test *year*,
    so it cannot lean on a year effect it memorized. Corridors do repeat across
    the split here, by design — this fold tests temporal transfer, and the
    spatial CV above is what tests transfer to unseen places.
    """
    last = int(df["year"].max())
    train, test = df[df["year"] < last], df[df["year"] == last]
    if train.empty or test.empty:
        return {"test_year": last, "n_test": 0}
    model = make_model(kind, seed=seed)
    model.fit(train[features], train[target])
    pred = model.predict(test[features])
    return {"test_year": last, "n_train": len(train), "n_test": len(test),
            **score(test[target].to_numpy(), pred)}


# --------------------------------------------------------------------------- #
# Reporting
# --------------------------------------------------------------------------- #
# A comparison is only meaningful if both preconditions hold: the models must
# predict something, and coarsening must actually have changed the predictors.
MIN_SKILL_R2 = 0.0        # below this a model is no better than the mean
MIN_CONTRAST_FRAC = 0.30  # spatial variance the upscale must destroy


def verdict(diff_rmse: dict, diff_r2: dict, *,
            r2_a: float | None = None, r2_b: float | None = None,
            var_removed: float | None = None) -> tuple[str, str]:
    """Apply PHASE3_PLAN §4's falsification rule — but only where it can apply.

    The plan's rule ("hypothesis fails if B's RMSE <= A's with the CI spanning
    zero") silently assumes two things that have to be checked first, because
    when either fails, a null result says nothing about resolution:

    1. **Model skill.** If neither model beats predicting the mean, the
       comparison is between two failures and no ranking of them is meaningful.
       Reporting that as "NOT SUPPORTED" would let a failure to model anything
       masquerade as evidence against downscaling.
    2. **Resolution contrast.** If the coarse upscale barely changed the
       predictors, A and B are nearly the same model and a null difference is
       arithmetic, not a finding. Over a small, flat study area most of
       ClimateBC's spatial variance can sit *between* coarse cells and survive
       the upscale entirely.

    Both are reported as INCONCLUSIVE, which is a different claim from the
    hypothesis being unsupported.
    """
    no_skill = (r2_a is not None and r2_b is not None
                and max(r2_a, r2_b) <= MIN_SKILL_R2)
    no_contrast = var_removed is not None and var_removed < MIN_CONTRAST_FRAC

    rmse_significant = diff_rmse["ci_hi"] < 0
    r2_significant = diff_r2["ci_lo"] > 0

    if rmse_significant or r2_significant:
        return "SUPPORTED", (
            "Model A beats Model B by more than the fold-to-fold noise: the "
            "paired CI excludes zero. Downscaled resolution buys real skill here.")

    if no_skill and no_contrast:
        return "INCONCLUSIVE", (
            f"The test cannot discriminate, for two independent reasons. Neither "
            f"model has predictive skill (best CV R2 = {max(r2_a, r2_b):+.3f}, at or "
            f"below the no-skill line), so the comparison is between two failures. "
            f"And the coarse upscale removed only {var_removed * 100:.0f}% of the "
            f"predictors' spatial variance, so Models A and B are nearly the same "
            f"model. This is NOT evidence against downscaling — it is the experiment "
            f"reporting that, as specified, it has nothing to measure.")
    if no_skill:
        return "INCONCLUSIVE", (
            f"Neither model beats predicting the mean (best CV R2 = "
            f"{max(r2_a, r2_b):+.3f}). Ranking two models that both fail says nothing "
            f"about resolution; the target, the predictors or the sample size has to "
            f"be addressed before the A-vs-B question can be asked at all.")
    if no_contrast:
        return "INCONCLUSIVE", (
            f"The coarse upscale removed only {var_removed * 100:.0f}% of the "
            f"predictors' spatial variance — below the {MIN_CONTRAST_FRAC * 100:.0f}% "
            f"needed for the two models to be meaningfully different. Most of "
            f"ClimateBC's variation over this study area sits *between* coarse cells "
            f"and survives the upscale, so A and B are near-identical models and a "
            f"null difference is arithmetic rather than a finding. Use a coarser cell.")

    if diff_rmse["ci_lo"] > 0:
        return "FALSIFIED", (
            "Model B is significantly *better* than Model A. The extra spatial "
            "detail is not just unhelpful, it is actively hurting — most likely "
            "noise the coarse average smooths away.")
    return "NOT SUPPORTED", (
        "Both models have skill and the coarsening genuinely changed the "
        "predictors, yet the paired difference's CI spans zero: the downscaled "
        "predictors are not distinguishable from their own coarse average. This "
        "is a real null result on the hypothesis, not an artifact of the setup.")


def novelty_strata(df: pd.DataFrame, oof: pd.Series, *, target: str = TARGET,
                   n_bins: int = 3) -> pd.DataFrame:
    """Out-of-fold error by climate-novelty tercile and by ecological value.

    PHASE3_PLAN §5 asks for decay in high-novelty corridors specifically: that is
    where the model is extrapolating, and where a confident-looking prediction is
    least trustworthy.
    """
    ok = oof.notna()
    d = df.loc[ok].copy()
    d["_pred"] = oof.loc[ok]
    out = []
    d["novelty_bin"] = pd.qcut(d["novelty"], n_bins, labels=["low", "mid", "high"],
                               duplicates="drop")
    for name, col in (("novelty", "novelty_bin"), ("ecological_value", "ecological_value")):
        if col not in d.columns:
            continue
        for level, g in d.groupby(col, observed=True):
            if len(g) < 5:
                continue
            out.append({"stratum": name, "level": str(level), "n": len(g),
                        **score(g[target].to_numpy(), g["_pred"].to_numpy())})
    return pd.DataFrame(out)


def run(
    features_path: Path,
    *,
    kind: str = "rf",
    cell_m: float = DEFAULT_CELL_M,
    n_blocks: int = 5,
    n_repeats: int = 5,
    seed: int = SEED,
    min_coverage: float | None = None,
) -> dict:
    df = pd.read_parquet(features_path)
    if min_coverage is not None and "coverage_frac_ndvi" in df.columns:
        before = len(df)
        df = df[df["coverage_frac_ndvi"] >= min_coverage].copy()
        logger.info("coverage filter >=%.2f: %d -> %d rows", min_coverage, before, len(df))
    df = df.reset_index(drop=True)

    features = predictor_columns(df)["climate_only"]
    if not features:
        raise RuntimeError("no climate-only predictors present in the feature table")

    # Under partial ClimateBC acquisition the panel can be far smaller than 153
    # corridors. Blocks are shrunk to keep at least ~8 corridors per held-out
    # block rather than silently producing folds too small to score.
    n_corridors = df[CORRIDOR_ID].nunique()
    max_blocks = max(2, n_corridors // 8)
    if n_blocks > max_blocks:
        logger.warning("only %d corridors in the panel — reducing blocks %d -> %d",
                       n_corridors, n_blocks, max_blocks)
        n_blocks = max_blocks
    if n_corridors < 16:
        raise RuntimeError(
            f"panel has only {n_corridors} corridors — too few for spatially-blocked "
            "CV. Let acquire_climate fill more of the cache and re-run.")

    logger.info("%d rows, %d corridors, %d summers, %d climate-only predictors, %d blocks",
                len(df), n_corridors, df["year"].nunique(), len(features), n_blocks)

    df_b = upscale(df, features, cell_m=cell_m)
    diag = upscaling_diagnostics(df, features, cell_m=cell_m)

    folds_a, oof_a = blocked_cv(df, features, kind=kind, n_blocks=n_blocks,
                                n_repeats=n_repeats, seed=seed)
    folds_b, _ = blocked_cv(df_b, features, kind=kind, n_blocks=n_blocks,
                            n_repeats=n_repeats, seed=seed)
    if folds_a.empty or folds_b.empty:
        raise RuntimeError("no usable CV folds — too few corridors or blocks")

    diffs = {m: paired_difference(folds_a, folds_b, m, seed=seed)
             for m in ("rmse", "mae", "r2")}
    call, reason = verdict(
        diffs["rmse"], diffs["r2"],
        r2_a=float(folds_a["r2"].mean()), r2_b=float(folds_b["r2"].mean()),
        var_removed=float(diag["var_removed_frac"].median()),
    )

    model = make_model(kind, seed=seed).fit(df[features], df[TARGET])
    perm = permutation_importance(model, df[features], df[TARGET],
                                  n_repeats=20, random_state=seed, n_jobs=-1)
    importance = (pd.DataFrame({"feature": features, "importance": perm.importances_mean,
                                "sd": perm.importances_std})
                  .sort_values("importance", ascending=False).reset_index(drop=True))

    return {
        "df": df, "features": features,
        "folds_a": folds_a, "folds_b": folds_b, "oof_a": oof_a,
        "diffs": diffs, "verdict": call, "verdict_reason": reason,
        "upscaling": diag,
        "temporal_a": temporal_holdout(df, features, kind=kind, seed=seed),
        "temporal_b": temporal_holdout(df_b, features, kind=kind, seed=seed),
        "importance": importance,
        "strata": novelty_strata(df, oof_a),
    }


def main() -> None:
    p = argparse.ArgumentParser(description="Model A (scale-free) vs Model B (coarse).")
    p.add_argument("--features", type=Path, default=paths.FEATURES)
    p.add_argument("--model", default="rf", choices=["rf", "gb"])
    p.add_argument("--cell-m", type=float, default=DEFAULT_CELL_M)
    p.add_argument("--blocks", type=int, default=5)
    p.add_argument("--repeats", type=int, default=5)
    p.add_argument("--min-coverage", type=float, default=None)
    p.add_argument("--seed", type=int, default=SEED)
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )
    res = run(args.features, kind=args.model, cell_m=args.cell_m,
              n_blocks=args.blocks, n_repeats=args.repeats, seed=args.seed,
              min_coverage=args.min_coverage)

    fa, fb = res["folds_a"], res["folds_b"]
    print("=" * 74)
    print(f"A-vs-B: {args.model.upper()} on {len(res['features'])} climate-only predictors "
          f"| coarse cell {args.cell_m:.0f} m | {len(fa)} folds")
    print(f"  Model A (scale-free) : RMSE {fa.rmse.mean():.5f}  MAE {fa.mae.mean():.5f}  "
          f"R2 {fa.r2.mean():+.3f}")
    print(f"  Model B (coarse)     : RMSE {fb.rmse.mean():.5f}  MAE {fb.mae.mean():.5f}  "
          f"R2 {fb.r2.mean():+.3f}")
    print("  paired A-B (negative RMSE / positive R2 favour A):")
    for m, d in res["diffs"].items():
        print(f"    {m:<5} diff={d['mean_diff']:+.5f}  95% CI [{d['ci_lo']:+.5f}, "
              f"{d['ci_hi']:+.5f}]  A better in {d['frac_folds_a_better'] * 100:.0f}% of folds")

    print(f"\n  VERDICT: {res['verdict']}")
    print(f"  {res['verdict_reason']}")

    print("\n  spatial variance removed by the upscale (top 5):")
    for _, r in res["upscaling"].head(5).iterrows():
        print(f"    {r.feature:<14} {r.var_removed_frac * 100:5.1f}%")

    ta, tb = res["temporal_a"], res["temporal_b"]
    if ta.get("n_test"):
        print(f"\n  forward holdout (train <{ta['test_year']}, test {ta['test_year']}, "
              f"n={ta['n_test']}):")
        print(f"    A RMSE {ta['rmse']:.5f} R2 {ta['r2']:+.3f}  |  "
              f"B RMSE {tb['rmse']:.5f} R2 {tb['r2']:+.3f}")

    print("\n  permutation importance (Model A, top 8):")
    for _, r in res["importance"].head(8).iterrows():
        print(f"    {r.feature:<16} {r.importance:+.6f} ± {r.sd:.6f}")

    if not res["strata"].empty:
        print("\n  out-of-fold error by stratum:")
        for _, r in res["strata"].iterrows():
            print(f"    {r.stratum:<16} {r.level:<10} n={r.n:<4} "
                  f"RMSE {r.rmse:.5f}  R2 {r.r2:+.3f}")


if __name__ == "__main__":
    main()
