# Dragon Art & Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the app image-ready and alive: render art through a single `art()` helper that shows real images (with emoji fallback), and animate the dragon with CSS — without breaking the working emoji-based MVP.

**Architecture:** One `art(value, altText, fallback)` helper is the only code that renders art; it returns an `<img>` for image paths (with an `onerror` swap to the emoji `fallback`) or an emoji `<span>` otherwise. Every art site (main, choose, level-up, shop) appends the helper's element instead of interpolating a string. Data keeps emoji values now plus a `fallback` field, so swapping one string to an image path is all it takes to adopt real art later. Animation is CSS-only, gated by `prefers-reduced-motion`.

**Tech Stack:** Vanilla JS (ES modules), Vite, Vitest + jsdom, plain CSS. No new dependencies.

## Global Constraints

- Each file ideally ≤ ~200 lines.
- Clean architecture: one responsibility per module; content (data) separated from logic.
- Every iteration ends with a code review for dead code and duplication (DRY).
- No new runtime dependencies; animation is CSS only.
- The app must keep working through the whole migration: emoji values still render (via the helper); the app never shows a broken-image icon (emoji fallback on `onerror`).
- Dragon level is derived from XP, never stored (unchanged).
- All code, identifiers, and comments in English.
- Images (when added) live under `public/art/` and are referenced by root path (e.g. `/art/dragons/ember-baby.png`).

## Module Interfaces (canonical — keep consistent across tasks)

```
ui/art.js → isImagePath(value) → boolean
            art(value, altText, fallback) → HTMLElement
              image path  → <img class="art-img" src alt> (onerror → emoji span)
              otherwise   → <span class="art-emoji">value</span>
```

Data entries gain an emoji `fallback` (dragons: per level; foods: per food). `image`/`icon` stay emoji until real PNGs are dropped in `public/art/`.

---

### Task 1: The `art()` helper

**Files:**
- Create: `src/ui/art.js`, `src/ui/art.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `isImagePath(value)`, `art(value, altText, fallback)`.

- [ ] **Step 1: Write the failing test `src/ui/art.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { art, isImagePath } from './art.js';

