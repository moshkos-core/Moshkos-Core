/**
 * MOSHKO'S - Main Script
 * Comprehensive full-stack platform logic
 */

// ========================================
// Professional Toast Notification System
// ========================================
window.showToast = function (message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${getToastIcon(type)}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed; top:80px; right:20px; z-index:10000; display:flex; flex-direction:column; gap:10px;';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// ========================================
// Utility Functions
// ========================================
window.closeGame = function () {
    // Cleanup event listeners
    if (window._activeGameCleanup) {
        window._activeGameCleanup();
        window._activeGameCleanup = null;
    }

    const gameArea = document.getElementById('gameArea');
    if (gameArea) {
        gameArea.innerHTML = ''; // Clear the game area completely
        showToast('Game closed', 'info', 2000);
    }
};

function attachGameCardListeners() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            // Prevent double firing if clicking button inside card
            if (e.target.tagName === 'BUTTON') return;

            const gameId = card.getAttribute('data-game');
            if (gameId) {
                window.loadGame(gameId);
                const container = document.getElementById('gamesContainer');
                if (container) container.scrollIntoView({ behavior: 'smooth' });
            }
        };

        // Also handle button clicks specifically if present
        const btn = card.querySelector('.play-btn');
        if (btn) {
            btn.onclick = (e) => {
                e.stopPropagation(); // Stop bubbling to card
                const gameId = card.getAttribute('data-game');
                if (gameId) {
                    window.loadGame(gameId);
                    const container = document.getElementById('gamesContainer');
                    if (container) container.scrollIntoView({ behavior: 'smooth' });
                }
            };
        }
    });
}

// ========================================
// Main Initialization
// ========================================
window.initPage = function () {
    console.log('Initializing Page Logic...');
    // Attach listeners to any static game cards immediately
    attachGameCardListeners();

    // Load dynamic site content (updates, games grid, etc.)
    loadSiteContent();

    // Ensure any previously active games are cleaned up if we switched pages
    if (window._activeGameCleanup) {
        window._activeGameCleanup();
        window._activeGameCleanup = null;
    }

    // Refresh game area if it exists
    const gameArea = document.getElementById('gameArea');
    if (gameArea) gameArea.innerHTML = '';
};

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.initPage();
});

// Also initialize on SPA page load
window.addEventListener('page-load', () => {
    window.initPage();
});

// Dropdown logic is now handled in navbar.js

