"""Does the A-vs-B result survive de-confounding CDEI for canopy structure?

The referee objection this answers: §3.5 shows CDEI is confounded with canopy
density at *both* extents, the paper concludes the Surrey ranking is exploratory
because of it, and then runs the central hypothesis test on the same index over
the transect. If CDEI is largely a canopy-density proxy, "fine-scale climate
does not predict CDEI" may be a statement about vegetation type rather than
about water stress.

Two things are separable here and the script reports them separately.

1.  **How strong is the confound at Extent 2?** Surrey's figure is
    rho = -0.347 against NDVI (n = 153 polygons). The transect equivalent has
    never been reported.
2.  **Does the paired A-vs-B difference survive removing it?** Both models
    predict the *same* response, so contaminating that response does not by
    itself invalidate the comparison -- but if the difference disappears once
    canopy structure is partialled out, the finding is about canopy and the
    paper has to say so.

Residualisation is a transform of the *response* that uses no climate
information, and it is applied identically to Model A and Model B. It is fitted
globally rather than per training fold; that leaks response structure into the
folds, but it leaks the same structure into both arms, and the reported quantity
is the paired difference between them.

Two strengths, because they bound the question from either side:

*   **structural** -- VRI stand attributes only (crown closure, height, age,
    leading species, land-cover class). These come from the provincial forest
    inventory, not from the satellite imagery CDEI is built from, so this is the
    clean test.
*   **greenness** -- structural plus stand-mean NDVI. NDVI is a constitutive
    input to dry_dist, so this over-corrects by construction and cannot be the
    headline. It is the pessimistic bound: whatever survives here survives
    anything.

Run:  .venv/bin/python scripts/residualized_retest.py
"""

from __future__ import annotations

import logging

import numpy as np
import pandas as pd
from scipy import stats

from src.pipeline import paths
from src.pipeline.experiment import (
    TARGET,
    blocked_cv,
    paired_difference,
    upscale,
    upscaling_diagnostics,
)
from src.pipeline.explain import load_context
from src.pipeline.assemble import predictor_columns
from src.pipeline.zonal import CORRIDOR_ID

logging.basicConfig(level=logging.WARNING, format="%(message)s")

FEATURES = paths.PROCESSED / "features_phase3b.parquet"
TERRAIN = paths.INTERIM / "phase3b" / "terrain_stands.parquet"
STANDS = paths.INTERIM / "phase3b" / "transect_stands.gpkg"
LAYER = "stands_analysis"

CELLS_M = (25_000.0, 12_000.0)
N_BLOCKS, N_REPEATS = 5, 5


def banner(text: str) -> None:
    print(f"\n{'=' * 78}\n{text}\n{'=' * 78}")


# --------------------------------------------------------------------------- #
# 1. How strong is the canopy confound at Extent 2?
# --------------------------------------------------------------------------- #
def confound_report(df: pd.DataFrame) -> pd.DataFrame:
    """Stand-mean CDEI against canopy-density proxies, mirroring Surrey's -0.347."""
    sm = df.groupby(CORRIDOR_ID).agg(
        cdei=(TARGET, "mean"),
        ndvi=("ndvi_mean", "mean"),
        crown=("CROWN_CLOSURE", "mean"),
        height=("PROJ_HEIGHT_1", "mean"),
        age=("PROJ_AGE_1", "mean"),
        area=("area_ha", "mean"),
    ).dropna()

    rows = []
    for col in ("ndvi", "crown", "height", "age", "area"):
        rho, p = stats.spearmanr(sm["cdei"], sm[col])
        rows.append({"predictor": col, "n": len(sm), "spearman_rho": rho, "p": p})
    return pd.DataFrame(rows)


def broadleaf_split(df: pd.DataFrame) -> pd.DataFrame:
    """Does CDEI separate broadleaf from conifer stands? (the species artifact)"""
    sm = df.groupby(CORRIDOR_ID).agg(
        cdei=(TARGET, "mean"), lc=("BCLCS_LEVEL_4", "first")).dropna()
    groups = [g["cdei"].to_numpy() for _, g in sm.groupby("lc") if len(g) >= 5]
    labels = [k for k, g in sm.groupby("lc") if len(g) >= 5]
    out = pd.DataFrame({
        "class": labels,
        "n": [len(g) for g in groups],
        "mean_cdei": [float(g.mean()) for g in groups],
    })
    if len(groups) >= 2:
        f, p = stats.f_oneway(*groups)
        print(f"  one-way ANOVA across {len(groups)} land-cover classes: "
              f"F = {f:.2f}, p = {p:.2e}")
        # variance of CDEI explained by land-cover class alone
        grand = np.concatenate(groups).mean()
        ss_between = sum(len(g) * (g.mean() - grand) ** 2 for g in groups)
        ss_total = sum(((np.concatenate(groups) - grand) ** 2))
        print(f"  land-cover class alone explains {ss_between / ss_total:.1%} "
              f"of between-stand CDEI variance")
    return out


