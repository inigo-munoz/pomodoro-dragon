import { describe, it, expect, vi } from 'vitest';
import { renderRecordScreen } from './recordScreen.js';

// Friday 2 October 2026, local, so the week runs Sat 26 Sep .. Fri 2 Oct.
const now = new Date(2026, 9, 2, 18, 0).getTime();

const ctx = (history = {}, over = {}) => ({
  state: { coins: 12, history },
  now,
  theme: { icons: {} },
  onBack: vi.fn(),
  ...over,
});

const days = (el) => [...el.querySelectorAll('[data-day]')];

describe('record screen', () => {
  it('follows the other screens: bar with back and coins, then a Record title', () => {
    const el = renderRecordScreen(ctx());
    expect(el.className).toBe('screen record');
    expect(el.querySelector('.screen-bar .back-btn')).not.toBeNull();
    expect(el.querySelector('.screen-bar .coin-counter').textContent).toContain('12');
    expect(el.querySelector('.screen-title').textContent).toBe('Record');
  });

  it('the back button calls onBack', () => {
    const onBack = vi.fn();
    renderRecordScreen(ctx({}, { onBack })).querySelector('.back-btn').click();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows seven days, oldest first, ending today', () => {
    const el = renderRecordScreen(ctx());
    expect(days(el).map((d) => d.dataset.day)).toEqual([
      '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29',
      '2026-09-30', '2026-10-01', '2026-10-02',
    ]);
    expect(days(el).map((d) => d.querySelector('.record-day-name').textContent))
      .toEqual(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  });

  it('marks today, and only today', () => {
    const el = renderRecordScreen(ctx());
    const marked = el.querySelectorAll('.is-today');
    expect(marked).toHaveLength(1);
    expect(marked[0].dataset.day).toBe('2026-10-02');
    expect(marked[0].getAttribute('aria-current')).toBe('date');
  });

  it('shows each day\'s count and a bar that grows with the blocks', () => {
    const el = renderRecordScreen(ctx({
      '2026-10-02': { blocks: 4, minutes: 100 },
      '2026-10-01': { blocks: 2, minutes: 50 },
    }));
    const [today, yesterday] = [days(el)[6], days(el)[5]];
    expect(today.querySelector('.record-count').textContent).toBe('4');
    expect(yesterday.querySelector('.record-count').textContent).toBe('2');
    const h = (d) => parseFloat(d.querySelector('.record-bar').style.height);
    expect(h(today)).toBe(100);
    expect(h(yesterday)).toBe(50);
  });

  it('renders a day with nothing as an empty slot, with no message and no number', () => {
    const el = renderRecordScreen(ctx({ '2026-10-02': { blocks: 1, minutes: 25 } }));
    const empty = days(el)[0];
    expect(empty.querySelector('.record-count').textContent).toBe('');
    expect(parseFloat(empty.querySelector('.record-bar').style.height)).toBe(0);
    expect(empty.textContent).toBe('Sat');
  });

  it('renders a whole empty week without any message', () => {
    const el = renderRecordScreen(ctx());
    expect(days(el)).toHaveLength(7);
    expect(el.querySelector('.record-total').textContent).toBe('You have finished 0 blocks in all.');
  });

  it('words the all-time total as something she did, over the whole history', () => {
    const el = renderRecordScreen(ctx({
      '2026-08-01': { blocks: 10, minutes: 250 },
      '2026-10-02': { blocks: 3, minutes: 75 },
    }));
    expect(el.querySelector('.record-total').textContent).toBe('You have finished 13 blocks in all.');
  });

  it('says "block" for exactly one', () => {
    const el = renderRecordScreen(ctx({ '2026-10-02': { blocks: 1, minutes: 25 } }));
    expect(el.querySelector('.record-total').textContent).toBe('You have finished 1 block in all.');
  });

  it('never uses the language of guilt, with or without history (frozen product decision)', () => {
    const full = {
      '2026-10-02': { blocks: 4, minutes: 100 },
      '2026-09-30': { blocks: 1, minutes: 25 },
    };
    for (const history of [{}, full]) {
      const el = renderRecordScreen(ctx(history));
      expect(el.textContent).not.toMatch(/hungry|lost|missed|neglect|streak|warning/i);
      expect(el.innerHTML).not.toMatch(/hungry|lost|missed|neglect|streak|warning/i);
    }
  });
});
