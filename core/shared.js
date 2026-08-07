/**
 * MOSHKO'S - Shared Components Manager
 * This file handles the shared Navigation, Background, and Footer across all pages.
 */

initTheme();

async function initSharedComponents() {
    initTheme();
    syncAnimations();
    initBackground();
    await initNavbar();
    initFooter();
    initFooter();
    initSettingsToggle();
    initRagdollPanel();
    // Re-apply translations after shared components rebuild the DOM
    if (window.MoshkoLang) window.MoshkoLang.apply();
}


/**
 * THEME MANAGER
 */
function initTheme() {
    // Use localStorage: dark by default, saves permanently
    const savedTheme = localStorage.getItem('moshko_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('moshko_theme', newTheme);

    // Update button icons if needed
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    if (sunIcon && moonIcon) {
        if (newTheme === 'light') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Play sound if available
    if (window.MoshkoSounds && window.MoshkoSounds.play) {
        window.MoshkoSounds.play('click');
    }
}

/**
 * SETTINGS TOGGLE COMPONENT (Combines Theme, Language, Mute)
 */
function initSettingsToggle() {
    if (document.getElementById('settings-container')) return;

    const container = document.createElement('div');
    container.className = 'settings-container';
    container.id = 'settings-container';

    const GEAR_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

    const SUN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const MOON_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const ICON_ON = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
    const ICON_OFF = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
    const RAGDOLL_ON_ICON = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"></circle><path d="M12 7v8M8 10h8M10 21v-6h4v6"></path></svg>`;
    const RAGDOLL_OFF_ICON = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"></circle><path d="M12 7v8M8 10h8M10 21v-6h4v6M3 3l18 18"></path></svg>`;

    container.innerHTML = `
        <div class="settings-dropdown">
            <button class="settings-btn" id="lang-btn" title="Toggle Language"><span class="lang-toggle-label">EN</span></button>
            <button class="settings-btn" id="theme-btn" title="Toggle Theme"></button>
            <button class="settings-btn" id="mute-btn" title="Toggle Mute"></button>
            <button class="settings-btn" id="ragdoll-toggle-btn" title="Toggle Ragdoll"></button>
        </div>
        <div class="settings-main-btn">
            ${GEAR_ICON}
        </div>
    `;

    document.body.appendChild(container);

    const langBtn = document.getElementById('lang-btn');
    const themeBtn = document.getElementById('theme-btn');
    const muteBtn = document.getElementById('mute-btn');

    // Init state
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeBtn.innerHTML = currentTheme === 'light' ? SUN_ICON : MOON_ICON;

    const isMuted = localStorage.getItem('moshko_muted') === 'true';
    if (isMuted) muteBtn.classList.add('is-muted');
    muteBtn.innerHTML = isMuted ? ICON_OFF : ICON_ON;

    const isHe = window.MoshkoLang && window.MoshkoLang.current === 'he';
    langBtn.querySelector('.lang-toggle-label').textContent = isHe ? 'HE' : 'EN';
    if (isHe) langBtn.setAttribute('data-lang', 'he');

    // Events
    langBtn.addEventListener('click', () => {
        if (window.MoshkoLang) window.MoshkoLang.toggle();
        const isNowHe = window.MoshkoLang && window.MoshkoLang.current === 'he';
        langBtn.querySelector('.lang-toggle-label').textContent = isNowHe ? 'HE' : 'EN';
        if (isNowHe) langBtn.setAttribute('data-lang', 'he');
        else langBtn.removeAttribute('data-lang');
    });

    themeBtn.addEventListener('click', () => {
        toggleTheme();
        const newTheme = document.documentElement.getAttribute('data-theme');
        themeBtn.innerHTML = newTheme === 'light' ? SUN_ICON : MOON_ICON;
    });

    muteBtn.addEventListener('click', () => {
        if (window.MoshkoSounds && window.MoshkoSounds.toggleMute) {
            const newState = window.MoshkoSounds.toggleMute();
            muteBtn.classList.toggle('is-muted', newState);
            muteBtn.innerHTML = newState ? ICON_OFF : ICON_ON;
        }
    });

    // Ragdoll Toggle Logic
    const ragdollBtn = document.getElementById('ragdoll-toggle-btn');
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let defaultRagdollState = isMobile ? 'false' : 'true';
    let currentRagdollState = localStorage.getItem('moshko_ragdoll');

    if (currentRagdollState === null) {
        currentRagdollState = defaultRagdollState;
        localStorage.setItem('moshko_ragdoll', currentRagdollState);
    }

    ragdollBtn.innerHTML = currentRagdollState === 'true' ? RAGDOLL_ON_ICON : RAGDOLL_OFF_ICON;
    if (currentRagdollState === 'false') ragdollBtn.classList.add('is-disabled');

    const applyRagdollVisibility = (isVisible) => {
        if (isVisible) {
            document.body.classList.remove('ragdoll-disabled');
        } else {
            document.body.classList.add('ragdoll-disabled');
        }
    };

    applyRagdollVisibility(currentRagdollState === 'true');

    ragdollBtn.addEventListener('click', () => {
        let newState = localStorage.getItem('moshko_ragdoll') === 'true' ? 'false' : 'true';
        localStorage.setItem('moshko_ragdoll', newState);
        ragdollBtn.innerHTML = newState === 'true' ? RAGDOLL_ON_ICON : RAGDOLL_OFF_ICON;
        ragdollBtn.classList.toggle('is-disabled', newState === 'false');
        applyRagdollVisibility(newState === 'true');
        if (window.MoshkoSounds && window.MoshkoSounds.play) {
            window.MoshkoSounds.play('click');
        }
    });
}



/**
 * BACKGROUND COMPONENT
 */
function initBackground() {
    const bgElement = document.querySelector('.space-background');
    if (!bgElement) return;

    // Prevent background reset between SPA navigations
    if (document.getElementById('star-canvas')) return;

    bgElement.innerHTML = `
        <div class="nebula"></div>
        <canvas id="star-canvas"></canvas>
        <canvas id="shooting-canvas"></canvas>
    `;

    // Star canvas
    const sc = document.getElementById('star-canvas');
    const sCtx = sc.getContext('2d');
    function resizeSC() { sc.width = window.innerWidth; sc.height = window.innerHeight; }
    resizeSC();
    window.addEventListener('resize', resizeSC);

    const STAR_COUNT = 320;
    // Seeded random for consistent stars on every page (even on full reloads)
    let state = 12345;
    function next() {
        state = (state * 48271) % 2147483647;
        return state / 2147483647;
    }

    const stars = Array.from({ length: STAR_COUNT }, () => ({
        x: next(),
        y: next(),
        r: next() < 0.12 ? (1.4 + next() * 1.2)
            : next() < 0.35 ? (0.7 + next() * 0.7)
                : (0.2 + next() * 0.4),
        speed: 0.3 + next() * 1.2,
        offset: next() * Math.PI * 2,
        tinted: next() < 0.18,
    }));

    function drawStars(t) {
        sCtx.clearRect(0, 0, sc.width, sc.height);
        stars.forEach(s => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.offset));

            // Allow stars to naturally drift left slowly over time
            const moveSpeed = s.speed * 0.015;
            let driftingX = (s.x - t * moveSpeed) % 1;
            if (driftingX < 0) driftingX += 1;

            const px = driftingX * sc.width, py = s.y * sc.height;

            if (s.r > 1.2) {
                const g = sCtx.createRadialGradient(px, py, 0, px, py, s.r * 3.5);
                const color = isLight ? `rgba(124, 62, 237, ${alpha * 0.4})` : (s.tinted ? `rgba(200,170,255,${alpha})` : `rgba(255,255,255,${alpha})`);
                g.addColorStop(0, color);
                g.addColorStop(1, 'rgba(0,0,0,0)');
                sCtx.beginPath();
                sCtx.arc(px, py, s.r * 3.5, 0, Math.PI * 2);
                sCtx.fillStyle = g;
                sCtx.fill();
            }
            sCtx.beginPath();
            sCtx.arc(px, py, s.r, 0, Math.PI * 2);
            sCtx.globalAlpha = alpha;
            sCtx.fillStyle = isLight ? '#7c3aed' : (s.tinted ? '#c4aaff' : '#ffffff');
            sCtx.fill();
            sCtx.globalAlpha = 1;
        });
    }

    // Shooting star canvas
    const shc = document.getElementById('shooting-canvas');
    const shCtx = shc.getContext('2d');
    function resizeSHC() { shc.width = window.innerWidth; shc.height = window.innerHeight; }
    resizeSHC();
    window.addEventListener('resize', resizeSHC);

    function spawnShooter() {
        return {
            x: Math.random() * shc.width * 1.1,
            y: Math.random() * shc.height * 0.45,
            len: 110 + Math.random() * 150,
            speed: 400 + Math.random() * 260,
            angle: Math.PI / 5 + (Math.random() - 0.5) * 0.25,
            life: 0,
            dur: 0.45 + Math.random() * 0.3,
            pink: Math.random() < 0.28,
        };
    }

    let shooters = [];
    let nextShot = 2 + Math.random() * 3;

    function drawShooters(dt) {
        shCtx.clearRect(0, 0, shc.width, shc.height);
        nextShot -= dt;
        if (nextShot <= 0) {
            shooters.push(spawnShooter());
            nextShot = 2.5 + Math.random() * 4;
        }
        shooters = shooters.filter(s => s.life < s.dur);
        shooters.forEach(s => {
            s.life += dt;
            const p = s.life / s.dur;
            const al = p < 0.15 ? p / 0.15 : Math.max(0, (1 - p) / 0.85);
            const dx = Math.cos(s.angle) * s.speed * s.life;
            const dy = Math.sin(s.angle) * s.speed * s.life;
            const tx = dx - Math.cos(s.angle) * s.len * p;
            const ty = dy - Math.sin(s.angle) * s.len * p;
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const grad = shCtx.createLinearGradient(s.x + tx, s.y + ty, s.x + dx, s.y + dy);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            if (isLight) {
                grad.addColorStop(1, s.pink ? `rgba(236,72,153,${al * 0.8})` : `rgba(124,62,237,${al * 0.8})`);
            } else {
                grad.addColorStop(1, s.pink
                    ? `rgba(236,130,220,${al * 0.95})`
                    : `rgba(255,255,255,${al * 0.92})`);
            }
            shCtx.beginPath();
            shCtx.moveTo(s.x + tx, s.y + ty);
            shCtx.lineTo(s.x + dx, s.y + dy);
            shCtx.strokeStyle = grad;
            shCtx.lineWidth = 1.8;
            shCtx.stroke();
        });
    }

    // Unified animation loop
    let lastBgT = performance.now();
    let bgElapsed = 0;
    function bgLoop(now) {
        const dt = Math.min((now - lastBgT) / 1000, 0.1);
        lastBgT = now;
        bgElapsed += dt;
        drawStars(bgElapsed);
        drawShooters(dt);
        requestAnimationFrame(bgLoop);
    }
    requestAnimationFrame(bgLoop);
}

