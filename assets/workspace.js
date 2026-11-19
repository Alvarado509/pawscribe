/* PawScribe workspace — assets/workspace.js (app.html logic).
   The pure-JS formatter formats ONLY what the vet typed: it copies lines
   from the rough notes into S / O / A / P and adds nothing. A section with
   no content renders as "Not recorded" in the exported note — clinical
   values are NEVER invented. AI drafts only ever come from a real
   drafting response via assets/ai.js; nothing is simulated.
   Autogrow: the shared app.js has no autogrow helper yet, so this file
   defines and uses its own (textareas grow with their content, no inner
   scrolling). Quota banner rule: the "AI notes limit reached" banner is
   shown ONLY when PawScribe.quotaReached() is true (used >= limit);
   at 0 / 5 it stays hidden. */
(function () {
  "use strict";

  var NOTES_KEY = "pawscribe_notes_v1";
  var HISTORY_CAP = 100;
  var FREE_HISTORY_CAP = 10;

  /* ---------- formatter (pure JS, no invention) ---------- */
  /* A line that is only a field label ("Patient:") carries no content and
     is skipped, so template prompts never leak into the note. */
  function isLabelOnly(line) {
    return /^[^:\n]{2,40}:\s*$/.test(line);
  }

  var OBJECTIVE_RE = /\b(temp|temperature|heart rate|respiratory rate|weight|\d+\s*kg|\d+\s*bpm|auscult|lungs?|abdomen|mucous membrane|crt|palpat|lymph node|skin|coat|teeth|gingiv|eyes|ears|pain score|mmhg|spo2|hydration|body condition|gums?|vitals?)\b/i;
  var PLAN_RE = /(recheck|follow[- ]?up|next visit|next vaccine|in 12 months|in 1 week|in 4 days|continue|schedule|prescrib|administer|monitor|return in|call the clinic|discharge|advise|recommend)/i;
  var SECTION_RE = /^\s*([SOAP])\s*[:\-.]\s*(.*)$/i;

  /* Classify one content line into S, O, A or P. Only the vet's own words
     are ever placed in a section; nothing else is added. */
  function classifyLine(line) {
    var m = SECTION_RE.exec(line);
    if (m) return { section: m[1].toUpperCase(), text: m[2].trim() };
    if (OBJECTIVE_RE.test(line)) return { section: "O", text: line };
    if (PLAN_RE.test(line)) return { section: "P", text: line };
    return { section: "S", text: line };
  }

  function formatRoughNotes(text) {
    var out = { S: [], O: [], A: [], P: [] };
    (text || "").split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (!line || isLabelOnly(line)) return;
      var c = classifyLine(line);
      if (c.text) out[c.section].push(c.text);
    });
    return {
      S: out.S.join("\n"),
      O: out.O.join("\n"),
      A: out.A.join("\n"),
      P: out.P.join("\n")
    };
  }

  /* Rendered note text: an empty section shows "Not recorded". This is the
     only text ever added, and it is added only at render time — the saved
     draft keeps the vet's real (possibly empty) values. */
  function formatSoapText(soap) {
    function section(label, value) {
      var v = (value || "").trim();
      return label + "\n" + (v || "Not recorded");
    }
    return [
      section("S — Subjective", soap.S),
      section("O — Objective", soap.O),
      section("A — Assessment", soap.A),
      section("P — Plan", soap.P)
    ].join("\n\n");
  }

  /* ---------- autogrow (no inner scrolling) ---------- */
  function autogrow(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    el.style.overflowY = "hidden";
  }

  function attachAutogrow(el) {
    if (!el) return;
    el.addEventListener("input", function () { autogrow(el); });
    autogrow(el);
  }

  /* Expose for tests (node) and for other pages. */
  var api = {
    formatRoughNotes: formatRoughNotes,
    formatSoapText: formatSoapText,
    autogrow: autogrow
  };
  if (typeof window !== "undefined") window.PawScribeWorkspace = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  /* ---------- page logic ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    function $(id) { return document.getElementById(id); }
    function toast(msg) {
      if (window.PawScribe) window.PawScribe.showToast(msg);
    }
    function hasDraft() {
      return ["soap-s", "soap-o", "soap-a", "soap-p"].some(function (id) {
        var el = $(id);
        return el && el.value.trim() !== "";
      });
    }
    function getSoap() {
      return {
        S: $("soap-s").value,
        O: $("soap-o").value,
        A: $("soap-a").value,
        P: $("soap-p").value
      };
    }
    function setDraft(soap, markDraft) {
      $("soap-s").value = soap.S || "";
      $("soap-o").value = soap.O || "";
      $("soap-a").value = soap.A || "";
      $("soap-p").value = soap.P || "";
      ["soap-s", "soap-o", "soap-a", "soap-p"].forEach(function (id) { autogrow($(id)); });
      $("draft-banner").hidden = !markDraft;
      refreshEmptyState();
    }
    function refreshEmptyState() {
      var empty = $("draft-empty");
      if (empty) empty.hidden = hasDraft();
    }
    function download(filename, text, type) {
      var blob = new Blob([text], { type: type || "text/plain" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    }

    /* ---------- autogrow on every textarea ---------- */
    document.querySelectorAll("textarea").forEach(attachAutogrow);
    ["soap-s", "soap-o", "soap-a", "soap-p"].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener("input", refreshEmptyState);
    });

    /* ---------- mobile tabs ---------- */
    var tabs = document.querySelectorAll(".tab");
    var panels = document.querySelectorAll("[data-panel]");
    function showPanel(name) {
      tabs.forEach(function (t) { t.classList.toggle("tab-active", t.getAttribute("data-tab") === name); });
      panels.forEach(function (p) {
        p.hidden = window.innerWidth < 1024 && p.getAttribute("data-panel") !== name;
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { showPanel(t.getAttribute("data-tab")); });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) panels.forEach(function (p) { p.hidden = false; });
      else showPanel(document.querySelector(".tab-active") ? document.querySelector(".tab-active").getAttribute("data-tab") : "input");
    });
    showPanel("input");

    /* ---------- template picker (one action, no Load button) ---------- */
    var picker = $("template-picker");
    function fillPicker() {
      (window.PAWSCRIBE_TEMPLATES || []).forEach(function (t) {
        var opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = (t.name || t.title) + " (" + t.species + ")";
        picker.appendChild(opt);
      });
      var params = new URLSearchParams(window.location.search);
      var pre = params.get("template");
      if (pre) { picker.value = pre; loadTemplate(); }
    }
    function loadTemplate() {
      var t = (window.PAWSCRIBE_TEMPLATES || []).find(function (x) { return x.id === picker.value; });
      var helper = $("template-helper");
      var sampleBox = $("template-sample");
      if (!t) {
        if (helper) helper.textContent = "";
        if (sampleBox) { sampleBox.hidden = true; sampleBox.textContent = ""; }
        return;
      }
      /* One action: the rough-notes box gets the template's labelled lines
         (empty prompts — no values are invented) and the helper lists what
         the template asks for. */
      $("rough-input").value = t.fields.map(function (f) { return f.label + ":"; }).join("\n\n");
      autogrow($("rough-input"));
      if (helper) {
        helper.textContent = "This template asks for: " + t.fields.map(function (f) { return f.label; }).join(", ") + ".";
      }
      if (sampleBox && t.sample) {
        sampleBox.hidden = false;
        sampleBox.textContent = "";
        var title = document.createElement("p");
        title.innerHTML = "<strong>Example note for this template:</strong>";
        sampleBox.appendChild(title);
        t.fields.forEach(function (f) {
          var p = document.createElement("p");
          p.textContent = f.label + ": " + (t.sample[f.key] || "Not recorded");
          sampleBox.appendChild(p);
        });
      }
      toast("Template ready — fill in each line, then format or generate a draft.");
    }
    if (picker) {
      picker.addEventListener("change", loadTemplate);
      fillPicker();
    }

    /* ---------- dictation + recording ---------- */
    var dictateBtn = $("dictate-btn");
    if (dictateBtn) dictateBtn.addEventListener("click", function () {
      if (window.PawScribeAudio && window.PawScribeAudio.isDictating()) {
        window.PawScribeAudio.stopDictation();
        dictateBtn.textContent = "Dictate";
        return;
      }
      if (!window.PawScribeAudio) { $("audio-status").textContent = "Dictation is not available — paste your notes instead."; return; }
      window.PawScribeAudio.startDictation({
        onStart: function () { dictateBtn.textContent = "Stop dictating"; },
        onResult: function (text) {
          var input = $("rough-input");
          input.value = (input.value ? input.value + " " : "") + text;
          autogrow(input);
        },
        onEnd: function () { dictateBtn.textContent = "Dictate"; },
        onError: function (msg) { $("audio-status").textContent = msg; dictateBtn.textContent = "Dictate"; }
      });
    });
    var recordBtn = $("record-btn");
    if (recordBtn) recordBtn.addEventListener("click", function () {
      if (!window.PawScribeAudio) { $("audio-status").textContent = "Recording is not available in this browser — paste your notes instead."; return; }
      if (window.PawScribeAudio.isRecording()) {
        window.PawScribeAudio.stopRecording();
        recordBtn.textContent = "Record";
        return;
      }
      window.PawScribeAudio.startRecording({
        onStart: function () { recordBtn.textContent = "Stop recording"; $("record-status").textContent = "Recording… 0:00"; },
        onTick: function (dur) { $("record-status").textContent = "Recording… " + dur; },
        onStop: function (blob, dur) {
          recordBtn.textContent = "Record";
          $("record-status").textContent = "Recording captured (" + dur + ") — kept in this browser only.";
          var status = $("audio-status");
          status.textContent = "";
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "pawscribe-recording.webm";
          a.textContent = "Download recording";
          a.className = "btn btn-ghost";
          status.appendChild(a);
          status.appendChild(document.createTextNode(" Transcription is not connected — dictate or paste your notes to draft."));
          /* Hand the blob to ai.js: with no Worker connected this resolves
             not_connected and nothing leaves the browser. */
          window.PawScribeAudio.transcribeBlob(blob).then(function (res) {
            if (res && res.ok && res.text) {
              var input = $("rough-input");
              input.value = (input.value ? input.value + "\n" : "") + res.text;
              autogrow(input);
              toast("Recording transcribed into your rough notes.");
            }
          });
        },
        onError: function (msg) { $("audio-status").textContent = msg; recordBtn.textContent = "Record"; }
      });
    });

    /* ---------- quota display + banner ----------
       The banner is shown ONLY when the limit is reached (used >= limit).
       At 0 / 5 it MUST stay hidden: banner.hidden = !quotaReached(). */
    function refreshQuota() {
      if (!window.PawScribe) return false;
      var q = window.PawScribe.getQuota();
      var limit = window.PawScribe.quotaLimit();
      var counter = $("quota-counter");
      if (counter) counter.textContent = "AI notes used this month: " + q.used + " / " + limit;
      var reached = window.PawScribe.quotaReached();
      var banner = $("quota-banner");
      if (banner) banner.hidden = !reached;
      var gen = $("generate-btn");
      if (gen) gen.disabled = reached;
      return reached;
    }
    refreshQuota();

    /* ---------- format (local, no AI) ---------- */
    var formatBtn = $("format-btn");
    if (formatBtn) formatBtn.addEventListener("click", function () {
      var text = $("rough-input").value.trim();
      if (!text) { $("ai-status").textContent = "Paste or dictate some rough notes first."; return; }
      setDraft(formatRoughNotes(text), false);
      $("ai-status").textContent = "Draft formatted from your notes — review every line before saving.";
      showPanel("draft");
    });

    /* ---------- AI generate ---------- */
    var generateBtn = $("generate-btn");
    if (generateBtn) generateBtn.addEventListener("click", async function () {
      var status = $("ai-status");
      if (window.PawScribe && window.PawScribe.quotaReached()) { refreshQuota(); return; }
      var text = $("rough-input").value.trim();
      if (!text) { status.textContent = "Paste or dictate some rough notes first."; return; }
      var workerUrl = (window.PAWSCRIBE_CONFIG && window.PAWSCRIBE_CONFIG.WORKER_URL) || "";
      var byok = window.PawScribeAI && window.PawScribeAI.getByokKey ? window.PawScribeAI.getByokKey() : "";
      if (!workerUrl && !byok) {
        /* No drafting service is connected, so there is nothing to wait
           for — show the honest state immediately, with no fake loading
           and no simulated draft. */
        status.textContent = "AI drafting connects soon — the free templates work now.";
        return;
      }
      status.textContent = "Contacting the drafting service…";
      var result;
      try {
        result = await window.PawScribeAI.draftWithAI(text);
      } catch (e) {
        status.textContent = "Could not reach the drafting service — check your connection and try again. The free templates work now.";
        return;
      }
      if (result && result.ok) {
        window.PawScribe.incrementQuota();
        setDraft(result.soap, true);
        status.textContent = "";
        refreshQuota();
        showPanel("draft");
        toast("AI draft ready — review every line before saving.");
      } else if (result && result.status === "empty") {
        status.textContent = "Paste or dictate some rough notes first.";
      } else {
        status.textContent = "AI drafting connects soon — the free templates work now.";
      }
    });

    /* ---------- BYOK settings (optional, local only) ---------- */
    var byokInput = $("byok-key");
    var byokSave = $("byok-save");
    var byokClear = $("byok-clear");
    var byokStatus = $("byok-status");
    if (byokInput && window.PawScribeAI) {
      if (window.PawScribeAI.getByokKey()) byokInput.value = "••••••••";
      if (byokSave) byokSave.addEventListener("click", function () {
        var v = byokInput.value.trim();
        if (!v || v === "••••••••") { if (byokStatus) byokStatus.textContent = "Paste your own Gemini key to save it, or leave it blank."; return; }
        window.PawScribeAI.setByokKey(v);
        byokInput.value = "••••••••";
        if (byokStatus) byokStatus.textContent = "Key saved in this browser only.";
      });
      if (byokClear) byokClear.addEventListener("click", function () {
        window.PawScribeAI.setByokKey("");
        byokInput.value = "";
        if (byokStatus) byokStatus.textContent = "Key removed.";
      });
    }

    /* ---------- Copy & export ---------- */
    function noteText() { return formatSoapText(getSoap()); }
    var copyBtn = $("copy-btn");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      if (!hasDraft()) { toast("Nothing to copy yet."); return; }
      var done = function () { toast("SOAP note copied."); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(noteText()).then(done, function () { toast("Copy did not work in this browser — select the draft text instead."); });
      } else { toast("Copy is not supported in this browser — select the draft text instead."); }
    });
    var downloadBtn = $("download-btn");
    if (downloadBtn) downloadBtn.addEventListener("click", function () {
      if (!hasDraft()) { toast("Nothing to download yet."); return; }
      download("pawscribe-soap-note.txt", noteText());
      toast("Note downloaded.");
    });
    var newBtn = $("new-btn");
    if (newBtn) newBtn.addEventListener("click", function () {
      $("rough-input").value = "";
      autogrow($("rough-input"));
      setDraft({ S: "", O: "", A: "", P: "" }, false);
      $("ai-status").textContent = "";
      var saveStatus = $("save-status");
      if (saveStatus) saveStatus.textContent = "";
      if (picker) picker.value = "";
      showPanel("input");
    });

    /* ---------- history ---------- */
    function loadNotes() {
      try {
        var raw = localStorage.getItem(NOTES_KEY);
        var notes = raw ? JSON.parse(raw) : [];
        return Array.isArray(notes) ? notes : [];
      } catch (e) { return []; }
    }
    function storeNotes(notes) {
      try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch (e) { /* storage unavailable */ }
    }
    function renderHistory() {
      var list = $("note-history");
      if (!list) return;
      list.textContent = "";
      var notes = loadNotes();
      var empty = $("history-empty");
      if (empty) empty.hidden = notes.length > 0;
      var isFree = window.PawScribe && window.PawScribe.getPlan() === "free";
      var lockNote = $("history-lock-note");
      if (lockNote) lockNote.hidden = !(isFree && notes.length >= FREE_HISTORY_CAP);
      notes.slice().reverse().forEach(function (note) {
        var item = document.createElement("div");
        item.className = "history-item";
        var title = document.createElement("p");
        var date = note.savedAt ? new Date(note.savedAt).toLocaleString() : "Undated";
        title.textContent = date + " — " + (note.soap.S || "").slice(0, 80);
        var loadBtn = document.createElement("button");
        loadBtn.className = "btn btn-ghost";
        loadBtn.type = "button";
        loadBtn.textContent = "Load";
        loadBtn.addEventListener("click", function () {
          setDraft(note.soap, true);
          showPanel("draft");
          toast("Note loaded — review before saving.");
        });
        var delBtn = document.createElement("button");
        delBtn.className = "btn btn-ghost";
        delBtn.type = "button";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", function () {
          storeNotes(loadNotes().filter(function (n) { return n.id !== note.id; }));
          renderHistory();
          toast("Note deleted.");
        });
        item.appendChild(title);
        item.appendChild(loadBtn);
        item.appendChild(delBtn);
        list.appendChild(item);
      });
    }
    var saveBtn = $("save-btn");
    if (saveBtn) saveBtn.addEventListener("click", function () {
      if (!hasDraft()) { $("save-status").textContent = "Nothing to save yet — write or load a draft first."; return; }
      var notes = loadNotes();
      notes.push({
        id: "note-" + Date.now(),
        savedAt: new Date().toISOString(),
        templateId: picker ? picker.value : "",
        soap: getSoap()
      });
      var isFree = window.PawScribe && window.PawScribe.getPlan() === "free";
      if (isFree && notes.length > FREE_HISTORY_CAP) {
        notes = notes.slice(-FREE_HISTORY_CAP);
        $("save-status").textContent = "Saved. Free keeps your last 10 notes — full note history is Pro.";
      } else {
        if (notes.length > HISTORY_CAP) notes = notes.slice(-HISTORY_CAP);
        $("save-status").textContent = "Saved in this browser.";
      }
      storeNotes(notes);
      renderHistory();
      toast("Note saved.");
    });
    function exportAll() {
      download("pawscribe-notes.json", JSON.stringify(loadNotes(), null, 2), "application/json");
      toast("Notes exported as JSON.");
    }
    var exportBtn = $("export-btn");
    if (exportBtn) exportBtn.addEventListener("click", exportAll);
    var exportAllBtn = $("export-all-btn");
    if (exportAllBtn) exportAllBtn.addEventListener("click", exportAll);
    renderHistory();

    /* ---------- discharge instructions (Pro only) ---------- */
    var dischargeBox = $("discharge-box");
    var dischargeLock = $("discharge-lock");
    if (window.PawScribe && window.PawScribe.isPro()) {
      if (dischargeBox) dischargeBox.hidden = false;
    } else if (dischargeLock) {
      dischargeLock.hidden = false;
    }
    var dischargeBuild = $("discharge-build-btn");
    if (dischargeBuild) dischargeBuild.addEventListener("click", function () {
      var plan = $("soap-p").value.trim() || "Not recorded";
      $("discharge-text").value =
        "Home care instructions\n\n" +
        "Follow the plan your veterinarian discussed with you:\n" + plan +
        "\n\nCall the clinic if you notice vomiting, loss of appetite, swelling, bleeding, or if your pet seems worse in any way.";
      autogrow($("discharge-text"));
    });
    var dischargeCopy = $("discharge-copy-btn");
    if (dischargeCopy) dischargeCopy.addEventListener("click", function () {
      var text = $("discharge-text").value;
      if (!text.trim()) { toast("Build the instructions first."); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast("Instructions copied."); });
      }
    });

    refreshEmptyState();
  });
})();
