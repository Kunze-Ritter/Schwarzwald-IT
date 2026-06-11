export function notFound() {
  return {
    title: "Seite nicht gefunden",
    description: "Die angeforderte Seite existiert nicht.",
    html: `
      <section class="page-head"><div class="container">
        <p class="kicker">Fehler 404</p>
        <h1>Diese Seite gibt es nicht.</h1>
        <p class="lead">Vielleicht hilft Ihnen einer dieser Wege weiter:</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="/">Zur Startseite</a>
          <a class="btn btn--ghost" href="/leistungen/">Leistungen</a>
        </div>
      </div></section>
    `,
  };
}
