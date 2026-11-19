/* PawScribe — PayPal subscriptions (pricing page only).
   Loads the PayPal JS SDK (intent=subscription, vault=true) and renders gold
   Subscribe buttons into #paypal-button-pro and #paypal-button-clinic.
   Client ID and plan IDs come from window.PAWSCRIBE_CONFIG (assets/config.js);
   the literals below are the same public values, used only as a fallback.
   There is no secret anywhere in this file — the client ID is publishable.
   On approval the plan is saved in this browser only (localStorage). */

(function () {
  "use strict";

  var cfg = window.PAWSCRIBE_CONFIG || {};
  var CLIENT_ID =
    cfg.PAYPAL_CLIENT_ID ||
    "BAA0XtEcw_7ytsbPiGXV89Px7Mvg3Q-PPGSqCFRBxlWGuze6PX5pvx3Wdoe5179wQ3Iyp5xfdzVmfmhAiQ";
  var PLAN_PRO = cfg.PLAN_PRO || "P-6DR93662N94969427NL7RSYA";
  var PLAN_CLINIC = cfg.PLAN_CLINIC || "P-9A906577SH928721FNL7RSYA";

  var PLAN_KEY = "pawscribe_plan_v1";
  var SUBSCRIPTION_KEY = "pawscribe_subscription_v1";

  var SDK_URL =
    "https://www.paypal.com/sdk/js?client-id=" +
    encodeURIComponent(CLIENT_ID) +
    "&intent=subscription&vault=true&currency=USD";

  function showMessage(container, text) {
    if (!container) return;
    container.innerHTML = "";
    var p = document.createElement("p");
    p.setAttribute("role", "status");
    p.textContent = text;
    container.appendChild(p);
  }

  function onApprove(planName, planId) {
    return function (data) {
      var record = {
        subscriptionID: data.subscriptionID,
        plan_id: planId,
        date: new Date().toISOString()
      };
      try {
        /* Plain string in pawscribe_plan_v1: assets/app.js getPlan() only
           recognises exactly "pro" or "clinic", so this is what unlocks the
           plan and its note quota in the workspace. The full subscription
           record (ID, plan, date) is kept alongside it. */
        localStorage.setItem(PLAN_KEY, planName);
        localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(record));
      } catch (e) {
        /* Storage unavailable (e.g. private mode): the subscription still
           exists in PayPal; the plan just cannot be remembered here. */
      }
      var proEl = document.getElementById("paypal-button-pro");
      var clinicEl = document.getElementById("paypal-button-clinic");
      if (planName === "pro") {
        showMessage(
          proEl,
          "You're on Pro \u2014 your plan is saved in this browser only."
        );
      } else {
        showMessage(
          clinicEl,
          "You're on Clinic \u2014 your plan is saved in this browser only."
        );
      }
      if (window.PawScribe && window.PawScribe.showToast) {
        window.PawScribe.showToast(
          "Subscribed. Your plan is saved in this browser only."
        );
      }
    };
  }

  function onError(container) {
    return function () {
      showMessage(
        container,
        "Something went wrong with PayPal. Please try again \u2014 you have not been charged."
      );
    };
  }

  function renderButton(containerId, planName, planId, successPlan) {
    var container = document.getElementById(containerId);
    if (!container || !window.paypal || !window.paypal.Buttons) return;
    try {
      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "subscribe"
          },
          createSubscription: function (data, actions) {
            return actions.subscription.create({ plan_id: planId });
          },
          onApprove: onApprove(successPlan, planId),
          onError: onError(container)
        })
        .render("#" + containerId);
    } catch (e) {
      showMessage(
        container,
        "PayPal could not load the Subscribe button. Please refresh the page and try again \u2014 you have not been charged."
      );
    }
  }

  function loadSdk() {
    return new Promise(function (resolve, reject) {
      if (window.paypal && window.paypal.Buttons) {
        resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = function () {
        if (window.paypal && window.paypal.Buttons) resolve();
        else reject(new Error("PayPal SDK loaded without Buttons."));
      };
      script.onerror = function () {
        reject(new Error("PayPal SDK failed to load."));
      };
      document.head.appendChild(script);
    });
  }

  function init() {
    var hasPro = !!document.getElementById("paypal-button-pro");
    var hasClinic = !!document.getElementById("paypal-button-clinic");
    if (!hasPro && !hasClinic) return;
    loadSdk()
      .then(function () {
        if (hasPro) renderButton("paypal-button-pro", "pro", PLAN_PRO, "pro");
        if (hasClinic)
          renderButton("paypal-button-clinic", "clinic", PLAN_CLINIC, "clinic");
      })
      .catch(function () {
        showMessage(
          document.getElementById("paypal-button-pro"),
          "PayPal could not be loaded. Check your connection and try again \u2014 you have not been charged."
        );
        showMessage(
          document.getElementById("paypal-button-clinic"),
          "PayPal could not be loaded. Check your connection and try again \u2014 you have not been charged."
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
