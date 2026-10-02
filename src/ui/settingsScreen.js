import { backButton } from './backButton.js';
import { screenTitle } from './screenTitle.js';

const clamp = (n, { min, max }) => Math.min(max, Math.max(min, n));

export const renderSettingsScreen = ({ settings, config, onChange, onBack, onChangeDragon }) => {
  const section = document.createElement('section');
  section.className = 'screen settings';

  section.appendChild(backButton(onBack));
  section.appendChild(screenTitle('Settings'));

  const emit = (next) => onChange({ ...settings, ...next });

  // One row per setting: a label, then a stepper (◀ value ▶), then quick presets where the
  // range is wide enough to want them. `prefix` names the data-* hooks.
  const numericRow = ({ label, key, prefix, unit, presets, bounds }) => {
    const row = document.createElement('div');
    row.className = 'setting-row';
    const name = document.createElement('div');
    name.className = 'setting-label';
    name.textContent = label;

    const stepper = document.createElement('div');
    stepper.className = 'stepper';
    const arrow = (direction, glyph, delta) => {
      const btn = document.createElement('button');
      btn.className = 'arrow-btn';
      btn.dataset.step = `${prefix}-${direction}`;
      btn.textContent = glyph;
      btn.setAttribute('aria-label', `${direction === 'minus' ? 'Less' : 'More'} ${label}`);
      btn.addEventListener('click', () => {
        const next = clamp(settings[key] + delta, bounds);
        if (next !== settings[key]) emit({ [key]: next });
      });
      return btn;
    };
    const value = document.createElement('span');
    value.className = 'value';
    value.textContent = unit ? `${settings[key]} ${unit}` : String(settings[key]);
    stepper.append(arrow('minus', '◀', -1), value, arrow('plus', '▶', 1));
    row.append(name, stepper);

    if (presets) {
      const presetRow = document.createElement('div');
      presetRow.className = 'preset-row';
      for (const p of presets) {
        const btn = document.createElement('button');
        btn.className = 'preset' + (settings[key] === p ? ' active' : '');
        // setAttribute, not dataset: the hook is spelled data-longBreak-preset.
        btn.setAttribute(`data-${prefix}-preset`, String(p));
        btn.textContent = String(p);
        btn.addEventListener('click', () => emit({ [key]: p }));
        presetRow.appendChild(btn);
      }
      row.appendChild(presetRow);
    }
    return row;
  };

  const { durations } = config;
  const panel = document.createElement('div');
  panel.className = 'settings-panel';
  panel.append(
    numericRow({ label: 'Focus Time', key: 'workMinutes', prefix: 'work', unit: 'min',
      presets: durations.workPresets, bounds: durations.customRange }),
    numericRow({ label: 'Break Time', key: 'breakMinutes', prefix: 'break', unit: 'min',
      presets: durations.breakPresets, bounds: durations.customRange }),
    numericRow({ label: 'Long Break Time', key: 'longBreakMinutes', prefix: 'longBreak', unit: 'min',
      presets: durations.longBreakPresets, bounds: durations.customRange }),
    // The range is small, so one tap per step is already instant: no presets.
    numericRow({ label: 'Number of Sessions', key: 'sessionsBeforeLongBreak', prefix: 'sessions',
      bounds: durations.sessionsRange }),
  );

  // A choice between named soundtracks, not a number, so no steppers.
  const musicRow = () => {
    const row = document.createElement('div');
    row.className = 'setting-row';
    const name = document.createElement('div');
    name.className = 'setting-label';
    name.textContent = 'Music';
    const presetRow = document.createElement('div');
    presetRow.className = 'preset-row';
    for (const style of config.musicStyles) {
      const btn = document.createElement('button');
      btn.className = 'preset' + (settings.musicStyle === style ? ' active' : '');
      btn.dataset.musicPreset = style;
      btn.textContent = style.charAt(0).toUpperCase() + style.slice(1);
      btn.addEventListener('click', () => emit({ musicStyle: style }));
      presetRow.appendChild(btn);
    }
    row.append(name, presetRow);
    return row;
  };
  panel.appendChild(musicRow());
  section.appendChild(panel);

  const changeDragon = document.createElement('button');
  changeDragon.className = 'big-btn';
  changeDragon.dataset.action = 'change-dragon';
  changeDragon.textContent = 'Change Dragon';
  if (onChangeDragon) changeDragon.addEventListener('click', onChangeDragon);
  section.appendChild(changeDragon);

  return section;
};
