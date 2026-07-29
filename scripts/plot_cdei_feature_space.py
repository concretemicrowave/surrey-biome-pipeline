"""Render the CDEI feature-space diagram — this project's analogue of the
textbook LST/NDVI trapezoid.

The published figure everyone cites puts land surface temperature on the y-axis,
so its dry edge is the UPPER envelope and slopes down. This pipeline puts SWCI
(shortwave-infrared water content) there instead, which inverts the picture: high
SWCI means wet, so the dry edge is the LOWER envelope and slopes up. Drawing a
purpose-built version avoids having to mentally flip a borrowed diagram every
time.

Everything plotted is measured, not illustrative: 612 real corridor-summers and
the dry edge actually fitted by ``assemble.dry_edge``.

    .venv/bin/python scripts/plot_cdei_feature_space.py
"""

from __future__ import annotations

import matplotlib

matplotlib.use("Agg")

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.gridspec import GridSpec

from src.pipeline import paths, viz

# Palette lives in src/pipeline/viz.py so this script and corridor_stress.py
# cannot drift apart again — they previously carried two near-identical reds
# and two near-identical near-blacks, which reads as a mistake.
SURFACE = viz.SURFACE
INK = viz.INK
INK_2 = viz.INK_2
MUTED = viz.MUTED
GRID = viz.GRID
AXIS = viz.AXIS
SERIES = viz.SERIES     # categorical slot 1 — the corridor-summers
EDGE = viz.CRITICAL     # status:critical — the dry edge is a "maximally stressed" limit

OUT = paths.DOCS / "figures" / "cdei_feature_space.png"


def _style(ax):
    ax.set_facecolor(SURFACE)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(AXIS)
        ax.spines[side].set_linewidth(0.8)
    ax.grid(True, color=GRID, linewidth=0.8, linestyle="-", zorder=0)
    ax.set_axisbelow(True)
    ax.tick_params(colors=MUTED, labelsize=9, length=0)


