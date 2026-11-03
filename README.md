# EVENTORA — Discover. Experience. Connect.

A modern, fully responsive **event discovery and registration platform** built with vanilla HTML, CSS and JavaScript. Find upcoming events, filter by category, view details, and register — with all bookings saved locally in your browser.

> Built for the **K Explore — Web Designing Challenge**.

---

## Project Description

EVENTORA is a frontend demonstration of a commercial-grade event discovery experience. Users can browse a curated set of events across six categories, search and sort the list, open richly detailed event pages (rendered as accessible modals), and register for events with a fully validated form. Registrations are stored in the browser using Local Storage and can be reviewed or cancelled at any time.

The interface is dark-first with an electric violet accent system, glassmorphism touches, and smooth motion that respects `prefers-reduced-motion`.

---

## Project Objectives

- Deliver a polished, professional event discovery experience (not a generic student UI).
- Provide a working, end-to-end registration flow with validation and persistence.
- Be fully responsive across mobile, tablet and desktop.
- Stay deployable on any static host (GitHub Pages, Netlify, Vercel) with zero build step.
- Keep the code modular, maintainable and dependency-free.

---

## Features

### Navigation
- Sticky, glassmorphic top navigation
- Responsive hamburger menu on mobile
- Active-section highlighting via IntersectionObserver
- Theme toggle + primary CTA

### Hero
- Headline, supporting copy and dual CTAs
- Animated gradient glows and grid backdrop
- Social-proof stats

### Featured Event
- Large banner with live countdown timer (days / hours / minutes / seconds)
- Graceful handling of expired events
- Direct View Details and Register actions

### Event Discovery
- 12 realistic sample events across 6 categories
- Live search (title, category, venue, city, description)
- Category filter chips
- Sorting by date, price and name
- Event count indicator and "no results" empty state with clear-filters action
- Event cards with image zoom on hover

### Event Details
- Dynamically populated modal (no hardcoded per-event pages)
- Banner, full description, highlights, date/time, venue, price, seats, deadline
- Register and Back actions

### Registration
- Validated form (name, email, phone, event, optional requirements)
- Inline + submit validation with accessible error states
- Indian phone number validation (optional `+91` prefix)
- Duplicate registration prevention (same email + same event)
- Past-event and deadline-past protection
- Unique registration ID generation
- Loading state to prevent double submission
- Polished confirmation receipt

### My Registrations
- Lists all local registrations
- Registration ID, status, date, venue
- Cancel with confirmation
- Empty state when nothing is registered

### Bonus
- Dark (default) / light theme with persistence and system-preference fallback
- Scroll-reveal, hover, modal and button animations
- `prefers-reduced-motion` support throughout
- Robust image fallbacks (no broken image icons)

---

## Technology Stack

| Area | Choice |
|------|--------|
| Markup | Semantic HTML5 |
| Styling | CSS3 with custom properties (design tokens) |
| Scripting | Vanilla JavaScript (ES6+) |
| Persistence | Browser Local Storage |
| Fonts | Google Fonts (Space Grotesk, Inter) |
| Build step | None — plain static files |

No frameworks, no bundlers, no runtime dependencies.

---

## Project Directory Structure

```
eventora/
│
├── index.html              # Page structure + sections + modals
├── README.md
├── .gitignore
│
├── assets/
│   ├── images/             # (Reserved for local image assets)
│   └── icons/              # (Reserved for local icon assets)
│
├── css/
│   ├── style.css           # Design tokens + base + components
│   ├── animations.css      # Keyframes + scroll reveal
│   └── responsive.css      # Mobile / tablet / desktop breakpoints
│
└── js/
    ├── app.js              # Orchestrator: modals, nav, reveal, details, registrations
    ├── events.js           # Event dataset + helpers + image fallbacks
    ├── filters.js           # Search, filter, sort + card rendering
    ├── registration.js     # Form validation + save + confirmation
    ├── storage.js           # Safe Local Storage wrapper
    ├── theme.js            # Dark/light theme toggle + persistence
    └── countdown.js          # Featured event countdown timer
```

---

## Installation and Local Setup

This project has no build step. You can run it in two ways:

### Option A — open directly
1. Clone or download this repository.
2. Open `index.html` in a modern browser.

### Option B — run a local server (recommended)
A local server avoids any browser quirks with `file://`.

Using Python:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

Using Node (http-server):
```bash
npx http-server -p 8000
```

