/**
 * app.js - Premium Tic-Tac-Toe Game Logic & Sound System
 */

// ============================================================================
// 1. Audio Synthesis Engine (Web Audio API)
// ============================================================================
class SoundController {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            // Lazy initialization on first user click to satisfy browser policies
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
    }

    // Short synth click for UI buttons
    playClick() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Sound effect for Player X move (higher pitched, sharp)
    playMoveX() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
        osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.05); // G5
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    // Sound effect for Player O / CPU move (lower pitched, soft)
    playMoveO() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392.00, this.ctx.currentTime); // G4
        osc.frequency.setValueAtTime(493.88, this.ctx.currentTime + 0.06); // B4
        
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
    }

    // Sound effect for victory (arpeggio sequence)
    playWin() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
        const duration = 0.08;
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * duration);
            
            gain.gain.setValueAtTime(0, now + i * duration);
            gain.gain.linearRampToValueAtTime(0.08, now + i * duration + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * duration + duration + 0.05);
            
            osc.start(now + i * duration);
            osc.stop(now + i * duration + duration + 0.1);
        });
    }

    // Sound effect for a tie (melancholic detuned double note)
    playDraw() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const freqs = [220.00, 222.00]; // detuned A3 for chorus effect
        
        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.linearRampToValueAtTime(140.00, now + 0.4);
            
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            // Apply lowpass filter to soften sawtooth
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, now);
            osc.disconnect(gain);
            osc.connect(filter);
            filter.connect(gain);
            
            osc.start(now);
            osc.stop(now + 0.45);
        });
    }
}

const sounds = new SoundController();

// ============================================================================
// 2. Confetti Particle System
// ============================================================================
function createConfettiExplosion() {
    const colors = ['#00f3ff', '#ff007f', '#ffffff', '#bd00ff', '#ffd700'];
    const particleCount = 60;
    
    // Spawn particles around the center of the viewport
    const sx = window.innerWidth / 2;
    const sy = window.innerHeight / 2;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        
        // Random dimensions
        const size = Math.random() * 8 + 4;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        
        // Select random neon color
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Particle positioning
        p.style.left = `${sx}px`;
        p.style.top = `${sy}px`;
        
        // Random angle and distance for explosion translation
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200 + 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        p.style.setProperty('--tx', `${tx}px`);
        p.style.setProperty('--ty', `${ty}px`);
        
        // Add random shape variation (circles or squares)
        if (Math.random() > 0.5) {
            p.style.borderRadius = '0'; // Square confetti
        }
        
        document.body.appendChild(p);
        
        // Cleanup particle element once animation ends
        p.addEventListener('animationend', () => {
            p.remove();
        });
    }
}

// ============================================================================
// 3. Application State & Constants
// ============================================================================
const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Screen line coordinates in a 300x300 viewBox for SVG overlay line drawing
const WIN_LINE_COORDS = {
    '0,1,2': { x1: 15, y1: 50, x2: 285, y2: 50 },
    '3,4,5': { x1: 15, y1: 150, x2: 285, y2: 150 },
    '6,7,8': { x1: 15, y1: 250, x2: 285, y2: 250 },
    '0,3,6': { x1: 50, y1: 15, x2: 50, y2: 285 },
    '1,4,7': { x1: 150, y1: 15, x2: 150, y2: 285 },
    '2,5,8': { x1: 250, y1: 15, x2: 250, y2: 285 },
    '0,4,8': { x1: 15, y1: 15, x2: 285, y2: 285 },
    '2,4,6': { x1: 15, y1: 285, x2: 285, y2: 15 }
};

const state = {
    board: Array(9).fill(''),
    currentPlayer: 'X', // X always goes first
    mode: 'pvp',        // 'pvp' or 'pvc'
    difficulty: 'medium', // 'easy', 'medium', 'hard' (impossible)
    isGameOver: false,
    stats: {
        xWins: 0,
        oWins: 0,
        ties: 0
    }
};

