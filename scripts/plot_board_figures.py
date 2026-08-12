"""Two board-only figures that replace paragraphs with diagrams.

Neither of these belongs in the manuscript — the paper explains both in prose,
where prose works. On a display board a reader gets a few seconds before deciding
whether to engage, and a diagram survives that where a paragraph does not.

1. ``ab_schematic``  — what the A-vs-B manipulation actually does. Real Surrey
   corridor geometry and real ClimateBC values: Model A samples the continuous
   field at each corridor's own point and elevation, Model B averages those same
   values into 4 km cells. This replaces two boxes of text describing the same
   thing.

   **Model A is not a grid.** ClimateBC is scale-free — latitude, longitude and
   elevation in, a value for that exact point out. An earlier version of this
   figure drew a 750 m mesh and labelled it "Model A's cells", which contradicted
   the manuscript (§2: "*effective* resolution of roughly 375--750 m", "values
   *sampled at* each corridor's own location and elevation") and made the design
   look like the product-swap confound it exists to avoid. The ~375--750 m is the
   scale of the surface underneath the interpolation, not cells anyone receives,
   so the left panel draws the field and the sample points and no cell edges at
   all.

2. ``transect_profile`` — the elevation gradient that made the second extent
   answerable, drawn from the 300 real stand elevations rather than sketched.
   Surrey's own range is drawn to the same scale, which is the entire argument
   for why one extent could answer the question and the other could not.

Both are authored at the physical size they occupy on the board (see
``plot_paired_ci.py`` for why that matters) and use the manuscript's accent as
structural colour.

    .venv/bin/python scripts/plot_board_figures.py
"""

from __future__ import annotations

import matplotlib

matplotlib.use("Agg")

from pathlib import Path

import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.patches import Rectangle

from src.pipeline import paths, viz

OUT_DIR = paths.DOCS / "figures" / "board"
CORRIDORS = paths.INTERIM / "corridors_analysis.gpkg"
STANDS = paths.INTERIM / "phase3b" / "transect_stands.gpkg"
TERRAIN = paths.INTERIM / "phase3b" / "terrain_stands.parquet"

# The one cell size the experiment introduces. Model A has no cell size — it is
# sampled per corridor — so there is no FINE_M to pair with this.
COARSE_M = 4000
# The variable and summer drawn in the schematic. Any climate column works; Tmax
# is the one a reader can price intuitively.
SCHEMATIC_VAR, SCHEMATIC_YEAR = "Tmax_sm", 2023


def _rc(base_pt: float) -> dict:
    return {
        "font.size": base_pt, "axes.labelsize": base_pt,
        "axes.titlesize": base_pt * 1.1, "axes.titleweight": "bold",
        "xtick.labelsize": base_pt * 0.85, "ytick.labelsize": base_pt * 0.85,
        "text.color": viz.INK, "axes.labelcolor": viz.INK,
        "xtick.color": viz.INK_2, "ytick.color": viz.INK_2,
        "figure.facecolor": "white", "axes.facecolor": "white",
        "axes.spines.top": False, "axes.spines.right": False,
    }


