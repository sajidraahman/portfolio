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

      const windowEl = document.createElement('span');
      windowEl.className = 'odometer-window';
      windowEl.setAttribute('aria-hidden', 'true');
      windowEl.appendChild(strip);

      // Invisible in-flow digit: sizes the slot and anchors its text baseline.
      const ghost = document.createElement('span');
      ghost.className = 'odometer-ghost';
      ghost.textContent = '0';

      slot.appendChild(windowEl);
      slot.appendChild(ghost);
      container.appendChild(slot);
      setDigit(slot, Number(ch), false);
    }
  }
}

function setDigit(slot, digit, animate) {
  const strip = slot.querySelector('.odometer-strip');
  strip.style.transition = animate ? '' : 'none';
  // Ten equal rows, so each digit is exactly 10% of the strip's height.
  strip.style.transform = `translateY(-${digit * 10}%)`;
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

const aboutOverlay = document.getElementById('aboutOverlay');
const aboutClose = document.getElementById('aboutClose');
const learnMoreBtn = document.getElementById('learnMoreBtn');

let lastFocusedEl = null;

// Shared open/close so the client popups and the "What I Actually Do" popup behave identically.
function openOverlay(overlay, closeBtn) {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function closeOverlay(overlay) {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocusedEl) lastFocusedEl.focus();
}

function wireOverlay(overlay, closeBtn) {
  closeBtn.addEventListener('click', () => closeOverlay(overlay));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay(overlay);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay(overlay);
  });
}

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

  openOverlay(modalOverlay, modalClose);
}

document.querySelectorAll('.card.clickable[data-client]').forEach((card) => {
  card.addEventListener('click', () => {
    lastFocusedEl = card;
    openModal(card.dataset.client);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      lastFocusedEl = card;
      openModal(card.dataset.client);
    }
  });
});

learnMoreBtn.addEventListener('click', () => {
  lastFocusedEl = learnMoreBtn;
  openOverlay(aboutOverlay, aboutClose);
});

// Links inside a popup (e.g. "contact me") should dismiss it before jumping down the page.
document.querySelectorAll('[data-close-modal]').forEach((link) => {
  link.addEventListener('click', () => closeOverlay(aboutOverlay));
});

wireOverlay(modalOverlay, modalClose);
wireOverlay(aboutOverlay, aboutClose);

// Video carousel — only the centered clip plays, muted, and everything pauses
// once the section leaves the screen so it isn't decoding video in the background.
const videoTrack = document.getElementById('videoTrack');

