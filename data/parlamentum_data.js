/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          PARLAMENTUM TIMELINE DATA - parlamentum_data.js ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  To ADD a new entry, copy one of the blocks below and    ║
 * ║  paste it anywhere in the array. Order doesn't matter,   ║
 * ║  the timeline auto-sorts by date.                        ║
 * ║                                                          ║
 * ║  To REMOVE an entry, just delete its { ... }, block.     ║
 * ║                                                          ║
 * ║  FIELDS:                                                 ║
 * ║    date  - "DD/MM/YYYY"                                  ║
 * ║    title - Role or event name (Hebrew is fine)           ║
 * ║    icon  - Any emoji                                     ║
 * ║    role  - Color category. Pick one from:                ║
 * ║              role-beta           → pink                  ║
 * ║              role-digital        → yellow                ║
 * ║              role-junior-helper  → light blue            ║
 * ║              role-helper         → blue                  ║
 * ║              role-mod            → cyan                  ║
 * ║              role-events         → purple                ║
 * ║              role-head-events    → dark purple           ║
 * ║              role-discord        → light orange          ║
 * ║              role-discord-mod    → orange                ║
 * ║              role-discord-admin  → dark orange           ║
 * ║              role-vice-discord   → dark red              ║
 * ║              role-config         → light red             ║
 * ╚══════════════════════════════════════════════════════════╝
 */

const PARLAMENTUM_STATS = {
    rolesCount: "12",     // Leave empty ("") to auto-calculate
    yearsActive: "4+",    // Leave empty ("") to auto-calculate
    yearJoined: "2022"    // Leave empty ("") to auto-calculate
};

const PARLAMENTUM_TIMELINE = [

    // ── 2022 ────────────────────────────────────────────────
    { date: "17/07/2022", title: "בטא", icon: "🌱", role: "role-beta" },
    { date: "07/10/2022", title: "צוות אירועים", icon: "🎉", role: "role-events" },
    { date: "12/11/2022", title: "ג'וניור הלפר", icon: "🤝", role: "role-junior-helper" },
    { date: "19/12/2022", title: "הלפר", icon: "🛡️", role: "role-helper" },

    // ── 2023 ────────────────────────────────────────────────
    { date: "20/03/2023", title: "עלייה למוד", icon: "⚖️", role: "role-mod" },
    { date: "05/12/2023", title: "חזרה לצוות כהלפר", icon: "🛡️", role: "role-helper" },

    // ── 2024 ────────────────────────────────────────────────
    { date: "13/01/2024", title: "עלייה למוד", icon: "⚖️", role: "role-mod" },
    { date: "08/08/2024", title: "עוזר בדיסקורד", icon: "💬", role: "role-discord" },
    { date: "09/10/2024", title: "עלייה למפקח בדיסקורד", icon: "📡", role: "role-discord-mod" },

    // ── 2025 ────────────────────────────────────────────────
    { date: "16/03/2025", title: "צוות דיגיטל", icon: "💻", role: "role-digital" },
    { date: "17/03/2025", title: "אחראי צוות אירועים", icon: "🏆", role: "role-head-events" },
    { date: "06/04/2025", title: "צוות קינפוג", icon: "⚙️", role: "role-config" },
    { date: "17/07/2025", title: "עלייה למפקח בכיר בדיסקורד", icon: "👑", role: "role-discord-admin" },
    { date: "26/09/2025", title: " חזרה לצוות קינפוג", icon: "⚙️", role: "role-config" },
    { date: "16/11/2025", title: "סגן אחראי דיסקורד", icon: "🎖️", role: "role-vice-discord" },
    { date: "07/06/2026", title: "פרישה מהצוות", icon: "👋", role: "role-leave" },

];