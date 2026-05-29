/* ============================================================
   cityeight — script.js
   Interactivity: nav scroll, mobile menu, reveal animations
   ============================================================ */

'use strict';

/* ── DOM references ──────────────────────────────────────────── */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('nav-links');
const navItems   = navLinks ? navLinks.querySelectorAll('a') : [];
const revealEls  = document.querySelectorAll('.reveal');

/* ── 1. Navbar — scroll behaviour ───────────────────────────── */
/**
 * Adds/removes the `scrolled` class on the navbar
 * based on whether the page has scrolled past 60 px.
 */
function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run once on load in case page is already scrolled


/* ── 2. Mobile menu toggle ──────────────────────────────────── */
/**
 * Opens/closes the full-screen mobile nav overlay.
 * Toggles aria-expanded for accessibility.
 * Prevents body scroll while menu is open.
 */
function toggleMenu(open) {
  const isOpen = (open !== undefined) ? open : !navLinks.classList.contains('open');

  hamburger.classList.toggle('open', isOpen);
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

hamburger.addEventListener('click', () => toggleMenu());

// Close menu when any nav link is tapped
navItems.forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

// Close menu on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    toggleMenu(false);
  }
});


/* ── 3. Smooth scroll (polyfill for older browsers) ─────────── */
/**
 * Intercepts clicks on anchor links and scrolls smoothly
 * to the target section, accounting for fixed navbar height.
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navHeight = navbar.getBoundingClientRect().height;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── 4. Scroll-reveal with IntersectionObserver ─────────────── */
/**
 * Elements with `.reveal` are invisible by default (CSS).
 * When they enter the viewport (threshold 18%), we add
 * `.visible` which transitions them into view.
 */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate once only
      }
    });
  },
  { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));


/* ── 5. Destination card tilt effect ────────────────────────── */
/**
 * Subtle 3-D tilt on destination cards on desktop hover.
 * Falls back gracefully on touch devices.
 */
const destCards = document.querySelectorAll('.dest-card');

destCards.forEach(card => {
  card.addEventListener('mousemove', handleTilt);
  card.addEventListener('mouseleave', resetTilt);
});

function handleTilt(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Normalise to -0.5 → 0.5
  const nx = (x / rect.width)  - 0.5;
  const ny = (y / rect.height) - 0.5;

  // Max tilt: 6 degrees
  const rotateX = (-ny * 6).toFixed(2);
  const rotateY = ( nx * 6).toFixed(2);

  card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  card.style.transition = 'transform .1s ease';
}

function resetTilt(e) {
  const card = e.currentTarget;
  card.style.transform = '';
  card.style.transition = 'transform .5s cubic-bezier(.22, 1, .36, 1)';
}


/* ── 6. Active nav link highlight on scroll ─────────────────── */
/**
 * As the user scrolls, the nav link corresponding to the
 * visible section gets an `active` style.
 */
const sections = document.querySelectorAll('section[id]');

function highlightActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight * 0.45;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = document.querySelector(`.nav-link[href="#${id}"]`);

    if (!link) return;

    if (scrollMid >= top && scrollMid < bottom) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

window.addEventListener('scroll', highlightActiveNav, { passive: true });
highlightActiveNav();


/* ── 7. Contact card ripple effect ──────────────────────────── */
/**
 * A small CSS-in-JS ripple on contact card clicks
 * for a premium, tactile feel.
 */
document.querySelectorAll('.contact-card').forEach(card => {
  card.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    Object.assign(ripple.style, {
      position:     'absolute',
      width:        `${size}px`,
      height:       `${size}px`,
      left:         `${x}px`,
      top:          `${y}px`,
      background:   'rgba(255,255,255,.15)',
      borderRadius: '50%',
      transform:    'scale(0)',
      animation:    'ripple-out .55s ease-out forwards',
      pointerEvents:'none',
    });

    // Inject keyframe only once
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes ripple-out {
          to { transform: scale(2.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  });
});


/* ── 8. Reduced-motion respect ──────────────────────────────── */
/**
 * If the user prefers reduced motion, skip the tilt effects
 * and make reveal instant.
 */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Make all reveal elements visible immediately
  revealEls.forEach(el => el.classList.add('visible'));
  // Disable tilt listeners
  destCards.forEach(card => {
    card.removeEventListener('mousemove', handleTilt);
    card.removeEventListener('mouseleave', resetTilt);
  });
}
