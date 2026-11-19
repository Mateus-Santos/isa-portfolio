// Isadora Olimpio | Portfólio AT V2
// JavaScript progressivo: a página continua legível sem animações ou JS.
(() => {
  'use strict';
  const ready = () => {
    const root = document.documentElement;
    const header = document.getElementById('siteHeader');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const year = document.getElementById('year');
    const trailFill = document.getElementById('trailFill');
    const mobileQuery = window.matchMedia('(max-width: 1080px)');

    if (year) year.textContent = String(new Date().getFullYear());

    const isMenuOpen = () => !!navLinks?.classList.contains('is-open');
    const setMenu = (open, restoreFocus = false) => {
      if (!navLinks || !navToggle) return;
      const shouldOpen = !!open && mobileQuery.matches;
      navLinks.classList.toggle('is-open', shouldOpen);
      document.body.classList.toggle('nav-open', shouldOpen);
      navToggle.setAttribute('aria-expanded', String(shouldOpen));
      navToggle.setAttribute('aria-label', shouldOpen ? 'Fechar menu' : 'Abrir menu');
      if (!shouldOpen && restoreFocus) navToggle.focus();
    };

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => setMenu(!isMenuOpen()));
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenu(false));
      });
      document.addEventListener('click', event => {
        if (isMenuOpen() && !header?.contains(event.target)) setMenu(false);
      });
      document.addEventListener('keydown', event => {
        if (!isMenuOpen()) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          setMenu(false, true);
        }
        if (event.key === 'Tab') {
          const targets = [navToggle, ...navLinks.querySelectorAll('a')].filter(Boolean);
          const current = targets.indexOf(document.activeElement);
          if (event.shiftKey && current === 0) {
            event.preventDefault();
            targets[targets.length - 1].focus();
          } else if (!event.shiftKey && current === targets.length - 1) {
            event.preventDefault();
            targets[0].focus();
          }
        }
      });
      const handleViewportChange = () => setMenu(false);
      mobileQuery.addEventListener('change', handleViewportChange);
    }

    // Abas com semântica acessível (ARIA + teclado) e conteúdo visível por padrão.
    const tabs = [...document.querySelectorAll('[role="tab"][data-tab]')];
    const panels = [...document.querySelectorAll('[role="tabpanel"]')];
    const activateTab = (target, focus = false) => {
      const selected = tabs.find(tab => tab.dataset.tab === target);
      if (!selected) return;
      tabs.forEach(tab => {
        const active = tab === selected;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach(panel => {
        const active = panel.id === `tab-${target}`;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
        if (active) panel.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      });
      if (focus) selected.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab.dataset.tab));
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activateTab(tabs[next].dataset.tab, true);
      });
    });
    if (tabs.length) activateTab(tabs.find(tab => tab.classList.contains('is-active'))?.dataset.tab || tabs[0].dataset.tab);

    // Revelação é progressiva, sem ocultar conteúdo caso JS esteja desligado.
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('js-enhanced');
      const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.reveal').forEach(el => {
        if (el.closest('[hidden]')) return;
        revealObserver.observe(el);
      });
    }

    // Marcador de seção ativa e trilha superior. Scroll listener é passivo e otimizado.
    const navAnchors = [...document.querySelectorAll('.nav-links a[data-link]')];
    const sections = [...document.querySelectorAll('main section[id]')];
    let scheduled = false;
    const updateScrollUI = () => {
      scheduled = false;
      const scrollY = window.scrollY || 0;
      const docHeight = root.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, scrollY / docHeight * 100)) : 0;
      if (trailFill) trailFill.style.width = `${pct}%`;
      if (header) header.classList.toggle('is-scrolled', scrollY > 8);
      if (!sections.length) return;
      const offset = (header?.offsetHeight || 76) + 120;
      let active = sections[0].id;
      sections.forEach(sec => {
        if (sec.getBoundingClientRect().top <= offset) active = sec.id;
      });
      if (docHeight > 0 && scrollY >= docHeight - 3) active = sections[sections.length - 1].id;
      navAnchors.forEach(anchor => {
        const selected = anchor.getAttribute('href') === `#${active}`;
        anchor.classList.toggle('is-active', selected);
        if (selected) anchor.setAttribute('aria-current', 'location');
        else anchor.removeAttribute('aria-current');
      });
    };
    const scheduleScrollUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(updateScrollUI);
    };
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollUpdate);
    scheduleScrollUpdate();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
