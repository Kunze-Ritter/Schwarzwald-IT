import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  IcosahedronGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  AmbientLight,
  PointLight,
  DirectionalLight,
  Vector3,
  CatmullRomCurve3,
  TubeGeometry,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial,
  Group,
  Clock,
  Raycaster,
  Vector2,
  BackSide,
} from "three";
import { inView } from "motion";
import { services } from "../data/services.js";
import { reducedMotion } from "../motion/index.js";

const MINT    = 0x2dd4a8;
const BG      = 0x061d16;

// Drei Nodes: Infrastruktur (unten), Computing (oben), IT-Sicherheit (rechts)
const NODE_CFG = [
  { slug: "it-infrastruktur", x:  0.0, y: -1.4,  z:  0.3, r: 0.44 },
  { slug: "computing",        x:  0.0, y:  1.4,  z:  0.3, r: 0.38 },
  { slug: "it-sicherheit",   x:  1.75, y:  0.0, z: -0.2, r: 0.34 },
];

// Jeder Node ist mit jedem verbunden
const EDGES = [[0, 1], [0, 2], [1, 2]];

// Entrance-Verzögerung pro Node in Sekunden
const ENTRY_DELAY = [0.1, 0.45, 0.75];

let cleanupPrev = null;

export function systemDiagram3d() {
  const cards = NODE_CFG.map((nc) => {
    const s = services.find((sv) => sv.slug === nc.slug);
    const excerpt = s.system.length > 150 ? s.system.slice(0, 150) + "…" : s.system;
    return `
      <div class="sd3-card" data-node="${nc.slug}">
        <p class="kicker">${s.node.role}</p>
        <h3>${s.title}</h3>
        <p>${excerpt}</p>
        <a class="text-link" href="/leistungen/${s.slug}/">Mehr zu ${s.title} →</a>
      </div>`;
  }).join("");

  return `
    <div class="sd3-wrap">
      <canvas class="sd3-canvas" aria-hidden="true"></canvas>
      <div class="sd3-cards" aria-label="Die drei Fachbereiche von Schwarzwald-IT">
        ${cards}
      </div>
    </div>`;
}

