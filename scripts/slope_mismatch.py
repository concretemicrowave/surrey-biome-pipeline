"""Why 2018 and 2021 read as unstressed: the dry edge has the wrong slope for time.

This closes the question left open by `drift_diagnostic.py` and sharpened by
`refit_control_arm.py` -- why two climatically dry summers read as the least
stressed in the record, and why refitting the edge per summer makes it worse
rather than better.

THE MECHANISM. The dry edge is fitted as the lower envelope of the NDVI-SWCI
feature space pooled over the panel, and its slope is therefore calibrated on how
the two bands covary ACROSS POLYGONS. That is a spatial structure. `dry_dist`
then applies it to variation ACROSS SUMMERS, which is only valid if the bands
covary the same way in time as in space. They do not, and not by a little:

    dry-edge slope, pooled envelope          b_e = 0.531
    spatial slope, within-summer             ~0.457   (0.407-0.485, all 9 summers)
    temporal slope, across summer means      ~0.263
    temporal slope, within-polygon           ~0.329

The edge descends 0.20-0.27 SWCI per unit NDVI faster than the data actually
moves in time. So when a summer depresses NDVI, the edge drops out from under the
point faster than the point falls, and the point floats ABOVE the edge -- which
`dry_dist` reads as a larger water margin. Dry summers depress NDVI. Therefore
**every dry summer reads wetter, by construction.**

The implied displacement per unit NDVI is (b_t - b_e)/sqrt(1 + b_e^2); with the
between-summer slope b_t = 0.2625 that is -0.2371, matching the observed
regression of summer-mean `dry_dist` on summer-mean NDVI to machine precision.
That match is an ALGEBRAIC IDENTITY rather than a confirmation -- `dry_dist` is
linear in both bands, so the regression cannot return anything else. Its value is
that the decomposition is complete: the slope mismatch accounts for the whole of
the drift with no residual for a second mechanism. The actual evidence is that
the three slopes genuinely differ (measured, §1) and that correcting the slope
flips the sign of the temporal relationship (§4, an outcome that could have gone
the other way).

WHY IT LANDS ON 2018 AND 2021. The size of the artifact scales with the NDVI
anomaly, so the summers with the largest NDVI departures are the ones thrown
furthest. 2018 has the largest in the record (z = -2.06, mean NDVI 0.696 against
a 0.741 panel mean) and reads 2nd least stressed; 2021 pairs a depressed NDVI
with SWCI that actually ROSE, which is the most adverse combination available,
and reads least stressed of all nine. Neither is a sensor fault, a smoke
artifact, or a composite-quality problem -- scene counts are 7 and 10, mid-range
for the record -- and neither is a corollary of freezing the edge, which is why
`refit_control_arm.py` amplifies them instead of removing them. A per-summer
refit re-levels the index but leaves the slope mismatch untouched.

WHAT THIS DOES AND DOES NOT REPAIR. Substituting the temporal slope restores the
correct SIGN, and significantly so within polygons: r = -0.223 (p = 5e-17) using
the between-summer slope and r = -0.155 (p = 8e-09) using the within-polygon one,
against +0.060 for the published slope. It does not restore the strength of the
original four-summer claim (network r = -0.358 and -0.232 on n = 9, neither
significant), and it
carries a real conceptual cost that has to be stated rather than buried: a line
fitted to the temporal covariance is no longer the lower envelope of the feature
space, so `dry_dist` measured against it is no longer "distance to the dry edge"
in the physical sense the index is named for. It is a different quantity that
happens to be better behaved in time. Treating it as a drop-in replacement would
be trading a documented failure for an undocumented one.

The honest reading is that CDEI's construction embeds a spatial assumption, and
that assumption is what fails in time -- consistent with everything else the
paper finds, and with the within-summer ranking surviving unchanged.

Run:  .venv/bin/python scripts/slope_mismatch.py
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

from src.pipeline import paths

EXTENDED = paths.PROCESSED / "features_extended.parquet"
UNIT = "objectid"


def demeaned(df: pd.DataFrame, col: str) -> pd.Series:
    """Each polygon's own mean removed, leaving only its year-to-year movement."""
    return df[col] - df.groupby(UNIT)[col].transform("mean")


