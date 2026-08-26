import numpy as np, pandas as pd
from src.pipeline import experiment as E
from src.pipeline.zonal import CORRIDOR_ID
_km = E.spatial_blocks

def random_blocks(df, *, n_blocks=5, seed=E.SEED):
    ids = df[CORRIDOR_ID].drop_duplicates().to_numpy()
    rng = np.random.default_rng(seed)
    lab = np.arange(len(ids)) % n_blocks
    rng.shuffle(lab)
    return df[CORRIDOR_ID].map(pd.Series(lab, index=ids))

SEEDS = [26910, 1, 7, 42, 101, 2024, 555]
for label, path, cell in [("Transect", "data/processed/features_phase3b.parquet", 25000.0),
                          ("Surrey",   "data/processed/features.parquet",          4000.0)]:
    print("="*80); print(label)
    print(f"{'seed':>6} | {'SPATIAL dRMSE':>14} {'A%':>4} | {'RANDOM dRMSE':>13} {'A%':>4} | {'RANDOM dMAE CI':>28}")
    for s in SEEDS:
        out=[]
        for fn in (_km, random_blocks):
            E.spatial_blocks = fn
            r = E.run(path, kind="rf", cell_m=cell, n_blocks=5, n_repeats=5, seed=s)
            out.append((r["diffs"]["rmse"], r["diffs"]["mae"]))
        (sr,_),(rr,rm) = out
        print(f"{s:>6} | {sr['mean_diff']:>+14.5f} {sr['frac_folds_a_better']*100:>3.0f}% | "
              f"{rr['mean_diff']:>+13.5f} {rr['frac_folds_a_better']*100:>3.0f}% | "
              f"[{rm['ci_lo']:+.5f},{rm['ci_hi']:+.5f}]{' EXCL0' if rm['ci_hi']<0 or rm['ci_lo']>0 else ''}")
    E.spatial_blocks = _km
