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
});
