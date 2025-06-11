// js/dashboard.js
// Este archivo maneja la lógica para obtener y mostrar las estadísticas en el dashboard, consumiendo una API.

// Importa las funciones de creación de gráficos desde charts.js
import { createTopIntentsChart } from './charts.js';

// URL base de tu API de Spring Boot
// ¡¡¡IMPORTANTE!!!: Asegúrate de que esta URL coincida con la BASE_API_URL en auth.js
const BASE_API_URL = 'https://0331-2806-2f0-6001-b2c5-d4e-abd6-a0b1-3adf.ngrok-free.app'; //Cambiar la base api cada que se cambie de tunel en ngrok o si se corre la api en local la base es http://127.0.0.1:8081
const TOTAL_CONSULTAS_API_URL = `${BASE_API_URL}/consultas`; // Endpoint para el total de consultas
const TOTAL_TEMAS = `${BASE_API_URL}/consultas/por-temav2`; //Endpoint para el porcentaje de temas
const TOTAL_SUBTEMAS = `${BASE_API_URL}/consultas/por-subtemav2`; //Endpoint para el porcentaje de subtemas
const TOTAL_USUARIOS = `${BASE_API_URL}/consultas/cantidad-usuarios`; //Endpoint para el total de usuarios.



// Variables globales para almacenar los datos obtenidos de la API para su exportación
let totalConsultasData = null;
let temaDataGlobal = null;
let subtemaDataGlobal = null;
let totalConsultasFiltradoData = null;
let temaFiltradoDataGlobal = null;
let subtemaFiltradoDataGlobal = null;
let totalConsultasFI2Data = null; // Para el total de usuarios activos

// --- Funciones Auxiliares para Exportación y Feedback de UI ---

/**
 * Muestra un cuadro de mensaje temporal al usuario.
 * @param {string} text - El mensaje a mostrar.
 * @param {'info'|'success'|'error'} type - El tipo de mensaje para el estilo.
 */
function showMessage(text, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    if (!messageBox || !messageText) {
        console.warn('Elementos del cuadro de mensaje no encontrados. No se puede mostrar el mensaje:', text);
        return;
    }

    messageText.textContent = text;
    // Restablecer clases y aplicar las nuevas según el tipo
    messageBox.className = 'message-box'; // Clase base
    messageBox.classList.add(type);
    messageBox.classList.remove('hidden');

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 5000);
}

/**
 * Muestra un cuadro de diálogo de confirmación personalizado.
 * @param {string} message - El mensaje a mostrar en el cuadro de confirmación.
 * @returns {Promise<boolean>} Resuelve a true si el usuario hace clic en 'Sí', false si hace clic en 'No'.
 */
