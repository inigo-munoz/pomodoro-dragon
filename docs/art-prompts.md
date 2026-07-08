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

## Blaze — the fire dragon (second dragon)

Art direction: Blaze is the FIRE counterpart to Frost. SAME dark-fantasy children's
storybook watercolor style, SAME friendly-not-scary mood — but a warm ember palette
instead of the glacial one. Warm palette: deep charcoal-black and ember red-brown,
molten orange, gold, ash grey, with a soft warm glow and gentle glowing amber
highlights. Enchanted, cosy, friendly — NOT scary, NOT gory. Subtle ember-spark and
soft flame motifs. Same pipeline as Frost: transparent PNG → `art-src/<group>/blaze-*.png`
→ 512px webp in `public/art/<group>/`. Cutout model per subject: dragon character →
`isnet-anime`; discrete objects/icons/food → `isnet-general-use`.

### Dragons (save to art-src/dragons/)

#### blaze-egg.png
```
Match a dark-fantasy children's storybook illustration, moody painterly watercolor. Warm ember palette: deep charcoal-black and ember red-brown, molten orange, gold, ash grey, soft warm glow, gentle glowing amber highlights. Enchanted, mystical, friendly — NOT scary. Subtle ember-spark and soft flame motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single closed, UNHATCHED fire-dragon egg — warm cream-and-orange shell with faint glowing cracks of inner molten light and a soft ember glow, cute and magical. No dragon visible, just the egg.
```

#### blaze-baby.png
```
Match a dark-fantasy children's storybook illustration, moody painterly watercolor. Warm ember palette: deep charcoal-black and ember red-brown, molten orange, gold, ash grey, soft warm glow, gentle glowing amber highlights. Enchanted, cold-hearted? NO — warm-hearted and friendly, NOT scary, NOT gory. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute baby fire dragon just hatched — warm orange-and-gold scales with soft ember markings, big gentle glowing amber eyes, tiny wings with a warm glow, tiny curved horns, sitting, adorable and shy, a faint ember glow around it.
```

#### blaze-young.png
```
Attach the baby Blaze image. Keep the SAME dragon — same warm colours, markings and features — and match the style/mood. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME fire dragon, now YOUNG — a bit bigger, longer warm-glowing wings, small curved horns, curious and playful.
```

#### blaze-adult.png
```
Attach the young Blaze image. Keep the SAME dragon — same warm colours, markings and features — and match the style/mood. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Majestic but kind, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME fire dragon, now FULLY GROWN — majestic and warm, large ember-lit wings, elegant curved horns, a soft crown of warm light, confident and gentle.
```

### Foods — dragon treats (save to art-src/foods/)

#### blaze-apple.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single enchanted fire-touched red-orange apple with a faint warm glow and tiny glowing embers, cute and appetising.
```

#### blaze-meat.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a fire-roasted drumstick with a warm glowing sheen and tiny embers, cute — a hearty treat for a fire dragon.
```

#### blaze-cake.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a small enchanted ember cake with warm-orange frosting and a glowing amber gem on top, cute.
```

### UI icons — dragon-themed fire (save to art-src/icons/)

#### blaze-coin.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single gold-and-ember dragon coin engraved with a dragon, warm glowing rim, amber edge — a cute game currency icon.
```

#### blaze-shop.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a dragon's warm treasure hoard — a small ember-lit treasure chest with glowing gold coins and amber gems spilling out, cute.
```

#### blaze-settings.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a glowing amber rune-circle forming a gear / cog shape, ember and gold, a cute settings icon.
```

#### blaze-mute.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute warm-amber speaker icon with a slash through it, faint embers, glowing edge — a mute icon.
```

#### blaze-break.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Warm-hearted and friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute baby fire dragon curled up asleep by warm glowing embers, peaceful — a rest / take-a-break icon.
```
