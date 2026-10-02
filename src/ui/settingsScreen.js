import { backButton } from './backButton.js';
import { screenTitle } from './screenTitle.js';

const clamp = (n, { min, max }) => Math.min(max, Math.max(min, n));

// How long the "Saved" note stays up. Long enough to be seen, short enough to not nag.
const SAVED_NOTE_MS = 2000;

export const renderSettingsScreen = ({ settings, config, onSave, onBack, onChangeDragon }) => {
  const { durations } = config;
  const section = document.createElement('section');
  section.className = 'screen settings';

  // The screen edits a private draft and only hands it over on SAVE, so the child confirms
  // on purpose. `baseline` is what is currently saved; it moves forward on every SAVE.
  let baseline = { ...settings };
  let draft = { ...settings };
  const isDirty = () => Object.keys(draft).some((key) => draft[key] !== baseline[key]);

  // The only timer on the screen. It is cancelled whenever it is replaced or the draft
  // changes, so at most one is ever pending.
  let noteTimer = null;
  const note = document.createElement('p');
  note.className = 'saved-note';
  note.setAttribute('role', 'status');
  const clearNote = () => {
    clearTimeout(noteTimer);
    noteTimer = null;
    note.textContent = '';
  };

  const change = (next) => {
    draft = { ...draft, ...next };
    clearNote();
    paint();
  };

  const label = (text) => {
    const name = document.createElement('div');
    name.className = 'setting-label';
    name.textContent = text;
    return name;
  };

  // One row per setting: a label, a stepper (◀ value ▶), and quick presets where the range
  // is wide enough to want them. `prefix` names the data-* hooks.
  const numericRow = ({ text, key, prefix, unit, presets, bounds }) => {
    const row = document.createElement('div');
    row.className = 'setting-row';

    const arrow = (direction, glyph, delta) => {
      const btn = document.createElement('button');
      btn.className = 'arrow-btn';
      btn.dataset.step = `${prefix}-${direction}`;
      btn.textContent = glyph;
      btn.setAttribute('aria-label', `${direction === 'minus' ? 'Less' : 'More'} ${text}`);
      btn.addEventListener('click', () => {
        const next = clamp(draft[key] + delta, bounds);
        if (next !== draft[key]) change({ [key]: next });
      });
      return btn;
    };
    const value = document.createElement('span');
    value.className = 'value';
    value.textContent = unit ? `${draft[key]} ${unit}` : String(draft[key]);
    const stepper = document.createElement('div');
    stepper.className = 'stepper';
    stepper.append(arrow('minus', '◀', -1), value, arrow('plus', '▶', 1));
    row.append(label(text), stepper);

    if (presets) {
      const presetRow = document.createElement('div');
      presetRow.className = 'preset-row';
      for (const p of presets) {
        const btn = document.createElement('button');
        btn.className = 'preset' + (draft[key] === p ? ' active' : '');
        // setAttribute, not dataset: the hook is spelled data-longBreak-preset.
        btn.setAttribute(`data-${prefix}-preset`, String(p));
        btn.textContent = String(p);
        btn.addEventListener('click', () => change({ [key]: p }));
        presetRow.appendChild(btn);
      }
      row.appendChild(presetRow);
    }
    return row;
  };

  // A choice between named soundtracks, not a number, so no steppers.
  const musicRow = () => {
    const row = document.createElement('div');
    row.className = 'setting-row';
    const presetRow = document.createElement('div');
    presetRow.className = 'preset-row';
    for (const style of config.musicStyles) {
      const btn = document.createElement('button');
      btn.className = 'preset' + (draft.musicStyle === style ? ' active' : '');
      btn.dataset.musicPreset = style;
      btn.textContent = style.charAt(0).toUpperCase() + style.slice(1);
      btn.addEventListener('click', () => change({ musicStyle: style }));
      presetRow.appendChild(btn);
    }
    row.append(label('Music'), presetRow);
    return row;
  };

  const buildPanel = () => {
    const panel = document.createElement('div');
    panel.className = 'settings-panel';
    panel.append(
      numericRow({ text: 'Focus Time', key: 'workMinutes', prefix: 'work', unit: 'min',
        presets: durations.workPresets, bounds: durations.customRange }),
      numericRow({ text: 'Break Time', key: 'breakMinutes', prefix: 'break', unit: 'min',
        presets: durations.breakPresets, bounds: durations.customRange }),
      numericRow({ text: 'Long Break Time', key: 'longBreakMinutes', prefix: 'longBreak', unit: 'min',
        presets: durations.longBreakPresets, bounds: durations.customRange }),
      // The range is small, so one tap per step is already instant: no presets.
      numericRow({ text: 'Number of Sessions', key: 'sessionsBeforeLongBreak', prefix: 'sessions',
        bounds: durations.sessionsRange }),
      musicRow(),
    );
    return panel;
  };

  const save = () => {
    if (!isDirty()) return;
    onSave({ ...draft });
    baseline = { ...draft };
    paint();
    note.textContent = 'Saved';
    noteTimer = setTimeout(clearNote, SAVED_NOTE_MS);
  };

  // RESET only moves the draft. Nothing is lost until SAVE, so the button cannot destroy
  // anything by itself.
  const reset = () => change({ ...durations.default, musicStyle: config.musicStyles[0] });

  const buildActions = () => {
    const actions = document.createElement('div');
    actions.className = 'settings-actions';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'big-btn secondary';
    resetBtn.dataset.action = 'reset-settings';
    resetBtn.textContent = 'Reset to default';
    resetBtn.addEventListener('click', reset);

    const saveBtn = document.createElement('button');
    const live = isDirty();
    saveBtn.className = 'big-btn' + (live ? '' : ' dimmed');
    saveBtn.dataset.action = 'save-settings';
    saveBtn.disabled = !live;
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', save);

    actions.append(resetBtn, saveBtn);
    return actions;
  };

  // Leaving with unsaved changes asks first; the card lives inside this screen so it
  // disappears with it. A clean draft leaves at once.
  const askBeforeLeaving = () => {
    if (!isDirty()) { onBack(); return; }
    if (section.querySelector('.confirm-overlay')) return;

    const button = (className, action, text, onClick) => {
      const btn = document.createElement('button');
      btn.className = className;
      btn.dataset.action = action;
      btn.textContent = text;
      btn.addEventListener('click', onClick);
      return btn;
    };
    const title = document.createElement('p');
    title.className = 'unlock-title';
    title.textContent = 'Save your changes?';
    const card = document.createElement('div');
    card.className = 'unlock-card';
    card.append(
      title,
      button('big-btn', 'confirm-save', 'Save', () => { onSave({ ...draft }); onBack(); }),
      button('big-btn secondary', 'confirm-discard', "Don't save", onBack),
    );
    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay confirm-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Save your changes?');
    overlay.appendChild(card);
    section.appendChild(overlay);
  };

  const panelSlot = document.createElement('div');
  panelSlot.className = 'settings-body';
  const paint = () => panelSlot.replaceChildren(buildPanel(), buildActions(), note);

  const changeDragon = document.createElement('button');
  changeDragon.className = 'big-btn';
  changeDragon.dataset.action = 'change-dragon';
  changeDragon.textContent = 'Change Dragon';
  if (onChangeDragon) changeDragon.addEventListener('click', onChangeDragon);

  section.append(backButton(askBeforeLeaving), screenTitle('Settings'), panelSlot, changeDragon);
  paint();
  return section;
};
