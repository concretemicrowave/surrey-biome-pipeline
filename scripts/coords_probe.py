"""Do random folds reward spatial POSITION rather than climate?

Model C uses only the projected coordinates. It contains zero climate
information. If C scores under random grouped folds and collapses under
spatial blocks, then random folds are scoring spatial identity, and any
predictor that retains fine spatial structure inherits that advantage.
"""
import numpy as np, pandas as pd
from src.pipeline import experiment as E
from src.pipeline.zonal import CORRIDOR_ID
_km = E.spatial_blocks

def random_blocks(df, *, n_blocks=5, seed=E.SEED):
    ids = df[CORRIDOR_ID].drop_duplicates().to_numpy()
    rng = np.random.default_rng(seed); lab = np.arange(len(ids)) % n_blocks
    rng.shuffle(lab)
    return df[CORRIDOR_ID].map(pd.Series(lab, index=ids))

for label, path, cell in [("Transect","data/processed/features_phase3b.parquet",25000.0),
                          ("Surrey","data/processed/features.parquet",4000.0)]:
    df = pd.read_parquet(path).reset_index(drop=True)
    clim = E.predictor_columns(df)["climate_only"]
    dfb  = E.upscale(df, clim, cell_m=cell)
    print("="*74); print(f"{label}  (n={len(df)} rows, {df[CORRIDOR_ID].nunique()} units)")
    for mode, fn in (("spatial blocks", _km), ("random folds", random_blocks)):
        E.spatial_blocks = fn
        fa,_ = E.blocked_cv(df,  clim, kind="rf", n_blocks=5, n_repeats=5, seed=E.SEED)
        fb,_ = E.blocked_cv(dfb, clim, kind="rf", n_blocks=5, n_repeats=5, seed=E.SEED)
        fc,_ = E.blocked_cv(df, ["x_m","y_m"], kind="rf", n_blocks=5, n_repeats=5, seed=E.SEED)
        print(f"  {mode:<15} A(fine climate) R2 {fa.r2.mean():+.3f} | "
              f"B(coarse) R2 {fb.r2.mean():+.3f} | C(COORDS ONLY) R2 {fc.r2.mean():+.3f}")
    E.spatial_blocks = _km
