#!/usr/bin/env python3
"""Word count for the MEE limit: main text INCLUDING references, excluding SI.

texcount is not installed and neither is pdftotext, so this counts the source
the way texcount would: body only (never the preamble), comments stripped,
markup stripped, tabular *data* excluded but \\caption text included --- the
plan's budget counts captions, so this does too. References are counted from
the .bbl that tectonic generates, which is the real rendered bibliography
rather than a guess from the .bib.

Usage:  python3 wordcount.py paper-a/main.tex
"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def strip_markup(t: str) -> str:
    t = re.sub(r"\\[a-zA-Z]+\*?(\[[^\]]*\])?", " ", t)
    t = re.sub(r"[{}$\\&_^~#]", " ", t)
    return t


def count(text: str) -> int:
    return len(strip_markup(text).split())


def resolve_dualsec(src: str) -> str:
    r"""Keep only the branch \dualsec{a}{b} actually typesets.

    \dualsec takes both headings and prints one, chosen by \ifsciencefair, which
    build.sh leaves false for the journal build. Counting the raw source counts
    both, inflating every dual-titled heading by roughly its own length.
    """
    out, i = [], 0
    while True:
        m = re.compile(r"\\dualsec\{").search(src, i)
        if not m:
            out.append(src[i:])
            return "".join(out)
        out.append(src[i:m.start()])
        args = []
        j = m.end() - 1
        for _ in range(2):
            depth, start = 0, j
            while j < len(src):
                if src[j] == "{":
                    depth += 1
                elif src[j] == "}":
                    depth -= 1
                    if depth == 0:
                        j += 1
                        break
                j += 1
            args.append(src[start + 1:j - 1])
        out.append(args[0])                             # \sciencefairfalse branch
        i = j


def resolve_anonymous(src: str) -> str:
    r"""Drop \ifanonymous\else ... \fi blocks, which the journal build discards.

    The Key Points and the Funding statement are preprint-only and sit inside
    such blocks. They are typeset for EarthArXiv and not for MEE, so counting
    them against MEE's ceiling reports the paper as over the limit when the file
    that would be uploaded is comfortably under it. Same failure as \dualsec
    above: the source carries both branches and only one is ever printed.

    Deliberately narrow. It handles the one form actually used here,
    \ifanonymous\else BODY \fi with nothing in the true branch, and leaves any
    other conditional alone rather than guessing.
    """
    out, i = [], 0
    while True:
        m = re.compile(r"\\ifanonymous\s*\\else").search(src, i)
        if not m:
            out.append(src[i:])
            return "".join(out)
        out.append(src[i:m.start()])
        depth, j = 1, m.end()
        while j < len(src) and depth:
            nxt = re.compile(r"\\if[a-zA-Z]*|\\fi").search(src, j)
            if not nxt:
                raise SystemExit("unbalanced \\ifanonymous ... \\fi in the source")
            depth += 1 if nxt.group(0) != r"\fi" else -1
            j = nxt.end()
        i = j


def body_words(tex: Path) -> tuple[int, int]:
    src = tex.read_text()
    src = src.split(r"\begin{document}", 1)[1]          # never count the preamble
    src = resolve_dualsec(src)
    src = resolve_anonymous(src)
    src = "\n".join(l for l in src.split("\n") if not l.strip().startswith("%"))
    src = re.sub(r"(?<!\\)%.*", "", src)

    # Captions nest braces (\texttt{}, \ref{}, ...), so a lazy .*? regex stops
    # at the first inner brace and silently undercounts. Match balanced braces.
    def captions_in(chunk: str) -> int:
        total = 0
        for m in re.finditer(r"\\caption\{", chunk):
            i, depth = m.end(), 1
            while i < len(chunk) and depth:
                if chunk[i] == "{" and chunk[i - 1] != "\\":
                    depth += 1
                elif chunk[i] == "}" and chunk[i - 1] != "\\":
                    depth -= 1
                i += 1
            total += count(chunk[m.end():i - 1])
        return total

    captions = 0
    # Pull captions out of floats first, then drop the float bodies (the
    # tabular data is not prose and no journal counts it as words).
    for env in ("table", "figure", "longtable"):
        def repl(m):
            nonlocal captions
            captions += captions_in(m.group(0))
            return " "
        src = re.sub(r"\\begin\{" + env + r"\*?\}.*?\\end\{" + env + r"\*?\}",
                     repl, src, flags=re.S)
    return count(src), captions


def bbl_words(tex: Path) -> int:
    """Compile in a scratch dir keeping intermediates, and count the .bbl."""
    if not shutil.which("tectonic"):
        return -1
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        shutil.copy(tex, d / "m.tex")
        shutil.copy(tex.parent / "references.bib", d / "references.bib")
        if (tex.parent / "figures").is_dir():
            shutil.copytree(tex.parent / "figures", d / "figures")
        subprocess.run(["tectonic", "-X", "compile", "m.tex", "--outdir", ".",
                        "--keep-intermediates"], cwd=d, capture_output=True)
        bbl = d / "m.bbl"
        return count(bbl.read_text()) if bbl.exists() else -1


def main() -> None:
    tex = Path(sys.argv[1])
    body, captions = body_words(tex)
    refs = bbl_words(tex)
    print(f"{tex}")
    print(f"  body (incl. abstract, excl. captions/floats) {body:6d}")
    print(f"  float captions                               {captions:6d}")
    print(f"  references (.bbl)                            {refs:6d}")
    total = body + captions + max(refs, 0)
    print(f"  TOTAL counted against the limit              {total:6d}")
    print(f"  {'UNDER' if total < 8000 else 'OVER'} the 8,000-word MEE ceiling"
          f" ({8000 - total:+d})")


if __name__ == "__main__":
    main()
