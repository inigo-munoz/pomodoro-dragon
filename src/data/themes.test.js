import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { themes } from './themes.js';

// Every key the UI asks for, read off the themedIcon(theme, '…') calls themselves, so the
// list cannot drift from the code and a key nobody renders cannot creep back in.
const sourceFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const path = join(dir, e.name);
  if (e.isDirectory()) return sourceFiles(path);
  return e.name.endsWith('.js') && !e.name.endsWith('.test.js') ? [path] : [];
});

const usedKeys = [...new Set(sourceFiles('src').flatMap((file) =>
  [...readFileSync(file, 'utf8').matchAll(/themedIcon\([^,()]+,\s*'([^']+)'\)/g)].map((m) => m[1])))]
  .sort();

describe('theme icon sets', () => {
  it('finds the keys the UI uses', () => {
    expect(usedKeys).toEqual(['break', 'coin', 'lair', 'record', 'settings', 'shop', 'sound']);
  });

  it.each(Object.keys(themes))('gives %s exactly the keys the UI uses', (id) => {
    expect(Object.keys(themes[id].icons).sort()).toEqual(usedKeys);
  });
});
