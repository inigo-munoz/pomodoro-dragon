import { describe, it, expect, vi } from 'vitest';
import { showLevelUp } from './levelUp.js';

describe('level up celebration', () => {
  it('shows an overlay with the new level image and dismisses on click', () => {
    const onAudio = vi.fn();
    showLevelUp({ name: 'Frost' }, { level: 2, image: '🐉' }, onAudio);
    const overlay = document.querySelector('.level-up-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain('🐉');
    expect(onAudio).toHaveBeenCalled();

    overlay.click();
    expect(document.querySelector('.level-up-overlay')).toBeNull();
  });
});
