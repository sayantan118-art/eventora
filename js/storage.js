/* =========================================================
   EVENTORA — storage.js
   Safe Local Storage wrapper. Handles unavailable /
   malformed / missing data gracefully.
   ========================================================= */
(function () {
  "use strict";

  const NS = (window.EVENTORA = window.EVENTORA || {});

  const KEYS = {
    registrations: "eventora_registrations",
    theme: "eventora_theme"
  };

  // Detect whether Local Storage is usable (private mode, etc.).
  let available = true;
  try {
    const k = "__eventora_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
  } catch (e) {
    available = false;
  }

  function read(key, fallback) {
    if (!available) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      // Malformed data: remove it and fall back.
      try { window.localStorage.removeItem(key); } catch (_) {}
      return fallback;
    }
  }

  function write(key, value) {
    if (!available) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function remove(key) {
    if (!available) return;
    try { window.localStorage.removeItem(key); } catch (e) {}
  }

  /* ---------- Registrations ---------- */

  function getRegistrations() {
    const data = read(KEYS.registrations, []);
    return Array.isArray(data) ? data.filter(isValidRegistration) : [];
  }

  function isValidRegistration(r) {
    return r && typeof r.id === "string" && typeof r.eventId === "string";
  }

  function saveRegistrations(list) {
    return write(KEYS.registrations, list);
  }

  function addRegistration(reg) {
    const list = getRegistrations();
    list.push(reg);
    saveRegistrations(list);
    return reg;
  }

  // True if (email + eventId) already registered.
  function isDuplicate(email, eventId) {
    if (!email || !eventId) return false;
    const norm = email.trim().toLowerCase();
    return getRegistrations().some(
      (r) => r.email && r.email.trim().toLowerCase() === norm && r.eventId === eventId
    );
  }

  function cancelRegistration(regId) {
    const list = getRegistrations().filter((r) => r.id !== regId);
    saveRegistrations(list);
    return list;
  }

  function getRegistration(regId) {
    return getRegistrations().find((r) => r.id === regId) || null;
  }

  // Count how many seats already taken for an event (for safety with remaining seats).
  function countForEvent(eventId) {
    return getRegistrations().filter((r) => r.eventId === eventId).length;
  }

  /* ---------- Theme ---------- */

  function getTheme() {
    return read(KEYS.theme, null);
  }

  function setTheme(theme) {
    write(KEYS.theme, theme);
  }

  NS.storage = {
    isAvailable: available,
    getRegistrations,
    addRegistration,
    cancelRegistration,
    getRegistration,
    isDuplicate,
    countForEvent,
    getTheme,
    setTheme,
    keys: KEYS
  };
})();
