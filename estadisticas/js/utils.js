// js/utils.js
// Este archivo contiene funciones utilitarias que pueden ser usadas en otras partes de la aplicación.

/**
 * Muestra un elemento HTML.
 * @param {HTMLElement} element - El elemento HTML a mostrar.
 */
export function showElement(element) {
    if (element) {
        element.style.display = 'block'; // O 'flex', 'grid', etc., dependiendo del estilo original.
    }
}

/**
 * Oculta un elemento HTML.
 * @param {HTMLElement} element - El elemento HTML a ocultar.
 */
export function hideElement(element) {
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Muestra un mensaje de error en un elemento específico.
 * @param {HTMLElement} errorElement - El elemento HTML donde se mostrará el error.
 * @param {string} message - El mensaje de error a mostrar.
 */
export function displayError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        showElement(errorElement);
    }
}

/**
 * Borra un mensaje de error de un elemento.
 * @param {HTMLElement} errorElement - El elemento HTML del cual se borrará el error.
 */
export function clearError(errorElement) {
    if (errorElement) {
        errorElement.textContent = '';
        hideElement(errorElement);
    }
}

/**
 * Muestra un mensaje de éxito o información en un elemento específico.
 * @param {HTMLElement} messageElement - El elemento HTML donde se mostrará el mensaje.
 * @param {string} message - El mensaje a mostrar.
 */
export function displayMessage(messageElement, message) {
    if (messageElement) {
        messageElement.textContent = message;
        showElement(messageElement);
    }
}

/**
 * Borra un mensaje de éxito o información de un elemento.
 * @param {HTMLElement} messageElement - El elemento HTML del cual se borrará el mensaje.
 */
export function clearMessage(messageElement) {
    if (messageElement) {
        messageElement.textContent = '';
        hideElement(messageElement);
    }
}