// ============================================================================
// 4. UI Elements DOM References
// ============================================================================
const elements = {
    btnPvP: document.getElementById('btn-pvp'),
    btnPvC: document.getElementById('btn-pvc'),
    difficultyContainer: document.getElementById('difficulty-container'),
    diffBtns: document.querySelectorAll('.diff-btn'),
    turnText: document.getElementById('turn-text'),
    btnSound: document.getElementById('btn-sound'),
    gameBoard: document.getElementById('game-board'),
    cells: document.querySelectorAll('.cell'),
    winningLineSvg: document.getElementById('winning-line-svg'),
    winningLine: document.getElementById('winning-line'),
    scoreX: document.getElementById('score-x'),
    scoreO: document.getElementById('score-o'),
    scoreOLabel: document.getElementById('score-o-label'),
    scoreTies: document.getElementById('score-ties'),
    cardX: document.getElementById('card-x'),
    cardO: document.getElementById('card-o'),
    btnReset: document.getElementById('btn-reset'),
    btnClearStats: document.getElementById('btn-clear-stats'),
    modal: document.getElementById('game-over-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalSubtitle: document.getElementById('modal-subtitle'),
    btnPlayAgain: document.getElementById('btn-play-again')
};

// SVG templates for marks
const SVG_X = `
<svg class="svg-x" viewBox="0 0 100 100">
    <path d="M 22 22 L 78 78" />
    <path d="M 78 22 L 22 78" />
</svg>
`;

const SVG_O = `
<svg class="svg-o" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="28" />
</svg>
`;

// ============================================================================
// 5. AI Minimax Engine
// ============================================================================

/**
 * Check if a player has won in a given board state.
 * Returns the winning combo index or null.
 */
function checkWinningState(board, player) {
    for (let combo of WINNING_COMBOS) {
        if (board[combo[0]] === player && 
            board[combo[1]] === player && 
            board[combo[2]] === player) {
            return combo;
        }
    }
    return null;
}

/**
 * Check if the board is completely full.
 */
function isBoardFull(board) {
    return board.every(cell => cell !== '');
}

/**
 * Minimax implementation for Tic-Tac-Toe.
 * O represents the Computer (maximizing player).
 * X represents the human Player (minimizing player).
 */
function minimax(board, depth, isMaximizing) {
    // Terminal state evaluation
    if (checkWinningState(board, 'O')) {
        return 10 - depth; // Computer wins (prefer earlier wins)
    }
    if (checkWinningState(board, 'X')) {
        return depth - 10; // Human wins (prefer delaying human wins)
    }
    if (isBoardFull(board)) {
        return 0; // Draw
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(bestScore, score);
            }
        }
        return bestScore;
    }
}

/**
 * Computes the best move for Player O using the minimax score.
 */
