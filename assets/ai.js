/* PawScribe AI drafting — assets/ai.js.
   draftWithAI(text) POSTs {text} to WORKER_URL from window.PAWSCRIBE_CONFIG.
   If WORKER_URL is empty or the request fails, it returns
   {ok:false, reason:"not-configured"} and the UI shows the honest state
   "AI drafting connects soon — the free templates work now."
   A draft is NEVER faked: no simulated note, no fake loading-to-success,
   no client-side generated AI note. A draft only ever comes back from
   a real Worker response shaped {soap:{S,O,A,P}}.
   BYOK: if localStorage key pawscribe_byok_key_v1 is set, ai.js may call
   the Gemini API directly with that key (see the byok branch below). */
(function () {
  "use strict";

  function config() {
    return window.PAWSCRIBE_CONFIG || {};
  }

  function notConfigured() {
    return { ok: false, reason: "not-configured" };
  }

  function validSoap(soap) {
    return soap && typeof soap === "object" &&
      typeof soap.S === "string" && typeof soap.O === "string" &&
      typeof soap.A === "string" && typeof soap.P === "string";
  }

  /* BYOK branch: the vet's own Gemini key, stored only in their browser
     under pawscribe_byok_key_v1, is sent to Google's Gemini API directly.
     The key is never sent to PawScribe and never stored anywhere else. */
  async function draftWithByok(text, key) {
    var model = config().MODEL_NAME || "gemini-3.8-flash";
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);
    var prompt = "You are a veterinary scribe. Turn these rough consultation notes into a SOAP note " +
      "with sections S, O, A, P. Use only facts present in the notes; write [not stated] where " +
      "information is missing. Reply with JSON only: {\"S\":\"...\",\"O\":\"...\",\"A\":\"...\",\"P\":\"...\"}.\n\nNotes:\n" + text;
    var res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) return notConfigured();
    var data = await res.json();
    var raw = data && data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (!raw) return notConfigured();
    var soap;
    try { soap = JSON.parse(raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "")); } catch (e) { return notConfigured(); }
    if (!validSoap(soap)) return notConfigured();
    return { ok: true, soap: soap };
  }

  async function draftWithAI(text) {
    var clean = (text || "").trim();
    if (!clean) return { ok: false, reason: "empty" };

    var byokKey = null;
    try { byokKey = localStorage.getItem("pawscribe_byok_key_v1"); } catch (e) { byokKey = null; }
    if (byokKey) {
      try { return await draftWithByok(clean, byokKey); } catch (e) { return notConfigured(); }
    }

    var workerUrl = config().WORKER_URL || "";
    if (!workerUrl) return notConfigured();
    try {
      var res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean })
      });
      if (!res.ok) return notConfigured();
      var data = await res.json();
      if (!data || !validSoap(data.soap)) return notConfigured();
      return { ok: true, soap: data.soap };
    } catch (e) {
      return notConfigured();
    }
  }

  window.PawScribeAI = { draftWithAI: draftWithAI };
})();
