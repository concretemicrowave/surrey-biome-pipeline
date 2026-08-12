"""Surrey GIN corridor water-stress map + ranking — the applied deliverable.

Turns the Phase 3 result into the thing a city planner can act on: a ranked,
mapped list of which of Surrey's Green-Infrastructure corridors are most
water-stressed, cross-referenced with their ecological value and development
risk (the EMS prioritization lens).

TWO UNITS, deliberately. The MapServer layer serves **153 polygons** carrying
**144 GIN corridor ids** — seven corridors are digitised in several parts. The
polygon is the *modelling* unit (its own pixels, its own coverage_frac, and what
the cross-validation blocks on). The GIN corridor is the *reporting* unit: what
Surrey manages and what Appendix J indexes. Reporting on polygons let GIN 14
appear twice in one top-20, which is digitisation showing through, not a finding.
Never label a corridor with ``objectid`` — that is an ArcGIS row number and it
points a planner at the wrong place.

Stress orientation (verified against the index construction in ``assemble.py``):
``dry_dist`` is signed POSITIVE on the wet side, so a *low* CDEI means a
corridor sits near its vegetation "dry edge" — the most water-stressed state.
We therefore rank by ascending mean summer CDEI and express it as a stress
percentile (100 = most stressed). CDEI is a relative feature-space index, not a
soil-moisture measurement; over flat Surrey the most-stressed corridors tend to
be the denser-canopy ones nearest their moisture limit (see the honesty note in
docs/RESOLUTION_TEST_FINDINGS.md).

Outputs (to docs/deliverable/):
  corridor_stress_ranking.csv   — 144 GIN corridors, with Surrey's own
                                  recommendation text (the reporting table)
  polygon_stress_ranking.csv    — 153 polygons, full detail (the modelling table)
  fig1_stress_map.png           — choropleth of Surrey corridors by stress
  fig2_top_ranking.png          — the 20 most-stressed corridors, ranked
  fig3_dry_edge.png             — how CDEI is defined (NDVI–SWCI dry edge)

CLI:  python -m src.pipeline.corridor_stress -v
      python -m src.pipeline.corridor_stress --mode poster -v
        -> the same three figures at print resolution in docs/deliverable/poster/,
           for a science-fair board. Paper figures are never overwritten.
"""
from __future__ import annotations

import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from . import paths, viz

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
    keep = ["objectid", "id", "ecological_value", "corridor_type",
            "risk_of_development", "target_width_m", "too_thin", "geometry"]
    g = g[[c for c in keep if c in g.columns]].to_crs("EPSG:26910")
    # `objectid` is the ArcGIS row number; `id` is the City's GIN corridor id, and
    # they are not the same. 153 polygons carry 144 GIN ids because seven corridors
    # are digitised in parts. Everything this project reported before 2026-07-29
    # was labelled with objectid, so "corridor 73" named a polygon, not the City's
    # corridor 73. Both travel together from here on so the join stays auditable —
    # scripts/parse_appendix_j.py verifies which column is which against the City's
    # own published table.
    if "id" in g.columns:
        g["gin_id"] = pd.to_numeric(g["id"], errors="coerce").astype("Int64")
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


APPENDIX_J = paths.INTERIM / "gin_appendix_j.csv"


