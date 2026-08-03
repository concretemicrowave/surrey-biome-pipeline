#!/usr/bin/env python3
"""Local study server for the Learning Centre: static files + a grounded tutor.

Run it, open the printed URL, and the page grows a "Ask" drawer. Stop it and the
page is exactly what it was before — a self-contained file you can open from
``file://`` with no network. That asymmetry is deliberate: the thing this is
preparing for is a judging table in April 2027 with no wifi, so the tutor has to
be a study-time convenience that cannot become a dependency.

    export GEMINI_API_KEY=...        # already in ~/.config/zsh/95-secrets.zsh
    ./docs/learn/serve.py            # -> http://127.0.0.1:8000/learn/

**What the model is allowed to see.** ``ALLOW`` below is the whole corpus, and
it deliberately excludes two things:

* ``docs/preprint/**`` — the manuscript is unpublished and under an embargo, and
  ``KNOWN_ISSUES.md`` is the withheld weakness register.
* ``CLAUDE.md`` — it summarises both of the above.

That matters because the Gemini **free tier** trains on what you submit and
human reviewers may read it ("Do not submit sensitive, confidential, or personal
information to the Unpaid Services"). The paid tier does not. If you ever move
this to a paid key you can widen ``ALLOW``, but decide it deliberately rather
than by forgetting.

**Retrieval, not stuffing.** Each concept in the page carries a ``sourceDoc``
path. Rather than sending all 280 KB every turn, the client says which concept
it is on and the server attaches that concept's own text plus the one module it
names. ~12k tokens a turn instead of ~70k, and the answer is better for it:
the model reads the function being asked about instead of skimming everything.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DOCS = REPO / "docs"

API = "https://generativelanguage.googleapis.com/v1beta"
# An alias rather than a pinned version, deliberately. Pinned model names retire
# — ``gemini-2.5-flash`` stopped accepting new keys while still being listed by
# the models endpoint — and this file should not need editing when that happens.
# Override with GEMINI_MODEL if you want a specific one (e.g. gemini-pro-latest).
MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")

# Every file the tutor may be shown, relative to the repo root. Anything not
# matched here is unreachable — the client names a path, the server checks it
# against this list, and an unlisted path is simply dropped rather than errored,
# so a stale sourceDoc degrades to "no source attached" instead of a broken page.
ALLOW = [
    "docs/CORE_NARRATIVE.md",
    "docs/PHASE3_FINDINGS.md",
    "docs/deliverable/README.md",
    "README.md",
    "ARCHITECTURE.md",
    "PHASE3_PLAN.md",
]
ALLOW += [f"src/pipeline/{p.name}" for p in sorted((REPO / "src" / "pipeline").glob("*.py"))]
ALLOW += [f"scripts/{p.name}" for p in sorted((REPO / "scripts").glob("*.py"))]

SYSTEM = """\
You are a tutor for one specific research project: a study of whether scale-free
downscaled climate data (ClimateBC) predicts water stress in the City of Surrey's
Green Infrastructure Network corridors better than coarse grid climate does.

WHO YOU ARE TALKING TO
The student who built it. A rising grade-10 student preparing to defend this work
at a science fair in April 2027. They know the project; what they need is for a
dense sentence to come apart into its parts. Assume intelligence, not background.

HOW TO ANSWER
- Explain the mechanism, not just the fact. "Why is it true" beats "it is true".
- Ground every number and parameter in the material you were given. Quote the
  file and, where it helps, the identifier: `DARK_PROBE_THRESHOLD = 800`.
- If the answer is not in the material, say exactly that and say which file would
  settle it. Do not reason your way to a plausible number. A wrong number here is
  worse than no number, because it will be repeated to a judge.
- The same rule applies to MECHANISM, not just to numbers. Reading what a
  function does tells you what it computes; it does not tell you how much that
  matters on this data. Do not assert that a step has a large effect, or that
  re-running it changes things "completely", unless the material says so. Say
  "the code does X; how much X moves the result on this panel is not in what I
  was given, and <file> would settle it." An invented magnitude is exactly as
  repeatable to a judge as an invented number.
  Worked example of getting this wrong: the KMeans blocking is re-seeded per
  repeat, and it is tempting to say each seed draws a completely different map.
  It does not. `spatial_blocks` passes `n_init=10`, so every call already
  restarts ten times and keeps the best partition, and on 144 fixed corridor
  locations it lands in almost the same place each time. Repeats are worth doing
  because the A-vs-B difference is small next to fold-to-fold variation, not
  because the map is redrawn.
