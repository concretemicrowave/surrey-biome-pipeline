"""Two board-only figures that replace paragraphs with diagrams.

Neither of these belongs in the manuscript — the paper explains both in prose,
where prose works. On a display board a reader gets a few seconds before deciding
whether to engage, and a diagram survives that where a paragraph does not.

1. ``ab_schematic``  — what the A-vs-B manipulation actually does. Real Surrey
   corridor geometry under the two grids the experiment compares: the scale-free
   ~750 m sampling Model A gets, and the 4 km cells Model B averages into. This
   replaces two boxes of text describing the same thing.

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

# Cell sizes the Surrey experiment actually compared (metres).
FINE_M, COARSE_M = 750, 4000


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
    """Model A vs Model B, as the grids they actually sample."""
    plt.rcParams.update(_rc(base_pt))
    g = gpd.read_file(CORRIDORS).to_crs("EPSG:26910")

    fig, axes = plt.subplots(1, 2, figsize=size_in)
    x0, y0, x1, y1 = g.total_bounds

    for ax, (cell, label, colour) in zip(axes, [
        (FINE_M,   f"MODEL A — fine\n{FINE_M} m cells", viz.SERIES),
        (COARSE_M, f"MODEL B — coarse\n{COARSE_M // 1000} km cells", viz.MUTED),
    ]):
        # Grid first, so the corridors read on top of it.
        for gx in np.arange(x0 - cell, x1 + cell, cell):
            ax.plot([gx, gx], [y0, y1], color=colour, lw=0.6, alpha=0.55, zorder=1)
        for gy in np.arange(y0 - cell, y1 + cell, cell):
            ax.plot([x0, x1], [gy, gy], color=colour, lw=0.6, alpha=0.55, zorder=1)
        g.plot(ax=ax, color=viz.INK, linewidth=0.7, zorder=3)

        # One cell picked out, to make "averaged into this" concrete.
        cx = x0 + ((x1 - x0) // cell // 2) * cell
        cy = y0 + ((y1 - y0) // cell // 2) * cell
        ax.add_patch(Rectangle((cx, cy), cell, cell, facecolor=colour, alpha=0.22,
                               edgecolor=colour, lw=1.8, zorder=2))

        ax.set_title(label, color=colour, pad=base_pt * 0.7)
        ax.set_xlim(x0, x1)
        ax.set_ylim(y0, y1)
        ax.set_aspect("equal")
        ax.set_axis_off()

    fig.text(0.5, 0.015,
             "Identical corridors, identical variables. Only the cell the climate "
             "is averaged over differs.",
             ha="center", va="bottom", fontsize=base_pt * 0.82, color=viz.INK_2)
    fig.tight_layout(rect=(0, 0.06, 1, 1))
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=600, bbox_inches="tight")
    plt.close(fig)
    print(f"wrote {out}  ({len(g)} corridors, {FINE_M} m vs {COARSE_M} m)")


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
