# Schwarzwald-IT – Website-Konzept (Content, Struktur, Sitemap)

> Planungsdokument für den Relaunch von [schwarzwald-it.com](https://schwarzwald-it.com/).
> Stack-Vorbild: [Fewo-Roesslewald](https://github.com/Kunze-Ritter/Fewo-Roesslewald) (Vite-Prototyp → spätere WordPress/Etch-Migration).

---

## 1. Recherche-Basis: Wer ist Schwarzwald-IT?

### Unternehmen
- **Schwarzwald-IT** ist die 2019 gestartete **IT-Marke der Kunze & Ritter GmbH** (Familienunternehmen seit 1983, ca. 60 Mitarbeitende).
- **Standorte:** Freiburg (Christaweg 44, 79114 Freiburg), Kirchzarten, Villingen-Schwenningen; Einzugsgebiet Südbaden, Schwarzwald-Baar, Bodensee, Stuttgart.
- **Zielgruppe:** **ausschließlich B2B** – Mittelstand, der digitalisieren, absichern und entlasten will. Keine Privatkunden.
- **Slogan-Welt (K&R):** „Weil Standard keine Option ist."

### Positionierung (aus Website & Notion-Unternehmensprofil)
- Nicht nur „IT am Laufen halten", sondern **strategischer Partner für die Digitalisierung**.
- Individuelle IT-Konzepte mit optimalem Preis-Leistungs-Verhältnis.
- **Integration passender Fördermaßnahmen** für Digitalisierungsvorhaben (starker, seltener USP!).
- Schnelle Reaktionszeiten, **persönliche Ansprechpartner**, eigenes Support-Team.
- Regional verwurzelt, bodenständig + technologisch modern („nicht altbacken").

### Leistungsbereiche (konsolidiert aus Website, kunze-ritter.com und PowerPoint)
Die PowerPoint des Kollegen definiert die **drei Fachbereiche**, die ineinandergreifen:

| Fachbereich | Inhalt | Kernaussage (aus PPT) |
|---|---|---|
| **IT-Infrastruktur** | Netzwerke, Server, Cloud-Anbindungen (u. a. terra cloud) | „Das Fundament des IT-Betriebs – erst auf stabiler Basis greifen Security und Computing zuverlässig ineinander." |
| **IT-Sicherheit** | Firewall, Backup, E-Mail-Management (REDDOXX: Archivierung, Anti-Spam, Signatur, Verschlüsselung), Informationssicherheit | „Greift schützend in alle Bereiche ein – verhindert Stillstand, minimiert Risiken, hält die IT sicher in Bewegung." |
| **Computing** | Arbeitsplätze, Anwendungen, Cloud-Services, Client-Management (baramundi) | „Macht IT im Arbeitsalltag erleb- und nutzbar – produktives Arbeiten ohne Reibungsverluste." |

Querschnitt über alle drei: **Managed Services** (durchdachte Managed-Konzepte, Wartung zuverlässig & kosteneffizient).

**Partner/Hersteller:** terra cloud, HP, REDDOXX, baramundi (Basis für SEO-Partnerseiten).

**Referenzen (über K&R):** Pleuler Industrie, Nachsorgeklinik Tannheim, GSV Service GmbH, AWT Peters GmbH, Payroll Service GmbH, Schreinerei Villinger, Gantert & Krebs.

### Brand Voice (aus Notion „Unternehmensprofil" – gilt verbindlich)
- Modernes **„Sie"**, kein Behördendeutsch.
- **Problem → Lösung → Beweis** statt Feature-Aufzählung.
- Bodenständig (ehrlich, direkt, verlässlich) × modern (kompetent, zukunftsorientiert).
- Nur Leistungen nennen, die im Portfolio sind. Kein B2C.

---

## 2. Sitemap

```
schwarzwald-it.com
│
├── /                                  Startseite
│
├── /leistungen/                       Leistungsübersicht („Das System Schwarzwald-IT")
│   ├── /leistungen/it-infrastruktur/  Netzwerk · Server · Cloud
│   ├── /leistungen/it-sicherheit/     Security · Backup · E-Mail-Management
│   ├── /leistungen/computing/         Arbeitsplatz · Anwendungen · Client-Management
│   └── /leistungen/managed-services/  Der Querschnitt: IT-Betrieb als Service
│
├── /ueber-uns/                        Team, Geschichte (K&R seit 1983), Region, Werte
├── /referenzen/                       Kundenstimmen & Case Studies
│   └── /referenzen/<kunde>/           Einzelne Case Study (optional, Phase 2)
│
├── /ratgeber/                         Blog/Wissen (Top-Funnel & LEO)
│   └── /ratgeber/<slug>/              z. B. „Interne IT vs. Managed Services"
│
├── /partner/<marke>/                  SEO-Silos: terra-cloud, hp, reddoxx, baramundi
│
├── /kontakt/                          Kontakt + Erstgespräch buchen
├── /support/                          Fernwartung, Ticket, Hotline (für Bestandskunden)
│
├── /impressum/
└── /datenschutz/
```

**Prinzipien dahinter:**
- **Flach (max. 2 Ebenen):** Jede Leistung in 2 Klicks erreichbar.
- **Drei Säulen + Managed Services** spiegeln exakt die PPT-Logik – die Navigation erzählt dieselbe Geschichte wie die Visualisierung.
- **/support getrennt von /kontakt:** Bestandskunden (Ticket/Fernwartung) und Interessenten (Erstgespräch) haben unterschiedliche Jobs – nicht mischen.
- **Partnerseiten** fangen Suchanfragen wie „REDDOXX Partner Freiburg" ab (Siloing-Empfehlung aus dem Notion-SEO-Profil).
- **/ratgeber** bedient Informational-Keywords („IT-Systemhaus Schwarzwald", „Interne IT vs. Managed Services Kosten") und LLM-Zitierfähigkeit (FAQ + Schema.org).

---

## 3. Startseite – Sektionsplan

| # | Sektion | Inhalt & Zweck |
|---|---|---|
| 1 | **Hero** | Klarer Nutzen statt Buzzword: z. B. „IT, die einfach läuft. Für den Mittelstand in Südbaden." Sub: strategischer Partner statt Feuerwehr. CTA primär: **„Kostenloses Erstgespräch"**, sekundär: „Leistungen ansehen". Dezente Motion-Intro (Stagger). |
| 2 | **Problem-Anker** | 3–4 Pain Points der Zielgruppe als kurze Statements („Das Netzwerk lahmt.", „Backup? Hoffentlich.", „Die IT frisst Zeit statt sie zu sparen."). Holt den Besucher in seiner Sprache ab. |
| 3 | **★ Das System (Interlocking-Visualisierung)** | Die zentrale Sektion – siehe Kapitel 5. Drei Fachbereiche als verbundenes System, Texte aus der PPT (umgeschrieben ohne Zahnrad-Metapher). |
| 4 | **Leistungen im Detail** | 4 Karten (3 Säulen + Managed Services), je Nutzen-Headline + 3 Bullets + Link zur Detailseite. |
| 5 | **Warum Schwarzwald-IT** | USPs: persönliche Ansprechpartner, Reaktionszeiten, 40+ Jahre K&R, Fördermittel-Know-how, regional vor Ort. Mit Zahlen, wo möglich (Mitarbeiter, Jahre, Kunden). |
| 6 | **Referenzen / Social Proof** | 2–3 Kundenstimmen mit Name + Firma + konkretem Ergebnis („Fehlerquote im Rechnungsworkflow verringert"). Logos nur mit Kontext. |
| 7 | **Region & Team** | Foto echtes Team, Karte Einzugsgebiet (Leaflet, wie Fewo). Lokales SEO: „Südbaden, Schwarzwald-Baar, Bodensee, Stuttgart" in H2. |
| 8 | **FAQ** | 4–6 Fragen mit Direct-Answer-Snippets (Schema.org FAQPage) – z. B. „Was kostet IT-Betreuung pro Arbeitsplatz?", „Wer ist IT-Systemhaus in Südbaden?". |
| 9 | **CTA-Block** | Erstgespräch + Telefonnummer + Ansprechpartner-Foto. Niedrigschwellig: „15 Minuten, ehrliche Einschätzung, keine Verkaufsshow." |

**Leistungs-Detailseiten** folgen alle demselben Muster (Problem → Lösung → Leistungsumfang → Verzahnung mit den anderen Bereichen → Referenz → FAQ → CTA). Die Sektion „Verzahnung" verlinkt die jeweils anderen zwei Säulen – interne Verlinkung, die die System-Story konsistent weitererzählt.

---

## 4. Best Practices für IT-Dienstleister-Websites

### ✅ Was gut funktioniert
1. **Nutzen vor Technik.** „Rechnungen in Sekunden finden statt Stunden suchen" schlägt „Wir sind DocuWare-Partner". Headlines beantworten: Was habe ich davon?
2. **Konkrete Zahlen & Versprechen.** Reaktionszeiten, Erfahrungsjahre, Kundenzahl. Vage Begriffe („ganzheitlich", „innovativ", „kompetent") sind unsichtbar, weil sie jeder schreibt.
3. **Echte Gesichter.** Bei IT kauft man Vertrauen. Echtes Team, echte Ansprechpartner mit Namen, echtes Büro – gerade als regionaler Anbieter der größte Hebel gegen anonyme Ketten.
4. **Ein primärer CTA überall:** Erstgespräch/Rückruf. Niedrigschwellig formuliert. B2B-Entscheider wollen erst reden, nicht „kaufen".
5. **Social Proof mit Substanz.** Kundenstimmen mit Name, Firma und messbarem Ergebnis. Partnerlogos/Zertifikate als Vertrauenssignal – aber kuratiert, nicht als Logo-Friedhof.
6. **Performance als Glaubwürdigkeitsbeweis.** Eine IT-Firma mit langsamer Website widerspricht sich selbst. Core Web Vitals im grünen Bereich sind hier Marketing.
7. **Lokales SEO konsequent:** Region in H1/H2, Meta-Titles („IT-Systemhaus Schwarzwald | Schwarzwald-IT"), Google Business Profile, LocalBusiness-Schema, Footer-Links für Einzugsgebiete.
8. **FAQ + strukturierte Daten (LEO):** FAQPage/Service-Schema und zitierfähige Direct-Answer-Absätze, damit ChatGPT/Gemini/Perplexity die Seite als Quelle nutzen (Strategie aus dem Notion-Profil).
9. **Barrierefreiheit & reduzierte Bewegung:** Kontraste, Tastaturbedienung, `prefers-reduced-motion` respektieren (macht das Fewo-Setup bereits vor). Seit dem BFSG 2025 generell das erwartete Niveau.
10. **Support sichtbar trennen:** Bestandskunden finden Fernwartung/Ticket in einem Klick – das entlastet das Telefon und signalisiert Interessenten gelebten Service.

### ❌ Was man vermeiden sollte
1. **Stockfoto-Klischees:** Serverraum mit blauem Glow, Hacker im Hoodie, Händeschütteln vor Laptop. Erkennt jeder, glaubt keiner.
2. **Feature-/Herstellerlisten ohne Nutzen:** „Wir führen HP, Lexmark, …" beantwortet keine Kundenfrage (explizite Schwäche der alten K&R-Seiten laut Notion-Analyse).
3. **Buzzword-Bingo & Bleiwüsten:** Lange Absätze über „Digitalisierung 4.0" liest niemand. Kurze Sektionen, scanbare Bullets.
4. **Angst-Marketing überdrehen:** Cyber-Bedrohung benennen ja, aber Lösung und Zuversicht müssen dominieren. Dauerpanik wirkt unseriös.
5. **Karussells/Slider** für Kerninhalte: Slide 2+ sieht praktisch niemand, schlecht für A11y & LCP.
6. **Animations-Overkill:** Motion soll die System-Story erzählen, nicht jede Sektion zappeln lassen. Dezent, schnell (< 600 ms), einmalig, `prefers-reduced-motion`-Fallback.
7. **Fachjargon ohne Übersetzung:** „Endpoint Detection & Response" → „Wir erkennen Angriffe auf Ihre Geräte, bevor Schaden entsteht."
8. **Kontaktformular mit 10 Pflichtfeldern:** Name, Firma, E-Mail/Telefon reichen. Jedes Feld kostet Conversions.
9. **B2C-Streuverlust:** Klar kommunizieren, dass es um Unternehmens-IT geht (Notion-Constraint: keine Privatkunden-Anfragen anziehen).
10. **Versteckte Preise komplett tabuisieren:** Wenigstens Preismodelle/„ab"-Größenordnungen oder ein Preis-FAQ-Eintrag – das qualifiziert Leads vor und schafft Vertrauen.

---

## 5. „Ineinandergreifende Fachbereiche" – ohne Zahnräder, im IT-Stil

Die PPT-Story bleibt 1:1 erhalten (Infrastruktur = Fundament, Computing = Arbeitsalltag, Security = schützt alles) – nur die Metapher wechselt von Mechanik zu **Netzwerk/System**.

### Empfehlung: „Das System Schwarzwald-IT" als animierte Netzwerk-Topologie + Layer-Story

**Idee:** Die drei Fachbereiche sind **Nodes in einem Netzwerk** (Kreise oder Hexagons), verbunden durch Leitungen, auf denen **Datenimpulse** fließen – die IT-native Übersetzung von „Zahnräder greifen ineinander": In der IT greift nichts mechanisch ineinander, es ist *verbunden* und *tauscht Daten aus*.

**Scrollytelling-Ablauf (Desktop):**
1. **Infrastruktur-Node** erscheint zuerst, unten/mittig – „das Fundament" (SVG-Pfad zeichnet sich, Node skaliert mit Spring ein).
2. **Computing-Node** dockt oben an, eine Leitung zeichnet sich zwischen beiden (`pathLength` 0 → 1).
3. **IT-Sicherheit** legt sich als **Ring/Schild um das gesamte System** (statt drittem gleichrangigem Zahnrad) – das visualisiert „greift schützend in alle Bereiche ein" stärker als jede Zahnrad-Grafik.
4. Danach **fließen dauerhaft dezente Datenimpulse** (kleine Punkte) entlang der Leitungen – das System „läuft". Loop, langsam, unaufdringlich.
5. **Hover/Tap auf einen Node:** Node hebt sich, seine Verbindungen leuchten, daneben erscheint der jeweilige PPT-Text (umformuliert). Mobile: Tabs/Accordion unter der Grafik statt Hover.

**Warum das funktioniert:**
- Netzwerk-Topologie ist die Bildsprache, in der ITler selbst ihre Systeme zeichnen – authentisch statt Metapher.
- Der Security-Ring erzählt die Schutz-Botschaft präziser als ein drittes Zahnrad.
- Die Sektion ist gleichzeitig Navigations-Hub: jeder Node verlinkt auf seine Leistungsseite.

**Alternative Stile (falls Topologie nicht gefällt):**
- **Hexagon-Cluster:** Drei Waben docken aneinander (Honeycomb = etablierte Tech-Ästhetik, „lückenloses Ineinandergreifen" geometrisch eingebaut).
- **Isometrischer Layer-Stack:** Infrastruktur als Bodenplatte, Computing als Ebene darüber, Security als transluzente Hülle – Schichten schieben sich beim Scrollen zusammen (wie ein Architektur-Diagramm).
- **Leiterbahn-Motiv:** Drei Chips, verbunden über Platinen-Traces mit pulsierendem Signal – technischer, kühler Look.

**Technische Umsetzung mit motion.dev** (Stack-konform zum Fewo-Setup):
- Inline-SVG; Leitungen als `<path>` mit `pathLength`-Animation (Line-Drawing).
- `inView()` triggert die Aufbau-Sequenz mit `stagger()`, Nodes mit `type: "spring"`.
- Datenimpulse: `offsetDistance: 0% → 100%` entlang der Pfade, `repeat: Infinity`.
- Optional `scroll()` für scrub-gebundenes Scrollytelling der Aufbau-Phasen.
- `prefers-reduced-motion`: statisches, fertig aufgebautes Diagramm ohne Loop.
- Initialisierung zentral über `data-motion-*`-Attribute wie im Fewo-Repo (`src/motion/`).

---

## 6. Stack & Projektstruktur (analog Fewo-Roesslewald)

| Baustein | Wahl (wie Fewo) |
|---|---|
| Build/Dev | **Vite 8**, Vanilla JS, eigener History-API-SPA-Router |
| Styling | **Automatic.css 4.x** (Design-Tokens; Schwarzwald-IT-Farbwelt als Token-Set) |
| Animation | **motion + motion-plus-dom**, zentral initialisiert via `data-motion-*` |
| Karte | Leaflet + OSM (Einzugsgebiet auf Kontakt/Über-uns) |
| Video | Video.js (nur falls Imagefilm/Testimonial-Videos kommen) |
| Deployment | Cloudflare (wrangler) |
| Migrationsziel | WordPress + Etch; `src/data/` als Single Source of Truth → später CPTs |

```
src/
├── data/          services.js, referenzen.js, faq.js, partner.js, site.js
├── pages/         home.js, leistungen/, ueber-uns.js, referenzen.js,
│                  ratgeber.js, kontakt.js, support.js, legal/
├── components/    header, footer, system-diagramm, leistungs-karte,
│                  testimonial, faq-accordion, cta-block, block-renderer
├── motion/        Zentrale Init (inView/scroll/stagger, reduced-motion-Guard)
├── styles/        ACSS-Tokens + route-spezifisches CSS
└── router.js
```

SEO-Setup pro Route wie im Fewo-Repo: dynamische Meta-Tags, Canonical, JSON-LD (`LocalBusiness`/`ITService`, `Service`, `FAQPage`, `BreadcrumbList`).

---

## 7. DSGVO: Local-First-Grundsatz (verbindlich)

Alle Ressourcen werden **lokal vom eigenen Server** geladen – keine Requests an Dritte beim Seitenaufruf:

| Bereich | Regel |
|---|---|
| **Schriften** | Keine Google Fonts o. ä. Entwurf nutzt System-Font-Stack; finale Marken-Schrift als selbst gehostete WOFF2 unter `public/fonts/`. |
| **JavaScript/CSS** | Alles via npm gebündelt (Vite). Keine CDN-Einbindungen (kein unpkg/jsdelivr/cdnjs). |
| **Karten** | Leaflet selbst ist lokal, aber **OSM-Tiles sind ein externer Request** → im Entwurf bewusst keine Karte. Optionen: (a) selbst gehostete Tiles, (b) statisches Kartenbild, (c) Zwei-Klick-Lösung mit Einwilligung. ⚠️ Bei Fewo-Rösslewald prüfen: dort werden OSM-Tiles vermutlich extern geladen. |
| **Videos** | Nur lokale MP4s über Video.js (wie Fewo) – keine YouTube/Vimeo-Embeds ohne Zwei-Klick. |
| **Analytics** | Kein Drittanbieter-Tracking. Falls gewünscht: selbst gehostetes Matomo oder Plausible (Cookie-los konfiguriert). |
| **Formulare** | Versand an eigenes Postfach/eigenen Endpoint, kein Drittanbieter-Formdienst. |
| **Icons/Bilder** | Inline-SVG bzw. lokale Assets. |
| **Folge** | Ohne externe Dienste und einwilligungspflichtige Cookies ist **kein Cookie-Banner nötig** – ein echtes Qualitätsmerkmal für ein IT-Systemhaus, das man auf der Seite ruhig kommunizieren darf. |

## 8. Offene Punkte / nächste Schritte

1. **Inhalte einsammeln:** Teamfotos, finale Referenz-Freigaben (welche Kunden dürfen für Schwarzwald-IT genannt werden?), exakte Zahlen (Reaktionszeit, Kundenanzahl), Partner-Zertifizierungsstufen.
2. **Entscheidung Visualisierungs-Stil** (Topologie-Empfehlung vs. Hexagon/Layer/Leiterbahn) – gern als Motion-Prototyp der Sektion zuerst.
3. **Farb-/Logo-Welt Schwarzwald-IT** als ACSS-Token-Set definieren (eigenständig, aber K&R-kompatibel).
4. **Domain-/Tracking-Setup:** Cloudflare-Projekt, datenschutzfreundliches Analytics.
5. **Notion-Landingpage „Schwarzwald-IT: IT-Systemhaus & Sicherheit"** mit diesem Konzept befüllen, damit Content-Planung und Repo synchron bleiben.

---

### Quellen
- PowerPoint „Vorstellung_SchwarzwaldIT.pptx" (drei Fachbereiche + Texte)
- Notion: „Unternehmensprofil" (Kunze & Ritter GmbH), Content-Planung/Landingpages
- [schwarzwald-it.com](https://schwarzwald-it.com/) (via Suchindex; Direktzugriff durch WAF geblockt)
- [kunze-ritter.de/schwarzwald-it](https://kunze-ritter.de/schwarzwald-it), [kunze-ritter.com/schwarzwald-it/it-services/](https://kunze-ritter.com/schwarzwald-it/it-services/), [it-sicherheit](https://kunze-ritter.com/schwarzwald-it/it-sicherheit/), [e-mail-management](https://kunze-ritter.com/schwarzwald-it/e-mail-management/), [client-management](https://kunze-ritter.com/schwarzwald-it/client-management/)
- [github.com/Kunze-Ritter/Fewo-Roesslewald](https://github.com/Kunze-Ritter/Fewo-Roesslewald) (README, package.json)
