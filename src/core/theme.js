import { themes } from '../data/themes.js';

// Merge a theme over the default, section by section. Anything a theme does
// not define falls back to the default theme.
export const resolveTheme = (themeId) => {
  const base = themes.default;
  const override = themes[themeId] ?? {};
  return {
    palette: { ...base.palette, ...(override.palette ?? {}) },
    icons: { ...base.icons, ...(override.icons ?? {}) },
    foods: { ...base.foods, ...(override.foods ?? {}) },
    furniture: { ...base.furniture, ...(override.furniture ?? {}) },
    // A scalar, so it falls back whole rather than merging key by key.
    room: override.room ?? base.room,
  };
};

// Write palette entries as CSS custom properties (e.g. { bg } -> --bg).
export const applyPalette = (palette, root = document.documentElement) => {
  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(`--${key}`, value);
  }
};
