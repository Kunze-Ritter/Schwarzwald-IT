import { services, getService } from "../data/services.js";
import { ctaBlock } from "../components/cta-block.js";
import { site } from "../data/site.js";
import { notFound } from "./not-found.js";

export function leistungen() {
  const html = `
    <section class="page-head">
      <div class="container" data-motion-intro>
        <p class="kicker">Leistungen</p>
        <h1>Das System Schwarzwald-IT</h1>
        <p class="lead">Drei Fachbereiche, die ineinandergreifen – plus Managed
        Services, die das ganze System am Laufen halten. Jede Leistung wirkt erst
        im Zusammenspiel richtig.</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="card-grid" data-motion-reveal-group>
          ${services
            .map(
              (s) => `
            <a class="card" href="/leistungen/${s.slug}/">
              <p class="kicker">${s.kicker}</p>
              <h2 class="h3">${s.title}</h2>
              <p>${s.short}</p>
              <span class="text-link">Mehr erfahren →</span>
            </a>`
            )
            .join("")}
        </div>
      </div>
    </section>
    ${ctaBlock()}
  `;
  return {
    title: "Leistungen – IT-Infrastruktur, Sicherheit, Computing, Managed Services",
    description:
      "Die Leistungen von Schwarzwald-IT: IT-Infrastruktur, IT-Sicherheit, Computing und Managed Services – als System, das ineinandergreift.",
    html,
  };
}

export function leistungDetail(slug) {
  const s = getService(slug);
  if (!s) return notFound();

  const others = services.filter((o) => o.slug !== s.slug && o.node);

  const html = `
    <section class="page-head">
      <div class="container" data-motion-intro>
        <p class="kicker">${s.kicker}</p>
        <h1>${s.title}</h1>
        <p class="lead">${s.short}</p>
      </div>
    </section>

    <section class="section section--pains" aria-label="Typische Probleme">
      <div class="container">
        <ul class="pain-list" data-motion-reveal-group>
          ${s.pains.map((p) => `<li>„${p}"</li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container container--narrow" data-motion-reveal>
        <h2>Unsere Lösung</h2>
        <p class="lead">${s.system}</p>
        <ul class="check-list">
          ${s.bullets.map((b) => `<li>${b}</li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container" data-motion-reveal>
        <h2>Im System wirksam</h2>
        <p class="lead">${s.title} entfaltet die volle Wirkung erst im Zusammenspiel
        mit den anderen Fachbereichen:</p>
        <div class="card-grid card-grid--small" data-motion-reveal-group>
          ${others
            .map(
              (o) => `
            <a class="card" href="/leistungen/${o.slug}/">
              <h3 class="h4">${o.title}</h3>
              <p>${o.short}</p>
              <span class="text-link">Zum Bereich →</span>
            </a>`
            )
            .join("")}
        </div>
      </div>
    </section>

    ${ctaBlock()}
  `;

  return {
    title: s.title,
    description: s.short,
    html,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.title,
      description: s.short,
      provider: { "@type": "LocalBusiness", name: site.name, url: site.baseUrl },
      areaServed: site.regions,
    },
  };
}
