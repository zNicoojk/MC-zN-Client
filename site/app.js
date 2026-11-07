(() => {
  const repository = window.ZNCLIENT_REPO;
  const versionElement = document.querySelector("#latest-version");
  const dateElement = document.querySelector("#release-date");
  const downloadArea = document.querySelector("#download-area");
  const notesLink = document.querySelector("#release-notes");
  const githubLink = document.querySelector("#github-link");
  const footerGithubLink = document.querySelector("#footer-github-link");

  const showError = (message) => {
    downloadArea.replaceChildren();
    const text = document.createElement("span");
    text.className = "message-error";
    text.textContent = message;
    downloadArea.append(text);
  };

  const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  const makeDownloadLink = (asset) => {
    const link = document.createElement("a");
    link.className = "download-button";
    link.href = asset.browser_download_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    const label = document.createElement("span");
    label.textContent = "Descargar instalador para Windows";
    const details = document.createElement("span");
    details.className = "download-details";
    details.textContent = [asset.name, formatFileSize(asset.size)].filter(Boolean).join(" · ");
    link.append(label, details);
    return link;
  };

  if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    versionElement.textContent = "Repositorio sin configurar";
    dateElement.textContent = "";
    showError("La página aún no está conectada a un repositorio.");
    return;
  }

  const repositoryUrl = `https://github.com/${repository}`;
  githubLink.href = repositoryUrl;
  footerGithubLink.href = `${repositoryUrl}/releases`;

  fetch(`https://api.github.com/repos/${repository}/releases?per_page=10`, {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status === 404
          ? "No se encontró el repositorio o no es público."
          : `GitHub respondió con el estado ${response.status}.`);
      }
      return response.json();
    })
    .then((releases) => {
      if (!Array.isArray(releases)) {
        throw new Error("GitHub devolvió una respuesta de versiones no válida.");
      }
      const release = releases.find((item) => !item.draft && !item.prerelease);
      if (!release) {
        versionElement.textContent = "Todavía no hay versiones";
        dateElement.textContent = "";
        showError("Todavía no hay una versión estable publicada.");
        return;
      }

      versionElement.textContent = release.name || release.tag_name;
      dateElement.textContent = `Publicado el ${new Intl.DateTimeFormat("es", {
        dateStyle: "long",
      }).format(new Date(release.published_at))}`;
      notesLink.href = release.html_url;
      notesLink.hidden = false;
      downloadArea.replaceChildren();

      const installers = (release.assets || []).filter((asset) => /\.exe$/i.test(asset.name));
      if (installers.length === 0) {
        showError("No se encontró el instalador de Windows en esta versión. Revisa sus archivos en GitHub.");
        return;
      }

      downloadArea.append(...installers.map(makeDownloadLink));
    })
    .catch((error) => {
      versionElement.textContent = "No se pudo cargar la versión";
      dateElement.textContent = "";
      showError(`${error.message} Inténtalo de nuevo más tarde.`);
    });
})();
