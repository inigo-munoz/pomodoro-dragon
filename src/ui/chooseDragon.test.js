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
});