function showConfirmation(message) {
    return new Promise(resolve => {
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        const confirmYesBtn = document.getElementById('confirmYes');
        const confirmNoBtn = document.getElementById('confirmNo');

        if (!confirmationModal || !confirmationMessage || !confirmYesBtn || !confirmNoBtn) {
            console.error('Elementos del modal de confirmación no encontrados.');
            // Si los elementos no están, resolvemos a true por defecto para no bloquear la app.
            resolve(true); 
            return;
        }

        confirmationMessage.textContent = message;
        confirmationModal.classList.remove('hidden');

        // Limpiar listeners anteriores para evitar múltiples activaciones
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


/**
 * Exporta un array de objetos (o un número simple) a un archivo CSV.
 * Si los datos son un solo número, se envolverán en un objeto para el formato CSV.
 * @param {Array<Object>|number} data - Los datos a exportar.
 * @param {string} filename - El nombre del archivo CSV.
 */
function exportToCsv(data, filename) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        showMessage(`No hay datos para exportar a ${filename}.`, 'error');
        return;
    }

    // Manejar datos escalares (como recuentos totales) envolviéndolos en un array de objetos
    let dataArray = Array.isArray(data) ? data : [{ value: data }];
    if (typeof data === 'number') {
        dataArray = [{ 'Count': data }];
    } else if (dataArray.length > 0 && Object.keys(dataArray[0]).length === 1 && Object.keys(dataArray[0])[0] === 'value' && typeof dataArray[0].value === 'number') {
        dataArray = dataArray.map(item => ({ 'Count': item.value }));
    }

    const headers = Object.keys(dataArray[0]).map(key => `"${key.replace(/"/g, '""')}"`).join(',');
    const rows = dataArray.map(row =>
        Object.values(row).map(value => {
            let stringValue = String(value);
            // Escapar comillas dobles y encerrar valores con comas o comillas
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                stringValue = `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage(`Datos exportados a ${filename} exitosamente.`, 'success');
}

/**
 * Exporta un elemento HTML específico (ej. un contenedor de gráfico) a un archivo PDF.
 * Utiliza html2canvas para convertir el elemento HTML en una imagen, luego jsPDF para crear el PDF.
 * @param {string} elementId - El ID del elemento HTML a capturar.
 * @param {string} filename - El nombre del archivo PDF.
 */
async function exportHtmlElementToPdf(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        showMessage(`Elemento con ID "${elementId}" no encontrado para exportar a PDF.`, 'error');
        return;
    }

    showMessage('Generando PDF...', 'info');
    // Deshabilitar todos los botones de exportación mientras se genera el PDF
    const allExportButtons = document.querySelectorAll('button[id^="exportar-"]');
    allExportButtons.forEach(btn => btn.disabled = true);

    try {
        const doc = new window.jspdf.jsPDF('p', 'pt', 'a4'); // 'p' para retrato, 'pt' para puntos, tamaño 'a4'
        const margin = 20; // Margen en puntos (aprox. 0.7cm)

        // Ocultar temporalmente los botones dentro del elemento capturado para que no aparezcan en el PDF
        const buttonsInElement = element.querySelectorAll('button');
        buttonsInElement.forEach(btn => btn.style.visibility = 'hidden');

        const canvas = await html2canvas(element, {
            scale: 2, // Mayor escala para mejor resolución
            logging: false, // Establecer en true para depurar problemas de html2canvas
            useCORS: true // Importante si se utilizan imágenes/recursos de otros dominios
        });

        // Restaurar la visibilidad de los botones
        buttonsInElement.forEach(btn => btn.style.visibility = 'visible');

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = doc.internal.pageSize.getWidth() - (2 * margin); // Ancho de la imagen en el PDF considerando los márgenes
        let imgHeight = (canvas.height * imgWidth) / canvas.width; // Calcular altura proporcional

        let heightLeft = imgHeight;
        let position = 0; // Posición vertical actual en el canvas que se ha dibujado
        const pageHeight = doc.internal.pageSize.getHeight(); // Altura de la página A4 en puntos

        // Añadir la primera página
        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        heightLeft -= (pageHeight - (2 * margin)); // Restar lo que cabe en la primera página
        position += (pageHeight - (2 * margin));

        // Añadir más páginas si el contenido es más alto que una página
        while (heightLeft > 0) {
            doc.addPage();
            // Calcular la altura de la siguiente porción
            const nextSliceHeight = Math.min(heightLeft, pageHeight - (2 * margin));
            // Calcular el desplazamiento Y para la imagen en la nueva página
            const sY = -position; // Posición Y de origen en el canvas original para la porción de la nueva página
            
            // Añadir la porción de la imagen al PDF.
            // Los parámetros de addImage son: imageData, format, x, y, width, height, alias, compression, rotation, sx, sy, sWidth, sHeight
            // Usamos sx, sy, sWidth, sHeight para especificar una "porción" de la imagen original
            doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight, null, null, null, sY, null, nextSliceHeight);

            heightLeft -= nextSliceHeight;
            position += nextSliceHeight;
        }

        doc.save(filename);
        showMessage(`Exportado a ${filename} exitosamente.`, 'success');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        showMessage(`Error al generar PDF: ${error.message}`, 'error');
    } finally {
        // Habilitar de nuevo todos los botones de exportación
        allExportButtons.forEach(btn => btn.disabled = false);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Carga inicial de datos del dashboard
    loadDashboardData();

    // Obtener elementos de botones
    const goToPromptButton = document.getElementById('go-to-prompt-button'); 
    const exportarCsv = document.getElementById('exportar-csv-button');
    const exportarPdf = document.getElementById('exportar-pdf-button');
    const exportarPdfFiltrado = document.getElementById('exportar-filtrados-pdf-button');
    const exportarCsvFiltrado = document.getElementById('exportar-filtrados-csv-button');
    const exportarCsvTodo = document.getElementById('exportar-todo-csv-button');
    const exportarPdfTodo = document.getElementById('exportar-todo-pdf-button');
    const logoutButton = document.getElementById('logout-button'); // Obtener el botón de cerrar sesión

    // Obtener elementos select para los filtros (para los listeners de cambio)
    const mesSelect = document.getElementById('mesesFI');
    const anioSelect = document.getElementById('anioFI');
    const mesSelectFT = document.getElementById('mesFT');
    const anioSelectFT = document.getElementById('anioFT');
    const mesSelectFS = document.getElementById('mesFS');
    const anioSelectFS = document.getElementById('anioFS');
    const anioSelectFI2 = document.getElementById('anioFI2');
    const semanaSelectFI2 = document.getElementById('semanaFI2');
    const mesSelectFI2 = document.getElementById('mesFI2');

    // --- Listeners de Eventos para Botones ---

    if (goToPromptButton) {
        goToPromptButton.addEventListener('click', async () => { // Hacemos el listener async
            const confirmed = await showConfirmation('¿Estás seguro de que quieres ir a modificar el prompt?');
            if (confirmed) {
                window.location.href = 'prompt.html'; 
            } else {
                showMessage('Has cancelado la acción. Te quedas en el Dashboard.', 'info');
            }
        });
    }

    if (exportarCsv){
        exportarCsv.addEventListener('click', () => {
            // Combinar datos de interacciones generales, temas generales y subtemas generales para el CSV
            const generalDataCombined = [];
            if (totalConsultasData !== null) {
                generalDataCombined.push({ Metrica: 'Total Interacciones (General)', Valor: totalConsultasData });
            }
            if (temaDataGlobal && Object.keys(temaDataGlobal).length > 0) {
                Object.entries(temaDataGlobal).forEach(([theme, count]) => {
                    generalDataCombined.push({ Metrica: `Tema: ${theme}`, Valor: count, Categoria: 'Temas Generales' });
                });
            }
            if (subtemaDataGlobal && Object.keys(subtemaDataGlobal).length > 0) {
                Object.entries(subtemaDataGlobal).forEach(([subtheme, count]) => {
                    generalDataCombined.push({ Metrica: `Subtema: ${subtheme}`, Valor: count, Categoria: 'Subtemas Generales' });
                });
            }
            
            if (generalDataCombined.length > 0) {
                exportToCsv(generalDataCombined, 'dashboard_general.csv');
            } else {
                showMessage('No hay datos disponibles para exportar el dashboard general a CSV.', 'error');
            }
        });
    }
    if (exportarPdf){
        exportarPdf.addEventListener('click', () => {
            // Para PDF de interacciones generales, capturamos toda la sección de datos generales
            exportHtmlElementToPdf('general-dashboard-section', 'dashboard_general.pdf');
        });
    }
    if (exportarCsvFiltrado){ 
        exportarCsvFiltrado.addEventListener('click', () => {
            // Combinar datos de interacciones filtradas, temas filtrados, subtemas filtrados y usuarios activos filtrados para el CSV
            const filteredDataCombined = [];
            if (totalConsultasFiltradoData !== null) {
                filteredDataCombined.push({ Metrica: 'Total Interacciones (Filtradas)', Valor: totalConsultasFiltradoData });
            }
            if (totalConsultasFI2Data !== null) {
                filteredDataCombined.push({ Metrica: 'Total Usuarios Activos (Filtrados)', Valor: totalConsultasFI2Data });
            }
            if (temaFiltradoDataGlobal && Object.keys(temaFiltradoDataGlobal).length > 0) {
                Object.entries(temaFiltradoDataGlobal).forEach(([theme, count]) => {
                    filteredDataCombined.push({ Metrica: `Tema: ${theme}`, Valor: count, Categoria: 'Temas Filtrados' });
                });
            }
            if (subtemaFiltradoDataGlobal && Object.keys(subtemaFiltradoDataGlobal).length > 0) {
                Object.entries(subtemaFiltradoDataGlobal).forEach(([subtheme, count]) => {
                    filteredDataCombined.push({ Metrica: `Subtema: ${subtheme}`, Valor: count, Categoria: 'Subtemas Filtrados' });
                });
            }

            if (filteredDataCombined.length > 0) {
                exportToCsv(filteredDataCombined, 'dashboard_filtrado.csv');
            } else {
                showMessage('No hay datos disponibles para exportar el dashboard filtrado a CSV.', 'error');
            }
        });
    }
    if (exportarPdfFiltrado){ 
        exportarPdfFiltrado.addEventListener('click', () => {
            // Para PDF de interacciones filtradas, capturamos toda la sección de datos filtrados
            exportHtmlElementToPdf('filtered-dashboard-section', 'dashboard_filtrado.pdf');
        });
    }

    if (exportarCsvTodo){
        exportarCsvTodo.addEventListener('click', () => {
            const combinedData = [];

            // Añadir estadísticas generales
            if (totalConsultasData !== null) combinedData.push({ Metrica: 'Total Interacciones (General)', Valor: totalConsultasData });
            
            // Añadir datos generales de temas
            if (temaDataGlobal && Object.keys(temaDataGlobal).length > 0) {
                Object.entries(temaDataGlobal).forEach(([theme, count]) => {
                    combinedData.push({ Metrica: `Tema: ${theme}`, Valor: count, Categoria: 'Temas Generales' });
                });
            }
            // Añadir datos generales de subtemas
            if (subtemaDataGlobal && Object.keys(subtemaDataGlobal).length > 0) {
                Object.entries(subtemaDataGlobal).forEach(([subtheme, count]) => {
                    combinedData.push({ Metrica: `Subtema: ${subtheme}`, Valor: count, Categoria: 'Subtemas Generales' });
                });
            }

            // Añadir estadísticas filtradas
            if (totalConsultasFiltradoData !== null) combinedData.push({ Metrica: 'Total Interacciones (Filtradas)', Valor: totalConsultasFiltradoData });
            if (totalConsultasFI2Data !== null) combinedData.push({ Metrica: 'Total Usuarios Activos (Filtrados)', Valor: totalConsultasFI2Data });

            // Añadir datos filtrados de temas
            if (temaFiltradoDataGlobal && Object.keys(temaFiltradoDataGlobal).length > 0) {
                Object.entries(temaFiltradoDataGlobal).forEach(([theme, count]) => {
                    combinedData.push({ Metrica: `Tema: ${theme}`, Valor: count, Categoria: 'Temas Filtrados' });
                });
            }
            // Añadir datos filtrados de subtemas
            if (subtemaFiltradoDataGlobal && Object.keys(subtemaFiltradoDataGlobal).length > 0) {
                Object.entries(subtemaFiltradoDataGlobal).forEach(([subtheme, count]) => {
                    combinedData.push({ Metrica: `Subtema: ${subtheme}`, Valor: count, Categoria: 'Subtemas Filtrados' });
                });
            }
            
            if (combinedData.length > 0) {
                exportToCsv(combinedData, 'dashboard_completo.csv');
            } else {
                showMessage('No hay datos disponibles para exportar todo el dashboard a CSV.', 'error');
            }
        });
    }

    if (exportarPdfTodo){
        exportarPdfTodo.addEventListener('click', () =>{
            exportHtmlElementToPdf('dashboard-container', 'dashboard_completo.pdf');
        });
    }

    // --- Listener para el botón de Cerrar Sesión ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken'); // Eliminar el token de autenticación
            window.location.href = 'login.html'; // Redirigir a la página de login
        });
    }

    // --- Listeners de Eventos para Filtros (Selects) ---
    if (mesSelect) mesSelect.addEventListener('change', loadDashboardData);
    if (anioSelect) anioSelect.addEventListener('change', loadDashboardData);
    if (mesSelectFT) mesSelectFT.addEventListener('change', loadDashboardData);
    if (anioSelectFT) anioSelectFT.addEventListener('change', loadDashboardData);
    if (anioSelectFS) anioSelectFS.addEventListener('change', loadDashboardData);
    if (mesSelectFS) mesSelectFS.addEventListener('change', loadDashboardData);
    if (mesSelectFI2) mesSelectFI2.addEventListener('change', loadDashboardData);
    if (anioSelectFI2) anioSelectFI2.addEventListener('change', loadDashboardData);
    if (semanaSelectFI2) semanaSelectFI2.addEventListener('change', loadDashboardData);
});

// La función 'mostrarPromptButton' original se ha integrado en el listener DOMContentLoaded para manejar la confirmación.
// Esta es la lógica que debes aplicar en prompt.html para el botón "Actualizar Prompt".
/*
async function handleUpdatePromptClick() {
    const confirmed = await showConfirmation('¿Estás seguro de que los cambios en el prompt son correctos y quieres actualizarlos?');
    if (confirmed) {
        // Aquí va tu lógica para actualizar el prompt
        // Por ejemplo:
        // const promptContent = document.getElementById('prompt-textarea').value;
        // await updatePromptInDatabase(promptContent); // Tu función de actualización
        // showMessage('Prompt actualizado exitosamente.', 'success');
    } else {
        showMessage('Actualización del prompt cancelada.', 'info');
    }
}

// En el archivo JS de prompt.html, enlaza esto al botón:
// const updatePromptButton = document.getElementById('update-prompt-button');
// if (updatePromptButton) {
//     updatePromptButton.addEventListener('click', handleUpdatePromptClick);
// }
*/


// Función para cargar y mostrar los datos del dashboard
async function loadDashboardData() {
    console.log('Cargando datos del dashboard desde la API...');
    showMessage('Cargando datos del dashboard...', 'info');

    const authToken = localStorage.getItem('authToken');
    console.log(authToken)
    if (!authToken) {
        console.error('No se encontró token de autenticación. Redirigiendo al login.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // --- Obtener el total de consultas (General) ---
        const responseTotalConsultas = await fetch(TOTAL_CONSULTAS_API_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'ngrok-skip-browser-warning': 'true'  },
        });
        if (!responseTotalConsultas.ok) throw new Error(`Error al obtener total de consultas: ${responseTotalConsultas.statusText}`);
        totalConsultasData = await responseTotalConsultas.json(); // Almacenar datos globalmente
        document.getElementById('interactions-count').textContent = totalConsultasData;

        // --- Cargar datos para "Temas más frecuentes" (General) ---
        const responseTema = await fetch(TOTAL_TEMAS, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'ngrok-skip-browser-warning': 'true' },
        });
        if (!responseTema.ok) throw new Error(`Error al obtener temas: ${responseTema.statusText}`);
        temaDataGlobal = await responseTema.json(); // Almacenar datos globalmente
        createTopIntentsChart('top-themes-chart', Object.keys(temaDataGlobal), Object.values(temaDataGlobal));

        // --- Cargar datos para "Subtemas más frecuentes" (General) ---
        const responseSubtema = await fetch(TOTAL_SUBTEMAS, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'ngrok-skip-browser-warning': 'true' },
        });
        if (!responseSubtema.ok) throw new Error(`Error al obtener subtemas: ${responseSubtema.statusText}`);
        subtemaDataGlobal = await responseSubtema.json(); // Almacenar datos globalmente
        createTopIntentsChart('top-intents-chart', Object.keys(subtemaDataGlobal), Object.values(subtemaDataGlobal));

        // --- Obtener el total de consultas FILTRADO (por Mes/Año) ---
        let mesNumero = parseInt(document.getElementById('mesesFI').value);
        let anio = parseInt(document.getElementById('anioFI').value);
        // Establecer valores por defecto si no son válidos (por ejemplo, al cargar por primera vez)
        if (isNaN(mesNumero)) mesNumero = new Date().getMonth() + 1;
        if (isNaN(anio)) anio = new Date().getFullYear();

        const urlFilteredTotal = `${TOTAL_CONSULTAS_API_URL}?year=${anio}&month=${mesNumero}`;
        const responseTotalConsultasF = await fetch(urlFilteredTotal, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'ngrok-skip-browser-warning': 'true' },
        });
        if (!responseTotalConsultasF.ok) throw new Error(`Error al obtener total de consultas filtradas: ${responseTotalConsultasF.statusText}`);
        totalConsultasFiltradoData = await responseTotalConsultasF.json(); // Almacenar datos globalmente
        document.getElementById('interactions-count-f').textContent = totalConsultasFiltradoData;

        // --- Cargar datos para "Temas más frecuentes" FILTRADO (por Mes/Año) ---
        let mesNumeroFT = parseInt(document.getElementById('mesFT').value);
        let anioFT = parseInt(document.getElementById('anioFT').value);
        if (isNaN(mesNumeroFT)) mesNumeroFT = new Date().getMonth() + 1;
        if (isNaN(anioFT)) anioFT = new Date().getFullYear();

        const urlFT = `${TOTAL_TEMAS}?year=${anioFT}&month=${mesNumeroFT}`;
        const responseTemaFT = await fetch(urlFT, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'ngrok-skip-browser-warning': 'true' },
        });
        if (!responseTemaFT.ok) throw new Error(`Error al obtener temas filtrados: ${responseTemaFT.statusText}`);
        temaFiltradoDataGlobal = await responseTemaFT.json(); // Almacenar datos globalmente
        createTopIntentsChart('top-themes-chart-FT', Object.keys(temaFiltradoDataGlobal), Object.values(temaFiltradoDataGlobal));

        // --- Cargar datos para "Subtemas más frecuentes" FILTRADO (por Mes/Año) ---
        let mesNumeroFS = parseInt(document.getElementById('mesFS').value);
        let anioFS = parseInt(document.getElementById('anioFS').value);
        if (isNaN(mesNumeroFS)) mesNumeroFS = new Date().getMonth() + 1;
        if (isNaN(anioFS)) anioFS = new Date().getFullYear();

        const urlFS = `${TOTAL_SUBTEMAS}?year=${anioFS}&month=${mesNumeroFS}`;
        const responseTemaFS = await fetch(urlFS, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'ngrok-skip-browser-warning': 'true' },
        });
        if (!responseTemaFS.ok) throw new Error(`Error al obtener subtemas filtrados: ${responseTemaFS.statusText}`);
        subtemaFiltradoDataGlobal = await responseTemaFS.json(); // Almacenar datos globalmente
        createTopIntentsChart('top-intents-chart-FS', Object.keys(subtemaFiltradoDataGlobal), Object.values(subtemaFiltradoDataGlobal));

        // Bloque de codigo para Usuarios por semana, mes y anio
        let mesNumeroFI2 = parseInt(document.getElementById('mesFI2').value);
        let anioFI2 = parseInt(document.getElementById('anioFI2').value);
        let semanaFI2 = parseInt(document.getElementById('semanaFI2').value); 
        // Establecer valores por defecto si no son válidos
        if (isNaN(mesNumeroFI2)) mesNumeroFI2 = new Date().getMonth() + 1;
        if (isNaN(anioFI2)) anioFI2 = new Date().getFullYear();
        if (isNaN(semanaFI2)) semanaFI2 = 1; // Por defecto a la semana 1 si no es válida

        const urlFI2 = `${TOTAL_USUARIOS}?year=${anioFI2}&month=${mesNumeroFI2}&week=${semanaFI2}`;
        const responseTotalConsultasFI2 = await fetch(urlFI2, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'ngrok-skip-browser-warning': 'true' },
        });
        if (!responseTotalConsultasFI2.ok) throw new Error(`Error al obtener total de usuarios activos: ${responseTotalConsultasFI2.statusText}`);
        totalConsultasFI2Data = await responseTotalConsultasFI2.json(); // Almacenar datos globalmente
        document.getElementById('interactions-count-FI2').textContent = totalConsultasFI2Data;

        console.log('Dashboard cargado con éxito.');
        showMessage('Dashboard cargado con éxito.', 'success');

    } catch (error) {
        console.error('Error al cargar los datos del dashboard:', error);
        showMessage(`Error al cargar dashboard: ${error.message}`, 'error');
        // Si hay un error al cargar los datos, podrías redirigir al login
        // o mostrar un mensaje de error claro en el dashboard.
        // window.location.href = 'login.html'; // Descomentar si quieres redirigir en cualquier error de carga
    }
}
