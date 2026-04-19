import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import './style.css';
import { initAcknowledgmentModal } from './acknowledgment-modal.js';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.ticker.lagSmoothing(0);

initAcknowledgmentModal();

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Scroll-progress rule (top of nav) ──
   Writes a 0–1 value to the --scroll-progress CSS var on :root.
   CSS width: calc(var(--scroll-progress) * 100%). */
{
  const root = document.documentElement;
  let ticking = false;
  function updateProgress() {
    const scrolled = window.scrollY;
    const height = root.scrollHeight - window.innerHeight;
    const p = height > 0 ? Math.min(1, Math.max(0, scrolled / height)) : 0;
    root.style.setProperty('--scroll-progress', p.toFixed(4));
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();
}

/* ── Mobile nav toggle (GSAP-animated on mobile) ── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  const navItems = navLinks.querySelectorAll('li');
  let openTl = null;
  let mobileActive = false;

  if (!prefersReducedMotion) {
    const mm = gsap.matchMedia();
    mm.add('(max-width: 720px)', () => {
      mobileActive = true;
      gsap.set(navLinks, { y: -12, opacity: 0 });
      gsap.set(navItems, { y: -8, opacity: 0 });

      openTl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
      openTl
        .to(navLinks, { y: 0, opacity: 1, duration: 0.3 })
        .to(navItems, { y: 0, opacity: 1, duration: 0.24, stagger: 0.055 }, '-=0.18');

      return () => {
        mobileActive = false;
        openTl?.kill();
        openTl = null;
        gsap.set([navLinks, ...navItems], { clearProps: 'y,opacity' });
      };
    });
  }

  const setOpen = (open) => {
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    if (openTl) {
      open ? openTl.play() : openTl.reverse();
    } else if (mobileActive === false && !open) {
      // prefers-reduced-motion path: ensure closed state is visible
      gsap.set(navLinks, { clearProps: 'y,opacity' });
    }
  };

  navToggle.addEventListener('click', () => {
    setOpen(!navLinks.classList.contains('is-open'));
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A') return;
    // Close immediately so the scroll animation has a clean canvas.
    if (openTl) openTl.progress(0).pause();
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
}

/* ── Smooth-scroll to #briefing (and any other in-page anchors) ── */
const flashBriefing = () => {
  const section = document.querySelector('#briefing');
  const form = document.querySelector('.briefing-form');
  if (!section) return;
  const tl = gsap.timeline();
  if (form) {
    tl.fromTo(form,
      { scale: 0.985, boxShadow: '0 0 0 0 rgba(197, 158, 84, 0)' },
      { scale: 1, boxShadow: '0 0 0 6px rgba(197, 158, 84, 0.28)', duration: 0.5, ease: 'power2.out' },
    );
    tl.to(form, { boxShadow: '0 0 0 0 rgba(197, 158, 84, 0)', duration: 0.9, ease: 'power2.inOut' });
  }
  // Lead the user into the action once the flash settles.
  tl.call(() => {
    document.getElementById('briefingEmail')?.focus({ preventScroll: true });
  });
  return tl;
};

// Cross-fade teleport: cream veil in → jump to target → cream veil out → flash.
// Used for #briefing so the destination is what matters, not the travel.
const crossfadeTo = (target, href, { onArrive } = {}) => {
  const veil = document.createElement('div');
  veil.className = 'page-veil';
  document.body.appendChild(veil);

  const tl = gsap.timeline({ onComplete: () => veil.remove() });
  tl.to(veil, { opacity: 1, duration: 0.22, ease: 'power2.out' });
  tl.call(() => {
    const y = target.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo(0, y);
    history.pushState(null, '', href);
  });
  tl.to(veil, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '+=0.02');
  if (onArrive) tl.add(onArrive, '<');
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || href === '#' || href.length < 2) return;
  link.addEventListener('click', (e) => {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();

    if (prefersReducedMotion) {
      target.scrollIntoView({ block: 'start' });
      history.pushState(null, '', href);
      return;
    }

    const isBriefing = href === '#briefing';

    // Tap feedback on the clicked element (tiny squish-and-release).
    gsap.fromTo(link,
      { scale: 0.94 },
      { scale: 1, duration: 0.45, ease: 'back.out(2)' },
    );

    if (isBriefing) {
      crossfadeTo(target, href, { onArrive: flashBriefing });
      return;
    }

    gsap.to(window, {
      duration: 0.9,
      scrollTo: { y: target, offsetY: 12, autoKill: false },
      ease: 'power3.out',
      onComplete: () => history.pushState(null, '', href),
    });
  });
});

