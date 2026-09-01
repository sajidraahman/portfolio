// Live ticking view counter, rendered as a rolling odometer.
// Anchored to a real timestamp so the count is accurate no matter when the page loads,
// and keeps climbing in real time rather than resetting on reload.
const EPOCH_MS = new Date('2026-07-28T00:00:00-04:00').getTime();
const BASE_VIEWS = 164232500;
const DAILY_RATE = 80000;
const RATE_PER_MS = DAILY_RATE / 86400000;

function getTargetViews() {
  return BASE_VIEWS + Math.max(0, Date.now() - EPOCH_MS) * RATE_PER_MS;
}

const viewCountEl = document.getElementById('viewCount');

function buildOdometer(container, value) {
  container.innerHTML = '';
  container.classList.add('odometer');
  const str = Math.floor(value).toLocaleString('en-US');
  for (const ch of str) {
    if (ch === ',') {
      const comma = document.createElement('span');
      comma.className = 'odometer-comma';
      comma.textContent = ',';
      container.appendChild(comma);
    } else {
      const slot = document.createElement('span');
      slot.className = 'odometer-digit';
      const strip = document.createElement('span');
      strip.className = 'odometer-strip';
      for (let d = 0; d <= 9; d++) {
        const digitEl = document.createElement('span');
        digitEl.className = 'odometer-num';
        digitEl.textContent = String(d);
        strip.appendChild(digitEl);
      }
      slot.appendChild(strip);
      container.appendChild(slot);
      setDigit(slot, Number(ch), false);
    }
  }
}

function setDigit(slot, digit, animate) {
  const strip = slot.querySelector('.odometer-strip');
  strip.style.transition = animate ? '' : 'none';
  strip.style.transform = `translateY(-${digit}lh)`;
  if (!animate) {
    // force layout so the "no transition" jump is applied before re-enabling transitions
    strip.offsetHeight;
    strip.style.transition = '';
  }
}

function updateOdometer(container, value) {
  const str = Math.floor(value).toLocaleString('en-US');
  const digitChars = str.replace(/,/g, '');
  const slots = container.querySelectorAll('.odometer-digit');

  if (slots.length !== digitChars.length) {
    buildOdometer(container, value);
    return;
  }

  let i = 0;
  for (const ch of str) {
    if (ch !== ',') {
      setDigit(slots[i], Number(ch), true);
      i++;
    }
  }
}

buildOdometer(viewCountEl, getTargetViews());

function scheduleTick() {
  const delay = 1200 + Math.random() * 2200;
  setTimeout(tick, delay);
}

let displayed = Math.floor(getTargetViews());

function tick() {
  const target = getTargetViews();
  if (displayed < target) {
    const remaining = target - displayed;
    const jump = Math.min(Math.ceil(remaining), Math.floor(Math.random() * 4) + 1);
    displayed += jump;
    updateOdometer(viewCountEl, displayed);
  }
  scheduleTick();
}

scheduleTick();

// Reveal content as it scrolls into view.
// IntersectionObserver rather than a scroll listener, and each element is
// unobserved once shown, so nothing runs on every frame.
const revealEls = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}

// Client detail modals
const LINK_ICONS = {
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.43 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none"/></svg>',
};

