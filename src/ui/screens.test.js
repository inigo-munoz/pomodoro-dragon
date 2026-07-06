import { describe, it, expect } from 'vitest';
import { createScreenManager } from './screens.js';

describe('screen manager', () => {
  it('shows only the requested screen', () => {
    const root = document.createElement('div');
    const a = document.createElement('section'); a.textContent = 'A';
    const b = document.createElement('section'); b.textContent = 'B';
    const mgr = createScreenManager(root, { a, b });

    mgr.show('a');
    expect(root.textContent).toBe('A');

    mgr.show('b');
    expect(root.textContent).toBe('B');
  });
});
