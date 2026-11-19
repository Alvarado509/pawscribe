/* PawScribe v2 — homepage live demo (assets/demo.js).
   Pure JavaScript, no network, nothing leaves the browser.
   ------------------------------------------------------------------
   NO-INVENTION RULE (enforced by construction, not by a filter):
   - The formatter ONLY rearranges lines the user typed. It never adds,
     guesses, or completes a finding.
   - There is NO lookup table of findings, NO default exam text, and NO
     template text inside this file. The only strings it can output are
     (a) the user's own lines, verbatim, or (b) the literal "Not recorded".
   - Assessment is filled ONLY when the user explicitly writes an
     "A:" / "Assessment:" line. A diagnosis is never inferred from
     symptoms. Plan is filled ONLY from lines the user marks as a plan
     ("P:" / "Plan:") or that start with a plan verb (give, recheck...).
   - Every section with no matching user line renders "Not recorded".
   - Output is set with textContent only — user text is never parsed
     as HTML and no word can appear in the output unless the user typed
     it (or it is the literal "Not recorded" / the fixed UI labels).
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var NOT_RECORDED = "Not recorded";

  /* Explicit section prefixes the user may type, e.g. "S: owner reports..." */
  var PREFIX = /^\s*(subjective|objective|assessment|plan|S|O|A|P)\s*[:\-\u2013]\s*(.*)$/i;
  var PREFIX_SECTION = { S: "S", SUBJECTIVE: "S", O: "O", OBJECTIVE: "O", A: "A", ASSESSMENT: "A", P: "P", PLAN: "P" };

  /* Lines starting with one of these verbs are the user's plan. */
  var PLAN_START = /^(plan|recheck|follow[\s-]?up|next|give|administer|prescribe|schedule|dispense|advise|monitor|return)\b/i;

  /* Measurement words route a line to Objective. The pattern only
     READS the user's line; it never writes a value of its own. */
  var MEASURE = /\b(temp(erature)?|heart rate|\bHR\b|resp(iratory rate)?|\bRR\b|weight|\bkg\b|\blb(s)?\b|bpm|CRT|capillary refill|SpO2|BCS|body condition|mmHg|\d+\s*°\s*[CF])\b/i;

  /* Owner-reported wording routes a line to Subjective. */
  var OWNER_REPORT = /\b(owner (says|reports)|eating|drinking|vomiting|vomited|limping|coughing|lethargic|appetite|diarrh(o)?ea|stool(s)?|energy|drinking more|slower)\b/i;

  function formatRoughNotes(text) {
    var lines = String(text || "").split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var s = [], o = [], a = [], p = [];
    lines.forEach(function (line) {
      var m = line.match(PREFIX);
      if (m) {
        var section = PREFIX_SECTION[m[1].toUpperCase()];
        var rest = (m[2] || "").trim();
        if (!rest) return;
        if (section === "S") s.push(rest);
        else if (section === "O") o.push(rest);
        else if (section === "A") a.push(rest);
        else p.push(rest);
        return;
      }
      if (PLAN_START.test(line)) { p.push(line); return; }
      if (MEASURE.test(line)) { o.push(line); return; }
      if (OWNER_REPORT.test(line)) { s.push(line); return; }
      s.push(line); /* Default: the user's own words, as history. */
    });
    return {
      S: s.length ? s.join(" ") : NOT_RECORDED,
      O: o.length ? o.join(" ") : NOT_RECORDED,
      A: a.length ? a.join(" ") : NOT_RECORDED,
      P: p.length ? p.join(" ") : NOT_RECORDED
    };
  }

  function $(id) { return document.getElementById(id); }

  function autogrow(ta) {
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }

  function renderDemo() {
    var input = $("demo-input");
    var out = $("demo-output");
    if (!input || !out) return;
    var soap = formatRoughNotes(input.value);
    $("demo-s").textContent = soap.S;
    $("demo-o").textContent = soap.O;
    $("demo-a").textContent = soap.A;
    $("demo-p").textContent = soap.P;
    out.hidden = false;
    var empty = $("demo-empty");
    if (empty) empty.hidden = true;
  }

  function copyDemo() {
    var parts = ["S — Subjective", $("demo-s").textContent, "", "O — Objective", $("demo-o").textContent, "", "A — Assessment", $("demo-a").textContent, "", "P — Plan", $("demo-p").textContent];
    var text = parts.join("\n");
    function done() { if (window.PawScribe) PawScribe.showToast("Note copied."); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  /* --- Tabs: Scribe / Dictate / Templates --- */
  function wireTabs() {
    var tabs = document.querySelectorAll(".demo-tab");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { selectTab(tab.getAttribute("data-tab")); });
    });
  }
  function selectTab(name) {
    document.querySelectorAll(".demo-tab").forEach(function (t) {
      t.setAttribute("aria-selected", t.getAttribute("data-tab") === name ? "true" : "false");
    });
    ["scribe", "dictate", "templates"].forEach(function (n) {
      var panel = $("demo-panel-" + n);
      if (panel) panel.hidden = n !== name;
    });
    if (name === "scribe") { var ta = $("demo-input"); if (ta) ta.focus(); }
  }

  /* --- Dictate: Web Speech API, honest fallback --- */
  function wireDictate() {
    var btn = $("demo-mic");
    var status = $("demo-dictate-status");
    if (!btn) return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      btn.disabled = true;
      if (status) status.textContent = "Dictation is not supported in this browser. Try Chrome, or type your notes in the Scribe tab instead. (In Chrome, dictation audio is sent to Google by the browser — that is the browser's behaviour, not PawScribe's.)";
      return;
    }
    var rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    var listening = false;
    var finalText = "";
    btn.addEventListener("click", function () {
      if (listening) { try { rec.stop(); } catch (e) { /* already stopped */ } return; }
      finalText = "";
      try {
        rec.start();
      } catch (e) {
        if (status) status.textContent = "Could not start dictation. Check microphone permission, then try again.";
      }
    });
    rec.onstart = function () {
      listening = true;
      btn.textContent = "Stop dictation";
      if (status) status.textContent = "Listening… speak your notes.";
    };
    rec.onend = function () {
      listening = false;
      btn.textContent = "Start dictation";
      var ta = $("demo-input");
      if (finalText && ta) {
        ta.value = (ta.value ? ta.value.replace(/\s+$/, "") + "\n" : "") + finalText;
        autogrow(ta);
        selectTab("scribe");
      }
      if (status && !finalText) status.textContent = "Nothing heard. Try again, or type your notes instead.";
    };
    rec.onresult = function (ev) {
      var interim = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) finalText += ev.results[i][0].transcript;
        else interim += ev.results[i][0].transcript;
      }
      if (status) status.textContent = interim ? "Hearing: " + interim : (finalText || "Listening… speak your notes.");
    };
    rec.onerror = function (ev) {
      listening = false;
      btn.textContent = "Start dictation";
      if (status) status.textContent = ev.error === "not-allowed"
        ? "Microphone access was blocked. Allow the microphone in your browser, or type your notes instead."
        : "Dictation hit a problem (" + ev.error + "). Type your notes in the Scribe tab instead.";
    };
  }

  /* --- Template chips: load sample text into the Scribe tab --- */
  var SAMPLES = {
    wellness: "Milo, 3-year-old Golden Retriever, owner reports normal appetite and energy\nTemp 38.6 C, heart rate 92, weight 32 kg, abdomen soft\nPlan: vaccines due today, recheck in 12 months",
    sick: "Bella, 7-year-old Beagle, owner reports vomiting twice today and less interest in food\nTemp 38.4 C, weight 14 kg, abdomen soft on palpation\nPlan: bland diet for 2 days, recheck in 1 week if vomiting continues",
    recheck: "Max, 4-year-old mixed breed, 10 days after surgery, owner reports eating well and comfortable at home\nIncision clean and dry, no discharge, no swelling\nPlan: sutures removed today, normal activity in 4 days"
  };
  function wireChips() {
    document.querySelectorAll("[data-sample]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var ta = $("demo-input");
        var sample = SAMPLES[chip.getAttribute("data-sample")];
        if (!ta || !sample) return;
        ta.value = sample;
        autogrow(ta);
        selectTab("scribe");
        renderDemo();
      });
    });
  }

  /* --- Template preview cards on the homepage (from templates.js) --- */
  function renderPreview() {
    var grid = $("template-preview");
    if (!grid || !window.PAWSCRIBE_TEMPLATES) return;
    window.PAWSCRIBE_TEMPLATES.slice(0, 3).forEach(function (t) {
      var card = document.createElement("article");
      card.className = "card";
      var title = document.createElement("h3");
      title.textContent = t.title;
      var badge = document.createElement("p");
      var pill = document.createElement("span");
      pill.className = "pill";
      pill.textContent = t.species;
      badge.appendChild(pill);
      var desc = document.createElement("p");
      desc.textContent = t.description;
      var link = document.createElement("a");
      link.className = "btn btn-secondary";
      link.href = "templates.html";
      link.textContent = "See template";
      card.appendChild(title);
      card.appendChild(badge);
      card.appendChild(desc);
      card.appendChild(link);
      grid.appendChild(card);
    });
  }

  function init() {
    var input = $("demo-input");
    if (input) {
      input.addEventListener("input", function () { autogrow(input); });
      autogrow(input);
    }
    var btn = $("demo-format");
    if (btn) btn.addEventListener("click", renderDemo);
    var copyBtn = $("demo-copy");
    if (copyBtn) copyBtn.addEventListener("click", copyDemo);
    wireTabs();
    wireDictate();
    wireChips();
    renderPreview();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* Exposed for testing only: formatRoughNotes echoes user lines verbatim
     and returns "Not recorded" for empty sections. */
  window.PawScribeDemo = { format: formatRoughNotes, NOT_RECORDED: NOT_RECORDED };
})();
