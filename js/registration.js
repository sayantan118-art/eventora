/* =========================================================
   EVENTORA — registration.js
   Registration form, validation, unique ID generation,
   Local Storage save and confirmation flow.
   ========================================================= */
(function () {
  "use strict";

  const NS = (window.EVENTORA = window.EVENTORA || {});

  let form, nameInput, emailInput, phoneInput, eventSelect, reqInput,
    submitBtn, cancelBtn, subtitle, modal;

  /* ---------- Validators ---------- */
  function validateName(v) {
    v = (v || "").trim();
    if (!v) return { valid: false, msg: "Please enter your full name." };
    if (v.length < 3) return { valid: false, msg: "Name is a little short." };
    if (!/^[\p{L}][\p{L}\s'.-]{1,}$/u.test(v))
      return { valid: false, msg: "Enter a valid name (letters and spaces only)." };
    return { valid: true };
  }

  function validateEmail(v) {
    v = (v || "").trim();
    if (!v) return { valid: false, msg: "Please enter your email address." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return { valid: false, msg: "Enter a valid email address." };
    return { valid: true };
  }

  function validatePhone(v) {
    v = (v || "").trim();
    if (!v) return { valid: false, msg: "Please enter your phone number." };
    if (!/^(\+91[\-\s]?)?[6-9]\d{9}$/.test(v))
      return { valid: false, msg: "Enter a valid Indian mobile number (e.g. 9876543210)." };
    return { valid: true };
  }

  function eventStatus(e) {
    const now = Date.now();
    if (e.date.getTime() <= now) return "past";
    if (new Date(e.regDeadline).getTime() <= now) return "closed";
    if (e.seatsRemaining <= 0) return "soldout";
    return "open";
  }

  function validateEvent(v, silent) {
    if (!v) return { valid: false, msg: "Please select an event." };
    const e = NS.getEventById(v);
    if (!e) return { valid: false, msg: "That event no longer exists." };
    const status = eventStatus(e);
    if (status === "past") return { valid: false, msg: "This event has already happened." };
    if (status === "closed") return { valid: false, msg: "Registration for this event has closed." };
    if (status === "soldout") return { valid: false, msg: "This event is sold out." };
    return { valid: true };
  }

  /* ---------- Field UI helpers ---------- */
  function fieldOf(input) {
    return input.closest(".field");
  }
  function setFieldError(input, msg) {
    const f = fieldOf(input);
    const err = f.querySelector(".field-error");
    f.classList.add("invalid");
    f.classList.remove("valid");
    if (err) err.textContent = msg || "";
  }
  function setFieldValid(input) {
    const f = fieldOf(input);
    const err = f.querySelector(".field-error");
    f.classList.remove("invalid");
    f.classList.add("valid");
    if (err) err.textContent = "";
  }
  function clearField(input) {
    const f = fieldOf(input);
    const err = f.querySelector(".field-error");
    f.classList.remove("invalid", "valid");
    if (err) err.textContent = "";
  }

  /* ---------- Populate event select ---------- */
  function populateEvents(preselectId) {
    if (!eventSelect) return;
    const opts = ['<option value="" disabled selected>Choose an event…</option>'];
    NS.EVENTS.forEach((e) => {
      const status = eventStatus(e);
      const price = e.price === 0 ? "Free" : "₹" + e.price.toLocaleString("en-IN");
      const date = NS.fmt.formatDateShort(e.date);
      let label = `${e.name} — ${date} · ${price}`;
      let disabled = "";
      if (status === "past") { label += " (Past)"; disabled = "disabled"; }
      else if (status === "closed") { label += " (Registration closed)"; disabled = "disabled"; }
      else if (status === "soldout") { label += " (Sold out)"; disabled = "disabled"; }
      opts.push(`<option value="${e.id}" ${disabled}>${label}</option>`);
    });
    eventSelect.innerHTML = opts.join("");
    if (preselectId) {
      const opt = eventSelect.querySelector(`option[value="${preselectId}"]`);
      if (opt && !opt.disabled) {
        eventSelect.value = preselectId;
      }
    }
  }

  /* ---------- Open / close ---------- */
  function openRegistration(eventId) {
    // If a specific event requested, ensure it is registerable.
    if (eventId) {
      const e = NS.getEventById(eventId);
      if (!e) return;
      const status = eventStatus(e);
      if (status !== "open") {
        NS.toast(status === "past" ? "This event has already happened." :
          status === "closed" ? "Registration for this event has closed." :
          "This event is sold out.", "error");
        return;
      }
    }
    populateEvents(eventId);
    NS.openModal("registerModal");
    // Clear prior errors
    [nameInput, emailInput, phoneInput, eventSelect].forEach(clearField);
    reqInput.value = "";
    if (subtitle) subtitle.textContent = eventId
      ? "Almost there — confirm your details to secure your spot."
      : "Fill in your details to secure your spot.";
    // focus first field after transition
    setTimeout(() => nameInput.focus(), 60);
  }

  function closeRegistration() {
    NS.closeModal("registerModal");
  }

  /* ---------- Validate one field on blur/input ---------- */
  function validateField(input) {
    let res;
    if (input === nameInput) res = validateName(input.value);
    else if (input === emailInput) res = validateEmail(input.value);
    else if (input === phoneInput) res = validatePhone(input.value);
    else if (input === eventSelect) res = validateEvent(input.value);
    else return true;
    if (!res.valid) setFieldError(input, res.msg);
    else setFieldValid(input);
    return res.valid;
  }

  /* ---------- Generate registration ID ---------- */
  function makeId() {
    const year = new Date().getFullYear();
    const rand = (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).toUpperCase();
    return `EVT-${year}-${rand.slice(-6)}`;
  }

  /* ---------- Submit ---------- */
  function onSubmit(ev) {
    ev.preventDefault();
    if (submitBtn.classList.contains("is-loading")) return;

    const fields = [nameInput, emailInput, phoneInput, eventSelect];
    let firstInvalid = null;
    fields.forEach((f) => { if (!validateField(f) && !firstInvalid) firstInvalid = f; });

    if (firstInvalid) { firstInvalid.focus(); return; }

    const email = emailInput.value.trim();
    const eventId = eventSelect.value;

    // Duplicate check
    if (NS.storage.isDuplicate(email, eventId)) {
      setFieldError(eventSelect, "You've already registered for this event with this email.");
      eventSelect.focus();
      return;
    }

    // Loading state
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;

    // Simulate async save feedback (no backend; purely local).
    setTimeout(() => {
      const evt = NS.getEventById(eventId);
      const reg = {
        id: makeId(),
        name: nameInput.value.trim(),
        email: email,
        phone: phoneInput.value.trim(),
        eventId: eventId,
        eventName: evt.name,
        eventCategory: evt.category,
        eventDate: evt.dateISO,
        venue: evt.venue,
        city: evt.city,
        requirements: reqInput.value.trim(),
        registeredAt: new Date().toISOString(),
        status: "Confirmed"
      };

      NS.storage.addRegistration(reg);
      form.reset();
      [nameInput, emailInput, phoneInput, eventSelect].forEach(clearField);
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
      closeRegistration();
      showConfirmation(reg, evt);
      NS.renderRegistrations();
      NS.toast("Registration confirmed!", "success");
    }, 700);
  }

  function showConfirmation(reg, evt) {
    document.getElementById("confirmId").textContent = reg.id;
    document.getElementById("confirmName").textContent = reg.name;
    document.getElementById("confirmEvent").textContent = reg.eventName;
    document.getElementById("confirmDate").textContent =
      NS.fmt.formatDate(new Date(reg.eventDate)) + " · " + NS.fmt.formatTime(evt.time);
    document.getElementById("confirmVenue").textContent = reg.venue + ", " + reg.city;
    NS.openModal("confirmModal");
  }

  /* ---------- Init ---------- */
  function init() {
    form = document.getElementById("registerForm");
    nameInput = document.getElementById("regName");
    emailInput = document.getElementById("regEmail");
    phoneInput = document.getElementById("regPhone");
    eventSelect = document.getElementById("regEvent");
    reqInput = document.getElementById("regRequirements");
    submitBtn = document.getElementById("regSubmitBtn");
    cancelBtn = document.getElementById("regCancelBtn");
    subtitle = document.getElementById("registerSubtitle");
    modal = document.getElementById("registerModal");

    form.addEventListener("submit", onSubmit);
    cancelBtn.addEventListener("click", closeRegistration);

    // Validate on blur; clear error on input
    [
      [nameInput, validateName],
      [emailInput, validateEmail],
      [phoneInput, validatePhone],
      [eventSelect, validateEvent]
    ].forEach(([input, fn]) => {
      input.addEventListener("blur", () => {
        if (input.value.trim() || input === eventSelect) {
          const r = fn(input.value);
          if (!r.valid) setFieldError(input, r.msg); else setFieldValid(input);
        }
      });
      input.addEventListener("input", () => {
        if (fieldOf(input).classList.contains("invalid")) {
          const r = fn(input.value);
          if (r.valid) setFieldValid(input);
        }
      });
    });

    // Enter key on phone should not jump focus oddly — keep default.
  }

  NS.registration = { init, openRegistration, eventStatus };
})();
