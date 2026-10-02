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

  describe('reads the child\'s own settings', () => {
    const own = { workMinutes: 10, breakMinutes: 3, longBreakMinutes: 20, sessionsBeforeLongBreak: 2, musicStyle: 'lofi' };
    const textOf = (settings) => renderInstructionsScreen({ onBack: () => {}, settings }).textContent;

    it('says the saved cycle, block and break lengths, not the defaults', () => {
      const text = textOf(own);
      expect(text).toContain('After 2 work blocks');
      expect(text).toContain('20 minutes');
      expect(text).toContain('10 minutes');
      expect(text).toContain('3 minutes');
      expect(text).not.toContain(`After ${config.durations.default.sessionsBeforeLongBreak} work blocks`);
      expect(text).not.toContain(`${config.durations.default.longBreakMinutes} minutes`);
    });

    it('falls back to the defaults when there is no save yet', () => {
      const d = config.durations.default;
      const text = textOf(undefined);
      expect(text).toContain(`After ${d.sessionsBeforeLongBreak} work blocks`);
      expect(text).toContain(`${d.workMinutes} minutes`);
      expect(text).toContain(`${d.breakMinutes} minutes`);
      expect(text).toContain(`${d.longBreakMinutes} minutes`);
    });

    it('still reads the lair price and the coin rate from config', () => {
      const text = textOf(own);
      expect(text).toContain(String(config.lairUnlockPrice));
      expect(text).toMatch(new RegExp(`${config.coinsPerMinute} coin`, 'i'));
    });
  });

  describe('quests', () => {
    const el = () => renderInstructionsScreen({ onBack: () => {} });

    it('mentions that quests pay coins and are shown on the Record', () => {
      const step = [...el().querySelectorAll('.instruction-step')]
        .find((li) => /quest/i.test(li.textContent));
      expect(step).toBeDefined();
      expect(step.textContent).toContain('Record');
      expect(step.textContent).toMatch(/coin/i);
    });

    it('never reads as a target, a deadline or a scolding', () => {
      const text = el().textContent;
      expect(text).not.toMatch(/hungry|lost|missed|neglect|streak|warning/i);
      expect(text).not.toMatch(/expire|deadline|late|fail/i);
    });
  });
});