/* ── Hero slideshow factory ──
   Handles both hero sliders. Accepts a root element and options:
     - taglineSelector: element to fade in (null if none)
     - taglineDelay: ms to wait before fading in the tagline (first slide only)
     - slideDuration: seconds each slide holds
     - scale: Ken Burns end-scale
*/
function createSlideshow({
  slidesSelector,
  indicatorContainerId,
  captionId,
  taglineSelector = null,
  taglineDelay = 0,
  captionDelay = 0,
  slideDuration = 6,
  transitionDuration = 1.25,
  kenBurnsScale = 1.10,
  indicatorLabel = 'Slide',
}) {
  const slides = gsap.utils.toArray(slidesSelector);
  if (!slides.length) return;

  const indicatorContainer = document.getElementById(indicatorContainerId);
  const captionEl = captionId ? document.getElementById(captionId) : null;
  const taglineEl = taglineSelector ? document.querySelector(taglineSelector) : null;

  let current = 0;
  let indicatorTween = null;

  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = indicatorContainer.dataset.dotClass || 'indicator';
    btn.setAttribute('aria-label', `${indicatorLabel} ${i + 1}`);
    btn.innerHTML = `<span class="${indicatorContainer.dataset.fillClass || 'indicator-fill'}"></span>`;
    btn.addEventListener('click', () => goTo(i));
    indicatorContainer.appendChild(btn);
  });
  const indicators = Array.from(indicatorContainer.children);
  const fills = indicators.map((i) => i.firstElementChild);

  // Initial Ken Burns on first slide
  if (!prefersReducedMotion) {
    gsap.fromTo(slides[0], { scale: 1 }, {
      scale: kenBurnsScale, duration: slideDuration, ease: 'none'
    });
  }

  // Tagline & caption: hide immediately (JS-only), then fade in after delay.
  // CSS leaves them visible for JS-off readers.
  if (taglineEl) {
    gsap.set(taglineEl, { opacity: 0 });
    if (prefersReducedMotion) {
      gsap.set(taglineEl, { opacity: 1 });
    } else {
      gsap.to(taglineEl, {
        opacity: 1,
        duration: 1.4,
        delay: taglineDelay / 1000,
        ease: 'power2.out',
      });
    }
  }
  if (captionEl && captionDelay > 0) {
    gsap.set(captionEl, { opacity: 0 });
    if (prefersReducedMotion) {
      gsap.set(captionEl, { opacity: 1 });
    } else {
      gsap.to(captionEl, {
        opacity: 1,
        duration: 0.8,
        delay: captionDelay / 1000,
        ease: 'power2.out',
      });
    }
  }

  function startIndicatorFill() {
    if (prefersReducedMotion) return;
    fills.forEach((f) => gsap.set(f, { width: '0%' }));
    indicatorTween = gsap.to(fills[current], {
      width: '100%',
      duration: slideDuration,
      ease: 'none',
      onComplete: next,
    });
  }

  function goTo(index) {
    if (index === current) return;
    if (indicatorTween) indicatorTween.kill();
    const prev = current;
    current = index;
    indicators.forEach((ind, i) => ind.classList.toggle('active', i === current));
    fills.forEach((f) => gsap.set(f, { width: '0%' }));
    slides.forEach((s, i) => s.classList.toggle('active', i === current));

    if (prefersReducedMotion) {
      gsap.set(slides[prev], { opacity: 0 });
      gsap.set(slides[current], { opacity: 1, scale: 1 });
      if (captionEl) captionEl.textContent = slides[current].dataset.caption || '';
      return;
    }

    const tl = gsap.timeline();
    tl.to(slides[prev], { opacity: 0, duration: transitionDuration, ease: 'power2.inOut' }, 0);
    gsap.set(slides[current], { scale: 1 });
    tl.to(slides[current], { opacity: 1, duration: transitionDuration, ease: 'power2.inOut' }, 0);
    tl.to(slides[current], { scale: kenBurnsScale, duration: slideDuration, ease: 'none' }, 0);
    if (captionEl) {
      // Swap text at the midpoint of the image crossfade — no opacity change,
      // so there is no blink. The changing caption is barely perceptible because
      // the eye is tracking the image transition, not the small text below.
      tl.call(() => {
        captionEl.textContent = slides[current].dataset.caption || '';
      }, null, transitionDuration / 2);
    }
    startIndicatorFill();
  }

  function next() { goTo((current + 1) % slides.length); }

  if (captionEl) captionEl.textContent = slides[0].dataset.caption || '';
  indicators[0].classList.add('active');
  startIndicatorFill();
}

