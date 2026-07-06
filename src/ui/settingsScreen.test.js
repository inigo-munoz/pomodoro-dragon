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
});
