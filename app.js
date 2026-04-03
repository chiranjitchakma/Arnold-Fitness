/* ══════════════════════════════════════
   ARNOLD FITNESS VIJAYANAGAR — app.js
   Pure Vanilla JavaScript
══════════════════════════════════════ */

'use strict';

/* ── CONSTANTS ─────────────────────── */
const WA_NUMBER = '917349788244';
const GYM_NAME  = 'Arnold Fitness Vijayanagar';

// Gym hours in IST (24h format)
const GYM_HOURS = {
  0: { open: 7 * 60,       close: 11 * 60 },       // Sunday  07:00 – 11:00
  1: { open: 5 * 60 + 30,  close: 21 * 60 + 30 },  // Monday  05:30 – 21:30
  2: { open: 5 * 60 + 30,  close: 21 * 60 + 30 },
  3: { open: 5 * 60 + 30,  close: 21 * 60 + 30 },
  4: { open: 5 * 60 + 30,  close: 21 * 60 + 30 },
  5: { open: 5 * 60 + 30,  close: 21 * 60 + 30 },
  6: { open: 5 * 60 + 30,  close: 21 * 60 + 30 },  // Saturday
};

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${ampm}` : `${hour12}:${String(m).padStart(2,'0')} ${ampm}`;
}

function getISTNow() {
  // IST = UTC + 5:30
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

function updateLiveStatus() {
  const ist  = getISTNow();
  const day  = ist.getDay();
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const hours = GYM_HOURS[day];

  const dot  = document.getElementById('liveStatus');
  const text = document.getElementById('liveStatusText');
  const footer = document.getElementById('footerStatus');

  if (!dot || !text) return;

  const isOpen = mins >= hours.open && mins < hours.close;

  if (isOpen) {
    dot.className = 'status-dot open';
    const msg = `🟢 Open Now · Closes ${formatTime(hours.close)}`;
    text.textContent = msg;
    if (footer) footer.innerHTML = `<span style="color:#2ecc71">🟢 Open Now</span> · Closes ${formatTime(hours.close)}`;
  } else {
    dot.className = 'status-dot closed';
    // Find next open day
    let nextDay = (day + 1) % 7;
    let daysAhead = 1;
    while (daysAhead < 7) {
      if (GYM_HOURS[nextDay]) break;
      nextDay = (nextDay + 1) % 7;
      daysAhead++;
    }
    const nextHours = GYM_HOURS[nextDay];
    const todayStillOpensLater = mins < hours.open;
    const opensText = todayStillOpensLater
      ? `Opens ${formatTime(hours.open)} today`
      : `Opens ${formatTime(nextHours.open)} tomorrow`;

    text.textContent = `🔴 Closed · ${opensText}`;
    if (footer) footer.innerHTML = `<span style="color:#e74c3c">🔴 Closed</span> · ${opensText}`;
  }
}

/* ── NAVBAR SCROLL ─────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── ACTIVE NAV ON SCROLL ──────────── */
function initActiveNav() {
  const sections  = document.querySelectorAll('section[id], div[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');
  if (!navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ── HAMBURGER MENU ────────────────── */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ── SCROLL FADE-UP ────────────────── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ── GALLERY LIGHTBOX ──────────────── */
function initGallery() {
  const items     = document.querySelectorAll('.gallery-item');
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightboxImg');
  const lbClose   = document.getElementById('lightboxClose');
  const lbPrev    = document.getElementById('lightboxPrev');
  const lbNext    = document.getElementById('lightboxNext');

  if (!lightbox || !items.length) return;

  let current = 0;
  const srcs  = Array.from(items).map(i => i.dataset.src || i.querySelector('img').src);

  function openAt(index) {
    current = ((index % srcs.length) + srcs.length) % srcs.length;
    lbImg.src = srcs[current];
    lbImg.alt = `Arnold Fitness Gallery ${current + 1}`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  items.forEach((item, i) => item.addEventListener('click', () => openAt(i)));
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => openAt(current - 1));
  lbNext.addEventListener('click', () => openAt(current + 1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   openAt(current - 1);
    if (e.key === 'ArrowRight')  openAt(current + 1);
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? openAt(current + 1) : openAt(current - 1);
  });
}

/* ── SERVICE CARDS → WHATSAPP ──────── */
function initServiceCTAs() {
  document.querySelectorAll('.wa-service').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const card    = link.closest('.service-card');
      const service = card ? (card.dataset.wa || 'General+Inquiry') : 'General+Inquiry';
      const msg     = `Hi%2C%20I%27m%20interested%20in%20${service}%20at%20${encodeURIComponent(GYM_NAME)}.%20Please%20share%20more%20details.`;
      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
    });
  });
}

/* ── WHATSAPP ENQUIRY FORM ─────────── */
window.sendWhatsAppEnquiry = function () {
  const nameEl     = document.getElementById('formName');
  const interestEl = document.getElementById('formInterest');

  const name     = (nameEl     ? nameEl.value.trim()     : '') || 'Anonymous';
  const interest = interestEl ? interestEl.value : 'Membership+Inquiry';

  const msg = `Hi%2C+My+name+is+${encodeURIComponent(name)}.+I%27m+interested+in+${interest}+at+${encodeURIComponent(GYM_NAME)}.+Please+guide+me+on+the+next+steps.`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
};

/* ── SMOOTH SCROLL WITH OFFSET ──────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── DOCK TOGGLE (minimize / expand) ── */
function initDockToggle() {
  const bar    = document.getElementById('stickyBar');
  const toggle = document.getElementById('dockToggle');
  if (!bar || !toggle) return;

  toggle.addEventListener('click', () => {
    bar.classList.toggle('minimized');
  });
}

/* ── BOOT ──────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initActiveNav();
  initHamburger();
  initScrollAnimations();
  initGallery();
  initServiceCTAs();
  initSmoothScroll();
  initDockToggle();

  // Live status — run immediately, then every 60s
  updateLiveStatus();
  setInterval(updateLiveStatus, 60000);

  // Trigger animations for elements already in view on load
  setTimeout(() => {
    document.querySelectorAll('.fade-up').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('visible');
      }
    });
  }, 100);
});
