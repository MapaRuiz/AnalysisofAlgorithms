class MatrixMultiplicationVisualizer {
    constructor() {
        this.size = 2;
        this.matrixA = [];
        this.matrixB = [];
        this.matrixC = [];
        this.isRunning = false;
        this.speed = 600;
        this.operations = 0;
        this.currentI = -1;
        this.currentJ = -1;
        this.currentK = -1;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateMatrices();
    }

    initializeElements() {
        this.matrixSizeSelect = document.getElementById('matrixSize');
        this.generateBtn = document.getElementById('generateBtn');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.speedSelect = document.getElementById('speedSelect');
        this.matrixAContainer = document.getElementById('matrixA');
        this.matrixBContainer = document.getElementById('matrixB');
        this.matrixCContainer = document.getElementById('matrixC');
        this.currentCalculation = document.getElementById('currentCalculation');
        this.stepByStep = document.getElementById('stepByStep');
        this.currentStep = document.getElementById('currentStep');
        this.operationsDisplay = document.getElementById('operations');
        this.currentPositionDisplay = document.getElementById('currentPosition');
        this.result = document.getElementById('result');
    }

    setupEventListeners() {
        this.matrixSizeSelect.addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.generateMatrices();
            this.reset();
        });
        
        this.generateBtn.addEventListener('click', () => this.generateMatrices());
        this.startBtn.addEventListener('click', () => this.startMultiplication());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.speedSelect.addEventListener('change', (e) => {
            this.speed = parseInt(e.target.value);
        });
    }

    generateMatrices() {
        // Generar matrices aleatorias
        this.matrixA = Array(this.size).fill().map(() => 
            Array(this.size).fill().map(() => Math.floor(Math.random() * 9) + 1)
        );
        
        this.matrixB = Array(this.size).fill().map(() => 
            Array(this.size).fill().map(() => Math.floor(Math.random() * 9) + 1)
        );
        
        this.matrixC = Array(this.size).fill().map(() => 
            Array(this.size).fill(0)
        );
        
        this.renderMatrices();
        this.updateStep('Matrices generadas. Listo para multiplicar.');
        this.reset();
    }

    renderMatrices() {
        this.renderMatrix(this.matrixA, this.matrixAContainer, 'A');
        this.renderMatrix(this.matrixB, this.matrixBContainer, 'B');
        this.renderMatrix(this.matrixC, this.matrixCContainer, 'C', true);
    }

    renderMatrix(matrix, container, name, isResult = false) {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                if (isResult) {
                    cell.className += ' result-cell';
                }
                cell.textContent = matrix[i][j] || '';
                cell.id = `${name}-${i}-${j}`;
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                
                // Hacer editables las matrices A y B
                if (!isResult) {
                    cell.className += ' editable';
                    cell.contentEditable = true;
                    cell.addEventListener('input', (e) => {
                        const value = parseInt(e.target.textContent) || 0;
                        if (name === 'A') {
                            this.matrixA[i][j] = value;
                        } else if (name === 'B') {
                            this.matrixB[i][j] = value;
                        }
                    });
                }
                
                container.appendChild(cell);
            }
        }
    }

    updateStep(message) {
        this.currentStep.textContent = message;
    }

    updateStats() {
        this.operationsDisplay.textContent = `Operaciones: ${this.operations}`;
        if (this.currentI >= 0 && this.currentJ >= 0) {
            this.currentPositionDisplay.textContent = `Posición: C[${this.currentI}][${this.currentJ}]`;
        } else {
            this.currentPositionDisplay.textContent = 'Posición: -';
        }
    }

    clearHighlights() {
        document.querySelectorAll('.matrix-cell').forEach(cell => {
            cell.classList.remove('highlighted-row', 'highlighted-col', 'current-result', 'calculating', 'multiplying');
        });
    }

    highlightRowAndColumn(i, j) {
        this.clearHighlights();
        
        // Resaltar fila i de matriz A
        for (let col = 0; col < this.size; col++) {
            const cellA = document.getElementById(`A-${i}-${col}`);
            if (cellA) cellA.classList.add('highlighted-row');
        }
        
        // Resaltar columna j de matriz B
        for (let row = 0; row < this.size; row++) {
            const cellB = document.getElementById(`B-${row}-${j}`);
            if (cellB) cellB.classList.add('highlighted-col');
        }
        
        // Resaltar celda resultado
        const cellC = document.getElementById(`C-${i}-${j}`);
        if (cellC) cellC.classList.add('current-result');
    }

    highlightMultiplication(i, j, k) {
        // Resaltar elementos específicos que se están multiplicando
        const cellA = document.getElementById(`A-${i}-${k}`);
        const cellB = document.getElementById(`B-${k}-${j}`);
        
        if (cellA) cellA.classList.add('multiplying');
        if (cellB) cellB.classList.add('multiplying');
    }

    updateCalculationDisplay(i, j, k, currentSum, product) {
        const aValue = this.matrixA[i][k];
        const bValue = this.matrixB[k][j];
        
        this.currentCalculation.textContent = 
            `C[${i}][${j}] = A[${i}][${k}] × B[${k}][${j}] = ${aValue} × ${bValue} = ${product}`;
        
        // Mostrar el progreso de la suma
        let stepText = `Calculando C[${i}][${j}]: `;
        for (let step = 0; step <= k; step++) {
            if (step > 0) stepText += ' + ';
            const a = this.matrixA[i][step];
            const b = this.matrixB[step][j];
            stepText += `(${a} × ${b})`;
        }
        stepText += ` = ${currentSum}`;
        
        this.stepByStep.textContent = stepText;
    }

    async startMultiplication() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.operations = 0;
        
        // Reinicializar matriz resultado
        this.matrixC = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.renderMatrix(this.matrixC, this.matrixCContainer, 'C', true);
        
        this.updateStep('Iniciando multiplicación de matrices...');
        this.currentCalculation.textContent = 'Preparando cálculos...';
        this.stepByStep.textContent = 'Algoritmo: C[i][j] = Σ(A[i][k] × B[k][j]) para k = 0 hasta n-1';
        await this.sleep(this.speed);

        // Algoritmo de multiplicación de matrices (naive)
        for (let i = 0; i < this.size; i++) {
            if (!this.isRunning) break;
            
            for (let j = 0; j < this.size; j++) {
                if (!this.isRunning) break;
                
                this.currentI = i;
                this.currentJ = j;
                this.updateStats();
                
                this.updateStep(`Calculando elemento C[${i}][${j}]`);
                this.highlightRowAndColumn(i, j);
                
                let sum = 0;
                
                // Calcular el producto punto
                for (let k = 0; k < this.size; k++) {
                    if (!this.isRunning) break;
                    
                    this.currentK = k;
                    this.operations++;
                    
                    const product = this.matrixA[i][k] * this.matrixB[k][j];
                    sum += product;
                    
                    this.highlightMultiplication(i, j, k);
                    this.updateCalculationDisplay(i, j, k, sum, product);
                    this.updateStats();
                    
                    await this.sleep(this.speed);
                    
                    // Limpiar highlights de multiplicación
                    document.querySelectorAll('.multiplying').forEach(cell => {
                        cell.classList.remove('multiplying');
                    });
                }
                
                // Actualizar resultado en la matriz C
                this.matrixC[i][j] = sum;
                const cellC = document.getElementById(`C-${i}-${j}`);
                if (cellC) {
                    cellC.textContent = sum;
                    cellC.classList.add('calculating');
                }
                
                this.updateStep(`C[${i}][${j}] = ${sum} completado`);
                await this.sleep(this.speed / 2);
                
                if (cellC) {
                    cellC.classList.remove('calculating');
                }
            }
        }

        // Completar multiplicación
        if (this.isRunning) {
            this.clearHighlights();
            this.updateStep('¡Multiplicación de matrices completada!');
            this.currentCalculation.textContent = 'Multiplicación finalizada';
            this.stepByStep.textContent = `Resultado: Matriz C de ${this.size}x${this.size} calculada con ${this.operations} operaciones`;
            
            this.result.className = 'success';
            this.result.textContent = `Multiplicación completada exitosamente con ${this.operations} operaciones.`;
        }
        
        this.isRunning = false;
        this.startBtn.disabled = false;
    }

    reset() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.operations = 0;
        this.currentI = -1;
        this.currentJ = -1;
        this.currentK = -1;
        
        // Reinicializar matriz resultado
        this.matrixC = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.renderMatrix(this.matrixC, this.matrixCContainer, 'C', true);
        
        this.clearHighlights();
        
        this.updateStep('Listo para multiplicar matrices...');
        this.updateStats();
        this.currentCalculation.textContent = 'Esperando inicio de multiplicación...';
        this.stepByStep.textContent = 'Las matrices A y B son editables. Modifica los valores si deseas.';
        this.result.textContent = '';
        this.result.className = '';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MatrixMultiplicationVisualizer();
});