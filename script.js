/* ============================================
   Landing Auxílio-Acidente
   - WhatsApp links com mensagem pré-preenchida
   - Tracking de eventos
   - Banner LGPD
   - Reveal on scroll
   ============================================ */

(function () {
  'use strict';

  var WA_NUMBER = '5544999969598';
  var WA_MESSAGE = 'Olá! Vi a página sobre auxílio-acidente e gostaria de tirar uma dúvida.';

  function buildWaUrl() {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(WA_MESSAGE);
  }

  // ===== WhatsApp links =====
  var waLinks = document.querySelectorAll('[data-wa]');
  var waUrl = buildWaUrl();
  waLinks.forEach(function (el) {
    el.setAttribute('href', waUrl);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.addEventListener('click', function () {
      track('whatsapp_click', { source: el.closest('section')?.id || 'header' });
    });
  });

  // ===== FAQ tracking =====
  document.querySelectorAll('[data-faq]').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        var question = item.querySelector('summary')?.childNodes[0]?.textContent?.trim() || '';
        track('faq_open', { question: question });
      }
    });
  });

  // ===== Scroll 75% =====
  var scroll75Sent = false;
  window.addEventListener('scroll', function () {
    if (scroll75Sent) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    if (max <= 0) return;
    var pct = (window.scrollY || doc.scrollTop) / max;
    if (pct >= 0.75) {
      scroll75Sent = true;
      track('scroll_75', {});
    }
  }, { passive: true });

  // ===== Tracking helper =====
  function track(name, params) {
    try {
      if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, params || {}));
      if (window.gtag) window.gtag('event', name, params || {});
      if (window.fbq) window.fbq('trackCustom', name, params || {});
    } catch (e) { /* noop */ }
  }

  // ===== Reveal on scroll =====
  var revealEls = document.querySelectorAll('.section, .card, .req-card, .step-card, .faq-item, .lawyer-card');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio >= 0.3) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: [0, 0.3] });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ===== LGPD banner =====
  var STORAGE_KEY = 'jsa_cookie_consent_v1';
  var banner = document.getElementById('cookieBanner');
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage off */ }

  if (banner && !stored) {
    banner.hidden = false;
  }

  document.getElementById('cookieAccept')?.addEventListener('click', function () {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch (e) {}
    if (banner) banner.hidden = true;
    track('cookie_consent', { value: 'accepted' });
  });

  document.getElementById('cookieReject')?.addEventListener('click', function () {
    try { localStorage.setItem(STORAGE_KEY, 'rejected'); } catch (e) {}
    if (banner) banner.hidden = true;
    track('cookie_consent', { value: 'rejected' });
  });

})();
