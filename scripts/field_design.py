"""Select density-matched corridor pairs for a one-season field soil-moisture check.

THE GAP THIS ADDRESSES. Limitations item 1 (`lim:ranking`) is the headline
weakness of the whole deliverable: the between-corridor stress ranking has never
been checked against a ground observation. Sentinel-1 does not corroborate it as
*water* stress -- the vegetation-condition indices are flat-null in all four
summers -- and no soil measurement exists. Section 4.6 of the manuscript names
the fix and its cost: spot checks on corridors spanning the ranking *while
matching canopy density*, which is one field season with inexpensive equipment.
This script builds that sample.

WHAT THE DESIGN TESTS, AND WHY IT IS PAIRED. CDEI is entangled with canopy
density (rho = -0.347 against NDVI; -0.356 to -0.373 against VH backscatter). So
a naive field survey -- measure the top-ranked corridors, measure the
bottom-ranked ones, compare -- cannot distinguish the two live explanations:

  (W) the ranking tracks soil water, and the density correlation is incidental
  (C) the ranking tracks canopy density, and reads as water only by association

Matching each pair on density collapses that ambiguity. Within a pair the two
corridors have near-identical VH backscatter, so (C) predicts no systematic
soil-moisture difference; only (W) predicts the high-stress member is drier. The
pair is the unit of analysis and the direction of its difference is the datum,
which is why a sign test on ~12 pairs is enough to be decisive without any
assumption about the probe's absolute calibration.

Note this is a *different and more basic* question than
`canopy_controlled_ranking.py` answered. That script showed density is not what
*orders* the ranking (rho = +0.924 after residualising on VH). It could not show
the ranking corresponds to water at all, because every quantity in it comes from
the same satellites. Only ground data can close that, and it stays open.

WHY VH AND NOT NDVI IS THE MATCHING VARIABLE. Same reason
`canopy_controlled_ranking.py` residualises on it: NDVI is a constitutive input
to `dry_dist`, so matching pairs on NDVI would partly match them on CDEI itself
and crush the rank separation the test depends on. Sentinel-1 VH is an
independent instrument sharing no band with the optical imagery. Its known limit
carries over unchanged -- it tracks density at rho ~ 0.55, so it is a *partial*
proxy and the match is partial with it.

That limit is not hypothetical here. Matching on VH alone admits pairs whose NDVI
differs by 0.26 -- density-matched by radar and plainly not density-matched at
all. So NDVI gets a loose *guard* (|d NDVI| <= 0.10) rather than a tight match:
enough to throw out pairs the radar match failed on, far too loose to constrain
CDEI through its own input. It costs almost nothing -- rank separation falls from
66-121 to 62-111 -- because the binding constraints are distance and VH. The
residual NDVI difference is still carried into the output as a covariate, since
a guard is not a control.

THE FOUR CONSTRAINTS, and why each is where it is:

  edge_buffer >= 10 m   Soil within a few metres of a corridor edge is dried by
                        exposure, so a site must admit a probe well inside the
                        polygon. `polylabel` finds the interior point farthest
                        from the boundary; that distance is the most edge margin
                        the corridor can offer. Median across the network is
                        24 m, so this filter is cheap: it costs 16 of 131.
  |d VH| <= 0.002       About 0.24 sd of VH across the network. Tight enough
                        that the pair is genuinely density-matched.
  distance <= 5 km      Both members must be measurable within one afternoon,
                        under the same weather, on similar soil parent material.
                        Proximity is doing real work here, not convenience:
                        soil texture and last-rain timing are exactly the
                        nuisance variables a paired design exists to remove.
  |d rank| >= 60        Of 131 ranked corridors -- nearly half the range. The
                        sign test needs the pair to straddle enough of the
                        ranking that a real effect is detectable at n = 12.
  |d NDVI| <= 0.10      The guard described above, on primaries only.

Pairs are chosen greedily by descending rank separation, subject to disjointness.
Greedy rather than optimal matching because the feasible set is ~10x the pairs
needed, so the two agree in practice, and it avoids taking a networkx dependency
that pyproject.toml does not declare.

Reserves are a second greedy pass over the corridors the first pass did not use,
under a relaxed NDVI guard, because a reserve is for when a primary pair turns
out to be fenced, posted, or under construction -- and a slightly worse-matched
pair that can actually be walked into beats a perfect one that cannot.

BLINDING. The output is deliberately split. `field_design.csv` is the key and
says which member of each pair is predicted dry; `field_sheet.md` is what goes
into the field, with sites in randomised order under neutral codes and no rank,
no CDEI, no pair membership. Someone other than the person measuring should hold
the key until the readings are recorded. This is imperfect -- the author built
the ranking and may recognise a corridor -- but recognising a site is a much
weaker channel than reading its predicted value off the sheet while holding the
probe, and closing the strong channel costs nothing.

Run:
    .venv/bin/python scripts/field_design.py

Outputs, all under docs/fieldwork/:
    field_design.csv   the key -- pairs, ranks, predictions. NOT for the field.
    field_sheet.md     blinded, printable, one block per site
    sites.geojson      WGS84 points for a phone map
"""