- Distinguish "this result is stable" from "this result is meaningful". They are
  different claims and only the first is usually in evidence.
- Prefer a short answer that lands over a long one that covers everything.
- When a choice was made, the interesting part is usually what was rejected and
  why. The module docstrings often say.

NEVER SAY (these are retracted, unvalidated, or overclaims)
- That CDEI measures soil moisture. It is a relative feature-space index and has
  never been validated against a ground observation at either extent.
- That the corridor stress ranking is validated. It is exploratory and confounded
  with canopy density.
- That the preprint is published or peer-reviewed. It is neither.
- The Phase 2 "NDVI saturates above 0.9 in 87% of corridors" result. It was an
  artifact of subtracting the BOA offset twice, and it is retracted.
- The +0.051 within-corridor anomaly R². It is memorisation; the forward holdout
  gives -1.673.
- That the nine-summer extension confirmed anything. It is a diagnostic that
  failed to reproduce the four-summer relationship.
- That Model A beat Model B over Surrey, or that a consistent A-vs-B result
  would by itself establish "a real climate signal". Over Surrey the paired CI
  spans zero, and per-carving the sign is not even stable: the five repeats give
  -0.000226, -0.000037, -0.000007, +0.000010, +0.000037. More importantly, no
  A-vs-B outcome can be read as evidence about resolution until BOTH
  preconditions in `experiment.verdict()` hold — the models must have skill
  (both Surrey R2 are negative) and the upscale must have changed the predictors
  (it removed ~12% of spatial variance against a 30% gate). Consistency across
  repeats is a statement about stability, never about meaning.
- That Model A is a fine grid, or has cells, or a 750 m resolution. ClimateBC is
  scale-free: latitude, longitude and elevation in, a value for that exact point
  out. The ~375-750 m figure is the effective resolution of the surface it
  interpolates from, not cells anyone receives. Only Model B has cells.
- That a null result means the hypothesis is unsupported. Over Surrey the honest
  verdict is INCONCLUSIVE, which is the weaker and different claim that the
  experiment had nothing to measure. FALSIFIED belongs to the transect, where
  the gates were cleared.

You have not been given the manuscript or the project's internal weakness
register, and you do not need them. If asked something that clearly depends on
them, say so plainly rather than guessing.\
"""


# Where the key lives when the environment doesn't have it. Not every shell that
# can launch this server has sourced your profile — Claude Code's Bash tool, for
# one, aborts the ~/.zshrc loader on its `(N.on)` glob qualifier and therefore
# sources none of ~/.config/zsh/*.zsh. Rather than make "did this shell load your
# profile" a thing you have to think about, look the key up directly.
KEYFILE = Path.home() / ".config" / "zsh" / "95-secrets.zsh"
KEY_RE = r'GEMINI_API_KEY\s*=\s*["\']?([^"\'\s]+)'


def resolve_key() -> str:
    """The API key from the environment, or failing that, from KEYFILE."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key and key != "PASTE_KEY_HERE":
        return key
    try:
        import re

        m = re.search(KEY_RE, KEYFILE.read_text(encoding="utf-8"))
        if m and m.group(1) != "PASTE_KEY_HERE":
            return m.group(1)
    except OSError:
        pass
    return ""


def read_allowed(rel: str) -> str | None:
    """Return the text of an allow-listed repo file, or None."""
    if rel not in ALLOW:
        return None
    p = REPO / rel
    try:
        return p.read_text(encoding="utf-8")
    except OSError:
        return None


