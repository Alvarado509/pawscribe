/* PawScribe — PayPal subscriptions (pricing page, checkout modal).
   Clicking "Start Pro" / "Start Clinic" opens a modal (overlay + dialog)
   with the REAL PayPal subscription button. The PayPal JS SDK is loaded
   with disable-funding=credit (no PayPal Credit). createSubscription
   uses the plan IDs from window.PAWSCRIBE_CONFIG only — there are NO
   hard-coded plan IDs or client IDs anywhere in this file.
   On approval the plan is saved in this browser only (localStorage
   pawscribe_plan_v1 + pawscribe_subscription_v1) and the modal shows a
   success state with a link to the dashboard.
   The SDK needs network access: if it fails to load (offline, sandbox),
   the modal shows a clear error state and nobody is charged. */
(function () {
  "use strict";

  var PLAN_KEY = "pawscribe_plan_v1";
  var SUBSCRIPTION_KEY = "pawscribe_subscription_v1";

  function config() {
    return window.PAWSCRIBE_CONFIG || {};
  }

  function planIdFor(plan) {
    if (plan === "pro") return config().PLAN_PRO || "";
    if (plan === "clinic") return config().PLAN_CLINIC || "";
    return "";
  }

  function sdkUrl() {
    var clientId = config().PAYPAL_CLIENT_ID || "";
    if (!clientId) return "";
    return "https://www.paypal.com/sdk/js?client-id=" +
      encodeURIComponent(clientId) +
      "&intent=subscription&vault=true&currency=USD&disable-funding=credit";
  }

  var sdkPromise = null;
  var rendered = { pro: false, clinic: false };

  function loadSdk() {
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(function (resolve, reject) {
      if (window.paypal && window.paypal.Buttons) { resolve(); return; }
      var url = sdkUrl();
      if (!url) { reject(new Error("PayPal is not configured.")); return; }
      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = function () {
        if (window.paypal && window.paypal.Buttons) resolve();
        else reject(new Error("PayPal SDK loaded without Buttons."));
      };
      script.onerror = function () { reject(new Error("PayPal SDK failed to load.")); };
      document.head.appendChild(script);
    });
    return sdkPromise;
  }

  function showMessage(container, text) {
    if (!container) return;
    container.innerHTML = "";
    var p = document.createElement("p");
    p.setAttribute("role", "status");
    p.textContent = text;
    container.appendChild(p);
  }

  function planLabel(plan) {
    return plan === "clinic" ? "Clinic" : "Pro";
  }

  function renderButton(plan) {
    var containerId = "paypal-button-" + plan;
    var container = document.getElementById(containerId);
    if (!container || rendered[plan]) return;
    var planId = planIdFor(plan);
    if (!planId || !window.paypal || !window.paypal.Buttons) {
      showMessage(container, "PayPal could not be loaded. Check your connection and try again — you have not been charged.");
      return;
    }
    try {
      window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "subscribe" },
        createSubscription: function (data, actions) {
          return actions.subscription.create({ plan_id: planId });
        },
        onApprove: function (data) {
          var record = {
            subscriptionID: data.subscriptionID,
            plan_id: planId,
            plan: plan,
            date: new Date().toISOString()
          };
          try {
            localStorage.setItem(PLAN_KEY, plan);
            localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(record));
          } catch (e) { /* storage unavailable: the subscription still exists in PayPal */ }
          var box = document.getElementById("paypal-success-" + plan);
          var btnBox = document.getElementById(containerId);
          if (btnBox) btnBox.hidden = true;
          if (box) {
            box.hidden = false;
            var msg = box.querySelector("[data-success-text]");
            if (msg) msg.textContent = "You're on " + planLabel(plan) + " — your plan is saved in this browser only.";
          }
          if (window.PawScribe && window.PawScribe.showToast) {
            window.PawScribe.showToast("Subscribed. Your plan is saved in this browser only.");
          }
        },
        onError: function () {
          showMessage(container, "Something went wrong with PayPal. Please try again — you have not been charged.");
        }
      }).render("#" + containerId);
      rendered[plan] = true;
    } catch (e) {
      showMessage(container, "PayPal could not load the Subscribe button. Please try again — you have not been charged.");
    }
  }

  /* ---------- modal ---------- */
  var currentPlan = null;
  var lastFocus = null;

  function modal() { return document.getElementById("paypal-modal"); }
  function overlay() { return document.getElementById("paypal-modal-overlay"); }

  function openCheckout(plan) {
    if (plan !== "pro" && plan !== "clinic") return;
    currentPlan = plan;
    var m = modal();
    var o = overlay();
    if (!m || !o) return;
    lastFocus = document.activeElement;
    document.querySelectorAll("[data-paypal-plan-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-paypal-plan-panel") !== plan;
    });
    var title = document.getElementById("paypal-modal-title");
    if (title) title.textContent = "Subscribe to " + planLabel(plan);
    var container = document.getElementById("paypal-button-" + plan);
    var success = document.getElementById("paypal-success-" + plan);
    if (success) success.hidden = true;
    if (container) {
      container.hidden = false;
      if (!rendered[plan]) container.innerHTML = "<p role=\"status\">Loading PayPal…</p>";
    }
    o.hidden = false;
    m.hidden = false;
    document.body.style.overflow = "hidden";
    loadSdk().then(function () {
      if (currentPlan === plan) renderButton(plan);
    }).catch(function () {
      showMessage(container, "PayPal could not be loaded. Check your connection and try again — you have not been charged.");
    });
    var closeBtn = m.querySelector("[data-paypal-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeCheckout() {
    var m = modal();
    var o = overlay();
    if (m) m.hidden = true;
    if (o) o.hidden = true;
    document.body.style.overflow = "";
    currentPlan = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    document.querySelectorAll("[data-checkout-plan]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openCheckout(btn.getAttribute("data-checkout-plan"));
      });
    });
    var m = modal();
    if (!m) return;
    m.querySelectorAll("[data-paypal-close]").forEach(function (btn) {
      btn.addEventListener("click", closeCheckout);
    });
    var o = overlay();
    if (o) o.addEventListener("click", closeCheckout);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && m && !m.hidden) closeCheckout();
    });
  }

  window.PawScribePayPal = { openCheckout: openCheckout, closeCheckout: closeCheckout };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
