import { ctaBlock } from "../components/cta-block.js";

// Platzhalter – Artikel folgen aus der Notion-Content-Planung
// (z. B. „Interne IT vs. Managed Services: Kostenvergleich").
export function ratgeber() {
  const html = `
    <section class="page-head">
      <div class="container" data-motion-intro>
        <p class="kicker">Ratgeber</p>
        <h1>IT-Wissen für Entscheider</h1>
        <p class="lead">Ehrliche Antworten auf die Fragen, die sich Geschäftsführung
        und IT-Verantwortliche wirklich stellen – ohne Fachjargon.</p>
      </div>
    </section>
    <section class="section">
      <div class="container container--narrow" data-motion-reveal>
        <p>Die ersten Artikel sind in Arbeit, unter anderem:</p>
        <ul class="check-list">
          <li>Interne IT vs. Managed Services: Was kostet was wirklich?</li>
          <li>Backup ist kein Konzept: Worauf es im Ernstfall ankommt</li>
          <li>E-Mail-Archivierung: Was ist Pflicht – und wie löst man es pragmatisch?</li>
        </ul>
      </div>
    </section>
    ${ctaBlock()}
  `;
  return {
    title: "Ratgeber",
    description:
      "IT-Ratgeber von Schwarzwald-IT: verständliche Antworten zu Managed Services, Backup, E-Mail-Archivierung und IT-Sicherheit.",
    html,
  };
}
