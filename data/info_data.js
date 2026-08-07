/**
 * info_data.js – Navbar Dropdown Contact Info
 * ============================================
 * Edit this file to add, remove, or reorder links in the
 * logo dropdown on every page. No other file needs changing.
 *
 * Each entry supports:
 *   label    – display text (English)
 *   label_he – display text (Hebrew) — shown when site is in Hebrew mode
 *   type     – "link" (opens URL) | "email" (copy + open Gmail)
 *   url      – for type "link": the destination URL
 *   address  – for type "email": the email address
 *   icon     – path relative to project root (images/icons/...)
 *   cssClass – CSS class for colour styling (e.g. "discord", "steam")
 */

window.INFO_DATA = {
    title: "🔗 Contact Info",
    links: [
        {
            label: "Discord",
            label_he: "דיסקורד",
            type: "link",
            url: "https://discord.com/users/538697561209307136",
            icon: "images/icons/discord.svg",
            cssClass: "discord"
        },
        {
            label: "Instagram",
            label_he: "אינסטגרם",
            type: "link",
            url: "https://instagram.com/shaharmoshko_",
            icon: "images/icons/instagram.svg",
            cssClass: "instagram"
        },
        {
            label: "moshkosha@gmail.com",
            type: "email",
            address: "moshkosha@gmail.com",
            icon: "images/icons/gmail.svg",
            cssClass: "email-general"
        },
        {
            label: "NameMC",
            label_he: "ניים אם סי",
            type: "link",
            url: "https://namemc.com/profile/MoshkoThoughts_",
            icon: "images/icons/namemc.jpg",
            cssClass: "namemc"
        },
        {
            label: "Steam",
            label_he: "סטים",
            type: "link",
            url: "https://steamcommunity.com/profiles/76561199103335898/",
            icon: "images/icons/steam.svg",
            cssClass: "steam"
        },
        {
            label: "Spotify",
            label_he: "ספוטיפיי",
            type: "link",
            url: "https://open.spotify.com/user/zb1x4pnjevbxccyuykcv3kdnn?si=eb4c632fea114c95",
            icon: "images/icons/spotify.svg",
            cssClass: "spotify"
        }
    ]
};
