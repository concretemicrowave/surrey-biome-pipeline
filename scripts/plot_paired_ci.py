"""Render the paired ΔRMSE result — the statistical proof that the coarse model won.

This is the figure the Phase 3b verdict actually rests on, and until now it existed
only as a number in the text. A resolution claim stands or falls on whether the
paired confidence interval clears zero, so the interval is what should be drawn.

Each row is one random seed of the spatially-blocked CV at 25 km: the point is
that seed's paired ΔRMSE = RMSE_fine − RMSE_coarse, the bar is its bootstrap 95%
interval. Positive means the *coarse* model had lower error. None of the twenty
intervals touches zero, which is a stronger visual statement than any single
interval could make — one interval clearing zero is a result, twenty clearing it
unanimously is a robustness argument.

Note what is deliberately NOT plotted. The twelve 12 km seeds also have intervals
excluding zero, but they return INCONCLUSIVE because Model B's R² goes negative
there and fails the skill gate. Mixing them in would imply twelve more
falsifications than the experiment supports.

    .venv/bin/python scripts/plot_paired_ci.py
    .venv/bin/python scripts/plot_paired_ci.py --mode poster -o <path>
"""

from __future__ import annotations

import matplotlib

matplotlib.use("Agg")

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

from src.pipeline import paths, viz

SEEDS_25KM = paths.PROCESSED / "seed_sensitivity_25km.csv"
OUT = paths.DOCS / "figures" / "paired_ci.png"


def main(out: Path = OUT, *, standalone: bool = True, mode: str = "paper",
         seeds_csv: Path = SEEDS_25KM,
         place_at: tuple[float, float] | None = None,
         base_pt: float = 17.0) -> None:
    """Render the figure.

    ``place_at=(w_in, h_in)`` authors the figure at the physical size it will
    occupy on a printed board, with type in real board points. This is not the
    same job as ``mode="poster"``, and conflating them is how the first version
    of this figure ended up illegible. Poster mode assumes a figure fills a
    large area, so it scales type *up* relative to a canvas that is itself
    growing. A figure dropped into a 7-inch slot on a 44-inch board is being
    scaled *down* by the layout — here that was 0.64x, which turned 14.9 pt axis
    labels into 9.5 pt on paper. Authoring at the destination size makes the
    scale factor exactly 1.0, so ``base_pt`` is what the judge actually reads.
    """
    viz.set_mode(mode)
    plt.rcParams.update(viz.rcparams())
    scaled = place_at is None          # is the layout going to shrink this?
    if place_at is not None:
        plt.rcParams.update({
            "font.size": base_pt, "axes.labelsize": base_pt,
            "axes.titlesize": base_pt * 1.25,
            "xtick.labelsize": base_pt * 0.88, "ytick.labelsize": base_pt * 0.88,
            "savefig.dpi": 600,
        })

    df = pd.read_csv(seeds_csv).sort_values("d_rmse").reset_index(drop=True)
    n = len(df)

    # Absolute point sizes when authoring at destination size; viz-scaled otherwise.
    P = (lambda x: viz.pt(x)) if scaled else (lambda x: x * base_pt / 11.0)

    fig, ax = plt.subplots(figsize=place_at or viz.figsize(9.0, 6.4))

    # Plotted in units of 1e-3. The raw values need five decimal places, and
    # "0.00025" repeated across an axis is unreadable once the type is large
    # enough to matter — which is the whole point of the destination-size path.
    K = 1e3
    lo_ci, hi_ci, pt_est = df["ci_lo"] * K, df["ci_hi"] * K, df["d_rmse"] * K

    # The unreachable half. Shading it makes the emptiness on the left the point
    # of the figure rather than something the reader has to notice on their own.
    ax.axvspan(-1, 0, color=viz.SERIES, alpha=0.055, zorder=0)
    ax.axvline(0, color=viz.INK, lw=P(2.2), zorder=4)

    y = range(n)
    ax.hlines(y, lo_ci, hi_ci, color=viz.CRITICAL, lw=P(2.6), alpha=0.75, zorder=3)
    ax.plot(pt_est, y, "o", color=viz.CRITICAL, markersize=P(7),
            markeredgecolor="white", markeredgewidth=P(1.0), zorder=5)

    ax.set_yticks([])
    ax.set_ylim(-1.6, n + 0.2)
    ax.set_xlim(min(lo_ci.min(), 0) - 0.22, hi_ci.max() * 1.06)
    ax.set_xticks([0.0, 0.5, 1.0, 1.5])
    ax.set_xlabel("Paired ΔRMSE  (×10⁻³)      RMSE fine − RMSE coarse")
    ax.spines["left"].set_visible(False)

    ax.annotate("← fine better\n(nothing here)",
                xy=(0, n - 0.6), xytext=(-P(8), 0),
                textcoords="offset points", ha="right", va="center",
                fontsize=P(10.5), color=viz.SERIES, linespacing=1.35)
    ax.annotate("coarse model better →", xy=(hi_ci.max() * 0.99, -0.85),
                ha="right", va="center", fontsize=P(11),
                fontweight="bold", color=viz.CRITICAL)

    if standalone:
        ax.set_title("Twenty random seeds, twenty intervals, none touching zero",
                     pad=P(26))
        ax.text(0.0, viz.stack(1.008, anchor=1.0),
                f"Each row is one seed of the spatially-blocked cross-validation at "
                f"25 km (n = {n}); bar = bootstrap 95% interval.",
                transform=ax.transAxes, fontsize=P(9), color=viz.INK_2)
        ax.text(0.5, viz.stack(-0.13, anchor=0.0),
                "12 km seeds also exclude zero but fail the skill gate, so they are "
                "reported INCONCLUSIVE and are not shown here.",
                transform=ax.transAxes, ha="center", va="top",
                fontsize=P(8), color=viz.MUTED)

    out.parent.mkdir(parents=True, exist_ok=True)
    # Explicit dpi wins over the rcParam, so the destination-size path has to
    # name its own — viz.save_dpi() reports the *mode's* dpi, which is 200 here
    # because place_at deliberately leaves the mode on "paper".
    dpi = 600 if place_at is not None else viz.save_dpi()
    fig.savefig(out, bbox_inches="tight", dpi=dpi)
    plt.close(fig)
    print(f"wrote {out}  ({dpi} dpi"
          f"{f', authored at {place_at[0]}x{place_at[1]}in for placement' if place_at else f', mode {viz.get_mode()}'})")
    print(f"  {n} seeds  ΔRMSE {df['d_rmse'].min():+.6f}..{df['d_rmse'].max():+.6f}"
          f"  all CI lo > 0: {bool((df['ci_lo'] > 0).all())}")


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("-o", "--out", type=Path, default=OUT)
    p.add_argument("--no-title", action="store_true",
                   help="omit the baked-in title, for a caption-bearing context")
    p.add_argument("--mode", choices=viz.MODES, default="paper")
    p.add_argument("--place-at", type=float, nargs=2, metavar=("W_IN", "H_IN"),
                   default=None,
                   help="author at the physical size this figure will occupy on a "
                        "printed board, so --base-pt is what the reader actually "
                        "sees; use instead of --mode poster for a placed figure")
    p.add_argument("--base-pt", type=float, default=17.0,
                   help="body point size on the printed board (default 17)")
    a = p.parse_args()
    main(a.out, standalone=not a.no_title, mode=a.mode,
         place_at=tuple(a.place_at) if a.place_at else None, base_pt=a.base_pt)
