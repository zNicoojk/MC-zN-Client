# ZNClient — página de descargas

La carpeta `site/` contiene una página estática que muestra las descargas de la última GitHub Release pública del mismo repositorio. El workflow de GitHub Actions publica la página y configura automáticamente el enlace al repositorio.

## Publicar en GitHub Pages

1. Sube estos archivos a un repositorio de GitHub bajo la cuenta que quieras usar. No hace falta conectar la cuenta de GitHub de VS Code.
2. En ese repositorio, abre **Settings → Pages** y elige **GitHub Actions** como origen de publicación.
3. Sube los cambios a la rama `main` o `master`. El workflow publicará la página y la URL aparecerá en **Settings → Pages**.
4. Para actualizar los archivos de descarga, crea una publicación en **Releases → Draft a new release**, agrega una etiqueta de versión y adjunta los instaladores o archivos. Al publicar la Release, la página mostrará la nueva versión automáticamente.

La página y los archivos descargables deben ser públicos para que cualquier visitante pueda verlos y descargarlos sin iniciar sesión. Publicar una Release actualiza las descargas sin volver a desplegar la página; los cambios en el código de la web se publican al subirlos a `main` o `master`.