window.sendGmail = function (email, btn) {
    navigator.clipboard.writeText(email).then(() => {
        const span = btn.querySelector('.dance');
        const original = span.textContent;
        span.textContent = 'Copied!';
        setTimeout(() => span.textContent = original, 1200);
    });
    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`, '_blank');
};

// ========================================
// Dragon Cursor Trail
// ========================================
function initDragonTrail() {
    const canvas = document.createElement('canvas');
    canvas.id = 'dragonTrail';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let particles = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 2; i++) {
            particles.push({
                x: e.clientX, y: e.clientY,
                size: Math.random() * 5 + 2,
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                life: 1, color: `hsl(${Math.random() * 40 + 260}, 80%, 60%)`
            });
        }
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.02;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            if (p.life <= 0) particles.splice(i, 1);
        });
        requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
}

// ========================================
// ========================================
// Matter.js "Dragon-Steve" Ragdoll v6.0 - ENHANCED PERSONALITY
// ========================================
function initMatterRagdoll() {
    if (typeof Matter === 'undefined') return;
    const { Engine, Render, Runner, Bodies, Composite, Constraint, MouseConstraint, Mouse, Body, Vector } = Matter;

    const canvas = document.getElementById('ragdollCanvas');
    if (!canvas) return;

    const engine = Engine.create({
        gravity: { y: 1.5 } // Increased gravity for more realistic falls
    });
    const world = engine.world;
    const runner = Runner.create();

    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: window.innerWidth, height: window.innerHeight,
            wireframes: false, background: 'transparent'
        }
    });

    // World Bounds
    const thickness = 100;
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + thickness / 2, window.innerWidth, thickness, {
        isStatic: true,
        friction: 0.8,
        restitution: 0.3 // Add bounce
    });
    const wallL = Bodies.rectangle(-thickness / 2, window.innerHeight / 2, thickness, window.innerHeight, { isStatic: true });
    const wallR = Bodies.rectangle(window.innerWidth + thickness / 2, window.innerHeight / 2, thickness, window.innerHeight, { isStatic: true });
    const ceiling = Bodies.rectangle(window.innerWidth / 2, -thickness / 2, window.innerWidth, thickness, { isStatic: true });
    Composite.add(world, [ground, wallL, wallR, ceiling]);

    function createCharacter(x, y) {
        const group = Body.nextGroup(true);
        // CORRECTED MINECRAFT USERNAME
        const skinUrl = "https://mc-heads.net/avatar/MoshkoThoughts_/64";

        // Minecraft Dimensions with enhanced physics properties
        const head = Bodies.rectangle(x, y - 100, 48, 48, {
            mass: 2.5,
            friction: 0.5,
            frictionAir: 0.02, // Air resistance
            restitution: 0.1, // Less bouncy
            collisionFilter: { group: group },
            render: { sprite: { texture: skinUrl, xScale: 0.75, yScale: 0.75 } }
        });

        const torso = Bodies.rectangle(x, y - 24, 48, 72, {
            mass: 5,
            friction: 0.5,
            frictionAir: 0.02,
            restitution: 0.1,
            collisionFilter: { group: group },
            render: { fillStyle: '#3c44aa' }
        });

        const uArmL = Bodies.rectangle(x - 36, y - 40, 24, 40, { mass: 1.2, frictionAir: 0.01, collisionFilter: { group: group }, render: { fillStyle: '#9c6c4c' } });
        const uArmR = Bodies.rectangle(x + 36, y - 40, 24, 40, { mass: 1.2, frictionAir: 0.01, collisionFilter: { group: group }, render: { fillStyle: '#9c6c4c' } });
        const lArmL = Bodies.rectangle(x - 36, y, 20, 40, { mass: 1, frictionAir: 0.01, collisionFilter: { group: group }, render: { fillStyle: '#bd8e72' } });
        const lArmR = Bodies.rectangle(x + 36, y, 20, 40, { mass: 1, frictionAir: 0.01, collisionFilter: { group: group }, render: { fillStyle: '#bd8e72' } });

        const uLegL = Bodies.rectangle(x - 12, y + 48, 24, 48, { mass: 2.5, frictionAir: 0.01, collisionFilter: { group: group }, render: { fillStyle: '#2c2c2c' } });
        const uLegR = Bodies.rectangle(x + 12, y + 48, 24, 48, { mass: 2.5, frictionAir: 0.01, collisionFilter: { group: group }, render: { fillStyle: '#2c2c2c' } });
        const lLegL = Bodies.rectangle(x - 12, y + 96, 24, 48, { mass: 2.5, friction: 1.0, frictionAir: 0.01, collisionFilter: { group: group }, render: { fillStyle: '#1a1a1a' } });
        const lLegR = Bodies.rectangle(x + 12, y + 96, 24, 48, { mass: 2.5, friction: 1.0, frictionAir: 0.01, collisionFilter: { group: group }, render: { fillStyle: '#1a1a1a' } });

        // Enhanced joints with variable stiffness for more personality
        const neck = Constraint.create({ bodyA: head, bodyB: torso, pointA: { x: 0, y: 24 }, pointB: { x: 0, y: -36 }, stiffness: 0.85, damping: 0.1 });
        const shL = Constraint.create({ bodyA: torso, bodyB: uArmL, pointA: { x: -24, y: -30 }, pointB: { x: 12, y: -15 }, stiffness: 0.7, damping: 0.05 });
        const shR = Constraint.create({ bodyA: torso, bodyB: uArmR, pointA: { x: 24, y: -30 }, pointB: { x: -12, y: -15 }, stiffness: 0.7, damping: 0.05 });
        const elL = Constraint.create({ bodyA: uArmL, bodyB: lArmL, pointA: { x: 0, y: 15 }, pointB: { x: 0, y: -15 }, stiffness: 0.65, damping: 0.05 });
        const elR = Constraint.create({ bodyA: uArmR, bodyB: lArmR, pointA: { x: 0, y: 15 }, pointB: { x: 0, y: -15 }, stiffness: 0.65, damping: 0.05 });
        const hpL = Constraint.create({ bodyA: torso, bodyB: uLegL, pointA: { x: -12, y: 36 }, pointB: { x: 0, y: -24 }, stiffness: 0.75, damping: 0.05 });
        const hpR = Constraint.create({ bodyA: torso, bodyB: uLegR, pointA: { x: 12, y: 36 }, pointB: { x: 0, y: -24 }, stiffness: 0.75, damping: 0.05 });
        const knL = Constraint.create({ bodyA: uLegL, bodyB: lLegL, pointA: { x: 0, y: 24 }, pointB: { x: 0, y: -24 }, stiffness: 0.7, damping: 0.05 });
        const knR = Constraint.create({ bodyA: uLegR, bodyB: lLegR, pointA: { x: 0, y: 24 }, pointB: { x: 0, y: -24 }, stiffness: 0.7, damping: 0.05 });

        return {
            bodies: [head, torso, uArmL, uArmR, lArmL, lArmR, uLegL, uLegR, lLegL, lLegR],
            constraints: [neck, shL, shR, elL, elR, hpL, hpR, knL, knR],
            parts: { head, torso, uArmL, uArmR, lArmL, lArmR, uLegL, uLegR, lLegL, lLegR }
        };
    }

    let character = createCharacter(window.innerWidth / 2, 300);
    Composite.add(world, [...character.bodies, ...character.constraints]);

    // ========================================
    // PERSONALITY SYSTEM
    // ========================================
    let idleTimer = 0;
    let recoveryAttempts = 0;
    let lastMousePos = { x: 0, y: 0 };

    // Idle Animations - Random movements when not being interacted with
    function applyIdleAnimations() {
        idleTimer++;

        if (idleTimer > 120 && Math.random() < 0.01) { // Random head bob
            Body.applyForce(character.parts.head, character.parts.head.position, {
                x: (Math.random() - 0.5) * 0.001,
                y: -0.0005
            });
        }

        if (idleTimer > 180 && Math.random() < 0.005) { // Random arm sway
            const arm = Math.random() < 0.5 ? character.parts.lArmL : character.parts.lArmR;
            Body.applyForce(arm, arm.position, {
                x: (Math.random() - 0.5) * 0.002,
                y: 0
            });
        }
    }

    // Mouse Reaction - Character reacts to nearby cursor
    function reactToMouse(mousePos) {
        const headPos = character.parts.head.position;
        const dist = Math.sqrt(Math.pow(mousePos.x - headPos.x, 2) + Math.pow(mousePos.y - headPos.y, 2));

        if (dist < 150 && dist > 50) { // If mouse is nearby but not touching
            const away = {
                x: (headPos.x - mousePos.x) * 0.00001,
                y: (headPos.y - mousePos.y) * 0.00001
            };
            Body.applyForce(character.parts.torso, character.parts.torso.position, away);
        }
    }

    // Recovery Behavior - Try to stand up when stable
    function attemptRecovery() {
        const torso = character.parts.torso;
        const isStable = Math.abs(torso.velocity.x) < 0.5 && Math.abs(torso.velocity.y) < 0.5;
        const isUpsideDown = Math.abs(torso.angle) > Math.PI / 4;

        if (isStable && isUpsideDown && recoveryAttempts < 3) {
            recoveryAttempts++;
            // Apply upward force to try to flip back
            Body.applyForce(torso, torso.position, { x: 0, y: -0.05 });
            Body.setAngularVelocity(torso, (Math.random() - 0.5) * 0.1);

            setTimeout(() => recoveryAttempts = Math.max(0, recoveryAttempts - 1), 2000);
        } else if (!isStable) {
            recoveryAttempts = 0;
        }
    }

    // Update loop for personality
    setInterval(() => {
        applyIdleAnimations();
        reactToMouse(lastMousePos);
        if (Math.random() < 0.1) attemptRecovery();
    }, 50);

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } }
    });
    Composite.add(world, mouseConstraint);

    // Track mouse position
    canvas.addEventListener('mousemove', (e) => {
        lastMousePos = { x: e.clientX, y: e.clientY };
        idleTimer = 0; // Reset idle when mouse moves
    });

    canvas.addEventListener('mousedown', (e) => {
        const mousePos = { x: e.clientX, y: e.clientY };
        const bodyUnder = Matter.Query.point(Composite.allBodies(world), mousePos)[0];
        if (bodyUnder && !bodyUnder.isStatic) {
            Body.applyForce(bodyUnder, mousePos, {
                x: (mousePos.x - bodyUnder.position.x) * 0.05,
                y: -1.5
            });
            bodyUnder.render.opacity = 0.5;
            setTimeout(() => bodyUnder.render.opacity = 1, 100);
            idleTimer = 0;
        }
    });

    Render.run(render);
    Runner.run(runner, engine);

    window.addEventListener('resize', () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + thickness / 2 });
    });
}


// ========================================
// Dragon/Beer Games
// ========================================


window.loadGame = function (id, autoStart = true) {
    const area = document.getElementById('gameArea');
    if (!area) return;

    // Cleanup previous game's event listeners
    if (window._activeGameCleanup) {
        window._activeGameCleanup();
        window._activeGameCleanup = null;
    }

    // Clear the area and show loading if needed
    area.innerHTML = '<div class="game-container"><p>Loading cosmic experience...</p></div>';

    // If id is null or 'close', close the game
    if (!id || id === 'close') {
        window.closeGame();
        return;
    }

    // Map of game IDs to their script files and loader functions
    const gameMap = {
        'clicker': { file: 'games/clicker.js', func: 'loadClicker' },
        'snake': { file: 'games/snake.js', func: 'loadSnake' },
        '2048': { file: 'games/2048.js', func: 'load2048' },
        'flappy': { file: 'games/flappy.js', func: 'loadFlappy' },
        'stack': { file: 'games/stack.js', func: 'loadStack' },
        'race': { file: 'games/race.js', func: 'loadRace' },
        'pong': { file: 'games/pong.js', func: 'loadPong' },
        'breath': { file: 'games/breath.js', func: 'loadBreath' }
    };

    const gameConfig = gameMap[id];

    if (gameConfig) {
        // Compute base path relative to current page location
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';

        // Check if script is already loaded
        const scriptId = `script-game-${id}`;
        if (document.getElementById(scriptId)) {
            if (typeof window[gameConfig.func] === 'function') {
                window[gameConfig.func](area, autoStart);
            }
        } else {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = basePath + gameConfig.file;
            script.onload = () => {
                if (typeof window[gameConfig.func] === 'function') {
                    window[gameConfig.func](area, autoStart);
                } else {
                    area.innerHTML = '<div class="game-container"><h3>Error loading game logic.</h3></div>';
                }
            };
            script.onerror = () => {
                area.innerHTML = '<div class="game-container"><h3>Failed to load game file.</h3></div>';
            };
            document.body.appendChild(script);
        }
    } else {
        area.innerHTML = `
            <div class="game-container">
                <h3>🚀 ${id.toUpperCase()} Edition coming soon! 🚀</h3>
                <p>The dragons are currently brewing this experience.</p>
                <button onclick="loadGame('clicker')" class="btn btn-secondary">Play Clicker Instead</button>
            </div>`;
    }
};

/**
 * GAME COUNTDOWN SYSTEM
 * Shows a 3-2-1 countdown overlay before starting a game
 */
window.showGameCountdown = function (containerEl, onComplete) {
    // Create countdown overlay
    const overlay = document.createElement('div');
    overlay.id = 'game-countdown-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        border-radius: 15px;
    `;

    const countdownNumber = document.createElement('div');
    countdownNumber.style.cssText = `
        font-family: 'Orbitron', sans-serif;
        font-size: 120px;
        font-weight: bold;
        color: #00ffff;
        text-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #8B5CF6;
        animation: countdownPulse 0.5s ease-in-out;
    `;

    const readyText = document.createElement('div');
    readyText.style.cssText = `
        font-family: 'Orbitron', sans-serif;
        font-size: 24px;
        color: #a78bfa;
        margin-top: 20px;
        text-transform: uppercase;
        letter-spacing: 4px;
    `;
    readyText.textContent = 'GET READY';

    overlay.appendChild(countdownNumber);
    overlay.appendChild(readyText);

    // Add keyframe animation to document if not exists
    if (!document.getElementById('countdown-keyframes')) {
        const style = document.createElement('style');
        style.id = 'countdown-keyframes';
        style.textContent = `
            @keyframes countdownPulse {
                0% { transform: scale(0.5); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes countdownGo {
                0% { transform: scale(1); }
                50% { transform: scale(1.5); color: #00ff00; text-shadow: 0 0 50px #00ff00; }
                100% { transform: scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Find the game container to append the overlay
    const gameContainer = containerEl.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.style.position = 'relative';
        gameContainer.appendChild(overlay);
    } else {
        containerEl.style.position = 'relative';
        containerEl.appendChild(overlay);
    }

    let count = 3;
    countdownNumber.textContent = count;
    countdownNumber.style.color = '#ff0000'; // Start with red
    countdownNumber.style.textShadow = '0 0 30px #ff0000, 0 0 60px #ff0000, 0 0 90px #ff0000';

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count;
            countdownNumber.style.animation = 'none';
            countdownNumber.offsetHeight; // Trigger reflow
            countdownNumber.style.animation = 'countdownPulse 0.5s ease-in-out';

            // Change color as countdown progresses: red -> orange -> yellow
            if (count === 2) {
                countdownNumber.style.color = '#ff8800';
                countdownNumber.style.textShadow = '0 0 30px #ff8800, 0 0 60px #ff8800, 0 0 90px #ff8800';
            }
            if (count === 1) {
                countdownNumber.style.color = '#ffff00';
                countdownNumber.style.textShadow = '0 0 30px #ffff00, 0 0 60px #ffff00, 0 0 90px #ffff00';
            }
        } else {
            countdownNumber.textContent = 'GO!';
            countdownNumber.style.color = '#00ff00';
            countdownNumber.style.textShadow = '0 0 30px #00ff00, 0 0 60px #00ff00, 0 0 90px #00ff00';
            countdownNumber.style.animation = 'countdownGo 0.5s ease-out forwards';
            readyText.style.display = 'none';

            setTimeout(() => {
                overlay.remove();
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }, 500);
            clearInterval(countdownInterval);
        }
    }, 1000);
};




// ========================================
// Utilities & Helpers
// ========================================
// ========================================
// Centralized Site Configuration Loader
// ========================================
// Initialize siteConfig globally (might be pre-loaded via site-config.js)
window.siteConfig = window.siteConfig || null;

async function loadSiteContent() {
    try {
        if (!window.siteConfig) {
            console.warn('siteConfig not found, falling back to fetch...');
            try {
                const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
                const response = await fetch(basePath + 'core/site-config.json');
                if (response.ok) window.siteConfig = await response.json();
            } catch (e) {
                console.error('Fetch fallback failed:', e);
            }
        }

        if (!window.siteConfig) {
            console.error('Critical: Site configuration could not be loaded.');
            return;
        }

        // 1. Appy Site Metadata
        if (window.siteConfig.site) {
            document.title = window.siteConfig.site.title || document.title;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = window.siteConfig.site.description;

            // Apply Copyright & Credits
            const footerContent = document.querySelector('.footer-content');
            if (footerContent) {
                footerContent.innerHTML = `
                    <p>${window.siteConfig.site.copyright}</p>
                    <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">${window.siteConfig.site.footerCredits}</p>
                `;
            }
        }

        // 2. Apply Navigation
        if (window.siteConfig.navigation) {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href').replace('.html', '');
                if (window.siteConfig.navigation[href]) {
                    link.textContent = window.siteConfig.navigation[href];
                }
            });
        }

        // 3. Apply Hero Section
        if (window.siteConfig.hero) {
            const title = document.getElementById('dynHeroTitle');
            const subtitle = document.getElementById('dynHeroSubtitle');
            const btns = document.querySelectorAll('.hero-buttons .btn');

            if (title) title.textContent = window.siteConfig.hero.title;
            if (subtitle) subtitle.textContent = window.siteConfig.hero.subtitle;
            if (btns[0] && window.siteConfig.hero.btnPlay) btns[0].textContent = window.siteConfig.hero.btnPlay;
            if (btns[1] && window.siteConfig.hero.btnExplore) btns[1].textContent = window.siteConfig.hero.btnExplore;
        }

        // 4. Apply About Section
        if (window.siteConfig.about) {
            const titleEl = document.querySelector('#about .section-title');
            const bioContainer = document.getElementById('bioContent');

            // Disabled to prevent raw fetch JSON encoding issues from overwriting valid HTML
            // if (titleEl) titleEl.textContent = window.siteConfig.about.title;
            // if (bioContainer && window.siteConfig.about.bio) {
            //     bioContainer.innerHTML = window.siteConfig.about.bio
            //         .map(p => `<p>${p}</p>`)
            //         .join('');
            // }
        }

        // 5. Apply Quick Links
        if (window.siteConfig.quickLinks) {
            const titleEl = document.querySelector('.quick-links-section .section-title');
            if (titleEl) titleEl.textContent = window.siteConfig.quickLinks.title;

            const cards = document.querySelectorAll('.quick-link-card');
            const keys = ['updates', 'games', 'minecraft'];
            cards.forEach((card, i) => {
                const config = window.siteConfig.quickLinks[keys[i]];
                if (config) {
                    const h3 = card.querySelector('h3');
                    const p = card.querySelector('p');
                    if (h3) h3.textContent = config.title;
                    if (p) p.textContent = config.desc;
                }
            });
        }

        // 6. Page Specific Loaders
        if (document.getElementById('updatesContainer')) loadUpdates();
        if (document.getElementById('gamesContainer')) populateGamesGrid();
        if (document.querySelector('.minecraft-section')) populateMinecraftContent();

        // Refresh AOS after injections
        if (window.AOS) window.AOS.refresh();

    } catch (e) {
        console.error('Error loading site configuration:', e);
        showToast('Failed to load site content. Please refresh.', 'error');
    }
}

async function loadUpdates() {
    const container = document.getElementById('updatesContainer');
    if (!container) return;

    // Preference: Use global UPDATES_DATA (from updates_data.js) if available
    const rawUpdates = window.UPDATES_DATA || (window.siteConfig ? window.siteConfig.updates : []);
    if (!rawUpdates || rawUpdates.length === 0) return;

    const isHomePage = window.location.pathname.includes('home.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';
    
    // Explicitly sort by order/date, using array order as a tie-breaker
    const config = window.UPDATES_CONFIG || { sortOrder: 'desc' };
    const sortedUpdates = [...rawUpdates]
        .map((u, i) => ({ ...u, _index: i }))
        .sort((a, b) => {
            const isDesc = config.sortOrder === 'desc';
            
            // 1. Manual Order Priority (e.g., if 1 is oldest, then in 'desc' mode highest order comes first)
            if (a.order !== undefined && b.order !== undefined) {
                return isDesc ? b.order - a.order : a.order - b.order;
            }
            if (a.order !== undefined) return isDesc ? -1 : 1;
            if (b.order !== undefined) return isDesc ? 1 : -1;

            // 2. Date Sort
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            let dateDiff = isDesc ? dateB - dateA : dateA - dateB;
            
            // 3. Fallback: Array Index
            return dateDiff !== 0 ? dateDiff : a._index - b._index;
        });
        
    const updates = isHomePage ? sortedUpdates.slice(0, 3) : sortedUpdates;

    container.innerHTML = updates.map(update => `
        <div class="update-card glass-card" data-aos="fade-up">
            <div class="update-icon">${update.icon}</div>
            <div class="update-content">
                <h3>${update.title}</h3>
                <div class="update-meta">
                    <span class="update-version">${update.version || ''}</span>
                    <span class="update-date">${update.date}</span>
                </div>
                <p>${update.desc || update.description}</p>
                <a href="updates.html" class="btn btn-primary btn-sm">Read More</a>
            </div>
        </div>
    `).join('');
}

function populateGamesGrid() {
    const container = document.querySelector('.games-grid');
    if (!container || !window.siteConfig || !window.siteConfig.games) return;

    const title = document.getElementById('dynGamesTitle');
    const subtitle = document.getElementById('dynGamesSubtitle');
    if (title) title.textContent = "Moshko's Games";
    if (subtitle) subtitle.textContent = "Play a game and enjoy my site!";

    container.innerHTML = window.siteConfig.games.map((game, i) => `
        <div class="game-card glass-card" data-aos="zoom-in" data-aos-delay="${i * 50}" data-game="${game.id}">
            <div class="game-icon">${game.icon}</div>
            <h3>${game.title}</h3>
            <p>${game.desc}</p>
        </div>
    `).join('');

    // Attach listeners to newly created cards
    attachGameCardListeners();
}

function populateMinecraftContent() {
    if (!window.siteConfig || !window.siteConfig.minecraft) return;
    const config = window.siteConfig.minecraft;

    const title = document.getElementById('dynMinecraftTitle');
    const subtitle = document.getElementById('dynMinecraftSubtitle');
    if (title) title.textContent = "Minecraft World";
    if (subtitle) subtitle.textContent = "Custom packs and amazing builds from Moshko's Core";

    const packTitle = document.getElementById('dynPackTitle');
    const packDesc = document.getElementById('dynPackDesc');
    const buildsTitle = document.getElementById('dynBuildsTitle');
    const buildsDesc = document.getElementById('dynBuildsDesc');

    if (packTitle) packTitle.textContent = config.packsTitle;
    if (buildsTitle) buildsTitle.textContent = config.buildsTitle;

    // You could also map the actual pack/build items if the HTML was ready for it
}

function initContentLoaders() { }
function initFormHandling() { }
function initScrollIndicator() { }

function createStars() {
    const c = document.querySelector('.stars');
    if (!c) return;
    for (let i = 0; i < 100; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.animationDelay = Math.random() * 5 + 's';
        c.appendChild(s);
    }
}

window.sendGmail = function (email, btn) {
    navigator.clipboard.writeText(email).then(() => {
        const span = btn.querySelector('.dance');
        const original = span.textContent;
        span.textContent = 'Copied!';
        setTimeout(() => { span.textContent = original; }, 1200);
    });
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`;
    window.open(gmailUrl, '_blank');
}

console.log('%c🎮 MOSHKO\'S 🎮', 'font-size: 20px; color: #8B5CF6;');

// ========================================
// Cool Modern Custom Mouse
// ========================================
function initCoolMouse() {
    const style = document.createElement('style');
    style.innerHTML = `
        * { cursor: none !important; }

        /* ── Crosshair center ── */
        .cool-mouse-dot {
            width: 9px;
            height: 9px;
            background: radial-gradient(circle, #fff 20%, #EC4899 80%);
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 2147483648 !important;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px #EC4899, 0 0 22px rgba(139, 92, 246, 0.9);
            /* No transition - instant snap to cursor for zero-lag feel */
        }
        /* Horizontal tick marks */
        .cool-mouse-dot::before {
            content: '';
            position: absolute;
            width: 22px; height: 2px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(90deg, #8B5CF6, transparent 28%, transparent 72%, #8B5CF6);
        }
        /* Vertical tick marks */
        .cool-mouse-dot::after {
            content: '';
            position: absolute;
            width: 2px; height: 22px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(180deg, #8B5CF6, transparent 28%, transparent 72%, #8B5CF6);
        }

        /* ── Outer rotating ring ── */
        .cool-mouse-ring {
            width: 42px; height: 42px;
            border: 2px dashed rgba(139, 92, 246, 0.7);
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 2147483647 !important;
            transform: translate(-50%, -50%);
            transition: width 0.15s, height 0.15s, border-color 0.15s, box-shadow 0.15s;
            animation: cursor-spin 4s linear infinite;
            box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
        }
        @keyframes cursor-spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to   { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Hover states */
        .cool-mouse-dot.hovering {
            width: 12px; height: 12px;
            box-shadow: 0 0 16px #EC4899, 0 0 36px rgba(139, 92, 246, 0.9);
        }
        .cool-mouse-ring.hovering {
            width: 58px; height: 58px;
            border-color: rgba(236, 72, 153, 0.85);
            border-style: solid;
            box-shadow: 0 0 16px rgba(236, 72, 153, 0.45);
            animation: cursor-spin 1.5s linear infinite;
        }
    `;
    document.head.appendChild(style);

    const dot = document.createElement('div');
    dot.className = 'cool-mouse-dot';
    const ring = document.createElement('div');
    ring.className = 'cool-mouse-ring';

    function ensureCursorOnTop() {
        // Always keep cursor as last DOM siblings so they paint over everything
        if (document.body.lastChild !== ring) {
            document.body.appendChild(dot);
            document.body.appendChild(ring);
        }
    }

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Watch for any new elements being injected (ragdoll canvas, etc) and push cursor back on top
    const observer = new MutationObserver(() => {
        if (document.body.lastChild !== ring) {
            document.body.appendChild(dot);
            document.body.appendChild(ring);
        }
    });
    observer.observe(document.body, { childList: true });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    function renderRing() {
        ringX += (mouseX - ringX) * 0.6;
        ringY += (mouseY - ringY) * 0.6;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(renderRing);
    }
    renderRing();

    document.addEventListener('mouseover', (e) => {
        if (!e.target || typeof e.target.closest !== 'function') return;
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('[role="button"]') || e.target.closest('.game-card') || e.target.closest('input')) {
            dot.classList.add('hovering');
            ring.classList.add('hovering');
        } else {
            dot.classList.remove('hovering');
            ring.classList.remove('hovering');
        }
    });
}
document.addEventListener('DOMContentLoaded', initCoolMouse);
window.addEventListener('page-load', () => {
    if (!document.querySelector('.cool-mouse-dot')) initCoolMouse();
});