function getBestMove(board) {
    let bestScore = -Infinity;
    let bestMove = null;
    
    // Check if board is empty (if CPU goes first, grab a corner)
    const emptyIndices = board.map((c, i) => c === '' ? i : null).filter(v => v !== null);
    if (emptyIndices.length === 9) {
        // Center or corner is statistically best opening
        const openings = [0, 2, 4, 6, 8];
        return openings[Math.floor(Math.random() * openings.length)];
    }

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

/**
 * Determines the AI's move based on selected difficulty.
 */
function getAIMove() {
    const emptyIndices = state.board
        .map((cell, idx) => cell === '' ? idx : null)
        .filter(val => val !== null);
        
    if (emptyIndices.length === 0) return null;

    if (state.difficulty === 'easy') {
        // Purely random move
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    } 
    else if (state.difficulty === 'medium') {
        // 60% chance of making the best move, 40% chance of random move
        if (Math.random() < 0.6) {
            return getBestMove(state.board);
        } else {
            return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
    } 
    else {
        // 'hard' / Impossible mode: 100% perfect minimax
        return getBestMove(state.board);
    }
}

// ============================================================================
// 6. Game Operations & Controllers
// ============================================================================

/**
 * Save current statistics to local storage.
 */
function saveStats() {
    localStorage.setItem('neon_ttt_stats', JSON.stringify(state.stats));
}

/**
 * Load statistics from local storage.
 */
function loadStats() {
    const data = localStorage.getItem('neon_ttt_stats');
    if (data) {
        try {
            state.stats = JSON.parse(data);
        } catch (e) {
            console.error('Error parsing stats data from localStorage', e);
        }
    }
    updateScoreboardUI();
}

/**
 * Refresh stats displayed on the scoreboard cards.
 */
function updateScoreboardUI() {
    elements.scoreX.textContent = state.stats.xWins;
    elements.scoreO.textContent = state.stats.oWins;
    elements.scoreTies.textContent = state.stats.ties;
    
    // Highlight active scoring card based on turn
    if (state.currentPlayer === 'X') {
        elements.cardX.classList.add('active-card');
        elements.cardO.classList.remove('active-card');
    } else {
        elements.cardX.classList.remove('active-card');
        elements.cardO.classList.add('active-card');
    }
}

/**
 * Update the turn indicator text and board active status.
 */
function updateTurnUI() {
    elements.gameBoard.setAttribute('data-turn', state.currentPlayer);
    
    if (state.mode === 'pvp') {
        if (state.currentPlayer === 'X') {
            elements.turnText.innerHTML = `Player <span class="x-color font-bold">X</span>'s Turn`;
        } else {
            elements.turnText.innerHTML = `Player <span class="o-color font-bold">O</span>'s Turn`;
        }
    } else {
        // Player vs Computer
        if (state.currentPlayer === 'X') {
            elements.turnText.innerHTML = `Your Turn (<span class="x-color font-bold">X</span>)`;
        } else {
            elements.turnText.innerHTML = `CPU is thinking... (<span class="o-color font-bold">O</span>)`;
        }
    }
}

/**
 * Draw the dynamic winning SVG line across winning cells.
 */
function drawWinningLine(winningCombo) {
    const key = winningCombo.join(',');
    const coord = WIN_LINE_COORDS[key];
    
    if (coord) {
        elements.winningLine.setAttribute('x1', coord.x1);
        elements.winningLine.setAttribute('y1', coord.y1);
        elements.winningLine.setAttribute('x2', coord.x2);
        elements.winningLine.setAttribute('y2', coord.y2);
        
        // Reset animation state
        elements.winningLine.className.baseVal = '';
        void elements.winningLine.offsetWidth; // Trigger reflow to restart animation
        
        // Add styling class depending on who won
        const strokeClass = state.currentPlayer === 'X' ? 'winning-line-x' : 'winning-line-o';
        elements.winningLine.classList.add(strokeClass);
        elements.winningLineSvg.style.display = 'block';
    }
}

/**
 * End the game and show victory or draw overlays.
 */
function handleGameOver(winner, winningCombo = null) {
    state.isGameOver = true;
    
    // Disable all board cells
    elements.cells.forEach(cell => cell.disabled = true);

    if (winner === 'draw') {
        state.stats.ties++;
        saveStats();
        updateScoreboardUI();
        
        sounds.playDraw();
        
        // Shake board on tie
        elements.gameBoard.classList.add('board-shake');
        elements.gameBoard.addEventListener('animationend', () => {
            elements.gameBoard.classList.remove('board-shake');
        }, { once: true });
        
        setTimeout(() => {
            elements.modalTitle.textContent = "It's a Draw!";
            elements.modalTitle.className = "draw-color";
            elements.modalSubtitle.textContent = "Both grids are perfectly matched.";
            elements.modal.classList.remove('hidden');
        }, 600);
    } 
    else {
        // Winner is X or O
        if (winner === 'X') {
            state.stats.xWins++;
        } else {
            state.stats.oWins++;
        }
        saveStats();
        updateScoreboardUI();
        
        // Perform line drawing
        if (winningCombo) {
            drawWinningLine(winningCombo);
            
            // Highlight cells
            winningCombo.forEach(idx => {
                const cell = elements.cells[idx];
                const winnerCellClass = winner === 'X' ? 'winner-cell-x' : 'winner-cell-o';
                cell.classList.add(winnerCellClass);
            });
        }
        
        sounds.playWin();
        
        setTimeout(() => {
            createConfettiExplosion();
            
            if (state.mode === 'pvp') {
                elements.modalTitle.textContent = "Victory!";
                elements.modalTitle.className = winner === 'X' ? "x-color" : "o-color";
                elements.modalSubtitle.innerHTML = `Player <span class="${winner === 'X' ? 'x-color' : 'o-color'} font-bold">${winner}</span> has claimed the board.`;
            } else {
                if (winner === 'X') {
                    elements.modalTitle.textContent = "You Win!";
                    elements.modalTitle.className = "x-color";
                    elements.modalSubtitle.textContent = "Incredible play! You beat the system.";
                } else {
                    elements.modalTitle.textContent = "CPU Wins!";
                    elements.modalTitle.className = "o-color";
                    elements.modalSubtitle.textContent = "The intelligence grid claims another match.";
                }
            }
            elements.modal.classList.remove('hidden');
        }, 750);
    }
}

/**
 * Execute a move at the specified index.
 */
function makeMove(index) {
    if (state.board[index] !== '' || state.isGameOver) return;
    
    // Update state
    state.board[index] = state.currentPlayer;
    
    // Update UI cell content
    const cell = elements.cells[index];
    cell.innerHTML = state.currentPlayer === 'X' ? SVG_X : SVG_O;
    cell.disabled = true;
    cell.setAttribute('aria-label', `Cell ${index + 1}, Player ${state.currentPlayer}`);
    
    // Play synthesis audio
    if (state.currentPlayer === 'X') {
        sounds.playMoveX();
    } else {
        sounds.playMoveO();
    }

    // Check for win
    const winningCombo = checkWinningState(state.board, state.currentPlayer);
    if (winningCombo) {
        handleGameOver(state.currentPlayer, winningCombo);
        return;
    }

    // Check for draw
    if (isBoardFull(state.board)) {
        handleGameOver('draw');
        return;
    }

    // Switch turns
    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnUI();
    updateScoreboardUI();

    // Trigger AI move if vs computer mode
    if (state.mode === 'pvc' && state.currentPlayer === 'O' && !state.isGameOver) {
        // Add a slight latency to make it feel human/processed
        setTimeout(() => {
            const aiIdx = getAIMove();
            if (aiIdx !== null) {
                makeMove(aiIdx);
            }
        }, 600);
    }
}

/**
 * Clear/reset the board state for a new match.
 */
function resetBoard() {
    state.board = Array(9).fill('');
    state.currentPlayer = 'X'; // X starts
    state.isGameOver = false;
    
    // Clear Cells UI
    elements.cells.forEach((cell, idx) => {
        cell.innerHTML = '';
        cell.disabled = false;
        cell.className = 'cell'; // remove winner-cell classes
        cell.setAttribute('aria-label', `Cell ${idx + 1}, Empty`);
    });

    // Clear SVG winning line
    elements.winningLine.className.baseVal = '';
    elements.winningLineSvg.style.display = 'none';
    elements.winningLine.setAttribute('x1', 0);
    elements.winningLine.setAttribute('y1', 0);
    elements.winningLine.setAttribute('x2', 0);
    elements.winningLine.setAttribute('y2', 0);

    // Close Modal
    elements.modal.classList.add('hidden');
    
    // Update Turn Indicators
    updateTurnUI();
    updateScoreboardUI();
}

/**
 * Completely wipe wins stats and local storage.
 */
function clearStats() {
    sounds.playClick();
    state.stats.xWins = 0;
    state.stats.oWins = 0;
    state.stats.ties = 0;
    saveStats();
    updateScoreboardUI();
}

// ============================================================================
// 7. Input/Event Handlers & Initialization
// ============================================================================

function setupEventListeners() {
    // Mode toggles
    elements.btnPvP.addEventListener('click', () => {
        sounds.playClick();
        if (state.mode === 'pvp') return;
        state.mode = 'pvp';
        elements.btnPvP.classList.add('active');
        elements.btnPvC.classList.remove('active');
        elements.difficultyContainer.classList.add('hidden');
        elements.scoreOLabel.textContent = 'O Wins';
        resetBoard();
    });

    elements.btnPvC.addEventListener('click', () => {
        sounds.playClick();
        if (state.mode === 'pvc') return;
        state.mode = 'pvc';
        elements.btnPvC.classList.add('active');
        elements.btnPvP.classList.remove('active');
        elements.difficultyContainer.classList.remove('hidden');
        elements.scoreOLabel.textContent = 'CPU Wins';
        resetBoard();
    });

    // Difficulty buttons
    elements.diffBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sounds.playClick();
            elements.diffBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.difficulty = e.target.getAttribute('data-diff');
            resetBoard();
        });
    });

    // Sound toggle
    elements.btnSound.addEventListener('click', () => {
        const currentlyMuted = !sounds.isMuted;
        sounds.setMuted(currentlyMuted);
        
        if (currentlyMuted) {
            elements.btnSound.classList.remove('sound-on');
            elements.btnSound.classList.add('sound-off');
            elements.btnSound.setAttribute('aria-label', 'Unmute sound effects');
        } else {
            elements.btnSound.classList.remove('sound-off');
            elements.btnSound.classList.add('sound-on');
            elements.btnSound.setAttribute('aria-label', 'Mute sound effects');
            // Play click to confirm sound activation
            sounds.playClick();
        }
    });

    // Cell Clicks
    elements.cells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            // Lazy init sound context on first interactive click
            sounds.init();
            
            const index = parseInt(e.target.getAttribute('data-index'));
            
            // Allow clicking only if cell is empty, game is active, and it is human turn (X)
            if (state.mode === 'pvc' && state.currentPlayer !== 'X') return;
            makeMove(index);
        });
    });

    // Action buttons
    elements.btnReset.addEventListener('click', () => {
        sounds.playClick();
        resetBoard();
    });
    
    elements.btnClearStats.addEventListener('click', () => {
        clearStats();
    });

    elements.btnPlayAgain.addEventListener('click', () => {
        sounds.playClick();
        resetBoard();
    });
}

// Initial entry point
function initialize() {
    loadStats();
    setupEventListeners();
    updateTurnUI();
}

document.addEventListener('DOMContentLoaded', initialize);