def gin_table(gdf, appendix_j: Path = APPENDIX_J) -> "pd.DataFrame":
    """Collapse the polygon ranking to the unit the City actually manages.

    Two units serve two purposes here, and conflating them is what produced the
    original error.

    The **polygon** is the modelling unit: it is a contiguous piece of habitat
    with its own pixel geometry and its own ``coverage_frac``, which is what the
    zonal statistics and the cross-validation are built on. That stays as it is.

    The **GIN corridor** is the reporting unit: it is what Surrey manages, what
    Appendix J indexes, and what a planner can act on. A polygon-level top-20 can
    list one corridor twice — GIN 14 arrived as both rank 1 and rank 5 — which is
    an artifact of digitisation, not a finding.

    Stress is aggregated area-weighted, because a 13 ha part and a 0.8 ha part of
    the same corridor should not count equally. The City's own written
    recommendation is joined on, since that is the column that turns a ranking
    into something a planner can do anything with.
    """
    agg = (gdf.assign(_w=gdf["area_ha"])
              .groupby("gin_id")
              .apply(lambda d: pd.Series({
                  "tvwsi": (d["tvwsi"] * d["_w"]).sum() / d["_w"].sum(),
                  "n_polygons": len(d),
                  "area_ha": d["area_ha"].sum(),
                  "years_in_driest_third": d["years_in_driest_third"].max(),
                  "ecological_value": d["ecological_value"].iloc[0],
                  "risk_of_development": d["risk_of_development"].iloc[0],
                  "corridor_type": d["corridor_type"].iloc[0],
                  "target_width_m": d["target_width_m"].iloc[0],
                  "polygon_objectids": ";".join(str(int(o)) for o in sorted(d["objectid"])),
              }), include_groups=False)
              .reset_index())

    agg["stress_pctile"] = (1 - agg["tvwsi"].rank(pct=True)) * 100
    agg = agg.sort_values("tvwsi").reset_index(drop=True)
    agg.insert(0, "stress_rank", np.arange(1, len(agg) + 1))

    stressed = agg["stress_pctile"] >= 66.7
    high_stakes = (agg["ecological_value"].eq("High")
                   | agg["risk_of_development"].eq("High"))
    agg["priority"] = np.where(stressed & high_stakes, "★ priority", "")

    if appendix_j.exists():
        j = pd.read_csv(appendix_j)[["gin_id", "recommendation"]]
        agg = agg.merge(j, on="gin_id", how="left")
        n = int(agg["recommendation"].notna().sum())
        logger.info("joined Surrey's own recommendation text for %d/%d corridors",
                    n, len(agg))
    else:
        logger.warning("%s missing — run scripts/parse_appendix_j.py for the "
                       "City's recommendation text", appendix_j)

    logger.info("GIN-level table: %d corridors from %d polygons; %d flagged priority",
                len(agg), len(gdf), int((agg["priority"] != "").sum()))
    return agg


# --------------------------------------------------------------------------- #
# Figures
# --------------------------------------------------------------------------- #
def _style():
    import matplotlib.pyplot as plt
    plt.rcParams.update(viz.rcparams())


def _warning_note(ax, y: float, *, fontsize: float | None = None, ha: str = "center",
                  x: float = 0.5) -> None:
    """The exploratory-ranking caveat, drawn as glyph + sentence.

    Set in ink rather than in red. The caveat is a status, not a data series,
    and these figures put it directly beneath a red sequential ramp \u2014 a red
    sentence there reads as a legend entry. The warning glyph carries the
    status, which also means the caveat survives greyscale printing and
    colourblind readers in a way colour alone would not.

    ``fontsize`` resolves at call time rather than in the signature, so that a
    default argument cannot freeze the paper-mode size at import and silently
    shrink the caveat on a poster.
    """
    if fontsize is None:
        fontsize = viz.pt(8.5)
    ax.text(x, y, f"\u26a0  {viz.EXPLORATORY_NOTE}", transform=ax.transAxes,
            ha=ha, va="top", fontsize=fontsize, color=viz.INK_2, zorder=9)


