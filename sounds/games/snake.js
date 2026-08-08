/**
 * COSMIC SNAKE GAME
 */
window.loadSnake = function (el, autoStart = true) {
    if (!document.getElementById('game-theme-css')) {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const link = document.createElement('link');
        link.id = 'game-theme-css'; link.rel = 'stylesheet';
        link.href = basePath + 'design/game-theme.css';
        document.head.appendChild(link);
    }
    el.innerHTML = `
        <div class="game-wrapper">
            <div class="game-title-label">🐲 COSMIC SNAKE — Collect Beer Mugs, grow your tail!</div>
            <div class="game-hud">
                <div class="game-hud-stat">MUGS: <span id="ss">0</span></div>
                <div class="game-hud-hint">ARROW KEYS / WASD</div>
            </div>
            <div class="game-canvas-wrap">
                <canvas id="sc" width="400" height="400" style="cursor: none;"></canvas>
                <div class="game-scanlines"></div>
            </div>
            <div class="game-controls">
                <button id="restartSnakeBtn" class="btn btn-primary">RESTART</button>
                <button class="btn btn-secondary" onclick="window.loadGame(null)">CLOSE</button>
            </div>
        </div>`;

    const canvas = document.getElementById('sc');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('ss');
    const gridSize = 20;
    const tileCount = 20;

    let snake, food, dx, dy, score, gameLoop;
    let gameOver = false;

    function reset() {
        snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
        food = { x: 5, y: 5 };
        dx = 0; dy = -1;
        score = 0;
        gameOver = false;
        if (scoreEl) scoreEl.textContent = score;
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(step, 100);
    }

    function step() {
        if (gameOver) return;

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wall & Self collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(s => s.x === head.x && s.y === head.y)) {
            gameOver = true;
            setTimeout(draw, 10);
            return;
        }

        snake.unshift(head);

        // Check food
        if (head.x === food.x && head.y === food.y) {
            score++;
            if (scoreEl) scoreEl.textContent = score;
            spawnFood();
        } else {
            snake.pop();
        }

        draw();
    }

    function spawnFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        // Ensure food doesn't spawn on snake
        if (snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
    }

    function draw() {
        ctx.clearRect(0, 0, 400, 400);

        // Grid Background
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, 400);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize); ctx.lineTo(400, i * gridSize);
            ctx.stroke();
        }

        // Derive Head Angle
        let angle = 0;
        if (dx === 1) angle = 0;
        if (dx === -1) angle = Math.PI;
        if (dy === 1) angle = Math.PI / 2;
        if (dy === -1) angle = -Math.PI / 2;

        // Draw Snake
        snake.forEach((s, i) => {
            const px = s.x * gridSize + gridSize / 2;
            const py = s.y * gridSize + gridSize / 2;

            ctx.save();
            ctx.translate(px, py);

            if (i === 0) {
                // Retro Dragon Head
                ctx.rotate(angle);
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ffff';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.fillStyle = '#000';

                // Wedge head
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(-8, -8);
                ctx.lineTo(-5, 0);
                ctx.lineTo(-8, 8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Glowing Eye
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(0, -3, 3, 3);
            } else {
                // Retro Body Segments
                const opacity = 1 - (i / snake.length) * 0.6;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#8B5CF6';
                ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                ctx.lineWidth = 2;
                ctx.fillStyle = '#000';

                const size = (gridSize - 4) * (1 - (i / snake.length) * 0.3);
                ctx.strokeRect(-size / 2, -size / 2, size, size);
                ctx.fillRect(-size / 2, -size / 2, size, size);
            }
            ctx.restore();
        });

        // Draw Food (Animated Neon Mug)
        const bounce = Math.sin(Date.now() * 0.01) * 3;
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#F59E0B';
        ctx.fillText('🍺', food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2 + bounce);
        ctx.shadowBlur = 0;

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, 400, 400);
            ctx.fillStyle = '#ff00ea';
            ctx.font = 'bold 36px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('CRASHED!', 200, 180);
            ctx.fillStyle = '#fff';
            ctx.font = '16px Orbitron';
            ctx.fillText(`FINAL MUGS: ${score}`, 200, 230);
            ctx.fillText('PRESS RESTART TO FLY AGAIN', 200, 280);
        }
    }

    const onKey = (e) => {
        if (gameOver) return;
        const key = e.key.toLowerCase();
        if ((key === 'arrowup' || key === 'w') && dy === 0) { dx = 0; dy = -1; }
        if ((key === 'arrowdown' || key === 's') && dy === 0) { dx = 0; dy = 1; }
        if ((key === 'arrowleft' || key === 'a') && dx === 0) { dx = -1; dy = 0; }
        if ((key === 'arrowright' || key === 'd') && dx === 0) { dx = 1; dy = 0; }
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) e.preventDefault();
    };

    window.addEventListener('keydown', onKey);
    document.getElementById('restartSnakeBtn').onclick = reset;

    window._activeGameCleanup = () => {
        if (gameLoop) clearInterval(gameLoop);
        window.removeEventListener('keydown', onKey);
    };

    if (autoStart) {
        if (typeof window.showGameCountdown === 'function') {
            window.showGameCountdown(el, reset);
        } else {
            reset();
        }
    }
};
