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

  /* Pagination page selector dropdowns. */
  document.querySelectorAll("[data-pagination-select]").forEach(function (container) {
    var trigger = container.querySelector("[data-pagination-trigger]");
    var options = container.querySelector('[role="listbox"]');
    var activeOption = container.querySelector('[role="option"][aria-selected="true"]');
    var chevron = container.querySelector("[data-pagination-chevron]");
    if (!trigger || !options) return;

    var close = function () {
      trigger.setAttribute("aria-expanded", "false");
      options.classList.add("hidden");
      if (chevron) chevron.classList.remove("rotate-180");
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
    var closeOnOutsideClick = function (event) {
      if (!container.contains(event.target)) close();
    };
    var closeOnEscape = function (event) {
      if (event.key !== "Escape") return;
      close();
      trigger.focus();
    };

    trigger.addEventListener("click", function () {
      if (trigger.getAttribute("aria-expanded") === "true") {
        close();
        return;
      }

      trigger.setAttribute("aria-expanded", "true");
      options.classList.remove("hidden");
      if (chevron) chevron.classList.add("rotate-180");
      document.addEventListener("pointerdown", closeOnOutsideClick);
      document.addEventListener("keydown", closeOnEscape);
      if (activeOption) activeOption.scrollIntoView({ block: "nearest" });
    });
  });

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

  /* Offer details dialog and usage counter. */
  var offerDialog = document.getElementById("offer-dialog");
  if (offerDialog) {
    var offerFields = {
      image: offerDialog.querySelector("[data-offer-image]"),
      storeLogo: offerDialog.querySelector("[data-offer-store-logo]"),
      store: offerDialog.querySelector("[data-offer-store]"),
      title: offerDialog.querySelector("[data-offer-title]"),
      meta: offerDialog.querySelector("[data-offer-meta]"),
      codeWrap: offerDialog.querySelector("[data-offer-code-wrap]"),
      code: offerDialog.querySelector("[data-offer-code]"),
      description: offerDialog.querySelector("[data-offer-description]"),
      dealUsage: offerDialog.querySelector("[data-offer-deal-usage]"),
      status: offerDialog.querySelector("[data-offer-status]"),
      linkWrap: offerDialog.querySelector("[data-offer-link-wrap]"),
      linkStore: offerDialog.querySelector("[data-offer-link-store]"),
      link: offerDialog.querySelector("[data-offer-link]")
    };
    var activeOffer = null;
    var csrfToken = document.querySelector('meta[name="csrf-token"]');

    var openOffer = function (trigger) {
      activeOffer = trigger;
      var isCode = trigger.getAttribute("data-offer-type") === "code";
      var offerId = trigger.getAttribute("data-offer-id");
      var offerTitle = trigger.getAttribute("data-offer-title") || "";
      var storeName = trigger.getAttribute("data-offer-store") || "store";
      var affiliateLink = trigger.getAttribute("data-offer-affiliate") || "";
      var parsedAffiliate;
      var copyButton = offerDialog.querySelector("[data-offer-copy-button]");

      offerFields.image.src = trigger.getAttribute("data-offer-image") || "/placeholder.svg";
      offerFields.image.alt = offerTitle;
      offerFields.storeLogo.src = trigger.getAttribute("data-offer-store-logo") || "/placeholder.svg";
      offerFields.storeLogo.alt = "";
      offerFields.store.textContent = storeName;
      offerFields.title.textContent = offerTitle;
      offerFields.meta.textContent = [
        trigger.getAttribute("data-offer-expiry"),
        trigger.getAttribute("data-offer-verified") ? "Verified " + trigger.getAttribute("data-offer-verified") : ""
      ].filter(Boolean).join(" · ");
      offerFields.code.textContent = trigger.getAttribute("data-offer-code") || "";
      offerFields.codeWrap.hidden = !isCode;
      copyButton.hidden = !isCode;
      copyButton.classList.toggle("is-copied", false);
      offerFields.description.textContent = trigger.getAttribute("data-offer-description") || "";
      offerFields.description.hidden = !isCode || !offerFields.description.textContent;
      var usedCount = Number(trigger.getAttribute("data-offer-used") || 0);
      offerFields.dealUsage.textContent = isCode ? "" :
        usedCount + (usedCount === 1 ? " person has" : " people have") + " used this deal";
      offerFields.dealUsage.hidden = isCode;
      offerFields.status.textContent = "";
      offerFields.linkStore.textContent = storeName;
      offerFields.linkWrap.classList.remove("is-visible");

      if (affiliateLink) {
        try {
          parsedAffiliate = new URL(affiliateLink, window.location.origin);
          if (parsedAffiliate.protocol === "http:" || parsedAffiliate.protocol === "https:") {
            offerFields.link.href = parsedAffiliate.href;
            offerFields.linkWrap.classList.add("is-visible");
          }
        } catch (error) {
          console.error("Could not open offer affiliate link:", error);
        }
      }

      offerDialog.showModal();
      if (offerId) {
        var metaEventId = (window.crypto && window.crypto.randomUUID)
          ? window.crypto.randomUUID()
          : String(Date.now()) + Math.random().toString(16).slice(2);
        if (typeof window.fbq === "function") {
          window.fbq("track", "InitiateCheckout", {
            content_type: "offer",
            content_name: offerTitle,
            content_ids: [String(offerId)]
          }, { eventID: metaEventId });
        }
        fetch("/coupons/" + encodeURIComponent(offerId) + "/increment", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Accept": "application/json",
            "X-CSRF-TOKEN": csrfToken ? csrfToken.content : ""
          },
          body: new URLSearchParams({ event_id: metaEventId })
        }).then(function (response) {
          if (!response.ok) throw new Error("Offer usage request failed (" + response.status + ")");
        }).catch(function (error) {
          console.error("Could not record offer usage:", error);
          offerFields.status.textContent = "We couldn’t record this offer view.";
        });
      }
    };

    var copyOfferCode = function () {
      if (!activeOffer || !offerFields.code.textContent) return;
      navigator.clipboard.writeText(offerFields.code.textContent).then(function () {
        offerFields.status.textContent = "Coupon code copied to clipboard!";
        var copyButton = offerDialog.querySelector("[data-offer-copy-button]");
        copyButton.textContent = "Copied!";
        copyButton.classList.add("is-copied");
      }).catch(function (error) {
        console.error("Could not copy coupon code:", error);
        offerFields.status.textContent = "Could not copy the code. Please select it and copy manually.";
      });
    };

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      var trigger = target.closest("[data-offer-trigger]");
      if (trigger) {
        openOffer(trigger);
        return;
      }
      if (target.closest("[data-offer-close]")) {
        offerDialog.close();
        return;
      }
      if (target.closest("[data-offer-copy], [data-offer-copy-button]")) {
        copyOfferCode();
      }
    });

    offerDialog.addEventListener("close", function () {
      activeOffer = null;
      var copyButton = offerDialog.querySelector("[data-offer-copy-button]");
      copyButton.textContent = "Copy Code";
      copyButton.classList.remove("is-copied");
    });
  }

  /* Popular stores carousel: touch scrolling plus looping arrow navigation. */
  document.querySelectorAll("[data-store-carousel]").forEach(function (carousel) {
    var track = carousel.querySelector("[data-store-track]");
    var previous = carousel.querySelector("[data-store-prev]");
    var next = carousel.querySelector("[data-store-next]");
    if (!track || !previous || !next) return;

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var update = function () {
      var hasOverflow = track.scrollWidth > track.clientWidth + 1;
      previous.hidden = !hasOverflow;
      next.hidden = !hasOverflow;
      previous.disabled = !hasOverflow;
      next.disabled = !hasOverflow;
    };
    var move = function (direction) {
      var maxScroll = track.scrollWidth - track.clientWidth;
      var atStart = track.scrollLeft <= 1;
      var atEnd = track.scrollLeft >= maxScroll - 1;
      var item = track.firstElementChild;
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      var step = item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
      var target = direction > 0 && atEnd
        ? 0
        : direction < 0 && atStart
          ? maxScroll
          : track.scrollLeft + direction * step;

      track.scrollTo({
        left: target,
        behavior: reducedMotion.matches ? "auto" : "smooth"
      });
    };

    previous.addEventListener("click", function () { move(-1); });
    next.addEventListener("click", function () { move(1); });
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    });
    window.addEventListener("resize", update, { passive: true });
    update();
  });

  /* Store detail tabs. */
  var storeTabs = Array.from(document.querySelectorAll("[data-store-tab]"));
  var selectStoreTab = function (tab, focus) {
    var selected = tab.getAttribute("data-store-tab");
    storeTabs.forEach(function (item) {
      var active = item === tab;
      item.setAttribute("aria-selected", active ? "true" : "false");
      item.setAttribute("tabindex", active ? "0" : "-1");
      item.classList.toggle("bg-white", active);
      item.classList.toggle("text-grape", active);
      item.classList.toggle("shadow-sm", active);
      item.classList.toggle("text-ink", !active);
    });
    document.querySelectorAll("[data-store-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-store-panel") !== selected;
    });
    if (focus) tab.focus();
  };
  storeTabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { selectStoreTab(tab, false); });
    tab.addEventListener("keydown", function (event) {
      var nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % storeTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index + storeTabs.length - 1) % storeTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = storeTabs.length - 1;
      else return;
      event.preventDefault();
      selectStoreTab(storeTabs[nextIndex], true);
    });
  });

  /* Admin settings tabs preserve the selected panel on validation errors. */
  document.querySelectorAll("[data-settings-form]").forEach(function (form) {
    var tabs = Array.from(form.querySelectorAll("[data-settings-tab]"));
    var activeInput = form.querySelector("[data-settings-active-tab]");
    var selectSettingsTab = function (tab, focus) {
      var selected = tab.getAttribute("data-settings-tab");
      tabs.forEach(function (item) {
        var active = item === tab;
        item.setAttribute("aria-selected", active ? "true" : "false");
        item.setAttribute("tabindex", active ? "0" : "-1");
        item.classList.toggle("bg-paper", active);
        item.classList.toggle("text-ink", active);
        item.classList.toggle("text-ink/70", !active);
        item.classList.toggle("shadow-sm", active);
      });
      form.querySelectorAll("[data-settings-panel]").forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-settings-panel") !== selected;
      });
      if (activeInput) activeInput.value = selected;
      if (focus) tab.focus();
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectSettingsTab(tab, false); });
      tab.addEventListener("keydown", function (event) {
        var nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        selectSettingsTab(tabs[nextIndex], true);
      });
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