describe('art helper', () => {
  it('detects image paths vs emoji', () => {
    expect(isImagePath('/art/dragons/ember-baby.png')).toBe(true);
    expect(isImagePath('sprite.webp')).toBe(true);
    expect(isImagePath('🐉')).toBe(false);
  });

  it('renders an <img> with src and alt for an image path', () => {
    const el = art('/art/dragons/ember-baby.png', 'Ember', '🥚');
    expect(el.tagName).toBe('IMG');
    expect(el.getAttribute('src')).toBe('/art/dragons/ember-baby.png');
    expect(el.getAttribute('alt')).toBe('Ember');
    expect(el.classList.contains('art-img')).toBe(true);
  });

  it('renders an emoji span for a non-path value', () => {
    const el = art('🐉', 'dragon', '🥚');
    expect(el.tagName).toBe('SPAN');
    expect(el.classList.contains('art-emoji')).toBe(true);
    expect(el.textContent).toBe('🐉');
  });

  it('falls back to the emoji when the image fails to load', () => {
    const el = art('/art/missing.png', 'Ember', '🥚');
    el.dispatchEvent(new Event('error'));
    // the img has been replaced in place by an emoji span
    expect(el.isConnected).toBe(false); // detached after replaceWith is not observable here;
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/art.test.js`
Expected: FAIL ("Cannot find module './art.js'").

- [ ] **Step 3: Create `src/ui/art.js`**

```js
const IMAGE_RE = /\.(png|webp|svg|jpe?g)$/i;

export const isImagePath = (value) => IMAGE_RE.test(value);

export const art = (value, altText, fallback) => {
  if (isImagePath(value)) {
    const img = document.createElement('img');
    img.className = 'art-img';
    img.src = value;
    img.alt = altText ?? '';
    if (fallback) {
      img.addEventListener('error', () => {
        const span = document.createElement('span');
        span.className = 'art-emoji';
        span.textContent = fallback;
        img.replaceWith(span);
      }, { once: true });
    }
    return img;
  }
  const span = document.createElement('span');
  span.className = 'art-emoji';
  span.textContent = value;
  return span;
};
```

- [ ] **Step 4: Fix the fallback test to assert the replacement properly**

Replace the last test body with one that observes the swap through a parent:

```js
  it('falls back to the emoji when the image fails to load', () => {
    const parent = document.createElement('div');
    const el = art('/art/missing.png', 'Ember', '🥚');
    parent.appendChild(el);
    el.dispatchEvent(new Event('error'));
    expect(parent.querySelector('img')).toBeNull();
    expect(parent.querySelector('.art-emoji').textContent).toBe('🥚');
  });
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/ui/art.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/ui/art.js src/ui/art.test.js
git commit -m "feat: add art() helper for image/emoji rendering with fallback"
```

---

### Task 2: Add emoji `fallback` fields to data

**Files:**
- Modify: `src/data/dragons.js`, `src/data/foods.js`
- Test: `src/data/dragons.test.js` (extend)

**Interfaces:**
- Consumes: nothing.
- Produces: each dragon level and each food carries a `fallback` emoji. `image`/`icon` stay emoji for now.

- [ ] **Step 1: Extend the failing test in `src/data/dragons.test.js`**

Add:

```js
it('every dragon level has an emoji fallback', () => {
  for (const d of dragons) {
    for (const lvl of d.levels) {
      expect(typeof lvl.fallback).toBe('string');
      expect(lvl.fallback.length).toBeGreaterThan(0);
    }
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/dragons.test.js`
Expected: FAIL (`fallback` is undefined).

- [ ] **Step 3: Update `src/data/dragons.js`**

Keep `image` as the emoji and add `fallback` equal to it (so when `image`
later becomes a path, the emoji still backs it):

```js
export const dragons = [
  {
    id: 'ember',
    name: 'Ember',
    levels: [
      { level: 1, xpNeeded: 0,   image: '🥚', fallback: '🥚' },
      { level: 2, xpNeeded: 100, image: '🐉', fallback: '🐉' },
      { level: 3, xpNeeded: 300, image: '🐲', fallback: '🐲' },
    ],
  },
];

export const getDragon = (id) => dragons.find((d) => d.id === id) ?? null;
```

- [ ] **Step 4: Update `src/data/foods.js`**

```js
export const foods = [
  { id: 'apple', name: 'Apple', price: 10, xp: 20,  icon: '🍎', fallback: '🍎' },
  { id: 'meat',  name: 'Meat',  price: 25, xp: 60,  icon: '🍖', fallback: '🍖' },
  { id: 'cake',  name: 'Cake',  price: 50, xp: 150, icon: '🎂', fallback: '🎂' },
];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/data/dragons.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/dragons.js src/data/foods.js src/data/dragons.test.js
git commit -m "feat: add emoji fallback fields to dragon and food data"
```

---

### Task 3: Render all art sites through `art()`

**Files:**
- Modify: `src/ui/mainScreen.js`, `src/ui/chooseDragon.js`, `src/ui/levelUp.js`, `src/ui/shopScreen.js`
- Test: `src/ui/mainScreen.test.js`, `src/ui/levelUp.test.js` (verify still pass; adjust only if needed)

**Interfaces:**
- Consumes: `art(value, altText, fallback)` from Task 1; `fallback` fields from Task 2.
- Produces: each screen appends the art element into a container instead of interpolating a string. Emoji values still render (as `.art-emoji` spans), so existing emoji-based assertions keep passing; when a value becomes an image path, an `<img>` renders automatically.

For every screen: keep the surrounding structure, but replace the inline
`${...image}` / `${...icon}` interpolation with an EMPTY container built via
`innerHTML`, then append `art(...)` into it after setting `innerHTML`.

- [ ] **Step 1: Update `src/ui/mainScreen.js` dragon rendering**

Import at top:

```js
import { art } from './art.js';
```

Change the dragon-stage markup in the `innerHTML` template from
`<div class="dragon-stage"><span class="dragon-art">${level.image}</span></div>`
to an empty stage:

```js
    `<div class="dragon-stage"></div>` +
```

After the `innerHTML` is set (before returning `section`), append the art:

```js
  const dragonArt = art(level.image, dragon.name, level.fallback);
  dragonArt.classList.add('dragon-art', 'alive');
  section.querySelector('.dragon-stage').appendChild(dragonArt);
```

(The `alive` class drives the idle animation added in Task 4. `.dragon-art`
is preserved so existing selectors/tests keep working.)

- [ ] **Step 2: Update `src/ui/chooseDragon.js`**

Import `art`. In the per-dragon loop, replace the
`<span class="dragon-art">${dragon.levels[0].image}</span>` inside the button
`innerHTML` with an empty `<span class="dragon-art"></span>`, then after
setting the button's `innerHTML` append:

```js
    const lvl0 = dragon.levels[0];
    choice.querySelector('.dragon-art')
      .appendChild(art(lvl0.image, dragon.name, lvl0.fallback));
```

- [ ] **Step 3: Update `src/ui/levelUp.js`**

Import `art`. Change `<div class="level-up-art">${level.image}</div>` to
`<div class="level-up-art"></div>`, then after `overlay.innerHTML = ...`:

```js
  overlay.querySelector('.level-up-art')
    .appendChild(art(level.image, dragon.name, level.fallback));
```

- [ ] **Step 4: Update `src/ui/shopScreen.js`**

Import `art`. In the card build, change `<span class="food-icon">${food.icon}</span>`
to `<span class="food-icon"></span>`, then after the card's `innerHTML` is set:

```js
    card.querySelector('.food-icon')
      .appendChild(art(food.icon, food.name, food.fallback));
```

- [ ] **Step 5: Run the affected screen tests**

Run: `npx vitest run src/ui/mainScreen.test.js src/ui/levelUp.test.js src/ui/chooseDragon.test.js src/ui/shopScreen.test.js`
Expected: PASS. The emoji values flow through `art()` as `.art-emoji` spans,
so `.dragon-art`/overlay `textContent` still contains the emoji.
If any assertion referenced the raw span in a way that now fails, update it to
assert against the `.art-emoji` element's `textContent` (do NOT weaken it to
assert nothing).

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add src/ui/
git commit -m "refactor: render all art sites through the art() helper"
```

---

### Task 4: CSS animation (idle, level-up, food, reduced-motion)

**Files:**
- Modify: `src/styles.css`
- Modify: `src/ui/levelUp.js` (add sparkle elements)

**Interfaces:**
- Consumes: the `dragon-art alive` class on the main dragon (Task 3), the
  `.food-card` elements (existing), the `.level-up-art` container.
- Produces: idle float+breathe on the main dragon, a sparkle burst + bounce on
  level up, a tap bounce on food cards, all disabled under
  `prefers-reduced-motion`.

Note: the "eating pulse on the dragon" from the spec is intentionally dropped
— the dragon is not on screen during shopping, so that pulse would never be
seen. Food-card tap bounce covers buy feedback (YAGNI).

- [ ] **Step 1: Add animation CSS to `src/styles.css`**

```css
/* --- art elements --- */
.art-img { width: 100%; height: 100%; object-fit: contain; }
.dragon-stage { width: 60vw; max-width: 260px; aspect-ratio: 1; }
.dragon-art { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; }

/* idle: gentle float + breathe on the main dragon */
.dragon-art.alive { animation: float 3.5s ease-in-out infinite, breathe 2.4s ease-in-out infinite; }
@keyframes float   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes breathe { 0%,100% { scale: 1; } 50% { scale: 1.04; } }

/* level up: bounce in + sparkles */
.level-up-art { position: relative; }
.level-up-art .art-img, .level-up-art .art-emoji { animation: pop-bounce 0.6s ease; }
@keyframes pop-bounce {
  0% { transform: scale(0.2); } 60% { transform: scale(1.15); } 100% { transform: scale(1); }
}
.sparkle { position: absolute; font-size: 1.6rem; animation: sparkle 0.9s ease forwards; }
@keyframes sparkle {
  0% { opacity: 0; transform: scale(0.4) translateY(0); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.3) translateY(-24px); }
}

/* food card tap feedback */
.food-card:active { transform: scale(0.94); }

/* accessibility: calm everything if the user asked for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .dragon-art.alive,
  .level-up-art .art-img, .level-up-art .art-emoji,
  .sparkle { animation: none; }
  .food-card:active { transform: none; }
}
```

- [ ] **Step 2: Add sparkles in `src/ui/levelUp.js`**

After appending the art (Task 3 Step 3), scatter a few sparkles around the art:

```js
  const artBox = overlay.querySelector('.level-up-art');
  for (const [i, pos] of [['0%','0%'], ['80%','10%'], ['20%','75%'], ['70%','70%']].entries()) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = '✨';
    s.style.left = pos[0];
    s.style.top = pos[1];
    s.style.animationDelay = `${i * 0.12}s`;
    artBox.appendChild(s);
  }
```

- [ ] **Step 3: Verify the level-up test still passes**

Run: `npx vitest run src/ui/levelUp.test.js`
Expected: PASS. The overlay still shows the new image/emoji; sparkles are
extra `.sparkle` spans that don't affect the existing assertions. (The overlay
`textContent` now also contains ✨ — if the existing assertion used `toContain`
for the dragon emoji it still passes; if it used `toBe`/exact match, adjust it
to `toContain`.)

- [ ] **Step 4: Run the full suite + build**

Run: `npm test && npm run build`
Expected: all tests green; clean build.

- [ ] **Step 5: Manual verification (with the child later)**

`npm run dev` → the baby dragon (emoji for now) floats and breathes; buying
enough food triggers the level-up bounce + ✨ sparkles; tapping a food card
gives a little squish. Real illustrations will inherit all of this once the
PNGs are dropped in.

- [ ] **Step 6: Commit**

```bash
git add src/styles.css src/ui/levelUp.js
git commit -m "feat: add idle, level-up, and tap animations (reduced-motion aware)"
```

---

### Task 5: ChatGPT prompt pack

**Files:**
- Create: `docs/art-prompts.md`

**Interfaces:** none — a documentation deliverable the user copy-pastes into ChatGPT/DALL·E.

- [ ] **Step 1: Write `docs/art-prompts.md`**

Include: (1) a fixed STYLE PREAMBLE reused in every prompt; (2) the
consistency technique (generate level 1, then feed it back as a reference for
levels 2–3); (3) the transparency instruction; (4) one ready-to-paste prompt
per asset. Full content:

```markdown
# Pomodoro Dragon — Art Prompt Pack (ChatGPT / DALL·E)

## How to use
1. Generate the BABY dragon first. Regenerate until you love it.
2. For YOUNG, attach the baby image and ask for "the SAME dragon, older".
3. For ADULT, attach the young image and ask for "the SAME dragon, grown up".
   Chaining by reference keeps colour, shape, and features consistent so it
   reads as ONE dragon growing.
4. Ask explicitly for a transparent background. If a background still appears,
   remove it afterwards (or ask your helper to).
5. Save as PNG into `public/art/dragons/`, `public/art/foods/`, `public/art/icons/`
   using the exact filenames below. Then in `src/data/dragons.js` / `foods.js`,
   change the `image`/`icon` string to the path, e.g. `/art/dragons/ember-baby.png`.

## Style preamble (reuse in EVERY prompt)
"Children's storybook illustration, soft watercolor style, warm friendly
colours, gentle rounded shapes, centered, front view, square 1:1 composition,
plain fully transparent background, PNG, no text, no scenery, no ground shadow."

## Dragons (file: public/art/dragons/…)
- ember-baby.png — "[style preamble] A cute baby dragon just hatched, big
  gentle eyes, tiny wings, tiny horns, sitting, adorable and shy."
- ember-young.png — "[style preamble] The SAME dragon as the attached image,
  now a young dragon: a bit bigger, slightly longer wings and horns, curious
  and playful, same colours and markings."
- ember-adult.png — "[style preamble] The SAME dragon as the attached image,
  now fully grown: majestic but friendly, larger wings and horns, confident
  and kind, same colours and markings."

## Foods (file: public/art/foods/…)
- apple.png — "[style preamble] A single shiny red apple, cute and appetising."
- meat.png  — "[style preamble] A cartoon drumstick of roasted meat, cute."
- cake.png  — "[style preamble] A small colourful birthday cake with one
  cherry on top, cute."

## UI icons (file: public/art/icons/…) — optional, phase last
- coin.png     — "[style preamble] A single shiny gold coin, cute game icon."
- shop.png     — "[style preamble] A friendly little shop / market basket icon."
- settings.png — "[style preamble] A cute gear / cog settings icon."
- mute.png     — "[style preamble] A cute speaker-with-a-slash mute icon."
- break.png    — "[style preamble] A cute steaming cup of cocoa, rest icon."
```

- [ ] **Step 2: Commit**

```bash
git add docs/art-prompts.md
git commit -m "docs: add ChatGPT art prompt pack"
```

---

### Task 6: Iteration close — dead-code + DRY review

**Files:** whole `src/` tree.

**Interfaces:** none — the mandatory end-of-iteration review.

- [ ] **Step 1: Dead-code sweep**

Confirm every `art()` art site actually imports and uses the helper; no
leftover inline emoji interpolation remains in the four screens
(`rg -n "class=\"dragon-art\">\\\$\{|class=\"food-icon\">\\\$\{" src/ui` → none).

- [ ] **Step 2: DRY sweep**

Confirm art rendering exists in exactly ONE place (`art()`), and no screen
re-implements image/emoji branching. Confirm animation lives only in
`styles.css`, not inlined in JS.

- [ ] **Step 3: File-size check**

Confirm no `src/` file exceeds ~200 lines (report each art-touched file's count).

- [ ] **Step 4: Full suite + build**

Run: `npm test && npm run build`
Expected: all green; clean build.

- [ ] **Step 5: Commit (only if changes were made)**

```bash
git add -A
git commit -m "refactor: dead-code and DRY sweep after art iteration"
```
If nothing needed changing, report "no changes needed" with the evidence.

---

## Self-Review (author checklist — completed)

**Spec coverage:**
- `art()` helper + emoji fallback → Task 1.
- Data `fallback` fields + gradual migration → Task 2.
- All art sites through `art()` → Task 3.
- Asset organization under `public/art/` → documented in Task 5 (prompt pack)
  and Task 2 data comments; no code depends on the files existing (emoji until
  swapped).
- Animation (idle float/breathe, level-up bounce+sparkle, food tap,
  prefers-reduced-motion) → Task 4. (Eating pulse deliberately dropped — not
  visible during shopping; noted in Task 4.)
- Prompt pack + consistency technique + transparency → Task 5.
- Testing: `art()` unit test (Task 1); screen tests kept green (Task 3/4).

**Placeholder scan:** No TBD/TODO. Every code step has complete code.

**Type consistency:** `art(value, altText, fallback)` and `isImagePath(value)`
are used identically across Tasks 1, 3, 4. `fallback` field name consistent
across data (Task 2) and call sites (Task 3).

## Out of scope
- Generating the images (user does this in ChatGPT/DALL·E per Task 5).
- Image downscaling/optimization tooling (manual step; noted in spec §4).
- Animated GIF/video assets.
- New dragons/levels (ambitious iteration).
