import { site } from "../data/site.js";

export function ctaBlock() {
  return `
    <section class="section section--cta">
      <div class="container container--narrow" data-motion-reveal>
        <p class="kicker" style="color:var(--cyan)">Erstgespräch</p>
        <h2>Lassen Sie uns über Ihre IT sprechen.</h2>
        <p class="lead">15 Minuten, eine ehrliche Einschätzung, keine Verkaufsshow.</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="/kontakt/">Kostenloses Erstgespräch <span class="arrow">→</span></a>
          <a class="btn btn--ghost-light" href="tel:${site.phone.replace(/[\s/]/g, "")}">${site.phoneDisplay}</a>
        </div>
      </div>
    </section>
  `;
}
