class NQueensVisualizer {
    constructor() {
        this.n = 4;
        this.board = [];
        this.isRunning = false;
        this.speed = 400;
        this.attempts = 0;
        this.backtrackCount = 0;
        this.solutionsFound = 0;
        this.findingAll = false;
        this.allSolutions = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeBoard();
    }

    initializeElements() {
        this.boardSizeSelect = document.getElementById('boardSize');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.findAllBtn = document.getElementById('findAllBtn');
        this.speedSelect = document.getElementById('speedSelect');
        this.chessboard = document.getElementById('chessboard');
        this.currentStep = document.getElementById('currentStep');
        this.attemptsDisplay = document.getElementById('attempts');
        this.backtrackDisplay = document.getElementById('backtrackCount');
        this.solutionsDisplay = document.getElementById('solutionsFound');
        this.result = document.getElementById('result');
    }

    setupEventListeners() {
        this.boardSizeSelect.addEventListener('change', (e) => {
            this.n = parseInt(e.target.value);
            this.initializeBoard();
            this.reset();
        });
        
        this.startBtn.addEventListener('click', () => this.startSolving());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.findAllBtn.addEventListener('click', () => this.findAllSolutions());
        
        this.speedSelect.addEventListener('change', (e) => {
            this.speed = parseInt(e.target.value);
        });
    }

    initializeBoard() {
        this.board = Array(this.n).fill().map(() => Array(this.n).fill(0));
        this.renderBoard();
    }

