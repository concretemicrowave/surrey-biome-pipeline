"""Parse Appendix J of Surrey's Biodiversity Conservation Strategy.

Appendix J is the City's own inventory of the Green Infrastructure Network: for
every corridor it gives risk of development, ecological value, corridor type,
target width, and a written management recommendation. The GIS layer this project
pulls carries the first four as attributes; the recommendation text exists only
here, and it is the part a planner actually acts on.

Two things this settles.

**The identifier.** The MapServer layer has both ``objectid`` (an ArcGIS row
number, 1..153) and ``id`` (the GIN corridor id, 1..144). Everything this project
reported was keyed on ``objectid``, so "corridor 73" named the 73rd polygon in
the service rather than the City's corridor 73. Cross-checking the four shared
attributes against this table is what proves which column is which: joined on
``id`` they agree at 98-99%, joined on ``objectid`` at 23-39%, which is chance.

**The unit.** 153 polygons carry 144 distinct GIN ids, because seven corridors
are digitised as several parts. That is why the polygon count and the corridor
count differ, and why a top-20 polygon ranking can list one corridor twice.

⚠ **The parent document is disputed with the manuscript.** This docstring says
BCS and the downloaded PDF agrees — its 11 pages run "BCS • Spring 2014" over
pages 119-129, which is what ``FURNITURE`` below matches on. But §1.1 of the
preprint, and the verified note above ``@techreport{surreyEMS}`` in
``references.bib``, both attribute Appendix J to the 2011 Ecosystem Management
Study instead. Unresolved as of 2026-08-02; see ``docs/preprint/KNOWN_ISSUES.md``
item S2. Nothing this script computes depends on the answer — it parses the file
at ``URL`` either way — but the citation in the paper does.

    .venv/bin/python scripts/parse_appendix_j.py -v
"""

from __future__ import annotations

import argparse
import logging
import re
from pathlib import Path

import pandas as pd

from src.pipeline import paths

logger = logging.getLogger(__name__)

URL = "https://www.surrey.ca/sites/default/files/media/documents/Appendix_J.pdf"
CACHE = paths.RAW / "surrey" / "appendix_j.pdf"
OUT = paths.INTERIM / "gin_appendix_j.csv"

# Surrey's CDN 403s a default urllib/requests agent, so a browser UA is required.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/150.0 Safari/537.36")

# A table row begins: <id> <risk> <value> <type> <target width>.
#
# The published table is not as tidy as its own Table 32 says. Risk and value
# appear in mixed case ("high", "low", "moderate"), value carries two spelling
# errors ("Mdoerate", "Modetate"), and corridor type takes two values Table 32
# never defines ("Corridor", "Secondary") alongside Regional and Local. Matching
# strictly on the documented vocabulary silently dropped 8 of 144 corridors, so
# the pattern is permissive and normalisation happens afterwards where it can be
# logged. Never silently repair a source document.
ROW = re.compile(r"^[ \t]*(\d{1,3})[ \t]+(\w+)[ \t]+(\w+)[ \t]+(\w+)[ \t]+(\d{1,3})[ \t]+", re.M)

# Page furniture. A recommendation that is the last row on its page runs straight
# into the next page's footer and column headers, because the text layer has no
# page boundaries once the pages are concatenated. Two forms appear, depending on
# whether the page number leads or trails:
#   "... 120 BCS • Spring 2014 ID RISK OF DEVELOPMENT ECOLOGICAL VALUE ..."
#   "... Spring 2014 • BCS 121 ID RISK OF DEVELOPMENT ECOLOGICAL VALUE ..."
FURNITURE = re.compile(r"\bBCS\s*[•·]|\bSpring\s+\d{4}\s*[•·]"
                       r"|\bID\s+RISK\s+OF\s+DEVELOPMENT\b")


def _strip_furniture(text: str) -> str:
    """Cut a recommendation at the first page-furniture marker."""
    m = FURNITURE.search(text)
    if m:
        text = text[:m.start()]
    # The leading form leaves a bare page number behind the sentence.
    return re.sub(r"\s*\d{1,4}\s*$", "", text).strip()


GRADES = {"high": "High", "moderate": "Moderate", "low": "Low",
          "mdoerate": "Moderate", "modetate": "Moderate"}   # source typos
TYPES = {"regional": "Regional", "local": "Local",
         "corridor": "Corridor", "secondary": "Secondary"}  # last two undocumented


def fetch(url: str = URL, cache: Path = CACHE) -> Path:
    """Download the PDF once and keep it. It is a static published appendix."""
    if cache.exists() and cache.stat().st_size > 0:
        logger.info("using cached %s", cache)
        return cache
    import requests

    cache.parent.mkdir(parents=True, exist_ok=True)
    resp = requests.get(url, headers={"User-Agent": UA}, timeout=60)
    resp.raise_for_status()
    cache.write_bytes(resp.content)
    logger.info("fetched %s (%d bytes) -> %s", url, len(resp.content), cache)
    return cache


