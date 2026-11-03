/* =========================================================
   EVENTORA — theme.js
   Dark (default) / light theme toggle with persistence
   and prefers-color-scheme fallback.
   ========================================================= */
(function () {
  "use strict";

  const NS = (window.EVENTORA = window.EVENTORA || {});
  const root = document.documentElement;

  let toggle;

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(theme === "light"));
      toggle.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      );
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#F6F6FB" : "#0B0B10");
  }

  function initTheme() {
    toggle = document.getElementById("themeToggle");

    // 1. Saved preference, 2. system preference, 3. dark default.
    const saved = NS.storage.getTheme();
    const prefersLight = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
    const initial = saved || (prefersLight ? "light" : "dark");
    applyTheme(initial);

    if (toggle) {
      toggle.addEventListener("click", function () {
        const next = currentTheme() === "light" ? "dark" : "light";
        applyTheme(next);
        NS.storage.setTheme(next);
      });
    }
  }

  NS.theme = { initTheme, applyTheme, currentTheme };
})();
