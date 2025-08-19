class SudokuSolverVisualizer {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.isRunning = false;
        this.speed = 100;
        this.attempts = 0;
        this.backtrackCount = 0;
        this.cellsFilled = 0;
        
        this.presets = {
            easy: [
                [5,3,0,0,7,0,0,0,0],
                [6,0,0,1,9,5,0,0,0],
                [0,9,8,0,0,0,0,6,0],
                [8,0,0,0,6,0,0,0,3],
                [4,0,0,8,0,3,0,0,1],
                [7,0,0,0,2,0,0,0,6],
                [0,6,0,0,0,0,2,8,0],
                [0,0,0,4,1,9,0,0,5],
                [0,0,0,0,8,0,0,7,9]
            ],
            medium: [
                [0,0,0,6,0,0,4,0,0],
                [7,0,0,0,0,3,6,0,0],
                [0,0,0,0,9,1,0,8,0],
                [0,0,0,0,0,0,0,0,0],
                [0,5,0,1,8,0,0,0,3],
                [0,0,0,3,0,6,0,4,5],
                [0,4,0,2,0,0,0,6,0],
                [9,0,3,0,0,0,0,0,0],
                [0,2,0,0,0,0,1,0,0]
            ],
            hard: [
                [0,0,0,0,0,0,6,8,0],
                [0,0,0,0,4,6,0,0,0],
                [7,0,0,0,0,0,0,0,9],
                [0,5,0,0,0,0,0,0,0],
                [0,0,0,1,0,6,0,0,0],
                [3,0,0,0,0,0,0,0,0],
                [0,4,0,0,0,0,0,0,2],
                [0,0,0,0,2,0,0,0,0],
                [0,0,5,2,0,0,0,0,0]
            ],
            empty: Array(9).fill().map(() => Array(9).fill(0))
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadPreset('medium');
    }

    initializeElements() {
        this.gridElement = document.getElementById('sudokuGrid');
        this.presetSelect = document.getElementById('presetSelect');
        this.loadPresetBtn = document.getElementById('loadPresetBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.solveBtn = document.getElementById('solveBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.speedSelect = document.getElementById('speedSelect');
        this.currentStepElement = document.getElementById('currentStep');
        this.attemptsElement = document.getElementById('attempts');
        this.backtrackElement = document.getElementById('backtrackCount');
        this.cellsFilledElement = document.getElementById('cellsFilled');
        this.resultElement = document.getElementById('result');
    }

    setupEventListeners() {
        this.loadPresetBtn.addEventListener('click', () => {
            this.loadPreset(this.presetSelect.value);
        });
        
        this.generateBtn.addEventListener('click', () => {
            this.generateRandomPuzzle();
        });
        
        this.solveBtn.addEventListener('click', () => {
            if (!this.isRunning) {
                this.solveSudoku();
            }
        });
        
        this.clearBtn.addEventListener('click', () => {
            this.clearGrid();
        });
        
        this.speedSelect.addEventListener('change', (e) => {
            this.speed = parseInt(e.target.value);
        });
    }

    loadPreset(presetName) {
        if (this.isRunning) return;
        
        this.grid = this.presets[presetName].map(row => [...row]);
        this.originalGrid = this.presets[presetName].map(row => [...row]);
        this.renderGrid();
        this.resetStats();
        this.updateStatus('Puzzle cargado. Presiona "Resolver Sudoku" para comenzar.');
    }

    generateRandomPuzzle() {
        if (this.isRunning) return;
        
        // Generar un puzzle aleatorio simple
        this.clearGrid();
        
        // Llenar algunas celdas aleatoriamente
        const cellsToFill = 25 + Math.floor(Math.random() * 15);
        
        for (let i = 0; i < cellsToFill; i++) {
            let row, col, num;
            let attempts = 0;
            
            do {
                row = Math.floor(Math.random() * 9);
                col = Math.floor(Math.random() * 9);
                num = Math.floor(Math.random() * 9) + 1;
                attempts++;
            } while ((this.grid[row][col] !== 0 || !this.isValidMove(row, col, num)) && attempts < 100);
            
            if (attempts < 100) {
                this.grid[row][col] = num;
                this.originalGrid[row][col] = num;
            }
        }
        
        this.renderGrid();
        this.resetStats();
        this.updateStatus('Puzzle aleatorio generado. Presiona "Resolver Sudoku" para comenzar.');
    }

    clearGrid() {
        if (this.isRunning) return;
        
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.renderGrid();
        this.resetStats();
        this.updateStatus('Grid limpiado.');
    }

    renderGrid() {
        this.gridElement.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.grid[row][col] !== 0) {
                    cell.textContent = this.grid[row][col];
                    if (this.originalGrid[row][col] !== 0) {
                        cell.classList.add('given');
                    } else {
                        cell.classList.add('solved');
                    }
                } else {
                    cell.classList.add('empty');
                }
                
                this.gridElement.appendChild(cell);
            }
        }
    }

    getCellElement(row, col) {
        return this.gridElement.children[row * 9 + col];
    }

    updateCellVisual(row, col, value, className) {
        const cell = this.getCellElement(row, col);
        
        // Limpiar clases anteriores
        cell.className = 'sudoku-cell';
        
        if (this.originalGrid[row][col] !== 0) {
            cell.classList.add('given');
        } else if (className) {
            cell.classList.add(className);
        }
        
        if (value !== undefined) {
            cell.textContent = value || '';
        }
    }

    highlightConflicts(row, col, num) {
        // Resaltar conflictos en fila, columna y bloque
        for (let i = 0; i < 9; i++) {
            if (this.grid[row][i] === num && i !== col) {
                this.getCellElement(row, i).classList.add('conflict');
            }
            if (this.grid[i][col] === num && i !== row) {
                this.getCellElement(i, col).classList.add('conflict');
            }
        }
        
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        
        for (let i = blockRow; i < blockRow + 3; i++) {
            for (let j = blockCol; j < blockCol + 3; j++) {
                if (this.grid[i][j] === num && (i !== row || j !== col)) {
                    this.getCellElement(i, j).classList.add('conflict');
                }
            }
        }
    }

    clearHighlights() {
        const cells = this.gridElement.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            cell.classList.remove('current', 'trying', 'valid', 'invalid', 'backtrack', 'conflict');
        });
    }

    isValidMove(row, col, num) {
        // Verificar fila
        for (let i = 0; i < 9; i++) {
            if (this.grid[row][i] === num) {
                return false;
            }
        }
        
        // Verificar columna
        for (let i = 0; i < 9; i++) {
            if (this.grid[i][col] === num) {
                return false;
            }
        }
        
        // Verificar bloque 3x3
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        
        for (let i = blockRow; i < blockRow + 3; i++) {
            for (let j = blockCol; j < blockCol + 3; j++) {
                if (this.grid[i][j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }

    findEmptyCell() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    async solveSudoku() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.solveBtn.disabled = true;
        this.resetStats();
        this.clearResult();
        
        this.updateStatus('Iniciando resolución del Sudoku...');
        
        const solved = await this.solveRecursive();
        
        if (solved) {
            this.showResult('¡Sudoku resuelto exitosamente!', 'success');
            this.animateCompletion();
        } else {
            this.showResult('No se encontró solución para este Sudoku.', 'failure');
        }
        
        this.isRunning = false;
        this.solveBtn.disabled = false;
        this.updateStatus('Resolución completada.');
    }

    async solveRecursive() {
        if (!this.isRunning) return false;
        
        const emptyCell = this.findEmptyCell();
        if (!emptyCell) {
            return true; // Sudoku resuelto
        }
        
        const [row, col] = emptyCell;
        
        // Resaltar celda actual
        this.clearHighlights();
        this.updateCellVisual(row, col, '', 'current');
        this.updateStatus(`Procesando celda (${row + 1}, ${col + 1})...`);
        
        await this.sleep(this.speed);
        
        for (let num = 1; num <= 9; num++) {
            if (!this.isRunning) return false;
            
            this.attempts++;
            this.updateStats();
            
            // Mostrar número que se está probando
            this.updateCellVisual(row, col, num, 'trying');
            this.updateStatus(`Probando número ${num} en celda (${row + 1}, ${col + 1})...`);
            
            await this.sleep(this.speed);
            
            if (this.isValidMove(row, col, num)) {
                // Movimiento válido
                this.grid[row][col] = num;
                this.cellsFilled++;
                this.updateCellVisual(row, col, num, 'valid');
                this.updateStatus(`Número ${num} colocado exitosamente en (${row + 1}, ${col + 1})`);
                
                await this.sleep(this.speed);
                
                // Intentar resolver recursivamente
                if (await this.solveRecursive()) {
                    return true;
                }
                
                // Backtrack
                this.backtrackCount++;
                this.cellsFilled--;
                this.grid[row][col] = 0;
                this.updateCellVisual(row, col, '', 'backtrack');
                this.updateStatus(`Retrocediendo desde (${row + 1}, ${col + 1})...`);
                this.updateStats();
                
                await this.sleep(this.speed);
            } else {
                // Movimiento inválido
                this.updateCellVisual(row, col, num, 'invalid');
                this.highlightConflicts(row, col, num);
                this.updateStatus(`Número ${num} inválido en (${row + 1}, ${col + 1}) - conflicto detectado`);
                
                await this.sleep(this.speed);
                this.clearHighlights();
            }
        }
        
        // No se encontró solución para esta celda
        this.updateCellVisual(row, col, '', 'empty');
        return false;
    }

    animateCompletion() {
        const cells = this.gridElement.querySelectorAll('.sudoku-cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.add('solve-animation');
            }, index * 20);
        });
    }

    updateStatus(message) {
        this.currentStepElement.textContent = message;
    }

    updateStats() {
        this.attemptsElement.textContent = `Intentos: ${this.attempts}`;
        this.backtrackElement.textContent = `Retrocesos: ${this.backtrackCount}`;
        this.cellsFilledElement.textContent = `Celdas llenadas: ${this.cellsFilled}`;
    }

    resetStats() {
        this.attempts = 0;
        this.backtrackCount = 0;
        this.cellsFilled = 0;
        this.updateStats();
    }

    showResult(message, type) {
        this.resultElement.textContent = message;
        this.resultElement.className = type;
    }

    clearResult() {
        this.resultElement.textContent = '';
        this.resultElement.className = '';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new SudokuSolverVisualizer();
});