async function initNavbar() {
    const normalizedPath = window.location.pathname.replace(/\\/g, '/');
    const isMinecraftDir = normalizedPath.includes('/pages/minecraft/');
    const isPagesDir = normalizedPath.includes('/pages/');

    let pbase, ibase, imgbase, basePath;

    if (isMinecraftDir) {
        pbase = '../';
        ibase = '../../';
        imgbase = '../../';
        basePath = '../../';
    } else if (isPagesDir) {
        pbase = '';
        ibase = '../';
        imgbase = '../';
        basePath = '../';
    } else {
        pbase = 'pages/';
        ibase = '';
        imgbase = '';
        basePath = './';
    }

    // Prefer info_data.js (loaded as a script tag) — fast, no fetch needed.
    // Falls back to site-config.json's contact section if INFO_DATA isn't loaded.
    let contactCfg;
    if (window.INFO_DATA) {
        contactCfg = { title: window.INFO_DATA.title, dropdownLinks: window.INFO_DATA.links };
    } else {
        // Fallback: load config if not already available
        if (!window.siteConfig) {
            try {
                const res = await fetch(basePath + 'core/site-config.json');
                if (res.ok) window.siteConfig = await res.json();
            } catch (e) {
                console.warn('Navbar: could not load site-config.json', e);
            }
        }
        contactCfg = window.siteConfig?.contact || {};
    }

    const title = contactCfg.title || '🔗 Contact Info';
    const links = contactCfg.dropdownLinks || [];

    // Translate contact title using MoshkoLang if available
    const isHe = window.MoshkoLang && window.MoshkoLang.current === 'he';
    const translatedTitle = (isHe && window.MoshkoLang) ? window.MoshkoLang.t('contact.title') : (contactCfg.title || '🔗 Contact Info');

    const dropdownItemsHTML = links.map(item => {
        // Use translated label if in Hebrew and label_he exists
        const label = (isHe && item.label_he) ? item.label_he : item.label;
        if (item.type === 'email') {
            return `
                <button class="contact-link ${item.cssClass}" onclick="sendGmail('${item.address}', this)">
                    <img src="${imgbase}${item.icon}" class="logo" alt="${label}">
                    <span class="dance">${label}</span>
                    <span class="arrow">&#10148;</span>
                </button>`;
        } else {
            return `
                <a href="${item.url}" target="_blank" class="contact-link ${item.cssClass}">
                    <img src="${imgbase}${item.icon}" class="logo" alt="${label}">
                    <span class="dance">${label}</span>
                    <span class="arrow">&#10148;</span>
                </a>`;
        }
    }).join('');

    const navbarHTML = `
        <div class="nav-container">
            <div class="logo-group">
                <div class="logo-container">
                    <a href="${pbase}home.html" class="logo-link">
                        <img src="${imgbase}images/logo.png" alt="Moshko's Core Logo" class="logo">
                        <span class="logo-dropdown-indicator">&#9660;</span>
                    </a>
                    <div class="logo-dropdown">
                        <div class="dropdown-section" dir="${isHe ? 'rtl' : 'ltr'}">
                            <h4 style="margin-top: 15px;">${translatedTitle}</h4>
                            <div class="integrated-contact-menu">
                                ${dropdownItemsHTML}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ul class="nav-menu" id="nav-menu">
                <li><a href="${pbase}home.html" class="nav-link" data-i18n="nav.home">Home</a></li>
                <li><a href="${pbase}updates.html" class="nav-link" data-i18n="nav.updates">Updates</a></li>
                <li><a href="${pbase}bar.html" class="nav-link" data-i18n="nav.bar">Bar Menu</a></li>
                <li><a href="${pbase}minecraft.html" class="nav-link" data-i18n="nav.minecraft">Minecraft</a></li>
                <li><a href="${pbase}games.html" class="nav-link" data-i18n="nav.games">Games</a></li>
            </ul>

            <div class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    const navbarElement = document.getElementById('navbar');
    if (navbarElement) {
        navbarElement.innerHTML = navbarHTML;
        setActiveLink();
        initHamburger();
    }
}



function initFooter() {
    const footerHTML = `
        <div class="container">
            <div class="footer-content">
                <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;" data-i18n="footer.credit">&#127828; Created By Shahar.M &#127866;</p>
            </div>
        </div>
    `;

    const footerElement = document.querySelector('.footer');
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
    }
}

/**
 * UTILITIES
 */
function syncAnimations() {
    let sitestartTime = sessionStorage.getItem('siteStartTime');
    if (!sitestartTime) {
        sitestartTime = Date.now();
        sessionStorage.setItem('siteStartTime', sitestartTime);
    }
    const elapsed = (Date.now() - sitestartTime) / 1000;
    document.documentElement.style.setProperty('--sync-delay', `-${elapsed}s`);
}

function setActiveLink() {
    const currentPath = window.location.pathname;
    const page = currentPath.split("/").pop() || "index.html";

    // Map subpages to their main navbar category
    let targetPage = page;
    if (page === "" || page === "index.html") {
        targetPage = "home.html";
    } else if (page === "resource-pack.html" || page === "builds.html") {
        targetPage = "minecraft.html";
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.endsWith(targetPage)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.onclick = function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        };

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }
}

if (typeof window.sendGmail === 'undefined') {
    window.sendGmail = function (email, btn) {
        navigator.clipboard.writeText(email).then(() => {
            const span = btn.querySelector('.dance');
            const original = span.textContent;
            span.textContent = 'Copied!';
            setTimeout(() => span.textContent = original, 1200);
        });
        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`, '_blank');
    };
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initSharedComponents();
    initSPARouting();

    // Initialize AOS once globally
    if (window.AOS) {
        AOS.init({ once: false, duration: 500, easing: 'ease-out' });
    }

    // Ensure initial content is visible instantly
    const contentRoot = document.getElementById('content-root');
    if (contentRoot) {
        requestAnimationFrame(() => {
            contentRoot.classList.add('is-visible');
        });
    }
});