def parse(pdf_path: Path) -> pd.DataFrame:
    """Extract one row per corridor, recommendation text included."""
    import pypdfium2 as pdfium

    doc = pdfium.PdfDocument(str(pdf_path))
    text = "\n".join(doc[i].get_textpage().get_text_range() for i in range(len(doc)))

    matches = list(ROW.finditer(text))
    if len(matches) < 100:
        raise RuntimeError(f"only {len(matches)} rows matched — has the PDF layout changed?")

    rows, repaired, trimmed = [], [], []
    for i, m in enumerate(matches):
        risk_raw, value_raw, type_raw = m.group(2), m.group(3), m.group(4)
        risk = GRADES.get(risk_raw.lower())
        value = GRADES.get(value_raw.lower())
        ctype = TYPES.get(type_raw.lower())
        if risk is None or value is None or ctype is None:
            continue                      # not a table row, e.g. prose that fits the shape
        for raw, clean in ((risk_raw, risk), (value_raw, value), (type_raw, ctype)):
            if raw != clean:
                repaired.append(f"id {m.group(1)}: {raw!r} -> {clean!r}")
        # The recommendation runs from the end of this row's fixed fields to the
        # start of the next row, so slice between matches rather than trying to
        # express "paragraph" as a regex.
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        rec = _strip_furniture(" ".join(text[m.end():end].split()))
        if FURNITURE.search(" ".join(text[m.end():end].split())):
            trimmed.append(int(m.group(1)))
        rows.append({
            "gin_id": int(m.group(1)),
            "risk_of_development_j": risk,
            "ecological_value_j": value,
            "corridor_type_j": ctype,
            "target_width_m_j": int(m.group(5)),
            "recommendation": rec,
        })

    if repaired:
        logger.warning("normalised %d field(s) in the source document: %s",
                       len(repaired), "; ".join(repaired))
    if trimmed:
        logger.info("stripped page furniture from %d recommendations (page-boundary "
                    "rows): ids %s", len(trimmed), trimmed)
    df = pd.DataFrame(rows)
    dupes = df.gin_id.duplicated().sum()
    if dupes:
        logger.warning("%d duplicate gin_id rows — keeping the first of each", dupes)
        df = df.drop_duplicates("gin_id")
    return df.sort_values("gin_id").reset_index(drop=True)


def verify_against_layer(j: pd.DataFrame,
                         corridors_gpkg: Path = paths.CORRIDORS_ANALYSIS) -> dict:
    """Confirm ``id`` is the GIN id and ``objectid`` is not, by attribute agreement."""
    import geopandas as gpd

    g = gpd.read_file(corridors_gpkg)
    mine = pd.DataFrame(g[["objectid", "id", "ecological_value",
                           "risk_of_development", "corridor_type", "target_width_m"]])
    pairs = [("ecological_value", "ecological_value_j"),
             ("risk_of_development", "risk_of_development_j"),
             ("corridor_type", "corridor_type_j"),
             ("target_width_m", "target_width_m_j")]

    def agreement(key_col: str) -> float:
        left = mine.assign(gin_id=pd.to_numeric(mine[key_col], errors="coerce"))
        m = left.merge(j, on="gin_id", how="inner")
        if m.empty:
            return 0.0
        scores = []
        for a, b in pairs:
            x = m[a].astype(str).str.strip().str.lower()
            y = m[b].astype(str).str.strip().str.lower()
            scores.append((x == y).mean())
        return float(sum(scores) / len(scores))

    on_id, on_oid = agreement("id"), agreement("objectid")
    logger.info("attribute agreement with Appendix J: on `id` %.1f%%, on `objectid` %.1f%%",
                100 * on_id, 100 * on_oid)
    if on_id < 0.9 or on_id <= on_oid:
        raise RuntimeError(
            f"`id` should be the GIN key but agreement is {on_id:.1%} vs "
            f"{on_oid:.1%} on objectid — do not trust the join")
    return {"agreement_on_id": on_id, "agreement_on_objectid": on_oid}


def run(out: Path = OUT) -> pd.DataFrame:
    j = parse(fetch())
    verify_against_layer(j)
    out.parent.mkdir(parents=True, exist_ok=True)
    j.to_csv(out, index=False)
    logger.info("wrote %s (%d corridors)", out, len(j))
    return j


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--out", type=Path, default=OUT)
    p.add_argument("-v", "--verbose", action="store_true")
    a = p.parse_args()
    logging.basicConfig(level=logging.INFO if a.verbose else logging.WARNING,
                        format="%(levelname)s %(name)s: %(message)s")
    j = run(a.out)
    print("=" * 72)
    print(f"Appendix J: {len(j)} GIN corridors, ids {j.gin_id.min()}-{j.gin_id.max()}")
    print(f"  ecological value: {j.ecological_value_j.value_counts().to_dict()}")
    print(f"  corridor type   : {j.corridor_type_j.value_counts().to_dict()}")
    print(f"  target width    : {j.target_width_m_j.min()}-{j.target_width_m_j.max()} m")
    print(f"  recommendation text present for {(j.recommendation.str.len() > 20).sum()}")
    print(f"\n  -> {a.out}")


if __name__ == "__main__":
    main()