/* ── Hero One: Libraries of the World ── */
createSlideshow({
  slidesSelector: '#heroOne .hero-slide',
  indicatorContainerId: 'heroOneIndicators',
  captionId: 'heroOneCaption',
  taglineSelector: '#heroOne .hero-tagline',
  taglineDelay: 2000, // brief 3.1.2–3.1.3: no text for first 2s, then fade-in
  captionDelay: 2000,
  slideDuration: 7,
  transitionDuration: 1.4,
  kenBurnsScale: 1.10,
  indicatorLabel: 'Libraries of the World slide',
});

/* ── Hero Two: The Space by Arapahoe Libraries ── */
createSlideshow({
  slidesSelector: '#heroTwo .hero-slide',
  indicatorContainerId: 'heroTwoIndicators',
  captionId: 'heroTwoCaption',
  taglineSelector: '#heroTwo .hero-closing',
  taglineDelay: 1500,
  slideDuration: 6,
  transitionDuration: 1.25,
  kenBurnsScale: 1.10,
  indicatorLabel: 'The Space slide',
});

/* ── Scroll-triggered section animations ──
   More visible editorial motion: split-word reveals, drawn-in gilt underlines,
   scale entrances on cards, and a scroll-linked parallax. Respects
   prefers-reduced-motion. */
