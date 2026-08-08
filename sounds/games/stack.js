/**
 * STACK MISSION
 */
window.loadStack = function (el, autoStart = true) {
    if (!document.getElementById('game-theme-css')) {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const link = document.createElement('link');
        link.id = 'game-theme-css'; link.rel = 'stylesheet';
        link.href = basePath + 'design/game-theme.css';
        document.head.appendChild(link);
    }
    el.innerHTML = `
        <div class="game-wrapper">
            <div class="game-title-label">📦 BREW STACK — Stack the crates to the stars!</div>
            <div class="game-hud">
                <div class="game-hud-stat">HEIGHT: <span id="stack-score">0</span></div>
                <div class="game-hud-hint">CLICK / SPACE</div>
            </div>
            <div class="game-canvas-wrap">
                <canvas id="stack-canvas" width="400" height="500" style="cursor: crosshair; touch-action: none;"></canvas>
                <div class="game-scanlines"></div>
            </div>
            <div class="game-controls">
                <button id="restartStack" class="btn btn-primary">RESTART</button>
                <button class="btn btn-secondary" onclick="window.loadGame(null)">CLOSE</button>
            </div>
        </div>`;

    const canvas = document.getElementById('stack-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let blocks, current, dir, gameLoop, score;
    let isGameOver = false;
    const colors = ['#00ffff', '#ff00ea', '#00ff00', '#ffff00', '#ff3300', '#8B5CF6'];

    function reset() {
        score = 0;
        isGameOver = false;
        blocks = [{ x: 100, y: 470, w: 200, color: colors[0] }];
        current = { x: 0, y: 440, w: 200, color: colors[1] };
        dir = 3;
        updateUI();
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, 1000 / 60);
    }

    function updateUI() {
        const sEl = document.getElementById('stack-score');
        if (sEl) sEl.textContent = score;
    }

    function drawBlock(b) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = b.color;

        // Vector Crate Style
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, 30);
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(b.x, b.y, b.w, 30);

        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x + 5, b.y + 5, b.w - 10, 20);

        // Inner X
        ctx.beginPath();
        ctx.moveTo(b.x + 8, b.y + 8);
        ctx.lineTo(b.x + b.w - 8, b.y + 22);
        ctx.moveTo(b.x + b.w - 8, b.y + 8);
        ctx.lineTo(b.x + 8, b.y + 22);
        ctx.stroke();

        ctx.restore();
    }

    function update() {
        if (isGameOver) return;

        current.x += dir;
        if (current.x < 0) {
            current.x = 0;
            dir = Math.abs(dir);
        } else if (current.x + current.w > canvas.width) {
            current.x = canvas.width - current.w;
            dir = -Math.abs(dir);
        }

        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Neo-Grid Background
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 45, 0);
            ctx.lineTo(i * 45, 500);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * 50);
            ctx.lineTo(400, i * 50);
            ctx.stroke();
        }

        blocks.forEach(drawBlock);
        if (!isGameOver) drawBlock(current);

        if (isGameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff00ea';
            ctx.font = 'bold 45px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('MISSION FAILED', 200, 220);
            ctx.fillStyle = '#fff';
            ctx.font = '18px Orbitron';
            ctx.fillText(`HEIGHT REACHED: ${score}`, 200, 270);
            ctx.fillText('RESTART TO CONTINUE', 200, 320);
        }
    }

    const drop = () => {
        if (isGameOver) return;

        const last = blocks[blocks.length - 1];
        const left = Math.max(current.x, last.x);
        const right = Math.min(current.x + current.w, last.x + last.w);
        const overlap = right - left;

        if (overlap > 10) {
            blocks.push({ x: left, y: current.y, w: overlap, color: current.color });
            score++;
            updateUI();

            if (current.y < 200) {
                blocks.forEach(b => b.y += 30);
            }

            const nextY = blocks[blocks.length - 1].y - 30;
            current = {
                x: Math.random() > 0.5 ? 0 : canvas.width - overlap,
                y: nextY,
                w: overlap,
                color: colors[score % colors.length]
            };
            dir = (3 + (score * 0.2)) * (Math.random() > 0.5 ? 1 : -1);
        } else {
            isGameOver = true;
            setTimeout(draw, 10);
        }
    };

    const handleInput = (e) => {
        if (e.repeat) return;
        if (e.type === 'keydown') {
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'Enter') {
                e.preventDefault();
                drop();
            }
        } else if (e.type === 'pointerdown' && e.target.id === 'stack-canvas') {
            e.preventDefault();
            drop();
        }
    };

    canvas.addEventListener('pointerdown', handleInput);
    window.addEventListener('keydown', handleInput);

    document.getElementById('restartStack').onclick = reset;

    window._activeGameCleanup = () => {
        if (gameLoop) clearInterval(gameLoop);
        window.removeEventListener('keydown', handleInput);
        canvas.removeEventListener('pointerdown', handleInput);
    };

    if (autoStart) {
        if (typeof window.showGameCountdown === 'function') {
            window.showGameCountdown(el, reset);
        } else {
            reset();
        }
    }
};
