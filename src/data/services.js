// Die drei Fachbereiche (aus der PPT „Vorstellung Schwarzwald-IT") + Managed Services als Querschnitt.
// system-Texte: 1:1 aus der PPT übernommen (Zahnrad-/„ineinandergreifen"-Bildsprache).
export const services = [
  {
    slug: "it-infrastruktur",
    title: "IT-Infrastruktur",
    kicker: "Netzwerk · Server · Cloud",
    short:
      "Das Fundament Ihres IT-Betriebs: Netzwerke, Server und Cloud-Anbindungen – stabil, leistungsfähig und sauber geplant.",
    system:
      "IT-Infrastruktur bildet das Fundament Ihres IT-Betriebs. Netzwerke, Server und Cloud-Anbindungen sind das Zahnrad, auf dem alles andere aufbaut. Erst wenn diese Basis stabil, leistungsfähig und sauber geplant ist, können IT-Security und Computing zuverlässig ineinandergreifen und langfristig reibungslos funktionieren.",
    bullets: [
      "Netzwerkplanung, -installation und -betreuung",
      "Server- und Storage-Lösungen vor Ort oder in der Cloud (u. a. terra cloud)",
      "Standortvernetzung und sichere Cloud-Anbindung",
    ],
    pains: [
      "Das Netzwerk lahmt, keiner weiß warum.",
      "Der Server ist alt – ein Ausfall wäre teuer.",
      "Cloud ja, aber wie und wohin mit den Daten?",
    ],
    node: { label: "Infrastruktur", role: "Das Fundament" },
  },
  {
    slug: "it-sicherheit",
    title: "IT-Sicherheit",
    kicker: "Security · Backup · E-Mail-Management",
    short:
      "Schützt alle Bereiche Ihrer IT: Systeme verfügbar, Daten abgesichert, Risiken minimiert – damit nichts stillsteht.",
    system:
      "IT-Security greift schützend in alle Bereiche ein. Sie sorgt dafür, dass Infrastrukturen geschützt, Systeme verfügbar und Daten jederzeit abgesichert sind. Als zentrales Zahnrad im Zusammenspiel mit Infrastruktur und Computing verhindert sie Stillstand, minimiert Risiken und hält Ihre IT dauerhaft sicher in Bewegung.",
    bullets: [
      "Firewall, Endpoint-Schutz und Schwachstellen-Checks",
      "Backup- und Notfallkonzepte, die im Ernstfall wirklich greifen",
      "Rechtssicheres E-Mail-Management mit REDDOXX: Archivierung, Anti-Spam, Verschlüsselung",
    ],
    pains: [
      "Backup? Hoffentlich.",
      "Phishing-Mails landen täglich im Postfach.",
      "E-Mail-Archivierung – Pflicht, aber ungelöst.",
    ],
    node: { label: "IT-Sicherheit", role: "Das zentrale Zahnrad" },
  },
  {
    slug: "computing",
    title: "Computing",
    kicker: "Arbeitsplatz · Anwendungen · Client-Management",
    short:
      "Macht IT im Arbeitsalltag erleb- und nutzbar: moderne Arbeitsplätze, Anwendungen und Cloud-Services – ohne Reibungsverluste.",
    system:
      "Computing macht IT im Arbeitsalltag erleb- und nutzbar. Arbeitsplätze, Anwendungen und Cloud-Services sind das Zahnrad, mit dem Mitarbeitende täglich arbeiten. Damit dieses reibungslos läuft, greifen wir gezielt auf eine stabile Infrastruktur und wirksame IT-Security zurück – denn nur im Zusammenspiel aller Zahnräder entsteht produktives Arbeiten ohne Reibungsverluste.",
    bullets: [
      "Moderne Arbeitsplätze: Hardware, Betriebssysteme, Microsoft-Umgebungen",
      "Automatisiertes Client-Management mit baramundi – auch an Außenstandorten",
      "Anwendungs- und Cloud-Services, abgestimmt auf Ihren Arbeitsalltag",
    ],
    pains: [
      "Updates? Macht jeder selbst – oder niemand.",
      "Neue Mitarbeitende warten tagelang auf ihren PC.",
      "Die IT frisst Zeit, statt sie zu sparen.",
    ],
    node: { label: "Computing", role: "Der Arbeitsalltag" },
  },
  {
    slug: "managed-services",
    title: "Managed Services",
    kicker: "IT-Betrieb als Service",
    short:
      "Der Querschnitt über alles: Wir betreiben, überwachen und warten Ihre IT – planbar, zuverlässig und kosteneffizient.",
    system:
      "Managed Services halten das gesamte System in Betrieb: Monitoring, Wartung und Support über alle drei Fachbereiche hinweg – mit durchdachten Konzepten, festen Ansprechpartnern und planbaren Kosten.",
    bullets: [
      "Proaktives Monitoring statt Reagieren im Notfall",
      "Feste Reaktionszeiten und persönliche Ansprechpartner",
      "Planbare monatliche Kosten statt Überraschungsrechnungen",
    ],
    pains: [
      "Interne IT überlastet, externe nie erreichbar.",
      "IT-Kosten schwanken jeden Monat.",
      "Niemand schaut hin, bevor etwas ausfällt.",
    ],
    node: null, // Querschnitt – kein eigener Node im Systemdiagramm
  },
];

export const getService = (slug) => services.find((s) => s.slug === slug);
