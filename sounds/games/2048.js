/**
 * DRAGON 2048
 */
window.load2048 = function (el, autoStart = true) {
    if (!document.getElementById('game-theme-css')) {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const link = document.createElement('link');
        link.id = 'game-theme-css'; link.rel = 'stylesheet';
        link.href = basePath + 'design/game-theme.css';
        document.head.appendChild(link);
    }
    el.innerHTML = `
        <div class="game-wrapper">
            <div class="game-title-label">💎 DRAGON 2048 — Combine tiles to reach the Golden Dragon!</div>
            <div class="game-hud">
                <div class="game-hud-stat">SCORE: <span id="2048-score">0</span></div>
                <div class="game-hud-hint">ARROW KEYS / WASD</div>
            </div>
            <div id="grid-2048-container" style="position: relative; overflow: hidden; border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.25); padding: 10px; background: #02010a; box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.15);">
                <div id="grid-2048" style="display: block; position: relative; width: 300px; height: 300px; margin: auto; box-sizing: border-box;"></div>
                <div id="game-over-2048" style="display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.9); z-index: 100; flex-direction: column; align-items: center; justify-content: center; font-family: 'Orbitron'; border-radius: 12px;">
                    <h2 style="color: #EC4899; font-size: 28px; margin-bottom: 10px;">GRID LOCKED</h2>
                    <p style="color: #fff; font-size: 18px; margin-bottom: 20px;">FINAL SCORE: <span id="final-score-2048">0</span></p>
                    <p style="color: #a78bfa; font-size: 12px; letter-spacing: 0.1em;">RESTART TO CONTINUE</p>
                </div>
                <div class="game-scanlines"></div>
            </div>
            <div class="game-controls">
                <button id="restart2048" class="btn btn-primary">RESTART</button>
                <button class="btn btn-secondary" onclick="window.loadGame(null)">CLOSE</button>
            </div>
        </div>`;

    const gridEl = document.getElementById('grid-2048');
    const gameOverEl = document.getElementById('game-over-2048');
    const finalScoreEl = document.getElementById('final-score-2048');
    let board = [], score = 0, nextId = 1;
    let tileElements = new Map();
    let isGameOver = false;

    function getTileColor(val) {
        const colors = {
            2: '#00ffff',     // Cyan
            4: '#ff00ea',     // Pink
            8: '#ffff00',     // Yellow
            16: '#00ff00',    // Green
            32: '#ff3300',    // Red-orange
            64: '#8B5CF6',    // Purple
            128: '#3B82F6',   // Blue
            256: '#EC4899',   // Rosy
            512: '#10B981',   // Emerald
            1024: '#F59E0B',  // Amber
            2048: '#FFFFFF'   // White Gold
        };
        return colors[val] || '#fff';
    }

    function initBoard() {
        board = Array(4).fill().map(() => Array(4).fill(null));
        score = 0;
        isGameOver = false;
        gameOverEl.style.display = 'none';
        tileElements.forEach(el => el.remove());
        tileElements.clear();
        addRandom();
        addRandom();
        draw();
    }

    function addRandom() {
        const empty = [];
        board.forEach((row, r) => row.forEach((tile, c) => { if (!tile) empty.push({ r, c }); }));
        if (empty.length) {
            const { r, c } = empty[Math.floor(Math.random() * empty.length)];
            board[r][c] = { val: Math.random() < 0.9 ? 2 : 4, id: nextId++ };
        }
    }

    function draw() {
        const currentIds = new Set();
        const scoreSpan = document.getElementById('2048-score');

        board.forEach((row, r) => {
            row.forEach((tile, c) => {
                if (tile) {
                    currentIds.add(tile.id);
                    let el = tileElements.get(tile.id);
                    const color = getTileColor(tile.val);

                    if (!el) {
                        el = document.createElement('div');
                        el.style.cssText = `
                            position: absolute;
                            width: 23%;
                            height: 23%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            font-weight: bold;
                            font-family: 'Orbitron';
                            border-radius: 8px;
                            transition: all 0.1s ease-in-out;
                            z-index: 10;
                            border: 2px solid #fff;
                            background: rgba(0,0,0,0.8);
                        `;
                        gridEl.appendChild(el);
                        tileElements.set(tile.id, el);
                        el.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 200 });
                    }

                    el.style.top = (2 + r * 24.5) + '%';
                    el.style.left = (2 + c * 24.5) + '%';
                    el.style.color = color;
                    el.style.borderColor = color;
                    el.style.textShadow = `0 0 8px ${color}`;
                    el.style.boxShadow = `inset 0 0 12px ${color}, 0 0 12px ${color}44`;
                    el.textContent = tile.val;

                    if (el.dataset.val != tile.val) {
                        el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 150 });
                    }
                    el.dataset.val = tile.val;
                }
            });
        });

        for (const [id, el] of tileElements) {
            if (!currentIds.has(id)) { el.remove(); tileElements.delete(id); }
        }
        if (scoreSpan) scoreSpan.textContent = score;

        if (checkGameOver() && !isGameOver) {
            isGameOver = true;
            gameOverEl.style.display = 'flex';
            finalScoreEl.textContent = score;
        }
    }

    function checkGameOver() {
        let hasEmpty = false;
        board.forEach(row => row.forEach(tile => { if (!tile) hasEmpty = true; }));
        if (hasEmpty) return false;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const val = board[r][c].val;
                if (r < 3 && board[r + 1][c].val === val) return false;
                if (c < 3 && board[r][c + 1].val === val) return false;
            }
        }
        return true;
    }

    function move(dir) {
        if (isGameOver) return;
        let moved = false;
        const isVert = dir % 2 !== 0;
        const isRev = dir > 1;

        for (let i = 0; i < 4; i++) {
            let line = [];
            for (let j = 0; j < 4; j++) {
                let r = isVert ? j : i, c = isVert ? i : j;
                if (board[r][c]) line.push(board[r][c]);
            }
            if (isRev) line.reverse();

            let newLine = [];
            let skip = false;
            for (let k = 0; k < line.length; k++) {
                if (skip) { skip = false; continue; }
                if (k < line.length - 1 && line[k].val === line[k + 1].val) {
                    const merged = { ...line[k], val: line[k].val * 2 };
                    newLine.push(merged);
                    score += merged.val;
                    skip = true;
                } else newLine.push(line[k]);
            }

            while (newLine.length < 4) newLine.push(null);
            if (isRev) newLine.reverse();

            for (let j = 0; j < 4; j++) {
                let r = isVert ? j : i, c = isVert ? i : j;
                if (JSON.stringify(board[r][c]) !== JSON.stringify(newLine[j])) {
                    moved = true;
                    board[r][c] = newLine[j];
                }
            }
        }
        if (moved) { addRandom(); draw(); }
    }

    const game2048KeyHandler = e => {
        const key = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
            e.preventDefault();
            if (key === 'arrowleft' || key === 'a') move(0);
            if (key === 'arrowup' || key === 'w') move(1);
            if (key === 'arrowright' || key === 'd') move(2);
            if (key === 'arrowdown' || key === 's') move(3);
        }
    };

    window.addEventListener('keydown', game2048KeyHandler);
    document.getElementById('restart2048').onclick = initBoard;

    window._activeGameCleanup = () => window.removeEventListener('keydown', game2048KeyHandler);
    if (autoStart) {
        if (typeof window.showGameCountdown === 'function') {
            window.showGameCountdown(el, initBoard);
        } else {
            initBoard();
        }
    }
};