/**
 * SPA ROUTING
 */
function initSPARouting() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !link.href) return;

        const targetUrl = new URL(link.href);
        const currentUrl = new URL(window.location.href);

        const cleanPath = (p) => p.replace(/\/$/, '').replace('home.html', '').replace('index.html', '');
        const targetPath = cleanPath(targetUrl.pathname);
        const currentPath = cleanPath(currentUrl.pathname);

        const isInternal = targetUrl.origin === currentUrl.origin || (targetUrl.protocol === 'file:' && currentUrl.protocol === 'file:');
        const isSamePage = targetPath === currentPath;

        if (isInternal && !link.target && !link.href.includes('#')) {
            if (!isSamePage) {
                e.preventDefault();
                navigateTo(link.href);
            } else {
                e.preventDefault();
            }
        }
    });

    window.addEventListener('popstate', () => {
        loadPage(window.location.href);
    });
}

function navigateTo(urlStr) {
    try {
        const absoluteUrl = new URL(urlStr, window.location.href).href;
        if (absoluteUrl === window.location.href) return;

        // Prevent SecurityError on local file:// protocol
        if (window.location.protocol !== 'file:') {
            history.pushState(null, '', absoluteUrl);
        }

        loadPage(absoluteUrl);
    } catch (err) {
        console.warn('History pushState failed, falling back to normal navigation:', err);
        window.location.href = urlStr;
    }
}

