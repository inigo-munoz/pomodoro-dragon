const IMAGE_RE = /\.(png|webp|svg|jpe?g)$/i;

export const isImagePath = (value) => IMAGE_RE.test(value);

// Art paths are authored from the site root ('/art/foods/apple.webp'). When the app is
// served from a subpath — GitHub Pages puts it under /pomodoro-dragon/ — those would
// resolve against the domain root and 404, silently degrading every image to its emoji
// fallback. Vite exposes the deploy prefix as BASE_URL ('/' in tests and in dev).
const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');

export const assetUrl = (path) => (path.startsWith('/') ? base + path : path);

export const art = (value, altText, fallback) => {
  if (isImagePath(value)) {
    const img = document.createElement('img');
    img.className = 'art-img';
    img.src = assetUrl(value);
    img.alt = altText ?? '';
    if (fallback) {
      img.addEventListener('error', () => {
        const span = document.createElement('span');
        span.className = img.className.replace('art-img', 'art-emoji');
        span.textContent = fallback;
        img.replaceWith(span);
      }, { once: true });
    }
    return img;
  }
  const span = document.createElement('span');
  span.className = 'art-emoji';
  span.textContent = value;
  return span;
};
