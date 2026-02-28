const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
const lectureItems = document.querySelectorAll('.lecture-item');
const lectureList = document.querySelector('.lecture-list');
const lectureFrame = document.getElementById('lecture-frame');
const lectureTitle = document.getElementById('lecture-title');
const lectureMeta = document.getElementById('lecture-meta');
const openLecture = document.getElementById('open-lecture');
const exerciseLink = document.getElementById('exercise-link');
const solutionLink = document.getElementById('solution-link');
let lectureResources = {};

const closeAllDropdowns = () => {
  dropdownToggles.forEach((toggle) => {
    toggle.setAttribute('aria-expanded', 'false');
    const menu = toggle.parentElement.querySelector('.dropdown-menu');
    if (menu) menu.style.display = 'none';
  });
};

const updateResourceLink = (linkEl, href, label) => {
  if (!linkEl) return;
  if (href) {
    linkEl.classList.remove('disabled');
    linkEl.setAttribute('href', href);
    linkEl.textContent = label;
    return;
  }
  linkEl.classList.add('disabled');
  linkEl.setAttribute('href', '#');
  linkEl.textContent = label;
};

const updateLectureResources = (src) => {
  if (!src) return;
  const match = src.match(/([^/]+)\.html$/);
  const lectureKey = match ? match[1] : '';
  const resource = lectureResources[lectureKey] || {};
  updateResourceLink(exerciseLink, resource.exercise, resource.exercise ? 'Open in-class exercise' : 'No in-class exercise');
  updateResourceLink(solutionLink, resource.solution, resource.solution ? 'Open exercise solutions' : 'No solutions posted');
};

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const setActiveLecture = (item) => {
  if (!item || !lectureFrame) return;
  lectureItems.forEach((entry) => entry.classList.remove('active'));
  item.classList.add('active');

  const src = item.dataset.lecture;
  const title = item.dataset.title || item.querySelector('.lecture-title')?.textContent || 'Lecture';
  const meta = item.dataset.meta || item.querySelector('.lecture-meta')?.textContent || '';

  lectureFrame.src = src;
  if (lectureTitle) lectureTitle.textContent = title;
  if (lectureMeta) lectureMeta.textContent = meta ? `${meta} · Loaded` : 'Lecture selected.';
  if (openLecture) openLecture.setAttribute('href', src);
  updateLectureResources(src);
};

if (lectureList) {
  lectureList.addEventListener('click', (event) => {
    const item = event.target.closest('.lecture-item');
    if (!item) return;
    event.preventDefault();
    setActiveLecture(item);
  });
}

const defaultLecture = document.querySelector('.lecture-item.active') || lectureItems[0];
if (defaultLecture) {
  setActiveLecture(defaultLecture);
}

fetch('lectures/resources.json')
  .then((response) => (response.ok ? response.json() : {}))
  .then((data) => {
    lectureResources = data || {};
    const currentSrc = lectureFrame?.getAttribute('src');
    updateLectureResources(currentSrc);
  })
  .catch(() => {
    lectureResources = {};
    const currentSrc = lectureFrame?.getAttribute('src');
    updateLectureResources(currentSrc);
  });

dropdownToggles.forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    closeAllDropdowns();
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    const menu = toggle.parentElement.querySelector('.dropdown-menu');
    if (menu) menu.style.display = isExpanded ? 'none' : 'block';
  });
});

document.addEventListener('click', () => {
  closeAllDropdowns();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeAllDropdowns();
    if (navMenu) navMenu.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
});