# --------------------------------------------------------------------------- #
# 2. Residualise the response
# --------------------------------------------------------------------------- #
def residualise(df: pd.DataFrame, cols: list[str], *, out_col: str) -> float:
    """OLS-residualise TARGET on `cols`; write residuals to `out_col`, return R^2."""
    X = df[cols].astype(float).to_numpy()
    X = np.column_stack([np.ones(len(X)), X])
    y = df[TARGET].astype(float).to_numpy()
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    fitted = X @ beta
    resid = y - fitted
    df[out_col] = resid
    ss_res = float((resid ** 2).sum())
    ss_tot = float(((y - y.mean()) ** 2).sum())
    return 1 - ss_res / ss_tot


def ab_test(df: pd.DataFrame, features: list[str], *, target: str,
            cell_m: float) -> dict:
    """The published A-vs-B comparison, against an arbitrary response column."""
    df_b = upscale(df, features, cell_m=cell_m)
    folds_a, _ = blocked_cv(df, features, n_blocks=N_BLOCKS, n_repeats=N_REPEATS,
                            target=target)
    folds_b, _ = blocked_cv(df_b, features, n_blocks=N_BLOCKS, n_repeats=N_REPEATS,
                            target=target)
    return {
        "r2_a": float(folds_a["r2"].mean()),
        "r2_b": float(folds_b["r2"].mean()),
        "rmse_a": float(folds_a["rmse"].mean()),
        "rmse_b": float(folds_b["rmse"].mean()),
        "d_rmse": paired_difference(folds_a, folds_b, "rmse"),
        "d_r2": paired_difference(folds_a, folds_b, "r2"),
    }


def show(label: str, res: dict) -> dict:
    dr, d2 = res["d_rmse"], res["d_r2"]
    excl = "EXCLUDES 0" if (dr["ci_lo"] > 0 or dr["ci_hi"] < 0) else "includes 0"
    print(f"\n  {label}")
    print(f"    R^2_A = {res['r2_a']:+.4f}   R^2_B = {res['r2_b']:+.4f}")
    print(f"    dRMSE = {dr['mean_diff']:+.5f}  CI [{dr['ci_lo']:+.5f}, "
          f"{dr['ci_hi']:+.5f}]  -> {excl}  ({dr['n_folds']} folds)")
    print(f"    dR^2  = {d2['mean_diff']:+.4f}   CI [{d2['ci_lo']:+.4f}, "
          f"{d2['ci_hi']:+.4f}]")
    return {"label": label, "r2_a": res["r2_a"], "r2_b": res["r2_b"],
            "d_rmse": dr["mean_diff"], "rmse_lo": dr["ci_lo"], "rmse_hi": dr["ci_hi"],
            "d_r2": d2["mean_diff"], "r2_lo": d2["ci_lo"], "r2_hi": d2["ci_hi"],
            "rmse_excludes_zero": dr["ci_lo"] > 0 or dr["ci_hi"] < 0}


def main() -> None:
    df, structure_cols = load_context(FEATURES, TERRAIN, STANDS, LAYER)
    df = df.reset_index(drop=True)
    features = predictor_columns(df)["climate_only"]
    print(f"panel: {len(df)} rows, {df[CORRIDOR_ID].nunique()} stands, "
          f"{df['year'].nunique()} summers, {len(features)} climate predictors")

    banner("1. THE CANOPY CONFOUND AT EXTENT 2 (never previously reported)")
    print("Surrey's published figure: rho = -0.347 vs NDVI (n = 153 polygons).\n")
    print(confound_report(df).to_string(index=False,
          float_format=lambda v: f"{v:+.4f}" if abs(v) < 10 else f"{v:.2e}"))
    print()
    print(broadleaf_split(df).to_string(index=False))

    # --- the two residualisation strengths ---------------------------------- #
    struct_only = [c for c in structure_cols if c in df.columns
                   and df[c].notna().all() and df[c].std() > 0]
    r2_struct = residualise(df, struct_only, out_col="cdei_resid_struct")
    green = struct_only + ["ndvi_mean"]
    r2_green = residualise(df, green, out_col="cdei_resid_green")

    banner("2. RESIDUALISATION")
    print(f"  structural ({len(struct_only)} VRI predictors) removes "
          f"{r2_struct:.1%} of CDEI variance")
    print(f"  greenness  ({len(green)} predictors, adds stand NDVI) removes "
          f"{r2_green:.1%} of CDEI variance")

    banner("3. A-vs-B, ORIGINAL vs RESIDUALISED RESPONSE")
    summary = []
    for cell_m in CELLS_M:
        removed = float(upscaling_diagnostics(df, features,
                                              cell_m=cell_m)["var_removed_frac"].median())
        print(f"\n--- {cell_m / 1000:.0f} km cell "
              f"(contrast gate: {removed:.1%} of spatial variance removed) ---")
        for target, label in (
            (TARGET, "original CDEI (published)"),
            ("cdei_resid_struct", "residualised: VRI structure"),
            ("cdei_resid_green", "residualised: structure + NDVI (over-corrects)"),
        ):
            row = show(label, ab_test(df, features, target=target, cell_m=cell_m))
            row["cell_km"] = cell_m / 1000
            summary.append(row)

    out = paths.PROCESSED / "residualized_retest.csv"
    pd.DataFrame(summary).to_csv(out, index=False)
    print(f"\nwrote {out}")


if __name__ == "__main__":
    main()