from __future__ import annotations

import logging
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
from shapely.ops import polylabel

from src.pipeline import paths

log = logging.getLogger(__name__)

RANKING = paths.DOCS / "deliverable" / "corridor_stress_ranking_canopy_controlled.csv"
OUTDIR = paths.DOCS / "fieldwork"

MIN_EDGE_BUFFER_M = 10.0
MAX_VH_DIFF = 0.002
MAX_PAIR_DIST_KM = 5.0
MIN_RANK_SEP = 60
MAX_NDVI_DIFF = 0.10          # guard on primaries; see the docstring
MAX_NDVI_DIFF_RESERVE = 0.20  # relaxed, for fallback pairs only
N_PAIRS = 12          # 24 sites; see the power note in PROTOCOL.md
SEED = 20260806       # fixes the blinded site order; date the design was built


def interior_point(geom, tolerance: float = 1.0):
    """Return the interior point farthest from the boundary, and that distance.

    For a MultiPolygon (7 GIN corridors are digitised as several polygons) the
    largest part is used -- a field visit goes to one place, and the largest
    part is the one most likely to have interior worth standing in.
    """
    poly = max(geom.geoms, key=lambda p: p.area) if geom.geom_type == "MultiPolygon" else geom
    try:
        pt = polylabel(poly, tolerance=tolerance)
    except Exception:                                  # degenerate ring
        pt = poly.representative_point()
    return pt, pt.distance(poly.exterior)


def build_candidates() -> gpd.GeoDataFrame:
    """Corridors with radar coverage, geometry, and enough interior to sample."""
    rank = pd.read_csv(RANKING)
    polys = gpd.read_file(paths.CORRIDORS_ANALYSIS)[["id", "geometry"]]
    polys["id"] = polys["id"].astype(int)
    # 153 polygons -> 144 corridors: the reporting unit is the GIN corridor.
    polys = polys.dissolve("id").reset_index()

    df = gpd.GeoDataFrame(
        rank.merge(polys, left_on="gin_id", right_on="id", how="left"),
        geometry="geometry",
        crs=polys.crs,
    )
    if df.geometry.isna().any():
        missing = df.loc[df.geometry.isna(), "gin_id"].tolist()
        raise ValueError(f"no geometry for GIN corridors {missing}")

    pts, buf = zip(*df.geometry.map(interior_point))
    df["site_pt"] = pts
    df["edge_buffer_m"] = np.round(buf, 1)

    keep = df[df.edge_buffer_m >= MIN_EDGE_BUFFER_M].reset_index(drop=True)
    log.info(
        "candidates: %d of %d corridors clear the %.0f m edge buffer",
        len(keep), len(df), MIN_EDGE_BUFFER_M,
    )
    return keep


