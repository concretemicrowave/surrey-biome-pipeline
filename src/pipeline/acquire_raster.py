"""Acquire Sentinel-2 L2A imagery and build a cloud-masked NDVI composite over
the study extent.

Ground-truth side of the pipeline. Queries a STAC catalog for the corridor
study bbox, masks clouds via the Scene Classification Layer (SCL), computes
NDVI, and composites over a date window into a single COG in the analysis CRS.

Provider-flexible by design
---------------------------
Two independent STAC catalogs are supported so a single provider outage doesn't
block the pipeline (Microsoft Planetary Computer was returning 504s during
initial build):

* ``earth-search``       — Element84 / AWS Open Data (default; no auth)
* ``planetary-computer`` — Microsoft PC (requires anonymous token signing)

They expose the same Sentinel-2 L2A data under different asset names, which the
``Provider`` abstraction normalizes to red / nir / scl.

Radiometric note — resolved per item, never assumed
---------------------------------------------------
Sentinel-2 processing baseline >= 04.00 (products after 2022-01-25) stores a
BOA reflectance offset of -1000 DN. NDVI is a ratio, but an *additive* offset
does NOT cancel, so it must be removed before computing any index.

**It must not be assumed, though.** Element84's ``sentinel-2-l2a`` items already
have it removed at the source and say so via ``earthsearch:boa_offset_applied``;
subtracting it a second time drives red reflectance below zero, where the
``clip(min=0)`` guard pins it at 0 and NDVI becomes *exactly* 1.0. That is what
produced Phase 2's apparent "NDVI saturation" (69% of pixels at exactly 1.000) —
an artifact, not a canopy signal. Worse, the vendor flag cannot simply be
believed either — 2022 scenes marked ``boa_offset_applied: False`` carry exactly
the DN magnitudes of ones marked ``True``. :func:`boa_offset_per_time` therefore
**measures** the offset from each scene's dark pixels and applies it along the
time axis, logging any disagreement with the metadata.

CDEI remains the Phase 3 target regardless — SWIR-based water content responds
to stress earlier than greenness does — but the *empirical* saturation argument
for it does not survive the fix, and the Phase 2 ground truth needs recomputing.

Phase 3 additions
-----------------
Phase 2 needed NDVI alone. Phase 3's target is CDEI, which needs three signals:

* **NDVI**  — red / NIR (Sentinel-2)
* **SWCI**  — ``(SWIR1 - SWIR2) / (SWIR1 + SWIR2)``, i.e. B11/B12 (Sentinel-2).
  SWIR is sensitive to leaf water content, which is exactly the axis NDVI loses
  once canopy cover closes — and it responds while the canopy is still green.
* **LST**   — land surface temperature. Sentinel-2 has no thermal band at all,
  so this comes from **Landsat Collection-2 Level-2** (``lwir11`` = ST_B10,
  100 m thermal resampled to 30 m), a different mission with a different revisit.
  That resolution mismatch is real and is why LST enters only through *RLST*, a
  per-corridor ratio against that corridor's own multi-summer mean, rather than
  as an absolute temperature.

``mode`` selects which product a run builds: ``ndvi`` (the Phase 2 behaviour,
unchanged), ``optical`` (NDVI + SWCI in one 2-band COG) or ``thermal`` (LST).
"""

from __future__ import annotations

import argparse
import json
import logging
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import odc.stac
import planetary_computer
import pystac_client
import rioxarray  # noqa: F401  (registers the .rio accessor)
import xarray as xr

from . import paths

logger = logging.getLogger(__name__)

ANALYSIS_CRS = "EPSG:26910"
# SCL classes to discard: 0 no-data, 1 saturated, 3 cloud shadow, 8/9 cloud
# medium/high, 10 thin cirrus, 11 snow/ice. Kept: 2 dark, 4 veg, 5 bare, 6 water,
# 7 unclassified.
BAD_SCL = (0, 1, 3, 8, 9, 10, 11)
BOA_OFFSET = 1000  # DN offset for processing baseline >= 04.00


@dataclass(frozen=True)
class Provider:
    key: str
    url: str
    sign: bool
    red: str
    nir: str
    scl: str
    swir16: str
    swir22: str


PROVIDERS: dict[str, Provider] = {
    "earth-search": Provider(
        "earth-search", "https://earth-search.aws.element84.com/v1",
        sign=False, red="red", nir="nir", scl="scl",
        swir16="swir16", swir22="swir22",
    ),
    "planetary-computer": Provider(
        "planetary-computer", "https://planetarycomputer.microsoft.com/api/stac/v1",
        sign=True, red="B04", nir="B08", scl="SCL",
        swir16="B11", swir22="B12",
    ),
}

