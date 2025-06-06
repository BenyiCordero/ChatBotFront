/**
 * Muestra un mensaje temporal al usuario.
 * @param {HTMLElement} element - El elemento DOM donde se mostrará el mensaje.
 * @param {string} message - El texto del mensaje.
 * @param {string} type - El tipo de mensaje (por ejemplo, 'info', 'success', 'error').
 */
export function displayMessage(element, message, type = 'info') {
    element.textContent = message;
    element.className = `info-message ${type}`; // Asegura que la clase base y el tipo se apliquen
    element.classList.remove('hidden'); // Asegúrate de que no esté oculto si se reutiliza
}

/**
 * Limpia el mensaje de un elemento.
 * @param {HTMLElement} element - El elemento DOM cuyo mensaje se limpiará.
 */
export function clearMessage(element) {
    element.textContent = '';
    element.className = 'info-message'; // Reinicia las clases a la base
}

/**
 * Muestra un mensaje de error temporal al usuario.
 * @param {HTMLElement} element - El elemento DOM donde se mostrará el error.
 * @param {string} message - El texto del error.
 */
export function displayError(element, message) {
    element.textContent = message;
    element.className = 'error-message'; // Asegura que la clase base se aplique
    element.classList.remove('hidden'); // Asegúrate de que no esté oculto si se reutiliza
}

/**
 * Limpia el mensaje de error de un elemento.
 * @param {HTMLElement} element - El elemento DOM cuyo mensaje de error se limpiará.
 */
export function clearError(element) {
    element.textContent = '';
    element.className = 'error-message'; // Reinicia las clases a la base
}

/**
 * Oculta un elemento añadiendo la clase 'hidden'.
 * @param {HTMLElement} element - El elemento DOM a ocultar.
 */
export function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Muestra un elemento removiendo la clase 'hidden'.
 * @param {HTMLElement} element - El elemento DOM a mostrar.
 */
export function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}


/**
 * Muestra un cuadro de diálogo de confirmación personalizado.
 * Esta función espera la interacción del usuario con el modal.
 * @param {string} message - El mensaje a mostrar en el cuadro de confirmación.
 * @returns {Promise<boolean>} Resuelve a true si el usuario hace clic en 'Sí', false si hace clic en 'No'.
 */
export function showConfirmation(message) {
    return new Promise(resolve => {
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        const confirmYesBtn = document.getElementById('confirmYes');
        const confirmNoBtn = document.getElementById('confirmNo');

        if (!confirmationModal || !confirmationMessage || !confirmYesBtn || !confirmNoBtn) {
            console.error('Elementos del modal de confirmación no encontrados. Asegúrate de que el HTML del modal esté presente.');
            // Si los elementos no están, resolvemos a false por defecto para no proceder sin confirmación visual.
            resolve(false); 
            return;
        }

        confirmationMessage.textContent = message;
        confirmationModal.classList.remove('hidden'); // Mostrar el modal

        // Función para limpiar los listeners y ocultar el modal
        const cleanUp = () => {
            confirmYesBtn.removeEventListener('click', onYes);
            confirmNoBtn.removeEventListener('click', onNo);
            confirmationModal.classList.add('hidden'); // Ocultar el modal
        };

        const onYes = () => {
            cleanUp();
            resolve(true);
        };

        const onNo = () => {
            cleanUp();
            resolve(false);
        };

        // Asignar los listeners de click
        confirmYesBtn.addEventListener('click', onYes);
        confirmNoBtn.addEventListener('click', onNo);
    });
}
