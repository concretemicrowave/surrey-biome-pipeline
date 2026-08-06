/* ===========================================================================
   Learning Centre — shared machinery
   ===========================================================================

   One study engine, several centres. This file is everything that is NOT the
   teaching material: the router, the state store and its persistence, the
   spaced-repetition scheduler, confidence calibration, the markdown subset and
   the mini-TeX renderer, the icons, number checking, selfCheck, the views, and
   the tutor drawer.

   Each centre ships its own `index.html` carrying only content literals and a
   `CENTRE` config object, links this file with a CLASSIC <script src> — NOT a
   module, because module scripts are blocked by CORS on file:// and the whole
   point of these pages is that they work with no server at all — and then calls
   `Centre.boot()`.

       <link rel="stylesheet" href="../shared/centre.css">
       <script> var CONCEPTS = [...]; var CENTRE = { ... }; </script>
       <script src="../shared/centre.js"></script>
       <script> Centre.boot(); </script>

   Anything a centre wants that this file does not have goes on the `Centre`
   object between those last two tags: `Centre.VIEWS.formula = function(){...}`,
   with a matching entry in `CENTRE.routes`. That gap between load and boot is
   the extension point; there is no other one.
   =========================================================================== */
"use strict";
var Centre = (function(){

/* ---- The centre's declared identity and content ----------------------------
   Read once, here, so the rest of the file can go on referring to CONCEPTS and
   CARDS by name. A centre that does not carry a collection gets an empty one
   rather than a ReferenceError, which is what lets a course centre skip the
   pipeline diagram, the timeline and the labs without touching this file. */
var CENTRE = (typeof window !== "undefined" && window.CENTRE) || {};

var CONCEPTS   = CENTRE.concepts   || [];
var NOTES      = CENTRE.notes      || {};
var CARDS      = CENTRE.cards      || [];
var QUESTIONS  = CENTRE.questions  || [];
var SURFACES   = CENTRE.surfaces   || [];
var ERAS       = CENTRE.eras       || [];
var PROCESS    = CENTRE.process    || [];
var NUMBERS    = CENTRE.numbers    || [];
var SOURCES    = CENTRE.sources    || [];
var PIPE_LANES = CENTRE.pipeLanes  || [];
var PIPE_KINDS = CENTRE.pipeKinds  || {};
var PIPE       = CENTRE.pipe       || [];
var GROUPS     = CENTRE.groups     || [];
var TL_KINDS   = CENTRE.tlKinds    || {};
var TL_ORDER   = CENTRE.tlOrder    || [];
var PRESETS    = CENTRE.presets    || {};
var NEVER_SAY  = CENTRE.neverSay   || [];
var LABS       = CENTRE.labs       || [];
var METHOD     = CENTRE.method     || [];

/* ---- The end-of-lesson quiz ------------------------------------------------
   Opt-in. A centre that declares no `quiz` block gets exactly the site it had:
   flashcards as the drill, mastery computed from them, every string unchanged.

   Where a centre does declare one, three things move. A lesson now ends in a
   graded quiz rather than in a link to a deck; the status word — solid, shaky,
   weak — is computed from that quiz rather than from card statistics; and the
   flashcards stop being the thing you are sent to after reading and become the
   thing the scheduler asks for later, surfaced on a concept only when cards for
   it are actually due.

   That ordering is the point. A flashcard is a retention instrument: it is
   excellent at keeping something you already understand, and close to useless at
   telling you whether you understood it in the first place, because grading
   yourself on a card you have just read the back of measures recognition. A
   multiple-choice item with authored distractors measures something a self-grade
   cannot — whether you can tell the right account from the three plausible wrong
   ones. So the quiz decides the verdict, and the cards keep what the verdict
   found. */
var QUIZ_CFG = CENTRE.quiz || null;
var QUIZ     = (QUIZ_CFG && QUIZ_CFG.items) || [];
var QUIZ_ON  = !!(QUIZ_CFG && QUIZ.length);

/* The question-bank view's framing. The engine underneath — pick by preset,
   answer before revealing, self-score green/amber/red, reds come back — is the
   same wherever it runs; what changes is who is asking. Surrey is being
   interviewed by a judge, a course centre is being examined. Defaults are
   Surrey's, unchanged, so a centre that says nothing gets what it had. */
var MOCK = CENTRE.mock || {};
MOCK = {
  emoji: MOCK.emoji || "🎤",
  title: MOCK.title || "Mock interview",
  lede:  MOCK.lede  || "A question appears. You answer it out loud, in your own words, before you " +
                       "reveal anything. Then you score yourself honestly — Green only if you could " +
                       "survive two follow-ups, Red if you bluffed. Reds come back in later sessions " +
                       "without warning.",
  /* Which presets get a card, in order. Not Object.keys(PRESETS): a preset can
     exist to be reached by link (`#/mock/flagged`) without earning a tile. */
  order: MOCK.order || ["judge","referee","numbers","admissions","weakest"],
  note:  MOCK.note  || "<strong>The scoring rule, unchanged from the coach brief.</strong><br>" +
                       "<strong>Green</strong> — answered correctly and survived two follow-ups. " +
                       "<strong>Amber</strong> — correct but shallow, or you needed a hint. " +
                       "<strong>Red</strong> — wrong, or you bluffed. Fluent prose that restates the " +
                       "question in fancier words is a Red, not an Amber."
};

/* The self-explanation gate's wording. Surrey asks why a design decision was
   made; a course centre asks why a rule holds. Same gate, same evidence behind
   it, different question — so the three strings are declared rather than
   written into the view. The defaults are Surrey's, unchanged. */
var WHY = CENTRE.why || {};
WHY = {
  head:   WHY.head   || "Why it was done this way",
  ask:    WHY.ask    || "Before you read the answer — why do you think it was done this way, and " +
                        "what would break if it were not?",
  reveal: WHY.reveal || "Show me the project’s answer"
};

/* ===========================================================================
   ICONS
   Inline SVG rather than an icon CDN, because this file must work offline.
   Lucide-ish: 16px box, currentColor stroke, 1.9 weight.
   =========================================================================== */
var ICONS = {
  menu:      "M3 6h14M3 10h14M3 14h14",
  book:      "M4 4h8a2 2 0 0 1 2 2v10a2 2 0 0 0-2-2H4z M16 4h-1a2 2 0 0 0-2 2v10a2 2 0 0 1 2-2h1z",
  layers:    "M10 2 2 6l8 4 8-4-8-4z M2 10l8 4 8-4 M2 14l8 4 8-4",
  cards:     "M3 6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M16 6v8",
  target:    "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  shield:    "M10 2 4 5v5c0 3.5 2.5 6.5 6 8 3.5-1.5 6-4.5 6-8V5z",
  hash:      "M6 3 5 17M14 3l-1 14M3 7h14M3 13h13",
  chart:     "M3 17V9M8 17V4M13 17v-6M18 17v-9",
  file:      "M11 2H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z M11 2v5h5",
  clock:     "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M10 6v4l3 2",
  alert:     "M10 3 2 17h16z M10 8v4 M10 15h.01",
  check:     "M4 10l4 4 8-9",
  arrow:     "M4 10h12 M11 5l5 5-5 5",
  spark:     "M10 2v4M10 14v4M2 10h4M14 10h4M4.9 4.9l2.8 2.8M12.3 12.3l2.8 2.8M15.1 4.9l-2.8 2.8M7.7 12.3l-2.8 2.8",
  ask:       "M4 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-4 3z",
  flask:     "M8 2v5.2L3.6 15A1.5 1.5 0 0 0 4.9 17h10.2a1.5 1.5 0 0 0 1.3-2L12 7.2V2 M7 2h6 M6.2 12h7.6",
  flow:      "M7 2.5h6v3.5H7z M2 14.5h5v3H2z M13 14.5h5v3h-5z M10 6v5.5 M4.5 14.5v-3h11v3"
};
/* Optical size correction. The paths were drawn to different extents — `spark`
   and `layers` reach the full 2–18 of the viewBox while `cards` and `book` stop
   at 4–16 — so at a shared 16px they do not read as the same size. Scaling about
   the centre normalises the drawn box without redrawing the geometry. */
var ICON_SCALE = { spark:0.84, layers:0.86, alert:0.9, file:0.92, shield:0.92, check:0.92 };
function ico(name, size){
  var d = ICONS[name] || ICONS.book;
  var s = ICON_SCALE[name];
  var path = '<path d="'+d+'"/>';
  if (s) path = '<g transform="translate(10 10) scale('+s+') translate(-10 -10)">'+path+'</g>';
  return '<svg width="'+(size||16)+'" height="'+(size||16)+'" viewBox="0 0 20 20" fill="none" '+
         'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" '+
         'aria-hidden="true">'+path+'</svg>';
}
function paintIcons(root){
  var els = (root||document).querySelectorAll("[data-ico]");
  for (var i=0;i<els.length;i++){
    var el = els[i];
    if (el.getAttribute("data-painted")) continue;
    el.innerHTML = ico(el.getAttribute("data-ico"), el.getAttribute("data-size"));
    el.setAttribute("data-painted","1");
  }
}

function groupOf(id){
  for (var i=0;i<GROUPS.length;i++) if (GROUPS[i].id===id) return GROUPS[i];
  return {id:id,label:id,pill:"p-grey"};
}
/* ===========================================================================
   STATE
   localStorage is the only store. Everything is derived from these three maps
   so that an export/import round-trip is genuinely lossless.
   =========================================================================== */
/* Declared by the centre and never derived from its id, because a derived key
   would have silently renamed Surrey's store and thrown away real study
   history. Every centre gets its own key; nothing is shared between them. */
var KEY = CENTRE.storageKey;
var S = {
  cards:{},      /* cardId -> {ef,interval,reps,due,lapses,seen,streak} */
  questions:{},  /* qId    -> {last:'green'|'amber'|'red', history:[{t,score}]} */
  lessons:{},    /* conceptId -> {opened:t, read:bool} */
  sessions:[],   /* {t, preset, n, green, amber, red} */
  labs:{},       /* labNum  -> {passed, total, t}  redeemed from a notebook receipt */
  flags:{},      /* conceptId -> t   "come back to this" — set by you, not computed */
  conf:{},       /* cardId -> {sure:[hit,miss], think:[hit,miss], no:[hit,miss]} */
  explain:{},    /* conceptId -> {text, t}   your own words, written before the site's */
  pretests:{},   /* conceptId -> {guess, t}  what you said before you had read anything */
  recalls:[],    /* {t, scope, label, got, total, text} — free-recall attempts */
  quiz:{},       /* conceptId -> {attempts, best, last:{t,n,correct,score,answers:[]}} */
  autoplay:true, /* roll straight into the next concept when you reach the end of one */
  notesOpen:true,/* the bullet digest at the top of a lesson, open or collapsed */
  v:1
};

function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if (!raw) return;
    var d = JSON.parse(raw);
    if (d && typeof d === "object"){
      S.cards     = d.cards     || {};
      S.questions = d.questions || {};
      S.lessons   = d.lessons   || {};
      S.sessions  = d.sessions  || [];
      S.labs      = d.labs      || {};
      S.flags     = d.flags     || {};
      S.conf      = d.conf      || {};
      S.explain   = d.explain   || {};
      S.pretests  = d.pretests  || {};
      S.recalls   = d.recalls   || [];
      S.quiz      = d.quiz      || {};
      S.autoplay  = d.autoplay !== false;   /* default on; `|| true` would pin it on */
      S.notesOpen = d.notesOpen !== false;
    }
  }catch(e){ /* corrupt or unavailable storage: start clean rather than crash */ }
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){}
}
var DAY = 86400000;
function today0(){ var d=new Date(); d.setHours(0,0,0,0); return d.getTime(); }

/* ===========================================================================
   SM-2 (lite)
   Grades: 0 Again · 1 Hard · 2 Good · 3 Easy.
   "Again" drops the card back into the current session rather than merely
   shortening its interval — the point of a drill is to close the loop now.
   =========================================================================== */
function cardState(id){
  if (!S.cards[id]) S.cards[id] = {ef:2.5, interval:0, reps:0, due:0, lapses:0, seen:0, streak:0};
  if (S.cards[id].streak === undefined) S.cards[id].streak = 0;   /* pre-streak saves */
  return S.cards[id];
}
function grade(id, g){
  var c = cardState(id);
  c.seen++;
  /* Successive relearning (Rawson & Dunlosky 2013) counts *correct recalls on
     separate days*, not repetitions. A card failed and re-queued inside the same
     session and then got right is not a day's evidence, so a same-day success
     does not advance the streak — only the first grade of a given day can. */
  var newDay = c.lastDay !== today0();
  if (g === 0){
    c.reps = 0; c.interval = 0; c.lapses++; c.streak = 0;
    c.ef = Math.max(1.3, c.ef - 0.20);
    c.due = today0();                       /* due today = re-queued */
  } else {
    if (newDay) c.streak++;
    c.reps++;
    if (c.reps === 1)      c.interval = 1;
    else if (c.reps === 2) c.interval = 3;
    else                   c.interval = Math.max(1, Math.round(c.interval * c.ef));
    if (g === 1)      c.ef = Math.max(1.3, c.ef - 0.15);
    else if (g === 3) c.ef = Math.min(2.8, c.ef + 0.10);
    c.due = today0() + c.interval * DAY;
  }
  c.lastDay = today0();
  save();
}
/* Rawson & Dunlosky's prescription: recall a thing correctly three times on
   separate days, then relearn it three times at widening intervals. The first
   half is a counter; the second half is what SM-2 was already doing. */
var CRITERION = 3;
function atCriterion(id){ var c = S.cards[id]; return !!(c && c.streak >= CRITERION); }

/* ---- Confidence, and what it was worth ------------------------------------
   Self-grading after seeing the answer is the one place this app could lie to
   itself: recognising a correct answer feels like having known it. That is the
   fluency illusion, and the fix in the metamemory literature is to make the
   judgement *before* the answer is visible, where it has to be a prediction
   rather than a memory of just having read something.

   So the confidence button IS the reveal button — no extra click, but the claim
   is on record before the evidence arrives, and calibration() can score it. */
var CONF = [
  {id:"sure",  label:"I know this",  hint:"and I can say it out loud", cls:"g"},
  {id:"think", label:"I think so",   hint:"roughly, not precisely",    cls:""},
  {id:"no",    label:"No idea",      hint:"say so — it costs nothing", cls:"r"}
];
/* "typed" is not on the buttons. It is where a number card's machine-checked
   result goes, so the calibration table can show a row that owes nothing to
   self-report at all. */
var CONF_ROWS = CONF.concat([{id:"typed", label:"Typed a value", hint:"checked against the answer"}]);
function confLabel(id){
  for (var i=0;i<CONF_ROWS.length;i++) if (CONF_ROWS[i].id===id) return CONF_ROWS[i].label;
  return id;
}
/* hit = the grade that followed was Good or Easy. Anything else is a miss:
   pressing Hard after claiming to know it is exactly the gap worth seeing. */
function recordConf(cardId, conf, hit){
  if (!conf) return;
  var r = S.conf[cardId] || (S.conf[cardId] = {});
  var slot = r[conf] || (r[conf] = [0,0]);
  slot[hit ? 0 : 1]++;
  save();
}
function calibration(){
  var out = {};
  for (var i=0;i<CONF_ROWS.length;i++) out[CONF_ROWS[i].id] = [0,0];
  for (var id in S.conf){
    if (!Object.prototype.hasOwnProperty.call(S.conf, id)) continue;
    for (var k in S.conf[id]){
      if (!out[k]) continue;
      out[k][0] += S.conf[id][k][0];
      out[k][1] += S.conf[id][k][1];
    }
  }
  return out;
}
function isDue(id){
  var c = S.cards[id];
  if (!c || !c.seen) return false;
  return c.due <= today0();
}
function isNew(id){ var c=S.cards[id]; return !c || !c.seen; }

/* A card's contribution to mastery, 0..1. Reps carry it up; lapses drag it
   down; an unseen card contributes nothing at all rather than a zero, because
   "not studied" and "studied and failed" are different facts. */
function cardScore(id){
  var c = S.cards[id];
  if (!c || !c.seen) return null;
  var base = Math.min(1, c.reps / 4);
  var ease = (c.ef - 1.3) / 1.5;                 /* 0..1 */
  var pen  = Math.min(.5, c.lapses * 0.15);
  return Math.max(0, Math.min(1, base * 0.6 + ease * 0.4 - pen));
}
var SCORE_VAL = {green:1, amber:0.5, red:0};

/* ===========================================================================
   MASTERY ROLL-UP
   =========================================================================== */
function cardsFor(cid){
  var out=[]; for (var i=0;i<CARDS.length;i++) if (CARDS[i].conceptId===cid) out.push(CARDS[i]); return out;
}
function questionsFor(cid){
  var out=[];
  for (var i=0;i<QUESTIONS.length;i++){
    var q=QUESTIONS[i];
    if (q.conceptIds && q.conceptIds.indexOf(cid) >= 0) out.push(q);
  }
  return out;
}
/* ---- Quiz lookups ----------------------------------------------------------
   `quizFor` is the whole quiz for a concept: every item that names it, in
   authored order. An attempt serves all of them rather than a sample, so a
   score is a statement about the concept and not about which four items came
   up — with four to six items a sample would mostly measure the draw. */
function quizFor(cid){
  var out=[]; for (var i=0;i<QUIZ.length;i++) if (QUIZ[i].conceptId===cid) out.push(QUIZ[i]); return out;
}
function quizState(cid){ return S.quiz[cid] || null; }
function quizTaken(cid){ var q = S.quiz[cid]; return !!(q && q.last); }
/* The score that counts is the LATEST attempt, not the best one. A quiz you
   passed in June and failed in August is a concept you have lost, and a store
   that keeps the June number would report it as solid for as long as you never
   touched it again. `best` is kept for the history line and never for a verdict. */
function quizScore(cid){
  var q = S.quiz[cid];
  return (q && q.last) ? q.last.score : null;
}
/* Concepts you have read but never been tested on. This is the nav badge, and
   it is deliberately not "concepts with a weak score": a weak score is work the
   scheduler already knows about, whereas an unquizzed lesson is a concept you
   have no evidence about at all. */
function quizOwed(){
  var out=[];
  for (var i=0;i<CONCEPTS.length;i++){
    var c = CONCEPTS[i], L = S.lessons[c.id];
    if (L && L.read && !quizTaken(c.id) && quizFor(c.id).length) out.push(c);
  }
  return out;
}
function conceptMastery(cid){
  /* Where a centre runs quizzes, the quiz IS the mastery — one number, from the
     one instrument that grades itself, so the word on the tile and the word on
     the results page can never disagree. Cards and spoken questions still run
     the schedule underneath; they no longer vote on the verdict.

     The fall-through matters: a concept with no attempt yet is scored the old
     way rather than as zero, so a centre that turns quizzes on does not wipe the
     colour off every tile of a course somebody was halfway through. */
  if (QUIZ_ON && QUIZ_CFG.drivesMastery !== false && quizFor(cid).length){
    var qs = quizScore(cid);
    if (qs !== null) return qs;
  }
  var vals=[], w=[];
  var cs = cardsFor(cid), i, s;
  for (i=0;i<cs.length;i++){ s = cardScore(cs[i].id); if (s!==null){ vals.push(s); w.push(1); } }
  var qs = questionsFor(cid);
  for (i=0;i<qs.length;i++){
    var st = S.questions[qs[i].id];
    if (st && st.last){ vals.push(SCORE_VAL[st.last]); w.push(2); }  /* answering out loud counts double */
  }
  if (!vals.length) return null;
  var num=0, den=0;
  for (i=0;i<vals.length;i++){ num += vals[i]*w[i]; den += w[i]; }
  return num/den;
}
function masteryClass(m){
  if (m === null)  return "";
  if (m >= 0.75)   return "p-green";
  if (m >= 0.40)   return "p-yellow";
  return "p-red";
}
function masteryWord(m){
  if (m === null) return "not started";
  if (m >= 0.75)  return "solid";
  if (m >= 0.40)  return "shaky";
  return "weak";
}
function masteryFill(m){
  if (m === null) return "#efefee";
  if (m >= 0.75)  return "var(--pill-green-bg)";
  if (m >= 0.40)  return "var(--pill-yellow-bg)";
  return "var(--pill-red-bg)";
}
/* The coach note's standing instruction: name the three weakest areas every
   session. Only concepts that have actually been attempted are eligible — an
   untouched concept is a gap, not a weakness, and they are counted separately. */
function weakest(n){
  var scored=[];
  for (var i=0;i<CONCEPTS.length;i++){
    var m = conceptMastery(CONCEPTS[i].id);
    if (m !== null) scored.push({c:CONCEPTS[i], m:m});
  }
  scored.sort(function(a,b){ return a.m - b.m; });
  return scored.slice(0, n||3);
}
function untouchedCount(){
  var k=0;
  for (var i=0;i<CONCEPTS.length;i++) if (conceptMastery(CONCEPTS[i].id) === null) k++;
  return k;
}
/* ---- Flags -----------------------------------------------------------------
   A flag is the one signal here you set by hand. Mastery is computed from how
   you performed; a flag is you saying "come back to this" for a reason the
   scoring cannot see — you got it right but guessed, or a judge would push on
   it. So the two are shown side by side and never merged. */
function isFlagged(id){ return !!S.flags[id]; }
function toggleFlag(id){
  if (S.flags[id]) delete S.flags[id]; else S.flags[id] = Date.now();
  save();
}
function flaggedConcepts(){
  var out = [];
  for (var i=0;i<CONCEPTS.length;i++) if (isFlagged(CONCEPTS[i].id)) out.push(CONCEPTS[i]);
  return out;                                  /* in CONCEPTS order: prereqs first */
}
function flaggedCardIds(){
  var out = [];
  for (var i=0;i<CARDS.length;i++) if (isFlagged(CARDS[i].conceptId)) out.push(CARDS[i].id);
  return out;
}
function flaggedDueCount(){
  var ids = flaggedCardIds(), k = 0;
  for (var i=0;i<ids.length;i++) if (isDue(ids[i])) k++;
  return k;
}
function flagBtn(id, label){
  var on = isFlagged(id);
  return '<button class="flagbtn'+(on?" on":"")+'" data-flag="'+id+'" '+
    'title="'+(on?"Flagged — click to clear":"Flag this to come back to")+'" '+
    'aria-pressed="'+(on?"true":"false")+'">'+
    '<span class="fi">'+(on?"\u2691":"\u2690")+'</span>'+(label?'<span>'+label+'</span>':'')+'</button>';
}

function dueCount(){
  var k=0; for (var i=0;i<CARDS.length;i++) if (isDue(CARDS[i].id)) k++; return k;
}
function redQuestions(){
  var out=[];
  for (var i=0;i<QUESTIONS.length;i++){
    var st = S.questions[QUESTIONS[i].id];
    if (st && st.last === "red") out.push(QUESTIONS[i]);
  }
  return out;
}

/* ===========================================================================
   NUMBER CHECKING
   Tolerance is derived from the printed precision of the expected answer, so
   "0.01393" must be right to five decimals and "-0.138" to three. No per-card
   tolerance to maintain, and it enforces exactly the precision the paper uses.
   =========================================================================== */
function autoTol(str){
  var s = String(str).replace(/[^0-9.\-+eE]/g,"");
  var dot = s.indexOf(".");
  if (dot < 0) return 0.5;
  var dec = s.length - dot - 1;
  return 0.5 * Math.pow(10, -dec);
}
function numify(str){
  if (str === null || str === undefined) return NaN;
  var s = String(str).trim()
    .replace(/[−–—]/g, "-")   /* unicode minus / en dash / em dash */
    .replace(/[, ]/g, "")
    .replace(/^\+/, "");
  var m = s.match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}
function numMatches(input, expected){
  var a = numify(input), b = numify(expected);
  if (isNaN(a) || isNaN(b)) return false;
  return Math.abs(a - b) <= autoTol(expected) + 1e-12;
}

/* ===========================================================================
   HELPERS
   =========================================================================== */