if (!prefersReducedMotion) {
  const reveal = (el, vars) => {
    if (!el) return;
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      opacity: 0, y: 40, duration: 1, ease: 'power3.out',
      ...vars,
    });
  };

  // Draw gilt underline beneath every section-heading as it enters view.
  gsap.utils.toArray('.section-heading').forEach((h) => {
    gsap.fromTo(h,
      { '--heading-rule': '0%' },
      {
        '--heading-rule': '100%',
        duration: 1.4, ease: 'power3.out', delay: 0.25,
        scrollTrigger: { trigger: h, start: 'top 82%', once: true },
      },
    );
  });

  // Narrative sections (Continuum, Current Trajectory, Trim Tab) — eyebrow,
  // heading, body paragraphs stagger in. Heading gilt underline draws in
  // via the shared .section-heading animation block above.
  gsap.utils.toArray('.narrative').forEach((section) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 82%', once: true },
    });
    const eyebrow = section.querySelector('.narrative-eyebrow');
    if (eyebrow) {
      tl.from(eyebrow, {
        opacity: 0, y: 18, duration: 0.8, ease: 'power3.out',
      });
    }
    tl.from(section.querySelector('.section-heading'), {
      opacity: 0, y: 26, duration: 1, ease: 'power3.out',
    }, eyebrow ? '-=0.5' : '0');
    // Figure reveal for sections that carry an image (Current Trajectory).
    const figure = section.querySelector('.trajectory-figure');
    if (figure) {
      tl.from(figure, {
        opacity: 0, x: -40, scale: 0.96, duration: 1.1, ease: 'power3.out',
      }, '-=0.6');
    }
    const inlineFigure = section.querySelector('.narrative-figure-block');
    if (inlineFigure) {
      tl.from(inlineFigure, {
        opacity: 0, y: 32, scale: 0.97, duration: 1.1, ease: 'power3.out',
      }, '-=0.6');
    }
    const paragraphs = section.querySelectorAll('.narrative-body p, .trajectory-copy p, .trajectory-copy .trajectory-quote');
    if (paragraphs.length) {
      tl.from(paragraphs, {
        opacity: 0, y: 22, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      }, '-=0.5');
    }
  });

  // Invitation: heading+body, signatures stagger, image sweeps in with a
  // clip-path reveal for a more apparent entrance.
  reveal(document.querySelector('#invitation .section-heading'), { y: 24, duration: 1 });
  reveal(document.querySelector('.invitation-address'), { y: 16, duration: 0.8, delay: 0.15 });
  reveal(document.querySelector('.invitation-body p:first-of-type'), { y: 24, delay: 0.25 });
  const signatories = document.querySelectorAll('#invitation .signatories .signatory');
  if (signatories.length) {
    gsap.from(signatories, {
      scrollTrigger: { trigger: signatories[0], start: 'top 88%', once: true },
      opacity: 0, y: 24, scale: 0.94, duration: 0.9, stagger: 0.15, ease: 'power3.out',
    });
  }
  const invitationImage = document.querySelector('.invitation-image');
  if (invitationImage) {
    gsap.from(invitationImage, {
      scrollTrigger: { trigger: invitationImage, start: 'top 85%', once: true },
      opacity: 0, scale: 0.94, x: 40, duration: 1.3, ease: 'power3.out',
    });
  }

  // Civilizing Claim — giant quote mark scales & rotates in, then the quote
  // reveals word-by-word, then the attribution rises.
  const claim = document.querySelector('.claim');
  if (claim) {
    const quoteEl = claim.querySelector('.claim-quote');

    // Split the quote into word spans (once, safe to re-run).
    if (quoteEl && !quoteEl.dataset.split) {
      const words = quoteEl.textContent.trim().split(/\s+/);
      quoteEl.textContent = '';
      words.forEach((w) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w;
        quoteEl.appendChild(span);
      });
      quoteEl.dataset.split = '1';
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: claim, start: 'top 72%', once: true },
    });
    // Animate the giant pseudo-quote-mark via CSS vars on .claim.
    tl.fromTo(claim,
      { '--mark-scale': 0.2, '--mark-rotate': '-18deg', '--mark-opacity': 0 },
      {
        '--mark-scale': 1, '--mark-rotate': '0deg', '--mark-opacity': 0.22,
        duration: 1.4, ease: 'back.out(1.4)',
      },
    );
    const wordSpans = quoteEl ? quoteEl.querySelectorAll('.word') : [];
    if (wordSpans.length) {
      tl.from(wordSpans, {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.07, ease: 'power3.out',
      }, '-=0.9');
    }
    tl.from(claim.querySelector('.claim-attribution'), {
      opacity: 0, y: 16, duration: 0.9, ease: 'power2.out',
    }, '-=0.3');
  }

  // The Assertion — eyebrow, heading, body paragraphs stagger in.
  const rationale = document.querySelector('.rationale');
  if (rationale) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: rationale, start: 'top 82%', once: true },
    });
    tl.from(rationale.querySelector('.rationale-eyebrow'), {
      opacity: 0, y: 18, duration: 0.8, ease: 'power3.out',
    });
    tl.from(rationale.querySelector('.section-heading'), {
      opacity: 0, y: 26, duration: 1, ease: 'power3.out',
    }, '-=0.5');
    const paragraphs = rationale.querySelectorAll('.rationale-body p');
    if (paragraphs.length) {
      tl.from(paragraphs, {
        opacity: 0, y: 22, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      }, '-=0.5');
    }
  }

  // Bridge figure between the Assertion and What We Are Building.
  const bridgeFigure = document.querySelector('.bridge-figure');
  if (bridgeFigure) {
    gsap.from(bridgeFigure, {
      scrollTrigger: { trigger: bridgeFigure, start: 'top 85%', once: true },
      opacity: 0, y: 32, scale: 0.97, duration: 1.1, ease: 'power3.out',
    });
  }

  // MVP stripes — each row's numeral flies in from the left, body rises with
  // a bigger distance than before so the stagger is clearly felt.
  gsap.utils.toArray('.offering-row').forEach((row) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: row, start: 'top 82%', once: true },
    });
    tl.from(row.querySelector('.offering-meta'), {
      opacity: 0, x: -70, duration: 1, ease: 'power3.out',
    });
    tl.from(row.querySelector('.offering-body'), {
      opacity: 0, y: 40, duration: 1, ease: 'power3.out',
    }, '-=0.65');
  });

  reveal(document.querySelector('.activating-lede'), { y: 30, duration: 1.1 });

  // Regions: header rises, then institution cards scale + lift in with stagger.
  gsap.utils.toArray('.region').forEach((region) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: region, start: 'top 80%', once: true },
    });
    tl.from(region.querySelector('.region-header'), {
      opacity: 0, x: -30, duration: 0.9, ease: 'power3.out',
    });
    const cards = region.querySelectorAll('.institution');
    if (cards.length) {
      tl.from(cards, {
        opacity: 0, y: 40, scale: 0.94, duration: 0.9,
        stagger: 0.15, ease: 'power3.out',
      }, '-=0.5');
    }
  });

  // Host benediction — rises and gently scales in.
  const host = document.querySelector('.host-acknowledgement');
  if (host) {
    gsap.from(host, {
      scrollTrigger: { trigger: host, start: 'top 84%', once: true },
      opacity: 0, y: 40, scale: 0.96, duration: 1.2, ease: 'power3.out',
    });
  }

  // Convenor — landscape figure rises first, then heading, then body paragraphs stagger.
  const convenor = document.querySelector('.convenor');
  if (convenor) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: convenor, start: 'top 78%', once: true },
    });
    tl.from(convenor.querySelector('.convenor-figure'), {
      opacity: 0, y: 32, scale: 0.97, duration: 1.1, ease: 'power3.out',
    });
    tl.from(convenor.querySelector('.section-heading'), {
      opacity: 0, y: 26, duration: 0.9, ease: 'power3.out',
    }, '-=0.6');
    tl.from(convenor.querySelectorAll('.convenor-body p'), {
      opacity: 0, y: 22, duration: 0.8, stagger: 0.08, ease: 'power3.out',
    }, '-=0.5');
  }

  // Briefing — heading draws in, lede rises, form fades with scale.
  reveal(document.querySelector('#briefing .lede'), { y: 20 });
  const briefingForm = document.querySelector('.briefing-form');
  if (briefingForm) {
    gsap.from(briefingForm, {
      scrollTrigger: { trigger: briefingForm, start: 'top 85%', once: true },
      opacity: 0, y: 30, scale: 0.98, duration: 1, ease: 'power3.out',
    });
  }

  // Footer — quiet fade.
  reveal(document.querySelector('.site-footer'), { y: 16, duration: 0.8 });

  // ── Continuous scroll-linked parallax ──
  // Hero slides drift slightly downward as the page scrolls past them —
  // creates a persistent cinematic depth cue, very visible without being
  // distracting. Applied to both heroes.
  gsap.utils.toArray('.hero').forEach((hero) => {
    const slidesWrap = hero.querySelector('.hero-slides');
    if (!slidesWrap) return;
    gsap.to(slidesWrap, {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Nav drops a subtle gilt accent underline when the page has scrolled past hero.
  ScrollTrigger.create({
    trigger: '#heroOne',
    start: 'bottom top',
    toggleClass: { targets: '.site-nav', className: 'is-scrolled' },
  });
}

/* ── Briefing form ── */
const briefingForm = document.getElementById('briefingForm');
const briefingConfirm = document.getElementById('briefingConfirm');
const briefingError = document.getElementById('briefingError');
if (briefingForm && briefingConfirm) {
  const submitButton = briefingForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : '';

  const shakeEmailInput = () => {
    if (prefersReducedMotion) return;
    const input = briefingForm.querySelector('input[type="email"]');
    if (!input) return;
    gsap.fromTo(input,
      { x: 0 },
      {
        keyframes: [
          { x: -7, duration: 0.07 },
          { x: 7,  duration: 0.1 },
          { x: -5, duration: 0.1 },
          { x: 5,  duration: 0.1 },
          { x: 0,  duration: 0.1 },
        ],
        ease: 'power1.inOut',
      });
  };

  const showError = (message) => {
    if (!briefingError) return;
    briefingError.textContent = message;
    briefingError.hidden = false;
    if (!prefersReducedMotion) {
      gsap.fromTo(briefingError,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    }
    shakeEmailInput();
  };
  const clearError = () => {
    if (!briefingError) return;
    briefingError.textContent = '';
    briefingError.hidden = true;
  };
  const revealConfirm = () => {
    if (prefersReducedMotion) {
      briefingForm.setAttribute('hidden', '');
      briefingConfirm.classList.add('is-visible');
      briefingConfirm.focus();
      return;
    }
    const tl = gsap.timeline();
    tl.to(briefingForm, { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in' });
    tl.call(() => {
      briefingForm.setAttribute('hidden', '');
      gsap.set(briefingConfirm, { opacity: 0, y: 10 });
      briefingConfirm.classList.add('is-visible');
    });
    tl.to(briefingConfirm, {
      opacity: 1, y: 0, duration: 0.45, ease: 'power3.out',
      onComplete: () => briefingConfirm.focus({ preventScroll: true }),
    });
  };
  const showConfirm = (email) => {
    briefingConfirm.textContent =
      `Thank you. We will send the briefing to ${email} shortly, with a short cover note from Arapahoe Libraries.`;
    revealConfirm();
  };

  let sendingTween = null;
  const startSendingPulse = () => {
    if (!submitButton || prefersReducedMotion) return;
    sendingTween = gsap.to(submitButton, {
      opacity: 0.55, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });
  };
  const stopSendingPulse = () => {
    if (sendingTween) { sendingTween.kill(); sendingTween = null; }
    if (submitButton) gsap.set(submitButton, { clearProps: 'opacity' });
  };

  briefingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: real users leave this empty; bots fill every field.
    // We silently show the confirm screen without submitting anywhere.
    const honeypot = briefingForm.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== '') {
      briefingConfirm.textContent = 'Thank you. Your request has been received.';
      revealConfirm();
      return;
    }

    const emailInput = briefingForm.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    if (!email || !emailInput.validity.valid) {
      showError('Please enter a valid email address.');
      emailInput.focus();
      return;
    }
    clearError();

    // Guard against submitting to the placeholder endpoint in dev/preview.
    const action = briefingForm.getAttribute('action') || '';
    if (action.includes('YOUR_FORM_ID') || action === '#' || action === '') {
      console.warn('Briefing form action is a placeholder; skipping network request.');
      showConfirm(email);
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
      startSendingPulse();
    }

    try {
      const response = await fetch(action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(briefingForm),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      stopSendingPulse();
      showConfirm(email);
    } catch (err) {
      stopSendingPulse();
      showError(
        'Sorry — we could not submit your request. Please email briefing@thelibraryai.org instead.',
      );
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}
