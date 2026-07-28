"""Surrey GIN corridor water-stress map + ranking — the applied deliverable.

Turns the Phase 3 result into the thing a city planner can act on: a ranked,
mapped list of which of Surrey's 153 Green-Infrastructure corridors are most
water-stressed, cross-referenced with their ecological value and development
risk (the EMS prioritization lens).

Stress orientation (verified against the index construction in ``assemble.py``):
``dry_dist`` is signed POSITIVE on the wet side, so a *low* CDEI means a
corridor sits near its vegetation "dry edge" — the most water-stressed state.
We therefore rank by ascending mean summer CDEI and express it as a stress
percentile (100 = most stressed). CDEI is a relative feature-space index, not a
soil-moisture measurement; over flat Surrey the most-stressed corridors tend to
be the denser-canopy ones nearest their moisture limit (see the honesty note in
docs/PHASE3_FINDINGS.md).

Outputs (to docs/deliverable/):
  corridor_stress_ranking.csv   — all 153 corridors, full detail
  fig1_stress_map.png           — choropleth of Surrey corridors by stress
  fig2_top_ranking.png          — the 20 most-stressed corridors, ranked
  fig3_dry_edge.png             — how CDEI is defined (NDVI–SWCI dry edge)

CLI:  python -m src.pipeline.corridor_stress -v
"""
from __future__ import annotations

import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from . import paths

logger = logging.getLogger(__name__)

CORRIDORS = paths.INTERIM / "corridors_analysis.gpkg"
OUT_DIR = paths.DOCS / "deliverable"
STRESS_CMAP = "Reds"          # sequential single hue: light = low stress, dark = high
VALUE_ORDER = {"High": 3, "Moderate": 2, "Low": 1}


def build_table(features_path: Path, corridors_gpkg: Path) -> "pd.DataFrame":
    """Per-corridor stress table joined to geometry + EMS attributes."""
    import geopandas as gpd

    df = pd.read_parquet(features_path)
    years = sorted(df["year"].unique())

    # Per-corridor summary. Lower mean CDEI = closer to the dry edge = more stress.
    agg = df.groupby("objectid").agg(
        tvwsi=("tvwsi", "mean"), dry_dist=("dry_dist", "mean"),
        lst=("lst_mean", "mean"), ndvi=("ndvi_mean", "mean"),
        swci=("swci_mean", "mean"), coverage=("coverage_frac_ndvi", "mean"),
    ).reset_index()

    # Persistence: how many summers a corridor sits in the driest tercile that year.
    df = df.copy()
    df["yr_tercile"] = df.groupby("year")["tvwsi"].transform(
        lambda s: pd.qcut(s, 3, labels=False, duplicates="drop"))
    persist = (df[df["yr_tercile"] == 0].groupby("objectid").size()
               .reindex(agg["objectid"]).fillna(0).astype(int).to_numpy())
    agg["years_in_driest_third"] = persist

    # Per-year CDEI, wide, for the table.
    wide = df.pivot_table(index="objectid", columns="year", values="tvwsi")
    wide.columns = [f"tvwsi_{y}" for y in wide.columns]
    agg = agg.merge(wide.reset_index(), on="objectid")

    # Stress percentile: 100 = most stressed (lowest CDEI).
    agg["stress_pctile"] = (1 - agg["tvwsi"].rank(pct=True)) * 100
    agg = agg.sort_values("tvwsi").reset_index(drop=True)
    agg.insert(0, "stress_rank", np.arange(1, len(agg) + 1))

    # EMS attributes + geometry.
    g = gpd.read_file(corridors_gpkg)
    keep = ["objectid", "ecological_value", "corridor_type",
            "risk_of_development", "target_width_m", "too_thin", "geometry"]
    g = g[[c for c in keep if c in g.columns]].to_crs("EPSG:26910")
    g["area_ha"] = g.geometry.area / 1e4
    out = g.merge(agg, on="objectid")

    # Priority flag: among the most-stressed third AND (high value OR high dev risk).
    stressed = out["stress_pctile"] >= 66.7
    high_stakes = (out.get("ecological_value").eq("High")
                   | out.get("risk_of_development").eq("High"))
    out["priority"] = np.where(stressed & high_stakes, "★ priority", "")
    logger.info("built %d corridors over summers %s; %d flagged priority",
                len(out), years, int((out["priority"] != "").sum()))
    return out.sort_values("stress_rank").reset_index(drop=True)


