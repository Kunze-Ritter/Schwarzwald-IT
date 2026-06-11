export function faqSection(items, heading = "Häufige Fragen") {
  return `
    <section class="section section--faq">
      <div class="container container--narrow">
        <div class="section-head" data-motion-reveal>
          <h2>${heading}</h2>
        </div>
        <div data-motion-reveal-group>
          ${items
            .map(
              (f) => `
            <details class="faq-item">
              <summary>${f.q}</summary>
              <p>${f.a}</p>
            </details>`
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
