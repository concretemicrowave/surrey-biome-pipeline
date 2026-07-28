"""Unit tests for the Phase 3 logic that is easy to get silently wrong.

Deliberately narrow: the pure functions where a subtle error produces plausible
numbers rather than an exception. Acquisition and zonal extraction are covered by
each module's ``__main__`` integration summary against real data, not here.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from src.pipeline import acquire_climate as ac
from src.pipeline import experiment as ex
from src.pipeline.assemble import compute_tvwsi, dry_edge, mahalanobis_novelty


# --------------------------------------------------------------------------- #
# ClimateBC response validation — the API fails silently, so this is the guard
# --------------------------------------------------------------------------- #
def test_validate_rejects_all_sentinel_response():
    rec = {k: "-9999" for k in ("MAT", "MAP", "AHM", "CMD")}
    assert not ac.validate_record(rec, "Y")


def test_validate_rejects_degenerate_triple():
    """The other silent failure: MAT=0 / MAP=1 / AHM=10000 from a bad `prd`."""
    assert not ac.validate_record({"MAT": "0", "MAP": "1", "AHM": "10000"}, "Y")


def test_validate_accepts_real_surrey_response():
    rec = {"MAT": "9.7", "MAP": "1408", "AHM": "14", "CMD": "185", "SHM": "58.1"}
    assert ac.validate_record(rec, "Y")


def test_validate_seasonal_needs_summer_fields():
    assert ac.validate_record({"Tmax_sm": "23.6", "PPT_sm": "89"}, "S")
    assert not ac.validate_record({"Tmax_sm": "-9999", "PPT_sm": "-9999"}, "S")


def test_cache_key_is_stable_and_coordinate_sensitive():
    a = ac._cache_key(49.1, -122.8, 50.0, "Year_2023.ann", "S")
    assert a == ac._cache_key(49.1, -122.8, 50.0, "Year_2023.ann", "S")
    assert a != ac._cache_key(49.1, -122.8, 51.0, "Year_2023.ann", "S")
    assert a != ac._cache_key(49.1, -122.8, 50.0, "Year_2024.ann", "S")


def test_complete_panel_drops_partially_fetched_corridors():
    """Partial acquisition must not leak an unbalanced panel into the model."""
    rows = [{"corridor_id": 1, "prd": p} for p in
            (ac.NORMAL_PRD, "Year_2022.ann", "Year_2023.ann")]
    rows += [{"corridor_id": 2, "prd": ac.NORMAL_PRD}]  # incomplete
    panel = ac.complete_panel(pd.DataFrame(rows), (2022, 2023))
    assert set(panel["corridor_id"]) == {1}


# --------------------------------------------------------------------------- #
# Sentinel-2 BOA offset — the bug that invalidated Phase 2
# --------------------------------------------------------------------------- #
class _Item:
    def __init__(self, **props):
        self.properties = props


def test_offset_zero_when_provider_says_already_applied():
    assert ac and ex  # keep imports used regardless of collection order
    from src.pipeline.acquire_raster import item_boa_offset
    assert item_boa_offset(_Item(**{"earthsearch:boa_offset_applied": True,
                                    "s2:processing_baseline": "05.09"})) == 0


def test_offset_applied_for_new_baseline_without_a_flag():
    from src.pipeline.acquire_raster import BOA_OFFSET, item_boa_offset
    assert item_boa_offset(_Item(**{"s2:processing_baseline": "04.00"})) == BOA_OFFSET
    assert item_boa_offset(_Item(**{"s2:processing_baseline": "03.01"})) == 0


# --------------------------------------------------------------------------- #
# CDEI construction
# --------------------------------------------------------------------------- #
def test_dry_edge_recovers_a_known_line():
    """Points scattered *above* a known lower envelope must recover that line."""
    rng = np.random.default_rng(0)
    ndvi = rng.uniform(0.2, 0.9, 4000)
    swci = -0.1 + 0.5 * ndvi + rng.exponential(0.05, 4000)  # one-sided noise
    a, b = dry_edge(ndvi, swci, n_bins=10, q=0.05)
    assert a == pytest.approx(-0.1, abs=0.03)
    assert b == pytest.approx(0.5, abs=0.06)


def _toy_panel(swci_offsets, lst) -> pd.DataFrame:
    """6 corridors x 2 summers spanning enough NDVI to fit a 3-bin dry edge."""
    ndvi = np.linspace(0.3, 0.9, 12)
    return pd.DataFrame({
        "objectid": np.repeat(np.arange(6), 2),
        "ndvi_mean": ndvi,
        "swci_mean": 0.5 * ndvi + np.asarray(swci_offsets),
        "lst_mean": np.asarray(lst, dtype=float),
    })


def test_dry_distance_sign_is_wet_positive():
    # every corridor's first summer sits well above the edge, its second on it
    offsets = np.tile([0.20, 0.02], 6)
    out = compute_tvwsi(_toy_panel(offsets, [30.0] * 12), n_bins=3, q=0.05, min_per_bin=1)
    wet, dry = out.iloc[::2]["dry_dist"], out.iloc[1::2]["dry_dist"]
    assert (wet.to_numpy() > dry.to_numpy()).all()


def test_rlst_is_centred_on_one_per_corridor():
    """RLST is each corridor against *itself*, so its per-corridor mean is ~1."""
    lst = np.tile([28.0, 34.0], 6)   # each corridor: a cool summer then a hot one
    out = compute_tvwsi(_toy_panel(np.full(12, 0.1), lst), n_bins=3, q=0.05, min_per_bin=1)
    per_corridor = out.groupby("objectid")["rlst"].mean()
    assert np.allclose(per_corridor.to_numpy(), 1.0, atol=1e-6)
    # a corridor that ran hot for itself must be pushed toward more stress
    assert (out.iloc[1::2]["rlst"].to_numpy() > out.iloc[::2]["rlst"].to_numpy()).all()


def test_mahalanobis_novelty_ranks_by_departure_not_by_location():
    """Novelty must score the *departure* from normal, scaled by its own spread.

    Scaling by the spatial spread of the normals instead is what inflated this
    to a median of ~14 on the real panel: over a flat 30 km study area the
    normals barely vary, so their covariance is near-singular.
    """
    rng = np.random.default_rng(1)
    n = 300
    # normals vary a lot in space; departures from them vary much less
    norm = rng.normal(0, 50, n)
    departure = rng.normal(0, 1, n)
    df = pd.DataFrame({"CMD_sm_norm": norm, "Tmax_sm_norm": norm,
                       "CMD_sm": norm + departure,
                       "Tmax_sm": norm + departure * 0.5})
    nov = mahalanobis_novelty(df, ["CMD_sm", "Tmax_sm"])

    # ranks by |departure|, and is blind to where the corridor sits
    assert np.corrcoef(nov, np.abs(departure))[0, 1] > 0.9
    assert abs(np.corrcoef(nov, norm)[0, 1]) < 0.2
    # a 2-variable distance stays on a sane scale rather than exploding
    assert nov.median() < 5.0


def test_verdict_is_inconclusive_without_skill_or_contrast():
    """A null result only means something when the test could have detected one."""
    null = {"mean_diff": -0.0001, "ci_lo": -0.0003, "ci_hi": 0.0001}
    r2_null = {"mean_diff": 0.0, "ci_lo": -0.02, "ci_hi": 0.03}

    # no skill in either model -> comparing two failures
    assert ex.verdict(null, r2_null, r2_a=-0.02, r2_b=-0.04,
                      var_removed=0.9)[0] == "INCONCLUSIVE"
    # models work, but coarsening barely changed the predictors
    assert ex.verdict(null, r2_null, r2_a=0.4, r2_b=0.35,
                      var_removed=0.05)[0] == "INCONCLUSIVE"
    # both preconditions met -> a genuine null on the hypothesis
    assert ex.verdict(null, r2_null, r2_a=0.4, r2_b=0.35,
                      var_removed=0.9)[0] == "NOT SUPPORTED"
    # a real win is still called, even if contrast is marginal
    clear = {"mean_diff": -0.2, "ci_lo": -0.3, "ci_hi": -0.1}
    assert ex.verdict(clear, r2_null, r2_a=0.4, r2_b=0.2,
                      var_removed=0.05)[0] == "SUPPORTED"


# --------------------------------------------------------------------------- #
# The experiment: upscaling and folds
# --------------------------------------------------------------------------- #
def _panel(n_corridors: int = 40, years=(2022, 2023)) -> pd.DataFrame:
    rng = np.random.default_rng(7)
    rows = []
    for oid in range(n_corridors):
        x, y = rng.uniform(0, 20_000, 2)
        for yr in years:
            rows.append({"objectid": oid, "year": yr, "x_m": x, "y_m": y,
                         "CMD_sm": x / 1000 + yr, "tvwsi": rng.normal()})
    return pd.DataFrame(rows)


def test_upscale_collapses_within_cell_but_keeps_year_signal():
    df = _panel()
    up = ex.upscale(df, ["CMD_sm"], cell_m=5000.0)
    cells = (np.floor(df.x_m / 5000).astype(int).astype(str) + "_" +
             np.floor(df.y_m / 5000).astype(int).astype(str))
    # identical within every (cell, year)
    assert up.groupby([cells, up.year])["CMD_sm"].nunique().max() == 1
    # the between-year difference is untouched
    fine_gap = df.groupby("year")["CMD_sm"].mean().diff().iloc[-1]
    coarse_gap = up.groupby("year")["CMD_sm"].mean().diff().iloc[-1]
    assert coarse_gap == pytest.approx(fine_gap, rel=1e-9)


def test_upscaling_diagnostics_report_variance_actually_removed():
    diag = ex.upscaling_diagnostics(_panel(), ["CMD_sm"], cell_m=5000.0)
    assert 0.0 < float(diag["var_removed_frac"].iloc[0]) < 1.0


def test_spatial_blocks_keep_every_summer_of_a_corridor_together():
    """This is what makes the CV grouped as well as spatially blocked."""
    df = _panel()
    blocks = ex.spatial_blocks(df, n_blocks=4)
    assert df.assign(b=blocks).groupby("objectid")["b"].nunique().max() == 1


def test_paired_difference_ci_brackets_a_known_shift():
    rng = np.random.default_rng(3)
    a = pd.DataFrame({"repeat": 0, "block": range(30),
                      "rmse": rng.normal(1.0, 0.05, 30)})
    b = a.copy()
    b["rmse"] = a["rmse"] + 0.2
    d = ex.paired_difference(a, b, "rmse")
    assert d["mean_diff"] == pytest.approx(-0.2, abs=0.02)
    assert d["ci_hi"] < 0          # A significantly better
    assert d["frac_folds_a_better"] == 1.0


def test_verdict_supported_only_when_the_ci_excludes_zero():
    clear = {"mean_diff": -0.2, "ci_lo": -0.3, "ci_hi": -0.1}
    null = {"mean_diff": -0.01, "ci_lo": -0.05, "ci_hi": 0.04}
    r2_null = {"mean_diff": 0.0, "ci_lo": -0.1, "ci_hi": 0.1}
    assert ex.verdict(clear, r2_null)[0] == "SUPPORTED"
    assert ex.verdict(null, r2_null)[0] == "NOT SUPPORTED"
    assert ex.verdict({"mean_diff": 0.2, "ci_lo": 0.1, "ci_hi": 0.3}, r2_null)[0] == "FALSIFIED"


def test_run_refuses_a_panel_too_small_to_block():
    import tempfile
    from pathlib import Path
    df = _panel(n_corridors=8)
    df["novelty"] = 0.0
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / "f.parquet"
        df.to_parquet(p)
        with pytest.raises(RuntimeError, match="too few for spatially-blocked"):
            ex.run(p, n_repeats=1)
