/**
 * DRAGON BREATH — Space Invaders
 */
window.loadBreath = function (el, autoStart = true) {
    if (!document.getElementById('game-theme-css')) {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const link = document.createElement('link');
        link.id = 'game-theme-css'; link.rel = 'stylesheet';
        link.href = basePath + 'design/game-theme.css';
        document.head.appendChild(link);
    }
    el.innerHTML = `
        <div class="game-wrapper">
            <div class="game-title-label">👾 DRAGON BREATH — Defend the brewery with cosmic fire!</div>
            <div class="game-hud">
                <div class="game-hud-stat">SCORE: <span id="breath-score">0</span></div>
                <div class="game-hud-hint">A/D + SPACE / MOUSE + CLICK</div>
                <div class="game-hud-stat">WAVE: <span id="breath-wave">1</span></div>
            </div>
            <div class="game-canvas-wrap">
                <canvas id="breath-canvas" width="500" height="500" style="cursor: none;"></canvas>
                <div class="game-scanlines"></div>
            </div>
            <div class="game-controls">
                <button id="restartBreath" class="btn btn-primary">RESTART</button>
                <button class="btn btn-secondary" onclick="window.loadGame(null)">ABORT MISSION</button>
            </div>
        </div>`;

    const canvas = document.getElementById('breath-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Game State
    let aliens = [], fireballs = [], bombs = [], particles = [];
    let player = { x: 250, y: 460, w: 40, h: 40, dead: false, dx: 0 };
    let score = 0, wave = 1, gameLoop = null;
    let keys = {};
    let alienDirection = 1;
    let alienSpeed = 0.5;
    let alienStepDown = 15;
    let lastFire = 0;
    let screenShake = 0;

    function reset() {
        aliens = []; fireballs = []; bombs = []; particles = [];
        player = { x: 250, y: 460, w: 40, h: 40, dead: false, dx: 0 };
        score = 0; wave = 1; screenShake = 0;
        alienDirection = 1;
        alienSpeed = 0.5 + (wave * 0.2);

        spawnAliens();
        updateUI();

        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, 1000 / 60);
    }

    function spawnAliens() {
        const rows = 5;
        const cols = 10;
        const spacing = 40;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                aliens.push({
                    x: 40 + c * spacing,
                    y: 60 + r * 35,
                    w: 25,
                    h: 20,
                    type: r === 0 ? '🛸' : (r < 3 ? '👾' : '👽'),
                    color: r === 0 ? '#ff00ea' : (r < 3 ? '#00ff00' : '#00ffff'),
                    alive: true,
                    offset: Math.random() * Math.PI * 2
                });
            }
        }
    }

    function updateUI() {
        const sEl = document.getElementById('breath-score');
        const wEl = document.getElementById('breath-wave');
        if (sEl) sEl.textContent = score;
        if (wEl) wEl.textContent = wave;
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            particles.push({
                x, y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                life: 1.0,
                color: color || '#fff'
            });
        }
    }

    function fire() {
        if (player.dead) return;
        const now = Date.now();
        if (now - lastFire < 250) return; // Fire rate limit 0.25s

        fireballs.push({ x: player.x, y: player.y - 15, w: 4, h: 12 });
        lastFire = now;
    }

    function gameStep() {
        if (player.dead) return;

        // Player Movement
        if (keys['a'] || keys['ArrowLeft']) player.x -= 6;
        if (keys['d'] || keys['ArrowRight']) player.x += 6;

        // Clamp
        if (player.x < 20) player.x = 20;
        if (player.x > 480) player.x = 480;

        // Move Aliens
        let edgeRight = false;
        let edgeLeft = false;
        let lowestY = 0;
        let aliveCount = 0;

        aliens.forEach(a => {
            if (!a.alive) return;
            aliveCount++;
            a.x += alienSpeed * alienDirection;
            if (a.x >= 475) edgeRight = true;
            if (a.x <= 25) edgeLeft = true;
            if (a.y > lowestY) lowestY = a.y;

            // Alien Bombardment
            if (Math.random() < 0.002 + (wave * 0.0005)) {
                bombs.push({ x: a.x, y: a.y + 10, w: 3, h: 10 });
            }
        });

        // Reverse direction only if moving towards the edge
        if ((edgeRight && alienDirection > 0) || (edgeLeft && alienDirection < 0)) {
            alienDirection *= -1;
            aliens.forEach(a => a.y += alienStepDown);
            alienSpeed += 0.05; // Speed up on edge
        }

        // Win Condition: Wave Clear
        if (aliveCount === 0) {
            wave++;
            alienSpeed = 0.5 + (wave * 0.2);
            spawnAliens();
            updateUI();
        }

        // Loss Condition: Breach
        if (lowestY > 440) {
            triggerGameOver("BREACHED!");
        }

        // Update Projectiles
        fireballs.forEach(f => f.y -= 9);
        bombs.forEach(b => b.y += 4);
        fireballs = fireballs.filter(f => f.y > 0);
        bombs = bombs.filter(b => b.y < 510);

        // Update Particles
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.life -= 0.03;
        });
        particles = particles.filter(p => p.life > 0);

        // Collisions: Fireball -> Alien
        fireballs.forEach((f) => {
            if (f.hit) return;
            aliens.forEach(a => {
                if (!a.alive || f.hit) return;
                // Rectangle collision is more intuitive for invaders
                if (f.x > a.x - 15 && f.x < a.x + 15 && f.y > a.y - 10 && f.y < a.y + 10) {
                    a.alive = false;
                    f.hit = true;
                    score += 100;
                    updateUI();
                    createExplosion(a.x, a.y, a.color);
                    screenShake = 5;
                }
            });
        });
        fireballs = fireballs.filter(f => !f.hit);

        // Collisions: Bomb -> Player
        bombs.forEach(b => {
            const dist = Math.hypot(b.x - player.x, b.y - player.y);
            if (dist < 22) {
                triggerGameOver("BLASTED!");
            }
        });

        draw();
    }

    function triggerGameOver(msg) {
        player.dead = true;
        screenShake = 20;
        createExplosion(player.x, player.y, '#f00');
        setTimeout(() => {
            clearInterval(gameLoop);
            drawFinal(msg);
        }, 1000);
    }

    function draw() {
        ctx.save();

        // Screen Shake
        if (screenShake > 0) {
            const sx = (Math.random() - 0.5) * screenShake;
            const sy = (Math.random() - 0.5) * screenShake;
            ctx.translate(sx, sy);
            screenShake *= 0.9;
        }

        ctx.clearRect(0, 0, 500, 500);

        // Background Starfield (Slow drift)
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let i = 0; i < 40; i++) {
            const y = (Date.now() / 20 + i * 50) % 500;
            ctx.fillRect((i * 123) % 500, y, 1, 1);
        }

        // Draw Player (Dragon head ship)
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Engine Glow
        const grad = ctx.createRadialGradient(player.x, player.y + 10, 2, player.x, player.y + 25, 15);
        grad.addColorStop(0, '#00ffff');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(player.x, player.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillText('🐉', player.x, player.y);

        // Draw Aliens
        aliens.forEach(a => {
            if (!a.alive) return;
            const wig = Math.sin(Date.now() / 200 + a.offset) * 5;
            ctx.fillStyle = a.color;
            ctx.font = '22px Arial';
            ctx.fillText(a.type, a.x + wig, a.y);

            // Retro Glowing Hitbox (Subtle)
            ctx.shadowBlur = 10;
            ctx.shadowColor = a.color;
        });
        ctx.shadowBlur = 0;

        // Draw Fireballs (Dragon Breath beams)
        fireballs.forEach(f => {
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(f.x - 2, f.y, 4, 12);
        });
        ctx.shadowBlur = 0;

        // Draw Bombs
        ctx.fillStyle = '#ff0000';
        bombs.forEach(b => {
            ctx.fillRect(b.x - 1, b.y, 2, 10);
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#f00';
        });
        ctx.shadowBlur = 0;

        // Draw Particles
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2, 2);
        });
        ctx.globalAlpha = 1.0;

        ctx.restore();
    }

    function drawFinal(msg) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, 500, 500);

        ctx.fillStyle = '#ff00ea';
        ctx.font = 'bold 45px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('MISSION FAILED', 250, 220);

        ctx.fillStyle = '#00ff00';
        ctx.font = '24px Orbitron';
        ctx.fillText(msg, 250, 260);

        ctx.fillStyle = '#fff';
        ctx.font = '18px Orbitron';
        ctx.fillText(`FINAL SCORE: ${score}`, 250, 310);
        ctx.fillText('PRESS BUTTON TO RESTART', 250, 360);
    }

    // Input Listeners
    const onKey = (e) => {
        if (['a', 'd', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
            keys[e.key] = e.type === 'keydown';
            if (e.key === ' ' && e.type === 'keydown') fire();
        }
    };

    const onMouse = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        player.x = (e.clientX - rect.left) * scaleX;
    };

    const onClick = (e) => {
        e.preventDefault();
        fire();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mousedown', onClick);

    document.getElementById('restartBreath').onclick = reset;

    // Cleanup
    window._activeGameCleanup = () => {
        if (gameLoop) clearInterval(gameLoop);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('keyup', onKey);
        canvas.removeEventListener('mousemove', onMouse);
        canvas.removeEventListener('mousedown', onClick);
    };

    if (autoStart) {
        if (typeof window.showGameCountdown === 'function') {
            window.showGameCountdown(el, reset);
        } else {
            reset();
        }
    }
};
