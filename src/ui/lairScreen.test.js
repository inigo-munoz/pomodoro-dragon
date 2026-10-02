import { describe, it, expect, vi } from 'vitest';
import { renderLairScreen } from './lairScreen.js';
import { furniture, slots } from '../data/furniture.js';
import { getDragon } from '../data/dragons.js';

const dragon = getDragon('frost');

const ctx = (over = {}) => ({
  state: { dragonId: 'frost', coins: 0, lairs: {} },
  dragon,
  xp: 0,
  theme: { furniture: {}, room: '🕳️' },
  furniture,
  onPickSlot: vi.fn(),
  onBack: vi.fn(),
  ...over,
});

const withSlots = (saved) => ({
  dragonId: 'frost', coins: 0,
  lairs: { frost: { owned: Object.values(saved), slots: saved } },
});

describe('lair screen', () => {
  it('renders exactly the four slots as buttons', () => {
    const el = renderLairScreen(ctx());
    const found = [...el.querySelectorAll('button[data-slot]')].map((b) => b.dataset.slot);
    expect(found).toEqual(slots);
  });

  it('renders four empty slots with a + for an undecorated dragon', () => {
    const el = renderLairScreen(ctx());
    const empties = el.querySelectorAll('[data-slot].is-empty');
    expect(empties).toHaveLength(4);
    for (const b of empties) expect(b.textContent).toContain('+');
  });

  it('renders themed art for a stored item', () => {
    const el = renderLairScreen(ctx({
      state: withSlots({ floorLeft: 'bed' }),
      theme: { furniture: { bed: 'art/lair/frost-bed.webp' }, room: '🕳️' },
    }));
    const slot = el.querySelector('[data-slot="floorLeft"]');
    expect(slot.classList.contains('is-empty')).toBe(false);
    expect(slot.querySelector('img.art-img').getAttribute('src')).toContain('frost-bed.webp');
  });

  it('falls back to the item emoji when the theme has no art, with no broken img', () => {
    const el = renderLairScreen(ctx({ state: withSlots({ floorRight: 'chest' }) }));
    const slot = el.querySelector('[data-slot="floorRight"]');
    expect(slot.textContent).toContain('🧰');
    expect(slot.querySelector('img')).toBeNull();
  });

  it('shows the dragon at the level art for its xp', () => {
    const low = renderLairScreen(ctx({ xp: 0 }));
    const high = renderLairScreen(ctx({ xp: 150 }));
    expect(low.querySelector('.dragon-art')).not.toBeNull();
    expect(high.querySelector('img.dragon-art').getAttribute('src')).toContain('frost-baby.webp');
    expect(low.querySelector('.dragon-art').outerHTML)
      .not.toBe(high.querySelector('.dragon-art').outerHTML);
  });

  it('puts the room inside a .lair-bg wrapper, emoji or image alike', () => {
    const emoji = renderLairScreen(ctx());
    expect(emoji.querySelector('.lair-room > .lair-bg .art-emoji').textContent).toBe('🕳️');
    const img = renderLairScreen(ctx({ theme: { furniture: {}, room: 'art/lair/frost-room.webp' } }));
    expect(img.querySelector('.lair-room > .lair-bg img.art-img')).not.toBeNull();
  });

  it('renders without a wrapper or an error when the theme has no room', () => {
    const el = renderLairScreen(ctx({ theme: { furniture: {} } }));
    expect(el.querySelector('.lair-bg')).toBeNull();
    expect(el.querySelectorAll('[data-slot]')).toHaveLength(4);
  });

  it('opens the picker for an empty slot and for a filled slot, changing nothing', () => {
    const state = withSlots({ wall: 'banner' });
    const before = JSON.stringify(state);
    const onPickSlot = vi.fn();
    const el = renderLairScreen(ctx({ state, onPickSlot }));
    el.querySelector('[data-slot="corner"]').click();
    el.querySelector('[data-slot="wall"]').click();
    expect(onPickSlot.mock.calls).toEqual([['corner'], ['wall']]);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('labels slots for assistive tech according to their state', () => {
    const el = renderLairScreen(ctx({ state: withSlots({ wall: 'banner' }) }));
    expect(el.querySelector('[data-slot="wall"]').getAttribute('aria-label')).toBe('Change the wall');
    expect(el.querySelector('[data-slot="floorLeft"]').getAttribute('aria-label'))
      .toBe('Add something to the left floor');
    expect(el.querySelector('[data-slot="floorRight"]').getAttribute('aria-label'))
      .toBe('Add something to the right floor');
    expect(el.querySelector('[data-slot="corner"]').getAttribute('aria-label'))
      .toBe('Add something to the corner');
  });

  it('calls onBack from the back control', () => {
    const onBack = vi.fn();
    const el = renderLairScreen(ctx({ onBack }));
    el.querySelector('.back-btn').click();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders a slot empty when the saved id left the catalogue', () => {
    const el = renderLairScreen(ctx({ state: withSlots({ wall: 'gone' }) }));
    expect(el.querySelector('[data-slot="wall"]').classList.contains('is-empty')).toBe(true);
  });

  it('renders a slot empty when the saved item belongs to another slot', () => {
    const el = renderLairScreen(ctx({ state: withSlots({ wall: 'bed' }) }));
    expect(el.querySelector('[data-slot="wall"]').classList.contains('is-empty')).toBe(true);
  });

  it('shows a bed saved under wall and floorLeft only in floorLeft', () => {
    const el = renderLairScreen(ctx({
      state: { dragonId: 'frost', coins: 0,
        lairs: { frost: { owned: ['bed'], slots: { wall: 'bed', floorLeft: 'bed' } } } },
    }));
    expect(el.querySelector('[data-slot="wall"]').classList.contains('is-empty')).toBe(true);
    expect(el.querySelector('[data-slot="floorLeft"]').textContent).toContain('🛏️');
    expect(el.textContent.split('🛏️').length - 1).toBe(1);
  });

  it('offers no drag affordance', () => {
    const el = renderLairScreen(ctx({ state: withSlots({ wall: 'banner' }) }));
    expect(el.querySelectorAll('[draggable]')).toHaveLength(0);
    expect(el.outerHTML).not.toMatch(/draggable|ondrag|pointermove|touchmove/i);
  });

  it('uses no punitive copy', () => {
    const el = renderLairScreen(ctx());
    expect(el.textContent).not.toMatch(/hungry|lost|missed|neglect|streak|warning/i);
  });

  it('names the screen "Lair", as a sibling before the room', () => {
    const el = renderLairScreen(ctx());
    const title = el.querySelector('.screen-title');
    expect(title.textContent).toBe('Lair');
    expect(title.parentElement).toBe(el);
    expect(title.nextElementSibling.classList.contains('lair-room')).toBe(true);
  });
});
