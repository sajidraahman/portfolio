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
