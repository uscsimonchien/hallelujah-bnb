(() => {
  const VERSION = '20261005-2335';
  const load = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  load(`assets/rental-correct-core.js?v=${VERSION}`)
    .then(() => load(`assets/bbq-section.js?v=${VERSION}`))
    .catch(() => load(`assets/bbq-section.js?v=${VERSION}`));
})();
