import { describe, it, expect, vi } from 'vitest';
import { renderSettingsScreen } from './settingsScreen.js';
import { config } from '../data/config.js';

const settings = { workMinutes: 15, breakMinutes: 5 };

describe('settings screen', () => {
  it('selecting a work preset reports the new settings', () => {
    const onChange = vi.fn();
    const el = renderSettingsScreen({ settings, config, onChange, onBack: () => {} });
    el.querySelector('[data-work-preset="25"]').click();
    expect(onChange).toHaveBeenCalledWith({ workMinutes: 25, breakMinutes: 5 });
  });

  it('the + stepper increases work minutes within range', () => {
    const onChange = vi.fn();
    const el = renderSettingsScreen({ settings, config, onChange, onBack: () => {} });
    el.querySelector('[data-step="work-plus"]').click();
    expect(onChange).toHaveBeenCalledWith({ workMinutes: 16, breakMinutes: 5 });
  });

  it('does not step below the minimum of the range', () => {
    const onChange = vi.fn();
    const atMin = { workMinutes: config.durations.customRange.min, breakMinutes: 5 };
    const el = renderSettingsScreen({ settings: atMin, config, onChange, onBack: () => {} });
    el.querySelector('[data-step="work-minus"]').click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders a Change Dragon button that invokes onChangeDragon', () => {
    const onChangeDragon = vi.fn();
    const el = renderSettingsScreen({ settings, config, onChange: () => {},
      onBack: () => {}, onChangeDragon });
    const btn = el.querySelector('[data-action="change-dragon"]');
    expect(btn).not.toBeNull();
    btn.click();
    expect(onChangeDragon).toHaveBeenCalled();
  });

  describe('music style', () => {
    const withStyle = (musicStyle) => ({ ...settings, musicStyle });
    const render = (musicStyle, onChange = () => {}) =>
      renderSettingsScreen({ settings: withStyle(musicStyle), config, onChange, onBack: () => {} });

    it('renders a Cozy and a Lofi button', () => {
      const el = render('cozy');
      const labels = [...el.querySelectorAll('[data-music-preset]')].map((b) => b.textContent);
      expect(labels).toEqual(['Cozy', 'Lofi']);
    });

    it('marks only the current style active, with the shared preset classes', () => {
      const el = render('lofi');
      const cozy = el.querySelector('[data-music-preset="cozy"]');
      const lofi = el.querySelector('[data-music-preset="lofi"]');
      expect(lofi.classList.contains('preset')).toBe(true);
      expect(lofi.classList.contains('active')).toBe(true);
      expect(cozy.classList.contains('active')).toBe(false);
    });

    it('choosing a style reports the new settings and keeps the durations', () => {
      const onChange = vi.fn();
      const el = render('cozy', onChange);
      el.querySelector('[data-music-preset="lofi"]').click();
      expect(onChange).toHaveBeenCalledWith({ workMinutes: 15, breakMinutes: 5, musicStyle: 'lofi' });
    });

    it('has no steppers for music', () => {
      expect(render('cozy').querySelector('[data-step^="music"]')).toBeNull();
    });
  });

  it('names the screen "Settings" once, with the back button above it', () => {
    const el = renderSettingsScreen({ settings, config, onChange: vi.fn(), onBack: () => {} });
    const titles = el.querySelectorAll('.screen-title');
    expect(titles).toHaveLength(1);
    expect(titles[0].textContent).toBe('Settings');
    const back = el.querySelector('.back-btn');
    expect(back.compareDocumentPosition(titles[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(el.children[0]).toBe(back);
  });
});
