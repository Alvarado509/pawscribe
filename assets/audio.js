/* PawScribe audio — assets/audio.js.
   MediaRecorder capture (blob kept in memory only, never uploaded unless
   the drafting Worker is connected) and Web Speech API dictation.
   If recording or dictation is unsupported, the caller gets an honest
   message — nothing is faked. */
(function () {
  "use strict";

  /* ---------- recording (MediaRecorder) ---------- */
  var recorder = null;
  var chunks = [];
  var startedAt = 0;
  var tickTimer = null;

  function formatDuration(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  function recordingSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
      typeof window.MediaRecorder !== "undefined");
  }

  function startRecording(handlers) {
    handlers = handlers || {};
    if (!recordingSupported()) {
      if (handlers.onError) handlers.onError("Recording is not supported in this browser — paste your notes instead.");
      return;
    }
    if (recorder && recorder.state === "recording") return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        clearInterval(tickTimer);
        var blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (handlers.onStop) handlers.onStop(blob, formatDuration(Date.now() - startedAt));
      };
      recorder.start();
      startedAt = Date.now();
      if (handlers.onTick) {
        tickTimer = setInterval(function () {
          handlers.onTick(formatDuration(Date.now() - startedAt));
        }, 500);
      }
      if (handlers.onStart) handlers.onStart();
    }).catch(function () {
      if (handlers.onError) handlers.onError("Microphone access was denied. Check your browser permissions, or paste your notes instead.");
    });
  }

  function stopRecording() {
    if (recorder && recorder.state === "recording") recorder.stop();
  }

  function isRecording() {
    return !!(recorder && recorder.state === "recording");
  }

  /* Hand a recorded blob to ai.js for transcription. With no Worker
     connected this resolves {status:"not_connected"} and nothing leaves
     the browser. */
  function transcribeBlob(blob) {
    if (window.PawScribeAI && window.PawScribeAI.transcribeAudio) {
      return window.PawScribeAI.transcribeAudio(blob);
    }
    return Promise.resolve({ ok: false, status: "not_connected" });
  }

  /* ---------- dictation (Web Speech API) ---------- */
  var recognition = null;
  var dictating = false;

  function dictationSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function startDictation(handlers) {
    handlers = handlers || {};
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      if (handlers.onError) handlers.onError("Dictation is not supported in this browser — paste your notes instead.");
      return;
    }
    if (dictating) return;
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = function (e) {
      var text = "";
      for (var i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      if (handlers.onResult) handlers.onResult(text, e);
    };
    recognition.onerror = function (e) {
      dictating = false;
      if (handlers.onError) handlers.onError("Dictation stopped (" + (e.error || "error") + "). Your notes so far are kept — paste the rest instead.");
    };
    recognition.onend = function () {
      dictating = false;
      if (handlers.onEnd) handlers.onEnd();
    };
    try {
      recognition.start();
      dictating = true;
      if (handlers.onStart) handlers.onStart();
    } catch (e) {
      if (handlers.onError) handlers.onError("Dictation is not supported in this browser — paste your notes instead.");
    }
  }

  function stopDictation() {
    if (recognition && dictating) {
      try { recognition.stop(); } catch (e) { /* already stopped */ }
    }
    dictating = false;
  }

  function isDictating() { return dictating; }

  window.PawScribeAudio = {
    startRecording: startRecording,
    stopRecording: stopRecording,
    isRecording: isRecording,
    recordingSupported: recordingSupported,
    transcribeBlob: transcribeBlob,
    startDictation: startDictation,
    stopDictation: stopDictation,
    isDictating: isDictating,
    dictationSupported: dictationSupported
  };
})();
