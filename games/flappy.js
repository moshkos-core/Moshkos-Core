/**
 * FLAPPY DRAGON GAME
 */
window.loadFlappy = function (el, autoStart = true) {
    if (!document.getElementById('game-theme-css')) {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const link = document.createElement('link');
        link.id = 'game-theme-css'; link.rel = 'stylesheet';
        link.href = basePath + 'design/game-theme.css';
        document.head.appendChild(link);
    }
    el.innerHTML = `
        <div class="game-wrapper">
            <div class="game-title-label">🦇 FLAPPY DRAGON — Dodge the pipes, reach the nebula!</div>
            <div class="game-hud">
                <div class="game-hud-stat">SCORE: <span id="flappy-score">0</span></div>
                <div class="game-hud-hint">SPACE / CLICK</div>
                <div class="game-hud-stat">BEST: <span id="flappy-best">0</span></div>
            </div>
            <div class="game-canvas-wrap">
                <canvas id="flappy-canvas" width="400" height="500" style="cursor: crosshair;"></canvas>
                <div class="game-scanlines"></div>
            </div>
            <div class="game-controls">
                <button id="restartFlappy" class="btn btn-primary">RESTART</button>
                <button class="btn btn-secondary" onclick="window.loadGame(null)">CLOSE</button>
            </div>
        </div>`;

    const canvas = document.getElementById('flappy-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let bird, pipes, score, bestScore = 0, gameLoop, isGameOver;

    function reset() {
        bird = { x: 80, y: 250, vy: 0, w: 34, h: 24, rot: 0 };
        pipes = [{ x: 400, y: 150, gap: 160 }];
        score = 0;
        isGameOver = false;
        updateUI();
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, 1000 / 60);
    }

    function updateUI() {
        const sEl = document.getElementById('flappy-score');
        const bEl = document.getElementById('flappy-best');
        if (sEl) sEl.textContent = score;
        if (bEl) bEl.textContent = bestScore;
    }

    function update() {
        if (isGameOver) return;

        // Physics
        bird.vy += 0.4;
        bird.y += bird.vy;
        bird.rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.vy * 0.1));

        // Pipes
        pipes.forEach(p => p.x -= 3.5);
        if (pipes[pipes.length - 1].x < 180) {
            const gapY = 100 + Math.random() * 300;
            pipes.push({ x: 400, y: gapY, gap: 160 });
        }
        pipes = pipes.filter(p => p.x > -60);

        // Score
        pipes.forEach(p => {
            if (p.x + 50 < bird.x && !p.scored) {
                p.scored = true;
                score++;
                if (score > bestScore) bestScore = score;
                updateUI();
            }
        });

        // Collisions
        const hitPipe = pipes.some(p => {
            const inPipeX = bird.x + 15 > p.x && bird.x - 15 < p.x + 50;
            const hitTop = bird.y - 12 < p.y - p.gap / 2;
            const hitBottom = bird.y + 12 > p.y + p.gap / 2;
            return inPipeX && (hitTop || hitBottom);
        });

        if (bird.y < 0 || bird.y > 500 || hitPipe) {
            isGameOver = true;
            setTimeout(draw, 10);
            return;
        }

        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, 400, 500);

        // Retro Starfield
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 137) % 400;
            const y = (i * 213 + Date.now() / 50) % 500;
            ctx.fillRect(x, y, 1, 1);
        }

        // Draw Pipes (Neon Beer Pipes)
        pipes.forEach(p => {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#F59E0B';
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';

            // Top Pipe
            const topH = p.y - p.gap / 2;
            ctx.fillRect(p.x, 0, 50, topH);
            ctx.strokeRect(p.x, 0, 50, topH);

            // Bottom Pipe
            const botY = p.y + p.gap / 2;
            ctx.fillRect(p.x, botY, 50, 500 - botY);
            ctx.strokeRect(p.x, botY, 50, 500 - botY);

            // Neon Caps
            ctx.strokeRect(p.x - 5, topH - 15, 60, 15);
            ctx.strokeRect(p.x - 5, botY, 60, 15);
        });

        // Draw Bird (Retro Neon Dragon)
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rot);

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#8B5CF6';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#000';

        // Wedge Body
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -12);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Emoji Overlay
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText('🐲', 0, 0);

        ctx.restore();

        if (isGameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, 400, 500);
            ctx.fillStyle = '#ff00ea';
            ctx.font = 'bold 40px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('CRASHED!', 200, 220);
            ctx.fillStyle = '#fff';
            ctx.font = '18px Orbitron';
            ctx.fillText(`FINAL SCORE: ${score}`, 200, 270);
            ctx.fillText('PRESS RESTART TO FLAP AGAIN', 200, 320);
        }
    }

    const flap = () => {
        if (!isGameOver) bird.vy = -7.5;
    };

    const handleKey = (e) => {
        if (e.key === ' ' || e.key === 'ArrowUp') {
            e.preventDefault();
            flap();
        }
    };

    canvas.onclick = flap;
    window.addEventListener('keydown', handleKey);
    document.getElementById('restartFlappy').onclick = reset;

    window._activeGameCleanup = () => {
        if (gameLoop) clearInterval(gameLoop);
        window.removeEventListener('keydown', handleKey);
    };

    if (autoStart) {
        if (typeof window.showGameCountdown === 'function') {
            window.showGameCountdown(el, reset);
        } else {
            reset();
        }
    }
};