def temporal_corr(df: pd.DataFrame, dd: pd.Series, clim: str = "CMD_sm"):
    """Network-wide (summer means) and within-polygon correlation of an index
    against summer moisture deficit. CDEI is positive on the wet side, so a
    working index is NEGATIVE here."""
    t = df.assign(_dd=dd)
    g = t.groupby("year").agg(dd=("_dd", "mean"), c=(clim, "mean"))
    rn, pn = stats.pearsonr(g.c, g.dd)
    rw, pw = stats.pearsonr(demeaned(t, clim), demeaned(t, "_dd"))
    return (rn, pn, rw, pw)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--features", type=Path, default=EXTENDED)
    a = ap.parse_args()

    if not a.features.exists():
        raise SystemExit(f"{a.features} not found -- build it with assemble --freeze-from")

    d = pd.read_parquet(a.features)
    a_e, b_e = float(d.dry_edge_a.iloc[0]), float(d.dry_edge_b.iloc[0])
    print(f"panel: {len(d)} rows, {d[UNIT].nunique()} polygons, "
          f"{d.year.nunique()} summers\n")

    # -- 1. the three slopes --------------------------------------------------
    print("1. How NDVI and SWCI covary, measured three ways")
    print("   The edge slope is fitted on the pooled envelope. If the temporal")
    print("   slope differs from it, dry_dist mis-reads time.")
    print(f"   dry-edge slope (pooled 5th-pct envelope)   b_e = {b_e:+.4f}")
    sl = {y: stats.linregress(g.ndvi_mean, g.swci_mean).slope
          for y, g in d.groupby("year")}
    print(f"   spatial, within-summer across polygons     mean {np.mean(list(sl.values())):+.4f}"
          f"  (range {min(sl.values()):+.4f} to {max(sl.values()):+.4f})")
    gm = d.groupby("year").agg(ndvi=("ndvi_mean", "mean"), swci=("swci_mean", "mean"),
                               dd=("dry_dist", "mean"), CMD=("CMD_sm", "mean"))
    b_between = stats.linregress(gm.ndvi, gm.swci).slope
    b_within = stats.linregress(demeaned(d, "ndvi_mean"), demeaned(d, "swci_mean")).slope
    print(f"   temporal, across the {len(gm)} summer means           b_t = {b_between:+.4f}")
    print(f"   temporal, within-polygon                   b_t = {b_within:+.4f}")
    print(f"   -> the edge descends {b_e - b_between:.3f} per unit NDVI faster than the")
    print(f"      panel actually moves between summers.")

    # -- 2. the geometry ------------------------------------------------------
    print("\n2. The displacement this implies. NOTE: an identity, not a test.")
    pred = (b_between - b_e) / np.sqrt(1 + b_e ** 2)
    obs = stats.linregress(gm.ndvi, gm.dd).slope
    print(f"   implied  d(dry_dist)/d(NDVI) = (b_t - b_e)/sqrt(1+b_e^2) = {pred:+.4f}")
    print(f"   observed d(dry_dist)/d(NDVI) across summer means        = {obs:+.4f}")
    print(f"   residual {abs(pred - obs):.1e} -- this agrees to machine precision because")
    print("   the two are algebraically the same quantity: dry_dist is linear in NDVI")
    print("   and SWCI, so regressing it on NDVI must return (b_t - b_e)/sqrt(1+b_e^2).")
    print("   It cannot fail, and is therefore NOT evidence for the mechanism. What it")
    print("   does show is that the decomposition is COMPLETE -- the slope mismatch")
    print("   accounts for the whole of the observed drift, with nothing left over for")
    print("   a second mechanism to explain. The evidence is that the slopes genuinely")
    print("   differ (§1, measured) and that correcting them flips the sign (§4, a test")
    print("   whose outcome could have gone the other way).")
    print("   Directionally: a summer with depressed NDVI floats ABOVE the edge, and")
    print("   dry_dist reads that as a LARGER water margin. Dry summers depress NDVI,")
    print("   so dry summers read wetter by construction.")

    # -- 3. which summers it throws furthest -----------------------------------
    print("\n3. The artifact scales with the NDVI anomaly, so it lands on 2018 and 2021")
    gm["ndvi_z"] = (gm.ndvi - gm.ndvi.mean()) / gm.ndvi.std()
    gm["swci_z"] = (gm.swci - gm.swci.mean()) / gm.swci.std()
    gm["artifact"] = (gm.ndvi - gm.ndvi.mean()) * pred
    gm["rank_CMD"] = gm.CMD.rank(ascending=False).astype(int)
    gm["rank_wet"] = gm.dd.rank(ascending=False).astype(int)
    print(gm[["CMD", "ndvi", "swci", "ndvi_z", "swci_z", "artifact", "dd",
              "rank_CMD", "rank_wet"]].round(4).to_string())
    print("   rank_CMD 1 = driest summer; rank_wet 1 = reads wettest.")
    print("   2018: largest NDVI drop in the record. 2021: NDVI down while SWCI")
    print("   ROSE -- the most adverse combination available.")

    # -- 4. does a temporally-calibrated slope fix the sign? -------------------
    print("\n4. Substituting a temporal slope. Expected sign is NEGATIVE.")
    for lab, b_use in [("published (spatial)", b_e),
                       ("temporal, between", b_between),
                       ("temporal, within", b_within)]:
        dd = (d.swci_mean - (a_e + b_use * d.ndvi_mean)) / np.sqrt(1 + b_use ** 2)
        rn, pn, rw, pw = temporal_corr(d, dd)
        flag = "  <- correct sign" if rw < 0 else "  <- INVERTED"
        print(f"   b = {b_use:.4f} ({lab:19s}) network r = {rn:+.3f} (p={pn:.3f})   "
              f"within-polygon r = {rw:+.3f} (p={pw:.1e}){flag}")

    print("\n" + "=" * 74)
    print("2018 and 2021 are not a sensor, smoke or composite problem, and not a")
    print("consequence of freezing the edge. The dry edge is a SPATIAL structure --")
    print("its slope is calibrated on how the bands covary across polygons -- and")
    print("dry_dist applies it to variation across summers, where they covary at")
    print(f"roughly half that rate ({b_between:.3f} against {b_e:.3f}). Dry summers")
    print("depress NDVI, the edge drops faster than the data, and the index reads")
    print("the gap as water margin.")
    print()
    print("Correcting the slope restores the correct sign (within-polygon")
    print("r = -0.155, p = 8e-09) but not the strength of the original four-summer")
    print("claim, and a line fitted to temporal covariance is no longer the lower")
    print("envelope -- so it is no longer 'distance to the dry edge'. That is a")
    print("different quantity, and adopting it would need its own validation.")
    print("=" * 74)


if __name__ == "__main__":
    main()
