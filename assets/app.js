// Yogita Portfolio JS — no dependencies, fast, clean.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const progressBar = $("#progressBar");
const yearEl = $("#year");
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");
const themeToggle = $("#themeToggle");
const themeToggle2 = $("#themeToggle2");

const projectsGrid = $("#projectsGrid");
const searchInput = $("#searchInput");
const tagFilters = $("#tagFilters");

const modal = $("#modal");
const modalClose = $("#modalClose");

const modalTitle = $("#modalTitle");
const modalMeta = $("#modalMeta");
const modalBadges = $("#modalBadges");
const modalProblem = $("#modalProblem");
const modalApproach = $("#modalApproach");
const modalControls = $("#modalControls");
const modalImpact = $("#modalImpact");
const modalRepo = $("#modalRepo");
const modalDemo = $("#modalDemo");

const copyBtn = $("#copyBtn");
const copySnippet = $("#copySnippet");
const toast = $("#toast");

let PROJECTS = [];
let activeTag = "All";
let query = "";

// ---------- Theme ----------
function setTheme(mode) {
  const root = document.documentElement;
  if (mode === "light") root.classList.add("light");
  else root.classList.remove("light");
  localStorage.setItem("theme", mode);
  // icon swap
  const icon = $(".icon", themeToggle);
  if (icon) icon.textContent = (mode === "light") ? "☀" : "☾";
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) return setTheme(saved);
  // default to dark
  setTheme("dark");
}

function toggleTheme() {
  const isLight = document.documentElement.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
}

// ---------- Scroll progress ----------
function updateProgress() {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const pct = scrollHeight ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}

// ---------- Mobile menu ----------
function toggleMenu() {
  const open = !mobileMenu.hasAttribute("hidden");
  if (open) {
    mobileMenu.setAttribute("hidden", "");
    menuBtn.setAttribute("aria-expanded", "false");
  } else {
    mobileMenu.removeAttribute("hidden");
    menuBtn.setAttribute("aria-expanded", "true");
  }
}

