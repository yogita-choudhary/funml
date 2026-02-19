const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

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
