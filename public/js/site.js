(function () {
  "use strict";

  /* Sticky header: switches look once the page is scrolled a little. */
  var header = document.getElementById("site-header");
  if (header) {
    var idle = (header.getAttribute("data-idle") || "").split(/\s+/).filter(Boolean);
    var scrolled = (header.getAttribute("data-scrolled") || "").split(/\s+/).filter(Boolean);
    var isScrolled = null;
    var onScroll = function () {
      var now = window.scrollY > 10;
      if (now === isScrolled) return;
      isScrolled = now;
      idle.forEach(function (c) { header.classList.toggle(c, !now); });
      scrolled.forEach(function (c) { header.classList.toggle(c, now); });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile menu */
  var menuButton = document.getElementById("mobile-menu-button");
  var menu = document.getElementById("mobile-menu");
  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      var open = menu.classList.contains("hidden");
      menu.classList.toggle("hidden", !open);
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      menuButton.querySelector("[data-icon-open]").classList.toggle("hidden", open);
      menuButton.querySelector("[data-icon-close]").classList.toggle("hidden", !open);
    });
  }

  /* "Visiting page..." progress bar and pill, shown while the next page loads. */
  var feedbackTimer = null;
  var feedbackNodes = [];
  var clearFeedback = function () {
    if (feedbackTimer) window.clearTimeout(feedbackTimer);
    feedbackTimer = null;
    feedbackNodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    feedbackNodes = [];
  };
  var startFeedback = function (href) {
    var url;
    try { url = new URL(href, window.location.href); } catch (e) { return; }
    if (url.origin !== window.location.origin) return;
    if (url.pathname + url.search === window.location.pathname + window.location.search) return;
    clearFeedback();
    var bar = document.createElement("div");
    bar.className = "navigation-progress";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", "Loading page");
    bar.innerHTML = "<span></span>";
    var pill = document.createElement("div");
    pill.className = "navigation-feedback";
    pill.setAttribute("role", "status");
    pill.setAttribute("aria-live", "polite");
    pill.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg><span>Visiting page...</span>';
    document.body.appendChild(bar);
    document.body.appendChild(pill);
    feedbackNodes = [bar, pill];
    feedbackTimer = window.setTimeout(clearFeedback, 15000);
  };
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var target = event.target;
    if (!(target instanceof Element)) return;
    var anchor = target.closest("a");
    if (!anchor || anchor.hasAttribute("download")) return;
    if (anchor.target && anchor.target !== "_self") return;
    if (!anchor.href) return;
    startFeedback(anchor.href);
  }, true);
  window.addEventListener("pageshow", function (event) { if (event.persisted) clearFeedback(); });
  window.addEventListener("app:navigation-start", function (event) { startFeedback(event.detail.href); });

  /* Search forms: ignore empty searches, trim the rest. */
  document.querySelectorAll("form[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : "";
      if (!value) { event.preventDefault(); return; }
      input.value = value;
      window.dispatchEvent(new CustomEvent("app:navigation-start", {
        detail: { href: form.getAttribute("action") + "?q=" + encodeURIComponent(value) }
      }));
    });
  });

  /* Visitor presence: tell the server this visitor is still here (public pages only). */
  if (document.body.getAttribute("data-presence") === "1") {
    var heartbeat = function () {
      if (document.visibilityState !== "visible") return;
      fetch("/api/presence", { method: "POST", cache: "no-store", credentials: "same-origin" })
        .then(function (response) {
          if (!response.ok) throw new Error("Presence request failed (" + response.status + ")");
        })
        .catch(function (error) { console.error("Could not update visitor presence:", error); });
    };
    heartbeat();
    window.setInterval(heartbeat, 60000);
    document.addEventListener("visibilitychange", heartbeat);
  }
})();
