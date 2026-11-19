/* PawScribe v2 — shared site JS. No external requests.
   Theme: html[data-theme], default follows prefers-color-scheme,
   persisted in localStorage under pawscribe_theme_v1.
   Auth state: localStorage pawscribe_user_v1 (JSON, { firstName, ... }).
   FAB is hidden on app.html and dashboard.html. */
(function () {
  "use strict";

  var THEME_KEY = "pawscribe_theme_v1";
  var USER_KEY = "pawscribe_user_v1";

  /* ---------- Theme ---------- */
  function currentTheme() {
    try {
      var saved = window.localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") { return saved; }
    } catch (e) { /* storage unavailable: fall through to system default */ }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      var moon = btn.querySelector("[data-icon-moon]");
      var sun = btn.querySelector("[data-icon-sun]");
      /* NOTE: the icons are <svg> elements, and the `hidden` IDL property
         does not reflect to the attribute on SVG elements — toggling the
         property alone would not hide them. Use attributes instead. */
      if (moon) { if (theme === "dark") { moon.setAttribute("hidden", ""); } else { moon.removeAttribute("hidden"); } }
      if (sun) { if (theme !== "dark") { sun.setAttribute("hidden", ""); } else { sun.removeAttribute("hidden"); } }
    }
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { window.localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    applyTheme(next);
  }

  /* ---------- Textarea auto-grow (no internal scroll) ---------- */
  function autogrow(ta) {
    if (!ta) { return; }
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }

  function bindAutogrow(scope) {
    var tas = (scope || document).querySelectorAll("textarea[data-autogrow], textarea.autogrow");
    Array.prototype.forEach.call(tas, function (ta) {
      autogrow(ta);
      ta.addEventListener("input", function () { autogrow(ta); });
    });
  }

  /* ---------- Mobile menu ---------- */
  function bindMenu() {
    var toggle = document.getElementById("menu-toggle");
    var nav = document.getElementById("mobile-nav");
    if (!toggle || !nav) { return; }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      var iconMenu = toggle.querySelector("[data-icon-menu]");
      var iconClose = toggle.querySelector("[data-icon-close]");
      /* SVG elements: toggle the attribute, not the property (see theme). */
      if (iconMenu) { if (open) { iconMenu.setAttribute("hidden", ""); } else { iconMenu.removeAttribute("hidden"); } }
      if (iconClose) { if (!open) { iconClose.setAttribute("hidden", ""); } else { iconClose.removeAttribute("hidden"); } }
    });
    nav.addEventListener("click", function (e) {
      if (e.target && e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        var iconMenu = toggle.querySelector("[data-icon-menu]");
        var iconClose = toggle.querySelector("[data-icon-close]");
        if (iconMenu) { iconMenu.removeAttribute("hidden"); }
        if (iconClose) { iconClose.setAttribute("hidden", ""); }
      }
    });
  }

  /* ---------- Header auth state ---------- */
  function readUser() {
    try {
      var raw = window.localStorage.getItem(USER_KEY);
      if (!raw) { return null; }
      var user = JSON.parse(raw);
      if (user && typeof user === "object") { return user; }
    } catch (e) { /* bad JSON: treat as logged out */ }
    return null;
  }

  function applyAuthState() {
    var user = readUser();
    var loggedOut = document.querySelectorAll("[data-auth-logged-out]");
    var loggedIn = document.querySelectorAll("[data-auth-logged-in]");
    var nameEls = document.querySelectorAll("[data-user-first-name]");
    if (user) {
      var firstName = user.firstName || user.name || "";
      if (firstName) { firstName = String(firstName).split(" ")[0]; }
      Array.prototype.forEach.call(nameEls, function (el) { el.textContent = firstName; });
      Array.prototype.forEach.call(loggedOut, function (el) { el.hidden = true; });
      Array.prototype.forEach.call(loggedIn, function (el) { el.hidden = false; });
    } else {
      Array.prototype.forEach.call(loggedOut, function (el) { el.hidden = false; });
      Array.prototype.forEach.call(loggedIn, function (el) { el.hidden = true; });
    }
  }

  /* ---------- FAB: hidden on the app and dashboard ---------- */
  function applyFabRule() {
    var fab = document.getElementById("contact-fab");
    if (!fab) { return; }
    var page = window.location.pathname.split("/").pop().toLowerCase();
    if (page === "app.html" || page === "dashboard.html") {
      fab.hidden = true;
    }
  }

  /* ---------- Tiny toast ---------- */
  var toastTimer = null;
  function toast(message) {
    var el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    if (toastTimer) { window.clearTimeout(toastTimer); }
    toastTimer = window.setTimeout(function () { el.classList.remove("show"); }, 3000);
  }

  /* ---------- Init ---------- */
  function init() {
    applyTheme(currentTheme());
    var themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) { themeBtn.addEventListener("click", toggleTheme); }
    bindMenu();
    bindAutogrow(document);
    applyAuthState();
    applyFabRule();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ---------- Plan + AI quota (local, honest) ----------
     Plan lives in localStorage pawscribe_plan_v1 ("free" | "pro" |
     "clinic", written by paypal.js onApprove; a JSON subscription
     record under the same key is tolerated). AI usage is counted
     per calendar month in pawscribe_ai_used_v1 and resets monthly.
     Limits: free 5, pro 400, clinic 2000 AI notes / month. */
  var PLAN_KEY = "pawscribe_plan_v1";
  var AI_USED_KEY = "pawscribe_ai_used_v1";
  var QUOTA_LIMITS = { free: 5, pro: 400, clinic: 2000 };

  function getPlan() {
    try {
      var p = window.localStorage.getItem(PLAN_KEY);
      if (p === "pro" || p === "clinic") { return p; }
      if (p) {
        try {
          var rec = JSON.parse(p);
          if (rec && (rec.plan === "pro" || rec.plan === "clinic")) { return rec.plan; }
        } catch (e) { /* not JSON: fall through to free */ }
      }
    } catch (e) { /* storage unavailable */ }
    return "free";
  }

  function quotaLimit() { return QUOTA_LIMITS[getPlan()] || 5; }

  function currentMonthKey() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
  }

  function getQuota() {
    try {
      var raw = window.localStorage.getItem(AI_USED_KEY);
      if (raw) {
        var rec = JSON.parse(raw);
        if (rec && rec.month === currentMonthKey() && typeof rec.count === "number") {
          return { used: rec.count, month: rec.month };
        }
      }
    } catch (e) { /* storage unavailable or corrupt */ }
    return { used: 0, month: currentMonthKey() };
  }

  function quotaReached() { return getQuota().used >= quotaLimit(); }

  function incrementQuota() {
    var q = getQuota();
    try {
      window.localStorage.setItem(AI_USED_KEY, JSON.stringify({ count: q.used + 1, month: q.month }));
    } catch (e) { /* storage unavailable */ }
    return q.used + 1;
  }

  function isPro() { var p = getPlan(); return p === "pro" || p === "clinic"; }

  /* Public helpers for page scripts. */
  window.PawScribe = window.PawScribe || {};
  window.PawScribe.autogrow = autogrow;
  window.PawScribe.toast = toast;
  window.PawScribe.showToast = toast;
  window.PawScribe.toggleTheme = toggleTheme;
  window.PawScribe.readUser = readUser;
  window.PawScribe.getPlan = getPlan;
  window.PawScribe.quotaLimit = quotaLimit;
  window.PawScribe.getQuota = getQuota;
  window.PawScribe.quotaReached = quotaReached;
  window.PawScribe.incrementQuota = incrementQuota;
  window.PawScribe.isPro = isPro;
})();
