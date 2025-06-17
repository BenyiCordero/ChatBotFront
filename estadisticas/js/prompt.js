// js/prompt.js
// Este archivo maneja la lógica para configurar y actualizar el prompt del sistema.

import { displayMessage, clearMessage, displayError, clearError, showConfirmation } from './utils.js';

const systemPromptTextarea = document.getElementById('system-prompt');
const updatePromptButton = document.getElementById('update-prompt-button');
const backToDashboardButton = document.getElementById('back-to-dashboard-button');
const promptMessage = document.getElementById('prompt-message');
const promptError = document.getElementById('prompt-error');


const BASE_API_URL = 'http://localhost:8081'; 
const PROMPT_API_URL = `${BASE_API_URL}/consultas/prompt/1`; 


async function fetchPrompt() {
    clearMessage(promptMessage);
    clearError(promptError);
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        displayError(promptError, 'No estás autenticado. Por favor, inicia sesión.');
        return;
    }

    try {
        const response = await fetch(PROMPT_API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cargar el prompt.');
        }

        const data = await response.json(); 
        if (data && data.content) {
            systemPromptTextarea.value = data.content; 
            displayMessage(promptMessage, 'Prompt cargado exitosamente.', 'success'); 
        } else {
            displayError(promptError, 'Respuesta de API inesperada: no se encontró el contenido del prompt.');
        }

    } catch (error) {
        console.error('Error fetching prompt:', error);
        displayError(promptError, error.message || 'Error de conexión al cargar el prompt.');
    }
}

async function updatePrompt() {
    clearMessage(promptMessage);
    clearError(promptError);
    const authToken = localStorage.getItem('authToken');
    const newPrompt = systemPromptTextarea.value;
    const url = `${BASE_API_URL}/consultas/prompt/actualizar/1`;

    if (!authToken) {
        displayError(promptError, 'No estás autenticado. Por favor, inicia sesión para actualizar.');
        return false; 
    }

    try {
        const response = await fetch(url, {
            method: 'PUT', 
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ content: newPrompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el prompt.');
        }

        displayMessage(promptMessage, 'Prompt actualizado exitosamente.', 'success');
        return true; 
    } catch (error) {
        console.error('Error updating prompt:', error);
        displayError(promptError, error.message || 'Error de conexión al actualizar el prompt.');
        return false; 
    }
}

// Asignar eventos a los botones
updatePromptButton.addEventListener('click', async () => {
    const confirmed = await showConfirmation('¿Estás seguro de que los cambios en el prompt son correctos y quieres actualizarlos?');
    
    if (confirmed) {
        const updateSuccessful = await updatePrompt();
        if (updateSuccessful) {
            window.location.href = 'dashboard.html'; 
        } else {
        }
    } else {
        displayMessage(promptMessage, 'Actualización del prompt cancelada.', 'info');
    }
});

backToDashboardButton.addEventListener('click', () => {
    window.location.href = 'dashboard.html'; 
});

document.addEventListener('DOMContentLoaded', fetchPrompt);
