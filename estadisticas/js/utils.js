/**
 * Muestra un mensaje temporal al usuario.
 * @param {HTMLElement} element 
 * @param {string} message 
 * @param {string} type 
 */
export function displayMessage(element, message, type = 'info') {
    element.textContent = message;
    element.className = `info-message ${type}`; 
    element.classList.remove('hidden'); 
}

/**
 * Limpia el mensaje de un elemento.
 * @param {HTMLElement} element - El elemento DOM cuyo mensaje se limpiará.
 */
export function clearMessage(element) {
    element.textContent = '';
    element.className = 'info-message'; 
}

/**
 * Muestra un mensaje de error temporal al usuario.
 * @param {HTMLElement} element 
 * @param {string} message 
 */
export function displayError(element, message) {
    element.textContent = message;
    element.className = 'error-message'; 
    element.classList.remove('hidden');
}

/**
 * Limpia el mensaje de error de un elemento.
 * @param {HTMLElement} element 
 */
export function clearError(element) {
    element.textContent = '';
    element.className = 'error-message'; 
}

/**
 * Oculta un elemento añadiendo la clase 'hidden'.
 * @param {HTMLElement} element 
 */
export function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Muestra un elemento removiendo la clase 'hidden'.
 * @param {HTMLElement} element 
 */
export function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}


/**
 * Muestra un cuadro de diálogo de confirmación personalizado.
 * Esta función espera la interacción del usuario con el modal.
 * @param {string} message 
 * @returns {Promise<boolean>} 
 */
export function showConfirmation(message) {
    return new Promise(resolve => {
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        const confirmYesBtn = document.getElementById('confirmYes');
        const confirmNoBtn = document.getElementById('confirmNo');

        if (!confirmationModal || !confirmationMessage || !confirmYesBtn || !confirmNoBtn) {
            console.error('Elementos del modal de confirmación no encontrados. Asegúrate de que el HTML del modal esté presente.');
            resolve(false); 
            return;
        }

        confirmationMessage.textContent = message;
        confirmationModal.classList.remove('hidden'); 

        const cleanUp = () => {
            confirmYesBtn.removeEventListener('click', onYes);
            confirmNoBtn.removeEventListener('click', onNo);
            confirmationModal.classList.add('hidden'); 
        };

        const onYes = () => {
            cleanUp();
            resolve(true);
        };

        const onNo = () => {
            cleanUp();
            resolve(false);
        };

        confirmYesBtn.addEventListener('click', onYes);
        confirmNoBtn.addEventListener('click', onNo);
    });
}
