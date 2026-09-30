# Thorn and Tempest — two new dragons

## Objective
Add a third and fourth dragon to Pomodoro Dragon: **Thorn** (forest, plants and trees)
and **Tempest** (air, as a storm). Each needs its own theme and its own full art set, so
it reads as a distinct world rather than a recolour.

## Problem
The app ships two dragons, Frost and Blaze. Two is enough to prove the per-dragon
progression works, but it is a thin choice for a child who picks a dragon and then lives
with it for weeks at a time.

## Why this shape
- **Thorn** is unambiguous: deep greens, moss, bark, amber light through leaves. No
  palette conflicts with anything already in the app.
- **Tempest** was a real design fork. The obvious "air" dragon is pale cyan, white and
  silver — which is Frost. Two dragons that look alike in the chooser is a failure for a
  nine year old picking at a glance. The user chose the storm reading instead: slate,
  electric violet, cloud silver, lightning yellow. That sits far from Frost's ice blue
  and far from Blaze's ember orange.

## Authorized scope
- `src/data/dragons.js` — two new entries, four levels each
- `src/data/themes.js` — two new themes (palette, 5 icons, 3 foods)
- `docs/art-prompts.md` — prompt packs for both
- 24 new art assets: `art-src/**` originals (git-ignored) and `public/art/**` webp
- NOT in scope: changing the progression curve, the food list, or the chooser layout

## Constraints
- Adding a dragon must stay additive. `chooseDragon.test.js` already derives its count
  from `dragons.length`; keep it that way.
- Every theme needs the same palette keys as `frost` and `blaze`, or `applyPalette`
  leaves stale custom properties from the previous theme.
- Icons follow the icon rules in `docs/art-prompts.md`, NOT the illustration rules. This
  was learned the hard way on Blaze: ornate icons became unreadable orange blobs at 32px.
- Judge every asset at the size it renders at, in the running app — never at 1024px.

## Palettes
| | Thorn (forest) | Tempest (storm) |
|---|---|---|
| bg | `#0d1a0f` deep forest | `#16141f` deep slate |
| accent | `#7ac74f` leaf green | `#8b7ae8` electric violet |
| accent-fg | `#0a1f08` | `#120f1c` |
| xp-fill | `#c8e66b` young shoot | `#ffe14d` lightning |
| card | `#17301b` | `#252235` |
| back-btn | `#a8dd8a` | `#bfb4ff` |

## Delivery
Branch `feat/thorn-tempest-dragons`, stacked on `feat/blaze-art` because it builds on the
icon rules documented there and edits the same `docs/art-prompts.md`.
Strategy: `ask-on-risk`. Forecast is roughly 210 authored lines, under the ~400 slice
budget, so one slice.

## Tasks
- [x] **T1** Write the Thorn and Tempest prompt packs into `docs/art-prompts.md`
      (4 dragons + 3 foods + 5 icons each; icons use the icon rules block)
      — route: inline, single file
- [x] **T2** Add both dragons to `src/data/dragons.js` and both themes to
      `src/data/themes.js`; confirm the suite still passes
      — route: INLINE, not delegated. Both edits are purely additive data blocks fully
      specified in the Palettes table above, so a writer brief would have restated them.
- [ ] **T3** Generate and ingest the 12 Thorn assets
      — route: inline browser work, not delegable
- [ ] **T4** Generate and ingest the 12 Tempest assets
      — route: inline browser work, not delegable
- [ ] **T5** Verify in the running app: chooser shows four distinct dragons, each theme
      applies, every icon is legible at its rendered size; `npm test` and `npm run build`

## Acceptance criteria
- Four dragons in the chooser, each instantly distinguishable at thumbnail size
- Selecting each one applies its palette and swaps all 5 icons and 3 foods
- No emoji fallbacks left on any screen for the new dragons
- Tests and build green

## Progress
- **T1 done.** 24 prompts appended to `docs/art-prompts.md` (12 Thorn, 12 Tempest).
  Both icon sets carry the icon-rules prefix block, not the illustration rules.
- **T2 done.** Both dragons in `dragons.js`, both themes in `themes.js`. Verified by
  script that all four themes expose an identical palette key set, 5 icons and 3 foods
  each, and that no dragon references a missing theme. `npm test` 63 passed.
- Checked before committing code ahead of art: `art()` swaps in a fallback on image
  error and `themedIcon` passes the default emoji as that fallback, so Thorn and Tempest
  degrade to emoji until their assets land rather than showing broken images.

## Next step
T3 — generate and ingest the 12 Thorn assets.
