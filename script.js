const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
const lectureItems = document.querySelectorAll('.lecture-item');
const lectureList = document.querySelector('.lecture-list');
const lectureFrame = document.getElementById('lecture-frame');
const lectureTitle = document.getElementById('lecture-title');
const lectureMeta = document.getElementById('lecture-meta');
const slidesLink = document.getElementById('slides-link');
const videoLinks = document.getElementById('video-links');
let lectureMedia = {};

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

const toYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : url;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : url;
    }
    return url;
  } catch {
    return url;
  }
};

const getActiveLectureKey = () => {
  const activeItem = document.querySelector('.lecture-item.active');
  const src = activeItem?.dataset?.lecture || '';
  const match = src.match(/([^/]+)\.html$/);
  return match ? match[1] : '';
};

const updateLectureMedia = () => {
  const lectureKey = getActiveLectureKey();
  const media = lectureMedia[lectureKey] || {};
  const localSlide = lectureKey ? `assets/slides/${lectureKey}.pdf` : '';
  const slideEmbed = media.slide_local || localSlide || (media.slide ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(media.slide)}` : '');

  updateResourceLink(slidesLink, slideEmbed, media.slide ? 'Lecture slides' : 'No slides posted');
  if (!videoLinks) return;

  const recordings = media.recordings || [];
  if (!recordings.length) {
    videoLinks.textContent = 'No recording posted';
    return;
  }

  videoLinks.innerHTML = recordings
    .map((rec, idx) => {
      const href = toYouTubeEmbedUrl(rec.url || '');
      const label = rec.label || `Recording ${idx + 1}`;
      return `<a class="resource-link" href="${href}" data-kind="Recording">${label}</a>`;
    })
    .join(' · ');
};

const getActiveLectureContext = () => {
  const activeItem = document.querySelector('.lecture-item.active');
  if (!activeItem) return { title: 'Lecture', meta: '' };
  return {
    title: activeItem.dataset.title || activeItem.querySelector('.lecture-title')?.textContent || 'Lecture',
    meta: activeItem.dataset.meta || activeItem.querySelector('.lecture-meta')?.textContent || '',
  };
};

const openResourceHref = (href, kindLabel) => {
  if (!href || href === '#') return;
  const context = getActiveLectureContext();
  if (lectureFrame) lectureFrame.src = href;
  if (lectureTitle) lectureTitle.textContent = `${context.title} - ${kindLabel}`;
  if (lectureMeta) lectureMeta.textContent = context.meta || '';
};

const openResourceInViewer = (event, kindLabel) => {
  const linkEl = event.currentTarget;
  event.preventDefault();
  if (!linkEl || linkEl.classList.contains('disabled')) return;
  const href = linkEl.getAttribute('href');
  openResourceHref(href, kindLabel);
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
  if (lectureMeta) lectureMeta.textContent = meta || '';
  updateLectureMedia();
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

fetch('assets/media_resources.json')
  .then((response) => (response.ok ? response.json() : {}))
  .then((data) => {
    lectureMedia = data || {};
    updateLectureMedia();
  })
  .catch(() => {
    lectureMedia = {};
    updateLectureMedia();
  });

if (slidesLink) {
  slidesLink.addEventListener('click', (event) => openResourceInViewer(event, 'Slides'));
}

if (videoLinks) {
  videoLinks.addEventListener('click', (event) => {
    const link = event.target.closest('a.resource-link');
    if (!link) return;
    event.preventDefault();
    openResourceHref(link.getAttribute('href'), link.dataset.kind || 'Recording');
  });
}

document.querySelectorAll('.click-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    const link = card.querySelector('a.resource-link:not(.disabled)');
    if (!link) return;
    const kind = link.id === 'slides-link' ? 'Slides' : 'Recording';
    openResourceHref(link.getAttribute('href'), kind);
  });
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
