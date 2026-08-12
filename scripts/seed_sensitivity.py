"""Seed sensitivity of the transect (Phase 3b) verdict.

The verdict label turns on Model B's R2 clearing MIN_SKILL_R2 = 0.0 by about
three thousandths, which invites the objection that the margin is nothing but
random-seed noise. This re-runs the identical experiment across many seeds --
re-seeding both the k-means spatial blocking and the random forest together --
and reports the distribution of R2_A, R2_B, the paired dRMSE interval and the
verdict label.

Produces the seed-sensitivity table reported in the preprint. Usage:

    python scripts/seed_sensitivity.py [CELL_METRES] [N_SEEDS]
    python scripts/seed_sensitivity.py 25000 20
    python scripts/seed_sensitivity.py 12000 12

Requires data/processed/features_phase3b.parquet, built by
``python -m src.pipeline.assemble``.
"""
import sys
import pandas as pd

from src.pipeline.experiment import (
    blocked_cv, paired_difference, upscale, upscaling_diagnostics,
    predictor_columns, verdict,
)

FEATURES = "data/processed/features_phase3b.parquet"
CELL_M = float(sys.argv[1]) if len(sys.argv) > 1 else 25_000.0
N_SEEDS = int(sys.argv[2]) if len(sys.argv) > 2 else 20

df = pd.read_parquet(FEATURES).reset_index(drop=True)
feats = predictor_columns(df)["climate_only"]
df_b = upscale(df, feats, cell_m=CELL_M)
diag = upscaling_diagnostics(df, feats, cell_m=CELL_M)
var_removed = float(diag["var_removed_frac"].median())

rows = []
for i in range(N_SEEDS):
    seed = 26910 + i * 101
    fa, _ = blocked_cv(df, feats, kind="rf", n_blocks=5, n_repeats=5, seed=seed)
    fb, _ = blocked_cv(df_b, feats, kind="rf", n_blocks=5, n_repeats=5, seed=seed)
    d_rmse = paired_difference(fa, fb, "rmse", seed=seed)
    d_r2 = paired_difference(fa, fb, "r2", seed=seed)
    r2a, r2b = float(fa["r2"].mean()), float(fb["r2"].mean())
    call, _ = verdict(d_rmse, d_r2, r2_a=r2a, r2_b=r2b, var_removed=var_removed)
    rows.append({
        "seed": seed, "r2_a": r2a, "r2_b": r2b,
        "d_rmse": d_rmse["mean_diff"], "ci_lo": d_rmse["ci_lo"], "ci_hi": d_rmse["ci_hi"],
        "b_clears_skill_gate": r2b > 0.0,
        "ci_excludes_zero": d_rmse["ci_lo"] > 0,
        "verdict": call,
    })
    print(f"seed {seed}: R2_A {r2a:+.4f}  R2_B {r2b:+.4f}  "
          f"dRMSE {d_rmse['mean_diff']:+.5f} [{d_rmse['ci_lo']:+.5f}, {d_rmse['ci_hi']:+.5f}]  {call}",
          flush=True)

out = pd.DataFrame(rows)
print("\n" + "=" * 78)
print(f"CELL = {CELL_M/1000:.0f} km   var_removed = {var_removed:.1%}   n_seeds = {N_SEEDS}")
print(out[["r2_a", "r2_b", "d_rmse"]].describe().loc[["mean", "std", "min", "max"]].round(5))
print(f"\nR2_B > 0 in {out.b_clears_skill_gate.sum()}/{len(out)} seeds")
print(f"paired CI excludes 0 in {out.ci_excludes_zero.sum()}/{len(out)} seeds")
print("\nverdict counts:")
print(out.verdict.value_counts().to_string())
out.to_csv(f"data/processed/seed_sensitivity_{int(CELL_M/1000)}km.csv", index=False)
print(f"\n-> data/processed/seed_sensitivity_{int(CELL_M/1000)}km.csv")