def select_pairs(c: gpd.GeoDataFrame, n_pairs: int) -> pd.DataFrame:
    """Greedy disjoint density-matched pairs, largest rank separation first.

    Two passes: primaries under the tight NDVI guard, then reserves from whatever
    corridors are left over under the relaxed one.
    """
    xy = np.array([[p.x, p.y] for p in c.site_pt])
    dist_km = np.hypot(xy[:, 0][:, None] - xy[:, 0], xy[:, 1][:, None] - xy[:, 1]) / 1000
    d_vh = np.abs(c.vh.values[:, None] - c.vh.values)
    d_rank = np.abs(c.rank_published.values[:, None] - c.rank_published.values)
    d_ndvi = np.abs(c.ndvi.values[:, None] - c.ndvi.values)

    base = (
        (d_vh <= MAX_VH_DIFF)
        & (dist_km <= MAX_PAIR_DIST_KM)
        & (d_rank >= MIN_RANK_SEP)
        & (np.triu(np.ones_like(dist_km), 1) > 0)
    )

    used: set[int] = set()
    rows = []

    def greedy(feasible: np.ndarray, role: str, limit: int) -> None:
        order = np.argwhere(feasible)
        order = order[np.argsort(-d_rank[feasible])]
        taken = 0
        for i, j in order:
            if taken >= limit or i in used or j in used:
                continue
            used.update((i, j))
            taken += 1
            # Lower CDEI = drier by the index, and rank 1 is the most stressed.
            stressed, reference = (i, j) if c.tvwsi[i] < c.tvwsi[j] else (j, i)
            rows.append(
                {
                    "pair": len(rows) + 1,
                    "role": role,
                    "gin_stressed": int(c.gin_id[stressed]),
                    "gin_reference": int(c.gin_id[reference]),
                    "rank_stressed": int(c.rank_published[stressed]),
                    "rank_reference": int(c.rank_published[reference]),
                    "rank_sep": int(d_rank[i, j]),
                    "cdei_stressed": round(float(c.tvwsi[stressed]), 5),
                    "cdei_reference": round(float(c.tvwsi[reference]), 5),
                    "vh_diff": round(float(d_vh[i, j]), 5),
                    "ndvi_diff": round(float(c.ndvi[stressed] - c.ndvi[reference]), 3),
                    "dist_km": round(float(dist_km[i, j]), 2),
                    "_idx_stressed": stressed,
                    "_idx_reference": reference,
                }
            )

    greedy(base & (d_ndvi <= MAX_NDVI_DIFF), "primary", n_pairs)
    if len(rows) < n_pairs:
        raise ValueError(f"only {len(rows)} primary pairs available; need {n_pairs}")
    greedy(base & (d_ndvi <= MAX_NDVI_DIFF_RESERVE), "reserve", limit=10**6)

    pairs = pd.DataFrame(rows)
    log.info("%d pairs selected (%d primary, %d reserve)",
             len(pairs), n_pairs, len(pairs) - n_pairs)
    return pairs


def build_sites(c: gpd.GeoDataFrame, pairs: pd.DataFrame) -> pd.DataFrame:
    """One row per corridor to visit, with a blinded code and WGS84 coordinates."""
    recs = []
    for _, p in pairs.iterrows():
        for side in ("stressed", "reference"):
            k = int(p[f"_idx_{side}"])
            recs.append(
                {
                    "pair": int(p["pair"]),
                    "role": p["role"],
                    "predicted": side,
                    "gin_id": int(c.gin_id[k]),
                    "rank_published": int(c.rank_published[k]),
                    "cdei": round(float(c.tvwsi[k]), 5),
                    "vh": round(float(c.vh[k]), 5),
                    "ndvi": round(float(c.ndvi[k]), 3),
                    "area_ha": round(float(c.area_ha[k]), 2),
                    "target_width_m": c.target_width_m[k],
                    "edge_buffer_m": float(c.edge_buffer_m[k]),
                    "corridor_type": c.corridor_type[k],
                    "geometry": c.site_pt[k],
                }
            )

    sites = gpd.GeoDataFrame(recs, geometry="geometry", crs=c.crs)
    wgs = sites.to_crs(4326)
    sites["lat"] = wgs.geometry.y.round(5)
    sites["lon"] = wgs.geometry.x.round(5)

    # Blinded codes: visit order is randomised across pairs, and within a pair
    # the two members are randomly ordered so time-of-day drift cannot line up
    # with the prediction.
    rng = np.random.default_rng(SEED)
    primary = sites[sites.role == "primary"].copy()
    pair_order = rng.permutation(primary.pair.unique())
    slots = []
    for slot, pr in enumerate(pair_order):
        members = primary.index[primary.pair == pr].to_numpy()
        for within, idx in enumerate(rng.permutation(members)):
            slots.append({"index": idx, "visit": slot * 2 + within + 1})
    sites["visit"] = pd.DataFrame(slots).set_index("index")["visit"]
    sites.loc[sites.role == "primary", "site_code"] = (
        "S" + sites.loc[sites.role == "primary", "visit"].astype("Int64").astype(str).str.zfill(2)
    )
    # Reserve codes must not encode the prediction either: a trailing S/R for
    # stressed/reference would hand over exactly what the blinding withholds.
    # Members get A/B in randomised order within each reserve pair.
    for pr in sites.loc[sites.role == "reserve", "pair"].unique():
        members = sites.index[(sites.role == "reserve") & (sites.pair == pr)].to_numpy()
        for letter, idx in zip("AB", rng.permutation(members)):
            sites.loc[idx, "site_code"] = f"R{int(pr):02d}{letter}"
    return sites.sort_values(["role", "visit"], na_position="last").reset_index(drop=True)