if (videoTrack) {
  const personalSection = document.getElementById('personal-work');
  const dots = Array.from(document.querySelectorAll('#videoDots .dot'));
  const prevBtn = document.getElementById('videoPrev');
  const nextBtn = document.getElementById('videoNext');

  const realSlides = Array.from(videoTrack.querySelectorAll('.carousel-slide'));
  const realCount = realSlides.length;

  // Lay the clips out twice end to end. Because the run repeats every
  // `realCount` slides, any position has an identical twin one run away, which
  // lets us shift the track back into the middle without anything changing on
  // screen. The carousel therefore never has to rest on an outermost slide,
  // which is what used to leave a blank gap beside it.
  realSlides.forEach((slide) => {
    const copy = slide.cloneNode(true);
    copy.classList.remove('is-active');
    videoTrack.appendChild(copy);
  });

  const slides = Array.from(videoTrack.querySelectorAll('.carousel-slide'));
  const videos = slides.map((slide) => slide.querySelector('video'));
  videos.forEach((video) => { video.muted = true; });

  // Only slides with a neighbour on both sides may be rested on.
  const MIN_POSITION = 1;
  const MAX_POSITION = slides.length - 2;
  const LOOP = realCount;

  // Autoplaying video is disorienting with reduced motion on, so those
  // visitors get normal playback controls instead.
  const autoplayAllowed = !reducedMotion;
  if (!autoplayAllowed) videos.forEach((v) => { v.controls = true; });

  let activeIndex = MIN_POSITION;

  const realIndexOf = (pos) => ((pos % realCount) + realCount) % realCount;

  // Slides are evenly spaced, so one slide's worth of scrolling is constant.
  // Read live rather than cached so it survives resizes.
  const stride = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 0);

  // Measured fresh rather than cached from an observer entry: the observer can
  // deliver several batched records at once, and a stale one would pause playback.
  function sectionInView() {
    const rect = personalSection.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function syncPlayback() {
    const visible = sectionInView();
    videos.forEach((video, i) => {
      if (autoplayAllowed && visible && i === activeIndex) {
        const played = video.play();
        // Browsers reject autoplay in some contexts; failing quietly is fine.
        if (played) played.catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  function setActive(index) {
    activeIndex = index;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));

    const real = realIndexOf(index);
    dots.forEach((dot, i) => dot.classList.toggle('active', i === real));
    syncPlayback();
  }

  function goTo(index) {
    videoTrack.scrollTo({ left: stride() * index, behavior: 'smooth' });
  }

  // Repositions without animating, for shifting between identical twins.
  function jumpTo(index) {
    videoTrack.style.scrollBehavior = 'auto';
    videoTrack.scrollLeft = stride() * index;
    videoTrack.style.scrollBehavior = '';
  }

  // Move to the twin of the current slide one run away. Same clip, same frame,
  // so nothing changes on screen — it just buys room to keep scrolling.
  function shiftBy(offset) {
    const twin = activeIndex + offset;
    const from = videos[activeIndex];
    const to = videos[twin];

    if (from && to) {
      try {
        to.currentTime = from.currentTime;
      } catch (err) {
        /* seeking can throw if metadata isn't ready — starting over is fine */
      }
    }

    jumpTo(twin);
    setActive(twin);
  }

  // Pull the resting position back between the guard slides. Done before a move
  // rather than after, so a neighbour is always in place on both sides.
  function normalize() {
    while (activeIndex > MAX_POSITION) shiftBy(-LOOP);
    while (activeIndex < MIN_POSITION) shiftBy(LOOP);
  }

  // Advance on its own, but only while the section is actually on screen.
  const AUTO_ADVANCE_MS = 15000;
  let autoTimer = null;

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function startAuto() {
    stopAuto();
    if (!autoplayAllowed || !sectionInView()) return;
    autoTimer = setInterval(() => step(1), AUTO_ADVANCE_MS);
  }

  // Shuffle back into range first, then animate a single slide. Since the
  // reposition happens up front, the visible move is always one clean step with
  // clips either side of it.
  function step(direction) {
    normalize();

    let target = activeIndex + direction;
    if (target > MAX_POSITION || target < MIN_POSITION) {
      shiftBy(direction > 0 ? -LOOP : LOOP);
      target = activeIndex + direction;
    }

    goTo(target);
    startAuto();
  }

  // Jump straight to a clip, picking whichever of its twins is closest.
  function goToReal(realIdx) {
    normalize();

    let best = null;
    for (let pos = MIN_POSITION; pos <= MAX_POSITION; pos += 1) {
      if (realIndexOf(pos) !== realIdx) continue;
      if (best === null || Math.abs(pos - activeIndex) < Math.abs(best - activeIndex)) best = pos;
    }

    if (best !== null) goTo(best);
    startAuto();
  }

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goToReal(i)));

  // Whichever slide sits nearest the middle is the active one. Measuring the
  // centre beats an IntersectionObserver here, since the blurred neighbours are
  // partly on screen too and would otherwise register as active.
  function updateActiveFromScroll() {
    const trackRect = videoTrack.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    let nearest = 0;
    let smallestGap = Infinity;

    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const gap = Math.abs(rect.left + rect.width / 2 - trackCenter);
      if (gap < smallestGap) {
        smallestGap = gap;
        nearest = i;
      }
    });

    if (nearest !== activeIndex) setActive(nearest);
  }

  // Keeps dots and playback in sync with swipes as well as button presses,
  // throttled to one measurement per frame. The debounce detects when scrolling
  // has come to rest, which is when a copy can be swapped for its real twin.
  let scrollFrame = null;
  let settleTimer = null;

  videoTrack.addEventListener(
    'scroll',
    () => {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = null;
          updateActiveFromScroll();
        });
      }

      // A free swipe can still come to rest on a guard slide; tidy that up once
      // the scrolling stops so the next move has room on both sides.
      clearTimeout(settleTimer);
      settleTimer = setTimeout(normalize, 150);
    },
    { passive: true }
  );

  // Slide spacing changes with the viewport, so re-pin the current slide.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => jumpTo(activeIndex), 150);
  });

  const sectionObserver = new IntersectionObserver(
    () => {
      syncPlayback();
      if (sectionInView()) startAuto();
      else stopAuto();
    },
    { threshold: [0, 0.25] }
  );
  sectionObserver.observe(personalSection);

  // Browsers pause video when a tab is hidden; pick playback back up on return.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncPlayback();
      startAuto();
    } else {
      stopAuto();
    }
  });

  // Open on the first clip. Setting the scroll position directly also pins the
  // snap container, which can otherwise settle on the wrong slide while the
  // videos are still sizing.
  let startIndex = 0;
  while (startIndex < MIN_POSITION) startIndex += LOOP;

  jumpTo(startIndex);
  setActive(startIndex);
}

// Project screenshot carousel — crossfades between stacked images.
const projectShots = document.getElementById('projectShots');

if (projectShots) {
  const shotImages = Array.from(projectShots.querySelectorAll('img'));
  const shotDots = Array.from(document.querySelectorAll('#projectDots .dot'));
  const shotsPrev = document.getElementById('shotsPrev');
  const shotsNext = document.getElementById('shotsNext');

  // Slow enough that a screen can actually be read before it changes.
  const SHOT_INTERVAL_MS = 6000;
  let shotIndex = 0;
  let shotTimer = null;

  function showShot(index) {
    shotIndex = (index + shotImages.length) % shotImages.length;
    shotImages.forEach((img, i) => img.classList.toggle('is-active', i === shotIndex));
    shotDots.forEach((dot, i) => dot.classList.toggle('active', i === shotIndex));
  }

  function stopShots() {
    clearInterval(shotTimer);
    shotTimer = null;
  }

  function startShots() {
    stopShots();
    if (reducedMotion) return;
    shotTimer = setInterval(() => showShot(shotIndex + 1), SHOT_INTERVAL_MS);
  }

  // Manual navigation restarts the countdown so it doesn't advance right after.
  function goToShot(index) {
    showShot(index);
    startShots();
  }

  shotsPrev.addEventListener('click', () => goToShot(shotIndex - 1));
  shotsNext.addEventListener('click', () => goToShot(shotIndex + 1));
  shotDots.forEach((dot, i) => dot.addEventListener('click', () => goToShot(i)));

  // Hold still while someone is looking closely.
  projectShots.addEventListener('mouseenter', stopShots);
  projectShots.addEventListener('mouseleave', startShots);

  // A fade has no native swipe, so a light touch handler covers phones.
  let touchStartX = null;
  projectShots.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  projectShots.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) > 40) goToShot(delta < 0 ? shotIndex + 1 : shotIndex - 1);
  }, { passive: true });

  // Only cycle while on screen.
  const shotsObserver = new IntersectionObserver(() => {
    const rect = projectShots.getBoundingClientRect();
    const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
    if (onScreen) startShots();
    else stopShots();
  }, { threshold: [0, 0.25] });
  shotsObserver.observe(projectShots);

  showShot(0);
}