def ab_schematic(out: Path, *, size_in=(7.3, 5.1), base_pt: float = 16.0) -> None:
    """Model A vs Model B: a continuous field sampled, versus that field averaged.

    Both panels draw the *same* real ClimateBC values on the same colour scale.
    On the left each corridor carries its own; on the right every corridor in a
    4 km cell carries that cell's mean, so the reader watches the variation
    collapse rather than being told it does.
    """
    from scipy.interpolate import griddata

    plt.rcParams.update(_rc(base_pt))
    g = gpd.read_file(CORRIDORS).to_crs("EPSG:26910")

    df = pd.read_parquet(paths.FEATURES)
    df = df[df["year"] == SCHEMATIC_YEAR]
    px, py = df["x_m"].to_numpy(), df["y_m"].to_numpy()
    fine = df[SCHEMATIC_VAR].to_numpy()

    # Model B, exactly as experiment.upscale builds it: the mean of the sample
    # points falling in each cell, so the right panel is the real manipulation
    # and not a redrawing of it.
    cell_key = (np.floor(px / COARSE_M).astype(int).astype(str) + "_" +
                np.floor(py / COARSE_M).astype(int).astype(str))
    coarse = pd.Series(fine).groupby(cell_key).transform("mean").to_numpy()

    x0, y0, x1, y1 = g.total_bounds
    vmin, vmax = float(fine.min()), float(fine.max())

    # The continuous surface ClimateBC interpolates from. Drawn only on the left,
    # softly, and with no cell edges anywhere — it is a field, not a raster the
    # user receives.
    # NaN outside the convex hull of the sample points is left NaN, so the wash
    # fades out on an organic boundary. Filling it with `nearest` produced blocky
    # rectangular patches in the corners — cell-looking artifacts in the one panel
    # whose entire job is to have no cells.
    gx, gy = np.meshgrid(np.linspace(x0, x1, 700), np.linspace(y0, y1, 700))
    field = griddata((px, py), fine, (gx, gy), method="cubic")

    fig, axes = plt.subplots(1, 2, figsize=size_in)
    cmap = viz.STRESS_CMAP

    for ax, (vals, label, colour, is_a) in zip(axes, [
        (fine,   "MODEL A — scale-free\nsampled per corridor", viz.SERIES, True),
        (coarse, f"MODEL B — coarse\n{COARSE_M // 1000} km cells", viz.MUTED, False),
    ]):
        if is_a:
            ax.imshow(field, extent=(x0, x1, y0, y1), origin="lower", cmap=cmap,
                      vmin=vmin, vmax=vmax, alpha=0.38, interpolation="bilinear",
                      zorder=0, aspect="equal")
        else:
            # Each occupied cell painted with its own mean, on the same scale as
            # the left panel's wash. This is what "coarse" means, shown rather
            # than asserted: the smooth field opposite becomes a step function.
            norm = plt.Normalize(vmin=vmin, vmax=vmax)
            cm = plt.get_cmap(cmap)
            for key, mean in pd.Series(fine).groupby(cell_key).mean().items():
                ix, iy = (int(v) for v in key.split("_"))
                ax.add_patch(Rectangle((ix * COARSE_M, iy * COARSE_M),
                                       COARSE_M, COARSE_M,
                                       facecolor=cm(norm(mean)), alpha=0.38,
                                       edgecolor="none", zorder=0))
            for vx in np.arange(x0 - COARSE_M, x1 + COARSE_M, COARSE_M):
                ax.plot([vx, vx], [y0, y1], color=colour, lw=0.7, alpha=0.65, zorder=1)
            for vy in np.arange(y0 - COARSE_M, y1 + COARSE_M, COARSE_M):
                ax.plot([x0, x1], [vy, vy], color=colour, lw=0.7, alpha=0.65, zorder=1)

        g.plot(ax=ax, color=viz.POLY_EDGE, linewidth=0.7, zorder=3)
        ax.scatter(px, py, c=vals, cmap=cmap, vmin=vmin, vmax=vmax, s=13,
                   edgecolor=viz.INK, linewidth=0.3, zorder=4)

        ax.set_title(label, color=colour, pad=base_pt * 0.7)
        ax.set_xlim(x0, x1)
        ax.set_ylim(y0, y1)
        ax.set_aspect("equal")
        ax.set_axis_off()

    fig.text(0.5, 0.015,
             "Identical corridors, identical variables, one colour scale. Model A "
             "samples the field at each\ncorridor's own point and elevation; Model B "
             "replaces that with its 4 km cell's average.",
             ha="center", va="bottom", fontsize=base_pt * 0.78, color=viz.INK_2)
    fig.tight_layout(rect=(0, 0.09, 1, 1))
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=600, bbox_inches="tight")
    plt.close(fig)
    kept = 1 - np.var(coarse) / np.var(fine)
    print(f"wrote {out}  ({len(g)} corridors, {SCHEMATIC_VAR} {SCHEMATIC_YEAR}, "
          f"{pd.Series(cell_key).nunique()} cells at {COARSE_M} m, "
          f"{kept * 100:.0f}% of the point variance removed)")