def write_field_sheet(sites: pd.DataFrame, path: Path) -> None:
    """The blinded sheet. No rank, no CDEI, no pair membership, no prediction."""
    primary = sites[sites.role == "primary"].sort_values("visit")
    lines = [
        "# Field sheet — Surrey corridor soil moisture",
        "",
        "**Blinded.** Visit sites in the order given. Nothing on this sheet says which",
        "site the index expects to be drier, which sites are paired, or which corridor",
        "is which; that is all in `field_design.csv`, which should stay with someone",
        "else until every number here is written down.",
        "",
        "Read `PROTOCOL.md` before the first visit. Non-negotiables: at least 72 h since",
        "measurable rain, consecutive sites done in one outing without a rain break",
        "between them, three cores per site at 10 cm, and never move a site to easier",
        "ground without writing down that you did.",
        "",
        "Date: ____________   Observer: ____________   Days since last rain: ______",
        "",
        "---",
        "",
    ]
    for _, s in primary.iterrows():
        lines += [
            f"## {s.site_code}",
            "",
            f"`{s.lat}, {s.lon}`  ·  {s.corridor_type}, {s.area_ha} ha  "
            f"·  up to **{s.edge_buffer_m:.0f} m** from an edge",
            "",
            f"Bags labelled  ☐ {s.site_code}-1  ☐ {s.site_code}-2  ☐ {s.site_code}-3",
            "",
            "Time ______  ·  GPS as measured ________________  ·  m from nearest edge ______",
            "",
            "Aspect (N/NE/E/SE/S/SW/W/NW/flat) ______  ·  Slope (flat / gentle / steep) ______",
            "",
            "Canopy overhead (open / partial / closed) ______  ·  Soil by feel "
            "(sand / loam / clay) ______",
            "",
            "Optional probe, if used (%VWC): ____  ____  ____  ____  ____",
            "",
            "Irrigation, standing water, recent disturbance, anything odd:",
            "",
            "_______________________________________________________________________",
            "",
            "---",
            "",
        ]

    reserves = sites[sites.role == "reserve"]
    if len(reserves):
        lines += [
            "## Reserves",
            "",
            "Use one of these **as a whole pair** only if a primary pair is inaccessible.",
            "Substituting one member breaks the density match and voids the pair.",
            "",
            "| Code | Coordinates | Type | ha | Edge margin |",
            "|---|---|---|---|---|",
        ]
        for _, s in reserves.iterrows():
            lines.append(
                f"| {s.site_code} | `{s.lat}, {s.lon}` | {s.corridor_type} | "
                f"{s.area_ha} | {s.edge_buffer_m:.0f} m |"
            )
        lines.append("")

    # Mass sheet. Filled at the bench, not in the field: three masses per core,
    # from which theta_g = (wet - dry) / (dry - tin). Sample order here follows
    # the blinded visit order, so this page reveals nothing either.
    lines += [
        "---",
        "",
        "## Mass sheet",
        "",
        "Weigh wet **the same day** as collection. Dry at 105 °C for 24 h, cool in a",
        "closed container, weigh again. Same balance throughout.",
        "",
        "| Sample | Tin (g) | Tin + wet (g) | Tin + dry (g) |",
        "|---|---|---|---|",
    ]
    for _, s in primary.iterrows():
        for core in (1, 2, 3):
            lines.append(f"| {s.site_code}-{core} | | | |")
    lines.append("")

    path.write_text("\n".join(lines))


def run() -> pd.DataFrame:
    OUTDIR.mkdir(parents=True, exist_ok=True)
    candidates = build_candidates()
    pairs = select_pairs(candidates, N_PAIRS)
    sites = build_sites(candidates, pairs)

    key_cols = [
        "pair", "role", "predicted", "site_code", "visit", "gin_id", "rank_published",
        "cdei", "vh", "ndvi", "area_ha", "target_width_m", "edge_buffer_m",
        "corridor_type", "lat", "lon",
    ]
    sites[key_cols].to_csv(OUTDIR / "field_design.csv", index=False)
    # WGS84, and carrying the site code only: GeoJSON is what goes on the phone,
    # so it is a blinded artefact. `gin_id` would be a one-line lookup straight
    # into the published ranking, which is the thing being withheld.
    sites[["site_code", "role", "geometry"]].to_crs(4326).to_file(
        OUTDIR / "sites.geojson", driver="GeoJSON"
    )
    write_field_sheet(sites, OUTDIR / "field_sheet.md")

    primary = pairs[pairs.role == "primary"]
    log.info(
        "primary pairs: rank separation %d-%d, |dVH| <= %.4f, %.1f-%.1f km apart",
        primary.rank_sep.min(), primary.rank_sep.max(),
        primary.vh_diff.max(), primary.dist_km.min(), primary.dist_km.max(),
    )
    log.info("wrote %s", OUTDIR)
    return sites


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("-v", "--verbose", action="store_true")
    args = ap.parse_args()
    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(message)s",
    )
    run()
