/* =========================================================
   EVENTORA — events.js
   Event dataset + helpers.
   Dates are generated relative to "today" so the demo
   never goes stale (countdowns and validations stay valid).
   ========================================================= */
(function () {
  "use strict";

  const NS = (window.EVENTORA = window.EVENTORA || {});

  // Build a date offset N days from today at a given time string "HH:MM".
  function dayOffset(days, time) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + days);
    if (time) {
      const [h, m] = time.split(":").map(Number);
      d.setHours(h, m, 0, 0);
    }
    return d.toISOString();
  }

  // Deadline = event date minus a number of days (and at 23:59).
  function deadlineBefore(eventISO, days) {
    const d = new Date(eventISO);
    d.setDate(d.getDate() - days);
    d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  const RAW = [
    {
      id: "evt-techwave-26",
      name: "TechWave Summit '26",
      category: "Technology",
      time: "09:30",
      venue: "Jio World Convention Centre",
      city: "Mumbai",
      shortDesc: "Two days of keynotes, hands-on labs and networking with India's top engineering teams.",
      fullDesc:
        "TechWave Summit returns for a sixth year, gathering founders, engineers and product leaders across AI, cloud and developer tooling. Expect deep-dive keynotes, hands-on workshops, a startup showcase floor and curated networking. Whether you ship code or design systems, you'll leave with practical playbooks and new collaborators.",
      highlights: [
        "40+ speakers from leading product companies",
        "Hands-on AI and cloud engineering labs",
        "Startup showcase with 60+ exhibitors",
        "Curated founder-investor networking lounge",
        "Lightning talks and an after-hours community mixer"
      ],
      price: 2499,
      featured: true,
      seatsRemaining: 142,
      offsetDays: 12,
      deadlineDaysBefore: 2,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-aurora-live",
      name: "Aurora Live — Synth Night",
      category: "Music",
      time: "19:00",
      venue: "Phoenix Marketcity Amphitheatre",
      city: "Bengaluru",
      shortDesc: "An immersive evening of live electronic and synthwave from headline artists.",
      fullDesc:
        "Aurora Live transforms the amphitheatre into a light-soaked dreamscape for one night only. Multiple acts move from ambient build-ups to driving synthwave, paired with reactive visuals and a surround lighting rig. Food trucks, art installations and a vinyl pop-up round out the experience.",
      highlights: [
        "Live sets from four headline acts",
        "Reactive visual and lighting design",
        "Food trucks and a vinyl pop-up market",
        "Art installation walk-through",
        "Early-bird mosh-free zones"
      ],
      price: 1499,
      featured: false,
      seatsRemaining: 88,
      offsetDays: 5,
      deadlineDaysBefore: 1,
      image:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-growthcon",
      name: "GrowthCon: Scaling Startups",
      category: "Business",
      time: "10:00",
      venue: "Hyatt Regency",
      city: "Gurugram",
      shortDesc: "Operators and investors break down what actually scales a business.",
      fullDesc:
        "GrowthCon brings together operators, investors and founders for a full day focused on scaling. Sessions cover go-to-market, fundraising, hiring and unit economics, with office hours run by top VC firms. Walk away with templates, frameworks and warm intros.",
      highlights: [
        "Frameworks for repeatable go-to-market",
        "Office hours with 12 VC firms",
        "Tactical hiring and org-design sessions",
        "Operator-only roundtables",
        "Networking breakfast and closing reception"
      ],
      price: 3999,
      featured: false,
      seatsRemaining: 60,
      offsetDays: 21,
      deadlineDaysBefore: 3,
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-design-jam",
      name: "Design Jam: UX in 90 Minutes",
      category: "Workshops",
      time: "16:00",
      venue: "WeWork Prestige Atlanta",
      city: "Bengaluru",
      shortDesc: "A fast, hands-on workshop to ship a product concept end to end.",
      fullDesc:
        "Join a small cohort for a guided design jam. You'll go from a fuzzy brief to a clickable prototype, learning just enough research, IA and interaction craft along the way. Mentors circulate to unblock teams, and everyone presents in a friendly critique.",
      highlights: [
        "Guided from brief to prototype",
        "Mentor crits at every stage",
        "Template kit to take home",
        "Friendly final showcase",
        "Snacks, coffee and good company"
      ],
      price: 0,
      featured: false,
      seatsRemaining: 24,
      offsetDays: 9,
      deadlineDaysBefore: 1,
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-citymarathon",
      name: "City Half Marathon",
      category: "Sports",
      time: "06:00",
      venue: "Marine Drive",
      city: "Mumbai",
      shortDesc: "A scenic 21K along the coast with chip timing and a finishers' village.",
      fullDesc:
        "Run a flat, fast half marathon along the iconic coastline. The route is fully supported with aid stations, medical teams and chip timing for accurate splits. A finishers' village with music, recovery zones and refreshments awaits at the end.",
      highlights: [
        "Flat, coastal 21K course",
        "Chip-timed with live splits",
        "Aid stations every 3K",
        "Finishers' medal and recovery zone",
        "10K and 5K distance options"
      ],
      price: 899,
      featured: false,
      seatsRemaining: 320,
      offsetDays: 26,
      deadlineDaysBefore: 4,
      image:
        "https://images.unsplash.com/photo-1452626032916-6a7513e3f4b3?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-frame-matters",
      name: "The Frame Matters",
      category: "Art & Culture",
      time: "11:00",
      venue: "Kochi-Muziris Pavilion",
      city: "Kochi",
      shortDesc: "A curated photography exhibition exploring identity through the lens.",
      fullDesc:
        "The Frame Matters brings together 22 photographers examining identity, place and memory. Walk through themed rooms with artist-led tours, a print shop and a closing panel on storytelling through images. Entry includes a limited-edition zine.",
      highlights: [
        "22 photographers across themed rooms",
        "Artist-led walkthrough tours",
        "Limited-edition exhibition zine",
        "Closing panel on visual storytelling",
        "Print shop and signings"
      ],
      price: 499,
      featured: false,
      seatsRemaining: 15,
      offsetDays: 7,
      deadlineDaysBefore: 1,
      image:
        "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-devopsday",
      name: "DevOps Day Bangalore",
      category: "Technology",
      time: "09:00",
      venue: "The Leela Palace",
      city: "Bengaluru",
      shortDesc: "A community-led day on platform engineering, reliability and automation.",
      fullDesc:
        "DevOps Day is a community conference covering platform engineering, SRE practices, security automation and the cultural side of shipping software. Open-space sessions let anyone propose a topic, so the agenda is shaped by the room.",
      highlights: [
        "Open-space, participant-driven agenda",
        "Talks on platform engineering and SRE",
        "Security automation deep dives",
        "Case studies from scale-ups",
        "Community dinner for attendees"
      ],
      price: 1299,
      featured: false,
      seatsRemaining: 48,
      offsetDays: 18,
      deadlineDaysBefore: 2,
      image:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-jazzgarage",
      name: "Jazz in the Garage",
      category: "Music",
      time: "20:30",
      venue: "The Piano Man Jazz Club",
      city: "New Delhi",
      shortDesc: "An intimate jazz night with rotating ensembles and a late set.",
      fullDesc:
        "Jazz in the Garage is a cozy, dim-lit evening featuring three rotating ensembles moving from standards to contemporary fusion. A late set keeps the room going past midnight, with a small plates menu and a curated wine list.",
      highlights: [
        "Three rotating live ensembles",
        "Intimate, listening-room setting",
        "Late set past midnight",
        "Small plates and wine menu",
        "Meet-the-artists intermission"
      ],
      price: 799,
      featured: false,
      seatsRemaining: 6,
      offsetDays: 3,
      deadlineDaysBefore: 1,
      image:
        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-productcon",
      name: "ProductCon India",
      category: "Business",
      time: "09:30",
      venue: "Taj Coromandel",
      city: "Chennai",
      shortDesc: "Product leaders share how they build, prioritise and ship.",
      fullDesc:
        "ProductCon gathers senior product leaders for a day of case-based talks on discovery, prioritisation and shipping at scale. Breakout sessions dig into metrics, roadmapping and stakeholder alignment, with a closing AMA panel.",
      highlights: [
        "Case-based talks from product leaders",
        "Breakouts on metrics and roadmapping",
        "Stakeholder alignment playbook",
        "Closing AMA panel",
        "Product circle networking"
      ],
      price: 3499,
      featured: false,
      seatsRemaining: 95,
      offsetDays: 30,
      deadlineDaysBefore: 3,
      image:
        "https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-writesprint",
      name: "Write Sprint Workshop",
      category: "Workshops",
      time: "14:00",
      venue: "91Springboard, Sector 16",
      city: "Noida",
      shortDesc: "A focused afternoon to draft clear, sharp copy with live feedback.",
      fullDesc:
        "Write Sprint is a structured workshop for anyone who writes at work. Through short exercises and live feedback, you'll sharpen clarity, structure and voice, finishing with a polished piece you can use immediately.",
      highlights: [
        "Structured writing exercises",
        "Live feedback on your drafts",
        "Frameworks for clarity and voice",
        "Reusable editing checklist",
        "Take-home draft you can ship"
      ],
      price: 599,
      featured: false,
      seatsRemaining: 30,
      offsetDays: 14,
      deadlineDaysBefore: 2,
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-padelopen",
      name: "City Padel Open",
      category: "Sports",
      time: "08:00",
      venue: "Game Palacio Arena",
      city: "Pune",
      shortDesc: "A weekend padel tournament open to all skill levels.",
      fullDesc:
        "The City Padel Open welcomes players of every level for a two-day tournament. Sign up solo or as a pair, get matched into brackets, and play under floodlights. Coaching clinics and a social mixer run alongside the matches.",
      highlights: [
        "Open bracket for all levels",
        "Enter solo or as a pair",
        "Coaching clinics courtside",
        "Floodlit night matches",
        "Player social mixer"
      ],
      price: 1100,
      featured: false,
      seatsRemaining: 64,
      offsetDays: 16,
      deadlineDaysBefore: 2,
      image:
        "https://images.unsplash.com/photo-1546519638-68e109496ffc?auto=format&fit=crop&w=900&q=70"
    },
    {
      id: "evt-heritagewalk",
      name: "Heritage Walk: Old City",
      category: "Art & Culture",
      time: "07:30",
      venue: "Charminar Gate",
      city: "Hyderabad",
      shortDesc: "A guided morning walk through the old city's stories and craft.",
      fullDesc:
        "A guided heritage walk winds through the old city at golden hour, with stops at landmark monuments, hidden courtyards and family-run craft workshops. A local historian leads, and the route ends with a traditional breakfast.",
      highlights: [
        "Guided by a local historian",
        "Stops at landmark monuments",
        "Hidden courtyards and workshops",
        "Meet craftspeople at work",
        "Traditional breakfast finale"
      ],
      price: 350,
      featured: false,
      seatsRemaining: 22,
      offsetDays: 4,
      deadlineDaysBefore: 1,
      image:
        "https://images.unsplash.com/photo-1564507592333-c4c5e2919766?auto=format&fit=crop&w=900&q=70"
    }
  ];

  // Resolve dynamic dates + deadlines.
  const EVENTS = RAW.map((e) => {
    const date = dayOffset(e.offsetDays, e.time);
    return {
      id: e.id,
      name: e.name,
      category: e.category,
      dateISO: date,
      date: new Date(date),
      time: e.time,
      venue: e.venue,
      city: e.city,
      image: e.image,
      shortDesc: e.shortDesc,
      fullDesc: e.fullDesc,
      price: e.price,
      featured: !!e.featured,
      seatsRemaining: e.seatsRemaining,
      regDeadline: deadlineBefore(date, e.deadlineDaysBefore),
      highlights: e.highlights
    };
  });

  const CATEGORIES = [
    {
      name: "Technology",
      desc: "Summits, dev days and hands-on labs for builders.",
      icon: "💻"
    },
    {
      name: "Music",
      desc: "Live gigs, festivals and intimate listening nights.",
      icon: "🎧"
    },
    {
      name: "Business",
      desc: "Conferences, founder circles and operator meetups.",
      icon: "📈"
    },
    {
      name: "Workshops",
      desc: "Practical, hands-on sessions to learn by doing.",
      icon: "🛠️"
    },
    {
      name: "Sports",
      desc: "Runs, tournaments and game days for every level.",
      icon: "🏆"
    },
    {
      name: "Art & Culture",
      desc: "Exhibitions, walks and cultural storytelling.",
      icon: "🎨"
    }
  ];

  NS.EVENTS = EVENTS;
  NS.CATEGORIES = CATEGORIES;

  NS.getEventById = function (id) {
    return EVENTS.find((e) => e.id === id) || null;
  };

  NS.getFeaturedEvent = function () {
    return EVENTS.find((e) => e.featured) || EVENTS[0] || null;
  };

  // Category-tinted SVG fallback data URI (used by app.js image error handler).
  NS.categoryFallback = function (category, label) {
    const palette = {
      Technology: "#8B5CF6",
      Music: "#A78BFA",
      Business: "#6366F1",
      Workshops: "#F59E0B",
      Sports: "#22C55E",
      "Art & Culture": "#EC4899"
    };
    const c = palette[category] || "#8B5CF6";
    const text = (label || category || "EVENTORA").slice(0, 24);
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='900' height='560'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='" + c + "'/>" +
      "<stop offset='1' stop-color='#191923'/></linearGradient></defs>" +
      "<rect width='900' height='560' fill='url(#g)'/>" +
      "<circle cx='700' cy='120' r='160' fill='" + c + "' opacity='0.35'/>" +
      "<circle cx='160' cy='460' r='120' fill='#ffffff' opacity='0.06'/>" +
      "<text x='60' y='520' font-family='Space Grotesk, sans-serif' font-size='40' font-weight='700' fill='#ffffff' opacity='0.92'>" +
      text + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
})();
