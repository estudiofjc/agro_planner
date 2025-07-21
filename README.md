# Agro Planner Biodinámico - Instrucciones de Despliegue "Ultra" en Vercel

Esta guía explica cómo desplegar la aplicación utilizando una arquitectura moderna y escalable en Vercel, la plataforma ideal para este tipo de proyectos. Este método reemplaza el despliegue en cPanel, es más sencillo, potente y soluciona los problemas de límite de memoria.

## Requisitos Previos

1.  **Una cuenta de [GitHub](https://github.com/)**: Si no tienes una, créala, es gratis.
2.  **Una cuenta de [Vercel](https://vercel.com/signup)**: Regístrate con tu cuenta de GitHub. El plan "Hobby" (gratuito) es perfecto para este proyecto.

## Paso 1: Subir tu Código a GitHub

Si tu código aún no está en un repositorio de GitHub, sigue estos pasos:

1.  Crea un nuevo repositorio en GitHub. No lo inicialices con un `README` o `.gitignore`.
2.  En tu computadora, abre una terminal en la carpeta de tu proyecto.
3.  Ejecuta los siguientes comandos, reemplazando la URL con la de tu repositorio:
    ```bash
    git init
    git add .
    git commit -m "Versión inicial para Vercel"
    git branch -M main
    git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
    git push -u origin main
    ```
4.  Asegúrate de que todos los archivos, incluida la nueva carpeta `api`, están en tu repositorio.

## Paso 2: Desplegar en Vercel

1.  Inicia sesión en tu [dashboard de Vercel](https://vercel.com/dashboard).
2.  Haz clic en **"Add New..."** y selecciona **"Project"**.
3.  En la sección **"Import Git Repository"**, busca y selecciona el repositorio de tu proyecto que acabas de subir a GitHub.
4.  Vercel detectará automáticamente que es una aplicación React/Vite y no necesitarás cambiar ninguna configuración de "Build & Development Settings".

## Paso 3: Configurar las Variables de Entorno

Este es el paso más importante. Aquí le darás a Vercel tus claves de API de forma segura.

1.  En la pantalla de configuración del proyecto en Vercel, despliega la sección **"Environment Variables"**.
2.  Añade las siguientes dos variables, una por una:
    *   **Name:** `API_KEY`
    *   **Value:** `PEGA_AQUI_TU_CLAVE_DE_LA_API_DE_GEMINI`
    *   **Name:** `GOOGLE_MAPS_API_KEY`
    *   **Value:** `PEGA_AQUI_TU_CLAVE_DE_LA_API_DE_GOOGLE_MAPS`
3.  Asegúrate de hacer clic en **"Add"** después de cada una.

## Paso 4: Desplegar y Celebrar

1.  Haz clic en el botón **"Deploy"**.
2.  Vercel comenzará a construir y desplegar tu aplicación. Podrás ver el progreso en tiempo real.
3.  ¡Felicidades! Una vez que termine, Vercel te dará la URL de tu aplicación (`https-TUNOMBRE.vercel.app`). La aplicación estará en vivo y funcionando a la perfección.

## Gestión de la Clave de API de Google Maps

Recuerda actualizar las restricciones de tu clave de Google Maps para incluir el nuevo dominio de Vercel.

1.  Ve a la [Consola de Google Cloud](https://console.cloud.google.com/) > "Credenciales".
2.  Selecciona tu clave y en "Restricciones de sitios web", añade la URL que te dio Vercel (ej: `agro-planner-cosufer.vercel.app/*`). No olvides el `/*` al final.

¡Listo! Tu aplicación ahora está desplegada en una plataforma de clase mundial, es más rápida y escalable que nunca. Cada vez que hagas `git push` a la rama `main`, Vercel la redesplegará automáticamente con los cambios.