# --- Landsat Collection-2 Level-2 surface temperature -----------------------
# ST_B10 is stored as scaled uint16; Kelvin = DN * 0.00341802 + 149.0 (USGS
# C2 L2 product guide). Applying this by hand rather than trusting per-asset
# STAC scale/offset metadata, which odc-stac does not consistently honour.
LANDSAT_COLLECTION = "landsat-c2-l2"
ST_SCALE, ST_OFFSET = 0.00341802, 149.0
KELVIN_TO_C = 273.15
# QA_PIXEL bits: 1 dilated cloud, 2 cirrus, 3 cloud, 4 cloud shadow.
QA_BAD_BITS = (1, 2, 3, 4)


def open_catalog(provider: Provider) -> pystac_client.Client:
    modifier = planetary_computer.sign_inplace if provider.sign else None
    return pystac_client.Client.open(provider.url, modifier=modifier)


def search_items(
    provider: Provider, bbox: list[float], start: str, end: str, cloud_lt: float,
) -> list:
    cat = open_catalog(provider)
    search = cat.search(
        collections=["sentinel-2-l2a"],
        bbox=bbox,
        datetime=f"{start}/{end}",
        query={"eo:cloud_cover": {"lt": cloud_lt}},
    )
    items = list(search.items())
    logger.info("%s: %d scenes (%s..%s, cloud<%.0f%%)",
                provider.key, len(items), start, end, cloud_lt)
    if not items:
        raise RuntimeError("No Sentinel-2 scenes matched the query.")
    return items


def item_boa_offset(item, *, default: int = BOA_OFFSET) -> int:
    """DN offset still present in one item's reflectance bands.

    Priority: the provider's explicit "already applied" flag, then the
    processing baseline. Never a blanket assumption — see the module docstring
    for what guessing wrong costs.
    """
    props = item.properties
    if props.get("earthsearch:boa_offset_applied") is True:
        return 0
    baseline = props.get("s2:processing_baseline")
    if baseline is not None:
        try:
            return default if float(baseline) >= 4.0 else 0
        except (TypeError, ValueError):
            pass
    return default


DARK_PROBE_Q = 0.01     # dark-pixel quantile used to probe for the offset
# DN threshold on the dark-pixel probe. Measured across summers 2022-2025 the
# no-offset scenes sit at p1 = 44-178 DN, with one hazy 2023-08-28 scene at 502;
# an offset-carrying scene puts dark targets at ~1000. 800 clears the haze case
# with margin while staying well below a genuine offset.
DARK_PROBE_THRESHOLD = 800


def boa_offset_per_time(red_valid: xr.DataArray, items: list,
                        *, default: int = BOA_OFFSET) -> xr.DataArray:
    """Per-time-step BOA offset, **measured from the pixels**, not trusted from metadata.

    Element84's ``earthsearch:boa_offset_applied`` flag is not reliable: summer
    2022 scenes marked ``False`` carry the same DN magnitudes as ones marked
    ``True`` (red ~400-500 DN over vegetation either way, i.e. the offset is
    already gone in both). Believing the flag subtracts 1000 from five otherwise
    fine scenes, pins their NDVI at 1.0, and drags the whole summer's median
    composite upward — which is exactly the failure this function exists to
    prevent.

    The probe is physical rather than declarative. Every Surrey scene contains
    genuinely dark pixels (the Fraser River, Boundary Bay, deep shadow), whose
    true reflectance is near zero. So the 1st percentile of valid red lands
    near 0 DN when no offset is present and near +1000 DN when one is. Anything
    above ``DARK_PROBE_THRESHOLD`` still carries the offset. The threshold sits
    high enough that a hazy scene — whose dark tail lifts but does not shift by
    a full 1000 DN — is not mistaken for an offset one.

    Metadata is still consulted — it is logged whenever it disagrees, because a
    silent divergence between the vendor's claim and the pixels is worth seeing.
    """
    probe = red_valid.quantile(DARK_PROBE_Q, dim=("y", "x")).compute()
    measured = xr.where(probe >= DARK_PROBE_THRESHOLD, default, 0).astype("float32")
    measured = measured.drop_vars("quantile", errors="ignore").rename("boa_offset")

    claimed = {str(it.datetime.date()): item_boa_offset(it, default=default)
               for it in items if it.datetime}
    days = [str(np.datetime64(t, "D")) for t in red_valid.time.values]
    disagree = [(d, claimed[d], int(m))
                for d, m in zip(days, measured.values)
                if d in claimed and claimed[d] != int(m)]
    if disagree:
        logger.warning("BOA offset: metadata disagrees with the pixels on %d/%d days "
                       "(e.g. %s claimed=%d measured=%d) — using the measurement",
                       len(disagree), len(days), *disagree[0])

    found = sorted({int(v) for v in measured.values})
    logger.info("BOA offset measured per scene: %s DN across %d time steps",
                found, len(days))
    return measured


