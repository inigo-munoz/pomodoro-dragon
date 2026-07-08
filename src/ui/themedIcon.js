import { art } from './art.js';
import { themes } from '../data/themes.js';

// Render the active theme's UI icon for `key`, falling back to the default
// theme's emoji both as the value (no theme) and as the <img> error fallback.
export const themedIcon = (theme, key) => {
  const fallback = themes.default.icons[key];
  return art(theme?.icons?.[key] ?? fallback, key, fallback);
};
