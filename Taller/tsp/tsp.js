class TSPVisualizer {
    constructor() {
        this.cities = [];
        this.currentRoute = [];
        this.bestRoute = [];
        this.bestDistance = Infinity;
        this.isRunning = false;
        this.speed = 300;
        this.permutationsCount = 0;
        this.svgWidth = 600;
        this.svgHeight = 400;
        this.margin = 50;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateCities();
    }

    initializeElements() {
        this.cityCountSelect = document.getElementById('cityCount');
        this.generateBtn = document.getElementById('generateBtn');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.speedSelect = document.getElementById('speedSelect');
        this.mapSvg = document.getElementById('mapSvg');
        this.currentStep = document.getElementById('currentStep');
        this.permutationsDisplay = document.getElementById('permutations');
        this.currentDistanceDisplay = document.getElementById('currentDistance');
        this.bestDistanceDisplay = document.getElementById('bestDistance');
        this.result = document.getElementById('result');
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateCities());
        this.startBtn.addEventListener('click', () => this.startTSP());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.speedSelect.addEventListener('change', (e) => {
            this.speed = parseInt(e.target.value);
        });
    }

    generateCities() {
        const cityCount = parseInt(this.cityCountSelect.value);
        this.cities = [];
        
        // Generar ciudades en posiciones aleatorias
        for (let i = 0; i < cityCount; i++) {
            this.cities.push({
                id: i,
                x: this.margin + Math.random() * (this.svgWidth - 2 * this.margin),
                y: this.margin + Math.random() * (this.svgHeight - 2 * this.margin)
            });
        }
        
        this.renderMap();
        this.updateStep('Ciudades generadas. Listo para iniciar TSP.');
        this.reset();
    }

    renderMap() {
        // Limpiar SVG
        this.mapSvg.innerHTML = '';
        
        // Dibujar ciudades
        this.cities.forEach((city, index) => {
            // Círculo de la ciudad
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', city.x);
            circle.setAttribute('cy', city.y);
            circle.setAttribute('r', 6);
            circle.setAttribute('class', index === 0 ? 'city start' : 'city');
            circle.setAttribute('id', `city-${index}`);
            this.mapSvg.appendChild(circle);
            
            // Etiqueta de la ciudad
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', city.x);
            text.setAttribute('y', city.y - 15);
            text.setAttribute('class', 'city-label');
            text.textContent = index;
            this.mapSvg.appendChild(text);
        });
    }

    drawRoute(route, className = 'route-line') {
        // Limpiar rutas anteriores de la misma clase
        document.querySelectorAll(`.${className}`).forEach(el => el.remove());
        
        if (route.length < 2) return;
        
        // Dibujar líneas de la ruta
        for (let i = 0; i < route.length; i++) {
            const from = this.cities[route[i]];
            const to = this.cities[route[(i + 1) % route.length]];
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', from.x);
            line.setAttribute('y1', from.y);
            line.setAttribute('x2', to.x);
            line.setAttribute('y2', to.y);
            line.setAttribute('class', className);
            this.mapSvg.appendChild(line);
        }
    }

    calculateDistance(route) {
        let totalDistance = 0;
        for (let i = 0; i < route.length; i++) {
            const from = this.cities[route[i]];
            const to = this.cities[route[(i + 1) % route.length]];
            const distance = Math.sqrt(
                Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
            );
            totalDistance += distance;
        }
        return totalDistance;
    }

    generatePermutations(arr) {
        if (arr.length <= 1) return [arr];
        
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const permutations = this.generatePermutations(remaining);
            
            for (const perm of permutations) {
                result.push([current, ...perm]);
            }
        }
        return result;
    }

    updateStep(message) {
        this.currentStep.textContent = message;
    }

    updateStats() {
        this.permutationsDisplay.textContent = `Permutaciones evaluadas: ${this.permutationsCount}`;
        
        if (this.currentRoute.length > 0) {
            const currentDist = this.calculateDistance(this.currentRoute);
            this.currentDistanceDisplay.textContent = `Distancia actual: ${currentDist.toFixed(2)}`;
        }
        
        if (this.bestDistance !== Infinity) {
            this.bestDistanceDisplay.textContent = `Mejor distancia: ${this.bestDistance.toFixed(2)}`;
        }
    }

    async startTSP() {
        if (this.isRunning) return;
        
        if (this.cities.length < 3) {
            alert('Se necesitan al menos 3 ciudades para el TSP.');
            return;
        }

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.permutationsCount = 0;
        this.bestDistance = Infinity;
        this.bestRoute = [];
        
        this.updateStep('Iniciando algoritmo TSP por fuerza bruta...');
        await this.sleep(this.speed);

        // Generar todas las permutaciones (fijamos la primera ciudad como origen)
        const remainingCities = Array.from({length: this.cities.length - 1}, (_, i) => i + 1);
        const permutations = this.generatePermutations(remainingCities);
        
        this.updateStep(`Evaluando ${permutations.length} permutaciones posibles...`);
        await this.sleep(this.speed);

        // Evaluar cada permutación
        for (const perm of permutations) {
            if (!this.isRunning) break;
            
            // Crear ruta completa (empezando desde ciudad 0)
            this.currentRoute = [0, ...perm];
            this.permutationsCount++;
            
            // Visualizar ruta actual
            this.drawRoute(this.currentRoute, 'current-route');
            
            // Calcular distancia
            const distance = this.calculateDistance(this.currentRoute);
            
            this.updateStep(`Evaluando ruta: ${this.currentRoute.join(' → ')} → 0`);
            this.updateStats();
            
            // Resaltar ciudades de la ruta actual
            this.highlightRoute(this.currentRoute);
            
            await this.sleep(this.speed);
            
            // Verificar si es la mejor ruta hasta ahora
            if (distance < this.bestDistance) {
                this.bestDistance = distance;
                this.bestRoute = [...this.currentRoute];
                this.drawRoute(this.bestRoute, 'best-route');
                this.updateStep(`¡Nueva mejor ruta encontrada! Distancia: ${distance.toFixed(2)}`);
                await this.sleep(this.speed);
            }
            
            this.clearHighlights();
        }

        // Mostrar resultado final
        if (this.isRunning) {
            this.drawRoute(this.bestRoute, 'best-route');
            this.updateStep(`TSP completado. Ruta óptima: ${this.bestRoute.join(' → ')} → 0`);
            this.result.className = 'success';
            this.result.textContent = `Ruta óptima encontrada con distancia: ${this.bestDistance.toFixed(2)}`;
        }
        
        this.isRunning = false;
        this.startBtn.disabled = false;
    }

    highlightRoute(route) {
        // Limpiar highlights anteriores
        this.clearHighlights();
        
        // Resaltar ciudades de la ruta
        route.forEach(cityIndex => {
            const cityElement = document.getElementById(`city-${cityIndex}`);
            if (cityElement) {
                cityElement.classList.add('visiting');
            }
        });
    }

    clearHighlights() {
        document.querySelectorAll('.city').forEach(city => {
            city.classList.remove('visiting');
        });
    }

    reset() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.permutationsCount = 0;
        this.bestDistance = Infinity;
        this.bestRoute = [];
        this.currentRoute = [];
        
        // Limpiar visualización
        document.querySelectorAll('.route-line, .current-route, .best-route').forEach(el => el.remove());
        this.clearHighlights();
        
        this.updateStep('Listo para iniciar TSP...');
        this.permutationsDisplay.textContent = 'Permutaciones evaluadas: 0';
        this.currentDistanceDisplay.textContent = 'Distancia actual: -';
        this.bestDistanceDisplay.textContent = 'Mejor distancia: -';
        this.result.textContent = '';
        this.result.className = '';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new TSPVisualizer();
});