function el(html){ var d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstChild; }
function esc(s){
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
/* ===========================================================================
   MATH
   The tutor answers in LaTeX — it is a model, and that is what models write —
   and until now the drawer printed `$\frac{21}{20} = 1.05$` verbatim, which is
   worse than useless in a sentence explaining why a ratio needs an absolute
   zero. This renders the subset that actually turns up here: fractions,
   sub/superscripts, \text, and the symbol names.

   Deliberately NOT KaTeX. That is ~300 KB of JavaScript plus font files, and
   this file's one hard rule is that it opens from file:// with no network — the
   thing it is preparing for is a judging table with no wifi. An unknown command
   degrades to its own name in upright type rather than vanishing, so a gap in
   this table is visible instead of silent.
   =========================================================================== */
var MATH_SYM = {
  circ:"°", degree:"°", times:"×", cdot:"·", pm:"±", mp:"∓", ast:"∗",
  le:"≤", leq:"≤", ge:"≥", geq:"≥", ne:"≠", neq:"≠", equiv:"≡",
  approx:"≈", sim:"∼", simeq:"≃", propto:"∝", ll:"≪", gg:"≫",
  to:"→", rightarrow:"→", leftarrow:"←", Rightarrow:"⇒", mapsto:"↦",
  infty:"∞", partial:"∂", nabla:"∇", top:"⊤", perp:"⊥", angle:"∠",
  sum:"∑", prod:"∏", int:"∫", surd:"√",
  cdots:"⋯", ldots:"…", dots:"…", vdots:"⋮",
  in:"∈", notin:"∉", subset:"⊂", subseteq:"⊆", cup:"∪", cap:"∩",
  forall:"∀", exists:"∃", neg:"¬", pm_:"±",
  alpha:"α", beta:"β", gamma:"γ", delta:"δ", epsilon:"ε", varepsilon:"ε",
  zeta:"ζ", eta:"η", theta:"θ", vartheta:"ϑ", iota:"ι", kappa:"κ",
  lambda:"λ", mu:"μ", nu:"ν", xi:"ξ", pi:"π", rho:"ρ", sigma:"σ",
  tau:"τ", upsilon:"υ", phi:"φ", varphi:"φ", chi:"χ", psi:"ψ", omega:"ω",
  Gamma:"Γ", Delta:"Δ", Theta:"Θ", Lambda:"Λ", Xi:"Ξ", Pi:"Π",
  Sigma:"Σ", Upsilon:"Υ", Phi:"Φ", Psi:"Ψ", Omega:"Ω"
};
/* Combining marks: \hat{y} is the letter followed by U+0302. Cheaper and more
   robust across fonts than positioning a glyph absolutely. */
var MATH_ACCENT = {hat:"^", bar:"\u203e", overline:"\u203e", tilde:"~",
                   vec:"\u2192", dot:"\u00b7", ddot:"\u00a8"};
var MATH_UPRIGHT = {text:1, textrm:1, mathrm:1, operatorname:1, mathbf:1,
                    textbf:1, mathsf:1, mathit:0};

function texToHtml(tex){
  var s = String(tex), i = 0, guard = 0;

  function group(){                       /* one argument: {...} or a single token */
    while (i < s.length && s.charAt(i) === " ") i++;
    return atom();
  }

  function atom(){
    if (i >= s.length) return "";
    var ch = s.charAt(i);

    if (ch === "{"){ i++; var inner = seq("}"); if (s.charAt(i) === "}") i++; return inner; }
    if (ch === "}") { i++; return ""; }

    if (ch === "\\"){
      var m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
      if (!m){ i++; return ""; }
      i += m[0].length;
      var name = m[1];

      if (name === "frac" || name === "dfrac" || name === "tfrac"){
        var num = group(), den = group();
        return '<span class="frac"><span>'+num+'</span><span>'+den+'</span></span>';
      }
      if (name === "sqrt") return '<span class="sqrt">√<span>'+group()+'</span></span>';
      if (MATH_UPRIGHT.hasOwnProperty(name))
        return '<span class="up'+(/bf$/.test(name)?" bf":"")+'">'+group()+'</span>';
      if (MATH_ACCENT.hasOwnProperty(name))
        return '<span class="acc"><span class="amark">'+MATH_ACCENT[name]+'</span>'+group()+'</span>';
      if (name === "left" || name === "right"){
        var d = s.charAt(i); i++;
        return d === "." ? "" : esc(d);
      }
      if (MATH_SYM.hasOwnProperty(name)) return MATH_SYM[name];
      if (name === "," || name === ";" || name === ":" || name === " ") return " ";
      if (name === "quad") return " ";
      if (name === "qquad") return "  ";
      if (name === "!") return "";
      if (name === "\\") return "<br>";
      if (/^[%$&#_{}]$/.test(name)) return esc(name);
      /* Unknown: show the name upright so the gap is visible, not silent. */
      return '<span class="up">'+esc(name)+'</span>';
    }

    i++;
    if (/[a-zA-Z]/.test(ch)) return "<i>"+ch+"</i>";   /* variables are italic */
    return esc(ch);
  }

  function seq(stop){
    var out = "";
    while (i < s.length){
      if (++guard > 8000) break;                       /* never hang the page */
      var ch = s.charAt(i);
      if (stop && ch === stop) break;
      if (ch === "^" || ch === "_"){
        i++;
        var body = group();
        if (ch === "^" && body === "\u00b0") out += body;   /* ^\circ: already raised */
        else out += ch === "^" ? "<sup>"+body+"</sup>" : "<sub>"+body+"</sub>";
        continue;
      }
      out += atom();
    }
    return out;
  }

  return seq(null);
}

/* Math is pulled out BEFORE the markdown pass and put back after, so esc() and
   the bold/code/[[link]] replacements cannot chew through a formula. The
   placeholder is NUL-delimited: esc() leaves it alone and no author will type
   it. mathRestore is a no-op when nothing was stashed, which is what keeps the
   nested md()-inside-tutorMd() call from eating the outer pass's placeholders. */
function mathStash(src){
  var items = [], text = String(src === undefined || src === null ? "" : src);
  function keep(tex, disp){
    items.push({tex:tex, disp:disp});
    return "\u0000M" + (items.length - 1) + "\u0000";
  }
  text = text.replace(/\$\$([\s\S]+?)\$\$/g,   function(_, t){ return keep(t, true); });
  text = text.replace(/\\\[([\s\S]+?)\\\]/g,   function(_, t){ return keep(t, true); });
  text = text.replace(/\\\(([\s\S]+?)\\\)/g,   function(_, t){ return keep(t, false); });
  /* Single $: must not open or close on whitespace, and must look like math —
     a backslash, a script, a brace or a relation — unless it is a bare symbol
     like $x$. Without that second test "a $5 note and $7 more" reads as one
     formula, which is how naive renderers mangle ordinary prose. */
  text = text.replace(/\$([^\s$](?:[^$\n]*[^\s$])?)\$/g, function(whole, t){
    return (/[\\^_{}=<>]/.test(t) || t.length <= 3) ? keep(t, false) : whole;
  });
  return {text:text, items:items};
}
function mathRestore(html, items){
  if (!items || !items.length) return html;
  return html.replace(/\u0000M(\d+)\u0000/g, function(whole, k){
    var it = items[+k];
    if (!it) return whole;
    var body;
    try { body = texToHtml(it.tex); }
    catch (e){ body = esc(it.tex); }
    return '<span class="math'+(it.disp ? " math-block" : "")+'">'+body+'</span>';
  });
}

/* A deliberately tiny inline-markdown pass: **bold**, `code`, [[concept-id]],
   and $math$. Anything richer belongs in the content, not in a parser. */
function md(s){
  var M = mathStash(s);
  return mathRestore(mdInline(M.text), M.items);
}
function mdInline(s){
  return esc(s)
    .replace(/\[\[([a-z0-9\-]+)\]\]/g, function(_,id){
      var c = byId(id);
      return c ? '<a href="#/learn/'+id+'">'+esc(c.title)+'</a>' : id;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    /* Bold is matched non-greedily so it can contain italics. The previous
       `[^*]+` could not: any `**bold with *italic* inside**` failed to match at
       all and printed its own asterisks. Italics then take whatever single
       asterisks are left — 60 of them across the concept prose were rendering
       raw, which nothing had noticed because the surrounding sentence still
       read correctly. */
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
}
function para(text){
  if (!text) return "";
  return String(text).split(/\n\n+/).map(function(p){
    if (/^- /m.test(p) && p.split("\n").every(function(l){ return /^- /.test(l) || !l.trim(); })){
      return "<ul>"+p.split("\n").filter(function(l){return l.trim();})
        .map(function(l){ return "<li>"+md(l.replace(/^- /,""))+"</li>"; }).join("")+"</ul>";
    }
    return "<p>"+md(p).replace(/\n/g,"<br>")+"</p>";
  }).join("");
}
function byId(id){
  for (var i=0;i<CONCEPTS.length;i++) if (CONCEPTS[i].id===id) return CONCEPTS[i];
  return null;
}
function shuffle(a, seed){
  /* deterministic within a session so a reload mid-drill does not reshuffle */
  var s = seed || 1, out = a.slice();
  for (var i=out.length-1;i>0;i--){
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    var j = s % (i+1);
    var t = out[i]; out[i]=out[j]; out[j]=t;
  }
  return out;
}
function fmtDate(ms){
  var d = new Date(ms);
  return d.toLocaleDateString(undefined,{month:"short",day:"numeric"});
}

/* ===========================================================================
   ROUTER
   Hash routing: works from file://, gives back-button behaviour for free.
   =========================================================================== */
/* Declared by the centre, in rail order: {id, label, ico, section?}. It is a
   list rather than a filter over a master table because a course centre brings
   views this file has never heard of, and those have to be nameable in the same
   place as the ones it does. `section` prints a heading above its own row. */
var ROUTES = CENTRE.routes || [];
/* A route a centre did not declare must not render an empty page. `method` and
   `sources` are the two rail-footer pages every centre has. */
var ROUTE_OK = {method:1, sources:1};
for (var _ri=0; _ri<ROUTES.length; _ri++) ROUTE_OK[ROUTES[_ri].id] = 1;

var FOOT_LABEL = {method:"How this site teaches", sources:"Sources & integrity"};

function route(){
  var h = location.hash.replace(/^#\/?/, "");
  var parts = h.split("/").filter(Boolean);
  return {name: parts[0] || "overview", arg: parts[1] || null};
}
function go(name, arg){ location.hash = "#/" + name + (arg ? "/"+arg : ""); }

function renderNav(){
  var r = route(), html = "";
  for (var i=0;i<ROUTES.length;i++){
    var t = ROUTES[i], extra = "";
    if (t.id === "cards"){
      var d = dueCount();
      if (d) extra = '<span class="count'+(d>15?" hot":"")+'">'+d+'</span>';
    }
    if (t.id === "mock"){
      var rq = redQuestions().length;
      if (rq) extra = '<span class="count hot">'+rq+'</span>';
    }
    if (t.id === "quiz"){
      var qo = quizOwed().length;
      if (qo) extra = '<span class="count hot">'+qo+'</span>';
    }
    if (t.id === "learn"){
      var fc = flaggedConcepts().length;
      if (fc) extra = '<span class="count">'+fc+'</span>';
    }
    if (t.id === "labs"){
      var lc = LABS.length - labsDone();
      if (lc) extra = '<span class="count">'+lc+'</span>';
    }
    /* Carried on the route itself, not keyed to ids or positions — the section
       headings silently walked off their sections the first time a route was
       inserted, and a per-centre rail cannot be keyed to Surrey's ids at all. */
    if (t.section) html += '<div class="sect-label">'+esc(t.section)+'</div>';
    html += '<button class="navrow'+(r.name===t.id?" on":"")+'" data-go="'+t.id+'">'+
            '<span class="ico" data-ico="'+t.ico+'"></span>'+t.label+extra+'</button>';
  }
  document.getElementById("nav").innerHTML = html;
  paintIcons(document.getElementById("nav"));
}

var lastRoute = null;
function render(){
  var r = route();
  /* A view this centre did not declare falls back to the overview rather than
     rendering nothing — and the fallback is on the DECLARED routes, not on
     whether VIEWS happens to carry a function, because this file ships views
     (the pipeline, the timeline, the labs) that most centres will not want. */
  if (!ROUTE_OK[r.name]) r = {name:"overview", arg:null};
  var view = document.getElementById("view");
  /* Every click re-renders the whole view, so an unconditional scroll reset threw
     you back to the top on each grade, flip, or filter change. Reset only when the
     route actually changed; an in-place update should leave you where you were. */
  var key = r.name + "/" + (r.arg || "");
  var keepTop = (key === lastRoute) ? view.scrollTop : 0;
  lastRoute = key;
  var fn = VIEWS[r.name] || VIEWS.overview;
  view.innerHTML = fn(r.arg);
  view.scrollTop = keepTop;
  /* The two rail-footer routes are not in ROUTES, so without this they both
     showed "Overview" in the crumb. */
  var lbl = FOOT_LABEL[r.name] || "Overview";
  for (var i=0;i<ROUTES.length;i++) if (ROUTES[i].id===r.name) lbl = ROUTES[i].label;
  document.getElementById("crumb").textContent = lbl;
  var d = dueCount();
  document.getElementById("duebadge").textContent = d ? d + " card" + (d===1?"":"s") + " due" : "";
  paintIcons(view);
  renderNav();
  if (AFTER[r.name]) AFTER[r.name](r.arg);
  document.body.classList.remove("rail-open");
  /* Last, and unconditionally: innerHTML has just been replaced, so any timer
     from the previous render is now pointing at a detached node. armAutoplay
     clears before it arms, which is what stops a stale countdown navigating you
     somewhere you left. */
  armAutoplay();
}
var VIEWS = {};
var AFTER = {};    /* per-route setup that runs after innerHTML is replaced */
/* Click handling is delegated from ONE document-level listener attached at boot
   and dispatched by route. #view survives every render, so attaching per-render
   listeners to it would stack them and make a single grade click fire N times. */
var CLICKS = {};

/* ===========================================================================
   VIEW · OVERVIEW
   =========================================================================== */
VIEWS.overview = function(){
  var w = weakest(3), due = dueCount(), reds = redQuestions().length, un = untouchedCount();
  var studied = CONCEPTS.length - un;

  var weakHtml;
  if (!w.length){
    weakHtml = '<p class="empty">Nothing attempted yet. Run a <a href="#/mock/judge">Judge run</a> '+
               'or open a concept — the weak list builds itself from what you get wrong.</p>';
  } else {
    weakHtml = '<div class="grid g3">';
    for (var i=0;i<w.length;i++){
      var c = w[i].c, g = groupOf(c.group);
      weakHtml += '<a class="card hoverable" href="#/learn/'+c.id+'" style="display:block;color:inherit">'+
        '<div class="eyebrow">'+esc(g.label)+'</div>'+
        '<div style="font-weight:600;margin:4px 0 8px;font-size:15px">'+esc(c.title)+'</div>'+
        '<div class="bar"><i style="width:'+Math.round(w[i].m*100)+'%;background:'+
          (w[i].m<0.4?"var(--pill-red-dot)":"var(--pill-yellow-dot)")+'"></i></div>'+
        '<div class="faint" style="margin-top:6px;font-size:12px">'+masteryWord(w[i].m)+
          ' · '+Math.round(w[i].m*100)+'%</div></a>';
    }
    weakHtml += '</div>';
  }

  /* The landing page is the one view whose words ARE the centre, so its four
     identity slots come from the config: the heading, the lede, the "start
     here" tiles and the honesty note. The rest of the copy is about the study
     machinery and is the same wherever it is read. A centre that wants more
     than that replaces `Centre.VIEWS.overview` outright. */
  var startHtml = "", si;
  for (si=0; si<(CENTRE.startHere||[]).length; si++){
    var sh = CENTRE.startHere[si];
    startHtml += '<a class="card hoverable" href="'+esc(sh.href)+'" style="color:inherit">'+
      '<div class="btnrow" style="margin-bottom:6px"><span class="pill '+sh.pill+'">'+
        '<span class="dot"></span>'+esc(sh.eyebrow)+'</span></div>'+
      '<div style="font-weight:600;font-size:15px">'+esc(sh.title)+'</div>'+
      '<div class="muted" style="margin-top:4px">'+sh.body+'</div></a>';
  }

  return '<div class="page">'+
    '<div class="title"><span class="emo">'+CENTRE.emoji+'</span><h1>'+
      esc(CENTRE.overviewTitle || CENTRE.title)+'</h1></div>'+
    '<p class="lede">'+CENTRE.lede+'</p>'+

    '<div class="grid g4" style="margin-top:24px">'+
      '<div class="card stat"><div class="k">Cards due</div><div class="v">'+due+'</div>'+
        '<div class="s">'+(due? '<a href="#/cards">start reviewing</a>' : 'nothing owed today')+'</div></div>'+
      '<div class="card stat"><div class="k">Reds queued</div><div class="v">'+reds+'</div>'+
        '<div class="s">'+(reds? '<a href="#/mock/weakest">re-served unannounced</a>' : 'no failed questions')+'</div></div>'+
      '<div class="card stat"><div class="k">Concepts touched</div><div class="v">'+studied+'<span class="faint" style="font-size:16px">/'+CONCEPTS.length+'</span></div>'+
        '<div class="s">'+un+' not started</div></div>'+
      '<div class="card stat"><div class="k">Sessions</div><div class="v">'+S.sessions.length+'</div>'+
        '<div class="s">'+(S.sessions.length? 'last '+fmtDate(S.sessions[S.sessions.length-1].t) : 'none yet')+'</div></div>'+
    '</div>'+

    /* Resume. The same ordering the dependency map uses, so the two never
       disagree about what comes next. */
    resumeCta(null, S.sessions.length ? "Pick up where you left off" : "Start here")+

    '<h2 class="sec">Your three weakest areas</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:42rem">'+
      (QUIZ_ON && QUIZ_CFG.drivesMastery !== false
        ? 'Computed from your latest quiz score on each concept — the one instrument here that marks '+
          'you rather than asking you to mark yourself. Reread these, then retake them.'
        : 'Computed from card performance and mock-interview scores. Drill these first — that is the '+
          'instruction in the coach brief, and it is the whole reason this page exists.')+'</p>'+
    weakHtml +

    '<h2 class="sec">Start here</h2>'+
    '<div class="grid g2">'+ startHtml +'</div>'+

    '<div class="note info" style="margin-top:28px">'+ (CENTRE.aboutNote||"") +'</div>'+
  '</div>';
};

/* ---- Worked examples -------------------------------------------------------
   A solution that prints only its moves teaches you to copy moves. So a step is
   a pair — what you did, and why that was the thing to do — and the `why` is
   rendered as the quieter half so the sequence still reads top to bottom at a
   glance when you already know it.

   `check` is separate from `answer` on purpose: the habit being drilled is that
   an answer is not finished until something independent of the algebra agrees
   with it — units, a limiting case, an order of magnitude. */
function workedBlock(w){
  if (!w) return "";
  var h = '<h2 class="sec">'+esc(w.head || "Worked example")+'</h2><div class="worked">'+
    '<div class="w-prompt">'+para(w.prompt)+'</div>';
  if (w.given) h += '<div class="w-given">'+para(w.given)+'</div>';
  var steps = w.steps || [];
  if (steps.length){
    h += '<ol class="w-steps">';
    for (var i=0;i<steps.length;i++){
      var s = steps[i];
      if (typeof s === "string") s = {"do": s};
      h += '<li><div class="w-do">'+para(s["do"])+'</div>'+
           (s.why ? '<div class="w-why">'+para(s.why)+'</div>' : '')+'</li>';
    }
    h += '</ol>';
  }
  if (w.answer) h += '<div class="w-ans"><strong>Answer.</strong> '+md(w.answer)+'</div>';
  if (w.check)  h += '<div class="w-check"><strong>Check it.</strong> '+md(w.check)+'</div>';
  return h + '</div>';
}

/* ---- A passage, worked -----------------------------------------------------
   The prose analogue of a worked example: an excerpt, the move the writer is
   making, and how you would write about that move. `attribution` is required
   rather than optional because the alternative — an invented passage with a
   real author's name on it — is the one error in this view that would be worth
   nothing to spot later. */
function passageBlock(p){
  if (!p) return "";
  var h = '<h2 class="sec">'+esc(p.head || "A passage, worked")+'</h2><div class="passage">'+
    '<blockquote class="pg-text">'+para(p.text)+'</blockquote>'+
    '<div class="pg-attr">'+md(p.attribution || "[no attribution given — this is a bug]")+'</div>';
  if (p.move)       h += '<div class="pg-move"><strong>What the writer is doing.</strong> '+para(p.move)+'</div>';
  if (p.howToWrite) h += '<div class="pg-write"><strong>How you would write about it.</strong> '+para(p.howToWrite)+'</div>';
  return h + '</div>';
}

/* ===========================================================================
   VIEW · CONCEPT LIST + LESSON
   =========================================================================== */
VIEWS.learn = function(arg){
  if (arg) return lessonView(arg);

  var html = '<div class="page">'+
    '<div class="title"><span class="emo">📖</span><h1>Concepts</h1></div>'+
    '<p class="lede">Every idea the project stands on, each in two layers: the plain version with no '+
      'jargon, then the real definition with the formula and the trap. Ordered so nothing depends on '+
      'something you have not met.</p>';

  /* Flagged first, pinned above the groups. The whole point of a flag is that
     you should not have to remember which group you left it in. */
  var flagged = flaggedConcepts();
  if (flagged.length){
    var fdue = flaggedDueCount();
    html += '<h2 class="sec">\u2691 Flagged '+
      '<span class="faint" style="font-weight:400;font-size:14px">'+flagged.length+'</span></h2>'+
      '<div class="btnrow" style="margin:-6px 0 12px">'+
        '<a class="btn primary" href="#/cards/flagged">Drill flagged flashcards'+
          (fdue ? ' <span class="num">('+fdue+' due)</span>' : '')+'</a>'+
        '<a class="btn" href="#/mock/flagged">Interview on flagged</a>'+
      '</div><div class="grid g2">';
    for (var fi=0; fi<flagged.length; fi++) html += conceptTile(flagged[fi]);
    html += '</div>';
  }

  for (var gi=0; gi<GROUPS.length; gi++){
    var g = GROUPS[gi], rows = [];
    for (var i=0;i<CONCEPTS.length;i++) if (CONCEPTS[i].group === g.id) rows.push(CONCEPTS[i]);
    if (!rows.length) continue;
    html += '<h2 class="sec">'+esc(g.label)+' <span class="faint" style="font-weight:400;font-size:14px">'+rows.length+'</span></h2>'+
            '<div class="grid g2">';
    for (var j=0;j<rows.length;j++) html += conceptTile(rows[j]);
    html += '</div>';
  }
  return html + '</div>';
};

/* A preview cannot be rendered as markdown, because slicing 120 characters out
   of it will sooner or later cut a `**` in half and leave an orphan marker. So
   the markers are removed instead — strip first, then slice, or the strip works
   on text that is already broken. */
function stripMd(s){
  return String(s||"")
    .replace(/\[\[([a-z0-9\-]+)\]\]/g, function(_, id){ var c = byId(id); return c ? c.title : id; })
    .replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "");
}
function conceptTile(c){
  var m = conceptMastery(c.id), cls = masteryClass(m);
  return '<a class="card hoverable'+(isFlagged(c.id)?" flagged":"")+'" href="#/learn/'+c.id+'" '+
      'style="color:inherit;display:block">'+
    '<div style="display:flex;align-items:flex-start;gap:8px">'+
      '<div style="flex:1;min-width:0">'+
        '<div style="font-weight:600;font-size:15px">'+esc(c.title)+'</div>'+
        '<div class="muted" style="margin-top:3px;font-size:13px;line-height:1.5">'+
          esc(stripMd(String(c.plain||"").split("\n\n")[0]).slice(0,120))+
          (String(c.plain||"").length>120?"…":"")+'</div>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex:0 0 auto">'+
        '<span class="pill '+cls+'"><span class="dot"></span>'+masteryWord(m)+'</span>'+
        flagBtn(c.id, "")+
      '</div>'+
    '</div></a>';
}

/* A concept as a link, coloured by mastery on the same scale the tiles and the
   dependency map use. A page carrying a lot of these then doubles as a readout
   of what has been attempted — an uncoloured link tells you where to go but not
   whether you have been there. */
function conceptPill(id){
  var c = byId(id);
  if (!c) return "";
  var m = conceptMastery(id);
  return '<a class="pill '+masteryClass(m)+'" href="#/learn/'+id+'" title="'+
         esc(c.title+" — "+masteryWord(m))+'"><span class="dot"></span>'+esc(c.title)+'</a>';
}

/* ---- The pretest gate ------------------------------------------------------
   Reading an explanation you have not first tried to produce is the cheapest
   possible encounter with it: everything makes sense, nothing sticks, and you
   walk away with a warm feeling that is almost entirely fluency.

   Guessing first fixes that, and it works even when the guess is wrong —
   Kornell, Hays & Bjork (2009) and Richland, Kornell & Kao (2009) both find that
   a failed retrieval attempt before study beats spending the same time studying.
   The mechanism is that a failed attempt tells you what the question even is, so
   the answer arrives as a resolution rather than as more prose.

   So: one question, before the page opens. There is an escape hatch, because a
   gate you cannot get round becomes a gate you stop using. */
function pretestCard(c){
  var cs = cardsFor(c.id), i;
  for (i=0;i<cs.length;i++) if (cs[i].type === "concept") return cs[i];
  return cs[0] || null;
}
function pretestGate(c){
  var q = pretestCard(c);
  var prompt = q ? md(q.front)
                 : 'What do you already think <strong>'+esc(c.title)+'</strong> means, and why would '+
                   'this project need it?';
  return '<div class="page narrow">'+
    '<div class="eyebrow">'+esc(groupOf(c.group).label)+'</div>'+
    '<div class="title" style="margin-top:6px"><h1>'+esc(c.title)+'</h1></div>'+
    '<div class="gate">'+
      '<div class="eyebrow">Before you read this</div>'+
      '<p class="gate-q">'+prompt+'</p>'+
      '<p class="muted" style="font-size:13px;margin:0 0 10px">Answer from whatever you have — a '+
        'half-memory, an analogy, a guess at the shape of it. <strong>Being wrong here is the point.</strong> '+
        'A failed attempt before reading beats reading for the same length of time, because it turns the '+
        'lesson into an answer to a question you are actually holding.</p>'+
      '<textarea class="txt" id="guessbox" placeholder="your guess — one or two sentences is plenty"></textarea>'+
      '<div class="btnrow" style="margin-top:10px">'+
        '<button class="btn primary" data-act="guess">Lock it in and open the lesson</button>'+
        '<button class="btn ghost" data-act="noguess">No idea at all — open it</button>'+
      '</div>'+
      '<p class="faint" style="font-size:12px;margin:12px 0 0">'+
        '<a href="#" data-act="peek">Skip the gate — I only need to look something up</a>'+
        ' · this asks once per concept, not every visit.</p>'+
    '</div></div>';
}

var peeking = {};   /* conceptId -> true, this page load only: gate skipped, nothing recorded */

function lessonView(id){
  var c = byId(id);
  if (!c) return '<div class="page"><p class="empty">No concept with id <code>'+esc(id)+'</code>.</p></div>';

  if (!S.lessons[id]) { S.lessons[id] = {opened: Date.now()}; save(); }
  if (!S.pretests[id] && !peeking[id]) return pretestGate(c);

  var g = groupOf(c.group), m = conceptMastery(c.id), i;

  var pre = "";
  if (c.prereqs && c.prereqs.length){
    pre = '<div class="btnrow" style="margin:0 0 18px"><span class="faint" style="font-size:12px">Needs first:</span>';
    for (i=0;i<c.prereqs.length;i++){
      var p = byId(c.prereqs[i]);
      if (!p) continue;
      var pm = conceptMastery(p.id);
      pre += '<a class="pill '+masteryClass(pm)+'" href="#/learn/'+p.id+'"><span class="dot"></span>'+esc(p.title)+'</a>';
    }
    pre += '</div>';
  }

  var next = [];
  for (i=0;i<CONCEPTS.length;i++){
    if (CONCEPTS[i].prereqs && CONCEPTS[i].prereqs.indexOf(id) >= 0) next.push(CONCEPTS[i]);
  }

  var body = '<div class="lesson-wrap"><div class="page narrow">'+
    '<div class="eyebrow">'+esc(g.label)+'</div>'+
    '<div class="title" style="margin-top:6px"><h1>'+esc(c.title)+'</h1></div>'+
    '<div class="btnrow" style="margin:10px 0 18px">'+
      '<span class="pill '+masteryClass(m)+'"><span class="dot"></span>'+masteryWord(m)+'</span>'+
      flagBtn(c.id, isFlagged(c.id) ? "Flagged" : "Flag this")+
      (c.sourceDoc ? '<span class="faint" style="font-size:12px">source: <code>'+esc(c.sourceDoc)+'</code></span>' : '')+
      /* `source` is the syllabus citation a course centre carries — a CED topic
         or skill code. It is a pill rather than faint text because in those
         centres it is the load-bearing claim that the concept is on the course
         at all, and selfCheck will refuse a concept without one. */
      (c.source ? '<span class="pill p-grey" title="Syllabus source"><span class="dot"></span>'+
        esc(c.source)+'</span>' : '')+
    '</div>'+
    pre;

  /* Your guess, and the answer to the same question, side by side and above the
     prose. A pretest only pays if the correction lands — an unresolved wrong
     guess is just a wrong guess. */
  var pt = S.pretests[id], ptq = pretestCard(c);
  if (pt){
    body += '<div class="guessback">'+
      '<div class="gb-head"><span data-ico="spark"></span> Before you read this, you said</div>'+
      (pt.guess
        ? '<blockquote class="gb-you">'+esc(pt.guess)+'</blockquote>'
        : '<p class="gb-you faint" style="font-style:italic">nothing — you took it as a blank</p>')+
      (ptq ? '<div class="gb-a"><strong>'+md(ptq.front)+'</strong><br>'+md(ptq.back)+'</div>' : '')+
      '<p class="faint" style="font-size:12px;margin:10px 0 0">Read the difference between those two '+
        'before you read anything else. That difference is the lesson.</p>'+
    '</div>';
  }

  /* ---- The bullet digest ---------------------------------------------------
     Collapsible, above the prose, and open by default — because the point of it
     is to be the thing you can actually hold in your head, and a summary you
     have to go looking for is not that.

     It sits above rather than beside the tabs so it reads as the map of what
     follows. The open/closed state is one global preference, not per concept:
     you either want digests or you do not, and remembering seventy separate
     answers to that would just be seventy chances to be wrong. */
  var notes = NOTES[id];
  if (notes && notes.length){
    body += '<details class="notes"'+(S.notesOpen === false ? '' : ' open')+'>'+
      '<summary><span data-ico="layers"></span>'+
        '<span class="nt-h">The whole concept in '+notes.length+' bullets</span>'+
        '<span class="nt-s">distilled from “In depth” — every number kept</span>'+
      '</summary>'+
      '<ul class="notelist">';
    for (i=0;i<notes.length;i++) body += '<li>'+md(notes[i])+'</li>';
    body += '</ul>'+
      '<p class="nt-foot">These are the claims. The reasoning is in the prose below — if you can '+
      'recall only the bullets you can recite the project, but you cannot defend it.</p>'+
    '</details>';
  }

  body +=
    '<div class="layer-tabs">'+
      '<button class="tab on" data-layer="plain">Plain</button>'+
      '<button class="tab" data-layer="depth">In depth</button>'+
    '</div>'+
    '<div class="prose" id="layer-plain">'+para(c.plain)+'</div>'+
    '<div class="prose" id="layer-depth" style="display:none">'+
      para(c.depth)+
      (c.formula ? '<div class="formula">'+esc(c.formula)+'</div>' : '')+
      (c.figure ? '<figure><img src="'+esc(c.figure)+'" alt="'+esc(c.figureAlt||c.title)+'" loading="lazy">'+
        (c.figureCaption? '<figcaption>'+md(c.figureCaption)+'</figcaption>':'')+'</figure>' : '')+
    '</div>';

  /* Worked examples sit outside the Plain/In-depth tabs on purpose: they are
     neither a first explanation nor a deeper one, they are the thing you do
     after both. */
  if (c.worked)  body += workedBlock(c.worked);
  if (c.passage) body += passageBlock(c.passage);

  /* ---- Self-explanation ---------------------------------------------------
     Reading someone else's reasoning and generating your own are different
     activities with different returns; Bisra et al. (2018) put self-explanation
     at g ≈ 0.55 across 69 effect sizes. The site already carries the project's
     rationale, which makes it very easy to read the answer and mistake that for
     having reasoned to it — so the rationale is held back one click, behind your
     own attempt. Skipping is one click too; the box is a prompt, not a toll. */
  if (c.whyThisChoice){
    var ex = S.explain[id];
    body += '<h2 class="sec">'+esc(WHY.head)+'</h2>';
    if (!ex){
      body += '<div class="gate soft">'+
        '<p class="gate-q" style="font-size:15px">'+esc(WHY.ask)+'</p>'+
        '<textarea class="txt" id="exbox" placeholder="in your own words, without scrolling up"></textarea>'+
        '<div class="btnrow" style="margin-top:10px">'+
          '<button class="btn primary" data-act="explain">'+esc(WHY.reveal)+'</button>'+
          '<button class="btn ghost" data-act="noexplain">Skip</button>'+
        '</div></div>';
    } else {
      if (ex.text){
        body += '<div class="guessback"><div class="gb-head"><span data-ico="spark"></span> '+
          'You explained it as</div><blockquote class="gb-you">'+esc(ex.text)+'</blockquote>'+
          '<p class="faint" style="font-size:12px;margin:8px 0 0">'+fmtDate(ex.t)+
          ' · <a href="#" data-act="reexplain">explain it again from scratch</a></p></div>';
      }
      body += '<div class="prose">'+para(c.whyThisChoice)+'</div>';
    }
  }
  if (c.rejectedAlternative){
    body += '<div class="note"><strong>The alternative that was rejected.</strong><br>'+
      md(c.rejectedAlternative)+'</div>';
  }
  if (c.trap){
    body += '<div class="note danger" style="margin-top:14px"><strong>Where this goes wrong.</strong><br>'+
      md(c.trap)+'</div>';
  }
  /* The pipeline diagram links out to concepts; this is the same edge read
     backwards, so a concept is never a dead end. Derived from PIPE rather than
     stored on the concept, because one list that can disagree with itself is
     exactly how a cross-reference rots. */
  var usedBy = pipeStepsFor(id);
  if (usedBy.length){
    body += '<h2 class="sec">Where this happens in the pipeline</h2><div class="btnrow">';
    for (i=0;i<usedBy.length;i++)
      body += '<a class="btn sm" href="#/pipeline/'+usedBy[i].id+'">'+esc(usedBy[i].t)+'</a>';
    body += '</div>';
  }

  if (c.links && c.links.length){
    body += '<h2 class="sec">Go deeper</h2><div class="btnrow">';
    for (i=0;i<c.links.length;i++){
      body += '<a class="btn sm" href="'+esc(c.links[i].href)+'" target="_blank" rel="noopener">'+
              esc(c.links[i].label)+' ↗</a>';
    }
    body += '</div>';
  }

  var myCards = cardsFor(id), myQs = questionsFor(id), myQuiz = QUIZ_ON ? quizFor(id) : [];
  /* ---- What a lesson ends in -----------------------------------------------
     With a quiz in play this is the whole close of the lesson: the graded thing
     first, at full width, and the two ungraded instruments beneath it. The
     flashcard tile is the one that moves. It appears when the scheduler is
     asking for cards back and not before, because "drill this now" is the wrong
     instruction at the bottom of a first reading — you would be rehearsing a
     thing you have not yet been shown you understand. */
  if (myQuiz.length){
    body += quizCta(c, myQuiz);
    var dueHere = 0, unseenHere = 0;
    for (i=0;i<myCards.length;i++){
      if (isDue(myCards[i].id)) dueHere++;
      if (isNew(myCards[i].id)) unseenHere++;
    }
    var secondary = "";
    if (dueHere){
      secondary += '<div class="card"><div class="eyebrow">Owed today</div>'+
        '<div style="font-size:22px;font-weight:700;margin:2px 0 4px" class="num">'+dueHere+
          '<span class="faint" style="font-size:15px">/'+myCards.length+'</span></div>'+
        '<div class="faint" style="font-size:12px;margin-bottom:8px">flashcards due — the interval '+
          'has expired on these, which is the one moment rehearsing them is worth anything</div>'+
        '<div class="btnrow"><a class="btn sm" href="#/cards/'+id+'">Review the '+dueHere+' due</a>'+
        '<a class="btn sm" href="#/recall/'+id+'">Blank page</a></div></div>';
    }
    if (myQs.length){
      var qlist2 = "";
      for (i=0;i<myQs.length;i++){
        var st2 = S.questions[myQs[i].id];
        qlist2 += '<li>'+md(myQs[i].prompt)+
          (st2 && st2.last ? ' <span class="pill p-'+(st2.last==="green"?"green":st2.last==="amber"?"yellow":"red")+
            '"><span class="dot"></span>'+st2.last+'</span>' : '')+'</li>';
      }
      secondary += '<div class="card"><div class="eyebrow">Say it out loud</div>'+
        '<ul style="margin:8px 0 10px;padding-left:18px;font-size:13px;line-height:1.6">'+qlist2+'</ul>'+
        '<a class="btn sm" href="#/mock/concept:'+id+'">Run these as an interview</a></div>';
    }
    if (secondary) body += '<h2 class="sec">Then, when they are owed</h2><div class="grid g2">'+secondary+'</div>';
    if (!dueHere && myCards.length){
      body += '<p class="faint" style="font-size:12px;margin-top:10px">'+myCards.length+
        ' flashcard'+(myCards.length===1?'':'s')+' carry this concept'+
        (unseenHere === myCards.length ? ' and none has been shown yet' : '')+
        ' — none due today. <a href="#/cards/'+id+'">Work them early</a> if you want to, but the '+
        'schedule will ask for them on its own.</p>';
    }
  }
  else if (myCards.length || myQs.length){
    body += '<h2 class="sec">Test yourself on this</h2><div class="grid g2">';
    if (myCards.length){
      /* Rawson & Dunlosky's criterion, shown as a fraction rather than a
         percentage, because "6 of 9 recalled correctly on three separate days"
         is a fact and "67% mastery" is a vibe. */
      var hs = conceptStats(c);
      body += '<div class="card"><div class="eyebrow">Flashcards</div>'+
        '<div style="font-size:22px;font-weight:700;margin:2px 0 4px" class="num">'+
          hs.crit+'<span class="faint" style="font-size:15px">/'+myCards.length+'</span></div>'+
        '<div class="faint" style="font-size:12px;margin-bottom:8px">at criterion — recalled on '+
          CRITERION+' separate days</div>'+
        '<div class="btnrow">'+
          '<a class="btn sm" href="#/cards/'+id+'">Drill just this concept</a>'+
          '<a class="btn sm" href="#/recall/'+id+'">Blank page</a>'+
        '</div></div>';
    }
    if (myQs.length){
      var qlist = "";
      for (i=0;i<myQs.length;i++){
        var st = S.questions[myQs[i].id];
        qlist += '<li>'+md(myQs[i].prompt)+
          (st && st.last ? ' <span class="pill p-'+(st.last==="green"?"green":st.last==="amber"?"yellow":"red")+
            '"><span class="dot"></span>'+st.last+'</span>' : '')+'</li>';
      }
      body += '<div class="card"><div class="eyebrow">You will be asked</div>'+
        '<ul style="margin:8px 0 10px;padding-left:18px;font-size:13px;line-height:1.6">'+qlist+'</ul>'+
        '<a class="btn sm" href="#/mock/concept:'+id+'">Run these as an interview</a></div>';
    }
    body += '</div>';
  }

  if (next.length){
    body += '<h2 class="sec">What this unlocks</h2><div class="btnrow">';
    for (i=0;i<next.length;i++){
      body += '<a class="pill '+masteryClass(conceptMastery(next[i].id))+'" href="#/learn/'+next[i].id+'">'+
              '<span class="dot"></span>'+esc(next[i].title)+'</a>';
    }
    body += '</div>';
  }

  /* Where to go from here. If this concept's own deck is unfinished, that is the
     answer — sending someone onward from a half-learned prerequisite is how the
     dependency order stops meaning anything. */
  var here = conceptStats(c);
  if (here.qn && !here.qtaken){
    /* The gate on moving on is the quiz, not the deck. It is a soft gate — the
       link onward is right there — but the sentence says what the cost is,
       which is the part a bare "next" cannot say. */
    body += '<div class="card" style="margin-top:18px;max-width:46rem">'+
      '<div class="eyebrow">Before moving on</div>'+
      '<div style="font-weight:600;font-size:15px;margin:4px 0 2px">'+here.qn+
        ' question'+(here.qn===1?'':'s')+' on this concept, graded</div>'+
      '<div class="muted" style="font-size:13px">Reading it and understanding it feel the same '+
        'from the inside; the quiz is the only thing here that can tell them apart. It sets this '+
        'concept’s status word and unlocks what comes after it.</div>'+
      '<div class="btnrow" style="margin-top:10px">'+
      '<a class="btn primary" href="#/quiz/'+c.id+'">Take the quiz</a>'+
      '<a class="btn ghost" href="#/map">See the order</a></div></div>';
  }
  else if (!here.qn && here.n && here.seen < here.n){
    body += '<div class="card" style="margin-top:18px;max-width:46rem">'+
      '<div class="eyebrow">Before moving on</div>'+
      '<div style="font-weight:600;font-size:15px;margin:4px 0 2px">'+
        (here.n - here.seen)+' of '+here.n+' cards still unseen</div>'+
      '<div class="muted" style="font-size:13px">Work the deck for this concept and it counts as '+
        'covered — everything downstream of it opens up.</div>'+
      '<div class="btnrow" style="margin-top:10px">'+
      '<a class="btn primary" href="#/cards/'+c.id+'">Drill this concept</a>'+
      '<a class="btn ghost" href="#/map">See the order</a></div></div>';
  } else {
    /* No autoplay here, deliberately. Reaching the bottom of a lesson is not
       evidence that you did anything — and on a concept you finished weeks ago
       it is actively wrong, because a revisit is usually a lookup. You came back
       to check one thing, and being carried off to the next concept three
       seconds later is the opposite of what you asked for.

       Autoplay belongs to the one moment that *is* earned: clearing the drill
       deck. See the deck-cleared branch in VIEWS.cards. */
    body += resumeCta(c.id, "Next");
  }

  /* The analogy lives in the gutter rather than in the flow, because it is a
     way in, not part of the argument. Only concepts that carry one get an
     aside; the rest keep the full-width reading column. */
  var side = c.analogy
    ? '<aside class="lesson-side"><div class="analogy">'+
        '<div class="analogy-h"><span data-ico="spark"></span> Think of it like</div>'+
        para(c.analogy)+
      '</div></aside>'
    : '';
  return body + '</div>' + side + '</div>';
}

CLICKS.learn = function(e, arg){
  var t = e.target.closest ? e.target.closest("[data-act]") : null;
  if (!t || !arg) return;
  var act = t.getAttribute("data-act"), box;
  if (act === "peek"){
    e.preventDefault();
    peeking[arg] = true;                 /* not persisted: the gate is still owed */
    render(); return;
  }
  if (act === "guess" || act === "noguess"){
    box = document.getElementById("guessbox");
    S.pretests[arg] = {guess: (act === "guess" && box) ? box.value.trim() : "", t: Date.now()};
    /* Working the gate is what "read" has always been supposed to mean. Until
       now nothing ever set it, so conceptStats could not distinguish a lesson
       you had opened from one you had done. */
    if (!S.lessons[arg]) S.lessons[arg] = {opened: Date.now()};
    S.lessons[arg].read = true;
    save(); render(); return;
  }
  if (act === "explain" || act === "noexplain"){
    box = document.getElementById("exbox");
    S.explain[arg] = {text: (act === "explain" && box) ? box.value.trim() : "", t: Date.now()};
    save(); render(); return;
  }
  if (act === "reexplain"){
    e.preventDefault();
    delete S.explain[arg];
    save(); render(); return;
  }
};

AFTER.learn = function(arg){
  if (!arg) return;
  var gb = document.getElementById("guessbox");
  if (gb) gb.focus();
  /* <details> toggles itself, so this only records the preference. Listening on
     the element rather than delegating, because `toggle` does not bubble. */
  var det = document.querySelector("details.notes");
  if (det){
    det.addEventListener("toggle", function(){
      S.notesOpen = det.open;
      save();                       /* no re-render: the browser already did it */
    });
  }
  var tabs = document.querySelectorAll(".layer-tabs .tab");
  for (var i=0;i<tabs.length;i++){
    tabs[i].addEventListener("click", function(){
      var which = this.getAttribute("data-layer");
      for (var j=0;j<tabs.length;j++) tabs[j].classList.toggle("on", tabs[j]===this);
      document.getElementById("layer-plain").style.display = which==="plain" ? "" : "none";
      document.getElementById("layer-depth").style.display = which==="depth" ? "" : "none";
    });
  }
};

/* ===========================================================================
   VIEW · THE QUIZ

   What a lesson ends in, and the one instrument here that grades you rather
   than asking you to grade yourself.

   Everything else on this site takes your word for it. A flashcard shows you
   the back and asks whether you knew it; the mock interview asks you to score
   your own spoken answer green, amber or red. Both are honest instruments in
   the hands of someone honest, and both measure recognition when they are not,
   because reading a correct answer produces the feeling of having known it —
   the fluency illusion, and the reason Dunlosky et al. (2013) rate rereading so
   low. A four-option item with authored distractors cannot be gamed that way.
   You commit before anything is revealed, and the score is arithmetic.

   Three decisions worth naming:

   1. **Grading happens at the end, not per question.** Immediate marking turns
      a quiz into a sequence of independent guesses with feedback — you learn
      what the answer was, and you also learn how you are doing, which changes
      how you answer the rest. Holding the mark to the end keeps the attempt one
      measurement of one concept.
   2. **Both orders are shuffled, and the shuffle is reseeded on every retake.**
      Position is the cheapest thing to memorise and the least worth knowing.
      Because the options move, the stored answer index and the `whyNot` list are
      always read against the ORIGINAL order — see `whyNotFor`, which is where
      that arithmetic lives so it exists in exactly one place.
   3. **The whole quiz is served, not a sample.** With four to six items a
      sample would mostly measure the draw.

   The verdict words are the site's existing three — solid, shaky, weak — on the
   thresholds `masteryWord` already used, so the word on the results page and
   the word on the concept tile can never disagree.
   =========================================================================== */
var quizRun = null;   /* this page load only; a reload starts the attempt over */

/* The wrong-answer note for one option, indexed against the authored order.
   `whyNot` carries one entry per WRONG option, so the correct answer's slot is
   not in the list and everything after it shifts down by one. Getting this off
   by one shows every wrong answer somebody else's explanation, which reads as
   plausible nonsense rather than as a bug — so it is written once, here. */
function whyNotFor(item, orig){
  if (!item.whyNot || orig === item.answer) return "";
  return item.whyNot[orig < item.answer ? orig : orig - 1] || "";
}
function startQuiz(cid){
  var items = quizFor(cid), st = S.quiz[cid];
  var seed = (((st && st.attempts) || 0) + 1) * 7919 + fnv1a(cid);
  var order = shuffle(items, seed);
  var run = {cid:cid, ids:[], opts:{}, picked:{}, graded:false};
  for (var i=0;i<order.length;i++){
    var it = order[i], idx = [];
    for (var k=0;k<it.options.length;k++) idx.push(k);
    run.ids.push(it.id);
    run.opts[it.id] = shuffle(idx, seed + i*31 + 17);
  }
  return run;
}
function quizItemById(id){
  for (var i=0;i<QUIZ.length;i++) if (QUIZ[i].id === id) return QUIZ[i];
  return null;
}
function gradeQuiz(run){
  var answers = [], correct = 0, i;
  for (i=0;i<run.ids.length;i++){
    var it = quizItemById(run.ids[i]);
    if (!it) continue;
    var p = run.picked[it.id], ok = (p === it.answer);
    if (ok) correct++;
    answers.push({id:it.id, picked:p, ok:ok});
  }
  var n = answers.length, score = n ? correct/n : 0, t = Date.now();
  var rec = S.quiz[run.cid] || (S.quiz[run.cid] = {attempts:0, best:0, history:[]});
  rec.attempts = (rec.attempts||0) + 1;
  rec.best = Math.max(rec.best||0, score);
  rec.last = {t:t, n:n, correct:correct, score:score, answers:answers};
  (rec.history = rec.history || []).push({t:t, score:score});
  /* Logged as a session so the progress table and the "sessions" counter see
     quiz work as work. Green/red rather than green/amber/red: an item is right
     or it is not, and there is no half mark to invent. */
  var c = byId(run.cid);
  S.sessions.push({t:t, preset:"quiz · "+(c ? c.title : run.cid), n:n,
                   green:correct, amber:0, red:n-correct});
  run.graded = true;
  save();
}
/* The three bands, and what each one should make you do next. The thresholds
   are `masteryWord`'s, restated as a sentence rather than as a colour. */
function quizVerdict(score){
  if (score >= 0.75) return {word:"solid", cls:"p-green",
    line:"You could tell the right account from three that were written to sound right. Leave it "+
         "to the scheduler now — the flashcards will bring it back before it decays."};
  if (score >= 0.40) return {word:"shaky", cls:"p-yellow",
    line:"Part of this is holding and part of it is not, which is the hardest state to notice from "+
         "the inside. Read the misses below, then reread the concept — not the whole page, the "+
         "paragraph each miss came from — and retake it."};
  return {word:"weak", cls:"p-red",
    line:"This one did not go in. That is information, not a verdict on you: it means the reading "+
         "produced recognition rather than understanding, which is exactly what a quiz exists to "+
         "catch. Go back to the concept and read it as an answer to the questions you just missed."};
}
/* The end-of-lesson block. Before an attempt it is the call to action; after
   one it is the standing verdict, which is also the concept's status word. */
function quizCta(c, items){
  var st = quizState(c.id), n = items.length;
  var h = '<h2 class="sec">'+(st && st.last ? "Your quiz on this concept" : "Now sit the quiz")+'</h2>'+
    '<div class="card quizcta">';
  if (st && st.last){
    var v = quizVerdict(st.last.score);
    h += '<div class="qz-head">'+
        '<span class="pill '+v.cls+'"><span class="dot"></span>'+v.word+'</span>'+
        '<span class="qz-score num">'+st.last.correct+'<span class="faint">/'+st.last.n+'</span></span>'+
        '<span class="faint" style="font-size:12px">'+fmtDate(st.last.t)+
          ' · attempt '+st.attempts+'</span>'+
      '</div>'+
      '<div class="bar" style="margin:10px 0 8px"><i style="width:'+Math.round(st.last.score*100)+
        '%;background:'+(st.last.score>=0.75?"var(--pill-green-dot)":st.last.score>=0.4?"var(--pill-yellow-dot)":"var(--pill-red-dot)")+'"></i></div>'+
      '<div class="muted" style="font-size:13px">'+v.line+'</div>'+
      '<div class="btnrow" style="margin-top:12px">'+
        '<a class="btn primary" href="#/quiz/'+c.id+'">Retake it</a>'+
        '<a class="btn" href="#/quiz/'+c.id+'?review">See what you missed</a></div>';
  } else {
    h += '<div style="font-weight:600;font-size:15px;margin:0 0 2px">'+n+' question'+(n===1?'':'s')+
        ', graded at the end</div>'+
      '<div class="muted" style="font-size:13px">Answer all '+n+', then it marks the lot and gives '+
        'this concept a word: <strong>solid</strong>, <strong>shaky</strong> or <strong>weak</strong>. '+
        'Nothing is revealed until you have committed to every answer — that is what makes the '+
        'result worth having.</div>'+
      '<div class="btnrow" style="margin-top:12px">'+
        '<a class="btn primary" href="#/quiz/'+c.id+'">Take the quiz</a></div>';
  }
  return h + '</div>';
}

VIEWS.quiz = function(arg){
  if (!QUIZ_ON) return '<div class="page"><p class="empty">This centre has no quizzes.</p></div>';
  if (!arg) return quizIndex();

  /* `#/quiz/<id>?review` reopens the last marked attempt without starting a new
     one — the link from a lesson that has already been quizzed. */
  var review = /\?review$/.test(arg);
  var cid = arg.replace(/\?.*$/, "");
  var c = byId(cid);
  if (!c) return '<div class="page"><p class="empty">No concept with id <code>'+esc(cid)+'</code>.</p></div>';
  var items = quizFor(cid);
  if (!items.length){
    return '<div class="page narrow"><div class="title"><h1>'+esc(c.title)+'</h1></div>'+
      '<p class="empty">No quiz has been written for this concept yet.</p>'+
      '<div class="btnrow"><a class="btn" href="#/learn/'+cid+'">Back to the lesson</a></div></div>';
  }
  if (review){
    var strec = quizState(cid);
    if (strec && strec.last) return quizResult(c, strec.last, false);
    return quizResult(c, null, false);
  }
  if (!quizRun || quizRun.cid !== cid) quizRun = startQuiz(cid);
  if (quizRun.graded){
    var rec = quizState(cid);
    return quizResult(c, rec && rec.last, true);
  }

  var answered = 0, i;
  for (i=0;i<quizRun.ids.length;i++) if (quizRun.picked[quizRun.ids[i]] !== undefined) answered++;
  var n = quizRun.ids.length;

  var html = '<div class="page narrow">'+
    '<div class="eyebrow">'+esc(groupOf(c.group).label)+'</div>'+
    '<div class="title" style="margin-top:6px"><span class="emo">📝</span><h1>'+esc(c.title)+'</h1></div>'+
    '<p class="lede">'+n+' question'+(n===1?'':'s')+'. Nothing is marked until you have answered all '+
      'of them, and you can change any answer until you do. Then it grades the lot.</p>'+
    '<div class="qz-prog"><div class="bar"><i style="width:'+Math.round(answered/n*100)+'%"></i></div>'+
      '<span class="faint" style="font-size:12px">'+answered+' of '+n+' answered</span></div>'+
    '<ol class="qzlist">';

  for (i=0;i<n;i++){
    var it = quizItemById(quizRun.ids[i]);
    if (!it) continue;
    var order = quizRun.opts[it.id], picked = quizRun.picked[it.id];
    html += '<li class="qz"><div class="qz-stem">'+md(it.stem)+'</div><div class="qz-opts">';
    for (var k=0;k<order.length;k++){
      var o = order[k];
      html += '<button class="qz-opt'+(picked === o ? " picked" : "")+'" '+
        'data-pick="'+esc(it.id)+'|'+o+'" aria-pressed="'+(picked===o?"true":"false")+'">'+
        '<span class="qz-let">'+String.fromCharCode(65+k)+'</span>'+
        '<span class="qz-txt">'+md(it.options[o])+'</span></button>';
    }
    html += '</div></li>';
  }
  html += '</ol>'+
    '<div class="qz-submit">'+
      (answered === n
        ? '<button class="btn primary" data-act="grade">Grade it</button>'
        : '<button class="btn primary" disabled>Answer all '+n+' to grade ('+(n-answered)+' left)</button>')+
      '<a class="btn ghost" href="#/learn/'+cid+'">Back to the lesson</a>'+
    '</div>'+
  '</div>';
  return html;
};

/* The marked attempt. `fresh` distinguishes the moment you just finished one
   from a later look at it: only the first arms the onward CTA, for the same
   reason autoplay lives on the deck-cleared screen and nowhere else. */
function quizResult(c, last, fresh){
  if (!last){
    return '<div class="page narrow"><div class="title"><h1>'+esc(c.title)+'</h1></div>'+
      '<p class="empty">You have not sat this quiz yet.</p>'+
      '<div class="btnrow"><a class="btn primary" href="#/quiz/'+c.id+'">Take it</a>'+
      '<a class="btn" href="#/learn/'+c.id+'">Back to the lesson</a></div></div>';
  }
  var v = quizVerdict(last.score), i;
  var html = '<div class="page narrow">'+
    '<div class="eyebrow">'+esc(groupOf(c.group).label)+'</div>'+
    '<div class="title" style="margin-top:6px"><h1>'+esc(c.title)+'</h1></div>'+
    '<div class="qz-verdict '+v.cls+'">'+
      '<div class="qv-word">'+v.word+'</div>'+
      '<div class="qv-score num">'+last.correct+'<span class="faint">/'+last.n+'</span></div>'+
      '<div class="qv-line">'+v.line+'</div>'+
    '</div>'+
    '<p class="muted" style="max-width:44rem">This is now the status word for this concept '+
      'everywhere on the site — on its tile, in the dependency map, and in the weakest-areas list. '+
      'It moves when you retake the quiz, and only then.</p>'+
    '<h2 class="sec">Every question, and why</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:44rem">Read the ones you got right too. '+
      'A right answer for the wrong reason is the most expensive thing you can carry into an exam, '+
      'and the note under each item is where you find out which kind you had.</p>'+
    '<ol class="qzlist marked">';

  for (i=0;i<last.answers.length;i++){
    var a = last.answers[i], it = quizItemById(a.id);
    if (!it) continue;
    html += '<li class="qz '+(a.ok?"ok":"bad")+'">'+
      '<div class="qz-stem">'+md(it.stem)+'</div>'+
      '<div class="qz-opts marked">';
    for (var k=0;k<it.options.length;k++){
      var cls = k === it.answer ? "right" : (k === a.picked ? "wrong" : "");
      var tag = k === it.answer ? '<span class="qz-tag">correct</span>'
              : (k === a.picked ? '<span class="qz-tag">you</span>' : '');
      html += '<div class="qz-opt done '+cls+'"><span class="qz-let">'+String.fromCharCode(65+k)+'</span>'+
        '<span class="qz-txt">'+md(it.options[k])+'</span>'+tag+'</div>';
    }
    html += '</div>'+
      '<div class="qz-why"><strong>'+(a.ok?"Why that is right.":"The right answer.")+'</strong> '+
        md(it.why)+'</div>';
    if (!a.ok){
      var wn = whyNotFor(it, a.picked);
      if (wn) html += '<div class="qz-whynot"><strong>What you picked, and why it fails.</strong> '+
        md(wn)+'</div>';
    }
    if (it.source) html += '<div class="qz-src faint">'+esc(it.source)+'</div>';
    html += '</li>';
  }
  html += '</ol>'+
    '<div class="btnrow" style="margin-top:18px">'+
      '<a class="btn primary" href="#/learn/'+c.id+'">Back to the concept</a>'+
      '<button class="btn" data-act="requiz">Retake it now</button>'+
      '<a class="btn ghost" href="#/quiz">All quizzes</a>'+
    '</div>';
  /* Onward only on a solid pass, and only on the attempt you just finished.
     Being carried to the next concept off a weak score would be the site
     agreeing that you were done.

     A link, never a countdown. The marked page is the one page here you are
     meant to sit and read — the misses, and the notes under the ones you got
     right — and a timer that navigates away while you are doing that would
     take back the whole point of grading at the end. Autoplay stays where it
     was: the deck-cleared screen, and nowhere else. */
  if (fresh && last.score >= 0.75) html += resumeCta(c.id, "Next");
  return html + '</div>';
}

CLICKS.quiz = function(e, arg){
  var t = e.target.closest ? e.target.closest("[data-pick],[data-act]") : null;
  if (!t) return;
  var pick = t.getAttribute("data-pick");
  if (pick && quizRun && !quizRun.graded){
    var bits = pick.split("|");
    quizRun.picked[bits[0]] = parseInt(bits[1], 10);
    render();
    return;
  }
  var act = t.getAttribute("data-act");
  if (act === "grade" && quizRun && !quizRun.graded){
    gradeQuiz(quizRun);
    render();
    /* A marked page that opens halfway down is a page whose verdict you never
       see. The view is replaced wholesale, so this is the one place a scroll
       reset is right. */
    var v = document.getElementById("view");
    if (v) v.scrollTop = 0;
    return;
  }
  if (act === "requiz"){
    quizRun = startQuiz(arg.replace(/\?.*$/, ""));
    render();
    return;
  }
};

/* The index: what has been tested, what is owed, and what came back weak. */
function quizIndex(){
  var owed = quizOwed(), rows = [], i, solid = 0;
  for (i=0;i<CONCEPTS.length;i++){
    var c = CONCEPTS[i];
    if (!quizFor(c.id).length || !quizTaken(c.id)) continue;
    var s = quizScore(c.id);
    if (s >= 0.75) solid++;
    rows.push({c:c, s:s});
  }
  rows.sort(function(a,b){ return a.s - b.s; });

  var covered = 0;
  for (i=0;i<CONCEPTS.length;i++) if (quizFor(CONCEPTS[i].id).length) covered++;

  var html = '<div class="page">'+
    '<div class="title"><span class="emo">📝</span><h1>Quizzes</h1></div>'+
    '<p class="lede">One graded quiz per concept, sat at the end of the lesson. It is the only '+
      'thing here that marks you rather than asking you to mark yourself, which is why it — and '+
      'not your flashcard streak — decides whether a concept reads solid, shaky or weak.</p>'+
    '<div class="grid g3" style="margin-top:22px">'+
      '<div class="card stat"><div class="k">Quizzed</div><div class="v">'+rows.length+
        '<span class="faint" style="font-size:16px">/'+covered+'</span></div>'+
        '<div class="s">'+(covered-rows.length)+' never sat</div></div>'+
      '<div class="card stat"><div class="k">Owed</div><div class="v">'+owed.length+'</div>'+
        '<div class="s">'+(owed.length ? 'read but not tested' : 'nothing read and untested')+'</div></div>'+
      '<div class="card stat"><div class="k">Solid</div><div class="v">'+solid+'</div>'+
        '<div class="s">'+(rows.length-solid)+' below that</div></div>'+
    '</div>';

  if (owed.length){
    html += '<h2 class="sec">Read, not yet tested</h2>'+
      '<p class="muted" style="margin:-4px 0 12px;max-width:44rem">You have worked through these '+
        'lessons and there is no evidence either way about what stuck. Cheapest possible '+
        'information — a quiz is four questions.</p><div class="btnrow">';
    for (i=0;i<owed.length;i++)
      html += '<a class="btn sm" href="#/quiz/'+owed[i].id+'">'+esc(owed[i].title)+'</a>';
    html += '</div>';
  }

  if (rows.length){
    html += '<h2 class="sec">Sat, weakest first</h2><div class="tscroll"><table class="t">'+
      '<thead><tr><th>Concept</th><th>Verdict</th><th class="n">Score</th><th>When</th><th></th></tr></thead><tbody>';
    for (i=0;i<rows.length;i++){
      var r = rows[i], v = quizVerdict(r.s), st = quizState(r.c.id);
      html += '<tr><td><a href="#/learn/'+r.c.id+'">'+esc(r.c.title)+'</a></td>'+
        '<td><span class="pill '+v.cls+'"><span class="dot"></span>'+v.word+'</span></td>'+
        '<td class="n">'+st.last.correct+'/'+st.last.n+'</td>'+
        '<td class="n">'+fmtDate(st.last.t)+'</td>'+
        '<td><a class="btn sm" href="#/quiz/'+r.c.id+'">retake</a></td></tr>';
    }
    html += '</tbody></table></div>';
  } else if (!owed.length){
    html += '<p class="empty" style="margin-top:20px">Nothing sat yet. Open a concept — the quiz '+
      'is at the bottom of the lesson, and it is how the concept gets its status word.</p>';
  }
  return html + '</div>';
}

/* ===========================================================================
   VIEW · DEPENDENCY MAP
   Layered DAG, depth = longest path from a root. Hand-rolled because pulling in
   a graph library would mean a CDN, and this file has to work offline.
   =========================================================================== */
function depthOf(c, seen){
  if (!c.prereqs || !c.prereqs.length) return 0;
  seen = seen || {};
  if (seen[c.id]) return 0;                  /* cycle guard — reported by selfCheck */
  seen[c.id] = 1;
  var d = 0;
  for (var i=0;i<c.prereqs.length;i++){
    var p = byId(c.prereqs[i]);
    if (p) d = Math.max(d, 1 + depthOf(p, seen));
  }
  delete seen[c.id];
  return d;
}
/* ---- What to learn next ----------------------------------------------------
   A greedy topological walk, weighted by how much each concept unblocks.

   "Done" is deliberately not "opened once". A concept you read and then scored
   red on is not done, and because its own prerequisites are satisfied it lands
   back at the top of the order — so a shaky prerequisite gates everything built
   on it without needing a separate "revise" list. */
/* A concept's phase, in the scheduler's terms rather than in a score's.

   The distinction that matters: **being due is not the same as being weak.**
   An earlier version called a concept "revisit" the moment its mastery sat
   below a threshold, which meant one amber answer on a first attempt bounced it
   straight back to the top of the list. That is the exact behaviour spaced
   repetition exists to replace — you attempt a thing, it gets scheduled, and it
   comes back when the schedule says so, not when a running average dips.

     new       nothing seen, nothing read
     learning  started, but some cards have never been shown
     due       every card seen at least once, and one or more is due today
     solid     every card seen, nothing due — quiet until the scheduler says otherwise
*/
/* Status dot for a concept, in the scheduler's four phases rather than a mastery
   score — "attempted" is a fact about whether cards have been shown, and a score
   cannot express the difference between never-seen and seen-and-due. */
var PHASE_WORD = {new:"not attempted", learning:"part attempted", due:"due for review", solid:"attempted"};
function conceptDot(c){
  var p = conceptStats(c).phase;
  return '<span class="sdot s-'+p+'" title="'+PHASE_WORD[p]+'"></span>';
}
function conceptStats(c){
  var cards = cardsFor(c.id), t = today0(), seen = 0, due = 0, over = 0, crit = 0, i;
  for (i=0;i<cards.length;i++){
    var st = S.cards[cards[i].id];
    if (st && st.seen){
      seen++;
      if (st.due <= t){ due++; over = Math.max(over, Math.round((t - st.due)/DAY)); }
      if (atCriterion(cards[i].id)) crit++;
    }
  }
  var L = S.lessons[c.id], read = !!(L && L.read), n = cards.length, phase;
  var qn = QUIZ_ON ? quizFor(c.id).length : 0, qt = qn ? quizTaken(c.id) : false;
  if (qn){
    /* With a quiz in play the milestone is the quiz, not the deck. Cards are no
       longer the evidence that a concept was worked, so counting unseen cards as
       "part attempted" would leave every quizzed concept stuck in `learning`
       for as long as its deck went untouched — and `learning` is what the
       dependency walk reads as unfinished business. Sitting the quiz closes the
       concept; due cards then reopen it exactly as they always did. */
    if (!qt)   phase = read ? "learning" : "new";
    else       phase = due ? "due" : "solid";
  }
  else if (n === 0)     phase = read ? "solid" : "new";   /* nothing to drill */
  else if (seen === 0)  phase = read ? "learning" : "new";
  else if (seen < n)    phase = "learning";
  else                  phase = due ? "due" : "solid";
  return {n:n, seen:seen, due:due, overdue:over, crit:crit, read:read, phase:phase,
          qn:qn, qtaken:qt, qscore:qn ? quizScore(c.id) : null,
          mastery:conceptMastery(c.id)};
}
/* Covered = worked through once, so downstream concepts are unblocked. A due
   concept still counts: the scheduler expects you to know it, it is simply time
   to prove it again. Gating new material behind a review that happens to be due
   would stall the whole graph every few days for no pedagogical reason. */
function conceptCovered(c){
  var p = conceptStats(c).phase;
  return p === "due" || p === "solid";
}
function childMap(){
  var kids = {};
  for (var i=0;i<CONCEPTS.length;i++){
    var ps = CONCEPTS[i].prereqs || [];
    for (var k=0;k<ps.length;k++) (kids[ps[k]] = kids[ps[k]] || []).push(CONCEPTS[i].id);
  }
  return kids;
}
/* How much still-unlearned material sits behind a concept.

   `covered` is the live set from the walk, which includes the concepts already
   emitted higher in the list. Two consequences, both wanted: a prerequisite whose
   dependents you drilled out of order no longer advertises work you have already
   done, and two candidates cannot both claim credit for the same subtree — once
   the first is emitted, the second is scored on what it adds.

   Traversal passes *through* covered nodes rather than stopping at them, because
   a covered concept's own dependents may still be blocked by some other prereq. */
function downstreamCount(id, kids, covered){
  var seen = {}, stack = (kids[id]||[]).slice(), n = 0;
  while (stack.length){
    var x = stack.pop();
    if (seen[x]) continue;
    seen[x] = 1;
    if (!covered || !covered[x]) n++;
    var kk = kids[x] || [];
    for (var j=0;j<kk.length;j++) if (!seen[kk[j]]) stack.push(kk[j]);
  }
  return n;
}
function nextUp(limit){
  var covered = {}, i, c, kids = childMap();
  for (i=0;i<CONCEPTS.length;i++) if (conceptCovered(CONCEPTS[i])) covered[CONCEPTS[i].id] = 1;

  var out = [], guard = 0;
  while (out.length < (limit || 8) && guard++ < 400){
    var ready = [];
    for (i=0;i<CONCEPTS.length;i++){
      c = CONCEPTS[i];
      if (covered[c.id]) continue;
      var ps = c.prereqs || [], ok = true;
      for (var k=0;k<ps.length;k++){
        if (!byId(ps[k])) continue;      /* a prereq that does not exist cannot block */
        if (!covered[ps[k]]){ ok = false; break; }
      }
      if (ok) ready.push(c);
    }
    if (!ready.length) break;
    ready.sort(function(a,b){
      /* Finish what is already open before opening something new. */
      var pa = conceptStats(a).phase === "learning" ? 0 : 1;
      var pb = conceptStats(b).phase === "learning" ? 0 : 1;
      if (pa !== pb) return pa - pb;
      var ua = downstreamCount(a.id, kids, covered), ub = downstreamCount(b.id, kids, covered);
      if (ub !== ua) return ub - ua;                 /* unblock the most *remaining* work first */
      var da = depthOf(a), db = depthOf(b);
      if (da !== db) return da - db;                 /* then the shallower one */
      return a.title < b.title ? -1 : 1;
    });
    var pick = ready[0], st = conceptStats(pick);
    var gain = downstreamCount(pick.id, kids, covered);   /* score before marking */
    covered[pick.id] = 1;                            /* assume it gets learned, and continue */
    out.push({c:pick, stats:st, unlocks:gain});
  }
  return {list: out, remaining: CONCEPTS.length - Object.keys(covered).length};
}
/* Concepts the scheduler is asking for back. Most overdue first — that is the
   card that has decayed furthest, so it is the one worth the minute. */
function dueConcepts(){
  var out = [], i;
  for (i=0;i<CONCEPTS.length;i++){
    var s = conceptStats(CONCEPTS[i]);
    if (s.phase === "due") out.push({c:CONCEPTS[i], stats:s});
  }
  out.sort(function(a,b){
    if (b.stats.overdue !== a.stats.overdue) return b.stats.overdue - a.stats.overdue;
    if (b.stats.due !== a.stats.due) return b.stats.due - a.stats.due;
    return (a.stats.mastery || 0) - (b.stats.mastery || 0);
  });
  return out;
}
/* The single concept to go to after finishing one. */
function nextConcept(afterId){
  var r = nextUp(4);
  for (var i=0;i<r.list.length;i++) if (r.list[i].c.id !== afterId) return r.list[i];
  return null;
}
function nextRow(rank, item){
  var c = item.c, g = groupOf(c.group), s = item.stats, tag = "";
  if (s.phase === "learning" && s.qn){
    tag = '<span class="pill p-yellow"><span class="dot"></span>read, not quizzed</span>';
  } else if (s.phase === "learning" && s.n){
    tag = '<span class="pill p-yellow"><span class="dot"></span>'+s.seen+'/'+s.n+' seen</span>';
  } else if (s.phase === "due"){
    tag = '<span class="pill p-blue"><span class="dot"></span>'+s.due+' due'+
          (s.overdue > 0 ? ' · '+s.overdue+'d' : '')+'</span>';
  }
  return '<li><a href="#/learn/'+c.id+'">'+
      (rank ? '<span class="nrank">'+rank+'</span>' : '')+
      '<span class="ntitle">'+esc(c.title)+'</span>'+
      '<span class="pill '+g.pill+'"><span class="dot"></span>'+esc(g.label)+'</span>'+ tag +
      (item.unlocks ? '<span class="nunlock">unlocks '+item.unlocks+' more</span>' : '')+
    '</a></li>';
}
function nextUpHtml(){
  var due = dueConcepts(), r = nextUp(8), rows = r.list, html = "", i;

  /* Reviews first — they are owed, and the deck builder already orders the same
     way ("Due work first — it is owed"). */
  if (due.length){
    html += '<h2 class="sec">Due for review</h2>'+
      '<p class="muted" style="margin:-4px 0 12px;max-width:44rem">The scheduler is asking for '+
      'these back. Being due is not a mark against you — it is the interval expiring, which is '+
      'the whole mechanism. Most overdue first.</p><ol class="nextlist">';
    for (i=0;i<Math.min(due.length,5);i++) html += nextRow(0, due[i]);
    html += "</ol>";
    if (due.length > 5){
      html += '<p class="faint" style="font-size:12px;margin-top:8px">'+(due.length-5)+
              ' more due — <a href="#/cards">clear them as one deck</a>.</p>';
    }
  }

  if (!rows.length){
    html += '<h2 class="sec">Learn next</h2>'+
      '<div class="card"><p style="margin:0">Nothing new is unlocked — you have worked through '+
      'every concept whose prerequisites you have met. '+
      (due.length ? 'Clear the reviews above and the graph stays open.'
                  : 'Go to <a href="#/mock">Mock interview</a> to be tested out loud.')+
      '</p></div>';
    return html;
  }

  html += '<h2 class="sec">Learn next</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:44rem">Ordered by how much each one '+
    'unblocks, starting from what you have already covered. Anything part-finished comes first — '+
    'a half-worked deck is worth closing before opening another.</p><ol class="nextlist">';
  for (i=0;i<rows.length;i++) html += nextRow(i+1, rows[i]);
  html += "</ol>";
  if (r.remaining > 0){
    html += '<p class="faint" style="font-size:12px;margin-top:8px">'+r.remaining+
            ' further concepts open up behind these.</p>';
  }
  return html;
}
/* Shared "continue" call to action — concept footer, deck-cleared, overview. */
/* ---- Autoplay --------------------------------------------------------------
   Netflix's post-credits countdown, for concepts. The point is to delete the
   decision — stopping should take an action, not continuing.

   It fires from exactly one place: **the deck-cleared screen**, after you have
   worked a concept's flashcards to the end. Nowhere else.

   That restriction is the important part. An earlier version also armed at the
   bottom of a finished lesson, which was wrong for a reason that only shows up
   in use: most visits to a *finished* concept are lookups. You come back to
   check one number, scroll, and get carried into the next concept — punished
   for revisiting. Reaching the bottom of a page is not evidence of work.
   Clearing a deck is.

   Three more things keep it safe rather than hostile:

   1. It is armed by *reaching* the end card, not by the page rendering. An
      IntersectionObserver on the card is the whole mechanism, and where the
      browser has no observer nothing arms.
   2. Any click or key press cancels it, as does the tab losing focus. A timer
      that fires while you are reading is the failure mode that would make you
      turn the feature off for good.
   3. It only ever advances to the concept the dependency walk was already
      recommending, and each of those opens on its own pretest gate. So the
      binge is guess → read → guess → read. It cannot become passive scrolling,
      which is the version of this that would actually cost you something. */
var AUTO_MS = 3000;
var autoTimer = null, autoTick = null, autoObs = null;

function clearAutoplay(){
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  if (autoTick)  { clearInterval(autoTick); autoTick = null; }
  if (autoObs)   { autoObs.disconnect(); autoObs = null; }
}
/* Called at the end of every render. Looks for a card that asked to be armed and
   watches it; the countdown itself does not start until it is on screen. */
function armAutoplay(){
  clearAutoplay();
  if (!S.autoplay) return;
  var box = document.querySelector("[data-auto-to]");
  if (!box || typeof IntersectionObserver === "undefined") return;
  var target = box.getAttribute("data-auto-to");

  autoObs = new IntersectionObserver(function(entries){
    for (var i=0;i<entries.length;i++){
      if (!entries[i].isIntersecting) continue;
      if (autoObs) { autoObs.disconnect(); autoObs = null; }
      runAutoplay(box, target);
    }
  }, {threshold: 0.9});
  autoObs.observe(box);
}
function runAutoplay(box, target){
  if (document.hidden) return;                 /* you are not even looking */
  box.classList.add("counting");
  var left = Math.round(AUTO_MS/1000);
  var num = box.querySelector(".auto-num");
  if (num) num.textContent = left;
  autoTick = setInterval(function(){
    left--;
    if (num) num.textContent = Math.max(0, left);
  }, 1000);
  autoTimer = setTimeout(function(){
    clearAutoplay();
    go("learn", target);
  }, AUTO_MS);
}
/* Cancelling leaves the card in place with the countdown stopped, rather than
   removing it — the Continue button is still the thing you probably want, and
   re-rendering here would re-arm the observer and start the whole thing again. */
function cancelAutoplay(){
  if (!autoTimer && !autoObs) return;
  clearAutoplay();
  var box = document.querySelector("[data-auto-to]");
  if (box){
    box.classList.remove("counting");
    box.classList.add("stopped");
    var t = box.querySelector(".auto-txt");
    if (t) t.textContent = "Autoplay stopped — take the next one when you want it.";
  }
}
document.addEventListener("visibilitychange", function(){ if (document.hidden) cancelAutoplay(); });

function resumeCta(afterId, heading, auto){
  var due = dueConcepts(), nx = nextConcept(afterId || null);
  if (!due.length && !nx) return "";
  var armed = !!(auto && nx && S.autoplay);
  var html = '<div class="card'+(armed?" autocard":"")+'" style="margin-top:18px;max-width:46rem"'+
             (armed ? ' data-auto-to="'+esc(nx.c.id)+'"' : '')+'>';
  if (heading) html += '<div class="eyebrow">'+esc(heading)+'</div>';
  if (nx){
    var s = nx.stats;
    html += '<div style="font-weight:600;font-size:15px;margin:4px 0 2px">'+esc(nx.c.title)+'</div>'+
      '<div class="muted" style="font-size:13px">'+
        (s.phase === "learning" ? 'Part-finished — '+s.seen+' of '+s.n+' cards seen.'
                                : 'Next in the dependency order'+
                                  (nx.unlocks ? ', and it unlocks '+nx.unlocks+' more.' : '.'))+
      '</div><div class="btnrow" style="margin-top:10px">'+
      '<a class="btn primary" href="#/learn/'+nx.c.id+'">Continue <span data-ico="arrow"></span></a>'+
      (due.length ? '<a class="btn" href="#/cards">Review '+due.length+' due first</a>' : '')+
      '</div>';
    if (armed){
      html += '<div class="autoStrip">'+
        '<div class="auto-rail"><i></i></div>'+
        '<div class="auto-row">'+
          '<span class="auto-txt">Rolling on in <b class="auto-num">'+Math.round(AUTO_MS/1000)+
            '</b>… anything you click or type stops it.</span>'+
          '<button class="btn sm ghost" data-act="autooff">Turn autoplay off</button>'+
        '</div></div>';
    } else if (auto && nx){
      html += '<div class="auto-row" style="margin-top:10px">'+
        '<span class="faint" style="font-size:12px">Autoplay is off.</span>'+
        '<button class="btn sm ghost" data-act="autoon">Turn it back on</button></div>';
    }
  } else {
    html += '<div style="font-weight:600;font-size:15px;margin:4px 0 2px">'+due.length+
      ' concept'+(due.length===1?'':'s')+' due for review</div>'+
      '<div class="muted" style="font-size:13px">Nothing new is unlocked until these come back around.</div>'+
      '<div class="btnrow" style="margin-top:10px"><a class="btn primary" href="#/cards">Review now</a></div>';
  }
  return html + "</div>";
}

VIEWS.map = function(){
  var layers = {}, maxd = 0, i;
  for (i=0;i<CONCEPTS.length;i++){
    var d = depthOf(CONCEPTS[i]);
    (layers[d] = layers[d] || []).push(CONCEPTS[i]);
    if (d > maxd) maxd = d;
  }
  var COLW = 196, ROWH = 52, NW = 168, NH = 34, PAD = 24;
  var maxRows = 0;
  for (i=0;i<=maxd;i++) maxRows = Math.max(maxRows, (layers[i]||[]).length);
  var W = PAD*2 + (maxd+1)*COLW, H = PAD*2 + maxRows*ROWH;

  var pos = {};
  for (var d2=0; d2<=maxd; d2++){
    var row = layers[d2] || [];
    for (var j=0;j<row.length;j++){
      pos[row[j].id] = {x: PAD + d2*COLW, y: PAD + j*ROWH};
    }
  }

  var edges = "", nodes = "";
  for (i=0;i<CONCEPTS.length;i++){
    var c = CONCEPTS[i], to = pos[c.id];
    if (!c.prereqs) continue;
    for (var k=0;k<c.prereqs.length;k++){
      var from = pos[c.prereqs[k]];
      if (!from) continue;
      var x1 = from.x + NW, y1 = from.y + NH/2, x2 = to.x, y2 = to.y + NH/2;
      var mx = (x1+x2)/2;
      edges += '<path class="edge" d="M'+x1+' '+y1+' C'+mx+' '+y1+' '+mx+' '+y2+' '+x2+' '+y2+'"/>';
    }
  }
  for (i=0;i<CONCEPTS.length;i++){
    var cc = CONCEPTS[i], p = pos[cc.id], mm = conceptMastery(cc.id);
    var label = cc.title.length > 24 ? cc.title.slice(0,23)+"…" : cc.title;
    nodes += '<a class="node" href="#/learn/'+cc.id+'">'+
      '<rect x="'+p.x+'" y="'+p.y+'" width="'+NW+'" height="'+NH+'" rx="6" '+
        'fill="'+masteryFill(mm)+'" stroke="rgba(15,15,15,.14)"/>'+
      '<text x="'+(p.x+10)+'" y="'+(p.y+21)+'">'+esc(label)+'</text></a>';
  }

  return '<div class="page">'+
    '<div class="title"><span class="emo">🕸️</span><h1>Dependency map</h1></div>'+
    '<p class="lede">Left to right is the order things can be learned in. An arrow means '+
      '<em>you need that first</em>. Fill colour is your current mastery — grey is untouched, '+
      'red is weak, green is solid. Click any box.</p>'+
    '<div class="btnrow" style="margin:16px 0 10px">'+
      '<span class="pill" style="background:#efefee"><span class="dot" style="background:#c4c4c2"></span>not started</span>'+
      '<span class="pill p-red"><span class="dot"></span>weak</span>'+
      '<span class="pill p-yellow"><span class="dot"></span>shaky</span>'+
      '<span class="pill p-green"><span class="dot"></span>solid</span>'+
    '</div>'+
    '<div class="mapwrap nsb"><svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+
      edges + nodes + '</svg></div>'+
    nextUpHtml()+
    '<p class="faint" style="margin-top:10px;font-size:12px">'+CONCEPTS.length+' concepts, '+
      (maxd+1)+' layers deep.</p>'+
  '</div>';
};

/* ===========================================================================
   VIEW · PIPELINE
   The dependency map answers "what do I need to know first". This answers a
   different question — "what does the code actually do to the data, in order" —
   and they are deliberately not the same picture. A concept can sit late in the
   learning order and early in the pipeline; the dry edge is the obvious case.

   Selecting a step routes to #/pipeline/<id> rather than holding the selection
   in a variable, so a step is linkable, survives a reload, and can be reached
   from a concept page. Every other view in this file already works that way.
   =========================================================================== */
/* No label gutter. The first cut put the stage names in a 124px column down the
   left, which cost a seventh of the width and pushed the diagram past the edge
   of its container — the labels are now set above each band instead, where they
   are free. Five columns, so the natural width lands near 800 and the SVG can
   be scaled to its container without the type going to mush. */
var P_PAD = 16, P_COLW = 158, P_NW = 150, P_NH = 48, P_LANEH = 98, P_LABEL = 26;

function pipeNode(id){
  for (var i=0;i<PIPE.length;i++) if (PIPE[i].id === id) return PIPE[i];
  return null;
}
function pipeKind(k){ return PIPE_KINDS[k] || PIPE_KINDS.code; }
/* Every step that names this concept, in pipeline order. Read by the concept
   view — a function declaration, so hoisting covers the fact that it is used
   several hundred lines above where it is written. */
function pipeStepsFor(cid){
  var out = [];
  for (var i=0;i<PIPE.length;i++){
    var cs = PIPE[i].concepts || [];
    for (var j=0;j<cs.length;j++) if (cs[j] === cid){ out.push(PIPE[i]); break; }
  }
  return out;
}
/* The band is P_LABEL taller than the node it holds, and the node is centred in
   what is left, so the stage name sits above the row rather than beside it. */
function pipeXY(n){
  return {x: P_PAD + n.col * P_COLW,
          y: P_PAD + n.lane * P_LANEH + P_LABEL + (P_LANEH - P_LABEL - P_NH)/2};
}
/* Truncation is by character count rather than by measured width. The labels
   were authored to fit, so this is a backstop against a future edit, not the
   mechanism — which is why the budgets are deliberately tight. */
function pipeClip(s, max){
  s = String(s || "");
  return s.length > max ? s.slice(0, max-1) + "…" : s;
}

/* The two neighbourhoods a selection lights up. Direct only: a transitive
   closure from an early node highlights most of the diagram and stops meaning
   anything. */
function pipeNeighbours(id){
  var set = {}, i, j, n;
  set[id] = 1;
  n = pipeNode(id);
  if (n && n.from) for (j=0;j<n.from.length;j++) set[n.from[j]] = 1;
  for (i=0;i<PIPE.length;i++){
    var f = PIPE[i].from || [];
    for (j=0;j<f.length;j++) if (f[j] === id) set[PIPE[i].id] = 1;
  }
  return set;
}

function pipeSvg(sel){
  var i, j, maxCol = 0, nLanes = PIPE_LANES.length;
  for (i=0;i<PIPE.length;i++) maxCol = Math.max(maxCol, PIPE[i].col);
  var W = P_PAD*2 + maxCol*P_COLW + P_NW;
  var H = P_PAD*2 + nLanes*P_LANEH;
  var near = sel ? pipeNeighbours(sel) : null;

  /* Lane bands first, so everything else draws over them. Alternating rather
     than every-other-boundary-ruled: a full grid of hairlines competed with the
     edges for attention and the edges are the content. */
  var bands = "", labels = "";
  for (i=0;i<nLanes;i++){
    var ly = P_PAD + i*P_LANEH;
    if (i % 2 === 0)
      bands += '<rect class="pband" x="0" y="'+ly+'" width="'+W+'" height="'+P_LANEH+'"/>';
    labels += '<text class="plane" x="'+P_PAD+'" y="'+(ly + 17)+'">'+
              esc(PIPE_LANES[i].label)+'</text>';
  }

  var edges = "", nodes = "";
  for (i=0;i<PIPE.length;i++){
    var to = PIPE[i], f = to.from || [];
    for (j=0;j<f.length;j++){
      var src = pipeNode(f[j]);
      if (!src) continue;
      var a = pipeXY(src), b = pipeXY(to);
      var x1 = a.x + P_NW/2, y1 = a.y + P_NH, x2 = b.x + P_NW/2, y2 = b.y;
      var my = (y1 + y2)/2;
      /* --freeze-from supplies a reference the run may or may not have been
         given, so its edges are dashed: present in the code path, optional in
         any particular run. */
      var cls = "pedge";
      if (f[j] === "frozen") cls += " dash";
      if (sel) cls += (near[f[j]] && near[to.id] && (f[j]===sel || to.id===sel)) ? " hot" : " dim";
      edges += '<path class="'+cls+'" d="M'+x1+' '+y1+' C'+x1+' '+my+' '+x2+' '+my+
               ' '+x2+' '+y2+'" marker-end="url(#parrow)"/>';
    }
  }

  for (i=0;i<PIPE.length;i++){
    var n = PIPE[i], p = pipeXY(n), k = pipeKind(n.kind);
    var ncls = "pnode";
    if (sel){ ncls += (n.id === sel) ? " on" : (near[n.id] ? "" : " dim"); }
    var star = (n.id === "cdei") ? '<text class="pstar" x="'+(p.x+P_NW-13)+'" y="'+(p.y+17)+'">★</text>' : "";
    nodes += '<a class="'+ncls+'" href="#/pipeline/'+n.id+'" data-pnode="'+n.id+'">'+
      '<title>'+esc(n.t + " — " + k.label)+'</title>'+
      '<rect x="'+p.x+'" y="'+p.y+'" width="'+P_NW+'" height="'+P_NH+'" rx="7" '+
        'fill="'+k.fill+'" stroke="rgba(15,15,15,.16)"/>'+
      '<text class="pt" x="'+(p.x+10)+'" y="'+(p.y+20)+'">'+esc(pipeClip(n.t,21))+'</text>'+
      '<text class="ps" x="'+(p.x+10)+'" y="'+(p.y+35)+'">'+esc(pipeClip(n.s,25))+'</text>'+
      star + '</a>';
  }

  /* width/height are the intrinsic size; the CSS overrides width to 100% and
     lets height follow the viewBox ratio. That is what guarantees the diagram
     never scrolls sideways — it shrinks to whatever column it is given, and
     because the natural width is ~800 the shrink is small enough to stay
     readable rather than the 60% a 1270px canvas would have needed. */
  return '<div class="pipewrap" id="pipewrap">'+
    '<svg class="pipe'+(sel?" sel":"")+'" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" '+
      'preserveAspectRatio="xMidYMin meet">'+
      '<defs><marker id="parrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" '+
        'markerHeight="6" orient="auto-start-reverse">'+
        '<path d="M0 1 L7 4 L0 7 z" fill="var(--line-strong)"/></marker></defs>'+
      bands + labels + edges + nodes +
    '</svg></div>';
}

function pipeLegend(){
  var out = '<div class="btnrow" style="margin:14px 0 0">', k;
  for (var key in PIPE_KINDS){
    if (!PIPE_KINDS.hasOwnProperty(key)) continue;
    k = PIPE_KINDS[key];
    out += '<span class="pill '+k.pill+'"><span class="dot"></span>'+esc(k.label)+'</span>';
  }
  return out + '</div>';
}

/* The panel shown when nothing is selected. Not a placeholder — it is where the
   three vertical spines get named, because they are the one thing the picture
   cannot say for itself. */
function pipeIntro(){
  return '<div class="card">'+
    '<div class="eyebrow">How to read it</div>'+
    '<div class="prose" style="font-size:13.5px">'+para(
"Top to bottom is time: data enters at the top and a verdict comes out near the bottom. Left to right is not a scale — it is two half-pipelines running in parallel, and keeping them apart is the point.\n\n"+
"- **The left spine** turns imagery into the *target*. Pixels → units → the dry edge → distance → CDEI.\n"+
"- **The right spine** turns ClimateBC into the *predictors*. Points → levels and anomalies → novelty.\n"+
"- **They meet once**, at `features.parquet`, and never before it. If they met earlier the model would be predicting a satellite index from satellite bands, which scores well and means nothing.\n\n"+
"Three steps can stop the whole thing regardless of what the models say: the contrast gate, the skill gate, and the verdict rule. They are the yellow boxes, and they were fixed before the results came in.\n\n"+
"Click any step. Dashed arrows are the optional frozen-reference path.")+
    '</div></div>';
}

function pipeDetail(id){
  var n = pipeNode(id);
  if (!n) return pipeIntro();
  var k = pipeKind(n.kind), lane = PIPE_LANES[n.lane], i;

  var html = '<div class="card">'+
    '<a class="pclose" href="#/pipeline" title="clear the selection">\u00d7</a>'+
    '<div class="btnrow" style="margin-bottom:8px;padding-right:22px">'+
      '<span class="pill '+k.pill+'"><span class="dot"></span>'+esc(k.label)+'</span>'+
      '<span class="faint" style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;'+
        'font-weight:600">'+esc(lane.label)+'</span>'+
    '</div>'+
    '<div style="font-weight:700;font-size:18px;letter-spacing:-.015em">'+md(n.t)+'</div>'+
    (n.file ? '<div style="margin-top:6px"><span class="tlart">'+esc(n.file)+'</span></div>' : '')+
    '<div class="prose" style="font-size:13.5px;margin-top:10px">'+para(n.body)+'</div>';

  if (n.inp || n.out){
    html += '<div class="pio">'+
      (n.inp ? '<div><b>Takes</b>'+md(n.inp)+'</div>' : '')+
      (n.out ? '<div><b>Produces</b>'+md(n.out)+'</div>' : '')+
    '</div>';
  }

  if (n.nums && n.nums.length){
    html += '<div class="pnums">';
    for (i=0;i<n.nums.length;i++)
      html += '<div class="pnum"><b>'+esc(n.nums[i][0])+'</b><span>'+md(n.nums[i][1])+'</span></div>';
    html += '</div>';
  }

  if (n.trap)
    html += '<div class="note danger" style="margin-top:14px"><strong>Where this goes wrong.</strong><br>'+
            md(n.trap)+'</div>';

  html += '</div>';

  /* Concept links last and outside the card, so they read as an exit from the
     step rather than as part of it. Mastery colour comes along, which turns the
     diagram into a coverage map as a side effect. */
  if (n.concepts && n.concepts.length){
    html += '<h2 class="sec">The ideas behind this step</h2><div class="btnrow">';
    for (i=0;i<n.concepts.length;i++) html += conceptPill(n.concepts[i]);
    html += '</div>';
  }

  /* Neighbour navigation, so the diagram can be walked without going back to it. */
  var ups = (n.from || []), downs = [];
  for (i=0;i<PIPE.length;i++){
    var f = PIPE[i].from || [];
    for (var j=0;j<f.length;j++) if (f[j] === id) downs.push(PIPE[i].id);
  }
  if (ups.length || downs.length){
    html += '<h2 class="sec">Next to it in the pipeline</h2><div class="btnrow">';
    for (i=0;i<ups.length;i++){
      var u = pipeNode(ups[i]);
      if (u) html += '<a class="btn sm" href="#/pipeline/'+u.id+'">↑ '+esc(u.t)+'</a>';
    }
    for (i=0;i<downs.length;i++){
      var d = pipeNode(downs[i]);
      if (d) html += '<a class="btn sm" href="#/pipeline/'+d.id+'">↓ '+esc(d.t)+'</a>';
    }
    html += '</div>';
  }
  return html;
}

VIEWS.pipeline = function(arg){
  var sel = pipeNode(arg) ? arg : null;
  return '<div class="page wide">'+
    '<div class="title"><span class="emo">🛠️</span><h1>The pipeline</h1></div>'+
    '<p class="lede">Every step the data actually passes through, in order — from the '+
      'satellite and the City\'s server at the top to the verdict and the deliverable at the '+
      'bottom. Each box is a real module, artifact or decision in the repository, and each one '+
      'links to the ideas it depends on.</p>'+
    /* Two columns: the diagram scales to the left one, the panel sticks in the
       right one. The panel is not a floating tooltip on purpose — an overlay
       pinned to the right would cover the two right-hand columns of the very
       diagram it is describing, which is where half the climate half lives. */
    '<div class="pipegrid">'+
      '<div>'+ pipeSvg(sel) + pipeLegend() +
        '<p class="faint" style="margin-top:14px;font-size:12px">'+PIPE.length+' steps across '+
          PIPE_LANES.length+' stages.</p>'+
      '</div>'+
      '<aside class="pipeside nsb">'+ pipeDetail(sel) +'</aside>'+
    '</div>'+
  '</div>';
};

/* Arriving at #/pipeline/<id> from a link — or from a concept page — must not
   leave the selected step somewhere off the bottom of a 2,000px diagram. */
AFTER.pipeline = function(arg){
  if (!pipeNode(arg)) return;
  var el = document.querySelector('[data-pnode="'+arg+'"]');
  if (el) el.scrollIntoView({block:"center"});
};

/* ===========================================================================
   VIEW · TIMELINE
   The process record. Read top to bottom it is a report; filtered to one kind
   it answers a specific judging question ("what did you get wrong?" →
   corrections). The Markdown export exists because the obvious next use of this
   page is to become a document somewhere else, and retyping it would guarantee
   the two drift apart.
   =========================================================================== */

function eraOf(id){
  for (var i=0;i<ERAS.length;i++) if (ERAS[i].id === id) return ERAS[i];
  return {id:id, label:id, when:""};
}
function tlKind(k){ return TL_KINDS[k] || TL_KINDS.build; }

/* Dates are authored as strings — some are ISO, some are "Phase 1" or "open",
   because that is what the repository actually records. Split for display
   rather than parsed, so an unparseable one degrades to itself. */
function tlDate(d){
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (m) return {top:m[2]+"-"+m[3], sub:m[1]};
  var y = /^(\d{4})-(\d{2})$/.exec(d);
  if (y) return {top:y[2], sub:y[1]};
  return {top:d, sub:""};
}

function tlEntry(p){
  var k = tlKind(p.kind), d = tlDate(p.date), j;
  var html = '<div class="tlrow'+(p.key?" key":"")+'">'+
    '<div class="tldate"><b>'+esc(d.top)+'</b>'+esc(d.sub)+'</div>'+
    '<div class="tldot" style="background:'+k.dot+'"></div>'+
    '<div class="card">'+
      '<div class="btnrow" style="margin-bottom:7px">'+
        '<span class="pill '+k.pill+'"><span class="dot"></span>'+k.label+'</span>'+
        (p.key ? '<span class="faint" style="font-size:11px;letter-spacing:.06em;'+
                 'text-transform:uppercase;font-weight:600">key moment</span>' : '')+
      '</div>'+
      '<div style="font-weight:600;font-size:15.5px;letter-spacing:-.01em">'+md(p.title)+'</div>'+
      '<div class="prose" style="font-size:14px;margin-top:8px;max-width:46rem">'+para(p.what)+'</div>';

  if (p.why)     html += '<div class="tlfield"><span class="lbl">Why</span>'+md(p.why)+'</div>';
  if (p.changed) html += '<div class="tlfield"><span class="lbl">What changed</span>'+md(p.changed)+'</div>';

  if (p.evidence && p.evidence.length){
    html += '<ul class="tlev">';
    for (j=0;j<p.evidence.length;j++) html += '<li><span>'+md(p.evidence[j])+'</span></li>';
    html += '</ul>';
  }

  if ((p.artifacts && p.artifacts.length) || (p.concepts && p.concepts.length)){
    html += '<div class="btnrow" style="margin-top:12px">';
    if (p.artifacts) for (j=0;j<p.artifacts.length;j++)
      html += '<span class="tlart">'+esc(p.artifacts[j])+'</span>';
    if (p.concepts) for (j=0;j<p.concepts.length;j++) html += conceptPill(p.concepts[j]);
    html += '</div>';
  }
  return html + '</div></div>';
}

VIEWS.timeline = function(arg){
  var filter = TL_KINDS[arg] ? arg : null;
  var i, counts = {};
  for (i=0;i<PROCESS.length;i++) counts[PROCESS[i].kind] = (counts[PROCESS[i].kind]||0) + 1;

  var html = '<div class="page">'+
    '<div class="title"><span class="emo">🕰️</span><h1>Timeline</h1></div>'+
    '<p class="lede">The whole process, in the order it happened: what was decided and on what '+
      'reasoning, what was built, what came back, what turned out to be wrong, and what that forced. '+
      'Read straight through it is a process report. Filtered to <em>corrections</em> it is the answer '+
      'to the hardest question a judge asks.</p>'+

    '<div class="note info" style="margin:18px 0 0">'+
      '<strong>Where the dates come from.</strong> Every dated entry traces to a progress note, a '+
      'commit, or a findings document in the repository. Phases 1 and 2 predate the first commit and '+
      'the repository does not record dates for them, so they are labelled by phase rather than given '+
      'a date that would be invented.</div>'+

    /* The concept links carry mastery colour, so the legend has to be on the
       page that uses them rather than only on the dependency map. */
    '<div class="btnrow" style="margin:14px 0 0">'+
      '<span class="faint" style="font-size:12px">Concept links show where you stand:</span>'+
      '<span class="pill"><span class="dot"></span>not started</span>'+
      '<span class="pill p-red"><span class="dot"></span>weak</span>'+
      '<span class="pill p-yellow"><span class="dot"></span>shaky</span>'+
      '<span class="pill p-green"><span class="dot"></span>solid</span>'+
    '</div>'+

    '<div class="tabs" style="flex-wrap:wrap">'+
      '<a class="tab'+(filter?"":" on")+'" href="#/timeline">All '+
        '<span class="faint num">'+PROCESS.length+'</span></a>';
  for (i=0;i<TL_ORDER.length;i++){
    var k = TL_ORDER[i];
    if (!counts[k]) continue;
    html += '<a class="tab'+(filter===k?" on":"")+'" href="#/timeline/'+k+'">'+
      tlKind(k).label+' <span class="faint num">'+counts[k]+'</span></a>';
  }
  html += '</div>';

  if (filter){
    html += '<p class="muted" style="margin:14px 0 -6px;max-width:42rem">Showing '+
      '<strong>'+esc(tlKind(filter).label)+'</strong> entries only, still in order. '+
      '<a href="#/timeline">Show everything</a>.</p>';
  }

  /* Eras are only drawn when something under them survives the filter — an
     empty chapter heading reads as missing content rather than as a filter. */
  for (var e=0; e<ERAS.length; e++){
    var era = ERAS[e], rows = [];
    for (i=0;i<PROCESS.length;i++){
      if (PROCESS[i].era !== era.id) continue;
      if (filter && PROCESS[i].kind !== filter) continue;
      rows.push(i);
    }
    if (!rows.length) continue;

    html += '<div class="tlera">'+
      '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">'+
        '<h3>'+esc(era.label)+'</h3>'+
        '<span class="when">'+esc(era.when)+'</span>'+
        (era.verdict ? '<span class="pill '+(era.verdict.indexOf("INCONCLUSIVE")===0?"p-yellow":"p-red")+'">'+
          '<span class="dot"></span>'+esc(era.verdict)+'</span>' : '')+
      '</div>'+
      (filter ? "" : '<p>'+md(era.blurb)+'</p>')+
    '</div><div class="tl">';
    for (i=0;i<rows.length;i++) html += tlEntry(PROCESS[rows[i]]);
    html += '</div>';
  }

  html += '<h2 class="sec">Turn this into a process document</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:42rem">The full record as Markdown — every '+
      'era, every entry, with the reasoning and the evidence lines intact. Paste it into a document, a '+
      'logbook, or the process section of a report. It is generated from the same content this page '+
      'renders, so the two cannot disagree.</p>'+
    '<div class="btnrow" style="margin-bottom:10px">'+
      '<button class="btn primary" data-act="mdcopy">Copy as Markdown</button>'+
      '<button class="btn" data-act="mdshow">Show it</button></div>'+
    '<textarea class="txt mono" id="tlbox" placeholder="the Markdown appears here" '+
      'style="min-height:140px;font-size:12px"></textarea>'+
    '<div id="tlfb" style="margin-top:8px"></div>';

  return html + '</div>';
};

/* Markdown is written from the same arrays, not from the rendered DOM, so a
   style change here never silently rewrites the exported document. Concept
   links become their titles: a [[slug]] means nothing outside this page. */
function tlPlain(s){
  return String(s === undefined || s === null ? "" : s)
    .replace(/\[\[([a-z0-9\-]+)\]\]/g, function(_, id){
      var c = byId(id);
      return c ? c.title : id;
    });
}
function timelineMarkdown(){
  var doc = CENTRE.timelineDoc || {};
  var out = ["# " + (doc.title || CENTRE.title + " — process record"), "",
    doc.intro || "Generated from the Learning Centre timeline.", ""];
  for (var e=0;e<ERAS.length;e++){
    var era = ERAS[e], any = false, i, j;
    for (i=0;i<PROCESS.length;i++) if (PROCESS[i].era === era.id) { any = true; break; }
    if (!any) continue;
    out.push("## " + era.label);
    out.push("*" + era.when + (era.verdict ? " · verdict: " + era.verdict : "") + "*", "");
    if (era.blurb) out.push(tlPlain(era.blurb), "");
    for (i=0;i<PROCESS.length;i++){
      var p = PROCESS[i];
      if (p.era !== era.id) continue;
      out.push("### " + p.date + " — " + tlPlain(p.title) +
               "  \n`" + tlKind(p.kind).label + "`" + (p.key ? " · key moment" : ""), "");
      out.push(tlPlain(p.what), "");
      if (p.why)     out.push("**Why.** " + tlPlain(p.why), "");
      if (p.changed) out.push("**What changed.** " + tlPlain(p.changed), "");
      if (p.evidence && p.evidence.length){
        for (j=0;j<p.evidence.length;j++) out.push("- " + tlPlain(p.evidence[j]));
        out.push("");
      }
      if (p.artifacts && p.artifacts.length) out.push("Artifacts: `" + p.artifacts.join("`, `") + "`", "");
      if (p.concepts && p.concepts.length){
        var titles = [];
        for (j=0;j<p.concepts.length;j++){
          var c = byId(p.concepts[j]);
          if (c) titles.push(c.title);
        }
        if (titles.length) out.push("Concepts: " + titles.join(" · "), "");
      }
    }
  }
  return out.join("\n");
}

CLICKS.timeline = function(e){
  var t = e.target.closest ? e.target.closest("[data-act]") : null;
  if (!t) return;
  var box = document.getElementById("tlbox"), fb = document.getElementById("tlfb");
  box.value = timelineMarkdown();
  if (t.getAttribute("data-act") === "mdshow"){
    fb.innerHTML = '<span class="faint" style="font-size:12px">'+
      box.value.split("\n").length+' lines · '+PROCESS.length+' entries</span>';
    return;
  }
  box.select();
  var ok = false;
  try{ ok = document.execCommand("copy"); }catch(e2){}
  fb.innerHTML = '<span class="pill p-green"><span class="dot"></span>'+
    (ok ? "copied to clipboard" : "select the box and copy it")+'</span>';
};

/* ===========================================================================
   VIEW · FLIP THROUGH
   A browse mode, deliberately separate from Flashcards.

   Flashcards is the scheduler: what it shows you is what is owed, and grading
   moves the interval. This does neither. You choose a group, flip at your own
   pace, and nothing is written to S.cards — because a casual read-through that
   silently reset intervals would corrupt the one mechanism the site relies on
   to bring back what you got wrong.
   =========================================================================== */
var flip = null;   /* {ids:[cardId], i, shown, group, status} */

function cardStatus(id){
  var st = S.cards[id];
  if (!st || !st.seen) return "new";
  return st.due <= today0() ? "due" : "seen";
}
function rebuildFlip(){
  if (flip.custom) return;   /* a 'review the unknown' subset is not derived from the filters */
  var ids = [], i;
  for (i=0;i<CARDS.length;i++){
    var c = CARDS[i];
    if (flip.sel && !flip.sel[c.conceptId]) continue;      /* null sel = every concept */
    var st = cardStatus(c.id);
    if (flip.status === "new"  && st !== "new") continue;
    if (flip.status === "seen" && st === "new") continue;
    if (flip.status === "due"  && st !== "due") continue;
    if (flip.status === "flagged" && !isFlagged(c.conceptId)) continue;
    ids.push(c.id);
  }
  /* Keep the position if the deck did not change, so flipping the status filter
     back and forth does not throw you to the front of the deck. */
  var same = flip.ids.length === ids.length;
  if (same) for (i=0;i<ids.length;i++) if (ids[i] !== flip.ids[i]){ same = false; break; }
  if (!same){ flip.ids = ids; if (flip.i >= ids.length) flip.i = 0; }
}
VIEWS.practice = function(){
  if (!flip) flip = {sel:null, status:"all", i:0, shown:false, ids:[], track:false, marks:{}, hist:[], done:false};
  rebuildFlip();
  if (flip.track && flip.done) return trackSummary();

  var i, j, sel = flip.sel, nSelC = 0, nSelCards = 0;
  for (i=0;i<CONCEPTS.length;i++){
    if (!sel || sel[CONCEPTS[i].id]){ nSelC++; nSelCards += cardsFor(CONCEPTS[i].id).length; }
  }

  /* Concept picker. A trigger plus a modal rather than 70 chips inline — the
     wall of them dominated a page whose subject is meant to be the card. */
  var trigger = '<div class="btnrow" style="margin-bottom:4px">'+
    '<button class="btn" data-act="open-pick"><span data-ico="layers"></span> Choose concepts</button>'+
    '<span class="faint" style="font-size:12.5px">'+nSelC+' of '+CONCEPTS.length+
      ' selected · '+nSelCards+' cards</span></div>';

  var CHECK = '<span class="ckbox"><svg viewBox="0 0 20 20" width="11" height="11" fill="none" '+
    'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'+
    '<path d="M4 10l4 4 8-9"/></svg></span>';

  var body = "";
  for (i=0;i<GROUPS.length;i++){
    var g = GROUPS[i], rows = [], allOn = true, anyOn = false;
    for (j=0;j<CONCEPTS.length;j++) if (CONCEPTS[j].group === g.id) rows.push(CONCEPTS[j]);
    if (!rows.length) continue;
    var nAtt = 0, nFlag = 0;
    for (j=0;j<rows.length;j++){
      if (!sel || sel[rows[j].id]) anyOn = true; else allOn = false;
      if (conceptStats(rows[j]).phase !== "new") nAtt++;
      if (isFlagged(rows[j].id)) nFlag++;
    }
    body += '<div class="ckgroup"><div class="ckhead">'+
      '<button class="ckrow'+(allOn?" on":"")+'" data-act="grp" data-id="'+g.id+'" style="width:auto">'+
        CHECK+'<span class="pill '+g.pill+'"><span class="dot"></span>'+esc(g.label)+'</span>'+
        '<span class="ckn">'+nAtt+'/'+rows.length+' attempted</span>'+
        (nFlag ? '<span class="ckflag">\u2691 '+nFlag+'</span>' : '')+
        '</button></div><div class="ckgrid">';
    for (j=0;j<rows.length;j++){
      var c = rows[j], n = cardsFor(c.id).length, on = !sel || sel[c.id];
      var fl = isFlagged(c.id);
      body += '<button class="ckrow'+(on?" on":"")+(fl?" fl":"")+'" data-act="tog" data-id="'+c.id+'" '+
        'aria-pressed="'+(on?"true":"false")+'" '+
        'title="'+esc(c.title)+(fl?" — flagged":"")+'">'+CHECK+ conceptDot(c) +
        '<span class="cklabel">'+esc(c.title)+'</span>'+
        (fl ? '<span class="ckflag">\u2691</span>' : '')+
        '<span class="ckn">'+n+'</span></button>';
    }
    body += '</div></div>';
  }

  var pick = trigger +
    '<div class="modal"><div class="modal-bg" data-act="close-pick"></div>'+
      '<div class="modalbox">'+
        '<div class="modalhead"><b style="flex:1;font-size:15px">Which concepts?</b>'+
          '<span class="faint" style="font-size:12.5px">'+nSelCards+' cards</span>'+
          '<span class="ckleg"><span class="sdot s-new"></span>not attempted'+
            '<span class="sdot s-learning"></span>part<span class="sdot s-due"></span>due'+
            '<span class="sdot s-solid"></span>attempted'+
            (flaggedConcepts().length ? '<span class="ckflag" style="margin-left:10px">\u2691</span>flagged' : '')+
          '</span>'+
          '<button class="btn ghost sm" data-act="close-pick">Close</button></div>'+
        '<div class="modalbody nsb">'+body+'</div>'+
        '<div class="modalfoot">'+
          '<button class="btn sm" data-act="all">Select all</button>'+
          '<button class="btn sm" data-act="none">Clear</button>'+
          (flaggedConcepts().length
            ? '<button class="btn sm" data-act="onlyflagged">\u2691 Only flagged</button>' : '')+
          '<span class="spacer"></span>'+
          '<button class="btn primary sm" data-act="close-pick">Done</button></div>'+
      '</div></div>';

  var STATUS = [["all","Everything"],["new","Not attempted"],["seen","Attempted"],["due","Due now"]];
  var sbar = '<div class="btnrow" style="margin:14px 0 18px">';
  for (i=0;i<STATUS.length;i++){
    sbar += '<button class="btn sm'+(flip.status===STATUS[i][0]?" primary":"")+'" '+
            'data-act="st" data-id="'+STATUS[i][0]+'">'+STATUS[i][1]+'</button>';
  }
  var nFlagged = flaggedConcepts().length;
  if (nFlagged){
    /* A plain gap, not .spacer — that is flex:1 and would shove the button to
       the far edge of the row, away from the filters it belongs with. */
    sbar += '<span style="width:10px;flex:0 0 auto"></span>'+
      '<button class="btn sm'+(flip.status==="flagged"?" primary":"")+'" '+
      'data-act="st" data-id="flagged">\u2691 Flagged <span class="num">('+nFlagged+')</span></button>';
  }
  sbar += '</div>';

  var head = '<div class="page"><div class="fs-hide">'+
    '<div class="title"><span class="emo">🔁</span><h1>Flip through</h1></div>'+
    '<p class="lede">Choose exactly what you want in the deck, then flip at your own pace. Nothing '+
      'here touches your review schedule — use <a href="#/cards">Flashcards</a> when you want the '+
      'spacing to count.</p>' + pick + sbar + '</div>';

  if (!flip.ids.length){
    return head + '<div class="card" style="max-width:44rem"><p style="margin:0">'+
      (nSelC === 0 ? 'No concepts selected — pick some above.'
       : flip.status === "new"  ? 'You have attempted every card in this selection.'
       : flip.status === "due"  ? 'Nothing is due in this selection.'
       : flip.status === "flagged" ? 'None of the selected concepts are flagged.'
       : 'No cards match.')+'</p></div></div>';
  }

  var id = flip.ids[flip.i], card = null;
  for (i=0;i<CARDS.length;i++) if (CARDS[i].id === id) card = CARDS[i];
  if (!card) return head + '</div>';
  var concept = byId(card.conceptId), st = cardStatus(id);
  var nKnown = 0, nUnknown = 0, strip = "";
  if (flip.track){
    strip = '<div class="trackstrip">';
    for (i=0;i<flip.ids.length;i++){
      var mk = flip.marks[flip.ids[i]];
      if (mk === "known") nKnown++; else if (mk === "unknown") nUnknown++;
      strip += '<i class="'+(mk||"")+(i===flip.i?" now":"")+'"></i>';
    }
    strip += '</div>';
  }
  var STAT_PILL = {new:'<span class="pill"><span class="dot"></span>not attempted</span>',
                   seen:'<span class="pill p-green"><span class="dot"></span>attempted</span>',
                   due:'<span class="pill p-blue"><span class="dot"></span>due</span>'};

  return head +
    '<div class="flipwrap">'+
      '<div class="flipmeta">'+
        (concept ? '<a class="pill" href="#/learn/'+concept.id+'"><span class="dot"></span>'+
                   esc(concept.title)+'</a>' : '')+
        STAT_PILL[st]+
        (concept ? flagBtn(concept.id, isFlagged(concept.id) ? "Flagged" : "") : '')+
        '<span class="spacer"></span>'+
        (flip.track ? '<span class="pill p-green"><span class="dot"></span>'+nKnown+' known</span>'+
                      '<span class="pill p-red"><span class="dot"></span>'+nUnknown+' unknown</span>' : '')+
        '<span class="faint num">'+(flip.i+1)+' / '+flip.ids.length+'</span>'+
      '</div>'+
      (flip.track ? strip : '')+
      '<div class="flipcard'+(flip.shown?" flipped":"")+'" data-act="flip">'+
        '<div class="flipface front"><div class="fkind">'+esc(card.type)+'</div>'+
          '<div class="ftext">'+md(card.front)+'</div>'+
          '<div class="fhint">click to flip</div></div>'+
        '<div class="flipface back"><div class="fkind">answer</div>'+
          '<div class="ftext">'+para(card.back)+'</div>'+
          (card.means ? '<div class="fmeans">'+para(card.means)+'</div>' : '')+
          (TUTOR_LOCAL ? '<div class="fask"><button class="btn sm" data-act="ask">'+
            '<span data-ico="ask"></span> Ask about this</button></div>' : '')+
        '</div>'+
      '</div>'+
      '<div class="btnrow" style="margin-top:14px">'+
        (flip.track
          ? '<button class="btn" data-act="undo"'+(flip.hist.length?"":" disabled")+'>Undo</button>'+
            '<button class="btn r" data-act="unknown">← Unknown</button>'+
            '<button class="btn primary" data-act="flip">'+(flip.shown?"Hide answer":"Show answer")+'</button>'+
            '<button class="btn g" data-act="known">Known →</button>'
          : '<button class="btn" data-act="prev"'+(flip.i===0?" disabled":"")+'>Back</button>'+
            '<button class="btn primary" data-act="flip">'+(flip.shown?"Hide answer":"Show answer")+'</button>'+
            '<button class="btn" data-act="next"'+(flip.i>=flip.ids.length-1?" disabled":"")+'>Next</button>')+
        '<button class="btn ghost" data-act="shuffle">Shuffle</button>'+
        '<button class="btn ghost'+(flip.track?" a":"")+'" data-act="track">'+
          (flip.track ? "Tracking" : "Track progress")+'</button>'+
        '<button class="btn ghost" data-act="fs">'+
          (document.body.classList.contains("fs") ? "Exit full screen" : "Full screen")+'</button>'+
      '</div>'+
      '<p class="faint" style="font-size:12px;margin-top:10px">'+
        (flip.track ? 'Space flips · ← unknown · → known · U undo · F for full screen'
            : 'Space flips · arrow keys move · F for full screen')+'</p>'+
    '</div></div>';
};
/* "Full screen" here means the card takes over the browser window — rail,
   topbar and page chrome hidden. Deliberately NOT the Fullscreen API: that
   swallows the whole display, hides the tab bar and URL, and has to be escaped
   through the browser rather than through this page. A study tool should not
   take the machine hostage to show one card. */
function setFs(on){ document.body.classList.toggle("fs", on); }

/* End of a tracked pass. The unknown pile is the whole point — it is what you
   came back for, and offering it as the next deck is cheaper than making you
   rebuild the filter by hand. */
/* Undo the last call. Walks the history stack rather than assuming the previous
   index was the last thing marked — that assumption breaks the moment the deck
   is reordered under you, and a misclick at the summary should be recoverable
   too, which is why this also clears `done`. */
function undoMark(){
  if (!flip || !flip.hist.length) return;
  var last = flip.hist.pop();
  delete flip.marks[last];
  var at = flip.ids.indexOf(last);
  if (at >= 0) flip.i = at;
  flip.done = false;
  flip.shown = false;
}
function trackSummary(){
  var known = [], unknown = [], i;
  for (i=0;i<flip.ids.length;i++){
    (flip.marks[flip.ids[i]] === "known" ? known : unknown).push(flip.ids[i]);
  }
  var titles = "";
  for (i=0;i<Math.min(unknown.length, 12);i++){
    var card = null;
    for (var j=0;j<CARDS.length;j++) if (CARDS[j].id === unknown[i]) card = CARDS[j];
    if (card) titles += '<li>'+md(card.front)+'</li>';
  }
  if (unknown.length > 12) titles += '<li class="muted">…and '+(unknown.length-12)+' more</li>';

  return '<div class="page"><div class="title"><span class="emo">'+
      (unknown.length ? "📊" : "✅")+'</span><h1>Pass complete</h1></div>'+
    '<div class="grid g2" style="max-width:34rem;margin-top:18px">'+
      '<div class="card stat"><div class="k">Known</div><div class="v">'+known.length+'</div>'+
        '<div class="s">out of '+flip.ids.length+'</div></div>'+
      '<div class="card stat"><div class="k">Unknown</div><div class="v">'+unknown.length+'</div>'+
        '<div class="s">'+(unknown.length ? "worth another pass" : "nothing left")+'</div></div>'+
    '</div>'+
    (unknown.length ? '<h2 class="sec">What you did not know</h2>'+
      '<ul style="max-width:44rem;font-size:14px;line-height:1.6">'+titles+'</ul>' : '')+
    '<div class="btnrow" style="margin-top:18px">'+
      (unknown.length ? '<button class="btn primary" data-act="review-unknown">'+
        'Review the '+unknown.length+' unknown</button>' : '')+
      '<button class="btn" data-act="undo"'+(flip.hist.length?"":" disabled")+'>Undo last</button>'+
      '<button class="btn" data-act="restart">Run the whole deck again</button>'+
      '<button class="btn ghost" data-act="track">Back to browsing</button>'+
    '</div>'+
    '<p class="faint" style="margin-top:12px;font-size:12px;max-width:44rem">'+
      'This pass is not saved — it is a self-check, not a review. '+
      '<a href="#/cards">Flashcards</a> is where grading moves the schedule.</p>'+
  '</div>';
}
AFTER.practice = function(){
  if (typeof tutorCtx === "function") tutorCtx();
  var mb = document.querySelector(".modalbody");
  if (mb && flip && flip.mbTop) mb.scrollTop = flip.mbTop;
};
CLICKS.practice = function(e){
  var t = e.target.closest ? e.target.closest("[data-act]") : null;
  if (!t || !flip) return;
  var a = t.getAttribute("data-act"), id = t.getAttribute("data-id"), i;
  /* The modal lives inside #view, so re-rendering after a tick resets its scroll.
     Carry the offset across and AFTER.practice puts it back. */
  var mb = document.querySelector(".modalbody");
  flip.mbTop = mb ? mb.scrollTop : (flip.mbTop || 0);

  if (a === "ask"){
    var qc = currentCard();
    if (!qc) return;
    document.body.classList.add("tutor-open");
    if (typeof tutorCtx === "function") tutorCtx();
    tutorSend(
      "I am drilling this flashcard and want to understand it, not just memorise it.\n\n" +
      "Q: " + qc.front + "\nA: " + qc.back + (qc.means ? "\nNote: " + qc.means : "") +
      "\n\nExplain why that answer is right — the mechanism, not a restatement. " +
      "Then give me the one follow-up question a judge would most likely ask next."
    );
    return;
  }
  if (a === "fs"){ setFs(!document.body.classList.contains("fs")); render(); return; }
  if (a === "open-pick"){ document.body.classList.add("pick-open"); return; }
  if (a === "close-pick"){ document.body.classList.remove("pick-open"); render(); return; }

  if (a === "flip") flip.shown = !flip.shown;
  else if (a === "next" && flip.i < flip.ids.length-1){ flip.i++; flip.shown = false; }
  else if (a === "prev" && flip.i > 0){ flip.i--; flip.shown = false; }
  else if (a === "shuffle"){ flip.ids = shuffle(flip.ids, (Date.now()>>>4) % 99991); flip.i=0; flip.shown=false; }
  else if (a === "track"){
    flip.track = !flip.track; flip.marks = {}; flip.hist = []; flip.done = false;
    if (!flip.track){ flip.custom = false; flip.i = 0; }
    flip.shown = false;
  }
  else if (a === "known" || a === "unknown"){
    flip.hist.push(flip.ids[flip.i]);
    flip.marks[flip.ids[flip.i]] = a;
    if (flip.i >= flip.ids.length - 1) flip.done = true;
    else { flip.i++; flip.shown = false; }
  }
  else if (a === "undo") undoMark();
  else if (a === "review-unknown"){
    var left = [];
    for (i=0;i<flip.ids.length;i++) if (flip.marks[flip.ids[i]] === "unknown") left.push(flip.ids[i]);
    flip.ids = left; flip.custom = true; flip.marks = {}; flip.hist = [];
    flip.i = 0; flip.shown = false; flip.done = false;
  }
  else if (a === "restart"){ flip.marks = {}; flip.hist = []; flip.i = 0; flip.shown = false; flip.done = false; }
  else if (a === "st"){ flip.status = id; flip.i = 0; flip.shown = false; flip.custom = false; flip.marks = {}; flip.hist = []; flip.done = false; }
  else if (a === "all"){ flip.custom = false; flip.marks = {}; flip.hist = []; flip.done = false; flip.sel = null; flip.i = 0; flip.shown = false; }
  else if (a === "none"){ flip.custom = false; flip.marks = {}; flip.hist = []; flip.done = false; flip.sel = {}; flip.i = 0; flip.shown = false; }
  else if (a === "onlyflagged"){
    var fsel = {}, fc = flaggedConcepts();
    for (i=0;i<fc.length;i++) fsel[fc[i].id] = 1;
    flip.custom = false; flip.marks = {}; flip.hist = []; flip.done = false;
    flip.sel = fsel; flip.i = 0; flip.shown = false;
  }
  else if (a === "tog"){
    if (!flip.sel){                          /* null means "all" — materialise it first */
      flip.sel = {};
      for (i=0;i<CONCEPTS.length;i++) flip.sel[CONCEPTS[i].id] = 1;
    }
    if (flip.sel[id]) delete flip.sel[id]; else flip.sel[id] = 1;
    flip.i = 0; flip.shown = false; flip.custom = false; flip.marks = {}; flip.hist = []; flip.done = false;
  }
  else if (a === "grp"){
    if (!flip.sel){
      flip.sel = {};
      for (i=0;i<CONCEPTS.length;i++) flip.sel[CONCEPTS[i].id] = 1;
    }
    var rows = [], allOn = true;
    for (i=0;i<CONCEPTS.length;i++) if (CONCEPTS[i].group === id) rows.push(CONCEPTS[i].id);
    for (i=0;i<rows.length;i++) if (!flip.sel[rows[i]]) allOn = false;
    for (i=0;i<rows.length;i++){ if (allOn) delete flip.sel[rows[i]]; else flip.sel[rows[i]] = 1; }
    flip.i = 0; flip.shown = false;
  }
  else return;
  render();
};
/* ===========================================================================
   VIEW · BLANK PAGE (free recall)

   The strongest single technique on this site, and the one it was missing.

   Karpicke & Blunt (2011, Science) had students read a text and then either
   study it again, build a concept map of it, or simply close it and write down
   everything they could remember. A week later the free-recall group beat the
   concept-mapping group — including on a test that asked them to draw a concept
   map. Free recall also beat rereading, which is the technique Dunlosky et al.
   (2013) rate as low utility despite it being the one almost everyone uses.

   Flashcards are cued recall: the front of the card hands you the retrieval cue
   and you supply the ending. That is worth a great deal, and it is not the same
   task as being asked "so, tell me about your project" and having to generate
   the cues yourself. The second task is the one a judge sets. So: a title, a
   blank box, no prompts.

   The scoring is a checklist afterwards, and it is deliberately yours to tick.
   The payoff is not the number — it is that the checklist shows you what you
   did not think of, which is information a flashcard cannot give you, because a
   flashcard never lets you forget that the topic exists. Anything you missed is
   made due today, so the omission lands back in the deck rather than in a note
   you never reread.
   =========================================================================== */
var recall = null;   /* {scope, label, ids, phase:'write'|'score', text, got:{}} */

function recallScopes(){
  var out = [{id:"due", label:"Everything due today", hint:"the scheduler's own selection"}], i;
  for (i=0;i<GROUPS.length;i++){
    var g = GROUPS[i], n = 0;
    for (var j=0;j<CONCEPTS.length;j++) if (CONCEPTS[j].group === g.id) n++;
    if (n) out.push({id:"g:"+g.id, label:g.label, hint:n+" concepts", pill:g.pill});
  }
  return out;
}
/* The checklist is the card set for the scope. Card fronts are already written
   as one-idea-per-card, so they make a usable "did you say this?" list without
   authoring a second copy of the content that could drift out of step. */
function recallIds(scope){
  var out = [], i;
  if (scope === "due"){
    for (i=0;i<CARDS.length;i++) if (isDue(CARDS[i].id)) out.push(CARDS[i].id);
    return out;
  }
  if (scope.indexOf("g:") === 0){
    var gid = scope.slice(2);
    for (i=0;i<CARDS.length;i++){
      var c = byId(CARDS[i].conceptId);
      if (c && c.group === gid) out.push(CARDS[i].id);
    }
    return out;
  }
  for (i=0;i<CARDS.length;i++) if (CARDS[i].conceptId === scope) out.push(CARDS[i].id);
  return out;
}
function recallLabel(scope){
  if (scope === "due") return "Everything due today";
  if (scope.indexOf("g:") === 0) return groupOf(scope.slice(2)).label;
  var c = byId(scope);
  return c ? c.title : scope;
}

VIEWS.recall = function(arg){
  var i, sc;
  if (arg && (!recall || recall.scope !== arg)){
    recall = {scope:arg, label:recallLabel(arg), ids:recallIds(arg), phase:"write", text:"", got:{}};
  }

  /* --- picker --- */
  if (!recall || !arg){
    var scopes = recallScopes(), html =
      '<div class="page"><div class="title"><span class="emo">📝</span><h1>Blank page</h1></div>'+
      '<p class="lede">Close everything and write down what you know, with nothing on screen to '+
      'prompt you. Then find out what you left out.</p>'+
      '<div class="note info" style="max-width:46rem;margin:16px 0 24px">'+
      '<strong>Why this and not more flashcards.</strong><br>'+
      'A flashcard hands you the cue and asks for the ending. A judge hands you nothing and asks you '+
      'to talk. Those are different skills, and only one of them is what happens at the table. '+
      'Karpicke &amp; Blunt (2011) found free recall beat elaborative study with concept mapping a week '+
      'later — including when the final test <em>was</em> drawing a concept map.</div>'+
      '<h2 class="sec">Pick a scope</h2>'+
      '<p class="muted" style="margin:-4px 0 12px;max-width:44rem">A whole group is the '+
      '“tell me about your index” drill and runs long — that is the shape of the real question. '+
      'For something shorter, every concept page has its own <strong>Blank page</strong> button '+
      'under “Test yourself on this”.</p>'+
      '<div class="grid g2">';
    for (i=0;i<scopes.length;i++){
      sc = scopes[i];
      var n = recallIds(sc.id).length;
      html += '<a class="card hoverable" href="#/recall/'+sc.id+'" style="color:inherit'+
        (n ? '' : ';opacity:.45;pointer-events:none')+'">'+
        '<div style="font-weight:600">'+esc(sc.label)+'</div>'+
        '<div class="faint" style="font-size:12px;margin-top:3px">'+esc(sc.hint)+' · '+
          (n ? n+' points to check against' : 'nothing to check against yet')+'</div></a>';
    }
    html += '</div>';

    if (S.recalls.length){
      html += '<h2 class="sec">Previous attempts</h2><div class="tscroll"><table class="t">'+
        '<thead><tr><th>When</th><th>Scope</th><th class="n" style="width:110px">Recalled</th>'+
        '<th style="width:150px">Share</th></tr></thead><tbody>';
      for (i=S.recalls.length-1; i>=0 && i>S.recalls.length-13; i--){
        var rr = S.recalls[i], frac = rr.total ? rr.got/rr.total : 0;
        html += '<tr><td class="n">'+fmtDate(rr.t)+'</td><td>'+esc(rr.label)+'</td>'+
          '<td class="n">'+rr.got+' / '+rr.total+'</td>'+
          '<td><div class="bar"><i style="width:'+Math.round(frac*100)+'%;background:'+
            (frac>=0.7?"var(--pill-green-dot)":frac>=0.4?"var(--pill-yellow-dot)":"var(--pill-red-dot)")+
          '"></i></div></td></tr>';
      }
      html += '</tbody></table></div>'+
        '<p class="faint" style="font-size:12px;margin-top:8px">A low score on a first attempt is the '+
        'normal result and not a reason to stop — Karpicke &amp; Blunt’s students recalled 64% on '+
        'their first pass. The number to watch is the same scope a week later.</p>';
    }
    return html + '</div>';
  }

  /* --- write --- */
  if (recall.phase === "write"){
    return '<div class="page narrow">'+
      '<div class="eyebrow"><a href="#/recall">Blank page</a></div>'+
      '<div class="title" style="margin-top:6px"><h1>'+esc(recall.label)+'</h1></div>'+
      '<p class="lede">Write everything you can remember. Mechanisms, numbers, why each choice was '+
      'made, what was rejected, where it breaks. No order required and no marks for prose.</p>'+
      '<div class="note" style="margin:14px 0 16px"><strong>Do not look anything up.</strong> '+
      'Struggling to produce a thing you half-know is the part that does the work. If you are stuck, '+
      'sit with it for a moment before you give up on it — and if you still cannot get it, that is a '+
      'finding, not a failure.</div>'+
      '<textarea class="txt" id="recallbox" style="min-height:340px;font-size:15px" '+
        'placeholder="start anywhere">'+esc(recall.text)+'</textarea>'+
      '<div class="btnrow" style="margin-top:12px">'+
        '<button class="btn primary" data-act="score">I’m done — show me what I missed</button>'+
        '<a class="btn ghost" href="#/recall">Pick a different scope</a>'+
      '</div>'+
      '<p class="faint" style="font-size:12px;margin-top:10px">'+recall.ids.length+
        ' points are waiting on the other side of that button.</p>'+
    '</div>';
  }

  /* --- score --- */
  var got = 0;
  for (i=0;i<recall.ids.length;i++) if (recall.got[recall.ids[i]]) got++;
  var pct = recall.ids.length ? Math.round(got/recall.ids.length*100) : 0;

  var byConcept = {}, order = [];
  for (i=0;i<recall.ids.length;i++){
    var card = null;
    for (var k=0;k<CARDS.length;k++) if (CARDS[k].id === recall.ids[i]) card = CARDS[k];
    if (!card) continue;
    if (!byConcept[card.conceptId]){ byConcept[card.conceptId] = []; order.push(card.conceptId); }
    byConcept[card.conceptId].push(card);
  }

  var out = '<div class="page narrow">'+
    '<div class="eyebrow"><a href="#/recall">Blank page</a></div>'+
    '<div class="title" style="margin-top:6px"><h1>'+esc(recall.label)+'</h1></div>'+
    '<div class="card stat" style="max-width:22rem;margin:12px 0 6px">'+
      '<div class="k">Ticked so far</div><div class="v">'+got+
        '<span class="faint" style="font-size:16px">/'+recall.ids.length+'</span></div>'+
      '<div class="s">'+pct+'% of the points in scope</div></div>'+
    '<p class="muted" style="max-width:44rem">Tick only what you actually wrote or said — not what '+
    'you recognise now. Recognising a point you did not produce is the exact thing this exercise '+
    'exists to catch. Everything left unticked is made <strong>due today</strong> when you finish, so '+
    'it comes back through the deck rather than sitting in a list.</p>';

  if (recall.text){
    out += '<details class="myrecall"><summary>Show what I wrote</summary>'+
      '<blockquote class="gb-you" style="margin-top:10px">'+esc(recall.text)+'</blockquote></details>';
  }

  for (i=0;i<order.length;i++){
    var cc = byId(order[i]), list = byConcept[order[i]];
    out += '<h2 class="sec">'+esc(cc ? cc.title : order[i])+
      (cc ? ' <a class="faint" style="font-weight:400;font-size:12px" href="#/learn/'+cc.id+'">read →</a>' : '')+
      '</h2><div class="ckgroup">';
    for (var j=0;j<list.length;j++){
      var cd = list[j], on = !!recall.got[cd.id];
      out += '<button class="ckrow rc'+(on?" on":"")+'" data-tick="'+cd.id+'">'+
        '<span class="ckbox">'+(on?"✓":"")+'</span>'+
        '<span class="cklabel"><span class="ckq">'+md(cd.front)+'</span>'+
          '<span class="cka">'+md(cd.back)+'</span></span></button>';
    }
    out += '</div>';
  }

  out += '<div class="btnrow" style="margin-top:24px">'+
    '<button class="btn primary" data-act="finish">Record it and reschedule what I missed</button>'+
    '<button class="btn ghost" data-act="back">Back to writing</button></div>';
  return out + '</div>';
};

CLICKS.recall = function(e, arg){
  var t = e.target.closest ? e.target.closest("[data-act],[data-tick]") : null;
  if (!t || !recall) return;
  var tick = t.getAttribute("data-tick");
  if (tick){
    if (recall.got[tick]) delete recall.got[tick]; else recall.got[tick] = 1;
    render(); return;
  }
  var act = t.getAttribute("data-act"), box;
  if (act === "score"){
    box = document.getElementById("recallbox");
    recall.text = box ? box.value : "";
    recall.phase = "score";
    render(); return;
  }
  if (act === "back"){ recall.phase = "write"; render(); return; }
  if (act === "finish"){
    var got = 0, i;
    for (i=0;i<recall.ids.length;i++){
      if (recall.got[recall.ids[i]]) { got++; continue; }
      /* Missed. Make it due today — but only if it has been seen before, because
         a card you have never met is not something you failed to recall, and
         dropping it into the due pile would misreport new work as a lapse. */
      var st = S.cards[recall.ids[i]];
      if (st && st.seen) st.due = today0();
    }
    S.recalls.push({t:Date.now(), scope:recall.scope, label:recall.label,
                    got:got, total:recall.ids.length, text:recall.text});
    save();
    recall = null;
    go("recall");
    return;
  }
};

AFTER.recall = function(){
  var b = document.getElementById("recallbox");
  if (b) b.focus();
};

/* ===========================================================================
   VIEW · FLASHCARDS
   =========================================================================== */
var deck = null;   /* {queue:[cardId], i, done, scope} */

/* ---- Interleaving ----------------------------------------------------------
   A shuffle is not interleaving. Shuffling a hundred cards will still, by
   chance, hand you the three NDVI cards in a row — and once you are inside a
   run, the second and third card arrive already primed by the first. You answer
   them from the context the run set up rather than from memory, which feels
   good and is worth much less.

   Taylor & Rohrer (2010) found interleaved practice *hurt* performance during
   the session and doubled it a day later, and that the gain came specifically
   from fewer discrimination errors — picking the right idea for the problem in
   front of you rather than reciting the one you were just told about.

   This project is dense with things that are only distinguishable under
   pressure: SWCI against Gao's NDWI, polygon against corridor, `id` against
   `objectid`, Model A against Model B. Those are exactly the pairs a run
   protects you from having to tell apart.

   So the queue is spread: never two cards from the same concept back to back
   unless nothing else is left. Greedy, taking the concept with the most cards
   still owed each step, which is what keeps a big concept from bunching at the
   end. Scoped to a single concept this is a no-op by construction, and that is
   fine — a single-concept deck is the one case where blocking is the request. */
function spreadByConcept(ids){
  var conceptOf = {}, i, k;
  for (i=0;i<CARDS.length;i++) conceptOf[CARDS[i].id] = CARDS[i].conceptId;
  var buckets = {}, order = [];
  for (i=0;i<ids.length;i++){
    k = conceptOf[ids[i]] || "?";
    if (!buckets[k]){ buckets[k] = []; order.push(k); }
    buckets[k].push(ids[i]);
  }
  if (order.length < 2) return ids.slice();
  var out = [], last = null, n = ids.length;
  while (out.length < n){
    var pick = null, best = -1;
    for (i=0;i<order.length;i++){
      k = order[i];
      if (!buckets[k].length || k === last) continue;
      if (buckets[k].length > best){ best = buckets[k].length; pick = k; }
    }
    /* Only the same concept is left. Taking it beats dropping the card. */
    if (pick === null){
      for (i=0;i<order.length;i++) if (buckets[order[i]].length){ pick = order[i]; break; }
    }
    out.push(buckets[pick].shift());
    last = pick;
  }
  return out;
}

function buildDeck(scope){
  var pool = [], i, c;
  for (i=0;i<CARDS.length;i++){
    c = CARDS[i];
    if (scope === "flagged"){ if (!isFlagged(c.conceptId)) continue; }
    else if (scope && c.conceptId !== scope) continue;
    pool.push(c.id);
  }
  var due = [], fresh = [];
  for (i=0;i<pool.length;i++){
    if (isDue(pool[i])) due.push(pool[i]);
    else if (isNew(pool[i])) fresh.push(pool[i]);
  }
  /* Due work first — it is owed. New cards are capped so a first session is
     finishable rather than a wall of 180. */
  var seed = Math.floor(today0()/DAY);
  var q = spreadByConcept(shuffle(due, seed))
    .concat(spreadByConcept(shuffle(fresh, seed+7).slice(0, scope ? 999 : 20)));
  return {queue:q, i:0, scope:scope||null, tally:{g:0,a:0,r:0}, revealed:false, conf:null};
}

VIEWS.cards = function(arg){
  var scopeC = arg && arg !== "flagged" ? byId(arg) : null;
  var scopeName = arg === "flagged" ? "your flagged concepts"
                : scopeC ? scopeC.title : null;
  if (!deck || deck.scope !== (arg||null)) deck = buildDeck(arg||null);

  /* The scope bar is where you choose what to drill, so flags belong here and
     not only on the Concepts page — this is the moment you are deciding. */
  var flagged = flaggedConcepts(), fdue = flaggedDueCount();
  var picker = '<div class="btnrow" style="margin:0 0 16px">'+
    '<a class="btn sm'+(!arg?" primary":"")+'" href="#/cards">Everything'+
      (dueCount() ? ' <span class="num">('+dueCount()+' due)</span>' : '')+'</a>'+
    (flagged.length
      ? '<a class="btn sm'+(arg==="flagged"?" primary":"")+'" href="#/cards/flagged">'+
        '\u2691 Flagged <span class="num">('+flagged.length+' concept'+(flagged.length>1?"s":"")+
        (fdue ? ', '+fdue+' due' : '')+')</span></a>'
      : '<span class="faint" style="font-size:12px">Flag a concept to build a targeted deck</span>')+
    (scopeC ? '<span class="pill p-blue"><span class="dot"></span>'+esc(scopeC.title)+'</span>' : '')+
  '</div>';

  if (!deck.queue.length){
    var empty = '<div class="page"><div class="title"><span class="emo">🃏</span><h1>Flashcards</h1></div>'+
      picker+
      '<div class="card" style="max-width:46rem">'+
      '<p style="margin:0 0 10px"><strong>Nothing due'+(scopeName? ' for '+esc(scopeName):'')+'.</strong></p>'+
      '<p class="muted" style="margin:0 0 12px">Spaced repetition means the cards come back on their own '+
      'schedule. Coming back tomorrow is the point.</p>'+
      '<div class="btnrow"><button class="btn" data-act="cram">Study everything anyway</button>'+
      '<a class="btn ghost" href="#/overview">Back to overview</a></div></div>';
    if (arg === "flagged" && flagged.length){
      empty += '<h2 class="sec">What you have flagged</h2><div class="grid g2">';
      for (var fj=0; fj<flagged.length; fj++) empty += conceptTile(flagged[fj]);
      empty += '</div>';
    }
    return empty + '</div>';
  }

  if (deck.i >= deck.queue.length){
    var t = deck.tally;
    return '<div class="page"><div class="title"><span class="emo">✅</span><h1>Deck cleared</h1></div>'+
      '<div class="card stat" style="max-width:26rem;margin-top:18px">'+
      '<div class="k">Cards reviewed</div><div class="v">'+deck.queue.length+'</div>'+
      '<div class="s">'+t.g+' easy · '+t.a+' good/hard · '+t.r+' again</div></div>'+
      '<div class="btnrow" style="margin-top:16px">'+
      '<button class="btn" data-act="again-deck">Another round</button>'+
      '<a class="btn ghost" href="#/mock/weakest">Drill your weak spots out loud</a></div>'+
      '<h2 class="sec">Drill something else</h2>'+ picker +
      resumeCta(deck.scope, deck.scope ? "Concept covered — next" : "Next", true)+'</div>';
  }

  var id = deck.queue[deck.i], card = null, i;
  for (i=0;i<CARDS.length;i++) if (CARDS[i].id===id) card = CARDS[i];
  if (!card){ deck.i++; return VIEWS.cards(arg); }
  var concept = byId(card.conceptId), st = S.cards[id];

  var line = '<div class="progressline">';
  for (i=0;i<deck.queue.length;i++){
    line += '<i class="'+(i<deck.i?"done":i===deck.i?"now":"")+'"></i>';
  }
  line += '</div>';

  var head = '<div class="btnrow" style="margin-bottom:14px">'+
    '<span class="pill '+(card.type==="number"?"p-orange":card.type==="choice"?"p-purple":"p-blue")+'">'+
      '<span class="dot"></span>'+esc(card.type)+'</span>'+
    (concept ? '<a class="pill" href="#/learn/'+concept.id+'"><span class="dot"></span>'+esc(concept.title)+'</a>' : '')+
    (concept ? flagBtn(concept.id, isFlagged(concept.id) ? "Flagged" : "Flag") : '')+
    (st && st.seen ? '<span class="faint" style="font-size:12px">seen '+st.seen+'× · ease '+st.ef.toFixed(2)+'</span>' : '<span class="faint" style="font-size:12px">new</span>')+
  '</div>';

  /* A number card is checked against the world, so it needs no self-report; the
     typed value is already a commitment. Everything else is graded by you after
     you have seen the answer, and that is where confidence has to be captured
     first — see the note above CONF. */
  var answerUI, ci;
  if (card.type === "number"){
    answerUI = '<input class="txt num" id="numin" placeholder="type the value" autocomplete="off" '+
               'style="max-width:16rem;font-size:17px">'+
               '<div class="btnrow" style="margin-top:10px">'+
               '<button class="btn primary" data-act="checknum">Check</button>'+
               '<button class="btn ghost" data-act="reveal">I don’t know</button></div>'+
               '<div id="numfb" style="margin-top:10px"></div>';
  } else {
    answerUI = '<div class="eyebrow">Say the answer out loud first, then commit</div>'+
               '<div class="btnrow" style="margin-top:8px">';
    for (ci=0; ci<CONF.length; ci++){
      answerUI += '<button class="btn '+CONF[ci].cls+' conf" data-conf="'+CONF[ci].id+'">'+
                  esc(CONF[ci].label)+'<span class="chint">'+esc(CONF[ci].hint)+'</span></button>';
    }
    answerUI += '</div>';
  }

  return '<div class="page">'+
    (deck.i === 0 ? picker : '')+
    '<div class="stage">'+
    line + head +
    '<p class="face">'+md(card.front)+'</p>'+
    (card.hint ? '<p class="muted" style="font-size:13px;margin:0 0 12px">'+md(card.hint)+'</p>' : '')+
    '<div id="answer-slot" style="margin-top:14px">'+answerUI+'</div>'+
    '<div id="reveal-slot"></div>'+
  '</div></div>';
};

function revealCard(conf){
  var id = deck.queue[deck.i], card=null, i;
  for (i=0;i<CARDS.length;i++) if (CARDS[i].id===id) card = CARDS[i];
  var slot = document.getElementById("reveal-slot");
  if (!slot || slot.getAttribute("data-open")) return;
  slot.setAttribute("data-open","1");
  deck.conf = conf || null;              /* read back when the grade lands */
  var concept = byId(card.conceptId);
  var st = S.cards[id];
  var claim = conf
    ? '<div class="claim"><span class="pill '+(conf==="sure"?"p-green":conf==="no"?"p-red":"p-yellow")+
      '"><span class="dot"></span>you said: '+esc(confLabel(conf))+'</span>'+
      '<span class="faint">grade it against what you actually said out loud, not against how '+
      'familiar the answer looks now</span></div>'
    : '';
  slot.innerHTML =
    '<div class="reveal pop">'+
      claim+
      '<div class="eyebrow">Answer</div>'+
      '<div class="prose" style="font-size:15px;margin-top:6px">'+para(card.back)+'</div>'+
      (card.means ? '<div class="note info" style="margin-top:10px"><strong>What it means.</strong><br>'+md(card.means)+'</div>' : '')+
      (concept ? '<p style="margin:12px 0 0;font-size:13px"><a href="#/learn/'+concept.id+'">Read the full concept: '+esc(concept.title)+' →</a></p>' : '')+
      '<div class="eyebrow" style="margin-top:20px">How did that go?</div>'+
      '<div class="btnrow" style="margin-top:8px">'+
        '<button class="btn r" data-grade="0">Again</button>'+
        '<button class="btn a" data-grade="1">Hard</button>'+
        '<button class="btn" data-grade="2">Good</button>'+
        '<button class="btn g" data-grade="3">Easy</button>'+
      '</div>'+
      '<div class="faint" style="font-size:12px;margin-top:8px">'+
        (atCriterion(id)
          ? 'Criterion met — '+st.streak+' correct recalls on separate days. From here the '+
            'schedule is just keeping it alive.'
          : (CRITERION - ((st && st.streak) || 0))+' more correct recall'+
            ((CRITERION - ((st && st.streak) || 0)) === 1 ? '' : 's')+' on separate days to reach '+
            'criterion. Repeats inside one session do not count.')+
      '</div>'+
    '</div>';
}

CLICKS.cards = function(e, arg){
    var t = e.target.closest ? e.target.closest("[data-act],[data-grade],[data-conf]") : null;
    if (!t) return;
    var conf = t.getAttribute("data-conf");
    if (conf) { revealCard(conf); return; }
    var act = t.getAttribute("data-act");
    if (act === "reveal") { revealCard("no"); return; }   /* "I don't know" is a claim too */
    if (act === "cram"){
      var pool=[]; for (var i=0;i<CARDS.length;i++){
        if (!arg || CARDS[i].conceptId===arg) pool.push(CARDS[i].id);
      }
      deck = {queue:spreadByConcept(shuffle(pool, 3)), i:0, scope:arg||null,
              tally:{g:0,a:0,r:0}, conf:null};
      render(); return;
    }
    if (act === "again-deck"){ deck = null; render(); return; }
    if (act === "checknum"){
      var input = document.getElementById("numin");
      var card=null, id=deck.queue[deck.i];
      for (var k=0;k<CARDS.length;k++) if (CARDS[k].id===id) card=CARDS[k];
      var ok = numMatches(input.value, card.back);
      document.getElementById("numfb").innerHTML = ok
        ? '<span class="pill p-green"><span class="dot"></span>correct to the printed precision</span>'
        : '<span class="pill p-red"><span class="dot"></span>not that</span>';
      /* An objective check beats a self-report, so a number card books its own
         outcome in its own bucket. Filing it under "I know this" would put a
         machine-checked result in a row that is meant to score *predictions*. */
      recordConf(id, "typed", ok);
      revealCard();
      return;
    }
    var g = t.getAttribute("data-grade");
    if (g !== null){
      recordConf(deck.queue[deck.i], deck.conf, parseInt(g,10) >= 2);
      grade(deck.queue[deck.i], parseInt(g,10));
      if (g === "0") { deck.tally.r++; deck.queue.push(deck.queue[deck.i]); }
      else if (g === "3") deck.tally.g++;
      else deck.tally.a++;
      deck.i++;
      render();
    }
};

AFTER.cards = function(){
  var numin = document.getElementById("numin");
  if (numin){
    numin.focus();
    numin.addEventListener("keydown", function(e){
      if (e.key === "Enter"){
        var b = document.querySelector('[data-act="checknum"]');
        if (b) b.click();
      }
    });
  }
};

/* ===========================================================================
   VIEW · MOCK INTERVIEW
   Implements §3 of docs/interview_coach_notebooklm_note.md: three tiers,
   Green/Amber/Red with its exact definitions, chained follow-ups, and Reds
   re-served from earlier sessions without being announced.
   =========================================================================== */

var sess = null;  /* {queue:[qid], i, scores:{}, preset, stage, followIdx} */

function pickQuestions(key){
  var p = PRESETS[key], out = [], i, q;
  var seed = Math.floor(Date.now()/60000);

  if (key === "flagged"){
    var fc = flaggedConcepts(), seen = {};
    for (i=0;i<fc.length;i++){
      var qs = questionsFor(fc[i].id);
      for (var z=0;z<qs.length;z++) if (!seen[qs[z].id]){ seen[qs[z].id] = 1; out.push(qs[z]); }
    }
    return {list: shuffle(out, seed), label:"Flagged concepts", emo:"\u2691",
            blurb:"Every question tagged to a concept you flagged \u2014 "+fc.length+
                  " concept"+(fc.length===1?"":"s")+", "+out.length+" question"+
                  (out.length===1?"":"s")+"."};
  }
  if (key && key.indexOf("concept:") === 0){
    var cid = key.split(":")[1];
    out = questionsFor(cid);
    return {list: shuffle(out, seed), label: "Concept drill", emo:"📖",
            blurb:"Every question tagged to " + (byId(cid) ? byId(cid).title : cid) + "."};
  }
  if (!p) p = PRESETS[MOCK.order[0]];    /* an unknown preset falls back to the first tile */
  if (!p) return {list:[], label:"", emo:"", blurb:""};

  var reds = redQuestions();          /* re-served unannounced, always first-class */
  var pool = [];
  for (i=0;i<QUESTIONS.length;i++){
    q = QUESTIONS[i];
    if (p.track && q.track !== p.track) continue;
    if (!p.track && q.track && q.track !== "core") continue;
    if (p.tier && q.tier !== p.tier) continue;
    pool.push(q);
  }
  if (p.weakest){
    var weak = weakest(6), weakIds = {};
    for (i=0;i<weak.length;i++) weakIds[weak[i].c.id] = 1;
    var pri = [], rest = [];
    for (i=0;i<QUESTIONS.length;i++){
      q = QUESTIONS[i];
      var hit = false;
      if (q.conceptIds) for (var k=0;k<q.conceptIds.length;k++) if (weakIds[q.conceptIds[k]]) hit = true;
      (hit ? pri : rest).push(q);
    }
    pool = pri.concat(rest);
  }
  if (p.tier === 3){
    /* damage-ranked: surfaces 1-5 first */
    pool.sort(function(a,b){ return (a.surface||99) - (b.surface||99); });
  } else {
    pool = shuffle(pool, seed);
  }

  var chosen = [], used = {};
  for (i=0;i<reds.length && chosen.length < p.n;i++){
    if (!used[reds[i].id]){ chosen.push(reds[i]); used[reds[i].id]=1; }
  }
  for (i=0;i<pool.length && chosen.length < p.n;i++){
    if (!used[pool[i].id]){ chosen.push(pool[i]); used[pool[i].id]=1; }
  }
  return {list: shuffle(chosen, seed+3), label:p.label, emo:p.emo, blurb:p.blurb};
}

VIEWS.mock = function(arg){
  if (!arg){
    var html = '<div class="page">'+
      '<div class="title"><span class="emo">'+esc(MOCK.emoji)+'</span><h1>'+esc(MOCK.title)+'</h1></div>'+
      '<p class="lede">'+MOCK.lede+'</p>'+
      '<div class="grid g2" style="margin-top:22px">';
    var keys = MOCK.order;
    for (var i=0;i<keys.length;i++){
      var p = PRESETS[keys[i]];
      html += '<a class="card hoverable" href="#/mock/'+keys[i]+'" style="color:inherit">'+
        '<div style="display:flex;gap:10px;align-items:flex-start">'+
        '<span style="font-size:24px;line-height:1">'+p.emo+'</span><div>'+
        '<div style="font-weight:600;font-size:15px">'+esc(p.label)+
          ' <span class="faint" style="font-weight:400">· '+p.n+' questions</span></div>'+
        '<div class="muted" style="margin-top:4px;font-size:13px;line-height:1.55">'+esc(p.blurb)+'</div>'+
        '</div></div></a>';
    }
    html += '</div>';
    var fcn = flaggedConcepts();
    if (fcn.length){
      html += '<h2 class="sec">\u2691 Flagged</h2><div class="nextlist">'+
        '<a class="card hoverable flagged" href="#/mock/flagged" style="color:inherit;display:block">'+
        '<div style="display:flex;gap:12px;align-items:flex-start">'+
        '<span style="font-size:24px;line-height:1">\u2691</span><div>'+
        '<div style="font-weight:600;font-size:15px">Flagged concepts'+
          ' <span class="faint" style="font-weight:400">\u00b7 '+fcn.length+' concept'+
          (fcn.length===1?"":"s")+'</span></div>'+
        '<div class="muted" style="margin-top:4px;font-size:13px;line-height:1.55">'+
          'Every question tagged to something you marked to come back to.</div>'+
        '</div></div></a></div>';
    }
    html += '<div class="note" style="margin-top:24px">'+MOCK.note+'</div></div>';
    return html;
  }

  if (!sess || sess.preset !== arg){
    var picked = pickQuestions(arg);
    sess = {preset:arg, queue:picked.list, meta:picked, i:0, scores:{}, followIdx:-1, revealed:false};
  }

  if (!sess.queue.length){
    return '<div class="page"><p class="empty">No questions match that selection yet.</p>'+
           '<div class="btnrow"><a class="btn" href="#/mock">Back</a></div></div>';
  }

  if (sess.i >= sess.queue.length) return sessionSummary();

  var q = sess.queue[sess.i], prev = S.questions[q.id];
  var line = '<div class="progressline">';
  for (var j=0;j<sess.queue.length;j++){
    var sc = sess.scores[sess.queue[j].id];
    var cls = sc ? (sc==="green"?"g":sc==="amber"?"a":"r") : (j===sess.i?"now":"");
    line += '<i class="'+cls+'"></i>';
  }
  line += '</div>';

  var surfaceTag = "";
  if (q.surface){
    var sf = null;
    for (var k=0;k<SURFACES.length;k++) if (SURFACES[k].rank === q.surface) sf = SURFACES[k];
    if (sf) surfaceTag = '<a class="pill p-red" href="#/redteam"><span class="dot"></span>Attack surface '+
                         q.surface+'</a>';
  }

  return '<div class="page"><div class="stage">'+
    line+
    '<div class="btnrow" style="margin-bottom:16px">'+
      '<span class="pill p-'+(q.tier===3?"red":q.tier===2?"orange":"blue")+'"><span class="dot"></span>Tier '+(q.tier||1)+'</span>'+
      surfaceTag+
      (prev && prev.last ? '<span class="faint" style="font-size:12px">last time: '+prev.last+'</span>' : '')+
      '<span class="faint" style="font-size:12px;margin-left:auto">'+(sess.i+1)+' of '+sess.queue.length+'</span>'+
    '</div>'+
    '<p class="face">'+md(q.prompt)+'</p>'+
    '<p class="muted" style="font-size:13px;margin:0 0 14px">Answer out loud first. Type only if it helps '+
      'you notice you are waffling.</p>'+
    '<textarea class="txt" id="ansbox" placeholder="your answer (optional, never saved)"></textarea>'+
    '<div class="btnrow" style="margin-top:10px">'+
      '<button class="btn primary" data-act="reveal-q">Reveal the model answer</button>'+
      '<button class="btn ghost" data-act="skip-q">Skip</button>'+
    '</div>'+
    '<div id="qreveal"></div>'+
  '</div></div>';
};

function revealQuestion(){
  var q = sess.queue[sess.i];
  var slot = document.getElementById("qreveal");
  if (!slot || slot.getAttribute("data-open")) return;
  slot.setAttribute("data-open","1");

  var rub = "";
  if (q.rubric && q.rubric.length){
    rub = '<div class="eyebrow" style="margin-top:18px">Did your answer contain these?</div><ul class="rubric">';
    for (var i=0;i<q.rubric.length;i++){
      rub += '<li><input type="checkbox"><span>'+md(q.rubric[i])+'</span></li>';
    }
    rub += '</ul>';
  }
  var never = "";
  if (q.neverSay && q.neverSay.length){
    never = '<div class="note danger" style="margin-top:14px"><strong>If you said any of this, score yourself Red.</strong><ul style="margin:6px 0 0;padding-left:18px">';
    for (var j=0;j<q.neverSay.length;j++) never += '<li>'+md(q.neverSay[j])+'</li>';
    never += '</ul></div>';
  }
  var follow = "";
  if (q.followUps && q.followUps.length){
    follow = '<div class="eyebrow" style="margin-top:20px">Follow-ups — a judge will not stop at one</div>'+
             '<div id="follows"></div>'+
             '<div class="btnrow" style="margin-top:8px">'+
             '<button class="btn sm" data-act="nextfollow">Ask the next follow-up</button>'+
             '<span class="faint" style="font-size:12px" id="followcount">0 of '+q.followUps.length+'</span></div>';
  }

  slot.innerHTML = '<div class="reveal pop">'+
    '<div class="eyebrow">A model answer</div>'+
    '<div class="prose" style="font-size:15px;margin-top:6px">'+para(q.modelAnswer)+'</div>'+
    rub + never + follow +
    '<div class="eyebrow" style="margin-top:24px">Score yourself</div>'+
    '<p class="muted" style="font-size:13px;margin:4px 0 8px">Green only if you also survived the '+
      'follow-ups. Correct-but-shallow is Amber. Bluffing is Red.</p>'+
    '<div class="btnrow">'+
      '<button class="btn g" data-score="green">Green</button>'+
      '<button class="btn a" data-score="amber">Amber</button>'+
      '<button class="btn r" data-score="red">Red</button>'+
    '</div></div>';
  sess.followIdx = -1;
  paintIcons(slot);
}

function nextFollow(){
  var q = sess.queue[sess.i];
  if (!q.followUps) return;
  sess.followIdx++;
  if (sess.followIdx >= q.followUps.length){
    var b = document.querySelector('[data-act="nextfollow"]');
    if (b) b.disabled = true;
    return;
  }
  var f = q.followUps[sess.followIdx];
  var wrap = document.getElementById("follows");
  var node = el('<div class="card pop" style="margin-top:8px">'+
    '<p style="margin:0 0 6px;font-weight:500">'+md(typeof f === "string" ? f : f.q)+'</p>'+
    (typeof f === "object" && f.a ? '<p class="muted" style="margin:0;font-size:13px;line-height:1.6">'+md(f.a)+'</p>' : '')+
    '</div>');
  wrap.appendChild(node);
  var c = document.getElementById("followcount");
  if (c) c.textContent = (sess.followIdx+1)+" of "+q.followUps.length;
  if (sess.followIdx+1 >= q.followUps.length){
    var btn = document.querySelector('[data-act="nextfollow"]');
    if (btn) btn.disabled = true;
  }
}

function sessionSummary(){
  var g=0,a=0,r=0, redList=[];
  for (var i=0;i<sess.queue.length;i++){
    var s = sess.scores[sess.queue[i].id];
    if (s==="green") g++; else if (s==="amber") a++; else if (s==="red"){ r++; redList.push(sess.queue[i]); }
  }
  if (!sess.logged){
    S.sessions.push({t:Date.now(), preset:sess.preset, n:sess.queue.length, green:g, amber:a, red:r});
    sess.logged = true;
    save();
  }
  var w = weakest(3), wh = "";
  for (var j=0;j<w.length;j++){
    wh += '<a class="pill '+masteryClass(w[j].m)+'" href="#/learn/'+w[j].c.id+'"><span class="dot"></span>'+
          esc(w[j].c.title)+'</a>';
  }
  var rl = "";
  for (var k=0;k<redList.length;k++) rl += '<li>'+md(redList[k].prompt)+'</li>';

  return '<div class="page"><div class="title"><span class="emo">📋</span><h1>Session report</h1></div>'+
    '<div class="grid g3" style="margin-top:18px;max-width:44rem">'+
      '<div class="card stat"><div class="k">Green</div><div class="v">'+g+'</div><div class="s">survived follow-ups</div></div>'+
      '<div class="card stat"><div class="k">Amber</div><div class="v">'+a+'</div><div class="s">shallow or hinted</div></div>'+
      '<div class="card stat"><div class="k">Red</div><div class="v">'+r+'</div><div class="s">wrong or bluffed</div></div>'+
    '</div>'+
    (redList.length ? '<h2 class="sec">Your Red list</h2>'+
      '<p class="muted" style="margin:-4px 0 10px">These come back in a later session without being '+
      'announced. That is deliberate.</p>'+
      '<ul style="line-height:1.7;max-width:46rem">'+rl+'</ul>' : '')+
    (wh ? '<h2 class="sec">Three weakest areas — drill these first next time</h2><div class="btnrow">'+wh+'</div>' : '')+
    '<div class="btnrow" style="margin-top:24px">'+
      '<button class="btn primary" data-act="mock-again">Run it again</button>'+
      '<a class="btn" href="#/mock">Pick another mode</a>'+
      '<a class="btn ghost" href="#/cards">Review flashcards</a>'+
    '</div></div>';
}

CLICKS.mock = function(e){
    var t = e.target.closest ? e.target.closest("[data-act],[data-score]") : null;
    if (!t) return;
    var act = t.getAttribute("data-act");
    if (act === "reveal-q"){ revealQuestion(); return; }
    if (act === "nextfollow"){ nextFollow(); return; }
    if (act === "skip-q"){ sess.i++; render(); return; }
    if (act === "mock-again"){ sess = null; render(); return; }
    var sc = t.getAttribute("data-score");
    if (sc){
      var q = sess.queue[sess.i];
      if (!S.questions[q.id]) S.questions[q.id] = {history:[]};
      S.questions[q.id].last = sc;
      S.questions[q.id].history.push({t:Date.now(), score:sc});
      sess.scores[q.id] = sc;
      save();
      sess.i++;
      render();
    }
};

/* ===========================================================================
   VIEW · RED TEAM
   =========================================================================== */
VIEWS.redteam = function(){
  var html = '<div class="page">'+
    '<div class="title"><span class="emo">🛡️</span><h1>Red team</h1></div>'+
    '<p class="lede">The nine places where this project is genuinely vulnerable, ranked by how much '+
      'damage each does if you fumble it. Every one of them is real. Several are unresolved, and saying '+
      'so is the correct answer rather than a concession.</p>'+
    '<div class="note info" style="margin:20px 0 8px">'+
      '<strong>Status vocabulary,</strong> carried over from the known-issues register: '+
      '<strong>OPEN</strong> = unresolved · <strong>BOUNDED</strong> = real, but measured and scoped in '+
      'the paper · <strong>CLOSED</strong> = tested and no longer a defect.</div>';

  for (var i=0;i<SURFACES.length;i++){
    var s = SURFACES[i];
    var stCls = s.status === "OPEN" ? "p-red" : s.status === "BOUNDED" ? "p-yellow" : "p-green";
    html += '<div class="card" style="margin-top:14px">'+
      '<div class="btnrow" style="margin-bottom:8px">'+
        '<span class="pill p-grey"><span class="dot"></span>#'+s.rank+'</span>'+
        '<span class="pill '+stCls+'"><span class="dot"></span>'+esc(s.status)+'</span>'+
        (s.damage ? '<span class="faint" style="font-size:12px">'+esc(s.damage)+'</span>' : '')+
      '</div>'+
      '<div style="font-weight:600;font-size:16px;letter-spacing:-.01em">'+md(s.title)+'</div>'+
      '<div class="prose" style="font-size:14px;margin-top:10px;max-width:none">'+
        '<h4>How a judge will put it</h4>'+
        '<p style="font-style:italic">“'+md(s.judgeAsks)+'”</p>'+
        '<h4>What is actually true</h4>'+ para(s.truth)+
        '<h4>The honest answer</h4>'+ para(s.answer)+
      '</div>'+
      (s.overclaim ? '<div class="note danger" style="margin-top:6px"><strong>Do not claim more than this.</strong><br>'+md(s.overclaim)+'</div>' : '')+
      (s.ruledOut ? '<div class="note" style="margin-top:10px"><strong>Ruled out by test, not by argument.</strong><ul style="margin:6px 0 0;padding-left:18px">'+
        s.ruledOut.map(function(x){return '<li>'+md(x)+'</li>';}).join("")+'</ul></div>' : '')+
      '<div class="btnrow" style="margin-top:12px">'+
        '<a class="btn sm" href="#/mock/referee">Drill this adversarially</a>'+
        (s.concepts ? s.concepts.map(function(cid){
          var c = byId(cid);
          return c ? '<a class="pill" href="#/learn/'+cid+'"><span class="dot"></span>'+esc(c.title)+'</a>' : "";
        }).join("") : "")+
      '</div>'+
    '</div>';
  }

  html += '<h2 class="sec">Things you must never say</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:42rem">Six statements that are simply false. '+
    'Each is scored down explicitly by the CWSF rubric, whose lowest band is defined by significance '+
    'claims that “may be exaggerated.”</p>'+
    '<div class="grid g2">';
  for (var k=0;k<NEVER_SAY.length;k++){
    html += '<div class="card"><div class="btnrow" style="margin-bottom:6px">'+
      '<span class="pill p-red"><span class="dot"></span>never</span></div>'+
      '<div style="font-weight:500">“'+md(NEVER_SAY[k].claim)+'”</div>'+
      '<div class="muted" style="margin-top:8px;font-size:13px;line-height:1.6">'+md(NEVER_SAY[k].instead)+'</div>'+
      '</div>';
  }
  html += '</div></div>';
  return html;
};

/* ===========================================================================
   VIEW · NUMBERS
   =========================================================================== */
VIEWS.numbers = function(){
  var byGroup = {}, order = [];
  for (var i=0;i<NUMBERS.length;i++){
    var n = NUMBERS[i];
    if (!byGroup[n.group]){ byGroup[n.group] = []; order.push(n.group); }
    byGroup[n.group].push(n);
  }
  var html = '<div class="page">'+
    '<div class="title"><span class="emo">🔢</span><h1>Numbers</h1></div>'+
    '<p class="lede">Every figure that has to be automatic — each with what it <em>means</em>, because a '+
      'number you can recite but not motivate invites the follow-up you cannot answer. This page is the '+
      'reference; the drilling happens in the flashcards and the Tier-2 interview.</p>'+
    '<div class="btnrow" style="margin:18px 0 6px">'+
      '<a class="btn primary" href="#/mock/numbers">Drill these out loud</a>'+
      '<a class="btn" href="#/cards">Flashcard the values</a></div>';

  for (var g=0; g<order.length; g++){
    var rows = byGroup[order[g]];
    html += '<h2 class="sec">'+esc(order[g])+'</h2><div class="tscroll"><table class="t">'+
      '<thead><tr><th style="width:34%">Quantity</th><th style="width:16%">Value</th><th>What it means</th></tr></thead><tbody>';
    for (var j=0;j<rows.length;j++){
      html += '<tr><td>'+md(rows[j].label)+'</td>'+
              '<td class="n"><strong>'+esc(rows[j].value)+'</strong></td>'+
              '<td class="muted">'+md(rows[j].means)+'</td></tr>';
    }
    html += '</tbody></table></div>';
  }
  return html + '</div>';
};

/* ===========================================================================
   VIEW · PROGRESS
   =========================================================================== */
VIEWS.progress = function(){
  var i, html = '<div class="page">'+
    '<div class="title"><span class="emo">📈</span><h1>Progress</h1></div>'+
    '<p class="lede">Where you actually stand, by concept group and by attack surface. Nothing here is '+
      'aspirational — it is computed from the cards you have graded and the answers you have scored.</p>';

  /* group readiness */
  html += '<h2 class="sec">By concept group</h2><div class="grid g2">';
  for (i=0;i<GROUPS.length;i++){
    var g = GROUPS[i], vals=[], n=0, untouched=0;
    for (var j=0;j<CONCEPTS.length;j++){
      if (CONCEPTS[j].group !== g.id) continue;
      n++;
      var m = conceptMastery(CONCEPTS[j].id);
      if (m === null) untouched++; else vals.push(m);
    }
    if (!n) continue;
    var avg = vals.length ? vals.reduce(function(a,b){return a+b;},0)/vals.length : 0;
    var pct = Math.round(avg*100);
    html += '<div class="card"><div style="display:flex;gap:8px;align-items:baseline">'+
      '<div style="font-weight:600;flex:1">'+esc(g.label)+'</div>'+
      '<div class="num" style="font-weight:700;font-size:18px">'+(vals.length?pct+"%":"—")+'</div></div>'+
      '<div class="bar" style="margin:8px 0 6px"><i style="width:'+pct+'%;background:'+
        (avg>=0.75?"var(--pill-green-dot)":avg>=0.4?"var(--pill-yellow-dot)":"var(--pill-red-dot)")+'"></i></div>'+
      '<div class="faint" style="font-size:12px">'+(n-untouched)+' of '+n+' concepts attempted</div></div>';
  }
  html += '</div>';

  /* ---- calibration -------------------------------------------------------
     The most useful number on this page, and the one no other view can compute.
     Everything else here scores what you know; this scores whether you know
     what you know. A judge does not punish a gap you flag — they punish a gap
     you asserted your way through. */
  var cal = calibration(), calN = 0, calI;
  for (calI=0; calI<CONF_ROWS.length; calI++) calN += cal[CONF_ROWS[calI].id][0] + cal[CONF_ROWS[calI].id][1];
  html += '<h2 class="sec">Calibration</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:44rem">Before each card is revealed you '+
    'say how sure you are. This is the scoreboard for those claims. Recognising a correct answer '+
    'feels like having known it, which is why the claim is taken <em>before</em> the answer is on '+
    'screen — a prediction can be wrong, a memory of having just read something cannot.</p>';
  if (!calN){
    html += '<p class="empty">No claims recorded yet. Work a deck and this fills in.</p>';
  } else {
    html += '<div class="tscroll"><table class="t"><thead><tr><th>You said</th>'+
      '<th style="width:76px" class="n">Times</th><th style="width:86px" class="n">Held up</th>'+
      '<th style="width:150px">Rate</th><th>Read it as</th></tr></thead><tbody>';
    for (calI=0; calI<CONF_ROWS.length; calI++){
      var cr = CONF_ROWS[calI], pair = cal[cr.id], tot = pair[0] + pair[1];
      if (!tot) continue;
      var rate = pair[0] / tot, rp = Math.round(rate*100);
      /* What counts as a bad rate depends on what was claimed. Missing a third
         of the ones you called certain is a real problem; missing a third of the
         ones you called "no idea" is just an honest no-idea. */
      var bad = (cr.id === "sure"  && rate < 0.85) ||
                (cr.id === "think" && rate < 0.50) ||
                (cr.id === "typed" && rate < 0.70);
      var gloss = cr.id === "sure"
          ? (rate >= 0.85 ? 'Honest certainty. When you say you know it, you do.'
                          : 'Overconfident — you asserted '+pair[1]+' you could not deliver. This is '+
                            'the failure mode that loses a judging round.')
        : cr.id === "think"
          ? (rate >= 0.5 ? 'A hedge worth more than half the time. Fine.'
                         : 'Your hedges are mostly not landing. Treat “I think so” as “not yet”.')
        : cr.id === "no"
          ? (rate > 0.3 ? 'You are underrating yourself on '+pair[0]+' of these — try saying it out '+
                          'loud before you press it.'
                        : 'Calling it correctly. A known gap is cheap to fix.')
          : 'Machine-checked, so this row owes nothing to self-report.';
      html += '<tr><td><strong>'+esc(cr.label)+'</strong><div class="faint" style="font-size:11px">'+
          esc(cr.hint)+'</div></td>'+
        '<td class="n">'+tot+'</td><td class="n">'+pair[0]+'</td>'+
        '<td><div class="bar"><i style="width:'+rp+'%;background:'+
          (bad ? "var(--pill-red-dot)" : "var(--pill-green-dot)")+'"></i></div>'+
          '<div class="faint" style="font-size:11px;margin-top:3px">'+rp+'%</div></td>'+
        '<td style="font-size:12px">'+esc(gloss)+'</td></tr>';
    }
    html += '</tbody></table></div>';
  }

  /* per-surface readiness */
  html += '<h2 class="sec">By attack surface</h2><div class="tscroll"><table class="t">'+
    '<thead><tr><th style="width:44px">#</th><th>Surface</th><th style="width:90px">Asked</th>'+
    '<th style="width:120px">Last result</th><th style="width:90px">Status</th></tr></thead><tbody>';
  for (i=0;i<SURFACES.length;i++){
    var s = SURFACES[i], asked=0, last=null;
    for (var k=0;k<QUESTIONS.length;k++){
      if (QUESTIONS[k].surface !== s.rank) continue;
      var st = S.questions[QUESTIONS[k].id];
      if (st && st.history && st.history.length){ asked += st.history.length; last = st.last; }
    }
    var stCls = s.status === "OPEN" ? "p-red" : s.status === "BOUNDED" ? "p-yellow" : "p-green";
    html += '<tr><td class="n">'+s.rank+'</td><td>'+md(s.short || s.title)+'</td>'+
      '<td class="n">'+(asked||"—")+'</td>'+
      '<td>'+(last ? '<span class="pill p-'+(last==="green"?"green":last==="amber"?"yellow":"red")+
        '"><span class="dot"></span>'+last+'</span>' : '<span class="faint">never</span>')+'</td>'+
      '<td><span class="pill '+stCls+'"><span class="dot"></span>'+esc(s.status)+'</span></td></tr>';
  }
  html += '</tbody></table></div>';

  /* session log */
  html += '<h2 class="sec">Session history</h2>';
  if (!S.sessions.length){
    html += '<p class="empty">No sessions yet.</p>';
  } else {
    html += '<div class="tscroll"><table class="t"><thead><tr><th>When</th><th>Mode</th>'+
      '<th class="n">Q</th><th>Green</th><th>Amber</th><th>Red</th></tr></thead><tbody>';
    for (i=S.sessions.length-1;i>=0;i--){
      var ss = S.sessions[i];
      html += '<tr><td class="n">'+fmtDate(ss.t)+'</td><td>'+esc(ss.preset)+'</td>'+
        '<td class="n">'+ss.n+'</td><td class="n">'+ss.green+'</td><td class="n">'+ss.amber+'</td>'+
        '<td class="n">'+ss.red+'</td></tr>';
    }
    html += '</tbody></table></div>';
  }

  /* export / import */
  html += '<h2 class="sec">Back up your progress</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:42rem">There is no server. Everything lives in '+
      'this browser’s localStorage, which a cache clear will wipe. Copy the blob somewhere safe.</p>'+
    '<div class="btnrow" style="margin-bottom:10px">'+
      '<button class="btn primary" data-act="export">Copy my progress</button>'+
      '<button class="btn" data-act="import">Restore from a blob</button>'+
      '<button class="btn ghost" data-act="wipe">Wipe everything</button></div>'+
    '<textarea class="txt mono" id="iobox" placeholder="progress JSON appears here / paste it here to restore" '+
      'style="min-height:120px;font-size:12px"></textarea>'+
    '<div id="iofb" style="margin-top:8px"></div>';

  return html + '</div>';
};

CLICKS.progress = function(e){
    var t = e.target.closest ? e.target.closest("[data-act]") : null;
    if (!t) return;
    var box = document.getElementById("iobox"), fb = document.getElementById("iofb");
    var act = t.getAttribute("data-act");
    if (act === "export"){
      box.value = JSON.stringify(S);
      box.select();
      var ok = false;
      try{ ok = document.execCommand("copy"); }catch(e2){}
      fb.innerHTML = '<span class="pill p-green"><span class="dot"></span>'+
        (ok ? "copied to clipboard" : "select the box and copy it")+'</span>';
    }
    if (act === "import"){
      try{
        var d = JSON.parse(box.value);
        if (!d || typeof d !== "object") throw new Error("not an object");
        S.cards = d.cards||{}; S.questions = d.questions||{};
        S.lessons = d.lessons||{}; S.sessions = d.sessions||[];
        S.labs = d.labs||{}; S.flags = d.flags||{};
        S.conf = d.conf||{}; S.explain = d.explain||{};
        S.pretests = d.pretests||{}; S.recalls = d.recalls||[];
        S.quiz = d.quiz||{};
        S.autoplay = d.autoplay !== false;
        S.notesOpen = d.notesOpen !== false;
        save();
        fb.innerHTML = '<span class="pill p-green"><span class="dot"></span>restored</span>';
        deck = null; sess = null; quizRun = null;
        setTimeout(render, 400);
      }catch(e3){
        fb.innerHTML = '<span class="pill p-red"><span class="dot"></span>that is not valid progress JSON</span>';
      }
    }
    if (act === "wipe"){
      if (t.getAttribute("data-armed")){
        S.cards={}; S.questions={}; S.lessons={}; S.sessions=[]; S.labs={}; S.flags={};
        S.conf={}; S.explain={}; S.pretests={}; S.recalls=[]; S.quiz={};
        S.autoplay=true; S.notesOpen=true;
        save(); deck=null; sess=null; quizRun=null; render();
      } else {
        t.setAttribute("data-armed","1");
        t.textContent = "Really wipe? Click again";
        t.className = "btn r";
      }
    }
};

/* ===========================================================================
   VIEW · ML LABS
   Six notebooks that rebuild experiment.py in miniature. The notebook does the
   grading; this tab only records it. A receipt is a signed triple
   (lab, passed, total) — see notebooks/labs/labgrader.py, which implements the
   same FNV-1a so the two sides agree without either trusting the other.

   To be explicit about what this is: the hash stops a typo and a half-remembered
   paste, not a determined student. The grader source is readable and the salt is
   in it. Verification is a convenience, and the honesty is yours.

   The one view in this file that is still Surrey-shaped: the receipt salt and
   the kernel name below are that project's. Another centre wanting graded
   notebooks should give this view its own salt rather than declare the `labs`
   route and inherit Surrey's.
   =========================================================================== */

/* FNV-1a, 32-bit. Math.imul because a plain multiply overflows 2^53 and would
   silently disagree with the Python side. */
function fnv1a(s){
  var h = 0x811c9dc5;
  for (var i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ("0000000" + h.toString(16)).slice(-8);
}
function parseReceipt(raw){
  var m = /^LAB(\d+)-(\d+)o(\d+)-([0-9a-f]{8})$/i.exec(String(raw||"").trim());
  if (!m) return null;
  var body = "LAB"+m[1]+"-"+m[2]+"o"+m[3];
  if (fnv1a("surrey-labs-v1|"+body) !== m[4].toLowerCase()) return null;
  return {n:+m[1], passed:+m[2], total:+m[3]};
}
function labsDone(){
  var n=0;
  for (var i=0;i<LABS.length;i++){
    var st = S.labs[LABS[i].n];
    if (st && st.passed >= st.total) n++;
  }
  return n;
}

VIEWS.labs = function(){
  var i, done = labsDone();
  var html = '<div class="page">'+
    '<div class="title"><span class="emo">🧪</span><h1>ML labs</h1></div>'+
    '<p class="lede">Six Jupyter notebooks that rebuild <code>src/pipeline/experiment.py</code> in '+
      'miniature, on the real 612-row panel. Every lab ends in an assignment you have to write '+
      'yourself; the notebook grades it and prints a receipt you paste in below. Nothing here is '+
      'a simulation — Lab 6 reproduces the preprint’s headline interval to the digit.</p>';

  /* where you are */
  html += '<div class="progressline">';
  for (i=0;i<LABS.length;i++){
    var st0 = S.labs[LABS[i].n];
    html += '<i class="'+(st0 && st0.passed >= st0.total ? "g" : st0 ? "a" : "")+'"></i>';
  }
  html += '</div>';

  html += '<div class="grid g2" style="margin-bottom:18px">'+
    '<div class="card stat"><div class="k">Labs finished</div><div class="v">'+done+
      '<span class="faint" style="font-size:16px">/'+LABS.length+'</span></div>'+
      '<div class="s">'+(done===LABS.length ? 'all six' : LABS[done] ? 'next: '+esc(LABS[done].title) : '')+'</div></div>'+
    '<div class="card stat"><div class="k">Time to work through</div><div class="v">~'+
      Math.round(LABS.reduce(function(a,b){return a+b.mins;},0)/60)+' h</div>'+
      '<div class="s">across six sittings</div></div></div>';

  /* how to start */
  html += '<h2 class="sec">Getting started</h2>'+
    '<p class="muted" style="margin:-4px 0 10px;max-width:44rem">From anywhere — the package is '+
      'installed editable, so paths resolve on their own. Pick the '+
      '<strong>Surrey Biome (venv)</strong> kernel, not plain <code>python3</code>.</p>'+
    '<pre class="mono" style="background:var(--pill-grey-bg);padding:12px 14px;border-radius:8px;'+
      'font-size:12px;overflow-x:auto">jupyter lab notebooks/labs/lab1_the_panel.ipynb</pre>';

  /* the labs */
  html += '<h2 class="sec">The sequence</h2>';
  for (i=0;i<LABS.length;i++){
    var L = LABS[i], st = S.labs[L.n];
    var okAll = st && st.passed >= st.total;
    var pill = okAll
      ? '<span class="pill p-green"><span class="dot"></span>'+st.passed+'/'+st.total+' done</span>'
      : st ? '<span class="pill p-yellow"><span class="dot"></span>'+st.passed+'/'+st.total+' passed</span>'
           : '<span class="pill p-grey"><span class="dot"></span>not started</span>';
    html += '<div class="card" style="margin-bottom:10px">'+
      '<div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap">'+
        '<div class="ckn">Lab '+L.n+'</div>'+
        '<div style="font-weight:600;flex:1;min-width:12rem">'+esc(L.title)+'</div>'+
        '<div class="faint" style="font-size:12px">~'+L.mins+' min</div>'+ pill +'</div>'+
      '<p style="margin:8px 0 6px;font-size:13.5px">'+L.blurb+'</p>'+
      '<p style="margin:0 0 8px;font-size:13px" class="muted"><strong>You write:</strong> '+L.build+'</p>'+
      '<div style="border-left:2px solid var(--line-strong);padding:2px 0 2px 10px;font-size:13px">'+
        '<span class="faint">What it lands · </span>'+L.lands+'</div>'+
      '<div class="mono faint" style="margin-top:8px;font-size:11.5px">'+
        'notebooks/labs/'+L.file+'</div>'+
    '</div>';
  }

  /* redeem */
  html += '<h2 class="sec">Redeem a receipt</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:44rem">Run the last cell of a notebook '+
      '(<code>grade_lab(n, globals())</code>) and paste what it prints. The code carries the lab '+
      'number and your score, and is checked against a hash so a mistyped paste is rejected '+
      'rather than silently recorded.</p>'+
    '<div class="btnrow" style="margin-bottom:10px;align-items:center">'+
      '<input class="txt mono" id="labcode" placeholder="LAB1-3o3-…" '+
        'style="max-width:22rem;font-size:13px" autocomplete="off" spellcheck="false">'+
      '<button class="btn primary" data-lab="redeem">Redeem</button>'+
      '<button class="btn ghost" data-lab="clear">Clear lab progress</button></div>'+
    '<div id="labfb"></div>';

  html += '<h2 class="sec">Where the labs meet the rest of this site</h2>'+
    '<p class="muted" style="max-width:44rem;font-size:13.5px">The labs teach the same facts the '+
      'flashcards drill, by making you derive them. They do not feed the mastery score — that '+
      'stays a measure of recall under questioning, which is a different skill from being able '+
      'to write the code. Finishing all six should make the '+
      '<a href="#/numbers">Numbers</a> tab read as things you have computed rather than things '+
      'you have memorised.</p>';

  return html + '</div>';
};

CLICKS.labs = function(e){
  var t = e.target.closest ? e.target.closest("[data-lab]") : null;
  if (!t) return;
  var fb = document.getElementById("labfb");
  var act = t.getAttribute("data-lab");

  if (act === "redeem"){
    var box = document.getElementById("labcode");
    var r = parseReceipt(box.value);
    if (!r){
      fb.innerHTML = '<span class="pill p-red"><span class="dot"></span>'+
        'that is not a valid receipt — copy the whole line, including the hash</span>';
      return;
    }
    var known = false;
    for (var i=0;i<LABS.length;i++) if (LABS[i].n === r.n) known = true;
    if (!known){
      fb.innerHTML = '<span class="pill p-red"><span class="dot"></span>there is no lab '+r.n+'</span>';
      return;
    }
    S.labs[r.n] = {passed:r.passed, total:r.total, t:Date.now()};
    save();
    box.value = "";
    render();
    var f2 = document.getElementById("labfb");
    if (f2) f2.innerHTML = '<span class="pill '+(r.passed>=r.total?"p-green":"p-yellow")+'">'+
      '<span class="dot"></span>Lab '+r.n+' recorded — '+r.passed+'/'+r.total+
      (r.passed>=r.total ? '' : ', finish the rest and redeem again')+'</span>';
    return;
  }

  if (act === "clear"){
    if (t.getAttribute("data-armed")){
      S.labs = {}; save(); render();
    } else {
      t.setAttribute("data-armed","1");
      t.textContent = "Really clear? Click again";
      t.className = "btn r";
    }
  }
};

/* ===========================================================================
   VIEW · SOURCES & INTEGRITY
   Doubles as the self-check surface: broken concept ids, orphan cards and
   missing figures are visible here rather than only in the console.
   =========================================================================== */
function selfCheck(){
  var problems = [], i, j;
  var ids = {}, hasNotes = false;
  for (var nk0 in NOTES) if (Object.prototype.hasOwnProperty.call(NOTES, nk0)) { hasNotes = true; break; }
  for (i=0;i<CONCEPTS.length;i++){
    if (ids[CONCEPTS[i].id]) problems.push("duplicate concept id: "+CONCEPTS[i].id);
    ids[CONCEPTS[i].id] = 1;
  }
  for (i=0;i<CONCEPTS.length;i++){
    var c = CONCEPTS[i];
    if (!c.prereqs) continue;
    for (j=0;j<c.prereqs.length;j++){
      if (!ids[c.prereqs[j]]) problems.push(c.id+" → unknown prereq "+c.prereqs[j]);
    }
  }
  /* ---- Syllabus grounding, where a centre claims to have one ---------------
     Opt-in, because "every concept cites a syllabus code" is true of a course
     centre and meaningless for a project centre. Where a centre does set it,
     an ungrounded concept is a content bug of the worst kind: it looks exactly
     like a grounded one. `sourcePattern` is the shape the code must take, so a
     concept cannot satisfy the check by carrying the word "CED" and nothing
     else. */
  if (CENTRE.requireSource){
    var pat = CENTRE.sourcePattern ? new RegExp(CENTRE.sourcePattern) : null;
    for (i=0;i<CONCEPTS.length;i++){
      var sc = CONCEPTS[i];
      if (!sc.source) problems.push("concept "+sc.id+" has no source — every concept must cite the syllabus");
      else if (pat && !pat.test(sc.source))
        problems.push("concept "+sc.id+" source \""+sc.source+"\" is not in the expected form");
    }
  }
  /* cycle detection */
  var colour = {};
  function visit(id, stack){
    if (colour[id] === 2) return;
    if (colour[id] === 1){ problems.push("cycle: "+stack.concat(id).join(" → ")); return; }
    colour[id] = 1;
    var c2 = byId(id);
    if (c2 && c2.prereqs) for (var k=0;k<c2.prereqs.length;k++) visit(c2.prereqs[k], stack.concat(id));
    colour[id] = 2;
  }
  for (i=0;i<CONCEPTS.length;i++) visit(CONCEPTS[i].id, []);

  /* ---- Notes fidelity ------------------------------------------------------
     The bullet digest promises that distilling `depth` drops the connective
     prose and nothing else. A promise in a comment is worth very little, so it
     is checked: pull every number out of `depth`, pull every number out of the
     notes, and report anything that went missing.

     Numbers are the right thing to check because they are what a summary
     silently loses first and what a judge asks for most directly. It cannot
     catch a dropped *argument*, and it is not claiming to. */
  /* The decimal part must be `\.\d+` rather than `\.?\d*`. The lazy version
     swallows a sentence-ending full stop, so "NIR 4000." and "n = 300." parse as
     the numbers "4000." and "300." — which then never match the same figure
     written mid-sentence in the notes, and every prose paragraph ending in a
     number reports a false drop. */
  function numsIn(s){
    var out = {}, m = String(s||"").match(/\d[\d,]*(?:\.\d+)?/g) || [];
    for (var q=0;q<m.length;q++) out[m[q].replace(/,/g,"")] = 1;
    return out;
  }
  /* Only where the centre carries a digest at all. A centre with no NOTES is
     not a centre whose every concept has lost its notes. */
  if (hasNotes) for (i=0;i<CONCEPTS.length;i++){
    var nc = CONCEPTS[i], nn = NOTES[nc.id];
    if (!nn || !nn.length){ problems.push("concept "+nc.id+" has no NOTES entry"); continue; }
    if (!nc.depth) continue;
    var want = numsIn(nc.depth), have = numsIn(nn.join(" ")), missing = [];
    for (var k2 in want) if (!have[k2]) missing.push(k2);
    if (missing.length){
      problems.push("NOTES "+nc.id+" drops number(s) present in depth: "+missing.join(", "));
    }
  }
  for (var nk in NOTES) if (!byId(nk)) problems.push("NOTES entry for unknown concept "+nk);

  var cardIds = {};
  for (i=0;i<CARDS.length;i++){
    if (cardIds[CARDS[i].id]) problems.push("duplicate card id: "+CARDS[i].id);
    cardIds[CARDS[i].id] = 1;
    if (!ids[CARDS[i].conceptId]) problems.push("card "+CARDS[i].id+" → unknown concept "+CARDS[i].conceptId);
    if (CARDS[i].type === "number" && isNaN(numify(CARDS[i].back)))
      problems.push("number card "+CARDS[i].id+" has no parseable value");
  }
  var qIds = {};
  for (i=0;i<QUESTIONS.length;i++){
    if (qIds[QUESTIONS[i].id]) problems.push("duplicate question id: "+QUESTIONS[i].id);
    qIds[QUESTIONS[i].id] = 1;
    if (QUESTIONS[i].conceptIds){
      for (j=0;j<QUESTIONS[i].conceptIds.length;j++){
        if (!ids[QUESTIONS[i].conceptIds[j]])
          problems.push("question "+QUESTIONS[i].id+" → unknown concept "+QUESTIONS[i].conceptIds[j]);
      }
    }
  }
  /* ---- The quiz bank -------------------------------------------------------
     Every check here exists because the failure it catches is invisible from
     the outside: a quiz with a mis-indexed answer, a `whyNot` list one entry
     short, or an option that cannot survive being shuffled all render as a
     perfectly ordinary question and mark you wrong for being right. */
  if (QUIZ.length){
    var zIds = {}, perConcept = {}, ansPos = {};
    for (i=0;i<QUIZ.length;i++){
      var z = QUIZ[i], where = "quiz item "+(z.id || "#"+i);
      if (!z.id) problems.push(where+" has no id");
      else if (zIds[z.id]) problems.push("duplicate quiz id: "+z.id);
      zIds[z.id] = 1;
      if (!ids[z.conceptId]) problems.push(where+" → unknown concept "+z.conceptId);
      else perConcept[z.conceptId] = (perConcept[z.conceptId]||0) + 1;
      if (!z.stem) problems.push(where+" has no stem");
      var opts = z.options || [];
      if (opts.length < 3) problems.push(where+" has "+opts.length+" options — a quiz item needs at least 3");
      if (typeof z.answer !== "number" || z.answer < 0 || z.answer >= opts.length)
        problems.push(where+" answer index "+z.answer+" is outside its "+opts.length+" options");
      /* One note per wrong option, in the authored order. Anything else and
         whyNotFor hands out the explanation for a different option. */
      if (!z.whyNot || z.whyNot.length !== Math.max(0, opts.length - 1))
        problems.push(where+" has "+((z.whyNot&&z.whyNot.length)||0)+" whyNot notes for "+
          opts.length+" options — it needs exactly "+(opts.length-1));
      if (!z.why) problems.push(where+" has no `why` for the correct answer");
      var seenOpt = {};
      for (j=0;j<opts.length;j++){
        var ot = String(opts[j]);
        if (seenOpt[ot]) problems.push(where+" repeats an option verbatim");
        seenOpt[ot] = 1;
        /* Options are shuffled on every attempt, so anything that refers to a
           position — "both A and C", "none of the above" — is a wrong answer
           waiting to happen for reasons the reader cannot see. */
        if (/\b(of the above|of these options|both a and|neither a nor)\b/i.test(ot))
          problems.push(where+" option "+j+" refers to the other options by position, which the shuffle breaks");
      }
      if (typeof z.answer === "number") ansPos[z.answer] = (ansPos[z.answer]||0) + 1;
    }
    /* Coverage, and the shape of the key. A bank whose answer sits in the same
       authored slot every time is a bank somebody wrote on autopilot; the
       shuffle hides it from the reader but not from the next author. */
    /* Reported as two lines rather than as one line per concept: while a bank is
       being written this check IS the to-do list, and eighty-eight identical
       problems would bury every other thing selfCheck has to say. */
    var noQuiz = [], thin = [];
    for (i=0;i<CONCEPTS.length;i++){
      var qn2 = perConcept[CONCEPTS[i].id] || 0;
      if (!qn2) noQuiz.push(CONCEPTS[i].id);
      else if (qn2 < 3) thin.push(CONCEPTS[i].id+" ("+qn2+")");
    }
    if (noQuiz.length)
      problems.push(noQuiz.length+" concept(s) have no quiz items — every concept ends in a quiz: "+
        noQuiz.slice(0,12).join(", ")+(noQuiz.length>12 ? ", … and "+(noQuiz.length-12)+" more" : ""));
    if (thin.length)
      problems.push(thin.length+" concept(s) have fewer than 3 quiz items — a graded verdict needs "+
        "at least 3: "+thin.slice(0,12).join(", ")+(thin.length>12 ? ", …" : ""));
    var slots = 0, most = 0;
    for (var ap in ansPos) if (Object.prototype.hasOwnProperty.call(ansPos, ap)){
      slots++; most = Math.max(most, ansPos[ap]);
    }
    if (slots && most > QUIZ.length * 0.45)
      problems.push("quiz answer key is lopsided: "+most+" of "+QUIZ.length+
        " answers sit in the same authored slot");
    /* ---- The length cue ------------------------------------------------
       The one bias an author cannot see from inside a single item. Writing
       the correct option as a full explanation and the wrong ones as bare
       claims makes the longest option correct far more often than chance,
       and a test-wise student will find that pattern long before they find
       the physics. Shuffling the options does not help — it moves position,
       not length.

       The fix is not to pad the distractors, which produces waffle. It is to
       state the claim in the option and put the reasoning in `why`, which is
       where a reader wants it anyway. 45% is the line: with four options,
       chance is 25%, and a bank that never quite settles below 45% is a bank
       whose author was explaining in the wrong field. */
    /* Prose items only, and only where the winning margin is big enough to
       see. An item whose options are "8", "16" and "4" has a longest option
       too, and it carries no information whatever — counting those would
       measure arithmetic rather than the writing habit this is looking for.
       A tenth of the longest option is about the point at which a difference
       becomes visible at a glance without counting words. */
    var longest = 0, prose = 0;
    for (i=0;i<QUIZ.length;i++){
      var zo = QUIZ[i].options || [], best = -1, bi = -1, second = -1;
      for (j=0;j<zo.length;j++){
        var len = String(zo[j]).length;
        if (len > best){ second = best; best = len; bi = j; }
        else if (len > second) second = len;
      }
      if (best < 30) continue;                 /* not prose: length says nothing */
      prose++;
      if (bi === QUIZ[i].answer && best > second * 1.1) longest++;
    }
    if (prose >= 20 && longest > prose * 0.45)
      problems.push("the correct option is visibly the longest in "+longest+" of "+prose+
        " prose quiz items ("+Math.round(100*longest/prose)+"%) — that is a giveaway; move the "+
        "reasoning out of the option and into `why`");
  }
  for (i=0;i<SURFACES.length;i++){
    var found = false;
    for (j=0;j<QUESTIONS.length;j++) if (QUESTIONS[j].surface === SURFACES[i].rank) { found = true; break; }
    if (!found) problems.push("attack surface "+SURFACES[i].rank+" has no questions");
  }
  var eras = {};
  for (i=0;i<ERAS.length;i++) eras[ERAS[i].id] = 1;
  for (i=0;i<PROCESS.length;i++){
    var p = PROCESS[i];
    if (!eras[p.era]) problems.push("timeline “"+p.title+"” → unknown era "+p.era);
    if (!TL_KINDS[p.kind]) problems.push("timeline “"+p.title+"” → unknown kind "+p.kind);
    if (p.concepts) for (j=0;j<p.concepts.length;j++){
      if (!ids[p.concepts[j]]) problems.push("timeline “"+p.title+"” → unknown concept "+p.concepts[j]);
    }
  }
  return problems;
}

/* ===========================================================================
   VIEW · HOW THIS SITE TEACHES

   Dunlosky et al. (2013) surveyed what students actually do and found the two
   techniques with the strongest evidence — testing yourself, and spreading that
   testing out — are among the least used, while rereading and highlighting, which
   they rate low utility, are near-universal. The gap is not motivation. Most
   people have simply never been told which is which, and the ineffective ones
   feel considerably better while you are doing them.

   Every mechanism on this site is one of the effective ones. Several of them are
   annoying on purpose. This page exists so the annoyance reads as a design
   decision with a citation behind it rather than as friction to be routed
   around — because the one thing that would break this site is you deciding the
   gate is in your way.
   =========================================================================== */

VIEWS.method = function(){
  var html = '<div class="page narrow">'+
    '<div class="title"><span class="emo">🧠</span><h1>How this site teaches</h1></div>'+
    '<p class="lede">Several things here are annoying on purpose. This is which ones, and what '+
    'the evidence for each of them is.</p>'+
    '<div class="note info" style="margin:18px 0 8px">'+
      '<strong>The one-paragraph version.</strong><br>'+
      'Techniques that feel effective while you are using them and techniques that work are '+
      'close to disjoint sets. Rereading feels excellent and does very little. Being made to '+
      'produce an answer you are not sure of feels bad and is most of the benefit. Everything '+
      'below is built on that gap, so the reliable signal that a mechanism here is working is '+
      'that you would rather skip it.</div>';

  for (var i=0;i<METHOD.length;i++){
    var m = METHOD[i];
    html += '<div class="mth">'+
      '<h2 class="mth-h">'+esc(m.name)+'</h2>'+
      '<p class="mth-where">'+esc(m.where)+'</p>'+
      '<div class="prose" style="font-size:15px">'+para(m.why)+'</div>'+
      '<div class="mth-ev"><span class="eyebrow">Evidence</span>'+md(m.evidence)+'</div>'+
      (m.note ? '<p class="mth-note">'+md(m.note)+'</p>' : '')+
    '</div>';
  }

  html += '<h2 class="sec">If you only change one habit</h2>'+
    '<div class="prose">'+para(
      "Stop rereading and start emptying your head onto a page. Open **Blank page**, pick a "+
      "group, and write until you run dry — then look at what you missed. It is the least "+
      "comfortable thing on this site and the closest to what actually happens when someone "+
      "asks you to explain your project, which is not a coincidence.\n\n"+
      "The second habit, if you want one: when a card asks how sure you are, answer it out loud "+
      "before you press anything. Not in your head — out loud. The gap between what you can "+
      "recognise and what you can say is where a judging round is won or lost, and it is "+
      "invisible until you make a sound.")+'</div>';

  html += '<h2 class="sec">References</h2><div class="srclist">'+
    '<div class="srcrow"><div>Dunlosky, Rawson, Marsh, Nathan &amp; Willingham (2013). '+
      'Improving students’ learning with effective learning techniques. '+
      '<em>Psychological Science in the Public Interest</em> 14(1), 4–58.</div></div>'+
    '<div class="srcrow"><div>Karpicke &amp; Blunt (2011). Retrieval practice produces more '+
      'learning than elaborative studying with concept mapping. <em>Science</em> 331(6018), '+
      '772–775.</div></div>'+
    '<div class="srcrow"><div>Kornell, Hays &amp; Bjork (2009). Unsuccessful retrieval attempts '+
      'enhance subsequent learning. <em>JEP: LMC</em> 35(4), 989–998.</div></div>'+
    '<div class="srcrow"><div>Richland, Kornell &amp; Kao (2009). The pretesting effect: do '+
      'unsuccessful retrieval attempts enhance learning? <em>JEP: Applied</em> 15(3), '+
      '243–257.</div></div>'+
    '<div class="srcrow"><div>Taylor &amp; Rohrer (2010). The effects of interleaved practice. '+
      '<em>Applied Cognitive Psychology</em> 24(6), 837–848.</div></div>'+
    '<div class="srcrow"><div>Rawson &amp; Dunlosky (2013). The power of successive relearning. '+
      '<em>Educational Psychology Review</em> 25, 523–548.</div></div>'+
    '<div class="srcrow"><div>Bisra, Liu, Nesbit, Salimi &amp; Winne (2018). Inducing '+
      'self-explanation: a meta-analysis. <em>Educational Psychology Review</em> 30, '+
      '703–725.</div></div>'+
    '</div>'+
    '<p class="faint" style="font-size:12px;margin-top:10px">These are citations for the '+
      'learning design of this page, not for the science of the project. Those live under '+
      '<a href="#/sources">Sources &amp; integrity</a>, and the two lists are kept apart on '+
      'purpose.</p>';

  return html + '</div>';
};

VIEWS.sources = function(){
  var problems = selfCheck(), i;
  var tier = {1:0,2:0,3:0};
  for (i=0;i<QUESTIONS.length;i++) tier[QUESTIONS[i].tier||1]++;
  var types = {concept:0,number:0,choice:0};
  for (i=0;i<CARDS.length;i++) types[CARDS[i].type] = (types[CARDS[i].type]||0)+1;

  var html = '<div class="page">'+
    '<div class="title"><span class="emo">📚</span><h1>Sources &amp; integrity</h1></div>'+
    '<p class="lede">'+(CENTRE.sourcesLede||"")+'</p>'+

    '<div class="grid g4" style="margin-top:22px">'+
      '<div class="card stat"><div class="k">Concepts</div><div class="v">'+CONCEPTS.length+'</div></div>'+
      '<div class="card stat"><div class="k">Flashcards</div><div class="v">'+CARDS.length+'</div>'+
        '<div class="s">'+types.concept+' explain · '+types.number+' value · '+types.choice+' choice</div></div>'+
      '<div class="card stat"><div class="k">Questions</div><div class="v">'+QUESTIONS.length+'</div>'+
        '<div class="s">T1 '+tier[1]+' · T2 '+tier[2]+' · T3 '+tier[3]+'</div></div>'+
      '<div class="card stat"><div class="k">Integrity</div><div class="v">'+(problems.length?problems.length:"OK")+'</div>'+
        '<div class="s">'+(problems.length?"broken references":"all references resolve")+'</div></div>'+
    '</div>';

  if (problems.length){
    html += '<div class="note danger" style="margin-top:16px"><strong>Content problems.</strong>'+
      '<ul style="margin:6px 0 0;padding-left:18px">';
    for (i=0;i<problems.length;i++) html += '<li>'+esc(problems[i])+'</li>';
    html += '</ul></div>';
  }

  html += '<h2 class="sec">Where the content came from</h2><div class="card">';
  for (i=0;i<SOURCES.length;i++){
    html += '<div class="srcrow"><code style="flex:0 0 auto;min-width:16rem">'+esc(SOURCES[i].path)+'</code>'+
            '<span class="muted">'+md(SOURCES[i].use)+'</span></div>';
  }
  html += '</div>';

  /* Key moments only. The full record is its own view, and two timelines that
     can drift apart is exactly the failure this site keeps documenting. Skipped
     entirely by a centre that carries no process record. */
  if (PROCESS.length) html += '<h2 class="sec">Key moments</h2>'+
    '<p class="muted" style="margin:-4px 0 12px;max-width:42rem">The turning points, drawn from the '+
      'same content as the <a href="#/timeline">full process record</a> — '+PROCESS.length+' entries '+
      'across '+ERAS.length+' phases, with the reasoning behind each one.</p>'+
    '<div class="tscroll"><table class="t">'+
    '<thead><tr><th style="width:110px">Date</th><th style="width:110px">Kind</th><th>What happened</th></tr></thead><tbody>';
  for (i=0;i<PROCESS.length;i++){
    if (!PROCESS[i].key) continue;
    var kk = tlKind(PROCESS[i].kind);
    html += '<tr><td class="n">'+esc(PROCESS[i].date)+'</td>'+
      '<td><span class="pill '+kk.pill+'"><span class="dot"></span>'+kk.label+'</span></td>'+
      '<td>'+md(PROCESS[i].title)+'</td></tr>';
  }
  html += '</tbody></table></div>';

  html += '<div class="note" style="margin-top:26px">'+(CENTRE.sourcesNote||"")+'</div>';

  return html + '</div>';
};

/* ===========================================================================
   TUTOR
   Talks to serve.py on localhost. Everything here is inert unless the page was
   served — opened from file:// the button stays hidden and nothing fetches.

   The conversation lives in memory only. It is not study progress, and putting
   it in localStorage would both bloat the export and quietly accumulate a
   transcript the student never asked to keep.
   =========================================================================== */
var TUTOR_LOCAL = /^https?:$/.test(location.protocol) &&
                  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
var CHAT = [];
var asking = false;

/* The concept the student is looking at, so a bare "why?" has a referent. */
function tutorConcept(){
  var r = route();
  if (r.name === "learn" && r.arg) return byId(r.arg);
  /* On the flip deck the concept is whichever card is face-up, so the drawer
     sends that concept's text and sourceDoc rather than nothing. */
  if (r.name === "practice" && flip && flip.ids.length){
    var id = flip.ids[flip.i];
    for (var i=0;i<CARDS.length;i++) if (CARDS[i].id === id) return byId(CARDS[i].conceptId);
  }
  return null;
}
function currentCard(){
  if (!flip || !flip.ids.length) return null;
  for (var i=0;i<CARDS.length;i++) if (CARDS[i].id === flip.ids[flip.i]) return CARDS[i];
  return null;
}
function tutorPayload(c){
  if (!c) return null;
  var bits = [c.plain, c.depth, c.formula, c.whyThisChoice, c.rejectedAlternative, c.trap];
  return {
    title: c.title,
    sourceDoc: c.sourceDoc || "",
    text: bits.filter(Boolean).join("\n\n")
  };
}
function tutorCtx(){
  var c = tutorConcept();
  var box = document.getElementById("tutorctx");
  if (!box) return;
  box.innerHTML = c
    ? "Reading <b>" + esc(c.title) + "</b>" +
      (c.sourceDoc ? " · <code>" + esc(c.sourceDoc) + "</code>" : "")
    : "No concept open — answers will draw on the project narrative.";
}
/* The model writes richer markdown than the authored content does, so the drawer
   needs a block-level pass of its own. `md()`/`para()` stay exactly as they were
   — they are tuned to the content in this file, and widening them to satisfy an
   external writer is how a tiny parser turns into a bad one. */
function tutorInline(s){
  /* md() escapes and handles **bold**, `code`, [[links]]; single-asterisk
     italics are all that is left over, and only the model emits those. */
  return md(s).replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
}
function tutorMd(src){
  /* Stash math up front, at the whole-response level, so a $$display$$ block
     spanning lines survives the line-by-line pass below. The inner md() calls
     then find no `$` of their own and leave these placeholders alone. */
  var M = mathStash(src);
  var lines = M.text.split("\n"), out = [], i = 0;
  var BLOCK = /^(#{1,6}\s|```|\s*([-*+]|\d+\.)\s)/;
  while (i < lines.length){
    var line = lines[i];

    if (/^\s*```/.test(line)){                      /* fenced code */
      var code = []; i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      i++;
      /* Code blocks are restored verbatim: a formula inside a fence is source. */
      out.push("<pre><code>" + escRawMath(code.join("\n"), M.items) + "</code></pre>");
      continue;
    }
    var h = /^(#{1,6})\s+(.*)$/.exec(line);         /* heading */
    if (h){
      var lvl = Math.min(h[1].length + 2, 6);       /* # in a drawer is not an h1 */
      out.push("<h" + lvl + ">" + tutorInline(h[2]) + "</h" + lvl + ">");
      i++; continue;
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)){         /* list, ordered or not */
      var ordered = /^\s*\d+\.\s/.test(line), items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])){
        items.push("<li>" + tutorInline(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, "")) + "</li>");
        i++;
      }
      var tag = ordered ? "ol" : "ul";
      out.push("<" + tag + ">" + items.join("") + "</" + tag + ">");
      continue;
    }
    if (!line.trim()){ i++; continue; }

    var buf = [];                                   /* paragraph */
    while (i < lines.length && lines[i].trim() && !BLOCK.test(lines[i])) buf.push(lines[i++]);
    out.push("<p>" + tutorInline(buf.join("\n")).replace(/\n/g, "<br>") + "</p>");
  }
  return mathRestore(out.join(""), M.items);
}
/* Inside a fence the LaTeX is being shown, not typeset — put the source back. */
function escRawMath(text, items){
  return esc(text).replace(/\u0000M(\d+)\u0000/g, function(whole, k){
    var it = items[+k];
    return it ? esc(it.disp ? "$$" + it.tex + "$$" : "$" + it.tex + "$") : whole;
  });
}
function tutorPaint(){
  var log = document.getElementById("tutorlog");
  log.innerHTML = CHAT.map(function(t){
    if (t.role === "err") return '<div class="turn err">' + esc(t.text) + "</div>";
    var who = t.role === "me" ? "You" : "Tutor";
    return '<div class="turn ' + (t.role === "me" ? "me" : "") + '">' +
             '<div class="who">' + who + "</div>" +
             (t.role === "me" ? '<div class="bubble">' + esc(t.text) + "</div>" : tutorMd(t.text)) +
           "</div>";
  }).join("") + (asking ? '<div class="thinking">thinking…</div>' : "");
  log.scrollTop = log.scrollHeight;
}
function tutorSend(text){
  if (!text.trim() || asking) return;
  CHAT.push({role:"me", text:text.trim()});
  asking = true; tutorPaint();

  fetch("/api/ask", {
    method:"POST",
    headers:{"content-type":"application/json"},
    body: JSON.stringify({
      /* Which centre is asking. serve.py keeps one allow-list per centre, so a
         course centre cannot reach the Surrey project's documents and vice
         versa; an unknown id grounds on nothing rather than on everything. */
      centre: CENTRE.id,
      concept: tutorPayload(tutorConcept()),
      index: CONCEPTS.map(function(c){ return c.title; }),
      messages: CHAT.map(function(t){
        return {role: t.role === "me" ? "user" : "model", text: t.text};
      })
    })
  })
  .then(function(r){ return r.json().then(function(j){ return {ok:r.ok, j:j}; }); })
  .then(function(res){
    asking = false;
    if (!res.ok || res.j.error) CHAT.push({role:"err", text: res.j.error || "Request failed."});
    else CHAT.push({role:"ai", text: res.j.answer});
    tutorPaint();
  })
  .catch(function(){
    asking = false;
    CHAT.push({role:"err", text:"Could not reach the local server. Is serve.py still running?"});
    tutorPaint();
  });
}
/* ---- Ask about a selection -------------------------------------------------
   Highlight anything in the reading pane and a button appears over it. The
   quoted text is what the student could not parse, so it is sent verbatim
   rather than summarised — the whole point is to ask about *this* sentence. */
var selText = "";
function selHide(){ document.body.classList.remove("asksel-on"); selText = ""; }
function selShow(){
  var sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return selHide();

  var text = String(sel).replace(/\s+/g, " ").trim();
  if (text.length < 8) return selHide();          /* a stray double-click is not a question */

  var view = document.getElementById("view");
  if (!view || !view.contains(sel.anchorNode) || !view.contains(sel.focusNode)) return selHide();

  var r = sel.getRangeAt(0).getBoundingClientRect();
  if (!r || (!r.width && !r.height)) return selHide();

  var btn = document.getElementById("asksel");
  var x = Math.min(Math.max(r.left + r.width / 2, 60), window.innerWidth - 60);
  btn.style.left = x + "px";
  btn.style.top = Math.max(r.top - 8, 34) + "px";  /* clear of the topbar */
  selText = text;
  document.body.classList.add("asksel-on");
}

function tutorInit(){
  if (!TUTOR_LOCAL) return;          /* file:// — leave no trace */

  document.addEventListener("mouseup", function(){ setTimeout(selShow, 0); });
  document.addEventListener("keyup", function(e){
    if (e.shiftKey || e.key === "Escape") setTimeout(selShow, 0);
  });
  document.addEventListener("mousedown", function(e){
    if (!e.target.closest || !e.target.closest("#asksel")) selHide();
  });
  document.getElementById("view").addEventListener("scroll", selHide);
  document.getElementById("asksel").addEventListener("click", function(){
    var q = selText;
    selHide();
    window.getSelection().removeAllRanges();
    if (!document.body.classList.contains("tutor-open")){
      document.body.classList.add("tutor-open");
      tutorCtx();
    }
    tutorSend('Explain this, from the page I am reading:\n\n"' + q + '"');
  });

  var btn = document.getElementById("tutorbtn");
  var panel = document.getElementById("tutor");
  btn.hidden = false; panel.hidden = false;

  btn.addEventListener("click", function(){
    document.body.classList.toggle("tutor-open");
    if (document.body.classList.contains("tutor-open")){
      tutorCtx(); document.getElementById("tutorin").focus();
    }
  });
  document.getElementById("tutorclose").addEventListener("click", function(){
    document.body.classList.remove("tutor-open");
  });
  document.getElementById("tutorclear").addEventListener("click", function(){
    CHAT = []; tutorPaint();
  });
  document.getElementById("tutorform").addEventListener("submit", function(e){
    e.preventDefault();
    var box = document.getElementById("tutorin");
    tutorSend(box.value); box.value = ""; box.style.height = "auto";
  });
  var input = document.getElementById("tutorin");
  input.addEventListener("input", function(){
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  });
  input.addEventListener("keydown", function(e){
    if (e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      document.getElementById("tutorform").dispatchEvent(new Event("submit"));
    }
  });
  window.addEventListener("hashchange", tutorCtx);
  tutorCtx();
}

/* ===========================================================================
   BOOT
   Nothing above this line has run anything. `Centre.boot()` is called by the
   centre's own page AFTER it has had its chance to add views and click
   handlers, which is the only reason the boot sequence is a function at all.
   =========================================================================== */
function boot(){
document.addEventListener("click", function(e){
  /* Autoplay is handled first and for the whole document: the countdown card
     appears on two routes, and the rule is that *any* click stops it. Following
     the Continue link is the exception — it is going to the same place, just
     sooner, and cancelling first would leave a "stopped" card behind on a page
     you are already leaving. */
  var ac = e.target.closest ? e.target.closest("[data-act]") : null;
  var acv = ac && ac.getAttribute("data-act");
  if (acv === "autooff" || acv === "autoon"){
    e.preventDefault(); e.stopPropagation();
    clearAutoplay();
    S.autoplay = (acv === "autoon");
    save(); render();
    return;
  }
  if (!(e.target.closest && e.target.closest(".autocard a[href^='#/learn/']"))) cancelAutoplay();

  /* Flags are handled here rather than per-view because the button appears
     inside <a> cards, in the lesson header and on the deck — and inside an
     anchor the default navigation has to be cancelled before anything else. */
  var f = e.target.closest ? e.target.closest("[data-flag]") : null;
  if (f){
    e.preventDefault(); e.stopPropagation();
    toggleFlag(f.getAttribute("data-flag"));
    render();
    return;
  }
  var t = e.target.closest ? e.target.closest("[data-go]") : null;
  if (t){ go(t.getAttribute("data-go")); return; }
  var r = route();
  if (CLICKS[r.name]) CLICKS[r.name](e, r.arg);
});
/* Keyboard for the flip deck. Attached once at boot, not per render, for the
   same reason the click handler is: #view is replaced on every render and
   per-render listeners would stack. */
document.addEventListener("keydown", function(e){
  cancelAutoplay();                 /* typing is not consenting to be moved */
  if (route().name !== "practice" || !flip) return;
  var tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  if (document.body.classList.contains("pick-open")){
    if (e.key === "Escape"){ document.body.classList.remove("pick-open"); render(); }
    return;                                   /* modal owns the keyboard while open */
  }
  if (!flip.ids.length && !flip.done) return;
  if (flip.track && (e.key === "u" || e.key === "U" || e.key === "Backspace")){
    e.preventDefault(); undoMark(); render(); return;
  }
  if (e.key === "f" || e.key === "F"){ setFs(!document.body.classList.contains("fs")); render(); }
  else if (e.key === "Escape" && document.body.classList.contains("fs")){ setFs(false); render(); }
  else if (e.key === " " || e.key === "Enter"){ e.preventDefault(); flip.shown = !flip.shown; render(); }
  else if (e.key === "ArrowRight" || e.key === "ArrowLeft"){
    var right = e.key === "ArrowRight";
    if (flip.track){
      if (flip.done) return;
      flip.marks[flip.ids[flip.i]] = right ? "known" : "unknown";
      if (flip.i >= flip.ids.length - 1) flip.done = true;
      else { flip.i++; flip.shown = false; }
      render();
    } else if (right && flip.i < flip.ids.length - 1){ flip.i++; flip.shown = false; render(); }
    else if (!right && flip.i > 0){ flip.i--; flip.shown = false; render(); }
  }
});
document.getElementById("hamb").addEventListener("click", function(){
  document.body.classList.toggle("rail-open");
});
document.getElementById("backdrop").addEventListener("click", function(){
  document.body.classList.remove("rail-open");
});
window.addEventListener("hashchange", render);

load();
paintIcons(document);
render();
tutorInit();

/* Exposed for console spot-checks while authoring content, and so the scheduler
   and question picker can be exercised without driving the UI. */
window.__learn = {
  state:S, selfCheck:selfCheck, save:save,
  CONCEPTS:CONCEPTS, CARDS:CARDS, QUESTIONS:QUESTIONS, SURFACES:SURFACES, NUMBERS:NUMBERS,
  NOTES:NOTES,
  grade:grade, cardState:cardState, cardScore:cardScore, isDue:isDue, isNew:isNew,
  numMatches:numMatches, autoTol:autoTol,
  conceptMastery:conceptMastery, weakest:weakest, dueCount:dueCount, redQuestions:redQuestions,
  buildDeck:buildDeck, pickQuestions:pickQuestions,
  QUIZ:QUIZ, quizFor:quizFor, quizScore:quizScore, quizOwed:quizOwed, whyNotFor:whyNotFor
};
var probs = selfCheck();
if (probs.length) console.warn("[learning-centre] content problems:\n" + probs.join("\n"));
}

/* ---- The extension point ---------------------------------------------------
   Everything a centre might need to add a view of its own: register a renderer
   on VIEWS, an after-render pass on AFTER, a delegated click handler on CLICKS,
   name the route in CENTRE.routes, and call boot(). The helpers are here so an
   added view can be written in the same idiom as the ones above rather than
   re-implementing markdown and mastery colours. */
return {
  boot:boot,
  VIEWS:VIEWS, AFTER:AFTER, CLICKS:CLICKS, ROUTES:ROUTES, CENTRE:CENTRE,
  state:S, save:save, load:load, render:render, go:go, route:route,
  selfCheck:selfCheck,
  md:md, mdInline:mdInline, para:para, esc:esc, el:el, ico:ico, paintIcons:paintIcons,
  byId:byId, groupOf:groupOf, shuffle:shuffle, fmtDate:fmtDate,
  grade:grade, cardState:cardState, cardScore:cardScore, isDue:isDue, isNew:isNew,
  cardsFor:cardsFor, questionsFor:questionsFor, dueCount:dueCount, redQuestions:redQuestions,
  conceptMastery:conceptMastery, masteryClass:masteryClass, masteryWord:masteryWord,
  conceptTile:conceptTile, conceptPill:conceptPill, conceptStats:conceptStats,
  quizFor:quizFor, quizScore:quizScore, quizTaken:quizTaken, quizVerdict:quizVerdict,
  whyNotFor:whyNotFor,
  workedBlock:workedBlock, passageBlock:passageBlock,
  resumeCta:resumeCta, flagBtn:flagBtn, weakest:weakest,
  numMatches:numMatches, autoTol:autoTol, numify:numify
};

})();
