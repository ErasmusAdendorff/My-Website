/**
 * Loads projects from data/projects.json (requires http(s) or localhost; file:// often blocks fetch).
 */
(function () {
  const filtersEl = document.getElementById("project-filters");
  const gridEl = document.getElementById("projects-grid");

  if (!filtersEl || !gridEl) return;

  let payload = null;
  let activeFilter = "all";

  function sortProjects(list) {
    return [...list].sort((a, b) => {
      if (a.featured === b.featured) return 0;
      return a.featured ? -1 : 1;
    });
  }

  function visibleProjects() {
    const list = payload.projects || [];
    const sorted = sortProjects(list);
    if (activeFilter === "all") return sorted;
    return sorted.filter((p) => p.category === activeFilter);
  }

  function clearFilters() {
    while (filtersEl.firstChild) filtersEl.removeChild(filtersEl.firstChild);
  }

  function renderFilters() {
    clearFilters();
    const filters = payload.filters || [];
    filters.forEach((f) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "project-filters__btn";
      btn.dataset.category = f.id;
      btn.textContent = f.label;
      btn.setAttribute("aria-pressed", f.id === activeFilter ? "true" : "false");
      btn.addEventListener("click", () => {
        activeFilter = f.id;
        syncPressedStates();
        renderGrid();
      });
      filtersEl.appendChild(btn);
    });
  }

  function syncPressedStates() {
    filtersEl.querySelectorAll(".project-filters__btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.category === activeFilter ? "true" : "false");
    });
  }

  function renderGrid() {
    while (gridEl.firstChild) gridEl.removeChild(gridEl.firstChild);
    const items = visibleProjects();
    if (items.length === 0) {
      const p = document.createElement("p");
      p.className = "project-grid__status";
      p.textContent = "No projects in this category yet.";
      gridEl.appendChild(p);
      return;
    }

    items.forEach((project) => {
      const article = document.createElement("article");
      article.className = "project-card";

      const link = document.createElement("a");
      link.className = "project-card__link";
      link.href = project.href || "#";

      const thumbWrap = document.createElement("div");
      thumbWrap.className = "project-card__thumb-wrap";

      const img = document.createElement("img");
      img.className = "project-card__thumb";
      img.src = project.image;
      img.alt = project.imageAlt || "";
      img.width = 640;
      img.height = 400;
      img.loading = "lazy";
      img.decoding = "async";
      thumbWrap.appendChild(img);

      if (project.icon) {
        const icon = document.createElement("img");
        icon.className = "project-card__icon";
        icon.src = project.icon;
        icon.alt = "";
        icon.setAttribute("aria-hidden", "true");
        icon.width = 32;
        icon.height = 32;
        icon.loading = "lazy";
        icon.decoding = "async";
        thumbWrap.appendChild(icon);
      }

      link.appendChild(thumbWrap);

      const body = document.createElement("div");
      body.className = "project-card__body";

      const meta = document.createElement("p");
      meta.className = "project-card__meta";
      meta.textContent = project.categoryLabel || project.category || "";

      const title = document.createElement("h3");
      title.className = "project-card__title";
      title.textContent = project.title;

      const summary = document.createElement("p");
      summary.className = "project-card__summary";
      summary.textContent = project.summary;

      body.appendChild(meta);
      body.appendChild(title);
      body.appendChild(summary);
      link.appendChild(body);
      article.appendChild(link);
      gridEl.appendChild(article);
    });
  }

  function showLoadError() {
    while (gridEl.firstChild) gridEl.removeChild(gridEl.firstChild);
    const p = document.createElement("p");
    p.className = "project-grid__status";
    p.setAttribute("role", "alert");
    p.innerHTML =
      "Could not load projects. Serve this folder over HTTP (for example run <code>npx serve .</code> in the project root) so <code>data/projects.json</code> can load. Opening <code>index.html</code> directly as a file often blocks <code>fetch</code>.";
    gridEl.appendChild(p);
  }

  async function init() {
    try {
      const res = await fetch("data/projects.json", { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      payload = await res.json();
      if (!payload.projects || !Array.isArray(payload.projects)) throw new Error("invalid shape");
      renderFilters();
      renderGrid();
    } catch {
      showLoadError();
    }
  }

  init();
})();
