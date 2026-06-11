import { site } from "../data/site.js";

export function ctaBlock() {
  return `
    <section class="section section--cta">
      <div class="container" data-motion-reveal>
        <h2>Lassen Sie uns über Ihre IT sprechen.</h2>
        <p class="lead">15 Minuten, eine ehrliche Einschätzung, keine Verkaufsshow.</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="/kontakt/">Kostenloses Erstgespräch</a>
          <a class="btn btn--ghost" href="tel:${site.phone.replace(/[\s/]/g, "")}">${site.phoneDisplay}</a>
        </div>
      </div>
    </section>
  `;
}
