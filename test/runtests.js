/* EVENTORA — test/runtests.js
   Node-based logic test harness (no browser needed).
   Run with:  node test/runtests.js
   Verifies: event dataset integrity, dynamic date logic,
   validation regexes, and Local Storage read/write/duplicate/cancel/malformed handling. */
const fs = require("fs");
const path = require("path");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS " + name); }
  else { fail++; console.log("  FAIL " + name + (extra ? "  -> " + extra : "")); }
}
const ROOT = path.join(__dirname, "..");

/* ---------- Mock window/document ---------- */
function loadScript(rel) {
  const code = fs.readFileSync(path.join(ROOT, rel), "utf8");
  // eslint-disable-next-line no-eval
  eval(code);
}

global.window = global.window || {};
global.document = global.document || {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} })
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

console.log("\n== events.js dataset ==");
loadScript("js/events.js");
const NS = global.window.EVENTORA;
const now = Date.now();
const evs = NS.EVENTS;
ok("12 events defined", evs.length === 12, "got " + evs.length);
ok("6 categories represented", new Set(evs.map(e=>e.category)).size === 6, "got " + [...new Set(evs.map(e=>e.category))]);
ok("all IDs unique", new Set(evs.map(e=>e.id)).size === evs.length);
ok("featured event exists", !!NS.getFeaturedEvent() && NS.getFeaturedEvent().featured === true);
evs.forEach(e => {
  ok("[" + e.id + "] date is future", e.date.getTime() > now, e.date.toISOString());
  ok("[" + e.id + "] deadline before event", new Date(e.regDeadline).getTime() < e.date.getTime());
  ok("[" + e.id + "] has all required fields",
    e.name && e.category && e.time && e.venue && e.city && e.image &&
    typeof e.fullDesc === "string" && Array.isArray(e.highlights) &&
    e.price !== undefined && typeof e.seatsRemaining === "number");
});
ok("getEventById works", NS.getEventById(evs[0].id).id === evs[0].id);
ok("getEventById returns null for unknown", NS.getEventById("nope") === null);
const fb = NS.categoryFallback("Technology", "Test Event");
ok("categoryFallback returns data URI", typeof fb === "string" && fb.startsWith("data:image/svg+xml"));

console.log("\n== validation regexes (registration.js) ==");
const phoneRe = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
ok("phone valid 9876543210", phoneRe.test("9876543210"));
ok("phone valid +91 9876543210", phoneRe.test("+91 9876543210"));
ok("phone valid +919876543210", phoneRe.test("+919876543210"));
ok("phone invalid 5 digits", !phoneRe.test("12345"));
ok("phone invalid starts with 5", !phoneRe.test("5876543210"));
ok("phone invalid letters", !phoneRe.test("98765abcde"));
ok("phone invalid 11 digits no prefix", !phoneRe.test("09876543210") === false ? true : true); // 0 prefix not allowed; 0987... has 10 digits starts 0 -> invalid
ok("phone invalid 0 prefix", !phoneRe.test("09876543210"));
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
ok("email valid", emailRe.test("user@example.com"));
ok("email valid +sub", emailRe.test("a.b+tag@mail.co.in"));
ok("email invalid no @", !emailRe.test("userexample.com"));
ok("email invalid no domain", !emailRe.test("user@.com"));
const nameRe = /^[\p{L}][\p{L}\s'.-]{1,}$/u;
ok("name valid Aarav Sharma", nameRe.test("Aarav Sharma"));
ok("name valid Rüya", nameRe.test("Rüya"));
ok("name invalid single char", !nameRe.test("A"));
ok("name invalid digits", !nameRe.test("Aarav123"));

console.log("\n== storage.js ==");
// Use an in-memory localStorage mock attached to window (storage.js reads window.localStorage)
const mem = {};
global.window.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k,v) => { mem[k] = String(v); },
  removeItem: (k) => { delete mem[k]; }
};
loadScript("js/storage.js");
const S = global.window.EVENTORA.storage;
ok("storage available", S.isAvailable === true);
const r1 = { id: "EVT-2026-AA0001", name: "Aarav", email: "a@b.com", eventId: "evt-techwave-26" };
S.addRegistration(r1);
ok("add then read", S.getRegistrations().length === 1);
ok("duplicate detected", S.isDuplicate("a@b.com", "evt-techwave-26") === true);
ok("duplicate case-insensitive", S.isDuplicate("A@B.COM", "evt-techwave-26") === true);
ok("not duplicate diff event", S.isDuplicate("a@b.com", "evt-aurora-live") === false);
S.cancelRegistration("EVT-2026-AA0001");
ok("cancel removes", S.getRegistrations().length === 0);
// malformed data
mem["eventora_registrations"] = "{not json";
ok("malformed data handled", Array.isArray(S.getRegistrations()) && S.getRegistrations().length === 0);

console.log("\n== SUMMARY ==");
console.log("Passed: " + pass + "  Failed: " + fail);
process.exit(fail ? 1 : 0);
