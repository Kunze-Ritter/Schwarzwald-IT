// Mini-Lifecycle für seitenspezifische Komponenten.
// Animierte Komponenten (Canvas-Loops, Intervalle, Listener) registrieren beim
// Mounten ihre Aufräum-Funktion. Der Router ruft runCleanups() vor jedem Render
// auf, damit beim Seitenwechsel keine requestAnimationFrame-Loops oder Intervalle
// im Hintergrund weiterlaufen.
let cleanups = [];

export function onCleanup(fn) {
  if (typeof fn === "function") cleanups.push(fn);
}

export function runCleanups() {
  const pending = cleanups;
  cleanups = [];
  pending.forEach((fn) => {
    try {
      fn();
    } catch {
      /* Aufräumen darf den Seitenwechsel nie blockieren */
    }
  });
}