const SPA_SKIP_SCRIPTS = ['three.min.js', 'cannon.min.js', 'ragdoll_physics.js', 'ragdoll_background.js', 'shared.js', 'script.js', 'sounds.js'];

async function loadPage(url) {
    const contentRoot = document.getElementById('content-root');
    if (contentRoot) contentRoot.classList.remove('is-visible');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const newContent = doc.querySelector('#main-content') || doc.querySelector('main');

        if (newContent && contentRoot) {
            await new Promise(resolve => setTimeout(resolve, 300));

            contentRoot.innerHTML = '';
            contentRoot.appendChild(doc.importNode(newContent, true));

            initSharedComponents();

            if (window.updateRagdollWalls) {
                setTimeout(() => window.updateRagdollWalls(), 150);
            }

            await executePageScripts(doc);

            contentRoot.classList.add('is-visible');

            window.dispatchEvent(new Event('page-load'));
            if (typeof window.initPage === 'function') {
                window.initPage();
            }

            // Hard-refresh AOS so newly injected data-aos elements animate correctly
            if (window.AOS) {
                AOS.refreshHard();
            }

            // Scroll to top after new content is fully injected and rendered
            setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }, 50);
        } else {
            throw new Error('Content root not found');
        }
    } catch (err) {
        console.warn('SPA Navigation failed, falling back to full reload:', err);
        window.location.href = url;
    }
}

