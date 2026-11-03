/* =========================================================
   EVENTORA — countdown.js
   Populates the featured event card and runs a live
   countdown, handling expired events gracefully.
   ========================================================= */
(function () {
  "use strict";

  const NS = (window.EVENTORA = window.EVENTORA || {});

  let timer = null;
  let featured = null;

  const el = {};

  function cacheEls() {
    el.image = document.getElementById("featuredImage");
    el.category = document.getElementById("featuredCategory");
    el.name = document.getElementById("featuredName");
    el.date = document.getElementById("featuredDate");
    el.venue = document.getElementById("featuredVenue");
    el.desc = document.getElementById("featuredDesc");
    el.days = document.getElementById("cdDays");
    el.hours = document.getElementById("cdHours");
    el.mins = document.getElementById("cdMins");
    el.secs = document.getElementById("cdSecs");
    el.countdown = document.getElementById("countdown");
    el.expired = document.getElementById("countdownExpired");
    el.registerBtn = document.getElementById("featuredRegisterBtn");
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    if (!featured) return;
    const now = Date.now();
    const target = featured.date.getTime();
    let diff = target - now;

    if (diff <= 0) {
      el.countdown.hidden = true;
      el.expired.hidden = false;
      if (el.registerBtn) el.registerBtn.disabled = true;
      clearInterval(timer);
      timer = null;
      return;
    }

    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000); diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);

    el.days.textContent = pad(days);
    el.hours.textContent = pad(hours);
    el.mins.textContent = pad(mins);
    el.secs.textContent = pad(secs);
  }

  function init() {
    cacheEls();
    featured = NS.getFeaturedEvent();
    if (!featured) return;

    el.image.src = featured.image;
    el.image.alt = featured.name + " — featured event illustration";
    el.image.addEventListener("error", function () {
      el.image.src = NS.categoryFallback(featured.category, featured.name);
    });
    el.category.textContent = featured.category;
    el.name.textContent = featured.name;
    el.date.textContent = NS.fmt.formatDate(featured.date) + " · " + NS.fmt.formatTime(featured.time);
    el.venue.textContent = featured.venue + ", " + featured.city;
    el.desc.textContent = featured.fullDesc;

    NS.featured = { event: featured, id: featured.id };

    tick();
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 1000);
  }

  NS.countdown = { init };
})();
