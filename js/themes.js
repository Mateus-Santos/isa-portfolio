// Isadora Portfolio AT V3: tema padrão azul serenity, alternativas escuro/original.
// Executar no <head> evita flash da paleta incorreta antes da pintura da página.
(() => {
  'use strict';
  const STORAGE_KEY = 'isa-portfolio-theme';
  const THEMES = Object.freeze({
    serenity: { label: 'Azul serenity', bar: '#294D70' },
    dark: { label: 'Escuro', bar: '#0F1825' },
    original: { label: 'Verde original', bar: '#2F4438' }
  });
  const root = document.documentElement;
  let saved = null;
  try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (_) { /* armazenamento bloqueado */ }
  let selected = Object.prototype.hasOwnProperty.call(THEMES, saved) ? saved : 'serenity';
  root.dataset.theme = selected;
  const updateThemeColor = () => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEMES[selected].bar);
  };
  const init = () => {
    const picker = document.getElementById('themePicker');
    const toggle = document.getElementById('themeToggle');
    const options = document.getElementById('themeOptions');
    const buttons = [...document.querySelectorAll('[data-theme-choice]')];
    updateThemeColor();
    if (!picker || !toggle || !options || buttons.length !== 3) return;

    const close = (restoreFocus = false) => {
      options.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus();
    };
    const sync = () => {
      root.dataset.theme = selected;
      updateThemeColor();
      buttons.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.themeChoice === selected)));
      toggle.setAttribute('aria-label', `Tema atual: ${THEMES[selected].label}. Selecionar cores`);
    };
    toggle.addEventListener('click', () => {
      const shouldOpen = options.hidden;
      options.hidden = !shouldOpen;
      toggle.setAttribute('aria-expanded', String(shouldOpen));
      if (shouldOpen) {
        const active = buttons.find(btn => btn.dataset.themeChoice === selected);
        if (active) active.focus();
      }
    });
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.themeChoice;
        if (!Object.prototype.hasOwnProperty.call(THEMES, next)) return;
        selected = next;
        try { window.localStorage.setItem(STORAGE_KEY, selected); } catch (_) { /* opcional */ }
        sync();
        close(true);
      });
    });
    document.addEventListener('pointerdown', event => {
      if (!options.hidden && !picker.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !options.hidden) {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      }
    });
    sync();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