// close mobile menu when clicking a link
function wireMobileLinks() {
  $$(".mobile__link").forEach(a => {
    a.addEventListener("click", () => {
      mobileMenu.setAttribute("hidden", "");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- Projects rendering ----------
function uniqueTags(projects) {
  const set = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return ["All", ...Array.from(set).sort((a,b)=>a.localeCompare(b))];
}

function renderFilters(tags) {
  tagFilters.innerHTML = "";
  tags.forEach(tag => {
    const el = document.createElement("button");
    el.className = "filter" + (tag === activeTag ? " is-on" : "");
    el.type = "button";
    el.textContent = tag;
    el.addEventListener("click", () => {
      activeTag = tag;
      renderFilters(tags);
      renderProjects();
    });
    tagFilters.appendChild(el);
  });
}

function matchProject(p) {
  const q = query.trim().toLowerCase();
  const hay = [
    p.title, p.subtitle, p.stack, p.description,
    ...(p.tags || []),
    ...(p.controls || []),
  ].join(" ").toLowerCase();

  const tagOk = (activeTag === "All") || (p.tags || []).includes(activeTag);
  const qOk = !q || hay.includes(q);
  return tagOk && qOk;
}

function projectCard(p) {
  const card = document.createElement("article");
  card.className = "card project";

  const pills = (p.tags || []).slice(0, 4).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("");

  card.innerHTML = `
    <div class="project__top">
      <div>
        <h3 class="project__title">${escapeHtml(p.title)}</h3>
        <div class="project__meta">${escapeHtml(p.stack || "")}</div>
      </div>
      <span class="pill" title="Category">${escapeHtml(p.category || "Project")}</span>
    </div>

    <p class="project__desc">${escapeHtml(p.description || "")}</p>

    <div class="pills">${pills}</div>

    <div class="project__actions">
      ${p.repo ? `<a class="link" href="${p.repo}" target="_blank" rel="noopener">Repo →</a>` : ""}
      ${p.demo ? `<a class="link" href="${p.demo}" target="_blank" rel="noopener">Docs/Demo →</a>` : ""}
      <button class="btn btn--ghost" type="button">Details</button>
    </div>
  `;

  const detailsBtn = $("button", card);
  detailsBtn.addEventListener("click", () => openModal(p));
  return card;
}

function renderProjects() {
  const list = PROJECTS.filter(matchProject);
  projectsGrid.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<h3>No matches</h3><p class="muted">Try a different search or filter.</p>`;
    projectsGrid.appendChild(empty);
    return;
  }

  list.forEach(p => projectsGrid.appendChild(projectCard(p)));
}

// ---------- Modal ----------
function openModal(p) {
  modalTitle.textContent = p.title || "Project";
  modalMeta.textContent = [p.category, p.stack].filter(Boolean).join(" • ");

  modalBadges.innerHTML = (p.tags || []).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("");

  modalProblem.textContent = p.problem || "";
  modalApproach.textContent = p.approach || "";
  modalImpact.textContent = p.impact || "";

  modalControls.innerHTML = "";
  (p.controls || []).forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    modalControls.appendChild(li);
  });

  if (p.repo) { modalRepo.href = p.repo; modalRepo.style.display = ""; }
  else { modalRepo.style.display = "none"; }

  if (p.demo) { modalDemo.href = p.demo; modalDemo.style.display = ""; }
  else { modalDemo.style.display = "none"; }

  modal.showModal();
}

function closeModal() {
  if (modal.open) modal.close();
}

// ---------- Copy ----------
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function showToast(msg = "Copied!") {
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 1200);
}

// ---------- Security helpers ----------
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[s]));
}

// ---------- Boot ----------
async function loadProjects() {
  const res = await fetch("./assets/projects.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load projects.json");
  PROJECTS = await res.json();
}

function init() {
  yearEl.textContent = new Date().getFullYear();
  initTheme();
  updateProgress();

  window.addEventListener("scroll", updateProgress, { passive: true });

  menuBtn?.addEventListener("click", toggleMenu);
  wireMobileLinks();

  themeToggle?.addEventListener("click", toggleTheme);
  themeToggle2?.addEventListener("click", toggleTheme);

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    // click outside panel closes
    const rect = $(".modal__panel", modal).getBoundingClientRect();
    const x = e.clientX, y = e.clientY;
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (!inside) closeModal();
  });

  // ESC key automatically closes dialog; nice.

  searchInput?.addEventListener("input", (e) => {
    query = e.target.value || "";
    renderProjects();
  });

  copyBtn?.addEventListener("click", async () => {
    const ok = await copyText(copySnippet.textContent);
    showToast(ok ? "Copied!" : "Copy failed");
  });
}

(async function main(){
  init();
  try {
    await loadProjects();
    renderFilters(uniqueTags(PROJECTS));
    renderProjects();
  } catch (err) {
    projectsGrid.innerHTML = `
      <div class="card">
        <h3>Projects failed to load</h3>
        <p class="muted">Make sure <code>assets/projects.json</code> exists and is valid JSON.</p>
      </div>
    `;
    console.error(err);
  }
})();

// ---------- Dynamic UX: smooth scroll + active nav + reveal ----------
function smoothScrollInit() {
  // smooth scroll for in-page anchors
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function activeNavInit() {
  const sections = ["#projects", "#resources", "#skills", "#contact"]
    .map(id => document.querySelector(id))
    .filter(Boolean);

  const links = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
  const map = new Map(links.map(a => [a.getAttribute("href"), a]));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = "#" + en.target.id;
      links.forEach(a => a.classList.remove("is-active"));
      const active = map.get(id);
      if (active) active.classList.add("is-active");
    });
  }, { root: null, threshold: 0.45 });

  sections.forEach(s => obs.observe(s));
}

function revealInit() {
  const els = document.querySelectorAll(".card, .panel, .hero__left, .hero__right");
  els.forEach(el => el.classList.add("reveal"));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add("reveal--in");
    });
  }, { threshold: 0.12 });

  els.forEach(el => obs.observe(el));
}

smoothScrollInit();
activeNavInit();
revealInit();
