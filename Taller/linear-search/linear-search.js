class LinearSearchVisualizer {
    constructor() {
        this.array = [];
        this.target = null;
        this.currentIndex = -1;
        this.isRunning = false;
        this.speed = 500;
        this.comparisons = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.parseInput();
        this.renderArray();
    }

    initializeElements() {
        this.arrayInput = document.getElementById('arrayInput');
        this.targetInput = document.getElementById('targetInput');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.speedSelect = document.getElementById('speedSelect');
        this.arrayContainer = document.getElementById('arrayContainer');
        this.currentStep = document.getElementById('currentStep');
        this.comparisonsDisplay = document.getElementById('comparisons');
        this.result = document.getElementById('result');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startSearch());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.speedSelect.addEventListener('change', (e) => {
            this.speed = parseInt(e.target.value);
        });
        this.arrayInput.addEventListener('input', () => {
            this.parseInput();
            this.renderArray();
        });
        this.targetInput.addEventListener('input', () => {
            this.target = parseInt(this.targetInput.value) || null;
        });
    }

    parseInput() {
        const input = this.arrayInput.value.trim();
        if (input) {
            this.array = input.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
        } else {
            this.array = [];
        }
        this.target = parseInt(this.targetInput.value) || null;
    }

    renderArray() {
        this.arrayContainer.innerHTML = '';
        
        this.array.forEach((value, index) => {
            const element = document.createElement('div');
            element.className = 'array-element';
            element.textContent = value;
            element.setAttribute('data-index', index);
            element.id = `element-${index}`;
            this.arrayContainer.appendChild(element);
        });
    }

    updateStep(message) {
        this.currentStep.textContent = message;
    }

    updateComparisons() {
        this.comparisonsDisplay.textContent = `Comparaciones: ${this.comparisons}`;
    }

    showResult(found, index = -1) {
        this.result.className = found ? 'success' : 'failure';
        if (found) {
            this.result.textContent = `¡Elemento encontrado en el índice ${index}!`;
        } else {
            this.result.textContent = 'Elemento no encontrado en el arreglo.';
        }
    }

    async startSearch() {
        if (this.isRunning) return;
        
        this.parseInput();
        
        if (this.array.length === 0) {
            alert('Por favor, ingresa un arreglo válido.');
            return;
        }
        
        if (this.target === null) {
            alert('Por favor, ingresa un número a buscar.');
            return;
        }

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.comparisons = 0;
        this.result.textContent = '';
        this.result.className = '';
        
        // Limpiar estados anteriores
        document.querySelectorAll('.array-element').forEach(el => {
            el.className = 'array-element';
        });

        this.updateStep(`Iniciando búsqueda del elemento ${this.target}...`);
        await this.sleep(this.speed);

        // Algoritmo de búsqueda lineal
        for (let i = 0; i < this.array.length; i++) {
            if (!this.isRunning) break;
            
            this.currentIndex = i;
            const currentElement = document.getElementById(`element-${i}`);
            
            // Resaltar elemento actual
            currentElement.className = 'array-element current';
            this.updateStep(`Comparando elemento en índice ${i}: ${this.array[i]} con ${this.target}`);
            
            await this.sleep(this.speed);
            
            this.comparisons++;
            this.updateComparisons();
            
            if (this.array[i] === this.target) {
                // Elemento encontrado
                currentElement.className = 'array-element found';
                this.updateStep(`¡Elemento ${this.target} encontrado en el índice ${i}!`);
                this.showResult(true, i);
                this.isRunning = false;
                this.startBtn.disabled = false;
                return;
            } else {
                // Elemento no coincide, marcarlo como revisado
                currentElement.className = 'array-element checked';
                this.updateStep(`${this.array[i]} ≠ ${this.target}, continuando...`);
                await this.sleep(this.speed / 2);
            }
        }

        // Si llegamos aquí, el elemento no fue encontrado
        if (this.isRunning) {
            this.updateStep(`Búsqueda completada. Elemento ${this.target} no encontrado.`);
            this.showResult(false);
        }
        
        this.isRunning = false;
        this.startBtn.disabled = false;
    }

    reset() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.currentIndex = -1;
        this.comparisons = 0;
        
        // Limpiar visualización
        document.querySelectorAll('.array-element').forEach(el => {
            el.className = 'array-element';
        });
        
        this.updateStep('Listo para iniciar búsqueda...');
        this.updateComparisons();
        this.result.textContent = '';
        this.result.className = '';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new LinearSearchVisualizer();
});