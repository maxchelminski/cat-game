// One persistent idle choice per page/chapter. URL hooks also cover SPA readers.
const KEY = 'schale-companion:dock-idle';
const listeners = new Set();
let variant = 0;
let currentPage = location.href;
try {
  variant = ((Number(sessionStorage.getItem(KEY)) || 0) + 1) % 5;
  sessionStorage.setItem(KEY, String(variant));
} catch { /* A private session still gets all five animations. */ }

export const getDockVariant = () => variant;
export function onCompanionPageChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function companionPageChanged(pageKey = location.href) {
  const key = String(pageKey);
  if (key === currentPage) return variant;
  currentPage = key;
  variant = (variant + 1) % 5;
  try { sessionStorage.setItem(KEY, String(variant)); } catch { /* Optional. */ }
  for (const listener of listeners) listener(variant);
  return variant;
}
for (const method of ['pushState', 'replaceState']) {
  const original = history[method];
  history[method] = function (...args) {
    const result = original.apply(this, args);
    companionPageChanged(location.href);
    return result;
  };
}
window.addEventListener('popstate', () => companionPageChanged(location.href));
window.addEventListener('hashchange', () => companionPageChanged(location.href));
window.petCompanionPageChanged = companionPageChanged;