def transect_profile(out: Path, *, size_in=(7.3, 3.8), base_pt: float = 16.0) -> None:
    """The elevation gradient, and Surrey's range at the same scale."""
    plt.rcParams.update(_rc(base_pt))
    # Real easting, not an index. Sorting the elevations and plotting them
    # against a linspace draws a tidy monotonic climb that the landscape does
    # not have — it would be an artifact of the sort, labelled as geography.
    t = pd.read_parquet(TERRAIN)
    g = gpd.read_file(STANDS, layer="stands_analysis").to_crs("EPSG:26910")
    g["east_km"] = (g.geometry.centroid.x - g.geometry.centroid.x.min()) / 1000
    d = g[["objectid", "east_km"]].merge(t[["objectid", "elev_dem"]], on="objectid")
    d = d.sort_values("east_km")
    elev = d["elev_dem"].to_numpy()

    fig, ax = plt.subplots(figsize=size_in)
    ax.fill_between(d["east_km"], 0, elev, color=viz.ACCENT, alpha=0.13, zorder=1)
    ax.plot(d["east_km"], elev, "o", color=viz.ACCENT, markersize=viz.pt(3.4),
            alpha=0.8, zorder=3)

    # Surrey's own relief, to scale. This band is the argument.
    ax.axhspan(0, 116, color=viz.CRITICAL, alpha=0.14, zorder=2)
    ax.annotate("all of Surrey fits in here  (−1 to 116 m)",
                xy=(6, 116), xytext=(6, 430), fontsize=base_pt * 0.85,
                color=viz.CRITICAL, fontweight="bold",
                bbox=dict(boxstyle="round,pad=0.3", facecolor="white",
                          edgecolor="none", alpha=0.88),
                arrowprops=dict(arrowstyle="-|>", color=viz.CRITICAL,
                                lw=viz.pt(1.4), mutation_scale=base_pt * 0.8))
    ax.annotate(f"{elev.max():,.0f} m", xy=(d["east_km"].max(), elev.max()),
                xytext=(-base_pt * 0.4, -base_pt * 0.2), textcoords="offset points",
                ha="right", va="top", fontsize=base_pt * 0.9,
                fontweight="bold", color=viz.ACCENT,
                bbox=dict(boxstyle="round,pad=0.25", facecolor="white",
                          edgecolor="none", alpha=0.88))

    ax.set_xlabel("Distance east along the Fraser Valley transect (km)")
    ax.set_ylabel("Elevation (m)")
    ax.set_xlim(-2, d["east_km"].max() + 2)
    ax.set_ylim(0, elev.max() * 1.22)
    ax.set_title("Why the second extent could answer the question",
                 pad=base_pt * 0.9)
    fig.tight_layout()
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=600, bbox_inches="tight")
    plt.close(fig)
    print(f"wrote {out}  ({len(elev)} stands, {elev.min():.0f}-{elev.max():.0f} m)")


def ranking_wide(out: Path, *, size_in=(20.5, 4.6), base_pt: float = 17.0,
                 top_n: int = 20) -> None:
    """The ranked answer, as a wide band for the foot of the centre panel.

    Not redundant with the choropleth beside it, which is the test worth applying
    before adding any second view of the same data. The map shows *where*; this
    shows *which*, by corridor id, with the ecological-value and development-risk
    lens the city would actually triage on. A judge who wants the answer rather
    than the pattern reads this one.
    """
    plt.rcParams.update(_rc(base_pt))
    r = pd.read_csv(paths.DOCS / "deliverable" / "corridor_stress_ranking.csv")
    d = r.nsmallest(top_n, "stress_rank").reset_index(drop=True)

    fig, ax = plt.subplots(figsize=size_in)
    cmap = plt.get_cmap(viz.STRESS_CMAP)
    ax.bar(range(len(d)), d["stress_pctile"],
           color=[cmap(v / 100) for v in d["stress_pctile"]],
           edgecolor=viz.POLY_EDGE, linewidth=0.8, width=0.74, zorder=3)

    def is_priority(row) -> bool:
        v = row.get("priority")
        return pd.notna(v) and bool(str(v).strip())

    for i, row in d.iterrows():
        if is_priority(row):
            ax.text(i, row["stress_pctile"] + 1.4, "\u2605", ha="center", va="bottom",
                    fontsize=base_pt * 1.05, color=viz.CRITICAL, zorder=4)

    ax.set_xticks(range(len(d)))
    idcol = "gin_id" if "gin_id" in d.columns else "objectid"
    ax.set_xticklabels([f"{int(o)}" for o in d[idcol]])
    ax.set_xlabel("Surrey GIN corridor ID, most stressed first")
    ax.set_ylabel("Stress percentile")
    ax.set_ylim(0, 108)
    ax.set_xlim(-0.7, len(d) - 0.3)
    ax.grid(axis="y", color=viz.GRID, lw=0.9, zorder=0)
    ax.set_axisbelow(True)
    ax.text(0.0, 1.045,
            "\u2605 = also high ecological value or development risk — the candidate "
            "priorities. Ranking is exploratory (see validation).",
            transform=ax.transAxes, fontsize=base_pt * 0.85, color=viz.INK_2)

    fig.tight_layout()
    out.parent.mkdir(parents=True, exist_ok=True)
    # 600 not 300: at 20.5in wide, 300 dpi lands at ~295 effective dpi once the
    # tight bbox trims, which is under spec with no margin. Every other board
    # figure clears 450.
    fig.savefig(out, dpi=600, bbox_inches="tight")
    plt.close(fig)
    n_pri = sum(1 for _, x in d.iterrows() if is_priority(x))
    print(f"wrote {out}  (top {top_n}, {n_pri} flagged priority)")


if __name__ == "__main__":
    ab_schematic(OUT_DIR / "ab_schematic.png")
    transect_profile(OUT_DIR / "transect_profile.png")
    ranking_wide(OUT_DIR / "ranking_wide.png")
