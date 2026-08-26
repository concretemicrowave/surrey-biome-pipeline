"""The EM&S graphical abstract: measure f, then read the comparison.

EM&S requires a graphical abstract at submission (Guide for authors, p11). It is
sized for the stated minimum of 531 x 1328 px (h x w) and drawn at exactly the
5 x 13 cm it must be readable at, so legibility is a property of the figure
rather than something checked afterwards.

Elsevier's GenAI policy forbids making a graphical abstract with a
general-purpose generative image tool. This script is matplotlib, so the output
is a reproducible drawing rather than a generated image, which is the route the
policy asks for.

The left panel is a SCHEMATIC, not data: it is one draw from
``precondition_simulation._field``, shown fine and then block-averaged, purely to
show what "variance removed" means to a reader who has not read the paper. The
two markers on the axis ARE the paper's measured values (0.123 at 4 km over
Surrey, 0.484 at 25 km over the transect). Nothing else on the figure is a
number.

    .venv/bin/python scripts/plot_graphical_abstract.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyArrowPatch

sys.path.insert(0, "scripts")
import precondition_simulation as S  # noqa: E402
from src.pipeline import viz  # noqa: E402

OUT = Path("docs/papers/paper-a/ems/graphical-abstract.pdf")

CM = 1 / 2.54
W_CM, H_CM = 13.0, 5.0          # the size the guide says it must be readable at
DPI = 400                        # 400 dpi -> 2047 x 787 px, over the 1328 x 531 floor

SURREY_F, TRANSECT_F = 0.123, 0.484
GATE = 0.4                       # the calibrated floor, see Section 3.3


def _fields(seed: int = 4, n: int = 128, block: int = 32):
    """One schematic field, fine and block-averaged, both on the same scale."""
    fine = S._field(np.random.default_rng(seed), 2_500.0)[:n, :n]
    fine = (fine - fine.mean()) / fine.std()
    coarse = (fine.reshape(n // block, block, n // block, block)
              .mean(axis=(1, 3)).repeat(block, 0).repeat(block, 1))
    return fine, coarse


def main(out: Path = OUT) -> Path:
    rc = viz.rcparams()
    # The house rcparams are tuned for a full-width manuscript figure. This one
    # is 5 cm tall, so every default here is set again at the size it has to be
    # legible at rather than scaled down from a paper literal.
    rc.update({"font.size": 5.5, "axes.titlesize": 6, "axes.titleweight": "normal",
               "axes.labelsize": 5.5, "xtick.labelsize": 5, "ytick.labelsize": 5})
    plt.rcParams.update(rc)

    fig = plt.figure(figsize=(W_CM * CM, H_CM * CM), dpi=DPI)
    fig.patch.set_facecolor("white")

    fine, coarse = _fields()
    lim = float(np.abs(fine).max())

    # --- left: what the coarsening removes -----------------------------------
    fig.text(0.025, 0.93, "Before fitting any model", ha="left", va="center",
             fontsize=6, color=viz.ACCENT, fontweight="bold")
    for i, (arr, lab) in enumerate(((fine, "predictors"), (coarse, "coarsened"))):
        ax = fig.add_axes([0.025 + i * 0.105, 0.44, 0.088, 0.23])
        ax.imshow(arr, cmap="RdBu_r", vmin=-lim, vmax=lim, interpolation="nearest")
        ax.set_xticks([]); ax.set_yticks([])
        for sp in ax.spines.values():
            sp.set_visible(True); sp.set_color(viz.AXIS); sp.set_linewidth(0.5)
        ax.set_title(lab, fontsize=5, pad=2, color=viz.INK)
    fig.add_artist(FancyArrowPatch((0.117, 0.555), (0.128, 0.555),
                                   transform=fig.transFigure, arrowstyle="-|>",
                                   mutation_scale=5, color=viz.MUTED, lw=0.7))
    fig.text(0.113, 0.38, "$f$ = spatial variance removed", ha="center",
             va="top", fontsize=5.5, color=viz.INK)

    # --- right: the calibrated axis, with both extents on it -----------------
    fig.text(0.30, 0.93, "A resolution comparison can be unable to answer its "
             "own question", ha="left", va="center", fontsize=6.5,
             color=viz.INK, fontweight="bold")

    ax = fig.add_axes([0.30, 0.26, 0.675, 0.56])
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.axvspan(0, GATE, color=viz.CRITICAL, alpha=0.10, lw=0)
    ax.axvspan(GATE, 1, color=viz.ACCENT, alpha=0.10, lw=0)
    ax.axvline(GATE, color=viz.MUTED, lw=0.8, ls=(0, (3, 2)))
    ax.text(GATE, 1.03, f"$f \\approx {GATE}$", ha="center", va="bottom",
            fontsize=5, color=viz.MUTED, transform=ax.get_xaxis_transform())

    ax.text(GATE / 2, 0.88, "a null carries no information", ha="center",
            va="center", fontsize=5.5, color=viz.CRITICAL)
    ax.text((1 + GATE) / 2, 0.88, "the comparison can be read", ha="center",
            va="center", fontsize=5.5, color=viz.ACCENT)

    # Surrey's label is centred on its marker and the transect's runs right of
    # its own, because a shared alignment puts one of them across the f = 0.4
    # rule: centring the transect crosses it, and running Surrey right reaches it.
    for f, label, verdict, colour, ha, dx in (
            (SURREY_F, "Surrey, 4 km", "unanswerable", viz.CRITICAL, "center", 6),
            (TRANSECT_F, "transect, 25 km", "not supported", viz.ACCENT, "left", 5)):
        ax.plot([f], [0.24], marker="o", ms=3.5, color=colour, zorder=3,
                mec="white", mew=0.7)
        ax.annotate(f"{label}\n$f$ = {f:.3f}, {verdict}", (f, 0.24),
                    textcoords="offset points", xytext=(dx, 4), ha=ha, va="bottom",
                    fontsize=5, color=viz.INK, linespacing=1.35)

    ax.set_yticks([])
    ax.set_xticks([0, 0.25, 0.5, 0.75, 1.0])
    ax.tick_params(labelsize=5, length=2, pad=1.2)
    ax.set_xlabel("fraction of predictor spatial variance the coarsening removes",
                  fontsize=5.5, labelpad=1.5)
    for side in ("left", "top", "right"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color(viz.AXIS); ax.spines["bottom"].set_linewidth(0.6)

    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=DPI, facecolor="white")
    fig.savefig(out.with_suffix(".png"), dpi=DPI, facecolor="white")
    plt.close(fig)
    return out


if __name__ == "__main__":
    p = main()
    print(f"wrote {p} and {p.with_suffix('.png')}")
