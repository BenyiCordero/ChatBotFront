// js/dashboard.js
// Este archivo maneja la lógi`ca` para obtener y mostrar las estadísticas en el dashboard, consumiendo una API.

// Importa las funciones de creación de gráficos desde charts.js
import { createTopIntentsChart } from './charts.js';

// URL base de tu API de Spring Boot
// ¡¡¡IMPORTANTE!!!: Asegúrate de que esta URL coincida con la BASE_API_URL en auth.js
const BASE_API_URL = 'http://127.0.0.1:8081';
const SUBTEMA_API_URL = `${BASE_API_URL}/consultas/por-subtema`; // Endpoint para estadísticas por subtema
const TEMA_API_URL = `${BASE_API_URL}/consultas/por-tema`; // Endpoint para estadísticas por tema
const TOTAL_CONSULTAS_API_URL = `${BASE_API_URL}/consultas`; // Endpoint para el total de consultas

// Función para cargar y mostrar los datos del dashboard
async function loadDashboardData() {
    console.log('Cargando datos del dashboard desde la API...');

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.error('No se encontró token de autenticación. Redirigiendo al login.');
        return;
    }

    try {
        // --- Obtener el total de consultas ---
        console.log(`Realizando solicitud a: ${TOTAL_CONSULTAS_API_URL}`);
        const responseTotalConsultas = await fetch(TOTAL_CONSULTAS_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
        });

        const totalConsultas = await responseTotalConsultas.json();
        console.log('Total de consultas:', totalConsultas);

        if (!responseTotalConsultas.ok) {
            console.error('Error al obtener el total de consultas.');
        }

        const interactionsCountElement = document.getElementById('interactions-count');
        if (interactionsCountElement) {
            interactionsCountElement.textContent = totalConsultas;
        }

        // --- Cargar datos para "Temas más frecuentes" ---
        console.log(`Realizando solicitud a: ${TEMA_API_URL}`);
        const responseTema = await fetch(TEMA_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
        });

        const temaData = await responseTema.json();
        console.log('Respuesta de la API de tema:', temaData);

        if (!responseTema.ok) {
            console.error('Error al obtener las estadísticas por tema.');
        }

        const temaLabels = Object.keys(temaData);
        const temaDataValues = Object.values(temaData);
        createTopIntentsChart('top-themes-chart', temaLabels, temaDataValues);

        // --- Cargar datos para "Subtemas más frecuentes" ---
        console.log(`Realizando solicitud a: ${SUBTEMA_API_URL}`);
        const responseSubtema = await fetch(SUBTEMA_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
        });

        const subtemaData = await responseSubtema.json();
        console.log('Respuesta de la API de subtema:', subtemaData);

        if (!responseSubtema.ok) {
            console.error('Error al obtener las estadísticas por subtema.');
        }

        const subtemaLabels = Object.keys(subtemaData);
        const subtemaDataValues = Object.values(subtemaData);
        createTopIntentsChart('top-intents-chart', subtemaLabels, subtemaDataValues);

        console.log('Dashboard cargado con éxito.');

    } catch (error) {
        console.error('Error al cargar los datos del dashboard:', error);
    }
}

// Escucha el evento 'dashboardLoaded' que se dispara desde auth.js
document.addEventListener('dashboardLoaded', loadDashboardData);