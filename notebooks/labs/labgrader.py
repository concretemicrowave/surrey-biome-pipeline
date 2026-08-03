"""Autograder for the ML labs, and the receipt codes that carry a result to the
Learning Centre.

Each lab ends with ``grade_lab(n, globals())``. That runs a handful of checks
against the functions *you* wrote in the notebook, prints what passed, and emits
a short code::

    LAB3-3o3-1f4c9a2b

Paste it into the **Labs** tab of ``docs/learn/index.html``. The tab recomputes
the same hash and refuses a code whose parts have been edited, which is enough
to stop a careless paste — it is *not* security. This file is right here and you
can read it. The point is that the tab shows work you actually ran, not that it
would survive someone determined to cheat themselves.

Checks are deliberately loose about *how* you got there. They compare your
answer to a reference within a tolerance, so a different-but-correct
implementation passes. What they will not accept is a function that returns a
constant, so the tolerances are tight enough to require the real computation.

Run a lab from anywhere::

    from labgrader import grade_lab, panel
    df = panel()
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

# The labs import this module by sitting next to it; a notebook's cwd is its own
# directory, so this is usually redundant. It is here so that a notebook moved
# elsewhere, or a kernel started from the repo root, still resolves the import.
_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

# Resolved through the installed package rather than from this file's location,
# so a copied or moved labgrader.py still finds the real panel — see the
# "Paths are cwd-independent" note in CLAUDE.md.
try:
    from src.pipeline import paths as _paths
    PANEL = _paths.FEATURES
except Exception:  # package not installed; fall back to the repo layout
    PANEL = _HERE.parents[1] / "data" / "processed" / "features.parquet"

SALT = "surrey-labs-v1"

# The target column. The panel calls it `tvwsi` for historical reasons; the
# preprint calls the same quantity CDEI. Same numbers, two names — worth knowing
# before a judge asks why the code and the paper disagree.
TARGET = "tvwsi"

CLIMATE = [
    "CMD_sm", "CMD_sm_anom", "DD18_sm", "Eref_sm", "Eref_sm_anom", "PPT_sm",
    "PPT_sm_anom", "Rad_sm", "Tmax_sm", "Tmax_sm_anom", "Tmin_sm",
    "Tmin_sm_anom", "logPPT_sm", "novelty",
]


def panel(path: Path | None = None) -> pd.DataFrame:
    """The Surrey panel: 612 rows = 153 polygons x 4 summers."""
    p = Path(path) if path else PANEL
    if not p.exists():
        raise FileNotFoundError(
            f"{p} is missing. The labs read the real panel; rebuild it with\n"
            f"    .venv/bin/python -m src.pipeline.assemble -v"
        )
    return pd.read_parquet(p).reset_index(drop=True)


# --------------------------------------------------------------------------- #
# Receipt codes
# --------------------------------------------------------------------------- #
def _fnv1a(s: str) -> int:
    """FNV-1a, 32-bit. Chosen because it is four lines in Python and four lines
    in JavaScript, so the Learning Centre can verify a code with no library."""
    h = 0x811C9DC5
    for byte in s.encode("utf-8"):
        h ^= byte
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def receipt(lab: int, passed: int, total: int) -> str:
    body = f"LAB{lab}-{passed}o{total}"
    return f"{body}-{_fnv1a(SALT + '|' + body):08x}"


# --------------------------------------------------------------------------- #
# Check helpers
# --------------------------------------------------------------------------- #
class CheckFailed(Exception):
    pass


def _need(ns: dict, name: str):
    fn = ns.get(name)
    if fn is None:
        raise CheckFailed(f"you have not defined `{name}` yet")
    return fn


def _close(got, want, tol=1e-6, what="value"):
    got_a, want_a = np.asarray(got, dtype=float), np.asarray(want, dtype=float)
    if got_a.shape != want_a.shape:
        raise CheckFailed(f"{what}: shape {got_a.shape}, expected {want_a.shape}")
    if not np.allclose(got_a, want_a, rtol=tol, atol=tol):
        bad = np.abs(got_a - want_a)
        raise CheckFailed(
            f"{what}: off by up to {np.max(bad):.3g} "
            f"(got {np.ravel(got_a)[:3]}…, expected {np.ravel(want_a)[:3]}…)")


# --------------------------------------------------------------------------- #
# Reference implementations — what the checks compare against
# --------------------------------------------------------------------------- #
def _ref_spread_ratio(df, col):
    between_corridor = df.groupby("id")[col].mean().std(ddof=0)
    between_year = df.groupby("year")[col].mean().std(ddof=0)
    return float(between_corridor / between_year)


def _ref_dry_edge(ndvi, swci, n_bins=12, q=0.05, min_per_bin=8):
    ok = np.isfinite(ndvi) & np.isfinite(swci)
    ndvi, swci = np.asarray(ndvi)[ok], np.asarray(swci)[ok]
    edges = np.quantile(ndvi, np.linspace(0, 1, n_bins + 1))
    xs, ys = [], []
    for lo, hi in zip(edges[:-1], edges[1:]):
        sel = (ndvi >= lo) & (ndvi <= hi)
        if sel.sum() >= min_per_bin:
            xs.append(ndvi[sel].mean())
            ys.append(np.quantile(swci[sel], q))
    b, a = np.polyfit(np.asarray(xs), np.asarray(ys), 1)
    return float(a), float(b)


def _ref_blocks(df, n_blocks=5, seed=26910):
    from sklearn.cluster import KMeans
    corr = df.groupby("id")[["x_m", "y_m"]].first()
    km = KMeans(n_clusters=n_blocks, random_state=seed, n_init=10)
    lab = pd.Series(km.fit_predict(corr.to_numpy()), index=corr.index)
    return df["id"].map(lab)


def _ref_ridge(X, y, lam):
    X, y = np.asarray(X, float), np.asarray(y, float)
    xbar, ybar = X.mean(0), y.mean()
    Xc, yc = X - xbar, y - ybar
    w = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)
    return w, float(ybar - xbar @ w)


def _ref_upscale(df, features, cell_m=4000.0):
    out = df.copy()
    cell = (np.floor(out["x_m"] / cell_m).astype(int).astype(str) + "_" +
            np.floor(out["y_m"] / cell_m).astype(int).astype(str))
    out[features] = out.assign(_c=cell).groupby(["_c", "year"])[features].transform("mean")
    return out


def _ref_var_removed(fine, coarse, feature):
    within = fine.groupby("year")[feature].transform("mean")
    vf = float(((fine[feature] - within) ** 2).mean())
    vc = float(((coarse[feature] - within) ** 2).mean())
    return 1 - vc / vf


def _ref_paired_bootstrap(d, n_boot=10000, seed=26910):
    rng = np.random.default_rng(seed)
    boot = rng.choice(np.asarray(d, float), size=(n_boot, len(d)), replace=True).mean(axis=1)
    return float(np.percentile(boot, 2.5)), float(np.percentile(boot, 97.5))


# --------------------------------------------------------------------------- #
# The checks, per lab
# --------------------------------------------------------------------------- #
def _lab1(ns, df):
    def rows():
        fn = _need(ns, "rows_in_year")
        for yr in (2023, 2025):
            _close(fn(df, yr), int((df["year"] == yr).sum()), what=f"rows_in_year(df, {yr})")

    def spread():
        fn = _need(ns, "spread_ratio")
        for col in ("Tmax_sm", TARGET):
            _close(fn(df, col), _ref_spread_ratio(df, col), tol=0.02,
                   what=f"spread_ratio(df, {col!r})")

    def edge():
        fn = _need(ns, "fit_dry_edge")
        got = fn(df["ndvi_mean"].to_numpy(), df["swci_mean"].to_numpy())
        want = (float(df["dry_edge_a"].iloc[0]), float(df["dry_edge_b"].iloc[0]))
        _close(got, want, tol=0.03, what="fit_dry_edge(ndvi, swci)")

    return [("rows_in_year counts the panel", rows),
            ("spread_ratio finds the orthogonal axes", spread),
            ("fit_dry_edge recovers the published edge", edge)]


def _lab2(ns, df):
    rng = np.random.default_rng(7)
    yt = rng.normal(size=200)
    yp = yt + rng.normal(scale=0.4, size=200)

    def mse():
        fn = _need(ns, "mse")
        _close(fn(yt, yp), float(np.mean((yt - yp) ** 2)), what="mse")

    def r2():
        fn = _need(ns, "r2")
        want = 1 - np.sum((yt - yp) ** 2) / np.sum((yt - yt.mean()) ** 2)
        _close(fn(yt, yp), float(want), tol=1e-4, what="r2")

    def line():
        fn = _need(ns, "best_line")
        x = df["PPT_sm"].to_numpy()
        y = df[TARGET].to_numpy()
        w, b = fn(x, y)
        mine = np.mean((y - (w * x + b)) ** 2)
        bw, bb = np.polyfit(x, y, 1)
        best = np.mean((y - (bw * x + bb)) ** 2)
        if mine > best * 1.02:
            raise CheckFailed(
                f"best_line's MSE is {mine:.6g}; the least-squares line gets "
                f"{best:.6g}. Your search is not finding the bottom.")

    return [("mse", mse), ("r2", r2), ("best_line finds the least-squares fit", line)]


def _lab3(ns, df):
    def blocks():
        fn = _need(ns, "assign_blocks")
        b = pd.Series(fn(df, 5, 26910)).reset_index(drop=True)
        if b.nunique() != 5:
            raise CheckFailed(f"assign_blocks gave {b.nunique()} distinct blocks, expected 5")
        per = df.assign(_b=b.to_numpy()).groupby("id")["_b"].nunique()
        if (per > 1).any():
            n = int((per > 1).sum())
            raise CheckFailed(
                f"{n} corridors are split across blocks. Block the *corridor*, "
                f"not the row — otherwise 2023 trains on what 2024 tests.")

    def cv():
        fn = _need(ns, "blocked_cv_rmse")
        b = _ref_blocks(df)
        got = fn(df, ["PPT_sm", "Tmax_sm", "CMD_sm"], TARGET, b)
        # Reference: ridge on the same folds, so any sane linear learner lands close.
        errs = []
        for k in sorted(b.unique()):
            te = (b == k).to_numpy()
            w, i0 = _ref_ridge(df.loc[~te, ["PPT_sm", "Tmax_sm", "CMD_sm"]],
                               df.loc[~te, TARGET], 1e-6)
            pred = df.loc[te, ["PPT_sm", "Tmax_sm", "CMD_sm"]].to_numpy() @ w + i0
            errs.append(np.sqrt(np.mean((df.loc[te, TARGET].to_numpy() - pred) ** 2)))
        _close(got, float(np.mean(errs)), tol=0.25, what="blocked_cv_rmse")

    def gap():
        rnd, blk = ns.get("RANDOM_CV_RMSE"), ns.get("BLOCKED_CV_RMSE")
        if rnd is None or blk is None:
            raise CheckFailed("set RANDOM_CV_RMSE and BLOCKED_CV_RMSE from your own runs")
        if not blk > rnd:
            raise CheckFailed(
                f"you recorded blocked={blk:.5g} and random={rnd:.5g}. Blocked CV "
                f"should look *worse*; that gap is the autocorrelation random "
                f"splits were scoring as skill. Re-run and record what you got.")

    return [("assign_blocks keeps corridors whole", blocks),
            ("blocked_cv_rmse scores held-out blocks", cv),
            ("you measured the random-vs-blocked gap", gap)]


def _lab4(ns, df):
    X = df[["PPT_sm", "Tmax_sm", "CMD_sm", "Eref_sm"]].to_numpy()
    y = df[TARGET].to_numpy()

    def cond():
        got = ns.get("COND_CLIMATE")
        if got is None:
            raise CheckFailed("set COND_CLIMATE to the condition number of the climate matrix")
        want = float(np.linalg.cond(df[CLIMATE].to_numpy()))
        if not (want / 3 < float(got) < want * 3):
            raise CheckFailed(
                f"COND_CLIMATE = {got:.3g}, expected around {want:.3g}")

    def solve():
        fn = _need(ns, "ridge_solve")
        for lam in (1e-6, 1.0):
            w, b = fn(X, y, lam)
            rw, rb = _ref_ridge(X, y, lam)
            _close(w, rw, tol=1e-3, what=f"ridge_solve coefficients (lam={lam})")
            _close(b, rb, tol=1e-3, what=f"ridge_solve intercept (lam={lam})")

    def shrink():
        fn = _need(ns, "ridge_solve")
        small = np.linalg.norm(fn(X, y, 1e-8)[0])
        big = np.linalg.norm(fn(X, y, 1e3)[0])
        if not big < small:
            raise CheckFailed(
                "a large lambda should shrink the coefficients. Yours grew, so "
                "the penalty is probably on the wrong side of the equation.")

    return [("you measured the collinearity", cond),
            ("ridge_solve matches the normal equations", solve),
            ("lambda actually shrinks the coefficients", shrink)]


def _lab5(ns, df):
    feats = ["PPT_sm", "Tmax_sm", "CMD_sm"]

    def up():
        fn = _need(ns, "upscale")
        got = fn(df, feats, 4000.0)
        want = _ref_upscale(df, feats, 4000.0)
        _close(got[feats].to_numpy(), want[feats].to_numpy(), tol=1e-8, what="upscale")

    def keeps_time():
        fn = _need(ns, "upscale")
        got = fn(df, feats, 4000.0)
        for f in feats:
            _close(got.groupby("year")[f].mean().to_numpy(),
                   df.groupby("year")[f].mean().to_numpy(), tol=1e-8,
                   what=f"year means of {f} after upscaling")

    def removed():
        fn = _need(ns, "var_removed")
        coarse = _ref_upscale(df, feats, 4000.0)
        for f in feats:
            _close(fn(df, coarse, f), _ref_var_removed(df, coarse, f), tol=0.02,
                   what=f"var_removed(..., {f!r})")

    return [("upscale averages within cell-and-year", up),
            ("upscaling destroys space, not time", keeps_time),
            ("var_removed quantifies the contrast", removed)]


def _lab6(ns, df):
    d = np.array([-0.0004, 0.0002, -0.0011, 0.0006, -0.0002, 0.0009,
                  -0.0007, 0.0001, 0.0004, -0.0003])

    def boot():
        fn = _need(ns, "paired_bootstrap")
        _close(fn(d, 10000, 26910), _ref_paired_bootstrap(d), tol=5e-3,
               what="paired_bootstrap")

    def excl():
        fn = _need(ns, "excludes_zero")
        for lo, hi, want in ((-0.1, -0.01, True), (0.01, 0.1, True), (-0.01, 0.02, False)):
            if bool(fn(lo, hi)) is not want:
                raise CheckFailed(f"excludes_zero({lo}, {hi}) should be {want}")

    def call():
        v = ns.get("MY_VERDICT")
        if not isinstance(v, str):
            raise CheckFailed("set MY_VERDICT to the word your own numbers support")
        if v.strip().upper() != "INCONCLUSIVE":
            raise CheckFailed(
                f"you wrote {v!r}. Re-read the two preconditions: neither model "
                f"has skill, and the upscale removed ~12% of spatial variance. "
                f"A null under those conditions is not a null *result*.")

    return [("paired_bootstrap reproduces the interval", boot),
            ("excludes_zero reads an interval correctly", excl),
            ("you reached the right verdict, for the right reason", call)]


BUILDERS = {1: _lab1, 2: _lab2, 3: _lab3, 4: _lab4, 5: _lab5, 6: _lab6}

TITLES = {
    1: "The panel",
    2: "Your first model",
    3: "The lie of random splits",
    4: "Ridge, and the coefficients you cannot trust",
    5: "Model A versus Model B",
    6: "Is the difference real?",
}


def grade_lab(lab: int, ns: dict, df: pd.DataFrame | None = None) -> str:
    """Run lab ``lab``'s checks against notebook namespace ``ns``.

    Call it as ``grade_lab(3, globals())``. Prints a per-check report and the
    receipt code to paste into the Learning Centre's Labs tab.
    """
    if lab not in BUILDERS:
        raise ValueError(f"no lab {lab}; labs are {sorted(BUILDERS)}")
    if df is None:
        df = ns.get("df")
        if not isinstance(df, pd.DataFrame):
            df = panel()

    checks = BUILDERS[lab](ns, df)
    passed = 0
    print(f"Lab {lab} — {TITLES[lab]}")
    print("-" * 58)
    for name, fn in checks:
        try:
            fn()
        except CheckFailed as exc:
            print(f"  ✗  {name}\n       {exc}")
        except Exception as exc:  # a student function that raised on its own
            print(f"  ✗  {name}\n       your code raised {type(exc).__name__}: {exc}")
        else:
            passed += 1
            print(f"  ✓  {name}")

    total = len(checks)
    code = receipt(lab, passed, total)
    print("-" * 58)
    print(f"  {passed}/{total} checks passed")
    if passed == total:
        print(f"\n  Paste into the Labs tab:   {code}")
    else:
        print(f"\n  Partial receipt (the tab will show it as incomplete):\n  {code}")
    return code
