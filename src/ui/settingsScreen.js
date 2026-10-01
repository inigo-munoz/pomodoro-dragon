import { backButton } from './backButton.js';

const clamp = (n, { min, max }) => Math.min(max, Math.max(min, n));

export const renderSettingsScreen = ({ settings, config, onChange, onBack, onChangeDragon }) => {
  const range = config.durations.customRange;
  const section = document.createElement('section');
  section.className = 'screen settings';

  const title = document.createElement('h1');
  title.className = 'screen-title';
  title.textContent = 'Settings';
  section.appendChild(title);

  const emit = (next) => onChange({ ...settings, ...next });

  const group = (label, key, presets, stepPrefix) => {
    const wrap = document.createElement('div');
    wrap.className = 'setting-group';
    wrap.innerHTML = `<h2>${label}: <span class="value">${settings[key]}</span> min</h2>`;

    const control = document.createElement('div');
    control.className = 'setting-control';

    const presetRow = document.createElement('div');
    presetRow.className = 'preset-row';
    for (const p of presets) {
      const btn = document.createElement('button');
      btn.className = 'preset' + (settings[key] === p ? ' active' : '');
      btn.dataset[`${stepPrefix}Preset`] = String(p);
      btn.textContent = `${p}`;
      btn.addEventListener('click', () => emit({ [key]: p }));
      presetRow.appendChild(btn);
    }

    const minus = document.createElement('button');
    minus.dataset.step = `${stepPrefix}-minus`;
    minus.textContent = '−';
    minus.addEventListener('click', () => {
      const next = clamp(settings[key] - 1, range);
      if (next !== settings[key]) emit({ [key]: next });
    });
    const plus = document.createElement('button');
    plus.dataset.step = `${stepPrefix}-plus`;
    plus.textContent = '+';
    plus.addEventListener('click', () => {
      const next = clamp(settings[key] + 1, range);
      if (next !== settings[key]) emit({ [key]: next });
    });
    control.append(minus, presetRow, plus);
    wrap.appendChild(control);
    return wrap;
  };

  section.appendChild(group('Work', 'workMinutes', config.durations.workPresets, 'work'));
  section.appendChild(group('Break', 'breakMinutes', config.durations.breakPresets, 'break'));

  // A choice between named soundtracks, not a number, so no steppers: same row, same
  // classes, so it reads as a sibling of Work and Break.
  const musicGroup = () => {
    const wrap = document.createElement('div');
    wrap.className = 'setting-group';
    wrap.innerHTML = '<h2>Music</h2>';
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
    wrap.appendChild(presetRow);
    return wrap;
  };
  section.appendChild(musicGroup());

  const changeDragon = document.createElement('button');
  changeDragon.className = 'big-btn';
  changeDragon.dataset.action = 'change-dragon';
  changeDragon.textContent = 'Change Dragon';
  if (onChangeDragon) changeDragon.addEventListener('click', onChangeDragon);
  section.appendChild(changeDragon);

  section.appendChild(backButton(onBack));

  return section;
};
