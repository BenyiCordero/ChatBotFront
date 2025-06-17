// js/auth.js
// Este archivo maneja la lógica de autenticación del usuario (login y logout) con una API de Spring Boot.

import { showElement, hideElement, displayError, clearError, displayMessage, clearMessage } from './utils.js';


const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const logoutButton = document.getElementById('logout-button');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const authMessage = document.getElementById('auth-message');

const BASE_API_URL = 'http://127.0.0.1:8081'; 
const LOGIN_API_URL = `${BASE_API_URL}/auth/login`;
const REGISTER_API_URL = `${BASE_API_URL}/auth/register`;

function checkAuthStatus() {
    console.log('--- checkAuthStatus called ---');
    console.log('Current path:', window.location.pathname);
    const authToken = localStorage.getItem('authToken');
    console.log('authToken:', authToken ? 'exists' : 'does not exist');


    const isOnLoginPage = window.location.pathname.includes('index.html');
    console.log('Is on login page:', isOnLoginPage);

    if (authToken) {
        console.log('User is authenticated.');
        if (isOnLoginPage) {
            console.log('On login page with token. Redirecting to dashboard.html');
            window.location.href = 'dashboard.html';
        } else {
            console.log('On dashboard page with token. Staying here.');
        }
    } else {
        console.log('User is NOT authenticated.');
        if (!isOnLoginPage) {
            console.log('Not on login page without token. Redirecting to index.html');
            window.location.href = 'index.html';
        } else {
            console.log('On login page without token. Staying here.');
        }
    }
    console.log('--- checkAuthStatus end ---');
}

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

            let responseData; 

            const clonedResponse = response.clone(); 

            try {
                responseData = await clonedResponse.json();
            } catch (jsonError) {
                console.warn('Failed to parse response as JSON. Status:', response.status, 'Error:', jsonError);
                if (!response.ok) { 
                    try {
                        const textError = await response.text(); 
                        console.warn('Error response body (text):', textError);
                    } catch (textReadError) {
                        console.warn('Also failed to read response body as text:', textReadError);
                    }
                }
                responseData = {}; 
            }

            console.log('Respuesta de la API de login:', responseData);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
                } else if (response.status === 400) {
                    throw new Error(responseData.message || 'Solicitud incorrecta. Verifica tus datos.');
                } else {
                    throw new Error(responseData.message || `Credenciales invalidas`);
                }
            }

            if (responseData.access_token) {
                localStorage.setItem('authToken', responseData.access_token);
                if (authMessage) displayMessage(authMessage, '¡Inicio de sesión exitoso!');
                console.log('Login successful. Redirecting to dashboard.html');
                window.location.href = 'dashboard.html';
            } else {
                if (loginError) displayError(loginError, 'Respuesta de API inesperada: no se recibió access_token.');
            }

        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
            if (loginError) displayError(loginError, error.message || 'Error al conectar con el servidor. Por favor, verifica la URL de la API y la consola para más detalles.');
        }
    });
}



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
                window.location.href = 'dashboard.html'; 
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

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        console.log('Logout button clicked. Removing token and redirecting to login.html');
        localStorage.removeItem('authToken'); 
        window.location.href = 'index.html'; 
    });
}

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

document.addEventListener('DOMContentLoaded', checkAuthStatus);