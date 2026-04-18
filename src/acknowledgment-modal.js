import { gsap } from 'gsap';
import { acknowledgmentHTML, wireAcknowledgmentImage } from './acknowledgment-content.js';

const FLAG = 'acknowledgmentShown';
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function initAcknowledgmentModal({ force = false } = {}) {
  if (!force) {
    try {
      if (sessionStorage.getItem(FLAG) === 'true') return;
    } catch { /* storage blocked — still show the modal */ }
  }

  const triggerEl = document.activeElement;
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlay = document.createElement('div');
  overlay.className = 'ack-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const dialog = document.createElement('div');
  dialog.className = 'ack-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'ackTitle');
  dialog.tabIndex = -1;

  dialog.innerHTML = `
    <div class="ack-scroll">
      ${acknowledgmentHTML({ titleId: 'ackTitle', headingLevel: 'h2' })}
    </div>
    <div class="ack-actions">
      <button type="button" class="ack-dismiss">Enter with respect</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  wireAcknowledgmentImage(dialog);

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const dismissBtn = dialog.querySelector('.ack-dismiss');

  // Focus trap — keep keyboard focus inside the dialog while open.
  const trapFocus = (e) => {
    if (e.key !== 'Tab') return;
    const focusables = dialog.querySelectorAll(FOCUSABLE);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const close = () => {
    document.removeEventListener('keydown', onKeyDown);
    overlay.removeEventListener('click', onOverlayClick);
    dismissBtn.removeEventListener('click', close);

    try { sessionStorage.setItem(FLAG, 'true'); } catch { /* ignore */ }

    const restoreAndRemove = () => {
      document.body.style.overflow = previousOverflow;
      overlay.remove();
      if (triggerEl && typeof triggerEl.focus === 'function') {
        triggerEl.focus();
      }
    };

    if (prefersReducedMotion) {
      restoreAndRemove();
      return;
    }
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: restoreAndRemove,
    });
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else {
      trapFocus(e);
    }
  };
  const onOverlayClick = (e) => {
    if (e.target === overlay) close();
  };

  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', onOverlayClick);
  dismissBtn.addEventListener('click', close);

  // Enter — fade in overlay, then gently reveal dialog.
  if (prefersReducedMotion) {
    overlay.style.opacity = '1';
    dialog.style.opacity = '1';
    dialog.style.transform = 'none';
  } else {
    gsap.set(overlay, { opacity: 0 });
    gsap.set(dialog, { opacity: 0, y: 18 });
    const tl = gsap.timeline();
    tl.to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    tl.to(dialog, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.25');
  }

  // Focus the dismiss button once the dialog is in.
  requestAnimationFrame(() => {
    dismissBtn.focus({ preventScroll: true });
  });
}
