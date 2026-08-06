/* ===========================================================================
   AP Physics 1 — the three views this centre adds
   ===========================================================================

   The shared machinery in ../shared/centre.js has no idea what an equation
   sheet or a timed exam is, and should not: it is the study engine, and these
   are this course's furniture. They are registered through the documented
   extension point — Centre.VIEWS / AFTER / CLICKS, between loading the
   machinery and calling boot().

   This file is loaded by a CLASSIC <script src>, like everything else here.
   Nothing in this centre may become a module, a bundle, or a network request.

     formula   the provided equation sheet, plus the equations it does not give
     exam      a timed simulator in the exam's real shape
     units     the course at a glance, in CED order, with exam weighting

   =========================================================================== */
"use strict";
(function(){

var C = Centre, esc = C.esc, md = C.md, para = C.para;

/* Persisted state lives under its own key and is created on first touch, so a
   browser that has been studying since before this view existed does not need
   a migration. */
function exState(){
  var S = C.state;
  if (!S.exams) S.exams = {runs:[], live:null};
  return S.exams;
}

function fmtClock(ms){
  if (ms < 0) ms = 0;
  var t = Math.round(ms/1000), m = Math.floor(t/60), s = t % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}

/* ===========================================================================
   VIEW · FORMULA SHEET
   The point of this view is not to hold the equations — the exam hands you
   those. It is to tell you WHICH ones you are handed, which you are not, and
   what in a question tells you to reach for one rather than its neighbour.
   =========================================================================== */

function eqCard(e){
  var vars = "";
  if (e.vars && e.vars.length){
    var bits = [];
    for (var i=0;i<e.vars.length;i++)
      bits.push('<span class="eqv"><b>' + md("$" + e.vars[i].sym + "$") + '</b> ' +
                esc(e.vars[i].is) + '</span>');
    vars = '<div class="eqvars">' + bits.join("") + '</div>';
  }
  return '<div class="eqcard' + (e.given ? '' : ' notgiven') + '">' +
    '<div class="eqhead">' +
      '<div class="eqname">' + esc(e.name) + '</div>' +
      (e.given
        ? '<span class="pill p-green"><span class="dot"></span>on the sheet</span>'
        : '<span class="pill p-red"><span class="dot"></span>NOT on the sheet</span>') +
    '</div>' +
    '<div class="eqtex">' + md("$$" + e.tex + "$$") + '</div>' +
    vars +
    (e.whenToUse ? '<div class="eqwhen"><strong>Reach for it when.</strong> ' + md(e.whenToUse) + '</div>' : '') +
    (e.note ? '<div class="eqnote">' + md(e.note) + '</div>' : '') +
  '</div>';
}

C.VIEWS.formula = function(arg){
  var i, e;

  /* Group by the sheet's own sections, then by unit within "general". The
     ordering is the sheet's, not ours — a student looking for an equation in
     the exam room will be scanning the real layout, and a study copy that
     reorders it is training the wrong search. */
  var sections = [], byS = {};
  for (i=0;i<EQUATIONS.length;i++){
    e = EQUATIONS[i];
    var k = e.section || "Other";
    if (!byS[k]){ byS[k] = []; sections.push(k); }
    byS[k].push(e);
  }

  var missing = [];
  for (i=0;i<EQUATIONS.length;i++) if (!EQUATIONS[i].given) missing.push(EQUATIONS[i]);

  var html = '<div class="page">' +
    '<div class="title"><span class="emo">📐</span><h1>Formula sheet</h1></div>' +
    '<p class="lede">Every equation you are handed in the exam room, what each symbol means, ' +
      'and the cue that tells you to reach for this one rather than the one beside it. ' +
      'The equations you are <em>not</em> handed are marked, and there are ' + missing.length + ' of them.</p>';

  /* md(), not esc(): these two fields carry $maths$ like every other prose field
     on the page, and escaping them printed the dollar signs. */
  html += '<div class="note info" style="margin-top:20px"><strong>What you get, and when.</strong> ' +
    md(EXAM.sheet || "The Table of Information is provided.") + ' ' + md(EXAM.calculator || "") +
    ' Knowing which equations are printed is worth real marks: the ones that are not are the ones ' +
    'worth carrying in your head, and there is no credit for rederiving something you were about ' +
    'to be given.</div>';

  if (missing.length){
    html += '<h2 class="sec">Not on the sheet — learn these</h2>' +
      '<div class="eqgrid">';
    for (i=0;i<missing.length;i++) html += eqCard(missing[i]);
    html += '</div>';
  }

  for (var s=0;s<sections.length;s++){
    var list = byS[sections[s]], any = false;
    for (i=0;i<list.length;i++) if (list[i].given) any = true;
    /* The not-given entries carry a section of their own and are already shown
       above, so without this the page printed that heading over an empty grid. */
    if (!any) continue;
    html += '<h2 class="sec">' + esc(sections[s]) + '</h2><div class="eqgrid">';
    for (i=0;i<list.length;i++) if (list[i].given) html += eqCard(list[i]);
    html += '</div>';
  }

  return html + '</div>';
};

/* ===========================================================================
   VIEW · UNITS
   Replaces the project centre's "Numbers" page: the at-a-glance reference for
   what the course is and how much of the exam each part is worth.
   =========================================================================== */

C.VIEWS.units = function(){
  var i, j, html = '<div class="page">' +
    '<div class="title"><span class="emo">🧭</span><h1>Units</h1></div>' +
    '<p class="lede">The course in the order the College Board teaches it, with what each unit ' +
      'is worth on the multiple-choice section. Weightings are ranges because the exam varies ' +
      'year to year — treat them as where to spend your time, not as a promise.</p>';

  /* Mastery per unit, computed from the same scheduler everything else uses, so
     this page cannot disagree with the Progress page. */
  html += '<div class="tscroll" style="margin-top:22px"><table class="t">' +
    '<tr><th>Unit</th><th>Topics</th><th class="n">MC weight</th><th class="n">Concepts</th><th>Where you are</th></tr>';
  for (i=0;i<UNITS.length;i++){
    var u = UNITS[i], cs = [], solid = 0;
    for (j=0;j<CONCEPTS.length;j++) if (CONCEPTS[j].group === u.group) cs.push(CONCEPTS[j]);
    for (j=0;j<cs.length;j++) if (C.conceptMastery(cs[j].id) >= 0.8) solid++;
    var pct = cs.length ? Math.round(100*solid/cs.length) : 0;
    /* The router has no query strings, so a unit links to its first concept
       rather than to a filtered list. That is a working deep link; a
       `#/learn?g=u3` would silently fall back to the overview. */
    var href = cs.length ? "#/learn/" + cs[0].id : "#/learn";
    html += '<tr>' +
      '<td><a href="' + esc(href) + '"><b>' + esc(u.n) + '. ' + esc(u.title) + '</b></a>' +
        '<div class="faint" style="font-size:12px;margin-top:2px">' + esc(u.gist) + '</div></td>' +
      '<td class="faint" style="font-size:12.5px">' + esc(u.topics) + '</td>' +
      '<td class="n"><b>' + esc(u.weight) + '</b></td>' +
      '<td class="n">' + cs.length + '</td>' +
      '<td><div class="ubar"><i style="width:' + pct + '%"></i></div>' +
        '<span class="faint" style="font-size:12px">' + solid + ' of ' + cs.length + ' solid</span></td>' +
    '</tr>';
  }
  html += '</table></div>';

  html += '<h2 class="sec">Where the marks are</h2>' +
    '<p class="muted" style="max-width:46rem;font-size:14px;line-height:1.7">' +
    'Units 2 and 3 — dynamics and energy — are worth ' + esc(UNITS[1].weight) + ' and ' +
    esc(UNITS[2].weight) + ' between them, more than a third of the multiple-choice section. ' +
    'Unit 8, fluids, is worth as much as kinematics and is the unit most older study material ' +
    'does not cover at all. Units 6 and 7 are small in weighting and large in topic count, which ' +
    'means shallow coverage of a lot of ideas rather than deep coverage of a few.</p>';

  html += '<h2 class="sec">The science practices</h2>' +
    '<p class="muted" style="max-width:46rem;font-size:14px;line-height:1.7">' +
    'Every exam question is aligned to a practice as well as to content. They are what the exam ' +
    'thinks it is testing, and the free-response section is organised by them.</p>' +
    '<div class="grid g3" style="margin-top:14px">';
  for (i=0;i<PRACTICES.length;i++){
    html += '<div class="card"><div style="font-weight:600;font-size:14px">' +
      esc(PRACTICES[i].code) + ' — ' + esc(PRACTICES[i].name) + '</div>' +
      '<p class="muted" style="margin:6px 0 0;font-size:13px;line-height:1.55">' +
      esc(PRACTICES[i].gist) + '</p></div>';
  }
  html += '</div>';

  return html + '</div>';
};

/* ===========================================================================
   VIEW · EXAM SIMULATOR
   The exam's real shape, in the exam's real time. Nothing here is adaptive and
   nothing is gentle: the value of a simulator is entirely in it being the same
   length and the same pressure as the thing it simulates.
   =========================================================================== */

/* Sample the MCQ bank toward the CED's own unit weighting rather than uniformly.
   A 42-question exam that is one-eighth kinematics is not this exam. */
function buildMCQ(n, seed){
  var i, want = {}, out = [], byUnit = {}, u;
  for (i=0;i<UNITS.length;i++){
    want[UNITS[i].group] = UNITS[i].share;
    byUnit[UNITS[i].group] = [];
  }
  for (i=0;i<MCQBANK.length;i++){
    u = MCQBANK[i].unit;
    if (byUnit[u]) byUnit[u].push(MCQBANK[i]);
  }
  for (u in byUnit){
    if (!Object.prototype.hasOwnProperty.call(byUnit, u)) continue;
    var take = Math.round(n * want[u]), pool = C.shuffle(byUnit[u], seed + u.length);
    for (i=0;i<take && i<pool.length;i++) out.push(pool[i]);
  }
  /* Top up from whatever is left if the bank could not fill a unit's share, and
     say so rather than silently serving a short exam. */
  if (out.length < n){
    var used = {}, k;
    for (i=0;i<out.length;i++) used[out[i].id] = 1;
    var rest = C.shuffle(MCQBANK, seed + 7);
    for (k=0;k<rest.length && out.length<n;k++) if (!used[rest[k].id]) out.push(rest[k]);
  }
  return C.shuffle(out, seed + 11).slice(0, n);
}

function buildFRQ(seed){
  var frSec = null, i, j;
  for (i=0;i<EXAM.sections.length;i++) if (EXAM.sections[i].kind === "frq") frSec = EXAM.sections[i];
  if (!frSec) return [];
  var out = [];
  for (i=0;i<frSec.items.length;i++){
    var want = frSec.items[i].type, pool = [];
    for (j=0;j<FRQBANK.length;j++) if (FRQBANK[j].type === want) pool.push(FRQBANK[j]);
    if (pool.length) out.push(C.shuffle(pool, seed + i)[0]);
  }
  return out;
}

function mcSection(){ for (var i=0;i<EXAM.sections.length;i++) if (EXAM.sections[i].kind === "mcq") return EXAM.sections[i]; return null; }
function frSection(){ for (var i=0;i<EXAM.sections.length;i++) if (EXAM.sections[i].kind === "frq") return EXAM.sections[i]; return null; }

function startRun(mode){
  var seed = Math.floor(Date.now()/1000), mc = mcSection(), fr = frSection();
  var live = {
    mode: mode,                       /* "full" | "mc" | "fr" */
    started: Date.now(),
    stage: (mode === "fr") ? "fr" : "mc",
    i: 0,
    answers: {},                      /* mcq id -> chosen index */
    flags: {},
    frScores: {},                     /* frq id -> {ptId:true} */
    mcq: (mode === "fr") ? [] : buildMCQ(mc ? mc.n : 42, seed),
    frq: (mode === "mc") ? [] : buildFRQ(seed),
    deadline: 0
  };
  live.deadline = Date.now() + 60000 * (live.stage === "mc" ? (mc ? mc.minutes : 85) : (fr ? fr.minutes : 95));
  exState().live = live;
  C.save();
  return live;
}

/* ---- the landing page ---------------------------------------------------- */
function examHome(){
  var mc = mcSection(), fr = frSection(), i;
  var ex = exState(), runs = ex.runs || [];
  var short = MCQBANK.length < (mc ? mc.n : 42);

  var html = '<div class="page">' +
    '<div class="title"><span class="emo">⏱️</span><h1>Exam simulator</h1></div>' +
    '<p class="lede">The real shape, at the real length, on a real clock. ' +
      esc(mc ? mc.n : 42) + ' multiple-choice questions in ' + esc(mc ? mc.minutes : 85) +
      ' minutes, then ' + (fr ? fr.items.length : 4) + ' free-response questions in ' +
      esc(fr ? fr.minutes : 95) + ' minutes for ' + esc(fr ? fr.points : 40) + ' points. ' +
      'The free-response answers are scored against a guideline point by point, not by feel.</p>';

  if (ex.live){
    html += '<div class="note info" style="margin-top:18px"><strong>You have an exam in progress.</strong><br>' +
      'Started ' + esc(C.fmtDate(ex.live.started)) + ', in the ' +
      (ex.live.stage === "mc" ? "multiple-choice" : "free-response") + ' section. ' +
      '<a href="#/exam/run">Resume it</a>, or ' +
      '<a href="#" data-act="abandon">abandon it</a>.</div>';
  }

  html += '<div class="grid g3" style="margin-top:22px">' +
    '<a class="card hoverable" href="#/exam/start-full" style="color:inherit">' +
      '<div style="font-weight:600;font-size:15px">Full exam</div>' +
      '<p class="muted" style="margin:6px 0 0;font-size:13px;line-height:1.55">Both sections back to back, ' +
        Math.round((EXAM.totalMinutes||180)/60) + ' hours. The only version that tells you anything about stamina.</p></a>' +
    '<a class="card hoverable" href="#/exam/start-mc" style="color:inherit">' +
      '<div style="font-weight:600;font-size:15px">Section I only</div>' +
      '<p class="muted" style="margin:6px 0 0;font-size:13px;line-height:1.55">' + esc(mc ? mc.n : 42) +
        ' questions, ' + esc(mc ? mc.minutes : 85) + ' minutes. About two minutes each — the pacing is the test.</p></a>' +
    '<a class="card hoverable" href="#/exam/start-fr" style="color:inherit">' +
      '<div style="font-weight:600;font-size:15px">Section II only</div>' +
      '<p class="muted" style="margin:6px 0 0;font-size:13px;line-height:1.55">Four questions, ' +
        esc(fr ? fr.minutes : 95) + ' minutes, one of each type.</p></a>' +
  '</div>';

  html += '<h2 class="sec">The four free-response types</h2><div class="grid g2">';
  if (fr) for (i=0;i<fr.items.length;i++){
    var it = fr.items[i];
    html += '<div class="card"><div style="display:flex;gap:8px;align-items:baseline">' +
      '<b style="font-size:15px">' + esc(it.type) + '</b>' +
      '<span class="faint" style="font-size:12px;margin-left:auto">' + esc(it.points) + ' pts · ' +
        esc(it.minutes) + ' min</span></div>' +
      '<p class="muted" style="margin:8px 0 0;font-size:13px;line-height:1.6">' + md(it.does) + '</p>' +
      (it.scoring ? '<p class="faint" style="margin:8px 0 0;font-size:12.5px;line-height:1.55">' + md(it.scoring) + '</p>' : '') +
    '</div>';
  }
  html += '</div>';

  html += '<div class="note" style="margin-top:22px"><strong>How Section II is really taken.</strong><br>' +
    esc(EXAM.administration || "") + ' So the honest way to use this view is to work the free-response ' +
    'questions on paper, with a pencil, and use the box here only for the answer you would have ' +
    'written. Typing a derivation you would have handwritten is practising the wrong motor task.</div>';

  if (short){
    html += '<div class="note danger" style="margin-top:14px"><strong>The bank is short.</strong><br>' +
      'There are ' + MCQBANK.length + ' multiple-choice questions written, and a full section needs ' +
      esc(mc ? mc.n : 42) + '. A simulated Section I will repeat questions to reach length. ' +
      'That is a limit of this study site, not of the exam.</div>';
  }

  if (runs.length){
    html += '<h2 class="sec">Your attempts</h2><div class="tscroll"><table class="t">' +
      '<tr><th>When</th><th>What</th><th class="n">MC</th><th class="n">FR</th><th class="n">Composite</th></tr>';
    for (i=runs.length-1;i>=0 && i>runs.length-11;i--){
      var r = runs[i];
      html += '<tr><td>' + esc(C.fmtDate(r.t)) + '</td><td>' + esc(r.mode === "full" ? "Full exam" :
        r.mode === "mc" ? "Section I" : "Section II") + '</td>' +
        '<td class="n">' + (r.mcTotal ? r.mcRight + "/" + r.mcTotal : "—") + '</td>' +
        '<td class="n">' + (r.frTotal ? r.frPts + "/" + r.frTotal : "—") + '</td>' +
        '<td class="n"><b>' + (r.pct === null || r.pct === undefined ? "—" : r.pct + "%") + '</b></td></tr>';
    }
    html += '</table></div>';
  }

  return html + '</div>';
};

/* ---- the running exam ----------------------------------------------------- */
function runView(){
  var live = exState().live;
  if (!live) return '<div class="page"><p class="empty">No exam in progress.</p>' +
    '<div class="btnrow"><a class="btn" href="#/exam">Back</a></div></div>';

  return live.stage === "mc" ? mcView(live)
       : live.stage === "fr" ? frView(live)
       : reviewView(live);
}

function mcView(live){
  var q = live.mcq[live.i];
  if (!q) return '<div class="page"><p class="empty">This bank has no questions.</p></div>';

  var i, nav = '<div class="qnav">';
  for (i=0;i<live.mcq.length;i++){
    var st = live.answers[live.mcq[i].id] !== undefined ? " done" : "";
    if (live.flags[live.mcq[i].id]) st += " flag";
    if (i === live.i) st += " now";
    nav += '<button class="qn' + st + '" data-act="jump" data-i="' + i + '">' + (i+1) + '</button>';
  }
  nav += '</div>';

  var opts = "";
  for (i=0;i<q.options.length;i++){
    var on = live.answers[q.id] === i ? " on" : "";
    opts += '<button class="opt' + on + '" data-act="pick" data-i="' + i + '">' +
      '<span class="optl">' + "ABCD".charAt(i) + '</span>' +
      '<span class="optt">' + md(q.options[i]) + '</span></button>';
  }

  return '<div class="page"><div class="examtop">' +
      '<span class="pill p-blue"><span class="dot"></span>Section I</span>' +
      '<span class="faint">Question ' + (live.i+1) + ' of ' + live.mcq.length + '</span>' +
      '<span class="clock" id="clock">' + fmtClock(live.deadline - Date.now()) + '</span>' +
    '</div>' +
    nav +
    '<div class="stage" style="margin-top:18px">' +
      '<p class="face" style="font-size:17px">' + md(q.stem) + '</p>' +
      '<div class="opts">' + opts + '</div>' +
      '<div class="btnrow" style="margin-top:18px">' +
        '<button class="btn" data-act="prev">Back</button>' +
        '<button class="btn primary" data-act="next">' +
          (live.i === live.mcq.length-1 ? "Finish Section I" : "Next") + '</button>' +
        '<button class="btn ghost" data-act="flagq">' +
          (live.flags[q.id] ? "Unflag" : "Flag for review") + '</button>' +
        '<button class="btn ghost" data-act="endsec" style="margin-left:auto">End section early</button>' +
      '</div>' +
    '</div></div>';
}

function frView(live){
  var q = live.frq[live.i], i, j;
  if (!q) return '<div class="page"><p class="empty">No free-response questions in this bank.</p>' +
    '<div class="btnrow"><a class="btn" href="#/exam">Back</a></div></div>';

  var parts = "";
  if (q.parts && q.parts.length){
    parts = '<ul class="frparts">';
    for (i=0;i<q.parts.length;i++)
      parts += '<li><b>' + esc(q.parts[i].label) + '</b> <span class="faint">(' +
        q.parts[i].points + ' pt' + (q.parts[i].points===1?"":"s") + ')</span> ' + md(q.parts[i].ask) + '</li>';
    parts += '</ul>';
  }

  var shown = live.frShow === q.id;
  var guide = "";
  if (shown){
    var got = live.frScores[q.id] || {};
    guide = '<h2 class="sec">Score it against the guideline</h2>' +
      '<p class="muted" style="font-size:13.5px;max-width:46rem">One line, one point. Tick a line only ' +
      'if what you actually wrote contains it — not if you knew it, not if you meant it. The whole ' +
      'value of an analytic guideline is that it does not let you round yourself up.</p>' +
      '<div class="guide">';
    for (i=0;i<(q.guideline||[]).length;i++){
      var g = q.guideline[i];
      guide += '<div class="gpart"><div class="gplabel">' + esc(g.label) + '</div><ul class="rubric">';
      for (j=0;j<g.points.length;j++){
        var key = g.label + ":" + j;
        guide += '<li><input type="checkbox" data-act="pt" data-k="' + esc(key) + '"' +
          (got[key] ? ' checked' : '') + '> <span>' + md(g.points[j]["for"]) +
          ' <span class="faint">(' + g.points[j].pt + ')</span></span></li>';
      }
      guide += '</ul></div>';
    }
    guide += '</div>';
    if (q.modelAnswer){
      guide += '<details class="notes" style="margin-top:16px"><summary><span data-ico="book"></span>' +
        '<span class="nt-h">A full response</span><span class="nt-s">read it after you have scored yourself</span>' +
        '</summary><div class="prose" style="padding:14px 18px">' + para(q.modelAnswer) + '</div></details>';
    }
  }

  return '<div class="page"><div class="examtop">' +
      '<span class="pill p-purple"><span class="dot"></span>Section II</span>' +
      '<span class="faint">' + esc(q.type) + ' · ' + q.points + ' points · suggested ' + esc(q.minutes) + ' min</span>' +
      '<span class="faint">Question ' + (live.i+1) + ' of ' + live.frq.length + '</span>' +
      '<span class="clock" id="clock">' + fmtClock(live.deadline - Date.now()) + '</span>' +
    '</div>' +
    '<div class="stage" style="margin-top:18px">' +
      '<div class="prose">' + para(q.prompt) + '</div>' +
      parts +
      '<div class="note" style="margin:16px 0">Work this on paper. In the real exam you write ' +
        'Section II by hand in a booklet, and a derivation typed into a box is a different task ' +
        'from a derivation written under a diagram you drew yourself.</div>' +
      (shown ? "" :
        '<div class="btnrow"><button class="btn primary" data-act="showguide">I have finished — show the scoring guideline</button>' +
        '<button class="btn ghost" data-act="nextfr">Skip this one</button></div>') +
      guide +
      (shown ? '<div class="btnrow" style="margin-top:18px">' +
        '<button class="btn primary" data-act="nextfr">' +
        (live.i === live.frq.length-1 ? "Finish and see the report" : "Next question") + '</button></div>' : '') +
    '</div></div>';
}

/* ---- the report ----------------------------------------------------------- */
function scoreRun(live){
  var i, mcRight = 0, mcTotal = live.mcq.length, frPts = 0, frTotal = 0;
  for (i=0;i<live.mcq.length;i++)
    if (live.answers[live.mcq[i].id] === live.mcq[i].answer) mcRight++;
  for (i=0;i<live.frq.length;i++){
    var q = live.frq[i], got = live.frScores[q.id] || {}, k;
    frTotal += q.points;
    for (k in got) if (Object.prototype.hasOwnProperty.call(got, k) && got[k]){
      var bits = k.split(":"), gi, gj;
      for (gi=0;gi<(q.guideline||[]).length;gi++) if (q.guideline[gi].label === bits[0]){
        gj = parseInt(bits[1], 10);
        if (q.guideline[gi].points[gj]) frPts += q.guideline[gi].points[gj].pt;
      }
    }
  }
  /* Both sections are worth half, so a composite is the mean of the two
     fractions — not a mark out of 82, which would silently weight whichever
     section happened to have more items. */
  var parts = [], pct = null;
  if (mcTotal) parts.push(mcRight/mcTotal);
  if (frTotal) parts.push(frPts/frTotal);
  if (parts.length){
    var sum = 0;
    for (i=0;i<parts.length;i++) sum += parts[i];
    pct = Math.round(100 * sum / parts.length);
  }
  return {t:Date.now(), mode:live.mode, mcRight:mcRight, mcTotal:mcTotal,
          frPts:frPts, frTotal:frTotal, pct:pct};
}

function reviewView(live){
  var r = live.report || scoreRun(live), i, j;

  var html = '<div class="page">' +
    '<div class="title"><span class="emo">📋</span><h1>Report</h1></div>' +
    '<div class="grid g3" style="margin-top:20px">';
  if (r.mcTotal) html += '<div class="card stat"><div class="k">Section I</div><div class="v">' +
    r.mcRight + '<span class="faint" style="font-size:15px">/' + r.mcTotal + '</span></div></div>';
  if (r.frTotal) html += '<div class="card stat"><div class="k">Section II</div><div class="v">' +
    r.frPts + '<span class="faint" style="font-size:15px">/' + r.frTotal + '</span></div></div>';
  html += '<div class="card stat"><div class="k">Composite</div><div class="v">' +
    (r.pct === null ? "—" : r.pct + '<span class="faint" style="font-size:15px">%</span>') + '</div></div></div>';

  html += '<div class="note" style="margin-top:18px"><strong>This is not an AP score.</strong><br>' +
    'The College Board sets its 1–5 cut points against the real cohort each year and does not ' +
    'publish the curve in advance. A percentage here is a percentage here.</div>';

  /* Where the marks went, by unit — the only part of a report worth reading. */
  if (r.mcTotal){
    var byU = {};
    for (i=0;i<live.mcq.length;i++){
      var q = live.mcq[i], u = q.unit || "?";
      if (!byU[u]) byU[u] = {n:0, right:0};
      byU[u].n++;
      if (live.answers[q.id] === q.answer) byU[u].right++;
    }
    html += '<h2 class="sec">Where the marks went</h2><div class="tscroll"><table class="t">' +
      '<tr><th>Unit</th><th class="n">Right</th><th class="n">Asked</th></tr>';
    for (i=0;i<UNITS.length;i++){
      var b = byU[UNITS[i].group];
      if (!b) continue;
      html += '<tr><td><a href="#/units">' + esc(UNITS[i].title) + '</a></td>' +
        '<td class="n">' + b.right + '</td><td class="n">' + b.n + '</td></tr>';
    }
    html += '</table></div>';

    html += '<h2 class="sec">Every question you got wrong</h2>';
    var wrong = 0;
    for (i=0;i<live.mcq.length;i++){
      var w = live.mcq[i], picked = live.answers[w.id];
      if (picked === w.answer) continue;
      wrong++;
      html += '<div class="card" style="margin-bottom:12px">' +
        '<div class="prose" style="font-size:15px">' + md(w.stem) + '</div>' +
        '<div class="faint" style="font-size:13px;margin-top:8px">You chose ' +
          (picked === undefined ? '<b>nothing</b>' : '<b>' + "ABCD".charAt(picked) + '</b> — ' + md(w.options[picked])) +
          '. The answer is <b>' + "ABCD".charAt(w.answer) + '</b> — ' + md(w.options[w.answer]) + '.</div>' +
        '<div class="note info" style="margin-top:10px">' + md(w.why) + '</div>' +
        (picked !== undefined && w.whyNot ? '<div class="note danger" style="margin-top:8px"><strong>Why that one was tempting.</strong><br>' +
          md(whyNotFor(w, picked)) + '</div>' : '') +
      '</div>';
    }
    if (!wrong) html += '<p class="muted">None.</p>';
  }

  html += '<div class="btnrow" style="margin-top:22px">' +
    '<a class="btn primary" href="#/exam">Back to the simulator</a>' +
    '<a class="btn" href="#/cards">Drill what you missed</a></div>';

  return html + '</div>';
}

/* whyNot comes in two shapes, because the units were drafted in parallel. Most
   write one line per WRONG option in option order, so the index is the option
   index with the answer skipped. One unit wrote one line per option with a
   blank at the answer. Detect it from the length rather than legislating:
   guessing wrong here silently shows a student the rationale for an option they
   did not pick, which is worse than showing nothing. */
function whyNotFor(q, picked){
  if (!q.whyNot || !q.whyNot.length) return "";
  var perOption = q.options && q.whyNot.length === q.options.length;
  var idx = perOption ? picked : (picked > q.answer ? picked - 1 : picked);
  return q.whyNot[idx] || "";
}

C.VIEWS.exam = function(arg){
  if (arg === "run")        return runView();
  /* The three start routes mutate state and hand straight over to the runner.
     go() sets location.hash, which fires hashchange and re-renders — so what we
     return here is thrown away a moment later. Returning the runner anyway
     means the page is never blank in between. */
  if (arg === "start-full") { startRun("full"); C.go("exam", "run"); return runView(); }
  if (arg === "start-mc")   { startRun("mc");   C.go("exam", "run"); return runView(); }
  if (arg === "start-fr")   { startRun("fr");   C.go("exam", "run"); return runView(); }
  return examHome();
};

/* The clock. One interval, cleared before it is armed, because AFTER runs on
   every render and a second timer would count down twice as fast. */
var tick = null;
C.AFTER.exam = function(arg){
  if (tick) { clearInterval(tick); tick = null; }
  if (arg !== "run") return;
  var live = exState().live;
  if (!live || live.stage === "done") return;
  tick = setInterval(function(){
    var el = document.getElementById("clock");
    if (!el) { clearInterval(tick); tick = null; return; }
    var left = live.deadline - Date.now();
    el.textContent = fmtClock(left);
    if (left <= 0){ clearInterval(tick); tick = null; endSection(live); }
    else if (left < 300000) el.className = "clock low";
  }, 1000);
};

function endSection(live){
  var fr = frSection();
  if (live.stage === "mc" && live.mode === "full" && live.frq.length){
    live.stage = "fr"; live.i = 0;
    live.deadline = Date.now() + 60000 * (fr ? fr.minutes : 95);
  } else {
    live.stage = "done";
    live.report = scoreRun(live);
    var ex = exState();
    ex.runs.push(live.report);
    ex.live = null;
    /* The finished run is kept out of `live` so a reload cannot resume a graded
       exam, but the report has to survive one render to be shown. */
    lastReport = live;
  }
  C.save();
  C.render();
}

var lastReport = null;

C.CLICKS.exam = function(e, arg){
  var t = e.target.closest ? e.target.closest("[data-act]") : null;
  if (!t) return;
  var act = t.getAttribute("data-act");
  var ex = exState(), live = ex.live || lastReport;

  if (act === "abandon"){ ex.live = null; C.save(); C.render(); return; }
  if (!live) return;
  var q = live.stage === "mc" ? live.mcq[live.i] : live.frq[live.i];

  if (act === "pick"){
    live.answers[q.id] = parseInt(t.getAttribute("data-i"), 10);
    C.save(); C.render();
  } else if (act === "jump"){
    live.i = parseInt(t.getAttribute("data-i"), 10); C.save(); C.render();
  } else if (act === "next"){
    if (live.i === live.mcq.length-1) endSection(live);
    else { live.i++; C.save(); C.render(); }
  } else if (act === "prev"){
    if (live.i > 0){ live.i--; C.save(); C.render(); }
  } else if (act === "flagq"){
    live.flags[q.id] = !live.flags[q.id]; C.save(); C.render();
  } else if (act === "endsec"){
    endSection(live);
  } else if (act === "showguide"){
    live.frShow = q.id; C.save(); C.render();
  } else if (act === "pt"){
    var key = t.getAttribute("data-k");
    if (!live.frScores[q.id]) live.frScores[q.id] = {};
    live.frScores[q.id][key] = t.checked;
    C.save();                       /* no re-render: it would drop focus */
  } else if (act === "nextfr"){
    live.frShow = null;
    if (live.i === live.frq.length-1) endSection(live);
    else { live.i++; C.save(); C.render(); }
  }
};

})();
