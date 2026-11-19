/* PawScribe AI drafting — assets/ai.js.
   draftWithAI(text) POSTs {text, model} to WORKER_URL from
   window.PAWSCRIBE_CONFIG. WORKER_URL is empty in v2, so it returns
   {ok:false, status:"not_connected"} and the workspace shows the honest
   state "AI drafting connects soon — the free templates work now."
   A draft is NEVER faked: no simulated note, no fake loading-to-success,
   no client-side generated AI note. A draft only ever comes back from a
   real Worker response shaped {soap:{S,O,A,P}} (or {S,O,A,P} directly).
   When WORKER_URL is set, the request also carries deviceId (a random
   per-browser id, pawscribe_device_v1) and subscriptionId (from the
   PayPal record pawscribe_subscription_v1, when the user subscribed),
   so the Worker can enforce monthly quotas and verify the subscription
   server-side. The Worker answers 429 when the monthly cap is hit and
   402 when the subscription does not verify — both are surfaced honestly
   instead of falling back to "connects soon".
   BYOK (optional): the vet's own Gemini key, stored only in their browser
   under pawscribe_byok_key_v1, is sent to Google's Gemini API directly.
   The key is never sent to PawScribe and never stored anywhere else. */
(function () {
  "use strict";

  var BYOK_KEY = "pawscribe_byok_key_v1";

  function config() {
    return window.PAWSCRIBE_CONFIG || {};
  }

  function notConnected() {
    return { ok: false, status: "not_connected" };
  }

  function validSoap(soap) {
    return soap && typeof soap === "object" &&
      typeof soap.S === "string" && typeof soap.O === "string" &&
      typeof soap.A === "string" && typeof soap.P === "string";
  }

  function getByokKey() {
    try { return localStorage.getItem(BYOK_KEY) || ""; } catch (e) { return ""; }
  }

  /* Per-browser anonymous id for the Worker's free monthly quota.
     Random, no personal data, stored only in this browser. */
  var DEVICE_KEY = "pawscribe_device_v1";
  function getDeviceId() {
    try {
      var id = localStorage.getItem(DEVICE_KEY);
      if (!id) {
        id = (window.crypto && window.crypto.randomUUID)
          ? window.crypto.randomUUID()
          : ("dev-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e9).toString(36));
        localStorage.setItem(DEVICE_KEY, id);
      }
      return id;
    } catch (e) { return "anon"; }
  }

  /* PayPal subscription id, written by paypal.js onApprove — the Worker
     verifies it against live PayPal on every AI call. */
  function getSubscriptionId() {
    try {
      var raw = localStorage.getItem("pawscribe_subscription_v1");
      if (!raw) return "";
      var rec = JSON.parse(raw);
      return (rec && typeof rec.subscriptionID === "string") ? rec.subscriptionID : "";
    } catch (e) { return ""; }
  }

  function setByokKey(key) {
    try {
      if (key) localStorage.setItem(BYOK_KEY, key);
      else localStorage.removeItem(BYOK_KEY);
    } catch (e) { /* storage unavailable */ }
  }

  /* BYOK branch: direct call to Google's Gemini API with the vet's own key. */
  async function draftWithByok(text, key) {
    var model = config().MODEL_NAME || "gemini-3.8-flash";
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);
    var prompt = "You are a veterinary scribe. Turn these rough consultation notes into a SOAP note " +
      "with sections S, O, A, P. Use only facts present in the notes; write \"Not recorded\" where " +
      "information is missing. Reply with JSON only: {\"S\":\"...\",\"O\":\"...\",\"A\":\"...\",\"P\":\"...\"}.\n\nNotes:\n" + text;
    var res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) return notConnected();
    var data = await res.json();
    var raw = data && data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (!raw) return notConnected();
    var soap;
    try { soap = JSON.parse(String(raw).replace(/^```json\s*/i, "").replace(/```\s*$/, "")); } catch (e) { return notConnected(); }
    if (!validSoap(soap)) return notConnected();
    return { ok: true, status: "ok", soap: soap };
  }

  async function draftWithAI(text) {
    var clean = (text || "").trim();
    if (!clean) return { ok: false, status: "empty" };

    var byokKey = getByokKey();
    if (byokKey) {
      try { return await draftWithByok(clean, byokKey); } catch (e) { return notConnected(); }
    }

    var workerUrl = config().WORKER_URL || "";
    if (!workerUrl) return notConnected();
    try {
      var res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: clean,
          model: config().MODEL_NAME || "gemini-3.8-flash",
          deviceId: getDeviceId(),
          subscriptionId: getSubscriptionId()
        })
      });
      if (res.status === 429) return { ok: false, status: "limit_reached" };
      if (res.status === 402 || res.status === 403) return { ok: false, status: "subscription" };
      if (!res.ok) return notConnected();
      var data = await res.json();
      var soap = (data && data.soap) || data;
      if (!validSoap(soap)) return notConnected();
      return { ok: true, status: "ok", soap: soap };
    } catch (e) {
      return notConnected();
    }
  }

  /* Audio transcription: the recorded blob goes to the Worker when one is
     connected. With WORKER_URL empty this returns {status:"not_connected"}
     and nothing is uploaded anywhere. */
  async function transcribeAudio(blob) {
    if (!blob) return { ok: false, status: "empty" };
    var workerUrl = config().WORKER_URL || "";
    if (!workerUrl) return notConnected();
    try {
      var res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/webm" },
        body: blob
      });
      if (!res.ok) return notConnected();
      var data = await res.json();
      if (!data || typeof data.text !== "string" || !data.text.trim()) return notConnected();
      return { ok: true, status: "ok", text: data.text };
    } catch (e) {
      return notConnected();
    }
  }

  window.PawScribeAI = {
    draftWithAI: draftWithAI,
    transcribeAudio: transcribeAudio,
    getByokKey: getByokKey,
    setByokKey: setByokKey
  };
})();
