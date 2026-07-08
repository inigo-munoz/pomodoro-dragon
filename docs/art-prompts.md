# Pomodoro Dragon — Art Prompt Pack (Frost / Dark-Fantasy edition)

Art direction: the whole app is themed around ONE frost dragon, in the glacial,
mystical, dark-fantasy watercolor world of the reference character (the antlered
frost-elf your daughter loves). Cold but friendly and enchanting — never scary,
never gory.

## How to use
1. Open the reference character illustration in ChatGPT and attach it to EVERY
   prompt as a **style reference**. Say: "Match the art style, mood and colour
   palette of the attached image. The SUBJECT is different (see below)."
2. Generate the BABY dragon first. Regenerate until you love it.
3. For YOUNG, attach the baby image too and ask for "the SAME dragon, older".
4. For ADULT, attach the young image and ask for "the SAME dragon, grown up".
   Chaining by reference keeps colour, shape and features consistent so it reads
   as ONE dragon growing.
5. Always ask explicitly for a **transparent background**. If one still appears,
   remove it afterwards.
6. Save each as PNG into `art-src/dragons/`, `art-src/foods/`, `art-src/icons/`
   (the high-res originals — these are git-ignored, kept only on disk).
7. Optimize each PNG to a small `.webp` (this repo's shipping format):
   ```
   convert art-src/<group>/<name>.png -resize 512x512 -quality 82 \
     -define webp:method=6 public/art/<group>/<name>.webp
   ```
   1024px watercolor at 512 is indistinguishable on a tablet and ~40× lighter.
8. The code is already image-ready — point the `image`/`icon` strings in
   `src/data/dragons.js` / `foods.js` to `/art/<group>/<name>.webp`.

Each prompt below is COMPLETE and standalone — attach the reference image and
paste one prompt as-is. Save with the filename in its heading.

## Dragons (save to art-src/dragons/)

The dragon's FIRST phase is ALWAYS an egg (level 1), then it hatches and grows:
egg → baby → young → adult. Every dragon needs its own egg image too.

### frost-egg.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single closed, UNHATCHED frost-dragon egg — pale blue-white shell dusted with frost and delicate snowflake patterns, a faint inner cyan glow, cute and magical. No dragon visible, just the egg.
```

### frost-baby.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, cold but warm-hearted and friendly — NOT scary, NOT gory. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute baby frost dragon just hatched from an icy egg — pale blue-white scales dusted with frost, big gentle glowing cyan eyes, tiny crystalline wings, tiny antler-like ice horns echoing elk antlers, sitting, adorable and shy, a faint aurora glow around it.
```

### frost-young.png
```
Attach BOTH the reference image and the baby dragon you just made. Keep the SAME dragon as the baby image — same icy colours, markings and features — and match the art style, mood and colour palette. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, cold but warm-hearted and friendly — NOT scary, NOT gory. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME frost dragon, now a YOUNG dragon — a bit bigger, longer crystalline wings, small branching antler-like frost horns, curious and playful.
```

### frost-adult.png
```
Attach BOTH the reference image and the young dragon you just made. Keep the SAME dragon as the young image — same icy colours, markings and features — and match the art style, mood and colour palette. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, cold but warm-hearted and friendly — NOT scary, NOT gory. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME frost dragon, now FULLY GROWN — majestic but kind, large frost-crystal wings, elegant branching antler horns, a soft crown of aurora light, confident and gentle.
```

## Foods — dragon treats (save to art-src/foods/)

### apple.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single enchanted frost-kissed blue apple with a faint cyan glow and tiny ice crystals, cute and appetising.
```

### meat.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a frost-rimed roasted drumstick with an icy sparkle, cute — a hearty treat for a frost dragon.
```

### cake.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a small enchanted aurora cake with pale-blue frosting and a glowing snow-crystal on top, cute.
```

## UI icons — dragon-themed frost (save to art-src/icons/)

### coin.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single silver-and-ice-blue dragon coin engraved with a dragon, frosted rim, glowing cyan edge — a cute game currency icon.
```

### shop.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a dragon's frozen treasure hoard — a small ice-crusted treasure chest with glowing blue gems spilling out, cute.
```

### settings.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a glowing blue frost rune-circle forming a gear / cog shape, ice and bone, a cute settings icon.
```

### mute.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute ice-blue speaker icon with a slash through it, faint frost, glowing edge — a mute icon.
```

### break.png
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, cold but warm-hearted and friendly — NOT scary. Subtle snowflake and frost motifs. Centered, front view, square 1:1 composition, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute baby frost dragon curled up asleep on a little snowdrift, peaceful — a rest / take-a-break icon.
```

## App launcher icons (optional, phase last) — save to public/ as icon-192.png and icon-512.png
NOTE: these two are NOT transparent — they need a solid background.
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, with soft aurora-borealis teal and green glow, and gentle glowing cyan highlights. Enchanted, mystical, friendly — NOT scary. Centered, front view, square 1:1 composition, PNG, no text. SUBJECT: a friendly frost dragon head facing forward, glowing cyan eyes, antler-like ice horns, on a solid deep midnight-blue rounded-square background.
```
