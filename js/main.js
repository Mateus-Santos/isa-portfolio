// =====================================================================
// Isadora Olimpio — Portfólio | main.js
// Menu responsivo, scroll spy, abas de experiência, reveal on scroll,
// trilha de progresso de leitura.
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    // fecha o menu ao clicar em um link (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- scroll spy: destaca o link da seção ativa ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[data-link]');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyObserver.observe(sec));

  /* ---------- abas de experiência ---------- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      tabPanels.forEach(panel => {
        panel.classList.toggle('is-active', panel.id === `tab-${target}`);
      });

      // revela os cards recém-exibidos
      document.querySelectorAll(`#tab-${target} .reveal`).forEach(el => {
        el.classList.add('is-visible');
      });
    });
  });

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- trilha de progresso de leitura ---------- */
  const trailFill = document.getElementById('trailFill');
  const updateTrail = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (trailFill) trailFill.style.width = `${Math.min(pct, 100)}%`;
  };
  updateTrail();
  window.addEventListener('scroll', updateTrail, { passive: true });
  window.addEventListener('resize', updateTrail);

  /* ---------- header: sombra sutil ao rolar ---------- */
  const header = document.getElementById('siteHeader');
  const toggleHeaderShadow = () => {
    if (!header) return;
    header.style.boxShadow = window.scrollY > 8 ? '0 8px 24px -18px rgba(47,68,56,.5)' : 'none';
  };
  toggleHeaderShadow();
  window.addEventListener('scroll', toggleHeaderShadow, { passive: true });

});
