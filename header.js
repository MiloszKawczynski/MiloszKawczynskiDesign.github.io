(function () {
  const BASE = '/miloszkawczynskidesign.github.io';

  const html = `
  <header class="header">
    <div class="container">
      <div class="nav">
        <a href="${BASE}/index.html" class="nav__logo">Miłosz Kawczyński</a>
        <div class="mode-toggle" id="modeToggle" role="switch" aria-checked="false" aria-label="Tryb: Design / Programming" tabindex="0">
          <span class="mode-toggle__label">💡 Design</span>
          <div class="mode-toggle__track">
            <div class="mode-toggle__thumb"></div>
          </div>
          <span class="mode-toggle__label">Programming 💻</span>
        </div>
        <nav class="tabs" role="tablist">
          <a href="about.html"   class="tab" role="tab">O mnie</a>
          <a href="${BASE}/index.html#projekty" class="tab" role="tab">Projekty</a>
          <a href="${BASE}/index.html#kontakt"  class="tab" role="tab">Kontakt</a>
        </nav>
      </div>
    </div>
  </header>`;

  document.body.insertAdjacentHTML('afterbegin', html);

  const savedMode = localStorage.getItem('portfolio-mode') ?? 'design';
  document.body.classList.toggle('mode--programming', savedMode === 'programming');

  function initToggle() {
    const toggle = document.getElementById('modeToggle');
    if (!toggle) return;

    toggle.setAttribute('aria-checked', String(savedMode === 'programming'));

    toggle.addEventListener('click', () => {
      const next = document.body.classList.contains('mode--programming') ? 'design' : 'programming';
      document.body.classList.toggle('mode--programming', next === 'programming');
      toggle.setAttribute('aria-checked', String(next === 'programming'));
      localStorage.setItem('portfolio-mode', next);
      document.dispatchEvent(new CustomEvent('modechange', { detail: { mode: next } }));
    });

    toggle.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle.click(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }
})();