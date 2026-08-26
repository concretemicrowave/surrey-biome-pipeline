"""Regenerate the cell-size and hyperparameter sensitivity tables (SI).

Both tables were previously produced ad hoc and had no script in the repo, so
the V6 interval fix could not be propagated into them and a reader could not
reproduce them at all. Referee Major Issue 4 made the same complaint about
other steps. This script is the missing generator: it reproduces the row sets
exactly as the SI tables list them, through the same `experiment` functions the
main result uses, so the corrected `paired_difference` applies automatically.

    .venv/bin/python scripts/cell_hp_sensitivity.py

Writes data/processed/sens_cell.csv and data/processed/sens_hp.csv.
"""
from __future__ import annotations

import logging

import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from src.pipeline import experiment as ex
from src.pipeline import paths

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

PANEL = paths.PROCESSED / "features_phase3b.parquet"
CELLS_M = [4_000.0, 8_000.0, 12_000.0, 25_000.0]
# (n_estimators, min_samples_leaf, max_features) as tabulated in the SI
HP_GRID = [
    (400, 1, "sqrt"),
    (400, 3, "sqrt"),   # the published configuration
    (400, 5, "sqrt"),
    (400, 10, "sqrt"),
    (200, 3, "sqrt"),
    (800, 3, "sqrt"),
    (400, 3, 0.5),
    (400, 3, 1.0),
]


def _excl0(d: dict) -> bool:
    return not (d["ci_lo"] < 0 < d["ci_hi"])


def _default_rf(seed: int):
    """The published configuration, spelled out so the cell sweep does not call
    the patched `ex.make_model` and recurse into itself."""
    return RandomForestRegressor(n_estimators=400, min_samples_leaf=3,
                                 max_features="sqrt", random_state=seed, n_jobs=-1)


def _compare(df, df_b, features, model_factory):
    """Paired A-vs-B under identical folds, with a caller-supplied learner."""
    orig = ex.make_model
    ex.make_model = lambda kind="rf", seed=ex.SEED: model_factory(seed)
    try:
        folds_a, _ = ex.blocked_cv(df, features, seed=ex.SEED)
        folds_b, _ = ex.blocked_cv(df_b, features, seed=ex.SEED)
    finally:
        ex.make_model = orig
    return (ex.paired_difference(folds_a, folds_b, "rmse"),
            ex.paired_difference(folds_a, folds_b, "r2"),
            folds_a["r2"].mean(), folds_b["r2"].mean())


def main() -> None:
    df = pd.read_parquet(PANEL).reset_index(drop=True)
    features = ex.predictor_columns(df)["climate_only"]

    rows = []
    for cell_m in CELLS_M:
        df_b = ex.upscale(df, features, cell_m=cell_m)
        diag = ex.upscaling_diagnostics(df, features, cell_m=cell_m)
        var_removed = float(diag["var_removed_frac"].median())
        d_rmse, d_r2, r2_a, r2_b = _compare(df, df_b, features, _default_rf)
        rows.append({"cell_km": cell_m / 1000, "n_cells": df_b[ex.CORRIDOR_ID].nunique(),
                     "var_removed": var_removed, "r2_a": r2_a, "r2_b": r2_b,
                     "d_rmse": d_rmse["mean_diff"], "rmse_lo": d_rmse["ci_lo"],
                     "rmse_hi": d_rmse["ci_hi"], "rmse_excl0": _excl0(d_rmse),
                     "d_r2": d_r2["mean_diff"], "r2_lo": d_r2["ci_lo"],
                     "r2_hi": d_r2["ci_hi"], "r2_excl0": _excl0(d_r2)})
        logger.info("cell %5.0f m  var_removed=%.3f  dRMSE=%+.5f [%+.5f, %+.5f]  excl0=%s",
                    cell_m, var_removed, d_rmse["mean_diff"], d_rmse["ci_lo"],
                    d_rmse["ci_hi"], _excl0(d_rmse))
    pd.DataFrame(rows).to_csv(paths.PROCESSED / "sens_cell.csv", index=False)

    df_b25 = ex.upscale(df, features, cell_m=25_000.0)
    rows = []
    for n_est, leaf, maxf in HP_GRID:
        factory = lambda s, n=n_est, l=leaf, m=maxf: RandomForestRegressor(
            n_estimators=n, min_samples_leaf=l, max_features=m,
            random_state=s, n_jobs=-1)
        d_rmse, _, r2_a, r2_b = _compare(df, df_b25, features, factory)
        rows.append({"trees": n_est, "leaf": leaf, "max_features": maxf,
                     "r2_a": r2_a, "r2_b": r2_b, "d_rmse": d_rmse["mean_diff"],
                     "lo": d_rmse["ci_lo"], "hi": d_rmse["ci_hi"],
                     "excl0": _excl0(d_rmse)})
        logger.info("trees=%3d leaf=%2d maxf=%-4s  dRMSE=%+.5f [%+.5f, %+.5f]  excl0=%s",
                    n_est, leaf, str(maxf), d_rmse["mean_diff"], d_rmse["ci_lo"],
                    d_rmse["ci_hi"], _excl0(d_rmse))
    pd.DataFrame(rows).to_csv(paths.PROCESSED / "sens_hp.csv", index=False)
    logger.info("-> %s, %s", paths.PROCESSED / "sens_cell.csv", paths.PROCESSED / "sens_hp.csv")


if __name__ == "__main__":
    main()