export function initSystemDiagram3d(main) {
  if (cleanupPrev) { cleanupPrev(); cleanupPrev = null; }

  const canvas = main.querySelector(".sd3-canvas");
  const wrap   = main.querySelector(".sd3-wrap");
  if (!canvas || !wrap) return;

  // Bei reduzierter Bewegung: Canvas verstecken, Karten bleiben sichtbar
  if (reducedMotion()) {
    canvas.style.display = "none";
    return;
  }

  const W = () => wrap.clientWidth;
  const H = () => Math.round(Math.min(500, Math.max(320, W() * 0.48)));

  // ── Renderer ─────────────────────────────────────────────────────
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(BG, 1);

  // ── Szene & Kamera ───────────────────────────────────────────────
  const scene  = new Scene();
  const camera = new PerspectiveCamera(52, W() / H(), 0.1, 100);
  camera.position.set(0, 0, 5.8);

  // ── Beleuchtung ──────────────────────────────────────────────────
  scene.add(new AmbientLight(0xffffff, 0.2));
  const fill = new DirectionalLight(0x88ffdd, 0.45);
  fill.position.set(-3, 2, 4);
  scene.add(fill);

  // ── Root-Gruppe (rotiert langsam) ─────────────────────────────────
  const root = new Group();
  scene.add(root);

  // ── Nodes ────────────────────────────────────────────────────────
  const meshes = [];   // für Raycaster
  const groups = [];   // je ein Group pro Node

  NODE_CFG.forEach((nc, i) => {
    const g = new Group();
    g.position.set(nc.x, nc.y, nc.z);
    g.scale.setScalar(0); // startet unsichtbar für Entrance-Animation

    // Innere Ikosaeder-Geometrie
    const mat = new MeshStandardMaterial({
      color:             0x0f4d3a,
      emissive:          MINT,
      emissiveIntensity: 0.55,
      metalness:         0.55,
      roughness:         0.22,
    });
    const mesh = new Mesh(new IcosahedronGeometry(nc.r, 3), mat);
    g.add(mesh);
    meshes.push(mesh);

    // Äußere Glühschicht (Backside-Sphere)
    g.add(new Mesh(
      new SphereGeometry(nc.r * 1.8, 12, 8),
      new MeshBasicMaterial({ color: MINT, transparent: true, opacity: 0.055, side: BackSide }),
    ));

    // Punkt-Licht direkt am Node
    g.add(new PointLight(MINT, 1.8, nc.r * 14));

    root.add(g);
    groups.push(g);
  });

  // ── Verbindungen + Pulse-Dots ─────────────────────────────────────
  const pulseDots = [];

  EDGES.forEach(([a, b]) => {
    const pa = new Vector3(NODE_CFG[a].x, NODE_CFG[a].y, NODE_CFG[a].z);
    const pb = new Vector3(NODE_CFG[b].x, NODE_CFG[b].y, NODE_CFG[b].z);
    const curve = new CatmullRomCurve3([pa, pb]);

    // Tube
    root.add(new Mesh(
      new TubeGeometry(curve, 24, 0.015, 6, false),
      new MeshBasicMaterial({ color: MINT, transparent: true, opacity: 0.3 }),
    ));

    // Pulse-Punkt der sich entlangbewegt
    const dot = new Mesh(
      new SphereGeometry(0.042, 8, 6),
      new MeshBasicMaterial({ color: 0xffffff }),
    );
    dot.userData = { curve, t: Math.random(), spd: 0.14 + Math.random() * 0.13 };
    root.add(dot);
    pulseDots.push(dot);
  });

  // ── IT-Sicherheit Schutzschild (Wireframe-Sphäre) ─────────────────
  const shieldGeo  = new SphereGeometry(2.4, 20, 15);
  const shield     = new LineSegments(
    new WireframeGeometry(shieldGeo),
    new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.05 }),
  );
  root.add(shield);

  // ── Raycaster / Hover ─────────────────────────────────────────────
  const raycaster = new Raycaster();
  const mouse     = new Vector2(-10, -10);
  let   hovered   = -1;
  const cardEls   = main.querySelectorAll(".sd3-card");

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
    mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
  });
  canvas.addEventListener("pointerleave", () => mouse.set(-10, -10));
  canvas.addEventListener("click", () => {
    if (hovered >= 0) {
      const path = `/leistungen/${NODE_CFG[hovered].slug}/`;
      history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  });

  // ── Animations-Loop ───────────────────────────────────────────────
  const clock   = new Clock(false);
  let   running = true;

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt  = clock.getDelta();
    const now = clock.getElapsedTime();

    // Entrance: Spring-Approximation mit Stagger
    groups.forEach((g, i) => {
      const t = Math.max(0, now - ENTRY_DELAY[i]);
      if (t <= 0) return;
      if (t < 1.2) {
        // 1 - e^(-6t) * cos(9t) → überschwingt kurz, beruhigt sich bei 1
        const s = Math.max(0, 1 - Math.exp(-6 * t) * Math.cos(9 * t));
        g.scale.setScalar(Math.min(s, 1.08));
      } else {
        // Nach Entrance: Hover-Scale
        const target = hovered === i ? 1.14 : 1.0;
        g.scale.x += (target - g.scale.x) * 0.1;
        g.scale.y = g.scale.z = g.scale.x;
      }
    });

    // Emissive-Puls (sanftes Atmen)
    meshes.forEach((m, i) => {
      m.material.emissiveIntensity =
        hovered === i
          ? 1.0
          : 0.45 + Math.sin(now * 1.5 + i * 2.0) * 0.12;
    });

    // Pulse-Dots entlang der Kanten
    pulseDots.forEach((dot) => {
      dot.userData.t = (dot.userData.t + dt * dot.userData.spd) % 1;
      dot.position.copy(dot.userData.curve.getPointAt(dot.userData.t));
    });

    // Langsame Rotation
    root.rotation.y  += dt * 0.09;
    shield.rotation.y -= dt * 0.025;
    shield.rotation.x += dt * 0.012;

    // Raycaster
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(meshes);
    const newH = hits.length > 0 ? meshes.indexOf(hits[0].object) : -1;
    if (newH !== hovered) {
      hovered = newH;
      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
      cardEls.forEach((c, i) => c.classList.toggle("is-active", i === hovered));
    }

    renderer.render(scene, camera);
  }

  // ── Resize ────────────────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    const w = W(), h = H();
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(wrap);

  // ── Starten wenn sichtbar ─────────────────────────────────────────
  const stopInView = inView(wrap, () => {
    clock.start();
    frame();
  }, { amount: 0.2 });

  // ── Cleanup ───────────────────────────────────────────────────────
  cleanupPrev = () => {
    running = false;
    ro.disconnect();
    stopInView?.();
    renderer.dispose();
  };
}
