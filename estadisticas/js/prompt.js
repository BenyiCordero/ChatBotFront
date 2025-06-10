// js/prompt.js
// Este archivo maneja la lógica para configurar y actualizar el prompt del sistema.

// Importa las funciones de utilidad desde utils.js
import { displayMessage, clearMessage, displayError, clearError, showConfirmation } from './utils.js';

// Referencias a elementos del DOM
const systemPromptTextarea = document.getElementById('system-prompt');
const updatePromptButton = document.getElementById('update-prompt-button');
const backToDashboardButton = document.getElementById('back-to-dashboard-button');
const promptMessage = document.getElementById('prompt-message');
const promptError = document.getElementById('prompt-error');

// URL de tu API para el prompt
// ¡¡¡IMPORTANTE!!!: Reemplaza con la URL real de tu endpoint de prompt
// Por ejemplo: 'http://localhost:8081/api/prompt' o 'http://localhost:8081/admin/prompt'
const BASE_API_URL = 'https://0331-2806-2f0-6001-b2c5-d4e-abd6-a0b1-3adf.ngrok-free.app'; //Cambiar la base api cada que se cambie de tunel en ngrok o si se corre la api en local la base es http://127.0.0.1:8081
const PROMPT_API_URL = `${BASE_API_URL}/prompt/1`; // Ajusta esta URL a tu endpoint real

// Función para obtener el prompt actual de la API
async function fetchPrompt() {
    clearMessage(promptMessage);
    clearError(promptError);
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        displayError(promptError, 'No estás autenticado. Por favor, inicia sesión.');
        // Opcional: redirigir a login.html si no hay token
        // window.location.href = 'login.html';
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

        const data = await response.json(); // Parsear la respuesta como JSON
        // Asumimos que el contenido del prompt está en la clave 'content'
        if (data && data.content) {
            systemPromptTextarea.value = data.content; // Asigna solo el valor de 'content' al textarea
            displayMessage(promptMessage, 'Prompt cargado exitosamente.', 'success'); // Tipo 'success' para confirmación visual
        } else {
            displayError(promptError, 'Respuesta de API inesperada: no se encontró el contenido del prompt.');
        }

    } catch (error) {
        console.error('Error fetching prompt:', error);
        displayError(promptError, error.message || 'Error de conexión al cargar el prompt.');
    }
}

// Función para actualizar el prompt en la API
async function updatePrompt() {
    clearMessage(promptMessage);
    clearError(promptError);
    const authToken = localStorage.getItem('authToken');
    const newPrompt = systemPromptTextarea.value;
    const url = `${BASE_API_URL}/prompt/actualizar/1`;

    if (!authToken) {
        displayError(promptError, 'No estás autenticado. Por favor, inicia sesión para actualizar.');
        return false; // Retorna false para indicar que la operación no continuó
    }

    try {
        const response = await fetch(url, {
            method: 'PUT', // O 'POST' si tu API lo prefiere para actualizar
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
        return true; // Retorna true si la actualización fue exitosa

    } catch (error) {
        console.error('Error updating prompt:', error);
        displayError(promptError, error.message || 'Error de conexión al actualizar el prompt.');
        return false; // Retorna false si hubo un error en la actualización
    }
}

// Asignar eventos a los botones
updatePromptButton.addEventListener('click', async () => {
    // Muestra la confirmación antes de intentar actualizar el prompt
    const confirmed = await showConfirmation('¿Estás seguro de que los cambios en el prompt son correctos y quieres actualizarlos?');
    
    if (confirmed) {
        // Si el usuario confirma, intenta actualizar el prompt
        const updateSuccessful = await updatePrompt();
        if (updateSuccessful) {
            // Si la actualización fue exitosa, redirige al dashboard
            window.location.href = 'dashboard.html'; 
        } else {
            // Si la actualización falló (por error de API o auth), quédate en la página y el mensaje de error ya se habrá mostrado.
            // No es necesario un showMessage adicional aquí, ya que updatePrompt lo maneja.
        }
    } else {
        // Si el usuario cancela, quédate en la página y muestra un mensaje
        displayMessage(promptMessage, 'Actualización del prompt cancelada.', 'info');
    }
});

backToDashboardButton.addEventListener('click', () => {
    window.location.href = 'dashboard.html'; // Redirige al dashboard
});

// Cargar el prompt cuando la página se cargue
document.addEventListener('DOMContentLoaded', fetchPrompt);
