// Zentrale Motion-Initialisierung (motion.dev) – analog zum Fewo-Setup über data-Attribute.
//   data-motion-intro          → Hero-Intro (Stagger der Kinder, sofort)
//   data-motion-reveal         → Element blendet beim Scrollen ein
//   data-motion-reveal-group   → Kinder staggern beim Scrollen
// Respektiert prefers-reduced-motion: dann bleibt alles statisch sichtbar.
import { animate, inView, stagger } from "motion";

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const VISIBLE = { opacity: 1, transform: "translateY(0px)" };
const EASE = [0.22, 1, 0.36, 1];

function hide(el) {
  Object.assign(el.style, { opacity: "0", transform: "translateY(24px)" });
}

export function initMotion(root) {
  if (reducedMotion()) return;

  root.querySelectorAll("[data-motion-intro]").forEach((el) => {
    const children = [...el.children];
    children.forEach(hide);
    animate(children, VISIBLE, {
      duration: 0.7,
      ease: EASE,
      delay: stagger(0.09),
    });
  });

  root.querySelectorAll("[data-motion-reveal]").forEach((el) => {
    hide(el);
    inView(
      el,
      (target) => {
        animate(target, VISIBLE, { duration: 0.6, ease: EASE });
      },
      { amount: 0.25 }
    );
  });

  root.querySelectorAll("[data-motion-reveal-group]").forEach((el) => {
    const children = [...el.children];
    children.forEach(hide);
    inView(
      el,
      () => {
        animate(children, VISIBLE, {
          duration: 0.55,
          ease: EASE,
          delay: stagger(0.08),
        });
      },
      { amount: 0.2 }
    );
  });
}
