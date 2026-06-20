(function () {
  const html = `
  <section class="section contact" id="kontakt">
    <div class="container">
      <h2 class="section__title">Kontakt</h2>
      <p class="contact__lead">Masz projekt lub chcesz pogadać o współpracy?</p>
      <a href="mailto:twoj@email.com" class="contact__email">twoj@email.com</a>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <span>2026 Miłosz Kawczyński</span>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('beforeend', html);
})();