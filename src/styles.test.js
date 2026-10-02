import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// jsdom computes no layout, so the 48px touch floor is proven by reading the shipped rules.
const css = readFileSync('src/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const rulesFor = (selector) =>
  [...css.matchAll(/\s*([^{}]+)\{([^}]*)\}/g)]
    .filter((m) => m[1].split(',').map((s) => s.trim()).includes(selector))
    .map((m) => m[2]);

describe('48px touch floor', () => {
  it('has one .back-btn rule, carrying the floor, and no per-screen override', () => {
    const rules = rulesFor('.back-btn');
    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatch(/min-height:\s*48px/);
    expect(rules[0]).toMatch(/min-width:\s*48px/);
    expect(css).not.toMatch(/\.settings\s+\.back-btn/);
  });

  it('keeps the screen-bar alignment rule for Back', () => {
    expect(rulesFor('.screen-bar .back-btn').join(' ')).toMatch(/align-self:\s*auto/);
  });

  it('gives every dragon card a 48px minimum height', () => {
    const rules = rulesFor('.dragon-choice');
    expect(rules.some((r) => /min-height:\s*48px/.test(r))).toBe(true);
  });
});

describe('no dead rules', () => {
  it('keeps exactly one .screen.title justify-content, and no .shelf-tag', () => {
    const centred = rulesFor('.screen.title').filter((r) => /justify-content/.test(r));
    expect(centred).toHaveLength(1);
    expect(css).not.toMatch(/shelf-tag/);
  });
});

describe('the lair dragon stands clear of the floor slots', () => {
  // Geometry pinned from the stylesheet itself: the dragon's box must end above the top edge
  // of the floor slots, or its feet and tail hide whatever the child placed there. Earlier the
  // box ran 22% + 56% = 78% down a room whose floor slots start at 73%, and the bed, the
  // cushion and the pet were partly behind it. jsdom computes no layout; the CSS is the fact.
  const pct = (rule, prop) => Number(new RegExp(`${prop}:\\s*([\\d.]+)%`).exec(rule)?.[1]);
  const rule = (selector) => css.split('\n').find((line) => line.startsWith(selector)) ?? '';

  it('ends above the floor slots', () => {
    const dragon = rule('.lair-room > .dragon-art');
    const slot = rule('.lair-slot {');
    const floor = rule('.lair-slot[data-slot="floorLeft"]');
    const dragonBottom = pct(dragon, 'top') + pct(dragon, 'height');
    const floorTop = 100 - pct(floor, 'bottom') - pct(slot, 'height');
    expect(dragonBottom).toBeLessThanOrEqual(floorTop);
  });

  it('stays centred', () => {
    const dragon = rule('.lair-room > .dragon-art');
    expect(pct(dragon, 'left') * 2 + pct(dragon, 'width')).toBe(100);
  });
});
