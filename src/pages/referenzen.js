import { referenzen } from "../data/referenzen.js";
import { ctaBlock } from "../components/cta-block.js";

export function referenzenPage() {
  const html = `
    <section class="page-head">
      <div class="container" data-motion-intro>
        <p class="kicker">Referenzen</p>
        <h1>Ergebnisse statt Versprechen</h1>
        <p class="lead">Was Unternehmen aus der Region über die Zusammenarbeit
        mit uns sagen.</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="quote-grid" data-motion-reveal-group>
          ${referenzen
            .map(
              (r) => `
            <blockquote class="quote">
              <p>„${r.quote}"</p>
              <footer>${r.author} · ${r.company}</footer>
            </blockquote>`
            )
            .join("")}
        </div>
      </div>
    </section>
    ${ctaBlock()}
  `;
  return {
    title: "Referenzen",
    description:
      "Kundenstimmen zu Schwarzwald-IT: Managed Services, Backup-Konzepte und IT-Betreuung für Unternehmen in Südbaden.",
    html,
  };
}
