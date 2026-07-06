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
