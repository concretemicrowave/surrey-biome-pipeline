"""Rank corridors by how dry they are FOR THEIR CANOPY DENSITY, not by raw stress.

The headline limitation on the Surrey deliverable is that the stress ranking is
confounded with canopy density: Sentinel-1 radar corroborates the ranking only
through VH backscatter, and VH tracks NDVI at rho ~ +0.55, so the "most stressed"
corridors are substantially the densest ones. Stated that way the ranking is
exploratory and stays exploratory.

This asks the question the confound cannot answer on its own. Two corridors of
very different density can both sit near the dry edge; the thin one is in worse
shape, because it has less canopy to explain its position. Ranking on CDEI
residualised against density asks *which corridors are drier than their structure
predicts*, which is closer to what the City would act on.

WHY RADAR AND NOT NDVI. Residualising on NDVI would be circular: NDVI is a
constitutive input to `dry_dist`, so removing it removes part of the index by
construction, and `residualized_retest.py` already treats the NDVI-inclusive
variant as a deliberate over-correction rather than a headline. Sentinel-1 VH is
an independent instrument — active C-band radar, sharing no band with the optical
imagery CDEI is built from — so it can carry structure without carrying the index.
Its credential for this job is exactly the finding that made it a problem: VH
correlates with NDVI at rho ~ +0.55 and with the ranking at ~ +0.36, which is why
it is a usable density proxy in the first place.

The method mirrors `residualized_retest.py`: fit CDEI on the structure terms,
keep the residual, rank on that. Fitted per summer, because backscatter level
shifts between years with moisture and incidence angle, and a pooled fit would
push those year effects into the residual.

WHAT THE COMPARISON MEANS. The interesting quantity is not the new ranking on its
own but how far it moves from the published one.

  little movement  -> density was not driving the ranking, and the objection is
                      weaker than it looks. The published top-10 stands.
  large movement   -> the published top-10 is substantially a canopy-density
                      list, and the deliverable has to say so.

Either outcome is decisive, which is why it is worth running. Nothing downstream
(board, README, manuscript Table 1) should be edited before the diff is read.

Run (needs data/processed/sar_per_polygon.csv from validate_sar):
    .venv/bin/python -m src.pipeline.validate_sar -v
    .venv/bin/python scripts/canopy_controlled_ranking.py
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

from src.pipeline import paths

SAR = paths.PROCESSED / "sar_per_polygon.csv"
CORRIDOR_RANKING = paths.DOCS / "deliverable" / "corridor_stress_ranking.csv"
OUT = paths.DOCS / "deliverable" / "corridor_stress_ranking_canopy_controlled.csv"


def residualise(df: pd.DataFrame, y: str, xs: list[str]) -> np.ndarray:
    """Return y with the linear effect of xs removed. Intercept kept in the
    residual's mean so the output stays on a readable scale."""
    ok = df[[y, *xs]].notna().all(axis=1)
    X = np.column_stack([np.ones(ok.sum())] + [df.loc[ok, c].astype(float) for c in xs])
    yv = df.loc[ok, y].astype(float).to_numpy()
    beta, *_ = np.linalg.lstsq(X, yv, rcond=None)
    out = np.full(len(df), np.nan)
    out[ok.to_numpy()] = yv - X @ beta + yv.mean()
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--sar", type=Path, default=SAR)
    ap.add_argument("--ranking", type=Path, default=CORRIDOR_RANKING)
    ap.add_argument("--out", type=Path, default=OUT)
    ap.add_argument("--control", nargs="+", default=["vh"],
                    help="structure terms to residualise on (default: vh)")
    a = ap.parse_args()

    if not a.sar.exists():
        raise SystemExit(f"{a.sar} not found -- run "
                         "'.venv/bin/python -m src.pipeline.validate_sar -v' first")

    sar = pd.read_csv(a.sar)
    years = sorted(sar.year.unique())
    print(f"per-polygon radar: {len(sar)} polygon-summers, "
          f"{sar.objectid.nunique()} polygons, summers {years}\n")

    # -- 1. how strong is the confound, per summer ----------------------------
    print("1. The confound this exists to remove (Spearman, per summer)")
    for y, g in sar.groupby("year"):
        r_vn = stats.spearmanr(g.vh, g.ndvi)[0]
        r_vt = stats.spearmanr(g.vh, g.tvwsi)[0]
        print(f"   {y}   VH vs NDVI {r_vn:+.3f}   VH vs CDEI {r_vt:+.3f}   n = {len(g)}")

    # -- 2. residualise CDEI on structure, within each summer -----------------
    parts = []
    for y, g in sar.groupby("year"):
        g = g.copy()
        g["tvwsi_resid"] = residualise(g, "tvwsi", a.control)
        parts.append(g)
    per = pd.concat(parts, ignore_index=True)
    kept = per.tvwsi_resid.notna().sum()
    print(f"\n2. Residualised CDEI on {a.control} within each summer "
          f"({kept}/{len(per)} rows usable)")
    var_removed = 1 - per.groupby("year").apply(
        lambda g: g.tvwsi_resid.var() / g.tvwsi.var(), include_groups=False).mean()
    print(f"   mean share of CDEI variance removed by the control: {var_removed:.1%}")

    # -- 3. aggregate to GIN corridors and rank -------------------------------
    gin = (per.groupby("gin_id")
              .agg(tvwsi=("tvwsi", "mean"), tvwsi_resid=("tvwsi_resid", "mean"),
                   vh=("vh", "mean"), ndvi=("ndvi", "mean"), n_obs=("year", "size"))
              .reset_index())
    gin["rank_published"] = gin.tvwsi.rank().astype(int)
    gin["rank_controlled"] = gin.tvwsi_resid.rank().astype(int)
    gin["rank_shift"] = gin.rank_published - gin.rank_controlled

    # -- 4. how far did the ranking move? -------------------------------------
    rho = stats.spearmanr(gin.rank_published, gin.rank_controlled)[0]
    print(f"\n3. Agreement between the published and controlled rankings")
    print(f"   Spearman rho = {rho:+.4f} over {len(gin)} GIN corridors")
    print(f"   median |rank shift| = {gin.rank_shift.abs().median():.0f} places, "
          f"max = {gin.rank_shift.abs().max():.0f}")
    for k in (10, 20):
        a_set = set(gin.nsmallest(k, "tvwsi").gin_id)
        b_set = set(gin.nsmallest(k, "tvwsi_resid").gin_id)
        print(f"   top-{k}: {len(a_set & b_set)}/{k} corridors survive the control")

    # -- 5. the two top-10s, side by side -------------------------------------
    print("\n4. Published top-10 (raw CDEI) against controlled top-10")
    pub = gin.nsmallest(10, "tvwsi")[["gin_id", "rank_controlled"]]
    con = gin.nsmallest(10, "tvwsi_resid")[["gin_id", "rank_published"]]
    print("   published  ->  its rank once controlled | controlled  ->  its published rank")
    for (_, p), (_, c) in zip(pub.iterrows(), con.iterrows()):
        print(f"     GIN {int(p.gin_id):>4}  ->  {int(p.rank_controlled):>3}"
              f"          |    GIN {int(c.gin_id):>4}  ->  {int(c.rank_published):>3}")

    # -- 6. biggest movers ----------------------------------------------------
    print("\n5. Corridors the control moves furthest")
    # rank 1 = most stressed, so a SMALLER controlled rank means the corridor is
    # drier than its density explains -- it looks worse, not better.
    print("   (moving toward rank 1 = drier than its canopy density explains)")
    mv = gin.reindex(gin.rank_shift.abs().sort_values(ascending=False).index).head(8)
    for _, r in mv.iterrows():
        d = "worse" if r.rank_controlled < r.rank_published else "better"
        print(f"     GIN {int(r.gin_id):>4}  {int(r.rank_published):>3} -> "
              f"{int(r.rank_controlled):>3}  (looks {d} by {abs(int(r.rank_shift))})")

    # -- 7. write, merging the City's own text back on ------------------------
    if a.ranking.exists():
        pubcsv = pd.read_csv(a.ranking)
        keep = [c for c in ["gin_id", "area_ha", "ecological_value",
                            "risk_of_development", "corridor_type", "target_width_m",
                            "priority", "recommendation"] if c in pubcsv.columns]
        gin = gin.merge(pubcsv[keep], on="gin_id", how="left")
    gin = gin.sort_values("rank_controlled")
    a.out.parent.mkdir(parents=True, exist_ok=True)
    gin.to_csv(a.out, index=False)
    print(f"\nwrote {a.out}")

    print("\n" + "=" * 72)
    if rho >= 0.9:
        print(f"The ranking barely moves (rho = {rho:+.3f}). Canopy density is correlated")
        print("with CDEI but is not what orders the corridors, so the confound is a")
        print("weaker objection to the RANKING than to the index. The published top-10")
        print("stands, and this file is corroboration rather than a replacement.")
    elif rho >= 0.6:
        print(f"The ranking moves materially (rho = {rho:+.3f}). Density is part of what")
        print("orders the corridors but not all of it. Both rankings should be shipped,")
        print("and the deliverable should say which question each answers.")
    else:
        print(f"The ranking largely dissolves (rho = {rho:+.3f}). The published order is")
        print("substantially a canopy-density list, and the board, the README and")
        print("Table 1 all need revisiting before any of them go out.")
    print("=" * 72)


if __name__ == "__main__":
    main()