Using VS Code: install the **Live Server** extension and click "Go Live".

---

## Registration System

The registration form validates on blur and on submit:

- **Full name** — required, trimmed, minimum 3 characters, letters/spaces only.
- **Email** — required, standard email format.
- **Phone** — required, Indian mobile number; optional `+91` prefix; regex `^(\+91[\-\s]?)?[6-9]\d{9}$`.
- **Event** — required; only future, open events with seats remaining are selectable. Past, registration-closed and sold-out events appear disabled.
- **Special requirements** — optional free text.

Business rules:
- A given email cannot register twice for the same event (duplicate prevention).
- Registration is blocked for past events and events whose registration deadline has passed.
- Submitting shows a loading state and locks the button to prevent duplicate submissions.

On success a **unique registration ID** is generated in the form `EVT-YYYY-XXXXXX` and a confirmation receipt is shown with the attendee name, event, date and venue.

> **Note:** This is a frontend demonstration. Registrations are stored **locally in this browser only** and are not transmitted to any event organizer.

---

## Local Storage Implementation

All persistence uses a safe wrapper in `js/storage.js` that:
- Detects whether Local Storage is available (private mode, disabled, etc.).
- Parses data defensively and discards malformed entries.
- Falls back gracefully when storage is unavailable.

| Key | Purpose | Shape |
|-----|---------|-------|
| `eventora_registrations` | Saved registrations | Array of registration objects |
| `eventora_theme` | Theme preference | `"dark"` or `"light"` |

A registration object looks like:
```json
{
  "id": "EVT-2026-A7F2K9",
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "9876543210",
  "eventId": "evt-techwave-26",
  "eventName": "TechWave Summit '26",
  "eventCategory": "Technology",
  "eventDate": "2026-11-15T04:00:00.000Z",
  "venue": "Jio World Convention Centre",
  "city": "Mumbai",
  "requirements": "",
  "registeredAt": "2026-11-03T10:24:00.000Z",
  "status": "Confirmed"
}
```

---

## Screenshots

> Add screenshots here after capturing them. Suggested captures:

| Section | Screenshot |
|--------|-----------|
| Hero | `![Hero](assets/images/screenshot-hero.png)` |
| Featured event + countdown | `![Featured](assets/images/screenshot-featured.png)` |
| Event grid | `![Grid](assets/images/screenshot-grid.png)` |
| Event details modal | `![Details](assets/images/screenshot-details.png)` |
| Registration form | `![Form](assets/images/screenshot-form.png)` |
| Confirmation | `![Confirmation](assets/images/screenshot-confirm.png)` |
| My Registrations | `![Registrations](assets/images/screenshot-registrations.png)` |
| Light mode | `![Light](assets/images/screenshot-light.png)` |

---

## Deployment Instructions

Because this is a static site with no build step, it can be hosted anywhere.

### GitHub Pages
1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Set the source to the `main` branch and root folder.
4. The site will be live at `https://<username>.github.io/<repo>/`.

### Netlify
1. Drag and drop the project folder onto [Netlify Drop](https://app.netlify.com/drop), or
2. Connect the Git repo and leave the build command empty with publish directory `/`.

### Vercel
1. Import the Git repository at [vercel.com](https://vercel.com).
2. Framework preset: **Other**. Build command: none. Output directory: the project root.

---

## Testing

A small Node-based test harness (no browser required) verifies the core logic:

```bash
node test/runtests.js
```

It checks the event dataset (12 events, 6 categories, unique IDs, all future dates, deadlines before event dates), the validation regexes (name / email / Indian phone), and the Local Storage layer (add, read, duplicate prevention, cancellation, malformed-data handling). All assertions should report PASS.

Manual browser testing should additionally cover: navigation and active states, search / filter / sort combinations, event details modal, full registration validation, registration persistence across refresh, cancellation, the featured countdown, theme toggle persistence, and responsive layouts at 375 / 768 / 1024 / 1440 px.

---

## Future Enhancements

- Real backend / API for persistent, cross-device registrations
- User accounts and ticket QR codes
- Seating selection and payment integration
- Email notification confirmation
- Favourites / wishlist with Local Storage
- Map view of event venues
- Internationalisation and additional locales

---

## Author

**Your Name** — _add your details, course/college, and links (GitHub, LinkedIn, portfolio) here._

---

## License

This project is created for the K Explore — Web Designing Challenge. Feel free to adapt it for learning purposes.
