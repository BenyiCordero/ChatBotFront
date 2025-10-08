# ChatBotFront — Interfaz web para administración y estadísticas

**Repositorio origen:** `BenyiCordero/ChatBotFront`.

## Descripción
Interfaz frontend ligera para visualizar estadísticas del chatbot, gestionar el *system prompt*, exportar datos y revisar interacciones. Incluye páginas estáticas (`index.html`, `dashboard.html`, `prompt.html`) y assets (CSS/JS) para comportamiento y estilos.

## Tecnologías
- HTML, CSS, JavaScript  

## Estructura principal
```
/assets
  /css
  /js
index.html         # Página principal / login o landing
dashboard.html     # Panel de estadísticas y gráficas
prompt.html        # Edición y administración de prompts
ngrok.exe          # (herramienta incluida para tunelizar, opcional)
```

## Configuración local
1. Clona el repositorio:
```
git clone https://github.com/BenyiCordero/ChatBotFront.git
```
2. Abre `index.html` o `dashboard.html` en un navegador (es un sitio estático).  
3. Configura la URL del backend en los scripts JS dentro de `*/js` (buscar `API_BASE_URL`).

## Puntos clave del frontend
- `index.html`: entrada y/o panel simple de autenticación.
- `dashboard.html`: muestra estadísticas agregadas y detalles; espera endpoints del backend que devuelvan métricas y listas de interacciones.  
- `prompt.html`: formulario para ver/editar prompt.