def _offset_label(off) -> str:
    """Compact provenance string for the offsets actually applied."""
    vals = sorted({int(v) for v in np.atleast_1d(np.asarray(off))})
    return "/".join(str(v) for v in vals)


def build_ndvi_composite(
    items: list,
    provider: Provider,
    bbox: list[float],
    *,
    resolution: int = 10,
    method: str = "median",
    boa_offset: int | None = None,
) -> xr.DataArray:
    """Load, cloud-mask, NDVI, and temporally composite the scenes.

    ``groupby='solar_day'`` mosaics the two MGRS tiles Surrey straddles into one
    scene per day; ``crs``/``resolution`` reproject on load to the analysis grid.
    ``boa_offset=None`` resolves the offset from item metadata (the safe default).
    """
    ds = odc.stac.load(
        items,
        bands=[provider.red, provider.nir, provider.scl],
        bbox=bbox,
        crs=ANALYSIS_CRS,
        resolution=resolution,
        groupby="solar_day",
        chunks={"x": 2048, "y": 2048},
    ).rename({provider.red: "red", provider.nir: "nir", provider.scl: "scl"})

    keep = ~ds.scl.isin(BAD_SCL)
    red_valid = ds.red.where(keep & (ds.red > 0))
    off = (boa_offset if boa_offset is not None
           else boa_offset_per_time(red_valid, items))
    red = (red_valid - off).clip(min=0)
    nir = (ds.nir.where(keep) - off).clip(min=0)

    ndvi = (nir - red) / (nir + red)
    ndvi = ndvi.where((ndvi >= -1) & (ndvi <= 1))  # guard div-by-zero artifacts

    if method == "median":
        comp = ndvi.median("time", skipna=True)
    elif method == "max":
        comp = ndvi.max("time", skipna=True)  # Phase 1: weekly/seasonal max
    else:
        raise ValueError(f"Unknown composite method: {method}")

    # NDVI legitimately spans [-1, 1] incl. 0, so nodata MUST be NaN — never 0,
    # or the downstream zonal step would drop bare-soil/water pixels.
    comp = comp.rio.write_crs(ANALYSIS_CRS).rio.write_nodata(np.nan, encoded=False).rename("ndvi")
    comp.attrs.update(
        composite=method, n_scenes=int(ds.sizes["time"]),
        boa_offset=_offset_label(off), provider=provider.key,
    )
    return comp


def build_optical_composite(
    items: list,
    provider: Provider,
    bbox: list[float],
    *,
    resolution: int = 20,
    method: str = "median",
    boa_offset: int | None = None,
) -> xr.Dataset:
    """NDVI **and** SWCI in one pass, composited over the summer window.

    Run at 20 m — the native resolution of B11/B12. Compositing NDVI and SWCI
    from the same masked stack (rather than two independent runs) guarantees
    both indices describe the same set of surviving observations, which matters
    because the dry-edge fit downstream pairs them pixel-for-pixel.
    """
    bands = [provider.red, provider.nir, provider.swir16, provider.swir22, provider.scl]
    ds = odc.stac.load(
        items, bands=bands, bbox=bbox, crs=ANALYSIS_CRS, resolution=resolution,
        groupby="solar_day", chunks={"x": 2048, "y": 2048},
    ).rename({provider.red: "red", provider.nir: "nir", provider.swir16: "swir16",
              provider.swir22: "swir22", provider.scl: "scl"})

    keep = ~ds.scl.isin(BAD_SCL)
    off = (boa_offset if boa_offset is not None
           else boa_offset_per_time(ds.red.where(keep & (ds.red > 0)), items))
    ref = {b: (ds[b].where(keep) - off).clip(min=0)
           for b in ("red", "nir", "swir16", "swir22")}

    ndvi = (ref["nir"] - ref["red"]) / (ref["nir"] + ref["red"])
    swci = (ref["swir16"] - ref["swir22"]) / (ref["swir16"] + ref["swir22"])
    ndvi = ndvi.where((ndvi >= -1) & (ndvi <= 1))
    swci = swci.where((swci >= -1) & (swci <= 1))

    reduce = (lambda d: d.median("time", skipna=True)) if method == "median" else \
             (lambda d: d.max("time", skipna=True))
    if method not in ("median", "max"):
        raise ValueError(f"Unknown composite method: {method}")

    # Band order in the written COG is the Dataset's variable order: 1=ndvi, 2=swci.
    # nodata is set per-variable (rioxarray's Dataset accessor has no write_nodata)
    # and MUST be NaN, not 0 — both indices legitimately take the value 0.
    out = xr.Dataset({"ndvi": reduce(ndvi), "swci": reduce(swci)})
    for name in out.data_vars:
        out[name] = out[name].rio.write_nodata(np.nan, encoded=False)
    out = out.rio.write_crs(ANALYSIS_CRS)
    out.attrs.update(composite=method, n_scenes=int(ds.sizes["time"]),
                     boa_offset=_offset_label(off), provider=provider.key,
                     resolution=resolution)
    return out


