# Pomodoro Fantasy: a front door, and a new name

## Objective

Give the app a title screen — POMODORO FANTASY, a Start button and a link to instructions —
and rename the product from Pomodoro Dragon to Pomodoro Fantasy, repository and URL included.

## Problem

The app opens straight into whatever state the save file left behind: the dragon chooser on a
first run, the timer otherwise. There is no front door, nothing that names the thing, and
nowhere that explains how it works. A child who has not used it in a month, or an adult seeing
it for the first time, gets a timer and a dragon and has to guess the rest.

## Decisions taken

| Decision | Value | Who decided |
|---|---|---|
| A title screen with Start and an instructions link | yes | user |
| Its name | Pomodoro Fantasy | user |
| Rename the whole product, repo and URL | yes | user, after being shown the cost |
| **The save key does NOT change** | `pomodoro-dragon-save-v1` | assistant — see below |
| The title screen appears on every launch | assistant — that is what a title screen is |
| Instructions written here, reviewed by the user | assistant |

### What the rename costs, corrected

When this was offered, the option said the save would be lost unless migrated. **That was
wrong, and the correction matters.** `localStorage` is scoped to the ORIGIN
(`https://inigo-munoz.github.io`), never to the path, and the key is a plain string with no
knowledge of the base path. Moving from `/pomodoro-dragon/` to `/pomodoro-fantasy/` keeps the
same origin, so the coins, the dragon, the lair and the record all survive by themselves.

What genuinely breaks is the **installed PWA**: `scope` and `start_url` in the manifest move to
the new path, so the app already installed on the tablet is orphaned and must be removed and
installed again. Its data is not the casualty; its shortcut is.

**Therefore the storage key stays `pomodoro-dragon-save-v1` forever.** It is the one string in
the codebase that must not follow the rename — changing it is the only action that would
actually throw away the child's progress. It needs a comment saying so, because it will look
like an oversight to the next person.

## Scope

**In scope**
- `src/ui/titleScreen.js`: the name, a Start button, a link to the instructions.
- `src/ui/instructionsScreen.js`: how the app works, in plain English, for a child.
- Routing: the title screen is the first screen on every launch; Start goes where the app
  used to go on load (the chooser with no dragon, the timer otherwise).
- The rename in `index.html`, `vite.config.js` (`base` and the manifest `name`/`short_name`)
  and `package.json`.
- Renaming the GitHub repository, then pushing so Pages rebuilds at the new path.

**Out of scope**
- Changing `config.storageKey`. See above. This is a hard constraint, not a preference.
- New art. The title screen uses what the app already has.
- A first-run-only variant, onboarding flow or tutorial overlay.
- Migrating or renaming anything inside the save file.

## Constraints

- Strict TDD. Runner `npm test -- --run`. Baseline: **28 files / 426 tests green**.
- RDD is off globally; ordinary checks only.
- UI copy stays English.
- The title screen must not assume a dragon exists: it renders before any choice is made, so
  it runs on the default palette, which has no backdrop and emoji icons.
- Every asset path goes through `assetUrl()`.
- `src/app.test.js` drives the app from load and will now meet the title screen first. Many of
  its tests will need to pass through it; do that with a helper, not by weakening assertions.

## Tasks

- [ ] **F1. The two screens.** `titleScreen.js` and `instructionsScreen.js`, in the idiom of
      the other screens. Instructions cover: work blocks and the break, the long break after
      four, coins for finishing work, food to grow the dragon, the lair and its shelf, and the
      record. No guilt language, per the rule frozen in `lairScreen.test.js`.
- [ ] **F2. Make it the front door.** The title screen is what `render()` shows on load; Start
      routes to the chooser or the timer exactly as before. Back from the instructions returns
      to the title screen.
- [ ] **F3. The rename.** `index.html` title, `vite.config.js` base and manifest, and
      `package.json`. **Leave `config.storageKey` alone**, with a comment explaining why.
- [ ] **F4. The repository.** Rename on GitHub, push, verify FROM THE SERVER, and tell the user
      to reinstall the PWA on the tablet.

## Acceptance criteria

1. Launching the app shows POMODORO FANTASY with a Start button and an instructions link.
2. Start opens the dragon chooser when no dragon has been chosen, and the timer when one has.
3. The instructions explain every system the app has, and return to the title screen.
4. A save written before this change still loads afterwards with nothing lost.
5. The name reads Pomodoro Fantasy in the tab title and in the installed app's name.
6. `config.storageKey` is unchanged and a test pins it.
7. `npm test -- --run` green, `npm run build` succeeds.
8. The new URL serves the new bundle, verified by curl, not by opening the page.

## Checks

- `npm test -- --run` at the close of every task.
- `npm run build` before the rename.
- After pushing: compare the served bundle name against the local build, and curl the new
  assets for status, content-type and byte size.

## Progress

- Branch `feat/pomodoro-fantasy`, off `main` at `14346ab`.
- Nothing implemented yet.

## Next step

F1 — the two screens.
