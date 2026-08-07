/**
 * PONG GALAXY
 */
window.loadPong = function (el, autoStart = true) {
    if (!document.getElementById('game-theme-css')) {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const link = document.createElement('link');
        link.id = 'game-theme-css'; link.rel = 'stylesheet';
        link.href = basePath + 'design/game-theme.css';
        document.head.appendChild(link);
    }
    el.innerHTML = `
        <div class="game-wrapper">
            <div class="game-title-label">🎾 BEER PONG GALAXY — Master the neon cosmic bounce!</div>
            <div class="game-hud">
                <div class="game-hud-stat">SCORE: <span id="pong-score">0</span></div>
                <div class="game-hud-hint">A / D — LEFT / RIGHT</div>
            </div>
            <div class="game-canvas-wrap">
                <canvas id="pong-canvas" width="400" height="500" style="cursor: none;"></canvas>
                <div class="game-scanlines"></div>
            </div>
            <div class="game-controls">
                <button id="restartPong" class="btn btn-primary">RESTART</button>
                <button class="btn btn-secondary" onclick="window.loadGame(null)">CLOSE</button>
            </div>
        </div>`;

    const canvas = document.getElementById('pong-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let ball, paddle, score, gameLoop;
    let keys = { left: false, right: false };
    let isGameOver = false;

    function reset() {
        ball = { x: 200, y: 150, vx: 5, vy: 5, w: 12, h: 12 };
        paddle = { x: 150, y: 460, w: 100, h: 15 };
        score = 0;
        isGameOver = false;
        keys = { left: false, right: false };
        updateScore();
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, 1000 / 60);
    }

    function updateScore() {
        const sEl = document.getElementById('pong-score');
        if (sEl) sEl.textContent = score;
    }

    function update() {
        if (isGameOver) return;

        if (keys.left) paddle.x = Math.max(0, paddle.x - 8);
        if (keys.right) paddle.x = Math.min(canvas.width - paddle.w, paddle.x + 8);

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x < 10 || ball.x > canvas.width - 10) {
            ball.vx *= -1;
            createExplosion(ball.x, ball.y, '#ff00ea');
        }
        if (ball.y < 10) {
            ball.vy *= -1;
            createExplosion(ball.x, ball.y, '#ff00ea');
        }

        if (ball.y + ball.h > paddle.y && ball.y < paddle.y + paddle.h &&
            ball.x + ball.w > paddle.x && ball.x < paddle.x + paddle.w) {
            ball.vy = -Math.abs(ball.vy) * 1.05;
            ball.vx += (Math.random() - 0.5) * 4;
            score++;
            updateScore();
            createExplosion(ball.x, ball.y, '#00ffff');
        }

        if (ball.y > canvas.height) {
            isGameOver = true;
            setTimeout(draw, 10);
            return;
        }

        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) particles.splice(i, 1);
        });

        draw();
    }

    let particles = [];
    function createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Neo-Grid Floor
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        ctx.lineWidth = 1;
        for (let i = -5; i <= 15; i++) {
            ctx.beginPath();
            ctx.moveTo(200 + i * 40, 0);
            ctx.lineTo(200 + i * 150, 500);
            ctx.stroke();
        }
        const offset = (Date.now() * 0.1) % 50;
        for (let i = 0; i < 10; i++) {
            const y = i * 50 + offset;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(400, y);
            ctx.stroke();
        }

        // Starfield
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let i = 0; i < 15; i++) {
            const x = (i * 153) % 400;
            const y = (i * 277 + Date.now() / 30) % 500;
            ctx.fillRect(x, y, 2, 2);
        }

        // Draw Particles
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 3, 3);
        });
        ctx.globalAlpha = 1;

        // Draw Paddle (Neon Vector style)
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(paddle.x + 3, paddle.y + 3, paddle.w - 6, paddle.h - 6);
        ctx.restore();

        // Draw Ball (Glowing Core)
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ea';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x + ball.w / 2, ball.y + ball.h / 2, ball.w / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ff00ea';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        if (isGameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, 400, 500);
            ctx.fillStyle = '#ff00ea';
            ctx.font = 'bold 45px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('MISSION FAILED', 200, 220);
            ctx.fillStyle = '#fff';
            ctx.font = '18px Orbitron';
            ctx.fillText(`SCORE: ${score}`, 200, 270);
            ctx.fillText('RESTART TO CONTINUE', 200, 320);
        }
    }

    const keyHandler = (e) => {
        const state = (e.type === 'keydown');
        const key = e.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') keys.left = state;
        if (key === 'arrowright' || key === 'd') keys.right = state;
        if (['arrowleft', 'arrowright', 'a', 'd'].includes(key)) e.preventDefault();
    };

    window.addEventListener('keydown', keyHandler);
    window.addEventListener('keyup', keyHandler);
    document.getElementById('restartPong').onclick = reset;

    window._activeGameCleanup = () => {
        if (gameLoop) clearInterval(gameLoop);
        window.removeEventListener('keydown', keyHandler);
        window.removeEventListener('keyup', keyHandler);
    };

    if (autoStart) {
        if (typeof window.showGameCountdown === 'function') {
            window.showGameCountdown(el, reset);
        } else {
            reset();
        }
    }
};