def fig_stress_map(gdf, out_path: Path, top_n: int = 8, *, standalone: bool = True):
    """Choropleth of corridors by stress percentile.

    ``standalone=True`` bakes a title into the image, for the deliverable PNG a
    planner opens on its own. ``standalone=False`` omits it, for the manuscript
    where a LaTeX caption already carries the title and repeating it is the
    single most-flagged figure fault in review. Everything else, including the
    exploratory-data caveat, is identical in both.
    """
    import matplotlib.pyplot as plt

    _style()
    fig, ax = plt.subplots(figsize=viz.figsize(9, 10))
    # Faint context: all corridors outlined.
    gdf.plot(ax=ax, facecolor="none", edgecolor=viz.CONTEXT, linewidth=viz.pt(0.4))
    # Choropleth by stress percentile.
    gdf.plot(ax=ax, column="stress_pctile", cmap=STRESS_CMAP, linewidth=viz.pt(0.3),
             edgecolor=viz.POLY_EDGE, legend=True,
             legend_kwds={"label": "Water-stress percentile  (100 = most stressed)",
                          "shrink": 0.5, "pad": 0.01})
    # Mark + rank-label the most-stressed corridors. Marker area scales as the
    # square of the linear text scale, so the ring keeps its weight next to the
    # label it belongs to instead of shrinking away from it.
    top = gdf.nsmallest(top_n, "stress_rank")
    cent = top.geometry.representative_point()
    ax.scatter(cent.x, cent.y, s=90 * (viz.pt(1.0) ** 2), facecolor="none",
               edgecolor=viz.INK, linewidth=viz.pt(1.6), zorder=5)
    for r, (x, y) in zip(top["stress_rank"], zip(cent.x, cent.y)):
        ax.annotate(f"#{r}", (x, y), xytext=(viz.pt(6), viz.pt(6)),
                    textcoords="offset points",
                    fontsize=viz.pt(10), fontweight="bold", color=viz.INK, zorder=6)
    if standalone:
        ax.set_title("Surrey corridors by canopy water-stress signal (CDEI)", pad=viz.pt(16))
    # Counted from the data, not hardcoded. The map draws polygons, and there are
    # more polygons than corridors, so it must say which it is showing.
    n_poly = len(gdf)
    n_gin = int(gdf["gin_id"].nunique()) if "gin_id" in gdf.columns else n_poly
    unit = (f"{n_poly} corridor polygons ({n_gin} GIN corridors)"
            if n_gin != n_poly else f"{n_poly} Green-Infrastructure corridors")
    ax.text(0.0, viz.stack(1.005, anchor=1.0),
            f"{unit} · mean summer 2022–2025 · circled = {top_n} highest-signal",
            transform=ax.transAxes, fontsize=viz.pt(9.5), color=viz.INK_2)
    ax.set_aspect("equal")
    # Spatial reference. A published map without these is non-standard, and
    # set_axis_off() removes the coordinate ticks that would otherwise serve.
    # Both read the axis limits, so they must be drawn before the axis is hidden.
    viz.scale_bar(ax)
    viz.north_arrow(ax)
    ax.set_axis_off()
    _warning_note(ax, viz.stack(-0.02, anchor=0.0))
    ax.text(0.5, viz.stack(-0.05, anchor=0.0), "CDEI from Sentinel-2 + Landsat · EPSG:26910 (UTM 10N), grid north",
            transform=ax.transAxes, ha="center", va="top", fontsize=viz.pt(8),
            color=viz.MUTED)
    fig.tight_layout()
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)
    logger.info("wrote %s", out_path)


def fig_top_ranking(gdf, out_path: Path, top_n: int = 20, *, standalone: bool = True):
    """A ranked bar chart of the most-stressed units.

    Pass the GIN table, not the polygon table. A polygon-level top-20 labelled by
    GIN id lists GIN 14 twice — at ranks 1 and 5, with two different stress values
    — because that corridor is digitised in two pieces. Ranking a corridor twice
    is an artifact of digitisation and reads as a mistake to anyone who knows the
    network.
    """
    import matplotlib.pyplot as plt
    from matplotlib import colors

    _style()
    top = gdf.nsmallest(top_n, "stress_rank").iloc[::-1]
    if "gin_id" in top.columns:
        dupes = top["gin_id"].duplicated().sum()
        if dupes:
            logger.warning("top-%d contains %d repeated GIN id(s) — this looks like "
                           "the polygon table; pass gin_table(gdf) instead", top_n, dupes)
    norm = colors.Normalize(0, 100)
    bar_c = plt.get_cmap(STRESS_CMAP)(norm(top["stress_pctile"]))
    # Labelled by GIN id — the number Surrey uses. objectid is an ArcGIS row
    # number and naming a corridor by it points a planner at the wrong place.
    idcol = "gin_id" if "gin_id" in top.columns else "objectid"
    labels = [f"#{r}  corridor {int(o)}" for r, o in zip(top["stress_rank"], top[idcol])]

    fig, ax = plt.subplots(figsize=viz.figsize(9.5, 8))
    ax.barh(labels, top["stress_pctile"], color=bar_c, edgecolor="white", height=0.72)
    for y, (p, ev, pr) in enumerate(zip(top["stress_pctile"],
                                        top["ecological_value"], top["priority"])):
        tag = f"{ev or '—'} value{'   ' + pr if pr else ''}"
        ax.text(min(p + 1.2, 99), y, tag, va="center", fontsize=viz.pt(8.5),
                color=viz.INK if pr else viz.INK_2,
                fontweight="bold" if pr else "normal")
    ax.set_xlim(0, 108)
    ax.set_xlabel("Canopy water-stress signal percentile  (100 = highest signal)")
    if standalone:
        ax.set_title(f"Surrey's {top_n} highest canopy-stress-signal corridors", pad=viz.pt(30))
    ax.text(0.0, viz.stack(1.028, anchor=1.0), "★ = also high ecological value or development risk (candidate priority)",
            transform=ax.transAxes, fontsize=viz.pt(9.5), color=viz.INK_2)
    _warning_note(ax, viz.stack(1.016, anchor=1.0), ha="left", x=0.0)
    ax.tick_params(axis="y", length=0)
    ax.margins(y=0.01)
    fig.tight_layout()
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)
    logger.info("wrote %s", out_path)