# --------------------------------------------------------------------------- #
# Figures
# --------------------------------------------------------------------------- #
def _style():
    import matplotlib.pyplot as plt
    plt.rcParams.update({
        "figure.dpi": 130, "savefig.dpi": 200, "font.size": 11,
        "axes.spines.top": False, "axes.spines.right": False,
        "axes.titlesize": 13, "axes.titleweight": "bold",
        "figure.facecolor": "white", "axes.facecolor": "white",
    })


def fig_stress_map(gdf, out_path: Path, top_n: int = 8):
    import matplotlib.pyplot as plt

    _style()
    fig, ax = plt.subplots(figsize=(9, 10))
    # Faint context: all corridors outlined.
    gdf.plot(ax=ax, facecolor="none", edgecolor="#d9d9d9", linewidth=0.4)
    # Choropleth by stress percentile.
    gdf.plot(ax=ax, column="stress_pctile", cmap=STRESS_CMAP, linewidth=0.3,
             edgecolor="#7f7f7f", legend=True,
             legend_kwds={"label": "Water-stress percentile  (100 = most stressed)",
                          "shrink": 0.5, "pad": 0.01})
    # Mark + rank-label the most-stressed corridors.
    top = gdf.nsmallest(top_n, "stress_rank")
    cent = top.geometry.representative_point()
    ax.scatter(cent.x, cent.y, s=90, facecolor="none", edgecolor="#1a1a1a",
               linewidth=1.6, zorder=5)
    for r, (x, y) in zip(top["stress_rank"], zip(cent.x, cent.y)):
        ax.annotate(f"#{r}", (x, y), xytext=(6, 6), textcoords="offset points",
                    fontsize=10, fontweight="bold", color="#1a1a1a", zorder=6)
    ax.set_title("Surrey corridors by canopy water-stress signal (CDEI)", pad=16)
    ax.text(0.0, 1.005, "153 Green-Infrastructure corridors · mean summer 2022–2025 · "
            "circled = 8 highest-signal", transform=ax.transAxes, fontsize=9.5, color="#555")
    ax.set_axis_off()
    ax.set_aspect("equal")
    ax.text(0.5, -0.02, "⚠ Exploratory: between-corridor ranking is confounded with canopy "
            "density, not independently validated (see README)",
            transform=ax.transAxes, ha="center", fontsize=8.5, color="#b30000")
    ax.text(0.5, -0.04, "CDEI from Sentinel-2 + Landsat · EPSG:26910",
            transform=ax.transAxes, ha="center", fontsize=8, color="#999")
    fig.tight_layout()
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)
    logger.info("wrote %s", out_path)


def fig_top_ranking(gdf, out_path: Path, top_n: int = 20):
    import matplotlib.pyplot as plt
    from matplotlib import colors

    _style()
    top = gdf.nsmallest(top_n, "stress_rank").iloc[::-1]
    norm = colors.Normalize(0, 100)
    bar_c = plt.get_cmap(STRESS_CMAP)(norm(top["stress_pctile"]))
    labels = [f"#{r}  corridor {int(o)}" for r, o in zip(top["stress_rank"], top["objectid"])]

    fig, ax = plt.subplots(figsize=(9.5, 8))
    ax.barh(labels, top["stress_pctile"], color=bar_c, edgecolor="white", height=0.72)
    for y, (p, ev, pr) in enumerate(zip(top["stress_pctile"],
                                        top["ecological_value"], top["priority"])):
        tag = f"{ev or '—'} value{'   ' + pr if pr else ''}"
        ax.text(min(p + 1.2, 99), y, tag, va="center", fontsize=8.5,
                color="#333" if not pr else "#b30000",
                fontweight="bold" if pr else "normal")
    ax.set_xlim(0, 108)
    ax.set_xlabel("Canopy water-stress signal percentile  (100 = highest signal)")
    ax.set_title(f"Surrey's {top_n} highest canopy-stress-signal corridors", pad=30)
    ax.text(0.0, 1.028, "★ = also high ecological value or development risk (candidate priority)",
            transform=ax.transAxes, fontsize=9.5, color="#555")
    ax.text(0.0, 1.006, "⚠ Exploratory ranking — confounded with canopy density, not yet validated (see README)",
            transform=ax.transAxes, fontsize=8.5, color="#b30000")
    ax.tick_params(axis="y", length=0)
    ax.margins(y=0.01)
    fig.tight_layout()
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)
    logger.info("wrote %s", out_path)


