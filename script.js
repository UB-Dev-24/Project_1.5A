/* script.js
   Shared site interactions for the enhanced modern website
   - toggleMenu() is exported to window for inline usage in HTML
   - mobile nav, active link, smooth scroll, lazy images, reveal animations
   - simple contact demo (frontend-only)
*/

(() => {
  // Utilities
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from((scope || document).querySelectorAll(sel));

  /* -------------------------
     Mobile menu (global)
  ------------------------- */
  function toggleMenu() {
    const nav = $('.nav-links');
    if (!nav) return;
    nav.classList.toggle('show');
  }
  // export for inline onclick handlers (some pages use onclick="toggleMenu()")
  window.toggleMenu = toggleMenu;

  /* -------------------------
     Close mobile nav when clicking a nav link
  ------------------------- */
  function setupNavLinksClose() {
    const navLinks = $$('.nav-links a');
    navLinks.forEach(a => a.addEventListener('click', () => {
      const nav = $('.nav-links');
      if (nav && nav.classList.contains('show')) nav.classList.remove('show');
    }));
  }

  /* -------------------------
     Active nav highlight by filename
  ------------------------- */
  function setActiveNav() {
    const links = $$('.nav-links a');
    const path = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      // normalize href (could be "index.html" or "index.html#foo")
      const href = (a.getAttribute('href') || '').split('#')[0].split('/').pop();
      if (!href) return;
      if (href === path || (href === 'index.html' && path === '')) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  /* -------------------------
     Smooth scroll for in-page anchors
  ------------------------- */
  function setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const el = e.target;
      if (!el || !el.matches) return;
      if (el.matches('a[href^="#"]')) {
        const href = el.getAttribute('href');
        if (!href || href.length === 1) return; // ignore plain '#'
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // close mobile nav if open
          const nav = $('.nav-links');
          if (nav && nav.classList.contains('show')) nav.classList.remove('show');
        }
      }
    });
  }

  /* -------------------------
     Lazy-loading images (data-src)
  ------------------------- */
  function lazyLoadImages() {
    const imgs = $$('img[data-src]');
    if (!imgs.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.addEventListener('load', () => img.classList.add('loaded'));
          }
          obs.unobserve(img);
        });
      }, { rootMargin: '200px 0px' });
      imgs.forEach(i => io.observe(i));
    } else {
      // fallback
      imgs.forEach(img => {
        const src = img.dataset.src;
        if (src) img.src = src;
      });
    }
  }

  /* -------------------------
     Reveal animations for .fade-up using IntersectionObserver
  ------------------------- */
  function revealOnScroll() {
    const items = $$('.fade-up');
    if (!items.length) return;

    // If IntersectionObserver supported, animate on appear
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('in'); // CSS may use .in or .delay-* classes already
          obs.unobserve(el);
        });
      }, { threshold: 0.12 });
      items.forEach(it => io.observe(it));
    } else {
      // fallback: show all
      items.forEach(it => it.classList.add('in'));
    }
  }

  /* -------------------------
     Basic contact demo (works with form#contact-form OR .contact-form section)
     - If there's a real backend later, replace the simulated send with fetch()
  ------------------------- */
  function setupContactDemo() {
    // prefer real <form id="contact-form">
    const form = $('#contact-form');
    if (form) {
      const status = $('#form-status') || document.createElement('div');
      if (!form.contains(status)) status.id = 'form-status';
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        status.textContent = '';
        const data = new FormData(form);
        const name = (data.get('name') || '').trim();
        const email = (data.get('email') || '').trim();
        const message = (data.get('message') || '').trim();

        if (!name || name.length < 2) { status.textContent = 'Please enter your name (2+ chars).'; return; }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) { status.textContent = 'Please enter a valid email.'; return; }
        if (!message || message.length < 10) { status.textContent = 'Message should be 10+ characters.'; return; }

        status.textContent = 'Sending…';
        try {
          // Simulate network
          await new Promise(r => setTimeout(r, 900));
          status.textContent = 'Thanks — your message was sent (demo).';
          form.reset();
        } catch (err) {
          status.textContent = 'Something went wrong — please try again later.';
        }
      });
      return;
    }

    // fallback: .contact-form section with inputs + button
    const section = $('.contact-form');
    if (!section) return;

    // try to find inputs inside section
    const inputs = Array.from(section.querySelectorAll('input, textarea'));
    const btn = section.querySelector('button') || section.querySelector('input[type="submit"]');
    if (!btn || !inputs.length) return;

    // status element
    let statusEl = section.querySelector('.form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'form-status';
      section.appendChild(statusEl);
    }

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      statusEl.textContent = '';

      // basic validation: pick first input as name, second as email, third as message (best-effort)
      const val = (el) => (el && el.value) ? el.value.trim() : '';
      const name = val(inputs[0]);
      const email = val(inputs[1]) || '';
      const message = (inputs[2] && inputs[2].value) ? inputs[2].value.trim() : '';

      if (!name || name.length < 2) { statusEl.textContent = 'Please enter your name (2+ chars).'; return; }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) { statusEl.textContent = 'Please enter a valid email.'; return; }
      if (!message || message.length < 10) { statusEl.textContent = 'Message should be 10+ characters.'; return; }

      statusEl.textContent = 'Sending…';
      try {
        await new Promise(r => setTimeout(r, 800));
        statusEl.textContent = 'Thanks — your message was sent (demo).';
        inputs.forEach(i => { if (i.tagName.toLowerCase() === 'input' || i.tagName.toLowerCase() === 'textarea') i.value = ''; });
      } catch (err) {
        statusEl.textContent = 'Something went wrong — please try again later.';
      }
    });
  }

  /* -------------------------
     Escape key closes mobile nav
  ------------------------- */
  function setupEscapeClose() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const nav = $('.nav-links');
        if (nav && nav.classList.contains('show')) nav.classList.remove('show');
      }
    });
  }

  /* -------------------------
     Init on DOM ready
  ------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    try {
      setupNavLinksClose();
      setActiveNav();
      setupSmoothScroll();
      lazyLoadImages();
      revealOnScroll();
      setupContactDemo();
      setupEscapeClose();
    } catch (err) {
      // prevent script crash affecting page; log for debugging
      // eslint-disable-next-line no-console
      console.error('Initialization error in script.js:', err);
    }
  });

  // expose a small API in case you want to call functions from console
  window.__siteUtils = {
    toggleMenu,
    setActiveNav,
    lazyLoadImages,
    revealOnScroll
  };

})();