const CLIENTS = {
  raisingzion: {
    avatar: 'assets/raisingzion.png',
    handle: '@raisingzion',
    pillLabel: 'Active client',
    pillClass: 'pill',
    duration: 'Since May 2024 · 2 yrs',
    description: 'Working with an established TikTok creator with over 5,000,000 followers who pivoted to more family-friendly content — helping grow the account using short-form clips with a consistent posting strategy.',
    stats: [
      ['380,000+', 'followers'],
      ['130M+', 'views'],
      ['15.2M+', 'likes'],
      ['500,000+', 'watch hours'],
    ],
    highlight: 'Also grew his personal Twitch livestreaming account from 20,000 to over 65,000 followers.',
    link: 'https://www.tiktok.com/@broskifunny',
    linkPlatform: 'tiktok',
  },
  joebartolozzi: {
    avatar: 'assets/joebartolozzi.webp',
    handle: '@joebartolozzi',
    pillLabel: 'Active client',
    pillClass: 'pill',
    duration: 'Since August 2026',
    description: 'Working with an established content creator with over 25,000,000 followers on TikTok to expand his YouTube audience and drive more viewership to his alternative channels.',
    stats: [
      ['50,000+', 'followers'],
      ['50M+', 'views'],
      ['5M+', 'likes'],
      ['300,000+', 'watch hours'],
    ],
    highlight: null,
    link: 'https://www.tiktok.com/@joebartvault',
    linkPlatform: 'tiktok',
  },
  sidemen: {
    avatar: 'assets/sidemen.png',
    handle: '@sidemen',
    pillLabel: 'Previous client',
    pillClass: 'pill pill-muted',
    duration: 'Sep 2023 – May 2024',
    description: 'Working with an established content creator with over 20,000,000 subscribers on YouTube to expand reach on short-form content platforms like TikTok through the use of clips.',
    stats: [
      ['40,000+', 'followers'],
      ['30M+', 'views'],
      ['3M+', 'likes'],
      ['100,000+', 'watch hours'],
    ],
    highlight: null,
    link: 'https://www.youtube.com/@Sidemen',
    linkPlatform: 'youtube',
  },
  georainbolt: {
    avatar: 'assets/georainbolt.webp',
    handle: '@georainbolt',
    pillLabel: 'Previous client',
    pillClass: 'pill pill-muted',
    duration: 'Jan 2025 – Mar 2025',
    description: 'Had a short stint posting YouTube videos — worked with him to drive more viewership to these videos and expand his audience.',
    stats: [
      ['10,000+', 'followers'],
      ['3.5M+', 'views'],
      ['400,000+', 'likes'],
      ['15,000+', 'watch hours'],
    ],
    highlight: null,
    link: 'https://www.youtube.com/@georainbolt',
    linkPlatform: 'youtube',
  },
};

const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalAvatar = document.getElementById('modalAvatar');
const modalHandle = document.getElementById('modalHandle');
const modalDuration = document.getElementById('modalDuration');
const modalPill = document.getElementById('modalPill');
const modalDescription = document.getElementById('modalDescription');
const modalStats = document.getElementById('modalStats');
const modalHighlight = document.getElementById('modalHighlight');
const modalLink = document.getElementById('modalLink');
const modalLinkIcon = document.getElementById('modalLinkIcon');

let lastFocusedCard = null;

function openModal(clientId) {
  const data = CLIENTS[clientId];
  if (!data) return;

  modalAvatar.src = data.avatar;
  modalAvatar.alt = data.handle;
  modalHandle.textContent = data.handle;
  modalDuration.textContent = data.duration;
  modalPill.textContent = data.pillLabel;
  modalPill.className = data.pillClass;
  modalDescription.textContent = data.description;

  modalStats.innerHTML = '';
  data.stats.forEach(([value, label]) => {
    const block = document.createElement('div');
    block.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    modalStats.appendChild(block);
  });

  if (data.highlight) {
    modalHighlight.textContent = data.highlight;
    modalHighlight.hidden = false;
  } else {
    modalHighlight.hidden = true;
  }

  if (data.link) {
    modalLink.href = data.link;
    modalLinkIcon.innerHTML = LINK_ICONS[data.linkPlatform] || '';
    modalLink.hidden = false;
  } else {
    modalLink.hidden = true;
  }

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocusedCard) lastFocusedCard.focus();
}

document.querySelectorAll('.card.clickable[data-client]').forEach((card) => {
  card.addEventListener('click', () => {
    lastFocusedCard = card;
    openModal(card.dataset.client);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      lastFocusedCard = card;
      openModal(card.dataset.client);
    }
  });
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});