def build_lst_composite(
    bbox: list[float],
    start: str,
    end: str,
    *,
    cloud_lt: float = 40.0,
    resolution: int = 30,
) -> xr.DataArray:
    """Cloud-masked mean summer land surface temperature (deg C) from Landsat C2 L2.

    Mean, not median: Phase 1's feature-engineering rule is weekly *max* for
    optical and weekly *mean* for thermal — thermal noise is roughly symmetric,
    and a max composite would just track the single clearest hot afternoon.

    Landsat's 16-day revisit (8 with L8+L9) leaves far fewer clear summer scenes
    than Sentinel-2, so the cloud threshold is looser (40%) and per-pixel QA
    masking does the real work.
    """
    cat = pystac_client.Client.open(
        PROVIDERS["planetary-computer"].url, modifier=planetary_computer.sign_inplace)
    items = list(cat.search(
        collections=[LANDSAT_COLLECTION], bbox=bbox, datetime=f"{start}/{end}",
        query={"eo:cloud_cover": {"lt": cloud_lt},
               "platform": {"in": ["landsat-8", "landsat-9"]}},
    ).items())
    logger.info("landsat-c2-l2: %d scenes (%s..%s, cloud<%.0f%%)",
                len(items), start, end, cloud_lt)
    if not items:
        raise RuntimeError(f"No Landsat scenes for {start}..{end}")

    ds = odc.stac.load(
        items, bands=["lwir11", "qa_pixel"], bbox=bbox, crs=ANALYSIS_CRS,
        resolution=resolution, groupby="solar_day", chunks={"x": 2048, "y": 2048},
    )
    qa = ds.qa_pixel.astype("uint16")
    bad = xr.zeros_like(qa, dtype=bool)
    for bit in QA_BAD_BITS:
        bad = bad | ((qa & np.uint16(1 << bit)) > 0)

    lst = ds.lwir11.where((ds.lwir11 > 0) & ~bad) * ST_SCALE + ST_OFFSET - KELVIN_TO_C
    lst = lst.where((lst > -20) & (lst < 70))  # physical guard on Surrey summers
    comp = lst.mean("time", skipna=True)
    comp = (comp.rio.write_crs(ANALYSIS_CRS)
                .rio.write_nodata(np.nan, encoded=False).rename("lst"))
    comp.attrs.update(composite="mean", n_scenes=int(ds.sizes["time"]),
                      units="degC", collection=LANDSAT_COLLECTION,
                      resolution=resolution)
    return comp


def summer_window(year: int, start_md: str = "06-01", end_md: str = "08-31") -> tuple[str, str]:
    """The summer date window for a study year (Jun–Aug, peak water stress)."""
    return f"{year}-{start_md}", f"{year}-{end_md}"