def fig_dry_edge(features_path: Path, out_path: Path, *, standalone: bool = True):
    """The 'how it works' figure — CDEI is distance from the NDVI–SWCI dry edge."""
    import matplotlib.pyplot as plt
    from matplotlib import colors

    _style()
    df = pd.read_parquet(features_path)
    a = df["dry_edge_a"].iloc[0] if "dry_edge_a" in df else None
    b = df["dry_edge_b"].iloc[0] if "dry_edge_b" in df else None
    cm_ = df.groupby("objectid").agg(ndvi=("ndvi_mean", "mean"), swci=("swci_mean", "mean"),
                                     tvwsi=("tvwsi", "mean")).reset_index()
    # One dot per polygon, which is not one dot per GIN corridor — see gin_table.
    # Counted from the panel so the subtitle cannot drift from what is plotted.
    n_gin = int(df["id"].nunique()) if "id" in df.columns else len(cm_)
    stress = (1 - cm_["tvwsi"].rank(pct=True)) * 100

    fig, ax = plt.subplots(figsize=viz.figsize(8.5, 6.2))
    sc = ax.scatter(cm_["ndvi"], cm_["swci"], c=stress, cmap=STRESS_CMAP,
                    s=42 * (viz.pt(1.0) ** 2), edgecolor=viz.POLY_EDGE,
                    linewidth=viz.pt(0.4), norm=colors.Normalize(0, 100))
    if a is not None:
        xs = np.linspace(cm_["ndvi"].min(), cm_["ndvi"].max(), 50)
        ax.plot(xs, a + b * xs, "--", color=viz.INK, lw=viz.pt(2),
                label=f"dry edge  (SWCI = {a:.2f} + {b:.2f}·NDVI)")
        ax.legend(loc="upper left", fontsize=viz.pt(9))
    ax.set(xlabel="NDVI (greenness)", ylabel="SWCI (canopy water content)")
    if standalone:
        ax.set_title("How corridor water stress is measured", pad=viz.pt(26))
    unit = (f"one of {len(cm_)} corridor polygons ({n_gin} GIN corridors)"
            if n_gin != len(cm_) else f"one of {len(cm_)} corridors")
    ax.text(0.0, viz.stack(1.008, anchor=1.0), f"Each dot = {unit}. Distance ABOVE the dry edge = water margin; "
            "polygons near the line are stressed.", transform=ax.transAxes,
            fontsize=viz.pt(9), color=viz.INK_2)
    cb = fig.colorbar(sc, ax=ax, shrink=0.8)
    cb.set_label("stress percentile")
    fig.tight_layout()
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)
    logger.info("wrote %s", out_path)


