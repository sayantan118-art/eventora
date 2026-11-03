/* =========================================================
   EVENTORA — app.js
   Orchestrator: modal system, navigation, scroll reveal,
   event details, my registrations rendering, wiring.
   ========================================================= */
(function () {
  "use strict";

  const NS = (window.EVENTORA = window.EVENTORA || {});

  let lastFocused = null;
  let openModals = [];

  /* ---------- Utility: image fallback ---------- */
  function applyFallback(img, category, label) {
    img.addEventListener("error", function () {
      const fb = NS.categoryFallback(category, label);
      if (img.src !== fb) img.src = fb;
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(message, type) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.className = "toast" + (type ? " toast-" + type : "") + " show";
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => { el.hidden = true; }, 250);
    }, 3200);
  }
  NS.toast = toast;

  /* ---------- Modal system ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusable(modal) {
    return Array.from(modal.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    lastFocused = document.activeElement;
    openModals.push(modal);
    modal._closeBtns = modal.querySelectorAll("[data-close-modal]");
    modal._closeBtns.forEach((b) => b.addEventListener("click", closeTop));

    const focusable = getFocusable(modal);
    const target = modal.querySelector(".modal-close") || focusable[0];
    if (target) target.focus();

    document.addEventListener("keydown", onKeydown);
  }

  function closeTop() {
    const modal = openModals.pop();
    if (!modal) return;
    modal.hidden = true;
    modal._closeBtns.forEach((b) => b.removeEventListener("click", closeTop));
    if (openModals.length === 0) {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
    }
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function closeModal(id) {
    const idx = openModals.findIndex((m) => m.id === id);
    if (idx === -1) return;
    openModals.splice(idx, 1);
    const modal = document.getElementById(id);
    modal.hidden = true;
    modal._closeBtns.forEach((b) => b.removeEventListener("click", closeTop));
    if (openModals.length === 0) {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
    }
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function onKeydown(e) {
    const modal = openModals[openModals.length - 1];
    if (!modal) return;
    if (e.key === "Escape") { e.preventDefault(); closeTop(); return; }
    if (e.key === "Tab") {
      const f = getFocusable(modal);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  NS.openModal = openModal;
  NS.closeModal = closeModal;

  /* ---------- Event details ---------- */
  function openDetails(id) {
    const e = NS.getEventById(id);
    if (!e) { toast("Event not found.", "error"); return; }

    const img = document.getElementById("detailsImage");
    img.src = e.image;
    img.alt = e.name + " — event illustration";
    applyFallback(img, e.category, e.name);

    document.getElementById("detailsCategory").textContent = e.category;
    document.getElementById("detailsTitle").textContent = e.name;
    document.getElementById("detailsDate").textContent = NS.fmt.formatDate(e.date) + " · " + NS.fmt.formatTime(e.time);
    document.getElementById("detailsVenue").textContent = e.venue;
    document.getElementById("detailsCity").textContent = e.city;
    document.getElementById("detailsPrice").textContent = e.price === 0 ? "Free" : "₹" + e.price.toLocaleString("en-IN");
    document.getElementById("detailsSeats").textContent = e.seatsRemaining > 0 ? e.seatsRemaining : "Sold out";

    const status = NS.registration.eventStatus(e);
    document.getElementById("detailsDesc").textContent = e.fullDesc;
    document.getElementById("detailsHighlights").innerHTML =
      e.highlights.map((h) => "<li>" + h.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</li>").join("");
    document.getElementById("detailsDeadline").textContent = NS.fmt.formatDate(new Date(e.regDeadline));

    const regBtn = document.getElementById("detailsRegisterBtn");
    regBtn.disabled = (status !== "open");
    regBtn.textContent = status === "open" ? "Register Now" :
      status === "past" ? "Event ended" :
      status === "closed" ? "Registration closed" : "Sold out";
    regBtn.onclick = function () { if (status === "open") { closeModal("detailsModal"); NS.registration.openRegistration(e.id); } };

    document.getElementById("detailsBackBtn").onclick = function () {
      closeModal("detailsModal");
      document.getElementById("explore").scrollIntoView({ behavior: "smooth", block: "start" });
    };

    openModal("detailsModal");
  }
  NS.openDetails = openDetails;

  /* ---------- My Registrations rendering ---------- */
  function statusBadgeFor(reg, event) {
    if (!event || new Date(reg.eventDate).getTime() <= Date.now()) {
      return '<span class="badge badge-muted">Completed</span>';
    }
    return '<span class="badge badge-success">Confirmed</span>';
  }

  function renderRegistrations() {
    const listEl = document.getElementById("registrationsList");
    const emptyEl = document.getElementById("registrationsEmpty");
    if (!listEl) return;

    const regs = NS.storage.getRegistrations().slice().sort((a, b) =>
      new Date(a.eventDate) - new Date(b.eventDate)
    );

    if (regs.length === 0) {
      listEl.innerHTML = "";
      listEl.hidden = true;
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    listEl.hidden = false;

    listEl.innerHTML = regs.map((r) => {
      const event = NS.getEventById(r.eventId);
      const thumb = event ? event.image : "";
      const date = new Date(r.eventDate);
      const hh = date.getHours();
      const mm = date.getMinutes();
      const timeStr = (hh % 12 || 12) + ":" + String(mm).padStart(2, "0") + " " + (hh >= 12 ? "PM" : "AM");
      return (
        '<article class="registration-card reveal" data-reg-id="' + r.id + '">' +
          (thumb ? '<img class="reg-card-thumb" src="' + thumb + '" alt="' + escapeAttr(r.eventName) + ' illustration" />' :
            '<div class="reg-card-thumb" aria-hidden="true"></div>') +
          '<div class="reg-card-body">' +
            '<div class="reg-card-top">' +
              '<div><h3 class="reg-card-title">' + escapeHTML(r.eventName) + '</h3>' +
              '<p class="reg-id">' + r.id + '</p></div>' +
              statusBadgeFor(r, event) +
            '</div>' +
            '<div class="reg-card-meta">' +
              '<span>📅 ' + NS.fmt.formatDate(date) + ' · ' + timeStr + '</span>' +
              '<span>📍 ' + escapeHTML(r.venue) + ', ' + escapeHTML(r.city) + '</span>' +
            '</div>' +
            '<div class="reg-card-foot">' +
              '<span class="badge badge-muted">' + (event ? event.category : "—") + '</span>' +
              '<button class="cancel-btn" type="button" data-cancel="' + r.id + '">Cancel registration</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    // attach image fallbacks + cancel handlers
    listEl.querySelectorAll(".reg-card-thumb").forEach((img) => {
      const card = img.closest(".registration-card");
      const regId = card.getAttribute("data-reg-id");
      const reg = regs.find((x) => x.id === regId);
      if (reg) applyFallback(img, reg.eventCategory, reg.eventName);
    });

    listEl.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-cancel");
        const reg = NS.storage.getRegistration(id);
        if (!reg) return;
        if (window.confirm("Cancel your registration for \"" + reg.eventName + "\"?\nThis action can't be undone.")) {
          NS.storage.cancelRegistration(id);
          renderRegistrations();
          toast("Registration cancelled.", "success");
        }
      });
    });

    requestAnimationFrame(() => {
      listEl.querySelectorAll(".reveal").forEach((el, i) => {
        el.style.setProperty("--reveal-delay", i * 50 + "ms");
        el.classList.add("is-visible");
      });
    });
  }
  NS.renderRegistrations = renderRegistrations;

  /* ---------- small escape helpers ---------- */
  function escapeHTML(s) {
    return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }
  function escapeAttr(s) { return escapeHTML(s).replace(/"/g, "&quot;"); }

  /* ---------- Navigation ---------- */
  function initNav() {
    const header = document.getElementById("siteHeader");
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    const links = navLinks.querySelectorAll(".nav-link");

    hamburger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      hamburger.classList.toggle("active", open);
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    links.forEach((l) => l.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }));

    // Close mobile menu when resizing up to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768 && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });

    // Header shadow on scroll
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Active nav link via IntersectionObserver
    const sections = ["home", "featured", "categories", "explore", "registrations"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const navMap = { home: "home", featured: "home", explore: "explore", categories: "categories", registrations: "registrations" };
    const setActive = (id) => {
      const navId = navMap[id];
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("data-nav") === navId));
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      }, { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] });
      sections.forEach((s) => io.observe(s));
    }
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const reveals = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Featured buttons ---------- */
  function initFeaturedButtons() {
    const featured = NS.getFeaturedEvent();
    if (!featured) return;
    const detailsBtn = document.getElementById("featuredDetailsBtn");
    const registerBtn = document.getElementById("featuredRegisterBtn");
    if (detailsBtn) detailsBtn.addEventListener("click", () => openDetails(featured.id));
    if (registerBtn) registerBtn.addEventListener("click", () => NS.registration.openRegistration(featured.id));
  }

  /* ---------- Confirmation modal buttons ---------- */
  function initConfirmButtons() {
    document.getElementById("confirmMoreBtn").addEventListener("click", () => {
      closeModal("confirmModal");
      document.getElementById("explore").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.getElementById("confirmViewBtn").addEventListener("click", () => {
      closeModal("confirmModal");
      document.getElementById("registrations").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Hero stats (subtle live feel) ---------- */
  function initStats() {
    const evCount = NS.EVENTS.length;
    const cities = new Set(NS.EVENTS.map((e) => e.city)).size;
    const elEv = document.getElementById("statEvents");
    const elCi = document.getElementById("statCities");
    if (elEv) elEv.textContent = (evCount * 10) + "+";
    if (elCi) elCi.textContent = (cities * 5) + "+";
  }

  /* ---------- Boot ---------- */
  function safe(label, fn) {
    try { fn(); }
    catch (err) { console.error("[EVENTORA] " + label + " failed:", err); }
  }

  function boot() {
    if (!NS.storage.isAvailable) {
      toast("Local Storage is unavailable. Registrations won't persist in this browser.", "error");
    }
    safe("theme", NS.theme.initTheme);
    safe("filters", NS.filters.initFilters);
    safe("countdown", NS.countdown.init);
    safe("registration", NS.registration.init);
    safe("nav", initNav);
    safe("featuredButtons", initFeaturedButtons);
    safe("confirmButtons", initConfirmButtons);
    safe("stats", initStats);
    safe("renderRegistrations", renderRegistrations);
    safe("reveal", initReveal);

    // Failsafe: never leave reveal elements hidden if observers misbehave.
    window.addEventListener("load", () => {
      setTimeout(() => {
        document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.95) el.classList.add("is-visible");
        });
      }, 400);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
