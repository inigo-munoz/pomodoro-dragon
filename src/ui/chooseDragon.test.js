import { describe, it, expect, vi } from 'vitest';
import { renderChooseDragon } from './chooseDragon.js';
import { dragons } from '../data/dragons.js';

describe('choose dragon screen', () => {
  it('renders a choice per dragon and reports the picked id', () => {
    const onPick = vi.fn();
    const el = renderChooseDragon({ dragons, onPick });
    const choices = el.querySelectorAll('.dragon-choice');
    expect(choices).toHaveLength(dragons.length);
    el.querySelector('[data-dragon="frost"]').click();
    expect(onPick).toHaveBeenCalledWith('frost');
  });

  it('marks the current dragon when currentId is given', () => {
    const el = renderChooseDragon({ dragons, onPick: vi.fn(), currentId: 'frost' });
    expect(el.querySelector('[data-dragon="frost"]').classList.contains('current')).toBe(true);
    expect(el.querySelector('[data-dragon="blaze"]').classList.contains('current')).toBe(false);
  });

  it('names the screen "Dragons" and keeps the instruction as a lead line', () => {
    const el = renderChooseDragon({ dragons, onPick: vi.fn() });
    expect(el.querySelector('.screen-title').textContent).toBe('Dragons');
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    const lead = el.querySelector('p.screen-lead');
    expect(lead.textContent).toBe('Choose your dragon!');
    expect(el.querySelector('.screen-title').nextElementSibling).toBe(lead);
  });
});
