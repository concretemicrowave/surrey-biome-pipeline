"""Shared figure palette and map furniture.

Every figure in this project used to carry its own colour constants. There were
two sets: ``corridor_stress`` had one (``#1a1a1a`` ink, ``#b30000`` warning) and
``scripts/plot_cdei_feature_space`` had another (``#0b0b0b`` ink, ``#d03b3b``
critical). Two near-identical reds and two near-identical near-blacks read as a
mistake rather than a choice, so both now import from here.

Three roles, kept apart
-----------------------
**Identity** (``ACCENT``, ``ACCENT_PALE``) is structure — titles, headings,
header bars. It comes from the manuscript preamble so the paper and the board
read as one project. **Data** (``SERIES``, ``STRESS_CMAP``) encodes values.
**Status** (``CRITICAL``) marks a limit or a warning and is never a series.

A colour that carries two of those roles carries neither legibly, which is why
the accent is deliberately not in the data palette even though it would look
fine there.

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

# --- Identity ---------------------------------------------------------------
# Lifted from the manuscript preamble (``docs/preprint/latex/main.tex``, where
# they are ``accent`` and ``accentpale``) so the paper, its figures and the
# science-fair board share one identity instead of three.
#
# These are *structural*, not data colours: titles, section headings, header
# bars, tinted blocks. Keeping that separation is the point — a colour that
# means "heading" cannot also mean "a series", or neither reading survives.
ACCENT = "#1f4e5f"        # dark slate-teal: titles, headings, header bars
ACCENT_PALE = "#eef3f5"   # its tint: block fills behind body copy

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


# --- Output modes -----------------------------------------------------------
# "paper"  — the manuscript and deliverable figures. Unchanged, and must stay
#            byte-identical: the preprint is drafted against these.
# "poster" — the same figures for large-format print on a science-fair board.
#
# Two independent knobs, because a poster has two separate problems and only one
# of them is about type.
#
# *Resolution* is fixed by dpi alone. A 9-inch-wide figure saved at 200 dpi is
# 1800 px; blown up to 40 cm on a board that prints at ~114 dpi, which is
# visibly soft. At 600 dpi the same figure prints at ~343 dpi, clear of the
# 300 ppi Youth Science Canada asks for.
#
# *Legibility* is a different axis. A poster is read from further away than a
# page is, so type has to grow faster than the canvas does rather than merely
# with it — scaling both equally is just magnification and buys nothing. So
# FIG_SCALE grows the canvas, TEXT_SCALE grows the type faster, and the ratio
# between them (1.35 / 1.15 ≈ 1.17) is the real relative gain. The canvas grows
# at all only to give the larger type somewhere to go; without it the hand-tuned
# annotations in the map and dry-edge figures collide.
_MODE = "paper"
_FIG_SCALE = {"paper": 1.0, "poster": 1.15}
_TEXT_SCALE = {"paper": 1.0, "poster": 1.35}
_SAVE_DPI = {"paper": 200, "poster": 600}
MODES = tuple(_FIG_SCALE)


def set_mode(mode: str) -> None:
    """Select ``paper`` or ``poster`` output. Affects every figure drawn after."""
    global _MODE
    if mode not in _FIG_SCALE:
        raise ValueError(f"unknown mode {mode!r}; expected one of {MODES}")
    _MODE = mode


def get_mode() -> str:
    return _MODE


def pt(size: float) -> float:
    """Scale a hardcoded point size (font, line width, marker) for the mode.

    Call sites pass their paper-tuned literal through this rather than holding
    two numbers. In ``paper`` mode the factor is exactly 1.0, so the literal is
    returned unchanged and the manuscript figures cannot drift.
    """
    return size * _TEXT_SCALE[_MODE]


def figsize(w: float, h: float) -> tuple[float, float]:
    """Scale a paper-tuned ``figsize`` for the mode."""
    f = _FIG_SCALE[_MODE]
    return (w * f, h * f)


def stack(value: float, *, anchor: float) -> float:
    """Scale an axes-fraction offset that positions text outside the axes.

    The subtitle, caveat and provenance lines are placed at fixed fractions like
    ``1.028`` or ``-0.05``. Those gaps were sized against paper-mode type, so
    growing the type without growing them stacks the lines into each other.
    ``anchor`` is the axis edge the offset is measured from (1.0 above, 0.0
    below); the distance from it scales with the type.

    Paper mode returns the literal untouched rather than multiplying by 1.0, so
    no float round-trip can perturb the manuscript figures.
    """
    if _MODE == "paper":
        return value
    return anchor + (value - anchor) * _TEXT_SCALE[_MODE]


def save_dpi() -> int:
    """Output resolution for ``savefig``.

    Needed explicitly by figures that set ``dpi`` on the Figure itself, since
    matplotlib's ``savefig.dpi`` default of ``"figure"`` would otherwise inherit
    the on-screen value and quietly ignore the mode.
    """
    return _SAVE_DPI[_MODE]


def rcparams() -> dict:
    """Matplotlib settings shared by every figure in the project."""
    rc = {
        "figure.dpi": 130, "savefig.dpi": 200, "font.size": 11,
        "axes.spines.top": False, "axes.spines.right": False,
        "axes.titlesize": 13, "axes.titleweight": "bold",
        "figure.facecolor": "white", "axes.facecolor": "white",
        "text.color": INK, "axes.labelcolor": INK,
        "xtick.color": INK_2, "ytick.color": INK_2,
    }
    if _MODE == "paper":            # returned verbatim, deliberately
        return rc
    s = _TEXT_SCALE[_MODE]
    rc.update({
        "savefig.dpi": _SAVE_DPI[_MODE],
        "font.size": 11 * s,
        "axes.titlesize": 13 * s,
        "axes.labelsize": 11 * s,
        "xtick.labelsize": 11 * s, "ytick.labelsize": 11 * s,
        "legend.fontsize": 11 * s,
        "lines.linewidth": 1.5 * s,
        "axes.linewidth": 0.8 * s,
        "patch.linewidth": 1.0 * s,
    })
    return rc


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

    ax.plot([bx, bx + length], [by, by], color=INK, lw=pt(2.4),
            solid_capstyle="butt", zorder=8)
    for end in (bx, bx + length):                      # end ticks
        ax.plot([end, end], [by, by + (y1 - y0) * 0.008], color=INK, lw=pt(2.4),
                solid_capstyle="butt", zorder=8)

    label = f"{length / 1000:g} km" if length >= 1000 else f"{length:g} m"
    ax.text(bx + length / 2, by + (y1 - y0) * 0.014, label,
            ha="center", va="bottom", fontsize=pt(9), color=INK, zorder=8)


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
        arrowprops=dict(arrowstyle="-|>", color=INK, linewidth=pt(1.6),
                        mutation_scale=pt(14)), zorder=8,
    )
    ax.text(x, y + length + 0.012, "N", transform=ax.transAxes,
            ha="center", va="bottom", fontsize=pt(10), fontweight="bold",
            color=INK, zorder=8)