async function executePageScripts(doc) {
    const bodyScripts = Array.from(doc.querySelectorAll('body script'));

    for (const oldScript of bodyScripts) {
        const src = oldScript.getAttribute('src');
        if (src) {
            if (SPA_SKIP_SCRIPTS.some(s => src.includes(s))) continue;
            if (document.querySelector(`script[src="${src}"]`)) continue;
            await new Promise(resolve => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = resolve;
                s.onerror = resolve;
                document.head.appendChild(s);
            });
        } else if (oldScript.textContent.trim()) {
            const s = document.createElement('script');
            s.textContent = oldScript.textContent;
            document.head.appendChild(s);
        }
    }
}

// Ensure the navbar (specifically the Contact overlay which runs dynamically) updates on language shift
window.addEventListener('lang-change', async () => {
    await initNavbar();
    if (window.MoshkoLang) window.MoshkoLang.apply();
});

/**
 * RAGDOLL CONTROL PANEL (Skin + Grenade Slot)
 */
function initRagdollPanel() {
    if (document.getElementById('ragdoll-control-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'ragdoll-control-panel';
    panel.className = 'ragdoll-control-panel';

    const savedUser = localStorage.getItem('ragdoll_username') || '';

    panel.innerHTML = `
        <div class="skin-input-group">
            <input type="text" id="skin-username-global" placeholder="Username" data-i18n="skin.placeholder" value="${savedUser}">
            <button onclick="window.changeSkin(document.getElementById('skin-username-global').value)" class="panel-btn" data-i18n="skin.btn.change">Change</button>
            <button onclick="window.resetRagdoll()" class="panel-btn reset-btn" data-i18n="skin.btn.reset">Reset</button>
            <div class="inventory-slot" id="grenade-slot" onmousedown="handleGrenadeSlotClick(event)">
                <div class="grenade-icon"></div>
                <div id="grenade-cooldown" class="cooldown-overlay"></div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    // Sync input with storage updates
    const input = document.getElementById('skin-username-global');
    if (input) {
        input.addEventListener('input', (e) => {
            localStorage.setItem('ragdoll_username', e.target.value);
        });
    }
}

let lastGrenadeLog = 0;
const GRENADE_COOLDOWN_MS = 4000;

window.handleGrenadeSlotClick = (e) => {
    const now = Date.now();
    if (now - lastGrenadeLog < GRENADE_COOLDOWN_MS) return;
    
    if (window.spawnAndDragGrenade) {
        window.spawnAndDragGrenade(e);
        lastGrenadeLog = now;
        startGrenadeCooldownUI();
    }
};

function startGrenadeCooldownUI() {
    const overlay = document.getElementById('grenade-cooldown');
    if (!overlay) return;
    
    overlay.style.transition = 'none';
    overlay.style.height = '100%';
    
    // Force reflow
    overlay.offsetHeight;
    
    overlay.style.transition = `height ${GRENADE_COOLDOWN_MS}ms linear`;
    overlay.style.height = '0%';
}

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g') {
        const activeElement = document.activeElement;
        const isInput = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
        if (!isInput) {
            const now = Date.now();
            if (now - lastGrenadeLog >= GRENADE_COOLDOWN_MS) {
                if (window.throwGrenade) {
                    window.throwGrenade();
                    lastGrenadeLog = now;
                    startGrenadeCooldownUI();
                }
            }
        }
    }
});
