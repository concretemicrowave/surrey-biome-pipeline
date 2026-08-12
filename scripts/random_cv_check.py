"""Does the A-vs-B verdict depend on SPATIAL blocking, or only on grouping?

Wadoux et al. 2021 and Linnenbrink, Nowosad & Meyer 2026 argue spatial CV is
pessimistic when the prediction domain is the sampled area. This swaps k-means
spatial blocks for RANDOM corridor-grouped folds and changes nothing else:
same k, same repeats, same seeds, same paired repeat-level bootstrap.
Grouping is preserved in both arms, so the only thing under test is spatiality.
"""
import numpy as np, pandas as pd
from src.pipeline import experiment as E
from src.pipeline.zonal import CORRIDOR_ID

_kmeans_blocks = E.spatial_blocks

def random_blocks(df, *, n_blocks=5, seed=E.SEED):
    ids = df[CORRIDOR_ID].drop_duplicates().to_numpy()
    rng = np.random.default_rng(seed)
    lab = np.arange(len(ids)) % n_blocks      # balanced sizes, like k-means roughly is
    rng.shuffle(lab)
    return df[CORRIDOR_ID].map(pd.Series(lab, index=ids))

PANELS = [
    ("Surrey (Extent 1)",  "data/processed/features.parquet",        4000.0),
    ("Transect (Extent 2)","data/processed/features_phase3b.parquet",25000.0),
]

for label, path, cell in PANELS:
    print("=" * 78); print(label, f"| coarse cell {cell:.0f} m")
    for mode, fn in (("spatial k-means blocks", _kmeans_blocks),
                     ("RANDOM grouped folds",   random_blocks)):
        E.spatial_blocks = fn
        r = E.run(path, kind="rf", cell_m=cell, n_blocks=5, n_repeats=5, seed=E.SEED)
        fa, fb = r["folds_a"], r["folds_b"]
        d = r["diffs"]["rmse"]; dm = r["diffs"]["mae"]
        print(f"  {mode:<24} A RMSE {fa.rmse.mean():.5f} R2 {fa.r2.mean():+.3f} | "
              f"B RMSE {fb.rmse.mean():.5f} R2 {fb.r2.mean():+.3f}")
        print(f"  {'':<24} paired dRMSE {d['mean_diff']:+.5f} "
              f"CI [{d['ci_lo']:+.5f}, {d['ci_hi']:+.5f}]  A better {d['frac_folds_a_better']*100:.0f}% folds")
        print(f"  {'':<24} paired dMAE  {dm['mean_diff']:+.5f} "
              f"CI [{dm['ci_lo']:+.5f}, {dm['ci_hi']:+.5f}]   verdict: {r['verdict']}")
    E.spatial_blocks = _kmeans_blocks