def build_prompt(body: dict) -> str:
    """Assemble the grounding block for one question."""
    parts: list[str] = []

    concept = body.get("concept") or {}
    if concept.get("title"):
        parts.append(
            "THE CONCEPT THE STUDENT IS READING\n"
            f"Title: {concept.get('title')}\n\n{concept.get('text', '')}"
        )

    src = concept.get("sourceDoc") or ""
    # sourceDoc is free text and sometimes names two files ("a.py · b.py").
    for token in [t.strip() for t in src.replace("·", " ").split() if t.strip()]:
        text = read_allowed(token)
        if text:
            parts.append(f"SOURCE FILE — {token}\n\n{text}")

    if not parts:
        # Asked from a page with no concept attached: give the spine instead.
        spine = read_allowed("docs/CORE_NARRATIVE.md")
        if spine:
            parts.append("PROJECT NARRATIVE — docs/CORE_NARRATIVE.md\n\n" + spine)

    index = body.get("index") or []
    if index:
        parts.append("EVERY CONCEPT IN THE STUDY GUIDE\n" + "\n".join("- " + str(t) for t in index))

    parts.append("FILES YOU MAY ASK THE STUDENT TO OPEN\n" + "\n".join("- " + f for f in ALLOW))
    return "\n\n---\n\n".join(parts)


def call_gemini(key: str, prompt: str, messages: list[dict]) -> str:
    contents = [
        {"role": "user", "parts": [{"text": "GROUNDING MATERIAL\n\n" + prompt}]},
        {"role": "model", "parts": [{"text": "Read. Ask me anything about it."}]},
    ]
    for m in messages:
        role = "model" if m.get("role") == "model" else "user"
        contents.append({"role": role, "parts": [{"text": str(m.get("text", ""))}]})

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048},
    }
    req = urllib.request.Request(
        f"{API}/models/{MODEL}:generateContent",
        data=json.dumps(payload).encode("utf-8"),
        headers={"content-type": "application/json", "x-goog-api-key": key},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.loads(r.read().decode("utf-8"))

    for cand in data.get("candidates", []):
        chunks = [p.get("text", "") for p in cand.get("content", {}).get("parts", [])]
        joined = "".join(chunks).strip()
        if joined:
            return joined
    # A candidate with no text is usually a safety block or a token cutoff.
    reason = (data.get("candidates") or [{}])[0].get("finishReason", "unknown")
    return f"(No answer came back — finishReason: {reason}.)"


def list_models(key: str) -> list[str]:
    req = urllib.request.Request(f"{API}/models", headers={"x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode("utf-8"))
    return [
        m["name"].split("/")[-1]
        for m in data.get("models", [])
        if "generateContent" in m.get("supportedGenerationMethods", [])
    ]


class Handler(SimpleHTTPRequestHandler):
    def _json(self, code: int, obj: dict) -> None:
        raw = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_POST(self) -> None:  # noqa: N802  (stdlib naming)
        if self.path != "/api/ask":
            self.send_error(404)
            return
        key = resolve_key()
        if not key:
            self._json(503, {"error": (
                "No API key. Put it in " + str(KEYFILE) + " as "
                'export GEMINI_API_KEY="…", or export it in the shell that '
                "starts serve.py, then restart the server."
            )})
            return
        try:
            n = int(self.headers.get("content-length") or 0)
            body = json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, json.JSONDecodeError):
            self._json(400, {"error": "Malformed request."})
            return

        try:
            answer = call_gemini(key, build_prompt(body), body.get("messages") or [])
            self._json(200, {"answer": answer})
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:400]
            hint = ""
            if e.code == 404:
                try:
                    hint = " Models your key can use: " + ", ".join(list_models(key)[:8])
                except Exception:  # noqa: BLE001 - hint is best-effort
                    hint = ""
            self._json(502, {"error": f"Gemini returned {e.code}. {detail}{hint}"})
        except Exception as e:  # noqa: BLE001 - surface anything to the drawer
            self._json(502, {"error": f"{type(e).__name__}: {e}"})

    def log_message(self, fmt: str, *args) -> None:
        if "/api/" in (self.path or ""):
            sys.stderr.write("  ask: %s\n" % (fmt % args))


def main() -> int:
    port = int(os.environ.get("PORT", "8000"))
    key = resolve_key()
    if not key:
        print(f"! No API key in the environment or in {KEYFILE}.")
        print("  The page will serve; the tutor will not answer.\n")
    where = "environment" if os.environ.get("GEMINI_API_KEY", "").strip() else str(KEYFILE)
    srv = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(DOCS)))
    print(f"Learning Centre   http://127.0.0.1:{port}/learn/")
    print(f"model             {MODEL}")
    print(f"key               {'found in ' + where if key else 'MISSING'}")
    print(f"corpus            {len(ALLOW)} files (docs/preprint and CLAUDE.md excluded)")
    print("Ctrl-C to stop.\n")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