    renderBoard() {
        this.chessboard.innerHTML = '';
        this.chessboard.style.gridTemplateColumns = `repeat(${this.n}, 1fr)`;
        
        for (let row = 0; row < this.n; row++) {
            for (let col = 0; col < this.n; col++) {
                const cell = document.createElement('div');
                cell.className = `chess-cell ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                cell.id = `cell-${row}-${col}`;
                cell.setAttribute('data-row', row);
                cell.setAttribute('data-col', col);
                
                if (this.board[row][col] === 1) {
                    cell.textContent = '♛';
                    cell.classList.add('queen');
                }
                
                this.chessboard.appendChild(cell);
            }
        }
    }

    updateStep(message) {
        this.currentStep.textContent = message;
    }

    updateStats() {
        this.attemptsDisplay.textContent = `Intentos: ${this.attempts}`;
        this.backtrackDisplay.textContent = `Retrocesos: ${this.backtrackCount}`;
        this.solutionsDisplay.textContent = `Soluciones: ${this.solutionsFound}`;
    }

    isSafe(row, col) {
        // Verificar columna
        for (let i = 0; i < row; i++) {
            if (this.board[i][col] === 1) {
                return false;
            }
        }
        
        // Verificar diagonal superior izquierda
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (this.board[i][j] === 1) {
                return false;
            }
        }
        
        // Verificar diagonal superior derecha
        for (let i = row - 1, j = col + 1; i >= 0 && j < this.n; i--, j++) {
            if (this.board[i][j] === 1) {
                return false;
            }
        }
        
        return true;
    }

    highlightAttacks(row, col) {
        // Limpiar highlights anteriores
        document.querySelectorAll('.chess-cell').forEach(cell => {
            cell.classList.remove('attacked', 'safe', 'conflict');
        });
        
        // Resaltar ataques
        // Columna
        for (let i = 0; i < this.n; i++) {
            if (i !== row) {
                const cell = document.getElementById(`cell-${i}-${col}`);
                if (cell) cell.classList.add('attacked');
            }
        }
        
        // Diagonal superior izquierda
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) cell.classList.add('attacked');
        }
        
        // Diagonal superior derecha
        for (let i = row - 1, j = col + 1; i >= 0 && j < this.n; i--, j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) cell.classList.add('attacked');
        }
        
        // Diagonal inferior izquierda
        for (let i = row + 1, j = col - 1; i < this.n && j >= 0; i++, j--) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) cell.classList.add('attacked');
        }
        
        // Diagonal inferior derecha
        for (let i = row + 1, j = col + 1; i < this.n && j < this.n; i++, j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) cell.classList.add('attacked');
        }
    }

    async placeQueen(row, col) {
        this.board[row][col] = 1;
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (cell) {
            cell.textContent = '♛';
            cell.classList.add('queen');
        }
        this.highlightAttacks(row, col);
        await this.sleep(this.speed);
    }

    async removeQueen(row, col) {
        this.board[row][col] = 0;
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (cell) {
            cell.textContent = '';
            cell.classList.remove('queen');
        }
        
        // Limpiar highlights
        document.querySelectorAll('.chess-cell').forEach(cell => {
            cell.classList.remove('attacked', 'safe', 'conflict', 'trying');
        });
        
        await this.sleep(this.speed / 2);
    }

    async highlightTrying(row, col) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (cell) {
            cell.classList.add('trying');
        }
        await this.sleep(this.speed / 3);
    }

    async solveNQueens(row = 0) {
        if (!this.isRunning) return false;
        
        // Caso base: todas las reinas colocadas
        if (row === this.n) {
            this.solutionsFound++;
            this.updateStats();
            
            if (this.findingAll) {
                // Guardar solución
                const solution = this.board.map(row => [...row]);
                this.allSolutions.push(solution);
                this.updateStep(`¡Solución ${this.solutionsFound} encontrada!`);
                await this.sleep(this.speed * 2);
                return false; // Continuar buscando más soluciones
            } else {
                this.updateStep('¡Solución encontrada!');
                this.result.className = 'success';
                this.result.textContent = `¡N-Reinas resuelto! Solución encontrada.`;
                return true; // Detener en la primera solución
            }
        }
        
        // Intentar colocar reina en cada columna de la fila actual
        for (let col = 0; col < this.n; col++) {
            if (!this.isRunning) return false;
            
            this.attempts++;
            this.updateStats();
            
            this.updateStep(`Intentando colocar reina en fila ${row}, columna ${col}`);
            await this.highlightTrying(row, col);
            
            if (this.isSafe(row, col)) {
                // Posición segura, colocar reina
                this.updateStep(`Posición segura. Colocando reina en (${row}, ${col})`);
                await this.placeQueen(row, col);
                
                // Recursión para la siguiente fila
                if (await this.solveNQueens(row + 1)) {
                    return true;
                }
                
                // Backtrack: remover reina
                this.backtrackCount++;
                this.updateStats();
                this.updateStep(`Backtracking: removiendo reina de (${row}, ${col})`);
                await this.removeQueen(row, col);
            } else {
                // Posición no segura
                const cell = document.getElementById(`cell-${row}-${col}`);
                if (cell) {
                    cell.classList.remove('trying');
                    cell.classList.add('conflict');
                }
                this.updateStep(`Posición (${row}, ${col}) no es segura. Probando siguiente columna.`);
                await this.sleep(this.speed / 2);
                
                if (cell) {
                    cell.classList.remove('conflict');
                }
            }
        }
        
        return false; // No se encontró solución en esta rama
    }

    async startSolving() {
        if (this.isRunning) return;
        
        this.findingAll = false;
        this.startBtn.disabled = true;
        this.findAllBtn.disabled = true;
        
        // Resetear estadísticas sin cambiar isRunning
        this.attempts = 0;
        this.backtrackCount = 0;
        this.solutionsFound = 0;
        this.allSolutions = [];
        
        this.initializeBoard();
        
        // Limpiar highlights
        document.querySelectorAll('.chess-cell').forEach(cell => {
            cell.classList.remove('attacked', 'safe', 'conflict', 'trying', 'queen');
            cell.textContent = '';
        });
        
        this.updateStats();
        this.result.textContent = '';
        this.result.className = '';
        
        this.isRunning = true;
        this.updateStep('Iniciando algoritmo N-Reinas con backtracking...');
        await this.sleep(this.speed);
        
        const solved = await this.solveNQueens();
        
        if (!solved && this.isRunning) {
            this.updateStep('No se encontró solución para este tamaño de tablero.');
            this.result.className = 'failure';
            this.result.textContent = 'No existe solución para este problema.';
        }
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.findAllBtn.disabled = false;
    }

    async findAllSolutions() {
        if (this.isRunning) return;
        
        this.findingAll = true;
        this.allSolutions = [];
        this.startBtn.disabled = true;
        this.findAllBtn.disabled = true;
        
        // Resetear estadísticas sin cambiar isRunning
        this.attempts = 0;
        this.backtrackCount = 0;
        this.solutionsFound = 0;
        
        this.initializeBoard();
        
        // Limpiar highlights
        document.querySelectorAll('.chess-cell').forEach(cell => {
            cell.classList.remove('attacked', 'safe', 'conflict', 'trying', 'queen');
            cell.textContent = '';
        });
        
        this.updateStats();
        this.result.textContent = '';
        this.result.className = '';
        
        this.isRunning = true;
        this.updateStep('Buscando todas las soluciones posibles...');
        await this.sleep(this.speed);
        
        await this.solveNQueens();
        
        if (this.isRunning) {
            this.updateStep(`Búsqueda completada. Se encontraron ${this.solutionsFound} soluciones.`);
            this.result.className = 'success';
            this.result.textContent = `Se encontraron ${this.solutionsFound} soluciones diferentes.`;
        }
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.findAllBtn.disabled = false;
    }

    reset() {
        this.isRunning = false;
        this.attempts = 0;
        this.backtrackCount = 0;
        this.solutionsFound = 0;
        this.allSolutions = [];
        
        this.initializeBoard();
        
        // Limpiar highlights
        document.querySelectorAll('.chess-cell').forEach(cell => {
            cell.classList.remove('attacked', 'safe', 'conflict', 'trying', 'queen');
            cell.textContent = '';
        });
        
        this.updateStep('Listo para resolver N-Reinas...');
        this.updateStats();
        this.result.textContent = '';
        this.result.className = '';
        
        this.startBtn.disabled = false;
        this.findAllBtn.disabled = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new NQueensVisualizer();
});