def run_year(
    extent_json: Path,
    out_dir: Path,
    year: int,
    *,
    mode: str = "optical",
    provider_key: str = "earth-search",
    cloud_lt: float = 20.0,
    resolution: int | None = None,
    method: str = "median",
) -> Path:
    """Build one summer's ``optical`` (NDVI+SWCI) or ``thermal`` (LST) composite."""
    bbox = json.loads(extent_json.read_text())["bbox_4326"]
    start, end = summer_window(year)
    out_dir.mkdir(parents=True, exist_ok=True)

    if mode == "optical":
        provider = PROVIDERS[provider_key]
        items = search_items(provider, bbox, start, end, cloud_lt)
        comp = build_optical_composite(items, provider, bbox,
                                       resolution=resolution or 20, method=method)
        out_path = out_dir / f"optical_{year}.tif"
        comp.rio.to_raster(out_path, driver="COG", compress="DEFLATE", nodata=np.nan)
    elif mode == "thermal":
        comp = build_lst_composite(bbox, start, end, resolution=resolution or 30)
        out_path = out_dir / f"lst_{year}.tif"
        comp.rio.to_raster(out_path, driver="COG", compress="DEFLATE", nodata=np.nan)
    else:
        raise ValueError(f"Unknown mode for run_year: {mode}")

    logger.info("%s %d -> %s (%d scenes)", mode, year, out_path, comp.attrs["n_scenes"])
    return out_path


def run(
    extent_json: Path,
    out_path: Path,
    *,
    provider_key: str = "earth-search",
    start: str = "2023-06-01",
    end: str = "2023-08-31",
    cloud_lt: float = 20.0,
    resolution: int = 10,
    method: str = "median",
) -> xr.DataArray:
    provider = PROVIDERS[provider_key]
    bbox = json.loads(extent_json.read_text())["bbox_4326"]

    items = search_items(provider, bbox, start, end, cloud_lt)
    comp = build_ndvi_composite(items, provider, bbox, resolution=resolution, method=method)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    logger.info("computing + writing composite -> %s", out_path)
    comp.rio.to_raster(out_path, driver="COG", compress="DEFLATE", nodata=np.nan)
    return comp


def main() -> None:
    p = argparse.ArgumentParser(
        description="Build Sentinel-2 / Landsat composites over the study extent.")
    p.add_argument("--mode", default="ndvi", choices=["ndvi", "optical", "thermal"],
                   help="ndvi = Phase 2 single composite; optical/thermal = per-summer Phase 3.")
    p.add_argument("--years", type=int, nargs="+", default=None,
                   help="Study summers for optical/thermal mode.")
    p.add_argument("--out-dir", type=Path, default=paths.INTERIM)
    p.add_argument("--extent-json", type=Path, default=paths.STUDY_EXTENT_JSON)
    p.add_argument("--out", type=Path, default=paths.NDVI_COMPOSITE)
    p.add_argument("--provider", default="earth-search", choices=sorted(PROVIDERS))
    p.add_argument("--start", default="2023-06-01")
    p.add_argument("--end", default="2023-08-31")
    p.add_argument("--cloud-lt", type=float, default=20.0)
    p.add_argument("--resolution", type=int, default=None)
    p.add_argument("--composite", default="median", choices=["median", "max"])
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )
    # Sentinel-2 COGs are read over public HTTPS; rasterio's per-read AWS-session
    # INFO chatter ("boto3 not available...") is harmless noise — quiet it.
    logging.getLogger("rasterio.session").setLevel(logging.WARNING)

    if args.mode in ("optical", "thermal"):
        years = args.years or list(range(2022, 2026))
        print("=" * 66)
        print(f"{args.mode} composites for summers {years}")
        for y in years:
            path = run_year(args.extent_json, args.out_dir, y, mode=args.mode,
                            provider_key=args.provider, cloud_lt=args.cloud_lt,
                            resolution=args.resolution, method=args.composite)
            import rioxarray as _rx
            da = _rx.open_rasterio(path, masked=True)
            names = ["ndvi", "swci"] if args.mode == "optical" else ["lst"]
            stats = "  ".join(
                f"{n}: valid={float(da[i].notnull().mean()) * 100:5.1f}% "
                f"median={float(da[i].median()):+.3f}"
                for i, n in enumerate(names))
            print(f"  {y}  {path.name:<18} {stats}")
        return

    comp = run(
        args.extent_json, args.out, provider_key=args.provider,
        start=args.start, end=args.end, cloud_lt=args.cloud_lt,
        resolution=args.resolution or 10, method=args.composite,
    )
    valid = float(comp.notnull().mean().compute()) * 100
    print("=" * 60)
    print(f"NDVI composite written: {args.out}")
    print(f"  provider   : {comp.attrs['provider']}  |  scenes: {comp.attrs['n_scenes']}  "
          f"|  method: {comp.attrs['composite']}")
    print(f"  shape      : {dict(comp.sizes)}  @ {args.resolution or 10} m, {ANALYSIS_CRS}")
    print(f"  valid px   : {valid:.1f}%")
    print(f"  NDVI range : [{float(comp.min()):.3f}, {float(comp.max()):.3f}]")


if __name__ == "__main__":
    main()
