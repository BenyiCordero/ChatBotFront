// js/auth.js
// Este archivo maneja la lógica de autenticación del usuario (login y logout) con una API de Spring Boot.

// Importa las funciones utilitarias desde utils.js
import { showElement, hideElement, displayError, clearError, displayMessage, clearMessage } from './utils.js';

// Obtiene referencias a los elementos del DOM
const authContainer = document.getElementById('auth-container');
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
const authMessage = document.getElementById('auth-message');

const BASE_API_URL = 'https://5b61-201-163-190-4.ngrok-free.app';
const LOGIN_API_URL = `${BASE_API_URL}/auth/login`;
const REGISTER_API_URL = `${BASE_API_URL}/auth/register`;

// Función para verificar el estado de autenticación al cargar la página
function checkAuthStatus() {
    console.log('--- checkAuthStatus called ---');
    console.log('Current path:', window.location.pathname);
    const authToken = localStorage.getItem('authToken');
    console.log('authToken:', authToken ? 'exists' : 'does not exist');

    // Determinamos si estamos en una "página de login" (que podría ser login.html o incluso la raíz si redirige allí)
    // Asumimos que login.html es la única página de login explícita.
    const isOnLoginPage = window.location.pathname.includes('login.html');
    console.log('Is on login page:', isOnLoginPage);

    if (authToken) {
        // El usuario está autenticado
        console.log('User is authenticated.');
        if (isOnLoginPage) {
            // Si está en la página de login con un token, redirigir al dashboard
            console.log('On login page with token. Redirecting to dashboard.html');
            window.location.href = 'dashboard.html';
        } else {
            // Si está en el dashboard con un token, quedarse aquí (no hacer nada)
            console.log('On dashboard page with token. Staying here.');
            // Aquí puedes disparar el evento si dashboard.js lo necesita para cargar datos
            // document.dispatchEvent(new Event('dashboardLoaded')); // Descomentar si es necesario
        }
    } else {
        // El usuario NO está autenticado
        console.log('User is NOT authenticated.');
        if (!isOnLoginPage) {
            // Si no está en la página de login Y no tiene token, redirigir a login.html
            console.log('Not on login page without token. Redirecting to login.html');
            window.location.href = 'login.html';
        } else {
            // Si está en la página de login y no tiene token, quedarse aquí
            console.log('On login page without token. Staying here.');
            // Asegúrate de que la vista de login se muestre si es necesario
            // showLoginView(); // Descomentar si esta función debe ejecutar la lógica de visibilidad en login.html
        }
    }
    console.log('--- checkAuthStatus end ---');
}

// ... (el resto de tu código auth.js sigue igual) ...

// Manejador del evento de envío del formulario de inicio de sesión (solo relevante para login.html)
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        if (loginError) clearError(loginError);
        if (authMessage) clearMessage(authMessage);

        try {
            console.log('Intentando iniciar sesión con:', { username, password });
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ email: username, password }),
            });

            const responseData = await response.json();
            console.log('Respuesta de la API de login:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Credenciales inválidas. Por favor, inténtalo de nuevo.');
            }

            if (responseData.access_token) {
                localStorage.setItem('authToken', responseData.access_token);
                if (authMessage) displayMessage(authMessage, '¡Inicio de sesión exitoso!');
                console.log('Login successful. Redirecting to dashboard.html');
                window.location.href = 'dashboard.html'; // Redirección a dashboard.html
            } else {
                if (loginError) displayError(loginError, 'Respuesta de API inesperada: no se recibió access_token.');
            }

        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
            if (loginError) displayError(loginError, error.message || 'Error al conectar con el servidor. Por favor, verifica la URL de la API y la consola para más detalles.');
        }
    });
}


// Manejador del evento de envío del formulario de registro (solo relevante para login.html)
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = registerForm['reg-username'].value;
        const password = registerForm['reg-password'].value;

        if (registerError) clearError(registerError);
        if (authMessage) clearMessage(authMessage);

        try {
            console.log('Intentando registrar con:', { username, password });
            const response = await fetch(REGISTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ username, password }),
            });

            const responseData = await response.json();
            console.log('Respuesta de la API de registro:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Error al registrar el usuario. Inténtalo de nuevo.');
            }

            if (responseData.token) {
                localStorage.setItem('authToken', responseData.token);
                if (authMessage) displayMessage(authMessage, '¡Registro exitoso! Has iniciado sesión automáticamente.');
                console.log('Registration successful. Redirecting to dashboard.html');
                window.location.href = 'dashboard.html'; // Redirección después de registro exitoso
            } else {
                if (registerError) displayError(registerError, 'Registro exitoso, pero no se recibió token. Por favor, inicia sesión.');
                showLoginView();
            }

        } catch (error) {
            console.error('Error durante el registro:', error);
            if (registerError) displayError(registerError, error.message || 'Error al conectar con el servidor para el registro. Verifica la URL de la API y la consola.');
        }
    });
}

// Manejador del evento de clic del botón de cerrar sesión (existe en dashboard.html)
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        console.log('Logout button clicked. Removing token and redirecting to login.html');
        localStorage.removeItem('authToken'); // Elimina el token de autenticación
        window.location.href = 'login.html'; // REDIRECCIÓN A LA PÁGINA DE LOGIN
    });
}

// Manejadores para alternar entre formularios (solo relevantes para login.html)
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (event) => {
        event.preventDefault();
        showRegisterView();
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (event) => {
        event.preventDefault();
        showLoginView();
    });
}

// Llama a checkAuthStatus cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', checkAuthStatus);