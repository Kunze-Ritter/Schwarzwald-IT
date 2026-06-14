import { site } from "../data/site.js";
import { ctaBlock } from "../components/cta-block.js";

export function ueberUns() {
  const html = `
    <section class="page-head">
      <div class="container" data-motion-intro>
        <p class="kicker">Über uns</p>
        <h1>Bodenständig aus Freiburg. IT auf Augenhöhe.</h1>
        <p class="lead">Schwarzwald-IT ist die IT-Marke der ${site.legalName} –
        einem Familienunternehmen, das seit 1983 Unternehmen in der Region begleitet.</p>
      </div>
    </section>

    <section class="section">
      <div class="container" data-motion-reveal>
        <img src="/images/team.png" alt="Das Team von Schwarzwald-IT"
          style="border-radius:8px;border:1px solid var(--border-subtle);width:100%;max-height:520px;object-fit:cover" loading="lazy" />
      </div>
    </section>

    <section class="section section--alt">
      <div class="container container--narrow" data-motion-reveal>
        <h2>Unsere Geschichte</h2>
        <p>1983 in Freiburg gegründet, ist Kunze & Ritter seit über 40 Jahren
        verlässlicher Partner für Druck-, Dokumenten- und IT-Lösungen in Südbaden
        und Stuttgart. 2019 haben wir unsere IT-Kompetenz unter der Marke
        Schwarzwald-IT gebündelt: Netzwerktechnik, IT-Sicherheit, E-Mail- und
        Client-Management – heute betreut von einem eigenen Team mit rund 60
        Kolleginnen und Kollegen in der Region.</p>
        <h2>Wofür wir stehen</h2>
        <ul class="check-list">
          <li><strong>Keine Standardlösungen:</strong> Konzepte, die zu Ihrem
          Unternehmen passen – „weil Standard keine Option ist".</li>
          <li><strong>Persönlich & erreichbar:</strong> Feste Ansprechpartner,
          die Ihre Umgebung kennen.</li>
          <li><strong>Ehrlich beraten:</strong> Wir empfehlen, was Sie brauchen –
          nicht, was am meisten bringt.</li>
          <li><strong>Regional verwurzelt:</strong> Vor Ort in ${site.regions.join(", ")}.</li>
        </ul>
        <!-- TODO: Echte Teamfotos und Ansprechpartner-Portraits ergänzen (lokal gehostet). -->
      </div>
    </section>
    ${ctaBlock()}
  `;
  return {
    title: "Über uns – die IT-Marke von Kunze & Ritter",
    description:
      "Schwarzwald-IT ist die IT-Marke der Kunze & Ritter GmbH aus Freiburg: über 40 Jahre Erfahrung, rund 60 Mitarbeitende, persönlich und regional.",
    html,
  };
}
