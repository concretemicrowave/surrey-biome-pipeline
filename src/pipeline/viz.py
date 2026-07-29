"""Shared figure palette and map furniture.

Every figure in this project used to carry its own colour constants. There were
two sets: ``corridor_stress`` had one (``#1a1a1a`` ink, ``#b30000`` warning) and
``scripts/plot_cdei_feature_space`` had another (``#0b0b0b`` ink, ``#d03b3b``
critical). Two near-identical reds and two near-identical near-blacks read as a
mistake rather than a choice, so both now import from here.

Sequential vs status
--------------------
Stress is a **magnitude**, so it gets a sequential ramp: one hue, light to dark
(``STRESS_CMAP``). Never a rainbow — a rainbow implies category boundaries that
the percentile does not have.

The exploratory-data warning is a **status**, not a series, so it never borrows
a step from that ramp. It ships as an icon plus a full sentence rather than as
colour alone, which is what keeps it legible in greyscale and to a colourblind
reader. Only the icon is tinted; the sentence stays in ink. That also stops a
red caption under a red choropleth from reading as part of the legend.
"""

from __future__ import annotations

# --- Surfaces and ink -------------------------------------------------------
SURFACE = "#fcfcfb"
INK = "#0b0b0b"   # primary text, dry-edge line, rank labels
INK_2 = "#52514e"   # secondary text: subtitles, annotations
MUTED = "#898781"   # provenance footers, de-emphasised metadata
GRID = "#e1e0d9"
AXIS = "#c3c2b7"

# --- Data marks -------------------------------------------------------------
SERIES = "#2a78d6"   # categorical slot 1 — the corridor-summer cloud
CRITICAL = "#d03b3b"   # status only: the dry edge (a "maximally stressed" limit)
# and the warning glyph. Never a data series.
STRESS_CMAP = "Reds"     # sequential: stress percentile, light -> dark

# Outline for polygons and markers drawn over the choropleth.
POLY_EDGE = "#898781"
CONTEXT = "#e1e0d9"   # un-emphasised "all corridors" outline beneath the data

EXPLORATORY_NOTE = (
    "Exploratory: between-corridor ranking is confounded with canopy density, "
    "not independently validated (see README)"
)


def rcparams() -> dict:
    """Matplotlib settings shared by every figure in the project."""
    return {
        "figure.dpi": 130, "savefig.dpi": 200, "font.size": 11,
        "axes.spines.top": False, "axes.spines.right": False,
        "axes.titlesize": 13, "axes.titleweight": "bold",
        "figure.facecolor": "white", "axes.facecolor": "white",
        "text.color": INK, "axes.labelcolor": INK,
        "xtick.color": INK_2, "ytick.color": INK_2,
    }


def _nice_round(x: float) -> float:
    """Largest 1/2/5 x 10^n at or below ``x`` — scale bars want round numbers."""
    from math import floor, log10
    if x <= 0:
        return 1.0
    mag = 10 ** floor(log10(x))
    for step in (5, 2, 1):
        if step * mag <= x:
            return step * mag
    return mag


def scale_bar(ax, *, fraction: float = 0.30, pad: float = 0.04) -> None:
    """Draw a metric scale bar in the lower-left of a projected map.

    Assumes the axis is in a **metre-based CRS** — EPSG:26910 throughout this
    project. In a geographic CRS the bar would be meaningless, because a degree
    is not a fixed distance, which is why the pipeline reprojects before it
    plots rather than after.

    Length is the largest round number at or below ``fraction`` of the map
    width, so the bar reads 5 km rather than 4.7 km. ``fraction`` is 0.30
    rather than a quarter because rounding down from a quarter of Surrey's
    17.3 km extent lands on 2 km, which is a stubby bar; 30% reaches 5 km.
    """
    x0, x1 = ax.get_xlim()
    y0, y1 = ax.get_ylim()
    length = _nice_round((x1 - x0) * fraction)

    bx = x0 + (x1 - x0) * pad
    by = y0 + (y1 - y0) * pad

    ax.plot([bx, bx + length], [by, by], color=INK, lw=2.4,
            solid_capstyle="butt", zorder=8)
    for end in (bx, bx + length):                      # end ticks
        ax.plot([end, end], [by, by + (y1 - y0) * 0.008], color=INK, lw=2.4,
                solid_capstyle="butt", zorder=8)

    label = f"{length / 1000:g} km" if length >= 1000 else f"{length:g} m"
    ax.text(bx + length / 2, by + (y1 - y0) * 0.014, label,
            ha="center", va="bottom", fontsize=9, color=INK, zorder=8)


def north_arrow(ax, *, x: float = 0.055, y: float = 0.87,
                length: float = 0.055) -> None:
    """Draw a north arrow in axes coordinates.

    Upper-left by default, which is empty on the Surrey extent — the lower-right
    corner that a north arrow usually takes is occupied by corridors there, and
    an arrow drawn over the data is worse than no arrow.

    This is **grid north**, not true north: the map is drawn in UTM zone 10N,
    where meridian convergence over Surrey is under a degree, but the arrow is
    parallel to the grid rather than to the meridian and should be described
    that way if anyone asks.
    """
    ax.annotate(
        "", xy=(x, y + length), xytext=(x, y), xycoords="axes fraction",
        arrowprops=dict(arrowstyle="-|>", color=INK, linewidth=1.6,
                        mutation_scale=14), zorder=8,
    )
    ax.text(x, y + length + 0.012, "N", transform=ax.transAxes,
            ha="center", va="bottom", fontsize=10, fontweight="bold",
            color=INK, zorder=8)
