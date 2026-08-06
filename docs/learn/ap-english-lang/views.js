/* ===========================================================================
   AP English Language and Composition — the four views this centre adds
   ===========================================================================

   The shared machinery in ../shared/centre.js is the study engine — router,
   scheduler, calibration, markdown. It knows nothing about analytic rubrics or
   timed essays, and should not. These four views are registered through the
   documented extension point, between loading the machinery and calling boot().

   This file is loaded by a CLASSIC <script src>. Nothing in this centre may
   become a module, a bundle, or a network request.

     rubrics    the three official rubrics, row by row, earn and forfeit
     devices    the terminology reference, honest about what is CED and what is not
     workshop   a timed essay, then self-scoring against the rubric row by row
     drill      passage multiple-choice in the exam's own question stems

   =========================================================================== */
"use strict";
(function(){

var C = Centre, esc = C.esc, md = C.md, para = C.para;

function fmtClock(ms){
  if (ms < 0) ms = 0;
  var t = Math.round(ms/1000), m = Math.floor(t/60), s = t % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}
function rubricById(id){
  for (var i=0;i<RUBRICS.length;i++) if (RUBRICS[i].id === id) return RUBRICS[i];
  return null;
}

/* ===========================================================================
   VIEW · RUBRICS
   The highest-value page in the centre. Most points lost on this exam are lost
   mechanically — a thesis that cannot be argued with, evidence with no
   commentary, a sophistication point chased with vocabulary — and every one of
   those is written down in advance, in these rows.
   =========================================================================== */

function rubricIndex(){
  var i, html = '<div class="page">' +
    '<div class="title"><span class="emo">📊</span><h1>Rubrics</h1></div>' +
    '<p class="lede">Every essay is marked out of six, on three rows, scored independently. ' +
      'That last word is the one that matters: a brilliant Row C cannot rescue a missing Row A, ' +
      'because the reader is not forming an impression — they are asking three separate questions ' +
      'and answering each one yes or no.</p>' +
    '<div class="grid g3" style="margin-top:22px">';

  for (i=0;i<RUBRICS.length;i++){
    var r = RUBRICS[i];
    html += '<a class="card hoverable" href="#/rubrics/' + esc(r.id) + '" style="color:inherit">' +
      '<div style="font-weight:600;font-size:15px">' + esc(r.label) + '</div>' +
      '<div class="faint" style="font-size:12px;margin-top:3px">' + r.points + ' points · ' +
        r.minutes + ' minutes</div>' +
      '<p class="muted" style="margin:8px 0 0;font-size:13px;line-height:1.6">' + md(r.yourJob) + '</p></a>';
  }
  html += '</div>';

  /* The rows side by side, because the interesting fact about this rubric is
     that it is the SAME rubric three times — and the small places where it is
     not are exactly where marks go missing. */
  html += '<h2 class="sec">The same three rows, three times</h2>' +
    '<div class="tscroll"><table class="t"><tr><th>Row</th>';
  for (i=0;i<RUBRICS.length;i++) html += '<th>' + esc(RUBRICS[i].short) + '</th>';
  html += '</tr>';
  var rowNames = ["Row A — Thesis", "Row B — Evidence and Commentary", "Row C — Sophistication"];
  for (var k=0;k<3;k++){
    html += '<tr><td><b>' + esc(rowNames[k]) + '</b></td>';
    for (i=0;i<RUBRICS.length;i++){
      var row = RUBRICS[i].rows[k];
      html += '<td>' + (row ? '<b>' + esc(row.points) + '</b> pt<div class="faint" style="font-size:12px">' +
        esc((row.categories||[]).join(", ")) + '</div>' : "—") + '</td>';
    }
    html += '</tr>';
  }
  html += '</table></div>' +
    '<p class="muted" style="font-size:13px;margin-top:10px;max-width:46rem">The codes are the ' +
    'reporting categories — the course skills each row is actually measuring. Row B is worth four ' +
    'of the six points on every essay, and it is where almost all of the difference between a 3 ' +
    'and a 5 lives.</p>';

  html += '<div class="note" style="margin-top:22px"><strong>Where these words come from.</strong><br>' +
    'The descriptors, decision rules and notes on these pages are quoted from the College Board ' +
    'Course and Exam Description, because on this one page fidelity beats voice — you are going to ' +
    'be scored against these exact sentences. Everything labelled <em>how you earn it</em> and ' +
    '<em>how you lose it</em> is this site’s own commentary, not College Board text.</div>';

  return html + '</div>';
}

function rubricPage(id){
  var r = rubricById(id);
  if (!r) return rubricIndex();
  var i, j, k;

  var html = '<div class="page narrow">' +
    '<div class="eyebrow">Rubric</div>' +
    '<div class="title" style="margin-top:6px"><h1>' + esc(r.label) + '</h1></div>' +
    '<div class="btnrow" style="margin:10px 0 18px">' +
      '<span class="pill p-blue"><span class="dot"></span>' + r.points + ' points</span>' +
      '<span class="pill p-grey"><span class="dot"></span>' + r.minutes + ' minutes</span>' +
      '<a class="btn sm" href="#/workshop/' + esc(r.id) + '">Write one against this</a>' +
    '</div>' +
    '<div class="prose">' + para(r.task) + '</div>';

  for (i=0;i<r.rows.length;i++){
    var row = r.rows[i];
    html += '<h2 class="sec">' + esc(row.name) + ' <span class="faint" style="font-weight:400;font-size:14px">· ' +
      esc(row.points) + ' points · ' + esc((row.categories||[]).join(", ")) + '</span></h2>';

    html += '<div class="levels">';
    for (j=0;j<row.levels.length;j++){
      var lv = row.levels[j];
      html += '<div class="level' + (lv.pts === 0 ? ' zero' : '') + '">' +
        '<div class="lvhead"><span class="lvpts">' + lv.pts + '</span>' + esc(lv.head) + '</div>' +
        '<div class="lvdesc">' + md(lv.descriptor) + '</div>';
      if (lv.bullets && lv.bullets.length){
        html += '<ul class="lvbul">';
        for (k=0;k<lv.bullets.length;k++) html += '<li>' + md(lv.bullets[k]) + '</li>';
        html += '</ul>';
      }
      html += '</div>';
    }
    html += '</div>';

    if (row.notes && row.notes.length){
      html += '<div class="note info"><strong>Additional notes, as the rubric gives them.</strong><ul style="margin:6px 0 0;padding-left:18px">';
      for (k=0;k<row.notes.length;k++) html += '<li>' + md(row.notes[k]) + '</li>';
      html += '</ul></div>';
    }

    html += '<div class="grid g2" style="margin-top:14px">' +
      '<div class="card"><div class="eyebrow">How you earn it</div>' +
        '<div class="prose" style="font-size:14px;margin-top:6px">' + para(row.earn) + '</div></div>' +
      '<div class="card" style="border-color:var(--pill-red-dot)"><div class="eyebrow">How you lose it</div>' +
        '<div class="prose" style="font-size:14px;margin-top:6px">' + para(row.forfeit) + '</div></div>' +
    '</div>';

    if (row.conceptIds && row.conceptIds.length){
      html += '<div class="btnrow" style="margin-top:12px">';
      for (k=0;k<row.conceptIds.length;k++){
        var c = C.byId(row.conceptIds[k]);
        if (c) html += '<a class="btn sm" href="#/learn/' + esc(c.id) + '">' + esc(c.title) + '</a>';
      }
      html += '</div>';
    }
  }

  return html + '</div>';
}

C.VIEWS.rubrics = function(arg){ return arg ? rubricPage(arg) : rubricIndex(); };

/* ===========================================================================
   VIEW · RHETORICAL DEVICES
   A reference that refuses to pretend. The exam gives no credit for naming a
   device, and the College Board does not publish a glossary of these terms —
   so every entry says whether its name appears in the syllabus at all.
   =========================================================================== */

C.VIEWS.devices = function(arg){
  var i, fams = [], byF = {};
  for (i=0;i<DEVICES.length;i++){
    var f = DEVICES[i].family || "other";
    if (!byF[f]){ byF[f] = []; fams.push(f); }
    byF[f].push(DEVICES[i]);
  }
  var named = 0;
  for (i=0;i<DEVICES.length;i++) if (DEVICES[i].cedNamed) named++;

  var html = '<div class="page">' +
    '<div class="title"><span class="emo">🎭</span><h1>Rhetorical devices</h1></div>' +
    '<p class="lede">' + DEVICES.length + ' terms, what each one does to a reader, and the thing ' +
      'it gets confused with. Read the effect, not the name — naming a device is worth nothing on ' +
      'this exam, and a reference that lets you collect names is a reference working against you.</p>';

  html += '<div class="note" style="margin-top:18px"><strong>Where these names come from.</strong><br>' +
    'The College Board does not publish a glossary of device names. It describes skills — word ' +
    'choice, comparisons, syntax, tone, qualification — and the exam asks what a choice ' +
    '<em>does</em>. So of the ' + DEVICES.length + ' terms here, <strong>' + named + '</strong> ' +
    (named === 1 ? 'appears' : 'appear') + ' by name in the course description; the rest are ' +
    'ordinary rhetorical vocabulary, useful for thinking with and not themselves examinable. ' +
    'Each entry says which it is, and each is tagged with the course skill it serves.</div>';

  for (var fi=0; fi<fams.length; fi++){
    html += '<h2 class="sec">' + esc(fams[fi].charAt(0).toUpperCase() + fams[fi].slice(1)) + '</h2>' +
      '<div class="grid g2">';
    var list = byF[fams[fi]];
    for (i=0;i<list.length;i++){
      var d = list[i];
      html += '<div class="card dev">' +
        '<div class="devhead"><b>' + esc(d.term) + '</b>' +
          (d.cedNamed
            ? '<span class="pill p-green"><span class="dot"></span>named in the CED</span>'
            : '<span class="pill p-grey"><span class="dot"></span>not a CED term</span>') +
          (d.source ? '<span class="faint" style="font-size:11.5px">' + esc(d.source) + '</span>' : '') +
        '</div>' +
        '<div class="devdef">' + md(d.def) + '</div>' +
        '<blockquote class="devex">' + md(d.example) + '</blockquote>' +
        '<div class="devattr">' + md(d.exampleAttr) + '</div>' +
        '<div class="deveff"><strong>What it does.</strong> ' + md(d.effect) + '</div>' +
        (d.confusedWith ? '<div class="devconf"><strong>Not to be confused with ' +
          esc(d.confusedWith) + '.</strong> ' + md(d.confusion || "") + '</div>' : '') +
      '</div>';
    }
    html += '</div>';
  }

  return html + '</div>';
};

/* ===========================================================================
   VIEW · ESSAY WORKSHOP
   The prompt, the real clock, a box, and then the rubric with the descriptors
   visible while you score yourself. Attempts are kept so Row B can be watched
   over time, which is the only row that improves slowly enough to need
   watching.
   =========================================================================== */

function wsState(){
  var S = C.state;
  if (!S.essays) S.essays = {live:null, attempts:[]};
  return S.essays;
}
function promptById(id){
  for (var i=0;i<WPROMPTS.length;i++) if (WPROMPTS[i].id === id) return WPROMPTS[i];
  return null;
}

function workshopHome(){
  var ws = wsState(), i, j;
  var html = '<div class="page">' +
    '<div class="title"><span class="emo">✍️</span><h1>Essay workshop</h1></div>' +
    '<p class="lede">One prompt, forty minutes, a box. Then the rubric — with the real descriptors ' +
      'on screen — and you decide, row by row, whether what you wrote earns the point. ' +
      'Every attempt is kept, so you can see whether Row B is moving.</p>';

  if (ws.live){
    var lp = promptById(ws.live.promptId);
    html += '<div class="note info" style="margin-top:18px"><strong>You have an essay in progress</strong>' +
      (lp ? ' — ' + esc(lp.label) : '') + '. <a href="#/workshop/' + esc(ws.live.promptId) + '">Go back to it</a>, ' +
      'or <a href="#" data-act="discard">discard it</a>.</div>';
  }

  for (i=0;i<RUBRICS.length;i++){
    var r = RUBRICS[i], mine = [];
    for (j=0;j<WPROMPTS.length;j++) if (WPROMPTS[j].type === r.id) mine.push(WPROMPTS[j]);
    if (!mine.length) continue;
    html += '<h2 class="sec">' + esc(r.label) + '</h2><div class="grid g2">';
    for (j=0;j<mine.length;j++){
      html += '<a class="card hoverable" href="#/workshop/' + esc(mine[j].id) + '" style="color:inherit">' +
        '<div style="font-weight:600;font-size:14.5px">' + esc(mine[j].label) + '</div>' +
        '<div class="faint" style="font-size:12px;margin-top:4px">' + mine[j].minutes + ' minutes' +
          (mine[j].reading ? ' · ' + mine[j].reading + '-minute reading period' : '') + '</div></a>';
    }
    html += '</div>';
  }

  /* Row-by-row history. The point of storing attempts is this table and
     nothing else: a single essay score is noise, and the trend is not. */
  if (ws.attempts.length){
    html += '<h2 class="sec">Your attempts</h2><div class="tscroll"><table class="t">' +
      '<tr><th>When</th><th>Prompt</th><th class="n">A</th><th class="n">B</th><th class="n">C</th><th class="n">Total</th><th class="n">Words</th></tr>';
    for (i=ws.attempts.length-1;i>=0;i--){
      var a = ws.attempts[i], p = promptById(a.promptId);
      html += '<tr><td>' + esc(C.fmtDate(a.t)) + '</td>' +
        '<td>' + esc(p ? p.label : a.promptId) + '</td>' +
        '<td class="n">' + a.rows[0] + '</td><td class="n">' + a.rows[1] + '</td><td class="n">' + a.rows[2] + '</td>' +
        '<td class="n"><b>' + (a.rows[0]+a.rows[1]+a.rows[2]) + '/6</b></td>' +
        '<td class="n">' + a.words + '</td></tr>';
    }
    html += '</table></div>';

    var bs = [];
    for (i=0;i<ws.attempts.length;i++) bs.push(ws.attempts[i].rows[1]);
    if (bs.length >= 3){
      var early = (bs[0] + bs[1]) / 2, late = (bs[bs.length-1] + bs[bs.length-2]) / 2;
      html += '<p class="muted" style="font-size:13.5px;max-width:46rem;margin-top:12px">' +
        'Row B across your first two attempts averaged <b>' + early.toFixed(1) + '</b>; across your ' +
        'last two, <b>' + late.toFixed(1) + '</b>. Row B is four of the six points and the slowest ' +
        'to move, so this is the number to watch.</p>';
    }
  }

  return html + '</div>';
}

function workshopRun(pid){
  var p = promptById(pid);
  if (!p) return workshopHome();
  var ws = wsState(), i;
  var live = ws.live && ws.live.promptId === pid ? ws.live : null;
  var r = rubricById(p.type);

  /* Not started */
  if (!live){
    var html = '<div class="page narrow">' +
      '<div class="eyebrow">' + esc(r ? r.label : p.type) + '</div>' +
      '<div class="title" style="margin-top:6px"><h1>' + esc(p.label) + '</h1></div>' +
      '<p class="lede">' + p.minutes + ' minutes' +
        (p.reading ? ', after a ' + p.reading + '-minute reading period' : '') +
        '. The clock starts when you press the button and does not stop.</p>' +
      '<div class="note" style="margin-top:16px">' + esc(p.origin) + '</div>' +
      /* Said here rather than buried in a README, because a student pacing
         themselves against these will otherwise calibrate to the wrong load.
         The prompts are original and deliberately shorter than the real ones. */
      '<div class="note danger" style="margin-top:10px"><strong>Shorter than the real thing.</strong><br>' +
        'The exam gives a rhetorical-analysis passage of 600–800 words and synthesis sources of ' +
        'about 500 words each — roughly 2,000 words to read in the 15-minute period. The passages ' +
        'here are about half that. The task is the same and the clock is the same, so this is good ' +
        'practice for the writing; it is <em>not</em> good practice for the reading load.</div>' +
      '<div class="btnrow" style="margin-top:20px">' +
        '<button class="btn primary" data-act="start" data-p="' + esc(pid) + '">Start the clock</button>' +
        '<a class="btn ghost" href="#/workshop">Back</a>' +
        (r ? '<a class="btn ghost" href="#/rubrics/' + esc(r.id) + '">Read the rubric first</a>' : '') +
      '</div>';
    return html + '</div>';
  }

  /* Scoring */
  if (live.stage === "score"){
    return scoreEssay(p, r, live);
  }

  /* Reading period, then writing */
  var reading = live.stage === "reading";
  var body = '<div class="page narrow">' +
    '<div class="examtop">' +
      '<span class="pill ' + (reading ? 'p-yellow' : 'p-blue') + '"><span class="dot"></span>' +
        (reading ? 'Reading period' : 'Writing') + '</span>' +
      '<span class="faint">' + esc(p.label) + '</span>' +
      '<span class="clock" id="clock">' + fmtClock(live.deadline - Date.now()) + '</span>' +
    '</div>' +
    '<div class="prose" style="margin-top:16px">' + para(p.prompt) + '</div>';

  if (p.passage){
    body += '<blockquote class="pg-text" style="margin-top:14px">' + para(p.passage.text) + '</blockquote>' +
      '<div class="pg-attr">' + md(p.passage.cite) + '</div>';
  }
  if (p.sources && p.sources.length){
    body += '<h2 class="sec">The sources</h2>';
    for (i=0;i<p.sources.length;i++){
      var s = p.sources[i];
      body += '<div class="card" style="margin-bottom:10px">' +
        '<div style="display:flex;gap:8px;align-items:baseline">' +
          '<b>' + esc(s.tag) + '</b>' +
          (s.kind && s.kind !== "text" ? '<span class="pill p-purple"><span class="dot"></span>' +
            esc(s.kind) + ', described in words</span>' : '') +
          '<span class="faint" style="font-size:11.5px;margin-left:auto">' + esc(s.cite) + '</span></div>' +
        '<div class="prose" style="font-size:14px;margin-top:8px">' + para(s.text) + '</div></div>';
    }
  }

  if (reading){
    body += '<div class="note info" style="margin-top:18px"><strong>Read, do not write.</strong><br>' +
      'The reading period exists so that you arrive at the first sentence already knowing what you ' +
      'are going to argue. Annotate, pick your sources, decide your line of reasoning. The box ' +
      'opens when the clock does.</div>' +
      '<div class="btnrow" style="margin-top:16px">' +
        '<button class="btn primary" data-act="begin">Start writing now</button></div>';
  } else {
    body += '<textarea class="txt essaybox" id="essaybox" placeholder="Begin.">' +
      esc(live.text || "") + '</textarea>' +
      '<div class="btnrow" style="margin-top:12px">' +
        '<button class="btn primary" data-act="finish">I have finished — score it</button>' +
        '<span class="faint" id="wc" style="margin-left:auto;font-size:12px"></span></div>';
  }

  return body + '</div>';
}

function scoreEssay(p, r, live){
  var i, j, k, got = live.rowScores || {};
  var html = '<div class="page narrow">' +
    '<div class="eyebrow">Scoring</div>' +
    '<div class="title" style="margin-top:6px"><h1>' + esc(p.label) + '</h1></div>' +
    '<p class="lede">The descriptors are on screen because you are meant to read them against what ' +
      'you actually wrote, not against what you meant. Score each row independently. The reader ' +
      'does.</p>';

  html += '<details class="notes" open style="margin-top:16px"><summary><span data-ico="file"></span>' +
    '<span class="nt-h">What you wrote</span><span class="nt-s">' +
    (live.text ? live.text.split(/\s+/).filter(Boolean).length : 0) + ' words</span></summary>' +
    '<div class="prose" style="padding:14px 18px;white-space:pre-wrap">' + esc(live.text || "") + '</div></details>';

  if (r) for (i=0;i<r.rows.length;i++){
    var row = r.rows[i];
    html += '<h2 class="sec">' + esc(row.name) + '</h2><div class="levels">';
    for (j=0;j<row.levels.length;j++){
      var lv = row.levels[j], on = got[row.id] === lv.pts;
      html += '<button class="level pick' + (on ? ' on' : '') + '" data-act="row" data-r="' + esc(row.id) +
        '" data-p="' + lv.pts + '">' +
        '<div class="lvhead"><span class="lvpts">' + lv.pts + '</span>' + esc(lv.head) + '</div>' +
        '<div class="lvdesc">' + md(lv.descriptor) + '</div>';
      if (lv.bullets && lv.bullets.length){
        html += '<ul class="lvbul">';
        for (k=0;k<lv.bullets.length;k++) html += '<li>' + md(lv.bullets[k]) + '</li>';
        html += '</ul>';
      }
      html += '</button>';
    }
    html += '</div>' +
      '<div class="note danger" style="margin-top:10px"><strong>Before you award it.</strong><br>' +
      md(row.forfeit) + '</div>';
  }

  var done = r && r.rows.length === countKeys(got);
  html += '<div class="btnrow" style="margin-top:22px">' +
    '<button class="btn primary"' + (done ? '' : ' disabled') + ' data-act="save">' +
      (done ? 'Save this attempt' : 'Score every row first') + '</button>' +
    '<button class="btn ghost" data-act="discard">Discard</button></div>';

  return html + '</div>';
}
function countKeys(o){ var n = 0, k; for (k in o) if (Object.prototype.hasOwnProperty.call(o,k)) n++; return n; }

C.VIEWS.workshop = function(arg){ return arg ? workshopRun(arg) : workshopHome(); };

var wtick = null;
C.AFTER.workshop = function(arg){
  if (wtick){ clearInterval(wtick); wtick = null; }
  var box = document.getElementById("essaybox");
  if (box){
    var wc = document.getElementById("wc");
    var count = function(){
      var live = wsState().live;
      if (live) live.text = box.value;
      if (wc) wc.textContent = box.value.split(/\s+/).filter(Boolean).length + " words";
    };
    box.addEventListener("input", count);
    count();
    box.focus();
  }
  var el = document.getElementById("clock");
  if (!el) return;
  var live = wsState().live;
  if (!live || live.stage === "score") return;
  wtick = setInterval(function(){
    var c = document.getElementById("clock");
    if (!c){ clearInterval(wtick); wtick = null; return; }
    var left = live.deadline - Date.now();
    c.textContent = fmtClock(left);
    if (left < 300000) c.className = "clock low";
    if (left <= 0){
      clearInterval(wtick); wtick = null;
      if (live.stage === "reading") beginWriting(live);
      else { live.stage = "score"; C.save(); C.render(); }
    }
  }, 1000);
};

function beginWriting(live){
  var p = promptById(live.promptId);
  live.stage = "write";
  live.deadline = Date.now() + 60000 * (p ? p.minutes : 40);
  C.save();
  C.render();
}

C.CLICKS.workshop = function(e, arg){
  var t = e.target.closest ? e.target.closest("[data-act]") : null;
  if (!t) return;
  var act = t.getAttribute("data-act"), ws = wsState(), live = ws.live;

  if (act === "start"){
    var pid = t.getAttribute("data-p"), p = promptById(pid);
    ws.live = {promptId:pid, stage: p && p.reading ? "reading" : "write", text:"", rowScores:{},
               started:Date.now(),
               deadline: Date.now() + 60000 * (p ? (p.reading || p.minutes) : 40)};
    C.save(); C.render(); return;
  }
  if (!live) return;

  if (act === "begin"){ beginWriting(live); }
  else if (act === "finish"){
    var box = document.getElementById("essaybox");
    if (box) live.text = box.value;
    live.stage = "score"; C.save(); C.render();
  }
  else if (act === "row"){
    live.rowScores[t.getAttribute("data-r")] = parseInt(t.getAttribute("data-p"), 10);
    C.save(); C.render();
  }
  else if (act === "save"){
    var p2 = promptById(live.promptId), r = p2 ? rubricById(p2.type) : null, rows = [];
    if (r) for (var i=0;i<r.rows.length;i++) rows.push(live.rowScores[r.rows[i].id] || 0);
    ws.attempts.push({t:Date.now(), promptId:live.promptId, rows:rows,
                      words: live.text ? live.text.split(/\s+/).filter(Boolean).length : 0,
                      text: live.text});
    ws.live = null; C.save(); C.go("workshop");
  }
  else if (act === "discard"){ ws.live = null; C.save(); C.render(); }
};

/* ===========================================================================
   VIEW · PASSAGE DRILL
   This exam's multiple choice is a skill, not recall, so the drill has to be
   the real question stems on a real passage. The value is entirely in the
   explanations: why the right one is right, and why the one you picked was
   built to be picked.
   =========================================================================== */

function drState(){
  var S = C.state;
  if (!S.drills) S.drills = {};
  return S.drills;
}
function drillById(id){
  for (var i=0;i<DRILLS.length;i++) if (DRILLS[i].id === id) return DRILLS[i];
  return null;
}

C.VIEWS.drill = function(arg){
  var i, d;
  if (!arg){
    var html = '<div class="page">' +
      '<div class="title"><span class="emo">🔍</span><h1>Passage drill</h1></div>' +
      '<p class="lede">The multiple-choice section in its own idiom. Reading sets ask what a writer ' +
        'is doing and why; writing sets hand you a draft and ask which revision does a stated job. ' +
        'Neither rewards recall — both reward reading the question exactly.</p>' +
      '<div class="grid g2" style="margin-top:22px">';
    for (i=0;i<DRILLS.length;i++){
      d = DRILLS[i];
      var st = drState()[d.id];
      html += '<a class="card hoverable" href="#/drill/' + esc(d.id) + '" style="color:inherit">' +
        '<div style="display:flex;gap:8px;align-items:baseline">' +
          '<b style="font-size:15px">' + esc(d.label) + '</b>' +
          '<span class="pill ' + (d.kind === "reading" ? "p-blue" : "p-orange") + '">' +
            '<span class="dot"></span>' + esc(d.kind) + '</span></div>' +
        '<div class="faint" style="font-size:12px;margin-top:6px">' + d.questions.length + ' questions · ' +
          esc(d.passage.cite) + '</div>' +
        (st ? '<div class="faint" style="font-size:12px;margin-top:4px">Last time: ' + st.right +
              '/' + st.n + '</div>' : '') +
      '</a>';
    }
    return html + '</div></div>';
  }

  d = drillById(arg);
  if (!d) return C.VIEWS.drill(null);
  var S = drState();
  if (!S[d.id]) S[d.id] = {picks:{}, n:d.questions.length, right:0};
  var st = S[d.id], q, j;

  var body = '<div class="page narrow">' +
    '<div class="eyebrow">' + esc(d.kind === "reading" ? "Reading set" : "Writing and revision set") + '</div>' +
    '<div class="title" style="margin-top:6px"><h1>' + esc(d.label) + '</h1></div>' +
    '<blockquote class="pg-text' + (d.passage.numbered ? ' numbered' : '') + '" style="margin-top:16px">' +
      para(d.passage.text) + '</blockquote>' +
    '<div class="pg-attr">' + md(d.passage.cite) + '</div>';

  for (i=0;i<d.questions.length;i++){
    q = d.questions[i];
    var picked = st.picks[q.id];
    body += '<div class="drillq"><div class="dqstem"><b>' + (i+1) + '.</b> ' + md(q.stem) +
      '<span class="faint" style="font-size:11.5px;margin-left:8px">' + esc(q.skill) + '</span></div>';
    for (j=0;j<q.options.length;j++){
      var cls = "opt";
      if (picked !== undefined){
        if (j === q.answer) cls += " right";
        else if (j === picked) cls += " wrong";
      }
      body += '<button class="' + cls + '" data-act="pick" data-q="' + esc(q.id) + '" data-i="' + j + '"' +
        (picked !== undefined ? ' disabled' : '') + '>' +
        '<span class="optl">' + "ABCD".charAt(j) + '</span>' +
        '<span class="optt">' + md(q.options[j]) + '</span></button>';
    }
    if (picked !== undefined){
      body += '<div class="note info" style="margin-top:10px"><strong>Why ' +
        "ABCD".charAt(q.answer) + '.</strong> ' + md(q.why) + '</div>';
      if (picked !== q.answer && q.whyNot){
        var idx = picked > q.answer ? picked - 1 : picked;
        if (q.whyNot[idx]) body += '<div class="note danger" style="margin-top:8px"><strong>Why ' +
          "ABCD".charAt(picked) + ' was built to tempt you.</strong> ' + md(q.whyNot[idx]) + '</div>';
      }
    }
    body += '</div>';
  }

  var answered = countKeys(st.picks);
  if (answered === d.questions.length){
    body += '<div class="note" style="margin-top:20px"><strong>' + st.right + ' of ' + st.n +
      '.</strong> The ones you got wrong are worth more of your time than the ones you got right — ' +
      'read what each distractor was doing.</div>' +
      '<div class="btnrow" style="margin-top:14px">' +
        '<button class="btn" data-act="reset" data-d="' + esc(d.id) + '">Clear and try again</button>' +
        '<a class="btn ghost" href="#/drill">Back</a></div>';
  }

  return body + '</div>';
};

C.CLICKS.drill = function(e, arg){
  var t = e.target.closest ? e.target.closest("[data-act]") : null;
  if (!t) return;
  var act = t.getAttribute("data-act"), S = drState();

  if (act === "reset"){
    var did = t.getAttribute("data-d"), dd = drillById(did);
    S[did] = {picks:{}, n: dd ? dd.questions.length : 0, right:0};
    C.save(); C.render(); return;
  }
  if (act !== "pick") return;

  var d = drillById(arg);
  if (!d) return;
  var qid = t.getAttribute("data-q"), pick = parseInt(t.getAttribute("data-i"), 10), i;
  var st = S[d.id];
  if (!st || st.picks[qid] !== undefined) return;
  st.picks[qid] = pick;
  st.right = 0;
  for (i=0;i<d.questions.length;i++)
    if (st.picks[d.questions[i].id] === d.questions[i].answer) st.right++;
  C.save(); C.render();
};

})();