def run(features_path: Path = paths.FEATURES, corridors_gpkg: Path = CORRIDORS,
        out_dir: Path = OUT_DIR, *,
        manuscript_dir: Path | None = None,
        mode: str = "paper") -> "pd.DataFrame":
    """Build the ranking table and its figures.

    ``manuscript_dir``, if given, additionally writes untitled copies of the two
    figures the paper uses. The manuscript lives outside this repository, so the
    path is passed in rather than hardcoded, and nothing is written there by
    default.

    ``mode="poster"`` re-renders the same figures for large-format print (see
    ``viz`` for what that changes). It never writes to ``manuscript_dir``: the
    preprint takes paper-mode figures and nothing else.
    """
    viz.set_mode(mode)
    out_dir.mkdir(parents=True, exist_ok=True)
    gdf = build_table(features_path, corridors_gpkg)

    cols = ["stress_rank", "gin_id", "objectid", "stress_pctile", "tvwsi",
            "years_in_driest_third", "ecological_value", "risk_of_development",
            "corridor_type", "area_ha", "target_width_m", "lst", "ndvi", "priority"]
    tidy = gdf[[c for c in cols if c in gdf.columns]].copy()
    tidy.to_csv(out_dir / "polygon_stress_ranking.csv", index=False)
    logger.info("wrote %s (modelling unit: %d polygons)",
                out_dir / "polygon_stress_ranking.csv", len(tidy))

    # The reporting table: one row per GIN corridor, with Surrey's own recommendation.
    if "gin_id" in gdf.columns:
        gin = gin_table(gdf)
        gin.to_csv(out_dir / "corridor_stress_ranking.csv", index=False)
        logger.info("wrote %s (reporting unit: %d GIN corridors)",
                    out_dir / "corridor_stress_ranking.csv", len(gin))
    else:
        gin = tidy
        tidy.to_csv(out_dir / "corridor_stress_ranking.csv", index=False)

    # The map draws polygons because polygons are what has geometry; the ranked bar
    # chart names corridors, so it takes the corridor table or it repeats one.
    fig_stress_map(gdf, out_dir / "fig1_stress_map.png")
    fig_top_ranking(gin, out_dir / "fig2_top_ranking.png")
    fig_dry_edge(features_path, out_dir / "fig3_dry_edge.png")

    if manuscript_dir is not None:
        if mode != "paper":
            raise ValueError("manuscript figures are paper-mode only; "
                             f"refusing to write {mode!r} figures to {manuscript_dir}")
        manuscript_dir.mkdir(parents=True, exist_ok=True)
        fig_stress_map(gdf, manuscript_dir / "fig2-stress-map.png", standalone=False)
        fig_dry_edge(features_path, manuscript_dir / "fig3-dry-edge.png", standalone=False)
    return gdf


def main() -> None:
    p = argparse.ArgumentParser(description="Surrey corridor water-stress map + ranking.")
    p.add_argument("--features", type=Path, default=paths.FEATURES)
    p.add_argument("--corridors", type=Path, default=CORRIDORS)
    p.add_argument("--out-dir", type=Path, default=OUT_DIR)
    p.add_argument("--manuscript-figures", type=Path, default=None,
                   help="also write untitled copies here, for the preprint "
                        "(the caption carries the title there)")
    p.add_argument("--mode", choices=viz.MODES, default="paper",
                   help="'poster' re-renders at print resolution with larger "
                        "type, for a science-fair board; default 'paper'")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()
    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING,
                        format="%(levelname)s %(name)s: %(message)s")
    out_dir = args.out_dir
    if args.mode != "paper" and out_dir == OUT_DIR:
        out_dir = OUT_DIR / args.mode       # never overwrite the paper figures
    gdf = run(args.features, args.corridors, out_dir,
              manuscript_dir=args.manuscript_figures, mode=args.mode)

    # Report the GIN corridor, not the polygon. The header says "corridor", so
    # printing objectid here is what produced the original mislabelling: a
    # polygon-level top-15 lists GIN 14 twice and names every row by an ArcGIS
    # row number. Fall back to polygons only if the GIN key is unavailable.
    report = gin_table(gdf) if "gin_id" in gdf.columns else gdf
    by_gin = "gin_id" in gdf.columns
    print("=" * 70)
    print("Surrey GIN corridor water-stress ranking — most-stressed first"
          if by_gin else "Surrey corridor POLYGON ranking (no GIN key) — most-stressed first")
    print("=" * 70)
    for _, r in report.head(15).iterrows():
        star = " " + r["priority"] if r["priority"] else ""
        label = (f"GIN {int(r.gin_id):>4}" if by_gin else f"polygon {int(r.objectid):>4}")
        pieces = (f" ({int(r.n_polygons)} polygons)"
                  if by_gin and int(r.n_polygons) > 1 else "")
        print(f"  #{int(r.stress_rank):>3}  {label}  "
              f"stress {r.stress_pctile:5.1f}pct  "
              f"{str(r.ecological_value or '—'):<8} value  "
              f"{str(r.risk_of_development or '—'):<8} dev-risk  "
              f"{r.years_in_driest_third}/4 summers driest-third{star}{pieces}")
    n_pri = int((report["priority"] != "").sum())
    unit = "corridors" if by_gin else "polygons"
    print(f"\n  {n_pri} {unit} flagged PRIORITY (most-stressed third + high value/risk)")
    print(f"  figures + full ranking -> {out_dir}  (mode: {args.mode})")


if __name__ == "__main__":
    main()
