// Este archivo contiene funciones para crear y actualizar las gráficas usando Chart.js.

if (!window.charts) {
    window.charts = {};
}

/**
 * Crea o actualiza un gráfico de barras para interacciones por día.
 * @param {string} canvasId - El ID del elemento canvas donde se dibujará el gráfico.
 * @param {Array<string>} labels - Etiquetas para el eje X (días).
 * @param {Array<number>} data - Datos para el eje Y (número de interacciones).
 * @returns {Chart} La instancia del gráfico de Chart.js.
 */
export function createInteractionsByDayChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (window.charts[canvasId] instanceof Chart) {
        window.charts[canvasId].destroy();
    }

    window.charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Interacciones',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Interacciones'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Día'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: false,
                }
            }
        }
    });

    return window.charts[canvasId];
}

/**
 * Crea o actualiza un gráfico de tipo "doughnut" (donas) para las intenciones más frecuentes.
 * @param {string} canvasId - El ID del elemento canvas donde se dibujará el gráfico.
 * @param {Array<string>} labels - Etiquetas para cada segmento.
 * @param {Array<number>} data - Datos para cada segmento.
 * @returns {Chart} La instancia del gráfico de Chart.js.
 */
export function createTopIntentsChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (window.charts[canvasId] instanceof Chart) {
        window.charts[canvasId].destroy();
    }

    const backgroundColors = labels.map(() => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
    });

    const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

    window.charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frecuencia',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: false,
                }
            }
        }
    });

    return window.charts[canvasId];
}
