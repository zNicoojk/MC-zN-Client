(() => {
  const repository = window.ZNCLIENT_REPO;
  const versionElement = document.querySelector("#latest-version");
  const dateElement = document.querySelector("#release-date");
  const releaseCard = document.querySelector("#latest-release");
  const downloadArea = document.querySelector("#download-area");
  const notesLink = document.querySelector("#release-notes");
  const githubLink = document.querySelector("#github-link");
  const footerGithubLink = document.querySelector("#footer-github-link");
  const allReleasesLink = document.querySelector("#all-releases-link");
  const privacyLink = document.querySelector("#privacy-link");

  const setBusy = (busy) => releaseCard.setAttribute("aria-busy", String(busy));

  const showError = (message) => {
    downloadArea.replaceChildren();
    const text = document.createElement("span");
    text.className = "message-error";
    text.textContent = message;
    const retry = document.createElement("button");
    retry.className = "retry-button";
    retry.type = "button";
    retry.textContent = "Reintentar";
    retry.addEventListener("click", loadRelease);
    downloadArea.append(text, retry);
    setBusy(false);
  };

  const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    return bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.ceil(bytes / 1024)} KB`;
  };

  const makeDownloadLink = (asset) => {
    const link = document.createElement("a");
    link.className = "download-button";
    link.href = asset.browser_download_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Descargar ${asset.name} desde GitHub`);

    const label = document.createElement("span");
    label.textContent = "Descargar para Windows";
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
  allReleasesLink.href = `${repositoryUrl}/releases`;
  privacyLink.href = `${repositoryUrl}/blob/main/PRIVACY.md`;

  function loadRelease() {
    setBusy(true);
    versionElement.textContent = "Buscando versión...";
    dateElement.textContent = "";
    downloadArea.replaceChildren();
    const loader = document.createElement("span");
    loader.className = "loader";
    loader.setAttribute("aria-hidden", "true");
    const message = document.createElement("span");
    message.textContent = "Buscando el instalador en GitHub...";
    downloadArea.append(loader, message);

    fetch(`https://api.github.com/repos/${repository}/releases?per_page=10`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("No se encontró el repositorio o no es público.");
          }
          if (response.status === 403 || response.status === 429) {
            throw new Error("GitHub limitó temporalmente las consultas. Inténtalo más tarde.");
          }
          throw new Error(`GitHub respondió con el estado ${response.status}.`);
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
          showError("Todavía no hay una versión estable publicada.");
          return;
        }

        versionElement.textContent = release.name || release.tag_name;
        const publishedAt = release.published_at || release.created_at;
        const releaseDate = new Date(publishedAt);
        dateElement.textContent = Number.isNaN(releaseDate.getTime())
          ? ""
          : `Publicado el ${new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(releaseDate)}`;
        notesLink.href = release.html_url;
        notesLink.hidden = false;
        downloadArea.replaceChildren();

        const installers = (release.assets || []).filter((asset) =>
          /\.exe$/i.test(asset.name) && /^https:\/\/github\.com\//.test(asset.browser_download_url)
        );
        if (installers.length === 0) {
          showError("No se encontró un instalador de Windows en esta versión. Revisa sus archivos en GitHub.");
          return;
        }

        downloadArea.append(...installers.map(makeDownloadLink));
        setBusy(false);
      })
      .catch((error) => {
        versionElement.textContent = "No se pudo cargar la versión";
        showError(`${error.message} Inténtalo de nuevo más tarde.`);
      });
  }

  loadRelease();
})();
