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
