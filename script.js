/**
 * ==========================================================================
 * Controlador Unificado del Simulador - INACAP 2026
 * Ecuaciones de Fila Virtual con Adaptación Dinámica de Colores
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Selectores de Pestañas y Paneles
    const tabAuto = document.getElementById('tab-auto');
    const tabManual = document.getElementById('tab-manual');
    const panelAuto = document.getElementById('panel-auto');
    const panelManual = document.getElementById('panel-manual');
    
    // Controles de Entrada
    const regForm = document.getElementById('registration-form');
    const userNameInput = document.getElementById('user-name');
    const liveQueueContainer = document.getElementById('live-queue');
    const queueCountBadge = document.getElementById('queue-count');
    const rangeSlider = document.getElementById('range-x');
    const rangeVal = document.getElementById('range-val');
    const inputCapacidad = document.getElementById('capacidad-atencion');

    // Paneles de Métricas
    const outputTime = document.getElementById('output-time');
    const outputDerivative = document.getElementById('output-derivative');
    const outputStatus = document.getElementById('output-status');
    const outputRecommendation = document.getElementById('output-recommendation');

    // Control de Lámpara (Tema)
    const lampToggle = document.getElementById('lamp-toggle');
    const lampText = document.getElementById('lamp-text');

    // Variables de Estado Operativo
    let currentMode = 'auto'; 
    let registeredUsersList = []; 
    let myChart = null;

    // --- MANEJADOR INTERRUPTOR LÁMPARA (CAMBIO DE TEMA) ---
    lampToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            lampText.textContent = "Lámpara: Apagada (Modo Oscuro)";
            document.querySelector('.lamp-icon').textContent = "🔌";
        } else {
            lampText.textContent = "Lámpara: Encendida (Modo Claro)";
            document.querySelector('.lamp-icon').textContent = "💡";
        }
        ejecutarCicloCalculo();
    });

    // --- ENRUTAMIENTO DE PESTAÑAS ---
    tabAuto.addEventListener('click', () => {
        currentMode = 'auto';
        tabAuto.classList.add('active');
        tabManual.classList.remove('active');
        panelAuto.classList.remove('hidden');
        panelManual.classList.add('hidden');
        ejecutarCicloCalculo();
    });

    tabManual.addEventListener('click', () => {
        currentMode = 'manual';
        tabManual.classList.add('active');
        tabAuto.classList.remove('active');
        panelManual.classList.remove('hidden');
        panelAuto.classList.add('hidden');
        ejecutarCicloCalculo();
    });

    // --- CONTROLADOR REGISTRO AUTOMÁTICO ---
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = userNameInput.value.trim();
        if(!nombre) return;

        registeredUsersList.push({ nombre: nombre });
        
        if(registeredUsersList.length === 1) {
            liveQueueContainer.innerHTML = '';
        }

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.innerHTML = `👤 ${nombre.split(' ')[0]} <span>#${registeredUsersList.length}</span>`;
        liveQueueContainer.appendChild(avatar);

        queueCountBadge.textContent = registeredUsersList.length;
        regForm.reset();
        ejecutarCicloCalculo();
    });

    // --- CONTROLADOR DESLIZADOR MANUAL ---
    rangeSlider.addEventListener('input', () => {
        rangeVal.textContent = rangeSlider.value;
        if(currentMode === 'manual') {
            ejecutarCicloCalculo();
        }
    });

    inputCapacidad.addEventListener('input', ejecutarCicloCalculo);

    // --- MOTOR DE CÁLCULO DIFERENCIAL ---
    function ejecutarCicloCalculo() {
        const x = (currentMode === 'auto') ? registeredUsersList.length : parseInt(rangeSlider.value);
        const capacidad = parseFloat(inputCapacidad.value) || 1.0;

        // Ecuaciones Oficiales del Proyecto (Diapositiva 9)
        const tiempoEstimado = ((0.05 * Math.pow(x, 2)) + (0.5 * x)) / capacidad;
        const tasaCambioInstantanea = ((0.1 * x) + 0.5) / capacidad;

        outputTime.textContent = `${tiempoEstimado.toFixed(2)} min`;
        outputDerivative.textContent = `+${tasaCambioInstantanea.toFixed(2)} min/u`;

        // Colores y Estados dinámicos según el modo de la lámpara
        const isDark = document.body.classList.contains('dark-theme');
        let diagnostico = {};

        if (x <= 10) {
            diagnostico = { 
                estado: "NORMAL", 
                color: isDark ? "#4ade80" : "#16a34a", 
                recomendacion: "Operación óptima. El flujo se mantiene fluido bajo los parámetros actuales del sistema." 
            };
        } else if (x > 10 && x <= 25) {
            diagnostico = { 
                estado: "MEDIO", 
                color: isDark ? "#fb923c" : "#ea580c", 
                recomendacion: "Alerta preventiva: La velocidad de crecimiento aumenta. Se sugiere informar tiempos de espera en pantalla para mitigar la deserción." 
            };
        } else {
            diagnostico = { 
                estado: "SATURADO", 
                color: isDark ? "#f87171" : "#dc2626", 
                recommendation: "¡Punto crítico de saturación! La derivada demuestra un alto retraso instantáneo. Propuesta: Incrementar inmediatamente la capacidad de procesamiento técnico del sistema." 
            };
        }

        outputStatus.textContent = diagnostico.estado;
        outputStatus.style.color = diagnostico.color;
        outputRecommendation.textContent = diagnostico.recomendacion || diagnostico.recommendation;

        actualizarGrafico(x, capacidad);
    }

    // --- MÓDULO GRÁFICO REACTIVO ---
    function actualizarGrafico(usuariosActuales, capacidad) {
        const ctx = document.getElementById('queueChart').getContext('2d');
        const labels = [];
        const dataTiempo = [];
        const limiteMaximo = Math.max(usuariosActuales * 1.4, 25);

        for (let i = 0; i <= limiteMaximo; i += 2) {
            labels.push(i);
            const t = ((0.05 * Math.pow(i, 2)) + (0.5 * i)) / capacidad;
            dataTiempo.push(t.toFixed(2));
        }

        if (myChart) { myChart.destroy(); }

        const isDark = document.body.classList.contains('dark-theme');
        const colorTexto = isDark ? '#94a3b8' : '#475569';
        const colorLineaEje = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.08)';

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tiempo de Espera T(x) (Minutos)',
                    data: dataTiempo,
                    borderColor: isDark ? '#38bdf8' : '#0284c7',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.05)' : 'rgba(2, 132, 199, 0.05)',
                    borderWidth: 3,
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: colorTexto } } },
                scales: {
                    x: { ticks: { color: colorTexto }, grid: { color: colorLineaEje } },
                    y: { ticks: { color: colorTexto }, grid: { color: colorLineaEje } }
                }
            }
        });
    }

    // Ejecución inicial automática
    ejecutarCicloCalculo();
});