def fig_dry_edge(features_path: Path, out_path: Path):
    """The 'how it works' figure — CDEI is distance from the NDVI–SWCI dry edge."""
    import matplotlib.pyplot as plt
    from matplotlib import colors

    _style()
    df = pd.read_parquet(features_path)
    a = df["dry_edge_a"].iloc[0] if "dry_edge_a" in df else None
    b = df["dry_edge_b"].iloc[0] if "dry_edge_b" in df else None
    cm_ = df.groupby("objectid").agg(ndvi=("ndvi_mean", "mean"), swci=("swci_mean", "mean"),
                                     tvwsi=("tvwsi", "mean")).reset_index()
    stress = (1 - cm_["tvwsi"].rank(pct=True)) * 100

    fig, ax = plt.subplots(figsize=(8.5, 6.2))
    sc = ax.scatter(cm_["ndvi"], cm_["swci"], c=stress, cmap=STRESS_CMAP,
                    s=42, edgecolor="#888", linewidth=0.4, norm=colors.Normalize(0, 100))
    if a is not None:
        xs = np.linspace(cm_["ndvi"].min(), cm_["ndvi"].max(), 50)
        ax.plot(xs, a + b * xs, "--", color="#1a1a1a", lw=2,
                label=f"dry edge  (SWCI = {a:.2f} + {b:.2f}·NDVI)")
        ax.legend(loc="upper left", fontsize=9)
    ax.set(xlabel="NDVI (greenness)", ylabel="SWCI (canopy water content)")
    ax.set_title("How corridor water stress is measured", pad=26)
    ax.text(0.0, 1.008, "Each dot = one corridor. Distance ABOVE the dry edge = water margin; "
            "corridors near the line are stressed.", transform=ax.transAxes,
            fontsize=9, color="#555")
    cb = fig.colorbar(sc, ax=ax, shrink=0.8)
    cb.set_label("stress percentile")
    fig.tight_layout()
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)
    logger.info("wrote %s", out_path)


def run(features_path: Path = paths.FEATURES, corridors_gpkg: Path = CORRIDORS,
        out_dir: Path = OUT_DIR) -> "pd.DataFrame":
    out_dir.mkdir(parents=True, exist_ok=True)
    gdf = build_table(features_path, corridors_gpkg)

    cols = ["stress_rank", "objectid", "stress_pctile", "tvwsi",
            "years_in_driest_third", "ecological_value", "risk_of_development",
            "corridor_type", "area_ha", "target_width_m", "lst", "ndvi", "priority"]
    tidy = gdf[[c for c in cols if c in gdf.columns]].copy()
    tidy.to_csv(out_dir / "corridor_stress_ranking.csv", index=False)
    logger.info("wrote %s", out_dir / "corridor_stress_ranking.csv")

    fig_stress_map(gdf, out_dir / "fig1_stress_map.png")
    fig_top_ranking(gdf, out_dir / "fig2_top_ranking.png")
    fig_dry_edge(features_path, out_dir / "fig3_dry_edge.png")
    return gdf


def main() -> None:
    p = argparse.ArgumentParser(description="Surrey corridor water-stress map + ranking.")
    p.add_argument("--features", type=Path, default=paths.FEATURES)
    p.add_argument("--corridors", type=Path, default=CORRIDORS)
    p.add_argument("--out-dir", type=Path, default=OUT_DIR)
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()
    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING,
                        format="%(levelname)s %(name)s: %(message)s")
    gdf = run(args.features, args.corridors, args.out_dir)

    print("=" * 70)
    print("Surrey GIN corridor water-stress ranking — most-stressed first")
    print("=" * 70)
    show = gdf.head(15)
    for _, r in show.iterrows():
        star = " " + r["priority"] if r["priority"] else ""
        print(f"  #{int(r.stress_rank):>3}  corridor {int(r.objectid):>4}  "
              f"stress {r.stress_pctile:5.1f}pct  "
              f"{str(r.ecological_value or '—'):<8} value  "
              f"{str(r.risk_of_development or '—'):<8} dev-risk  "
              f"{r.years_in_driest_third}/4 summers driest-third{star}")
    n_pri = int((gdf["priority"] != "").sum())
    print(f"\n  {n_pri} corridors flagged PRIORITY (most-stressed third + high value/risk)")
    print(f"  figures + full ranking -> {OUT_DIR}")


if __name__ == "__main__":
    main()
