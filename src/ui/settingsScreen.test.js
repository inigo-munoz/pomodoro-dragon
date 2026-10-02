import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderSettingsScreen } from './settingsScreen.js';
import { config } from '../data/config.js';

const full = {
  workMinutes: 15, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, musicStyle: 'cozy',
};
const { customRange, sessionsRange } = config.durations;

const render = (overrides = {}, handlers = {}) =>
  renderSettingsScreen({
    settings: { ...full, ...overrides }, config, onSave: vi.fn(), onBack: vi.fn(), ...handlers,
  });
const shown = (el, hook) => el.querySelector(`[data-step="${hook}-plus"]`)
  .closest('.setting-row').querySelector('.value').textContent;
const save = (el) => el.querySelector('[data-action="save-settings"]');

afterEach(() => vi.useRealTimers());

describe('settings screen', () => {
  it('a work preset moves the draft, and nothing is reported until SAVE', () => {
    const onSave = vi.fn();
    const el = render({}, { onSave });
    el.querySelector('[data-work-preset="25"]').click();
    expect(shown(el, 'work')).toBe('25 min');
    expect(onSave).not.toHaveBeenCalled();
    save(el).click();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ ...full, workMinutes: 25 });
  });

  it('the + stepper moves the draft by one and SAVE reports the full object', () => {
    const onSave = vi.fn();
    const el = render({}, { onSave });
    el.querySelector('[data-step="work-plus"]').click();
    expect(shown(el, 'work')).toBe('16 min');
    expect(onSave).not.toHaveBeenCalled();
    save(el).click();
    expect(onSave).toHaveBeenCalledWith({ ...full, workMinutes: 16 });
  });

  it('does not step below the minimum of the range', () => {
    const el = render({ workMinutes: customRange.min });
    el.querySelector('[data-step="work-minus"]').click();
    expect(shown(el, 'work')).toBe(`${customRange.min} min`);
    expect(save(el).disabled).toBe(true);
  });

  it('renders a Change Dragon button that invokes onChangeDragon', () => {
    const onChangeDragon = vi.fn();
    const el = render({}, { onChangeDragon });
    const btn = el.querySelector('[data-action="change-dragon"]');
    expect(btn).not.toBeNull();
    btn.click();
    expect(onChangeDragon).toHaveBeenCalled();
  });

  describe('music style', () => {
    const withStyle = (musicStyle, handlers) => render({ musicStyle }, handlers);

    it('renders a Cozy and a Lofi button', () => {
      const el = withStyle('cozy');
      const labels = [...el.querySelectorAll('[data-music-preset]')].map((b) => b.textContent);
      expect(labels).toEqual(['Cozy', 'Lofi']);
    });

    it('marks only the current style active, with the shared preset classes', () => {
      const el = withStyle('lofi');
      const cozy = el.querySelector('[data-music-preset="cozy"]');
      const lofi = el.querySelector('[data-music-preset="lofi"]');
      expect(lofi.classList.contains('preset')).toBe(true);
      expect(lofi.classList.contains('active')).toBe(true);
      expect(cozy.classList.contains('active')).toBe(false);
    });

    it('choosing a style moves the draft, and SAVE reports it with the durations', () => {
      const onSave = vi.fn();
      const el = withStyle('cozy', { onSave });
      el.querySelector('[data-music-preset="lofi"]').click();
      expect(onSave).not.toHaveBeenCalled();
      expect(el.querySelector('[data-music-preset="lofi"]').classList.contains('active')).toBe(true);
      save(el).click();
      expect(onSave).toHaveBeenCalledWith({ ...full, musicStyle: 'lofi' });
    });

    it('has no steppers for music', () => {
      expect(withStyle('cozy').querySelector('[data-step^="music"]')).toBeNull();
    });
  });

  it('names the screen "Settings" once, with the back button above it', () => {
    const el = render();
    const titles = el.querySelectorAll('.screen-title');
    expect(titles).toHaveLength(1);
    expect(titles[0].textContent).toBe('Settings');
    const back = el.querySelector('.back-btn');
    expect(back.compareDocumentPosition(titles[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(el.children[0]).toBe(back);
  });
});


describe('settings rows', () => {
  it('has one row per setting, in order', () => {
    const labels = [...render().querySelectorAll('.setting-row .setting-label')].map((n) => n.textContent);
    expect(labels).toEqual(['Focus Time', 'Break Time', 'Long Break Time', 'Number of Sessions', 'Music']);
  });

  it('shows each value with its unit, and no unit for sessions', () => {
    const values = [...render().querySelectorAll('.setting-row .value')].map((n) => n.textContent);
    expect(values).toEqual(['15 min', '5 min', '15 min', '4']);
  });

  it('uses arrow glyphs on the steppers', () => {
    const el = render();
    expect(el.querySelector('[data-step="sessions-minus"]').textContent).toBe('◀');
    expect(el.querySelector('[data-step="sessions-plus"]').textContent).toBe('▶');
  });

  it.each([
    ['work', 'workMinutes', customRange, '16 min', '14 min', (n) => `${n} min`],
    ['break', 'breakMinutes', customRange, '6 min', '4 min', (n) => `${n} min`],
    ['longBreak', 'longBreakMinutes', customRange, '16 min', '14 min', (n) => `${n} min`],
    ['sessions', 'sessionsBeforeLongBreak', sessionsRange, '5', '3', String],
  ])('steps %s by one and clamps at both ends', (prefix, key, range, up, down, fmt) => {
    const onSave = vi.fn();
    const el = render({}, { onSave });
    el.querySelector(`[data-step="${prefix}-plus"]`).click();
    expect(shown(el, prefix)).toBe(up);
    el.querySelector(`[data-step="${prefix}-minus"]`).click();
    el.querySelector(`[data-step="${prefix}-minus"]`).click();
    expect(shown(el, prefix)).toBe(down);

    const top = render({ [key]: range.max });
    top.querySelector(`[data-step="${prefix}-plus"]`).click();
    expect(shown(top, prefix)).toBe(fmt(range.max));
    expect(save(top).disabled).toBe(true);

    const bottom = render({ [key]: range.min });
    bottom.querySelector(`[data-step="${prefix}-minus"]`).click();
    expect(shown(bottom, prefix)).toBe(fmt(range.min));
    expect(save(bottom).disabled).toBe(true);
  });

  it('keeps presets for the three durations and none for sessions', () => {
    const el = render();
    expect(el.querySelectorAll('[data-work-preset]')).toHaveLength(3);
    expect(el.querySelectorAll('[data-break-preset]')).toHaveLength(3);
    expect(el.querySelectorAll('[data-longBreak-preset]')).toHaveLength(3);
    expect(el.querySelector('[data-sessions-preset]')).toBeNull();
  });

  it('a long break preset moves the draft and marks itself active', () => {
    const el = render();
    el.querySelector('[data-longBreak-preset="20"]').click();
    expect(shown(el, 'longBreak')).toBe('20 min');
    expect(el.querySelector('[data-longBreak-preset="20"]').classList.contains('active')).toBe(true);
    expect(el.querySelector('[data-longBreak-preset="15"]').classList.contains('active')).toBe(false);
  });
});

describe('save and reset', () => {
  it('SAVE is dimmed and inert while the draft matches what is saved', () => {
    const onSave = vi.fn();
    const el = render({}, { onSave });
    expect(save(el).disabled).toBe(true);
    expect(save(el).classList.contains('dimmed')).toBe(true);
    save(el).click();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('SAVE goes live when the draft differs, and dims again when it is put back', () => {
    const el = render();
    el.querySelector('[data-step="sessions-plus"]').click();
    expect(save(el).disabled).toBe(false);
    expect(save(el).classList.contains('dimmed')).toBe(false);
    el.querySelector('[data-step="sessions-minus"]').click();
    expect(save(el).disabled).toBe(true);
  });

  it('SAVE emits once, becomes the clean baseline and says Saved', () => {
    vi.useFakeTimers();
    const onSave = vi.fn();
    const el = render({}, { onSave });
    el.querySelector('[data-step="longBreak-plus"]').click();
    save(el).click();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ ...full, longBreakMinutes: 16 });
    expect(save(el).disabled).toBe(true);
    save(el).click();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(el.querySelector('.saved-note').textContent).toBe('Saved');
    vi.advanceTimersByTime(3000);
    expect(el.querySelector('.saved-note').textContent).toBe('');
  });

  it('the Saved note goes away as soon as the child changes something else', () => {
    vi.useFakeTimers();
    const el = render();
    el.querySelector('[data-step="work-plus"]').click();
    save(el).click();
    el.querySelector('[data-step="work-plus"]').click();
    expect(el.querySelector('.saved-note').textContent).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('RESET restores every default in the draft and does not emit', () => {
    const onSave = vi.fn();
    const el = render({
      workMinutes: 40, breakMinutes: 9, longBreakMinutes: 30, sessionsBeforeLongBreak: 7, musicStyle: 'lofi',
    }, { onSave });
    el.querySelector('[data-action="reset-settings"]').click();
    expect(shown(el, 'work')).toBe('15 min');
    expect(shown(el, 'break')).toBe('5 min');
    expect(shown(el, 'longBreak')).toBe('15 min');
    expect(shown(el, 'sessions')).toBe('4');
    expect(el.querySelector('[data-music-preset="cozy"]').classList.contains('active')).toBe(true);
    expect(onSave).not.toHaveBeenCalled();
    expect(save(el).disabled).toBe(false);
    save(el).click();
    expect(onSave).toHaveBeenCalledWith(full);
  });

  it('RESET on already-default values leaves SAVE dimmed', () => {
    const el = render();
    el.querySelector('[data-action="reset-settings"]').click();
    expect(save(el).disabled).toBe(true);
  });
});
