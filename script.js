const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
const lectureItems = document.querySelectorAll('.lecture-item');
const lectureFrame = document.getElementById('lecture-frame');
const lectureTitle = document.getElementById('lecture-title');
const lectureMeta = document.getElementById('lecture-meta');
const openLecture = document.getElementById('open-lecture');

const closeAllDropdowns = () => {
  dropdownToggles.forEach((toggle) => {
    toggle.setAttribute('aria-expanded', 'false');
    const menu = toggle.parentElement.querySelector('.dropdown-menu');
    if (menu) menu.style.display = 'none';
  });
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
};

lectureItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    setActiveLecture(item);
  });
});

const defaultLecture = document.querySelector('.lecture-item.active') || lectureItems[0];
if (defaultLecture) {
  setActiveLecture(defaultLecture);
}

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
