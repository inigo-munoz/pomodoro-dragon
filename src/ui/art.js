const IMAGE_RE = /\.(png|webp|svg|jpe?g)$/i;

export const isImagePath = (value) => IMAGE_RE.test(value);

export const art = (value, altText, fallback) => {
  if (isImagePath(value)) {
    const img = document.createElement('img');
    img.className = 'art-img';
    img.src = value;
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