def main(out: Path = OUT, *, standalone: bool = True) -> None:
    df = pd.read_parquet(paths.FEATURES)
    a = float(df["dry_edge_a"].iloc[0])
    b = float(df["dry_edge_b"].iloc[0])

    fig = plt.figure(figsize=(11.5, 10.4), facecolor=SURFACE, dpi=200)
    gs = GridSpec(2, 4, figure=fig, height_ratios=[2.5, 1.0],
                  hspace=0.62, wspace=0.16,
                  left=0.075, right=0.975, top=0.855, bottom=0.075)

    # ---------------------------------------------------------------- main panel
    ax = fig.add_subplot(gs[0, :])
    _style(ax)

    # Fix the view BEFORE any fill, or fill_between's sentinel drags the axis
    # down to -1 and the data ends up crushed into the top fifth of the panel.
    ax.set_xlim(0.20, 0.95)
    ax.set_ylim(0.08, 0.47)

    ax.scatter(df["ndvi_mean"], df["swci_mean"], s=26, c=SERIES, alpha=0.55,
               linewidths=0.4, edgecolors=SURFACE, zorder=3)

    xs = np.linspace(0.20, 0.95, 100)
    ax.plot(xs, a + b * xs, color=EDGE, linewidth=2.0, zorder=4)
    # Below the edge is the physically unreachable side — nothing is drier than
    # the driest thing observed at that greenness.
    ax.fill_between(xs, a + b * xs, 0.08, color=EDGE, alpha=0.05, zorder=1)

    ax.annotate(f"dry edge   SWCI = {a:.3f} + {b:.3f} × NDVI\n"
                "the driest observed, for a given greenness",
                xy=(0.62, a + b * 0.62), xytext=(0.415, 0.103),
                color=EDGE, fontsize=10.5, fontweight="bold", ha="left", va="center",
                arrowprops=dict(arrowstyle="-", color=EDGE, linewidth=1.0,
                                shrinkA=6, shrinkB=4, alpha=0.75))

    # Worked example, chosen from the dense part of the cloud so its annotation
    # has somewhere to go — the global max sits out at the sparse low-NDVI end.
    mid = df[(df["ndvi_mean"] > 0.55) & (df["ndvi_mean"] < 0.85)]
    ex = mid.loc[mid["dry_dist"].idxmax()]
    x0, y0 = float(ex["ndvi_mean"]), float(ex["swci_mean"])
    t_ = (x0 + b * (y0 - a)) / (1 + b ** 2)
    fx, fy = t_, a + b * t_
    ax.plot([x0, fx], [y0, fy], color=INK, linewidth=1.6, linestyle=(0, (4, 2)), zorder=6)
    ax.scatter([x0], [y0], s=95, facecolors="none", edgecolors=INK, linewidths=1.6, zorder=7)
    ax.annotate("dry_dist — perpendicular\ndistance to the dry edge",
                xy=((x0 + fx) / 2, (y0 + fy) / 2), xytext=(0.335, 0.405),
                color=INK, fontsize=10, ha="left", va="center", linespacing=1.5,
                arrowprops=dict(arrowstyle="-", color=INK, linewidth=1.0,
                                shrinkA=4, shrinkB=4))

    # Gradient direction, drawn perpendicular to the edge in open space.
    n = np.array([-b, 1.0]) / np.sqrt(1 + b ** 2)
    base = np.array([0.268, 0.245])
    tip = base + n * 0.075
    ax.annotate("", xy=tuple(tip), xytext=tuple(base),
                arrowprops=dict(arrowstyle="-|>", color=INK_2, linewidth=1.4,
                                mutation_scale=13))
    ax.text(tip[0], tip[1] + 0.008, "wetter\nless stressed", color=INK_2, fontsize=9.5,
            ha="center", va="bottom", linespacing=1.4)

    med = float(df["ndvi_mean"].median())
    ax.axvline(med, color=MUTED, linewidth=0.9, alpha=0.75, zorder=2)
    ax.text(med - 0.008, 0.464, f"median NDVI {med:.2f}", color=MUTED, fontsize=9,
            ha="right", va="top")

    ax.set_xlabel("NDVI   →  greener, more closed canopy", color=INK_2, fontsize=10.5,
                  labelpad=8)
    ax.set_ylabel("SWCI   →  more canopy water", color=INK_2, fontsize=10.5, labelpad=8)

    # ------------------------------------------------------- small multiples
    years = sorted(df["year"].unique())
    lo_x, hi_x = 0.20, 0.95
    lo_y, hi_y = 0.08, 0.47
    tops = []
    for i, yr in enumerate(years):
        axs = fig.add_subplot(gs[1, i])
        _style(axs)
        g = df[df["year"] == yr]
        axs.plot(xs, a + b * xs, color=EDGE, linewidth=1.4, zorder=4)
        axs.scatter(g["ndvi_mean"], g["swci_mean"], s=11, c=SERIES, alpha=0.6,
                    linewidths=0.0, zorder=3)
        axs.set_xlim(lo_x, hi_x)
        axs.set_ylim(lo_y, hi_y)
        axs.set_title(f"{int(yr)}", color=INK, fontsize=11, fontweight="bold", pad=6)
        axs.text(0.5, -0.30, f"CMD {g['CMD_sm'].mean():.0f}   ·   median dry_dist "
                 f"{g['dry_dist'].median():.3f}",
                 transform=axs.transAxes, color=MUTED, fontsize=8.5, ha="center")
        if i:
            axs.set_yticklabels([])
        tops.append(axs.get_position().y1)

    # The title is baked in only for the standalone PNG (the README embeds it
    # under a caption of its own, but the image also gets read on its own). In
    # the manuscript a LaTeX caption already carries the title, and repeating it
    # is the most-flagged figure fault in review — so it is dropped and the
    # remaining blocks slide up into the space it occupied.
    if standalone:
        fig.text(0.075, 0.965, "How CDEI is measured", color=INK, fontsize=19,
                 fontweight="bold", ha="left", va="top")
        y_sub, y_meta = 0.928, 0.876
    else:
        y_sub, y_meta = 0.965, 0.913

    # The explanatory line stays in both: it explains the construction rather
    # than restating the caption, and the figure is unreadable without it.
    fig.text(0.075, y_sub,
             "Every corridor-summer placed by greenness against canopy water. Distance from the fitted dry edge is how far it sits\n"
             "from being as dry as its greenness allows — that distance, divided by relative warmth, is CDEI.",
             color=INK_2, fontsize=11, ha="left", va="top", linespacing=1.6)
    fig.text(0.075, y_meta,
             f"{len(df)} corridor-summers  ·  153 Surrey GIN corridors × {len(years)} summers  ·  "
             "dry edge fitted by assemble.dry_edge (12 NDVI bins, 5th percentile)  ·  "
             "corridors cluster in the closed-canopy end, where the wet-to-dry range is narrowest",
             color=MUTED, fontsize=9.5, ha="left", va="top")
    fig.text(0.075, max(tops) + 0.052,
             "The same corridors, summer by summer — the whole cloud shifts together as the climate does, "
             "while the spread between corridors stays put.",
             color=INK_2, fontsize=10.5, ha="left", va="bottom")

    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, facecolor=SURFACE, bbox_inches="tight", pad_inches=0.28)
    print(f"wrote {out}")
    print(f"  dry edge: SWCI = {a:.4f} + {b:.4f} * NDVI")
    print(f"  rows {len(df)}  years {years}")


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("-o", "--out", type=Path, default=OUT)
    p.add_argument("--no-title", action="store_true",
                   help="omit the baked-in title, for the manuscript where a "
                        "LaTeX caption already carries it")
    a = p.parse_args()
    main(a.out, standalone=not a.no_title)
