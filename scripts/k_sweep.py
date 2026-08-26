"""Is F3's failure a property of f, or of k = 5 blocks?

Three blind referees independently observed that every interval in the paper is
a percentile bootstrap over the 5 blocks of one repeat, and that the
pre-registered F3 criterion (detection >= 0.80) was never evaluated at any other
block count -- the site-count sweep raised n from 300 to 2,400 while holding
k = 5, so the number of resampling units never moved.

This sweeps k at the two highest-f levels, where the paper's own sweep comes
closest to F3 and still fails. Everything else is the simulation's own
machinery, called unmodified.
"""
import argparse, logging, sys
import numpy as np, pandas as pd
sys.path.insert(0, "scripts")
import precondition_simulation as S
from src.pipeline import experiment as ex

log = logging.getLogger("k_sweep")

def one_run(seed: int, range_m: float, n_blocks: int, n_repeats: int = 5):
    rng = np.random.default_rng(seed)
    df = S.make_panel(rng, range_m, S.N_SITES)
    diag = ex.upscaling_diagnostics(df, S.FEATURES, cell_m=S.CELL_M)
    f = float(diag["var_removed_frac"].mean())
    a, _ = ex.blocked_cv(df, S.FEATURES, n_blocks=n_blocks, n_repeats=n_repeats,
                         seed=ex.SEED + seed, target=S.TARGET)
    b, _ = ex.blocked_cv(ex.upscale(df, S.FEATURES, cell_m=S.CELL_M), S.FEATURES,
                         n_blocks=n_blocks, n_repeats=n_repeats,
                         seed=ex.SEED + seed, target=S.TARGET)
    d = ex.paired_difference(a, b, "rmse", seed=ex.SEED + seed)
    return {"seed": seed, "range_m": range_m, "n_blocks": n_blocks,
            "var_removed_frac": f, "d_rmse": d["mean_diff"],
            "ci_lo": d["ci_lo"], "ci_hi": d["ci_hi"],
            "n_units": d["n_blocks_per_repeat"],
            "detected": bool(d["ci_lo"] < 0 and d["ci_hi"] < 0),
            "r2_a": float(a["r2"].mean()), "r2_b": float(b["r2"].mean())}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--seeds", type=int, default=50)
    p.add_argument("--blocks", type=int, nargs="+", default=[5, 10, 20])
    p.add_argument("--ranges", type=float, nargs="+", default=[3500, 5000])
    p.add_argument("--out", default="data/processed/k_sweep.csv")
    a = p.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    rows = []
    for L in a.ranges:
        for k in a.blocks:
            for s in range(a.seeds):
                rows.append(one_run(s, L, k))
            r = pd.DataFrame(rows)
            m = r[(r.range_m == L) & (r.n_blocks == k)]
            lo, hi = S.wilson(int(m.detected.sum()), len(m))
            log.info("L=%6.0f k=%2d  f=%.3f  detection=%.2f [%.2f,%.2f]  units/repeat=%d",
                     L, k, m.var_removed_frac.mean(), m.detected.mean(), lo, hi,
                     int(m.n_units.iloc[0]))
    df = pd.DataFrame(rows); df.to_csv(a.out, index=False)
    print("\n=== F3 (detection >= 0.80) by block count ===")
    for (L, k), g in df.groupby(["range_m", "n_blocks"]):
        lo, hi = S.wilson(int(g.detected.sum()), len(g))
        print(f"  L={L:6.0f}m f={g.var_removed_frac.mean():.3f}  k={k:2d}  "
              f"detection {g.detected.mean():.2f} [{lo:.2f},{hi:.2f}]  "
              f"{'F3 PASSES' if lo >= 0.80 else ('reaches 0.80' if hi >= 0.80 else 'F3 fails')}")
    print(f"\nwrote {a.out}")

if __name__ == "__main__":
    main()
