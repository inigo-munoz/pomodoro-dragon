import { describe, it, expect, vi } from 'vitest';
import { renderInstructionsScreen } from './instructionsScreen.js';
import { config } from '../data/config.js';

describe('instructions screen', () => {
  it('follows the other screens: back button, then a "How it works" title', () => {
    const el = renderInstructionsScreen({ onBack: () => {} });
    expect(el.className).toBe('screen instructions');
    expect(el.querySelector('.screen-bar .back-btn')).not.toBeNull();
    expect(el.querySelector('.screen-title').textContent).toBe('How it works');
  });

  it('the back button calls onBack', () => {
    const onBack = vi.fn();
    renderInstructionsScreen({ onBack }).querySelector('.back-btn').click();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('states the numbers the app really uses, read from config', () => {
    const text = renderInstructionsScreen({ onBack: () => {} }).textContent;
    expect(text).toContain(String(config.durations.default.sessionsBeforeLongBreak));
    expect(text).toContain(String(config.lairUnlockPrice));
    expect(text).toMatch(new RegExp(`${config.coinsPerMinute} coin`, 'i'));
  });

  it('explains every system: breaks, coins, shop, dragon, lair, record, settings', () => {
    const text = renderInstructionsScreen({ onBack: () => {} }).textContent;
    for (const word of ['break', 'coin', 'Shop', 'Lair', 'Record', 'Settings', 'dragon']) {
      expect(text).toContain(word);
    }
  });

  it('uses no punitive copy', () => {
    const el = renderInstructionsScreen({ onBack: () => {} });
    expect(el.textContent).not.toMatch(/hungry|lost|missed|neglect|streak|warning/i);
  });
});
