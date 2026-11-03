/* =========================================================
   EVENTORA — filters.js
   Search, category filtering, sorting and rendering of
   event cards + category cards.
   ========================================================= */
(function () {
  "use strict";

  const NS = (window.EVENTORA = window.EVENTORA || {});

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* ---------- Format helpers (shared on namespace) ---------- */
  function formatDate(d) {
    if (!(d instanceof Date)) d = new Date(d);
    return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function formatDateShort(d) {
    if (!(d instanceof Date)) d = new Date(d);
    return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  }
  function formatTime(time) {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
  }
  function formatPrice(price) {
    return price === 0 ? "Free" : "₹" + Number(price).toLocaleString("en-IN");
  }

  NS.fmt = { formatDate, formatDateShort, formatTime, formatPrice };

  /* ---------- State ---------- */
  const state = {
    query: "",
    category: "all",
    sort: "date-asc"
  };

  let grid, emptyState, countEl, searchInput, sortSelect, filterBar, clearBtn;

  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      const args = arguments;
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  /* ---------- Filtering logic ---------- */
  function getFiltered() {
    const q = state.query.trim().toLowerCase();
    let list = NS.EVENTS.filter((e) => {
      if (state.category !== "all" && e.category !== state.category) return false;
      if (q) {
        const hay = (e.name + " " + e.category + " " + e.venue + " " + e.city + " " + e.shortDesc).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    switch (state.sort) {
      case "date-asc": list.sort((a, b) => a.date - b.date); break;
      case "date-desc": list.sort((a, b) => b.date - a.date); break;
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "name-asc": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }

  /* ---------- Card rendering ---------- */
  function seatsState(n) {
    if (n <= 0) return { cls: "none", label: "Sold out" };
    if (n <= 10) return { cls: "low", label: `${n} seats left` };
    return { cls: "", label: `${n} seats left` };
  }

  function cardHTML(e) {
    const seats = seatsState(e.seatsRemaining);
    return (
      '<article class="event-card reveal" data-event-id="' + e.id + '">' +
        '<div class="event-card-media" data-action="details">' +
          '<img src="' + e.image + '" alt="' + escapeAttr(e.name) + ' illustration" loading="lazy" ' +
            'data-fallback="' + escapeAttr(NS.categoryFallback(e.category, e.name)) + '" />' +
          '<span class="badge badge-accent">' + e.category + '</span>' +
          '<span class="event-card-price' + (e.price === 0 ? " free" : "") + '">' + formatPrice(e.price) + '</span>' +
        '</div>' +
        '<div class="event-card-body">' +
          '<h3 class="event-card-title">' + escapeHTML(e.name) + '</h3>' +
          '<p class="event-card-row"><span class="ec-icon" aria-hidden="true">📅</span>' + formatDateShort(e.date) + ' · ' + formatTime(e.time) + '</p>' +
          '<p class="event-card-row"><span class="ec-icon" aria-hidden="true">📍</span>' + escapeHTML(e.venue) + ', ' + escapeHTML(e.city) + '</p>' +
          '<div class="event-card-foot">' +
            '<span class="seats-pill"><span class="seats-dot ' + seats.cls + '"></span>' + seats.label + '</span>' +
            '<button class="link-btn" type="button" data-action="details" aria-label="View details for ' + escapeAttr(e.name) + '">View Details →</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }
  function escapeAttr(s) {
    return escapeHTML(s).replace(/"/g, "&quot;");
  }

  function render() {
    if (!grid) return;
    const list = getFiltered();
    countEl.innerHTML = '<strong>' + list.length + '</strong> ' + (list.length === 1 ? "event" : "events") + " shown" +
      (state.category !== "all" || state.query ? "" : "");

    if (list.length === 0) {
      grid.innerHTML = "";
      grid.setAttribute("hidden", "");
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      grid.removeAttribute("hidden");
      grid.innerHTML = list.map(cardHTML).join("");
      // attach image error fallbacks
      grid.querySelectorAll("img[data-fallback]").forEach((img) => attachFallback(img));
      // reveal in next frame so animation plays
      requestAnimationFrame(() => {
        grid.querySelectorAll(".reveal").forEach((el, i) => {
          el.style.setProperty("--reveal-delay", i * 45 + "ms");
          el.classList.add("is-visible");
        });
      });
    }
  }

  function attachFallback(img) {
    if (img.dataset.fallbackBound) return;
    img.dataset.fallbackBound = "1";
    img.addEventListener("error", function () {
      if (img.src !== img.dataset.fallback) img.src = img.dataset.fallback;
    });
  }

  /* ---------- Category cards ---------- */
  function renderCategories() {
    const catGrid = document.getElementById("categoryGrid");
    if (!catGrid) return;
    const counts = {};
    NS.EVENTS.forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1; });
    catGrid.innerHTML = NS.CATEGORIES.map((c) => {
      return (
        '<article class="category-card reveal" data-filter="' + escapeAttr(c.name) + '" role="button" tabindex="0" aria-label="Show ' + escapeAttr(c.name) + ' events">' +
          '<div class="category-icon" aria-hidden="true">' + c.icon + '</div>' +
          '<h3>' + escapeHTML(c.name) + '</h3>' +
          '<p>' + escapeHTML(c.desc) + '</p>' +
          '<span class="cat-count">' + (counts[c.name] || 0) + ' events</span>' +
        '</article>'
      );
    }).join("");

    catGrid.querySelectorAll(".category-card").forEach((card) => {
      const cat = card.getAttribute("data-filter");
      const go = () => {
        setCategory(cat);
        document.getElementById("explore").scrollIntoView({ behavior: "smooth", block: "start" });
      };
      card.addEventListener("click", go);
      card.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); }
      });
    });

    requestAnimationFrame(() => {
      catGrid.querySelectorAll(".reveal").forEach((el, i) => {
        el.style.setProperty("--reveal-delay", i * 60 + "ms");
        el.classList.add("is-visible");
      });
    });
  }

  /* ---------- Controls ---------- */
  function setCategory(cat) {
    state.category = cat;
    filterBar.querySelectorAll(".filter-chip").forEach((c) => {
      c.classList.toggle("active", c.getAttribute("data-filter") === cat);
    });
    render();
  }

  function setQuery(q) {
    state.query = q;
    render();
  }

  function setSort(sort) {
    state.sort = sort;
    render();
  }

  function clearFilters() {
    state.query = "";
    state.category = "all";
    state.sort = "date-asc";
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "date-asc";
    filterBar.querySelectorAll(".filter-chip").forEach((c) => {
      c.classList.toggle("active", c.getAttribute("data-filter") === "all");
    });
    render();
  }

  function initFilters() {
    grid = document.getElementById("eventGrid");
    emptyState = document.getElementById("emptyState");
    countEl = document.getElementById("eventCount");
    searchInput = document.getElementById("searchInput");
    sortSelect = document.getElementById("sortSelect");
    filterBar = document.getElementById("filterBar");
    clearBtn = document.getElementById("clearFiltersBtn");

    renderCategories();

    // Delegated click on event grid (card media or button both open details).
    grid.addEventListener("click", (ev) => {
      const target = ev.target.closest("[data-action='details']");
      if (!target) return;
      const card = ev.target.closest(".event-card");
      if (!card) return;
      const id = card.getAttribute("data-event-id");
      if (id && NS.openDetails) NS.openDetails(id);
    });
    // Keyboard accessibility for card media
    grid.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        const card = ev.target.closest(".event-card");
        if (card) {
          ev.preventDefault();
          const id = card.getAttribute("data-event-id");
          if (id && NS.openDetails) NS.openDetails(id);
        }
      }
    });

    searchInput.addEventListener("input", debounce((e) => setQuery(e.target.value), 180));
    sortSelect.addEventListener("change", (e) => setSort(e.target.value));
    filterBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      setCategory(chip.getAttribute("data-filter"));
    });
    clearBtn.addEventListener("click", clearFilters);

    render();
  }

  NS.filters = {
    initFilters,
    render,
    setCategory,
    clearFilters,
    state
  };
})();
