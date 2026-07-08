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
  };
};
