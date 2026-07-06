import { backButton } from './backButton.js';

const clamp = (n, { min, max }) => Math.min(max, Math.max(min, n));

export const renderSettingsScreen = ({ settings, config, onChange, onBack }) => {
  const range = config.durations.customRange;
  const section = document.createElement('section');
  section.className = 'screen settings';

  const emit = (next) => onChange({ ...settings, ...next });

  const group = (label, key, presets, stepPrefix) => {
    const wrap = document.createElement('div');
    wrap.className = 'setting-group';
    wrap.innerHTML = `<h2>${label}: <span class="value">${settings[key]}</span> min</h2>`;

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
    wrap.appendChild(presetRow);

    const stepRow = document.createElement('div');
    stepRow.className = 'step-row';
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
    stepRow.append(minus, plus);
    wrap.appendChild(stepRow);
    return wrap;
  };

  section.appendChild(group('Work', 'workMinutes', config.durations.workPresets, 'work'));
  section.appendChild(group('Break', 'breakMinutes', config.durations.breakPresets, 'break'));

  section.appendChild(backButton(onBack));

  return section;
};
