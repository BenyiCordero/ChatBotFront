// js/auth.js
// Este archivo maneja la lógica de autenticación del usuario (login y logout) con una API de Spring Boot.

// Importa las funciones utilitarias desde utils.js
import { showElement, hideElement, displayError, clearError, displayMessage, clearMessage } from './utils.js';

// Obtiene referencias a los elementos del DOM
const authContainer = document.getElementById('auth-container'); // Contenedor padre de login/registro
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const dashboardContainer = document.getElementById('dashboard-container');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const logoutButton = document.getElementById('logout-button');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const authMessage = document.getElementById('auth-message'); // Elemento para mensajes de éxito/información

// URL base de tu API de Spring Boot
// ¡¡¡IMPORTANTE!!!: Reemplaza 'https://your-spring-boot-api.com' con la URL base real de tu API.
// Ejemplos: 'http://localhost:8080' si la ejecutas localmente, o el dominio de tu servidor.
const BASE_API_URL = 'http://127.0.0.1:8081';
const LOGIN_API_URL = `${BASE_API_URL}/auth/login`;
const REGISTER_API_URL = `${BASE_API_URL}/auth/register`;

// Función para verificar el estado de autenticación al cargar la página
// Ahora verifica si hay un token de autenticación en localStorage.
function checkAuthStatus() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        showDashboard();
    } else {
        showLoginView(); // Muestra la vista de login por defecto
    }
}

// Función para mostrar la vista de inicio de sesión y ocultar otras
function showLoginView() {
    showElement(loginContainer);
    hideElement(registerContainer);
    hideElement(dashboardContainer);
    clearError(loginError);
    clearError(registerError);
    clearMessage(authMessage); // Limpia cualquier mensaje de éxito/información
}

// Función para mostrar la vista de registro y ocultar otras
function showRegisterView() {
    hideElement(loginContainer);
    showElement(registerContainer);
    hideElement(dashboardContainer);
    clearError(loginError);
    clearError(registerError);
    clearMessage(authMessage); // Limpia cualquier mensaje de éxito/información
}

// Función para mostrar el dashboard y ocultar los contenedores de autenticación
function showDashboard() {
    hideElement(authContainer); // Oculta el contenedor padre de login/registro
    showElement(dashboardContainer);
    // Dispara un evento para que dashboard.js sepa que debe cargar los datos
    document.dispatchEvent(new Event('dashboardLoaded'));
}

// Manejador del evento de envío del formulario de inicio de sesión
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita el envío predeterminado del formulario

    const username = loginForm.username.value;
    const password = loginForm.password.value;

    clearError(loginError); // Limpia errores anteriores
    clearMessage(authMessage); // Oculta cualquier mensaje previo

    try {
        console.log('Intentando iniciar sesión con:', { username, password });
        // Realiza la solicitud a la API de login de Spring Boot
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: username, password }),
        });

        // Depuración: Log de la respuesta completa de la API
        const responseData = await response.json();
        console.log('Respuesta de la API de login:', responseData);

        if (!response.ok) {
            // Si la respuesta no es OK (ej. 401 Unauthorized, 400 Bad Request)
            // Asume que el mensaje de error puede venir en un campo 'message' o similar
            throw new Error(responseData.message || 'Credenciales inválidas. Por favor, inténtalo de nuevo.');
        }

        // Asume que la API devuelve un token en el campo 'token' de la respuesta (TokenResponse)
        if (responseData.access_token) {
        localStorage.setItem('authToken', responseData.access_token);
        displayMessage(authMessage, '¡Inicio de sesión exitoso!');
        showDashboard();
        } else {
        displayError(loginError, 'Respuesta de API inesperada: no se recibió access_token.');
        }

    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        displayError(loginError, error.message || 'Error al conectar con el servidor. Por favor, verifica la URL de la API y la consola para más detalles.');
    }
});

// Manejador del evento de envío del formulario de registro
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita el envío predeterminado del formulario

    const username = registerForm['reg-username'].value; // Usa el ID del input
    const password = registerForm['reg-password'].value; // Usa el ID del input

    clearError(registerError); // Limpia errores anteriores
    clearMessage(authMessage); // Oculta cualquier mensaje previo

    try {
        console.log('Intentando registrar con:', { username, password });
        // Realiza la solicitud a la API de registro de Spring Boot
        const response = await fetch(REGISTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }), // Envía username y password en formato JSON
        });

        // Depuración: Log de la respuesta completa de la API
        const responseData = await response.json();
        console.log('Respuesta de la API de registro:', responseData);

        if (!response.ok) {
            // Si la respuesta no es OK (ej. 409 Conflict si el usuario ya existe)
            throw new Error(responseData.message || 'Error al registrar el usuario. Inténtalo de nuevo.');
        }

        // Asume que la API devuelve un token en el campo 'token' después de un registro exitoso
        if (responseData.token) {
            localStorage.setItem('authToken', responseData.token); // Guarda el token de autenticación
            displayMessage(authMessage, '¡Registro exitoso! Has iniciado sesión automáticamente.');
            showDashboard();
        } else {
            displayError(registerError, 'Registro exitoso, pero no se recibió token. Por favor, inicia sesión.');
            showLoginView(); // Si no hay token, vuelve a la vista de login
        }

    } catch (error) {
        console.error('Error durante el registro:', error);
        displayError(registerError, error.message || 'Error al conectar con el servidor para el registro. Verifica la URL de la API y la consola.');
    }
});


// Manejador del evento de clic del botón de cerrar sesión
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken'); // Elimina el token de autenticación
    showLoginView(); // Vuelve a la vista de login
});

// Manejadores para alternar entre formularios
showRegisterLink.addEventListener('click', (event) => {
    event.preventDefault();
    showRegisterView();
});

showLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    showLoginView();
});

// Llama a checkAuthStatus cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', checkAuthStatus);
