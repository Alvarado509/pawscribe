/* PawScribe shared site JS — no external requests.
   Theme: html[data-theme], default follows prefers-color-scheme,
   persisted in localStorage under pawscribe_theme_v1.
   Plan: localStorage pawscribe_plan_v1 ("free" | "pro" | "clinic").
   AI quota: localStorage pawscribe_ai_notes_v1 as {month:"2026-11", used:0}. */
(function () {
  "use strict";

  var THEME_KEY = "pawscribe_theme_v1";
  var PLAN_KEY = "pawscribe_plan_v1";
  var QUOTA_KEY = "pawscribe_ai_notes_v1";

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }
  var storedTheme = null;
  try { storedTheme = localStorage.getItem(THEME_KEY); } catch (e) { storedTheme = null; }
  var initialTheme = storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(initialTheme);
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
      applyTheme(next);
    });
  });

  /* ---------- toast ---------- */
  function showToast(message) {
    var toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.hidden = true; }, 3500);
  }

  /* ---------- plan helpers ---------- */
  function getPlan() {
    try {
      var p = localStorage.getItem(PLAN_KEY);
      if (p === "pro" || p === "clinic") return p;
      /* Also accept a stored JSON record {plan:"pro",...} so a paying
         user is never stuck on Free if the stored shape changes. */
      if (p && p.charAt(0) === "{") {
        var rec = JSON.parse(p);
        if (rec && (rec.plan === "pro" || rec.plan === "clinic")) return rec.plan;
      }
    } catch (e) { /* storage unavailable */ }
    return "free";
  }
  function isPro() { return getPlan() === "pro" || getPlan() === "clinic"; }
  function isClinic() { return getPlan() === "clinic"; }

  /* ---------- quota helpers ---------- */
  function currentMonth() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }
  function quotaLimit() {
    var plan = getPlan();
    if (plan === "clinic") return 2000;
    if (plan === "pro") return 400;
    return 5;
  }
  function getQuota() {
    var month = currentMonth();
    try {
      var raw = localStorage.getItem(QUOTA_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.month === month && typeof data.used === "number") return data;
      }
    } catch (e) { /* storage unavailable or corrupt */ }
    return { month: month, used: 0 };
  }
  function saveQuota(data) {
    try { localStorage.setItem(QUOTA_KEY, JSON.stringify(data)); } catch (e) { /* storage unavailable */ }
  }
  function incrementQuota() {
    var q = getQuota();
    q.used += 1;
    saveQuota(q);
    return q;
  }
  function quotaRemaining() {
    return Math.max(0, quotaLimit() - getQuota().used);
  }
  function quotaReached() {
    return getQuota().used >= quotaLimit();
  }

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline support optional */ });
    });
  }

  window.PawScribe = {
    showToast: showToast,
    getPlan: getPlan,
    isPro: isPro,
    isClinic: isClinic,
    getQuota: getQuota,
    incrementQuota: incrementQuota,
    quotaRemaining: quotaRemaining,
    quotaReached: quotaReached,
    quotaLimit: quotaLimit,
    currentMonth: currentMonth
  };
})();
