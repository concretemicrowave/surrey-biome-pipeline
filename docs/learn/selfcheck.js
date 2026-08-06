/* Boot a learning centre headlessly and report selfCheck().

   Why this exists: the centres are deliberately browser-only — no build step,
   no bundler, no test runner — which leaves "does selfCheck() pass" as a thing
   you can only answer by opening a page and reading the console. This runs the
   same code against a stub DOM so the answer is one command, and so a content
   change that breaks a reference is caught before it ships rather than after.

   It is a checker, not part of the site. Nothing in docs/learn loads it, and
   deleting it breaks nothing.

     node docs/learn/selfcheck.js docs/learn/surrey/index.html
     node docs/learn/selfcheck.js docs/learn/ap-physics-1/index.html
     node docs/learn/selfcheck.js docs/learn/ap-english-lang/index.html

   Exits non-zero if selfCheck() reports a problem or a declared route has no
   renderer, so it works in a loop or a hook.

   Runs every script the page runs, in document order, against a stub DOM —
   local <script src> files, the inline content/config blocks, the shared
   machinery, and the centre's own views — skipping only the final
   Centre.boot() call, which needs a real document. That is enough to prove the
   content parses, the config is well formed, the views file loads, and the
   content self-check passes.

   Usage: node selfcheck.js <path-to-centre-index.html>
*/
"use strict";
var fs = require("fs"), vm = require("vm"), path = require("path");

var page = process.argv[2];
var dir  = path.dirname(page);
var html = fs.readFileSync(page, "utf8");

var node = { addEventListener:function(){}, removeEventListener:function(){}, appendChild:function(){},
  setAttribute:function(){}, getAttribute:function(){ return null; }, focus:function(){},
  style:{}, classList:{add:function(){},remove:function(){},toggle:function(){},contains:function(){return false;}},
  querySelectorAll:function(){ return []; }, querySelector:function(){ return null; },
  closest:function(){ return null; }, innerHTML:"", textContent:"", value:"" };

var sandbox = { console:console, Date:Date, Math:Math, JSON:JSON, RegExp:RegExp,
  parseInt:parseInt, parseFloat:parseFloat, isNaN:isNaN, String:String, Number:Number,
  Object:Object, Array:Array, Boolean:Boolean, Error:Error, encodeURIComponent:encodeURIComponent,
  decodeURIComponent:decodeURIComponent,
  localStorage:{ getItem:function(){ return null; }, setItem:function(){}, removeItem:function(){} },
  document:{ addEventListener:function(){}, getElementById:function(){ return null; },
             createElement:function(){ return Object.create(node); },
             querySelectorAll:function(){ return []; }, querySelector:function(){ return null; },
             body:Object.create(node), hidden:false },
  location:{ protocol:"file:", hostname:"", hash:"#/overview" },
  navigator:{ userAgent:"node" },
  setTimeout:setTimeout, clearTimeout:clearTimeout, setInterval:setInterval, clearInterval:clearInterval,
  requestAnimationFrame:function(f){ return f(); } };
sandbox.window = sandbox;
vm.createContext(sandbox);

var ran = [];
var re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g, m;
while ((m = re.exec(html))){
  var attrs = m[1], body = m[2];
  var src = /\bsrc\s*=\s*["']([^"']+)["']/.exec(attrs);
  if (src){
    var f = path.resolve(dir, src[1]);
    vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, {filename:src[1]});
    ran.push(src[1]);
  } else {
    if (/Centre\s*\.\s*boot\s*\(/.test(body)) continue;   /* needs a real document */
    vm.runInContext(body, sandbox, {filename:"inline"});
    ran.push("<inline " + body.trim().split("\n")[0].slice(0, 28) + "…>");
  }
}

var C = vm.runInContext("CENTRE", sandbox);
var probs = vm.runInContext("Centre.selfCheck()", sandbox);

console.log(path.basename(dir) + " — scripts run: " + ran.length);
ran.forEach(function(r){ console.log("    " + r); });
console.log("  concepts  " + (C.concepts || []).length);
console.log("  cards     " + (C.cards || []).length);
console.log("  questions " + (C.questions || []).length);
console.log("  routes    " + (C.routes || []).map(function(r){ return r.id; }).join(", "));

/* every declared route must have a renderer, or the rail offers a dead link */
var VIEWS = vm.runInContext("Centre.VIEWS", sandbox), missing = [];
(C.routes || []).forEach(function(r){ if (!VIEWS[r.id]) missing.push(r.id); });
if (missing.length) console.log("  ROUTES WITH NO VIEW: " + missing.join(", "));
else console.log("  every route has a renderer");

console.log(probs.length ? "\nPROBLEMS (" + probs.length + "):\n  " + probs.join("\n  ")
                         : "\nselfCheck: 0 problems");
process.exit(probs.length || missing.length ? 1 : 0);
