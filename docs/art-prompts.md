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

**Icons follow different rules from dragons and food.** The first attempt reused the
illustration prompt for the icons and every one of them failed: ornate lava filigree,
flames licking around the object, every element in the same orange hue against the
near-black theme background. At the ~32px they actually render at, they became
undifferentiated orange blobs — a side-by-side against the frost icons at identical
size made it obvious. Detail per pixel is the enemy at icon size.

Prefix every icon prompt below with these rules:

```
These are UI ICONS, not illustrations. ONE bold simple silhouette that is instantly
recognisable at 32x32 pixels. Thick chunky shapes. NO filigree, NO ornament, NO lava
cracks, NO flames or sparks around the object, NO texture noise, NO thin lines. Strong
value contrast: keep the CORE of the shape LIGHT — bright cream, pale gold, light warm
orange — so it pops against a near-black warm background. Dark outlines only. Soft
watercolor shading inside the silhouette only. Square 1:1, centered, front view, plain
fully transparent background, PNG, no text, no scenery, no ground shadow.
```

#### blaze-coin.png
```
SUBJECT: a single gold coin, flat-on front view, a thick round disc with a raised rim in bright pale-gold and cream with dark outlines, and one simple small dark dragon silhouette stamped in the centre. Nothing else. No flames, no sparks, no ornament around the rim.
```

#### blaze-shop.png
```
SUBJECT: a treasure chest, three-quarter front view, lid open, bright pale-gold coins mounded inside — a simple chunky chest shape that reads as a chest at a glance.
```

#### blaze-settings.png
```
SUBJECT: a cog / gear wheel, front view, flat-on, with 8 thick chunky teeth and a big round hole in the centre — bright pale-gold and cream metal with dark outlines, unmistakably a gear at a glance. No runes, no flames, no ornament inside it.
```

#### blaze-mute.png
```
SUBJECT: a mute icon — a chunky speaker shape (a square body with a triangular cone) in bright pale-gold and cream with dark outlines, and one thick bold diagonal slash crossing straight over it. Nothing else. No sound waves, no flames, no sparks.
```

#### blaze-break.png
```
SUBJECT: a rest / take-a-break icon — a chunky sleeping baby dragon curled into a simple round ball, head tucked down, eyes closed as two simple curved lines, one small wing folded over its back. Bright pale-gold and warm cream body with dark outlines, one clear round silhouette. No embers, no flames, no sparks, no scenery.
```

Note: `break` is used twice — as the small Break button icon AND as the large resting
dragon art shown during a break — so it has to hold up at both sizes. A clear round
silhouette with a light core does.

## Thorn — the forest dragon (third dragon)

Art direction: Thorn is the living, growing counterpart to Frost and Blaze. SAME
dark-fantasy children's storybook watercolor style, SAME friendly-not-scary mood — a deep
woodland palette: dark forest green and moss, bark brown, fern and new-leaf green, with
warm amber light filtering through leaves and soft golden pollen motes. Enchanted, cosy,
alive — NOT scary, NOT gory. Subtle leaf, vine and tiny-flower motifs. Same pipeline:
transparent PNG → `art-src/<group>/thorn-*.png` → 512px webp in `public/art/<group>/`.
Cutout model per subject: dragon character → `isnet-anime`; discrete objects/icons/food →
`isnet-general-use`.

### Dragons (save to art-src/dragons/)

#### thorn-egg.png
```
Dark-fantasy children's storybook illustration, moody painterly watercolor. Deep woodland palette: dark forest green and moss, bark brown, fern and new-leaf green, warm amber light, soft golden pollen motes. Enchanted, mystical, friendly — NOT scary. Subtle leaf and vine motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single closed, UNHATCHED forest-dragon egg — pale green and cream shell patterned like bark and moss, a few tiny leaves and a curling vine wrapped around it, a soft warm glow from within, cute and magical. No dragon visible, just the egg.
```

#### thorn-baby.png
```
Dark-fantasy children's storybook illustration, moody painterly watercolor. Deep woodland palette: dark forest green and moss, bark brown, fern and new-leaf green, warm amber light, soft golden pollen motes. Warm-hearted and friendly, NOT scary, NOT gory. Subtle leaf and vine motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute baby forest dragon just hatched — soft moss-green and fern scales with leaf-shaped markings, big gentle amber eyes, tiny leaf-like wings, two small budding horns like young antlers with a sprout at the tip, sitting, adorable and shy.
```

#### thorn-young.png
```
Attach the baby Thorn image. Keep the SAME dragon — same colours, markings and features — and match the style/mood. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, NOT scary. Subtle leaf and vine motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME forest dragon, now YOUNG — a bit bigger, longer leaf-veined wings, small antler horns with a few real leaves growing on them, curious and playful.
```

#### thorn-adult.png
```
Attach the young Thorn image. Keep the SAME dragon — same colours, markings and features — and match the style/mood. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Majestic but kind, NOT scary. Subtle leaf and vine motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME forest dragon, now FULLY GROWN — majestic and gentle, broad leaf-veined wings, tall branching antlers with moss and small blossoms growing along them, a quiet amber glow, confident and kind.
```

### Foods — dragon treats (save to art-src/foods/)

#### thorn-apple.png
```
Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single enchanted orchard apple, deep red blushed with green, one fresh leaf still on the stem, a faint warm glow, cute and appetising.
```

#### thorn-meat.png
```
Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a hearty roasted root-vegetable skewer — chunks of carrot, mushroom and squash on a wooden stick with a herb sprig, cute, a woodland feast for a forest dragon.
```

#### thorn-cake.png
```
Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a small enchanted honey-and-berry cake with pale green frosting, wild berries on top and a single mint leaf, cute.
```

### UI icons — dragon-themed forest (save to art-src/icons/)

Prefix every icon prompt below with these rules — icons are NOT illustrations, see the
Blaze icon section above for why this matters:

```
These are UI ICONS, not illustrations. ONE bold simple silhouette that is instantly
recognisable at 32x32 pixels. Thick chunky shapes. NO filigree, NO ornament, NO texture
noise, NO thin lines, nothing floating around the object. Strong value contrast: keep the
CORE of the shape LIGHT — cream, pale gold, pale leaf green — so it pops against a
near-black deep-green background. Dark outlines only. Soft watercolor shading inside the
silhouette only. Square 1:1, centered, front view, plain fully transparent background,
PNG, no text, no scenery, no ground shadow.
```

#### thorn-coin.png
```
SUBJECT: a single coin, flat-on front view, a thick round disc with a raised rim in bright pale-gold and cream with dark outlines, and one simple dark leaf shape stamped in the centre. Nothing else.
```

#### thorn-shop.png
```
SUBJECT: a woven basket, three-quarter front view, piled with bright pale-gold coins and a couple of green leaves — a simple chunky basket shape that reads as a basket at a glance.
```

#### thorn-settings.png
```
SUBJECT: a cog / gear wheel, front view, flat-on, with 8 thick chunky teeth and a big round hole in the centre — pale cream and light leaf-green with dark outlines, unmistakably a gear at a glance. No vines, no leaves, no ornament inside it.
```

#### thorn-mute.png
```
SUBJECT: a mute icon — a chunky speaker shape (a square body with a triangular cone) in pale cream and light leaf-green with dark outlines, and one thick bold diagonal slash crossing straight over it. Nothing else. No sound waves.
```

#### thorn-break.png
```
SUBJECT: a rest / take-a-break icon — a chunky sleeping baby forest dragon curled into a simple round ball, head tucked down, eyes closed as two simple curved lines, one leaf-like wing folded over its back. Pale cream and soft moss-green body with dark outlines, one clear round silhouette. No scenery, nothing floating around it.
```

## Tempest — the storm dragon (fourth dragon)

Art direction: Tempest is AIR read as a STORM, deliberately not the pale cyan-and-white
wind dragon — that reading is visually Frost, and the chooser has to be readable at a
glance. SAME dark-fantasy children's storybook watercolor style, SAME friendly-not-scary
mood — a storm palette: deep slate and charcoal violet, electric violet-indigo, cloud
silver and pale grey, with bright lightning-yellow accents. Enchanted, exhilarating,
friendly — NOT scary, NOT menacing. Subtle swirling-wind and small lightning-arc motifs.
Same pipeline: transparent PNG → `art-src/<group>/tempest-*.png` → 512px webp in
`public/art/<group>/`. Cutout model per subject: dragon character → `isnet-anime`;
discrete objects/icons/food → `isnet-general-use`.

### Dragons (save to art-src/dragons/)

#### tempest-egg.png
```
Dark-fantasy children's storybook illustration, moody painterly watercolor. Storm palette: deep slate and charcoal violet, electric violet-indigo, cloud silver and pale grey, bright lightning-yellow accents. Enchanted, mystical, friendly — NOT scary. Subtle swirling-wind motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single closed, UNHATCHED storm-dragon egg — cloud-silver and pale violet shell with soft swirling cloud patterns and a few thin glowing lightning-yellow cracks, a faint electric glow, cute and magical. No dragon visible, just the egg.
```

#### tempest-baby.png
```
Dark-fantasy children's storybook illustration, moody painterly watercolor. Storm palette: deep slate and charcoal violet, electric violet-indigo, cloud silver and pale grey, bright lightning-yellow accents. Warm-hearted and friendly, NOT scary, NOT menacing. Subtle swirling-wind motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute baby storm dragon just hatched — cloud-silver and pale violet scales with soft grey cloud markings, big bright lightning-yellow eyes, tiny wispy wings like torn cloud, two tiny swept-back horns, sitting, adorable and shy, a faint violet crackle around it.
```

#### tempest-young.png
```
Attach the baby Tempest image. Keep the SAME dragon — same colours, markings and features — and match the style/mood. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, NOT scary. Subtle swirling-wind motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME storm dragon, now YOUNG — a bit bigger, longer wispy cloud-edged wings, small swept-back horns with a faint yellow spark at the tips, curious and playful.
```

#### tempest-adult.png
```
Attach the young Tempest image. Keep the SAME dragon — same colours, markings and features — and match the style/mood. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Majestic but kind, NOT scary. Subtle swirling-wind motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME storm dragon, now FULLY GROWN — majestic and exhilarating, wide storm-cloud wings with silver edges, elegant swept-back horns arcing with soft lightning-yellow light, a calm crackling aura, confident and gentle.
```

### Foods — dragon treats (save to art-src/foods/)

#### tempest-apple.png
```
Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single enchanted storm-touched apple, deep violet skin with a silver sheen and a faint lightning-yellow glow along its curve, cute and appetising.
```

#### tempest-meat.png
```
Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a storm-grilled drumstick with a silvery sheen and tiny lightning-yellow sparks, cute — a hearty treat for a storm dragon.
```

#### tempest-cake.png
```
Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a small enchanted cloud cake with swirled pale-violet and silver frosting like a storm cloud, and a glowing lightning-yellow sugar bolt on top, cute.
```

### UI icons — dragon-themed storm (save to art-src/icons/)

Prefix every icon prompt below with these rules:

```
These are UI ICONS, not illustrations. ONE bold simple silhouette that is instantly
recognisable at 32x32 pixels. Thick chunky shapes. NO filigree, NO ornament, NO texture
noise, NO thin lines, nothing floating around the object. Strong value contrast: keep the
CORE of the shape LIGHT — cloud silver, pale grey, pale lilac — so it pops against a
near-black slate background. Use the lightning yellow only as a small bright accent, never
as the whole shape. Dark outlines only. Soft watercolor shading inside the silhouette
only. Square 1:1, centered, front view, plain fully transparent background, PNG, no text,
no scenery, no ground shadow.
```

#### tempest-coin.png
```
SUBJECT: a single coin, flat-on front view, a thick round disc with a raised rim in cloud silver and pale grey with dark outlines, and one simple dark lightning-bolt shape stamped in the centre. Nothing else.
```

#### tempest-shop.png
```
SUBJECT: a chunky metal strongbox, three-quarter front view, lid open, piled with bright silver coins — a simple chunky box shape that reads as a chest at a glance, with one small lightning-yellow spark on the latch.
```

#### tempest-settings.png
```
SUBJECT: a cog / gear wheel, front view, flat-on, with 8 thick chunky teeth and a big round hole in the centre — cloud silver and pale lilac metal with dark outlines, unmistakably a gear at a glance. No sparks, no clouds, no ornament inside it.
```

#### tempest-mute.png
```
SUBJECT: a mute icon — a chunky speaker shape (a square body with a triangular cone) in cloud silver and pale lilac with dark outlines, and one thick bold diagonal slash crossing straight over it. Nothing else. No sound waves, no sparks.
```

#### tempest-break.png
```
SUBJECT: a rest / take-a-break icon — a chunky sleeping baby storm dragon curled into a simple round ball, head tucked down, eyes closed as two simple curved lines, one wispy wing folded over its back. Cloud-silver and pale lilac body with dark outlines, one clear round silhouette. No sparks, no clouds, nothing floating around it.
```

## Sound-on icons — the missing second state (all four dragons)

The mute button has only ever had ONE icon: a speaker that is ALREADY crossed out. So it
reads "silenced" even while sound is playing, and the button cannot show its own state
through its symbol. `mainScreen.js` now distinguishes the states by brightness, but the
real fix is a second icon per theme.

Save each as `art-src/icons/<name>.png` and ship the 512px webp to `public/art/icons/`.
Frost keeps the unprefixed naming its other icons use.

Prefix every prompt with the icon rules block used for that dragon's other icons — these
sit next to the mute icon at the same size and must match it exactly in weight and finish.

#### sound.png — Frost
```
SUBJECT: a speaker icon — a chunky speaker shape (a square body with a triangular cone) in pale ice-blue and frost-white with dark outlines, and two bold curved sound waves arcing off its right side. NO slash, NO bar across it. Nothing else.
```

#### blaze-sound.png
```
SUBJECT: a speaker icon — a chunky speaker shape (a square body with a triangular cone) in bright pale-gold and cream with dark outlines, and two bold curved sound waves arcing off its right side. NO slash, NO bar across it. Nothing else.
```

#### thorn-sound.png
```
SUBJECT: a speaker icon — a chunky speaker shape (a square body with a triangular cone) in pale cream and light leaf-green with dark outlines, and two bold curved sound waves arcing off its right side. NO slash, NO bar across it. Nothing else.
```

#### tempest-sound.png
```
SUBJECT: a speaker icon — a chunky speaker shape (a square body with a triangular cone) in cloud silver and pale lilac with dark outlines, and two bold curved sound waves arcing off its right side. NO slash, NO bar across it. Nothing else.
```

Wiring these up, once the four files exist:
1. add `sound: '/art/icons/<name>.webp'` to each theme's `icons` in `src/data/themes.js`
2. add a `sound` entry to `themes.default.icons` (a `'🔊'` emoji) so the fallback resolves
3. in `src/ui/mainScreen.js`, pick the key by state: `themedIcon(theme, state.muted ? 'mute' : 'sound')`

## The Dragon Lair — room backgrounds and furniture (44 assets)

Art direction: the lair is the dragon's home. Each of the four themes gets ONE room
background plus ten pieces that are placed into it — SAME dark-fantasy children's
storybook watercolor style, SAME friendly-not-scary mood, each theme in its own palette
and setting: Frost = ice cave, Blaze = lava cave, Thorn = forest hollow, Tempest = storm
eyrie. Cosy, warm-hearted, lived-in — NOT scary, NOT gory, NOT gloomy.

44 assets in total: 4 room backgrounds (`<theme>-room.png`) + 10 items x 4 themes
(`<theme>-<id>.png`). The ten ids are the ones in `src/data/furniture.js`: `banner`,
`painting`, `trophy` (wall); `bed`, `nest` (floorLeft); `lamp`, `chest`, `shelf`
(floorRight); `imp`, `hatchling` (corner — these two are PETS).

### How to use (lair)
1. Work ONE THEME AT A TIME. Generate the **room** first (attach the reference character
   illustration as the style reference, as in "How to use" above). Regenerate until the
   room is calm and lovely.
2. Then generate that theme's ten items, **attaching the finished room image as the
   style reference** (plus the reference character for the first one if the style drifts).
   Say: "Match the art style, brushwork, lighting and colour palette of the attached
   room. The SUBJECT is a piece of furniture for that room." This is the same chaining
   idea as egg -> baby -> young -> adult: a theme's furniture must belong to its own
   room, not just to the app. Do not mix themes — never attach a Frost room while
   making a Blaze item.
3. Items are saved as PNG into `art-src/lair/` (high-res originals, git-ignored, kept
   only on disk), alongside the rooms.
4. These are hard requirements that come from how the code composites the art, not
   matters of taste:
   - **Transparent background for every ITEM.** The four room backgrounds are the ONLY
     opaque assets in this pack. Ask explicitly for a transparent background on items and
     remove any that appears afterwards. No floor, no wall, no cast shadow, no glow halo
     baked into the item.
   - **The room is square** (rendered 420x420 CSS px) and the dragon stands at its centre,
     about 40% of the width. The **centre of every room background must stay visually
     calm** — no busy focal point, no pool, bolt, fire or bright light where the dragon
     will stand. Put detail at the edges and corners.
   - **Items sit at fixed positions** over the room: `wall` sits high and centred;
     `floorLeft` and `floorRight` sit low at the sides; `corner` sits at a corner. Each
     item is drawn at roughly **22% of the room's width**, on a tablet, at arm's length.
     **Silhouette matters more than detail at that size.** One bold readable shape, thick
     chunky forms, strong value contrast, no tiny parts, no thin lines, and keep the item
     centred with a little margin inside a square 1:1 canvas.
   - **Pets (`imp`, `hatchling`) must look ALIVE and CONTENT.** Awake, smiling, bright-eyed,
     round and well-fed, relaxed and happy where they are. NEVER hungry, sad, sleepy-lonely,
     sick, thin, scared, caged, chained, leashed, tied up, in a bowl, or in need of care. No
     tears, no drooping posture, no empty food dish, no cage bars. The game rejects any
     mechanic that makes a child feel guilty, and the art must not bring that feeling back.
5. Optimize each PNG to a small `.webp` (512px, same as everywhere else):
   ```
   convert art-src/lair/<theme>-<name>.png -resize 512x512 -quality 82 \
     -define webp:method=6 public/art/lair/<theme>-<name>.webp
   ```
   Shipping paths are `/art/lair/<theme>-<id>.webp` (rooms: `/art/lair/<theme>-room.webp`).
   Items must keep their alpha channel; the room can be flattened. Cutout model if a
   background has to be removed: `isnet-general-use` for furniture, `isnet-anime` for
   the two pets.

Each prompt below is COMPLETE and standalone — attach the reference image(s) named in its
step and paste one prompt as-is. Save with the filename in its heading.


### Frost — ice cave (save to art-src/lair/)

Palette for every prompt in this theme: glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow).

#### frost-room.png
Opaque. Generate this FIRST for Frost; it becomes the style reference for the ten items below.
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Glacial winter palette: deep indigo and midnight blue, ice blue, frost white, bone grey, soft aurora-borealis teal and green glow, gentle glowing cyan highlights. Subtle snowflake and frost motifs. Enchanted, cosy, friendly — NOT scary, NOT gory, NOT gloomy. Square 1:1 composition, FULL-BLEED OPAQUE background (no transparency), no text, no characters, no creatures, no furniture, no props. SUBJECT: the inside of a glacial ice cave seen straight on, as a calm square room — walls and a vaulted ceiling of pale blue ice with soft frozen ridges, a smooth frosted floor, a few distant icicles at the very top corners, a faint aurora glow seeping in from the upper left. Keep the CENTRE of the image a soft, empty, softly lit floor and wall with no focal point. The image is an empty room, waiting for a dragon to be placed in the middle: soft and quiet in the centre, gentle detail only toward the edges and corners, a clear floor area along the bottom third and a plain wall area high in the middle.
```

#### frost-banner.png
Slot `wall`. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A hanging wall banner of deep indigo cloth with a simple pale-blue snowflake emblem, a frost-white fringe, hanging from a short antler-bone rod. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### frost-painting.png
Slot `wall`. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A framed painting in a carved ice-blue frame showing one simple bold picture: a glowing aurora over a snowy mountain, big flat shapes. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### frost-trophy.png
Slot `wall`. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A chunky trophy cup carved from clear ice with two big handles and a glowing cyan gem on its front, on a small bone-white base. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### frost-bed.png
Slot `floorLeft`. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the left side. SUBJECT: A cosy dragon bed: a low round nest-cushion of thick pale-blue fur and frost-white blankets with a rim of soft snow, plump and inviting. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### frost-nest.png
Slot `floorLeft`. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the left side. SUBJECT: A round nest woven of pale silver twigs and soft white feathers, lined with downy snow-white fluff, a few small blue crystals tucked in the rim. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### frost-lamp.png
Slot `floorRight`. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A tall standing lamp: a slim bone-white pole topped by a big glowing cyan ice-crystal lantern giving off a soft light. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### frost-chest.png
Slot `floorRight`. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A sturdy treasure chest of dark-blue wood bound with frosted silver bands, closed, with a small glowing cyan lock. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### frost-shelf.png
Slot `floorRight`. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A small chunky bookshelf of pale driftwood with three shelves holding a few fat storybooks in indigo and teal, and one glowing crystal. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### frost-imp.png
Slot `corner` — PET. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. This is a living PET and must look ALIVE and CONTENT: awake, bright-eyed, smiling, plump and well-fed, relaxed and proud of its spot. NOT hungry, NOT sad, NOT sleepy, NOT sick, NOT scared, NOT caged, chained, leashed or in a bowl, no tears, no drooping posture, no food dish. SUBJECT: A small friendly ice imp, round and chubby, pale-blue skin with tiny frosted horns, big happy eyes and a wide smile, sitting upright and waving one hand.
```

#### frost-hatchling.png
Slot `corner` — PET. Attach the finished `frost-room.png` as the style reference.
```
Attach the finished frost room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, glacial palette (indigo, ice blue, frost white, bone grey, aurora teal, cyan glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. This is a living PET and must look ALIVE and CONTENT: awake, bright-eyed, smiling, plump and well-fed, relaxed and proud of its spot. NOT hungry, NOT sad, NOT sleepy, NOT sick, NOT scared, NOT caged, chained, leashed or in a bowl, no tears, no drooping posture, no food dish. SUBJECT: A tiny frost-dragon hatchling with big round glowing cyan eyes, sitting up beside a cracked pale-blue eggshell, with a happy open smile and a small wagging tail.
```


### Blaze — lava cave (save to art-src/lair/)

Palette for every prompt in this theme: warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow).

#### blaze-room.png
Opaque. Generate this FIRST for Blaze; it becomes the style reference for the ten items below.
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Warm ember palette: deep charcoal-black and ember red-brown, molten orange, gold, ash grey, soft warm glow, gentle glowing amber highlights. Subtle ember-spark and soft flame motifs. Enchanted, cosy, friendly — NOT scary, NOT gory, NOT gloomy. Square 1:1 composition, FULL-BLEED OPAQUE background (no transparency), no text, no characters, no creatures, no furniture, no props. SUBJECT: the inside of a volcanic lava cave seen straight on, as a calm square room — walls and a rounded ceiling of dark basalt rock with a few faint glowing orange veins, a smooth warm stone floor, a soft glow of distant lava at the very bottom edge, a few dim ember specks at the top corners. Keep the CENTRE of the image a soft, empty, warmly lit floor and wall with no focal point and no lava pool. The image is an empty room, waiting for a dragon to be placed in the middle: soft and quiet in the centre, gentle detail only toward the edges and corners, a clear floor area along the bottom third and a plain wall area high in the middle.
```

#### blaze-banner.png
Slot `wall`. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A hanging wall banner of deep ember-red cloth with a simple gold flame emblem, a gold-thread fringe, hanging from a dark iron rod. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### blaze-painting.png
Slot `wall`. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A framed painting in a chunky dark-iron frame showing one simple bold picture: a sleeping dragon on a golden hill at sunset, big flat shapes. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### blaze-trophy.png
Slot `wall`. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A chunky trophy cup of polished gold with two big handles and a glowing amber gem on its front, on a small dark-stone base. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### blaze-bed.png
Slot `floorLeft`. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the left side. SUBJECT: A cosy dragon bed: a low round cushion of thick ember-red cloth and cream blankets with a dark-stone rim, plump and inviting. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### blaze-nest.png
Slot `floorLeft`. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the left side. SUBJECT: A round nest woven of dark branches and soft ash-grey and orange feathers, lined with warm cream fluff, a couple of small warm amber stones in the rim. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### blaze-lamp.png
Slot `floorRight`. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A tall standing lamp: a slim dark-iron pole topped by a big lantern holding a calm, steady, friendly golden flame behind glass. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### blaze-chest.png
Slot `floorRight`. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A sturdy treasure chest of dark wood bound with gold-trimmed iron bands, closed, with a small glowing amber lock. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### blaze-shelf.png
Slot `floorRight`. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A small chunky bookshelf of dark wood with three shelves holding a few fat storybooks in red and gold, and one glowing ember-stone. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### blaze-imp.png
Slot `corner` — PET. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. This is a living PET and must look ALIVE and CONTENT: awake, bright-eyed, smiling, plump and well-fed, relaxed and proud of its spot. NOT hungry, NOT sad, NOT sleepy, NOT sick, NOT scared, NOT caged, chained, leashed or in a bowl, no tears, no drooping posture, no food dish. SUBJECT: A small friendly fire imp, round and chubby, warm orange skin with tiny curved horns, big happy eyes and a wide smile, sitting upright and waving one hand.
```

#### blaze-hatchling.png
Slot `corner` — PET. Attach the finished `blaze-room.png` as the style reference.
```
Attach the finished blaze room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. This is a living PET and must look ALIVE and CONTENT: awake, bright-eyed, smiling, plump and well-fed, relaxed and proud of its spot. NOT hungry, NOT sad, NOT sleepy, NOT sick, NOT scared, NOT caged, chained, leashed or in a bowl, no tears, no drooping posture, no food dish. SUBJECT: A tiny fire-dragon hatchling with big round glowing amber eyes, sitting up beside a cracked cream-and-orange eggshell, with a happy open smile and a small wagging tail.
```


### Thorn — forest hollow (save to art-src/lair/)

Palette for every prompt in this theme: deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen).

#### thorn-room.png
Opaque. Generate this FIRST for Thorn; it becomes the style reference for the ten items below.
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Deep woodland palette: dark forest green and moss, bark brown, fern and new-leaf green, warm amber light, soft golden pollen motes. Subtle leaf, vine and tiny-flower motifs. Enchanted, cosy, friendly — NOT scary, NOT gory, NOT gloomy. Square 1:1 composition, FULL-BLEED OPAQUE background (no transparency), no text, no characters, no creatures, no furniture, no props. SUBJECT: the inside of a hollow in a giant ancient tree seen straight on, as a calm square room — curved walls of warm bark with a few soft roots and tiny flowers, a mossy floor, thin shafts of amber light and floating golden pollen near the top corners. Keep the CENTRE of the image a soft, empty, softly lit mossy floor and bark wall with no focal point. The image is an empty room, waiting for a dragon to be placed in the middle: soft and quiet in the centre, gentle detail only toward the edges and corners, a clear floor area along the bottom third and a plain wall area high in the middle.
```

#### thorn-banner.png
Slot `wall`. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A hanging wall banner of deep green cloth with a simple pale-gold leaf emblem, a fringe of tiny leaves, hanging from a curved twig. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### thorn-painting.png
Slot `wall`. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A framed painting in a rough wooden frame wrapped with a little ivy showing one simple bold picture: a sunlit forest clearing, big flat shapes. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### thorn-trophy.png
Slot `wall`. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A chunky trophy cup carved from pale polished wood with two big handles and a glowing amber gem on its front, a sprouting leaf at the rim, on a small mossy base. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### thorn-bed.png
Slot `floorLeft`. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the left side. SUBJECT: A cosy dragon bed: a low round bed of thick green moss and soft cream blankets inside a ring of curved bark, plump and inviting. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### thorn-nest.png
Slot `floorLeft`. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the left side. SUBJECT: A round nest woven of fresh twigs and vines with soft feathers and dried leaves, lined with downy moss, a few tiny flowers tucked in the rim. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### thorn-lamp.png
Slot `floorRight`. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A tall standing lamp: a slim twisting wooden pole topped by a big glass-and-leaf lantern holding a cluster of softly glowing fireflies. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### thorn-chest.png
Slot `floorRight`. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A sturdy treasure chest of bark-brown wood bound with green-patinated bronze bands, closed, with a small glowing amber lock and a little vine curling over the lid. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### thorn-shelf.png
Slot `floorRight`. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A small chunky bookshelf grown from pale wood and branches with three shelves holding a few fat storybooks in green and brown, and one glowing acorn. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### thorn-imp.png
Slot `corner` — PET. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. This is a living PET and must look ALIVE and CONTENT: awake, bright-eyed, smiling, plump and well-fed, relaxed and proud of its spot. NOT hungry, NOT sad, NOT sleepy, NOT sick, NOT scared, NOT caged, chained, leashed or in a bowl, no tears, no drooping posture, no food dish. SUBJECT: A small friendly forest imp, round and chubby, soft moss-green skin with tiny leaf-shaped horns, big happy eyes and a wide smile, sitting upright and waving one hand.
```

#### thorn-hatchling.png
Slot `corner` — PET. Attach the finished `thorn-room.png` as the style reference.
```
Attach the finished thorn room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, deep woodland palette (forest green, moss, bark brown, fern, amber light, golden pollen). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. This is a living PET and must look ALIVE and CONTENT: awake, bright-eyed, smiling, plump and well-fed, relaxed and proud of its spot. NOT hungry, NOT sad, NOT sleepy, NOT sick, NOT scared, NOT caged, chained, leashed or in a bowl, no tears, no drooping posture, no food dish. SUBJECT: A tiny forest-dragon hatchling with big round glowing amber eyes, sitting up beside a cracked pale-green eggshell, with a happy open smile and a small wagging tail with a leaf at the tip.
```


### Tempest — storm eyrie (save to art-src/lair/)

Palette for every prompt in this theme: storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow).

#### tempest-room.png
Opaque. Generate this FIRST for Tempest; it becomes the style reference for the ten items below.
```
Match the art style, mood and colour palette of the attached reference image. Dark-fantasy children's storybook illustration, moody painterly watercolor. Storm palette: deep slate and charcoal violet, electric violet-indigo, cloud silver and pale grey, bright lightning-yellow accents. Subtle swirling-wind and small lightning-arc motifs. Enchanted, cosy, friendly — NOT scary, NOT gory, NOT gloomy. Square 1:1 composition, FULL-BLEED OPAQUE background (no transparency), no text, no characters, no creatures, no furniture, no props. SUBJECT: a high mountain-top eyrie seen straight on, as a calm square room — a rounded open nook of slate-grey rock with a smooth stone floor, soft violet storm clouds drifting at the edges with one or two tiny distant lightning glints at the very top corners. Keep the CENTRE of the image a soft, empty, calmly lit floor and sky with no focal point and no lightning bolt. The image is an empty room, waiting for a dragon to be placed in the middle: soft and quiet in the centre, gentle detail only toward the edges and corners, a clear floor area along the bottom third and a plain wall area high in the middle.
```

#### tempest-banner.png
Slot `wall`. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A hanging wall banner of deep violet-indigo cloth with a simple cloud-silver lightning-bolt emblem, a silver fringe, hanging from a slate-grey rod. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### tempest-painting.png
Slot `wall`. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A framed painting in a chunky silver frame showing one simple bold picture: a dragon silhouette soaring through violet clouds, big flat shapes. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### tempest-trophy.png
Slot `wall`. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item hangs high and centred on the back wall. SUBJECT: A chunky trophy cup of polished silver with two big handles and a glowing lightning-yellow gem on its front, on a small slate base. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### tempest-bed.png
Slot `floorLeft`. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the left side. SUBJECT: A cosy dragon bed: a low round cushion of thick pale-violet and cloud-grey fabric with soft billowy blankets like a cloud, plump and inviting. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### tempest-nest.png
Slot `floorLeft`. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the left side. SUBJECT: A round nest woven of pale grey twigs and silvery-violet feathers, lined with downy cloud-white fluff, a couple of tiny yellow spark-stones in the rim. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### tempest-lamp.png
Slot `floorRight`. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A tall standing lamp: a slim silver pole topped by a big glass lantern holding a small, calm, steady lightning-yellow glow with a gentle swirl inside. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### tempest-chest.png
Slot `floorRight`. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A sturdy treasure chest of dark slate-blue metal bound with silver bands, closed, with a small glowing lightning-yellow lock. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### tempest-shelf.png
Slot `floorRight`. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. In the room this item stands on the floor at the right side. SUBJECT: A small chunky bookshelf of pale grey stone with three shelves holding a few fat storybooks in violet and silver, and one glowing yellow crystal. It is a sturdy, cosy piece of furniture, not a ruin: whole, clean and welcoming.
```

#### tempest-imp.png
Slot `corner` — PET. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. This is a living PET and must look ALIVE and CONTENT: awake, bright-eyed, smiling, plump and well-fed, relaxed and proud of its spot. NOT hungry, NOT sad, NOT sleepy, NOT sick, NOT scared, NOT caged, chained, leashed or in a bowl, no tears, no drooping posture, no food dish. SUBJECT: A small friendly storm imp, round and chubby, pale-violet skin with tiny swept-back horns, big happy eyes and a wide smile, sitting upright and waving one hand.
```

#### tempest-hatchling.png
Slot `corner` — PET. Attach the finished `tempest-room.png` as the style reference.
```
Attach the finished tempest room image as the style reference. Match its art style, brushwork, lighting and colour palette exactly — this item belongs in that room. Dark-fantasy children's storybook watercolor, storm palette (deep slate, charcoal violet, electric violet-indigo, cloud silver, lightning yellow). Friendly, cosy, NOT scary. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no room, no wall, no floor, no ground shadow, nothing around it. ONE bold simple silhouette that stays instantly readable at about 22% of a tablet screen: thick chunky shapes, strong value contrast, no tiny parts, no thin lines. Leave a small margin around it. This is a living PET and must look ALIVE and CONTENT: awake, bright-eyed, smiling, plump and well-fed, relaxed and proud of its spot. NOT hungry, NOT sad, NOT sleepy, NOT sick, NOT scared, NOT caged, chained, leashed or in a bowl, no tears, no drooping posture, no food dish. SUBJECT: A tiny storm-dragon hatchling with big round glowing lightning-yellow eyes, sitting up beside a cracked cloud-silver eggshell, with a happy open smile and a small wagging tail.
```

### Checklist — all 44 filenames

Tick each once the PNG is in `art-src/lair/` AND the 512px webp is in `public/art/lair/`.

**Frost**
- [ ] `frost-room.png`
- [ ] `frost-banner.png`
- [ ] `frost-painting.png`
- [ ] `frost-trophy.png`
- [ ] `frost-bed.png`
- [ ] `frost-nest.png`
- [ ] `frost-lamp.png`
- [ ] `frost-chest.png`
- [ ] `frost-shelf.png`
- [ ] `frost-imp.png`
- [ ] `frost-hatchling.png`

**Blaze**
- [ ] `blaze-room.png`
- [ ] `blaze-banner.png`
- [ ] `blaze-painting.png`
- [ ] `blaze-trophy.png`
- [ ] `blaze-bed.png`
- [ ] `blaze-nest.png`
- [ ] `blaze-lamp.png`
- [ ] `blaze-chest.png`
- [ ] `blaze-shelf.png`
- [ ] `blaze-imp.png`
- [ ] `blaze-hatchling.png`

**Thorn**
- [ ] `thorn-room.png`
- [ ] `thorn-banner.png`
- [ ] `thorn-painting.png`
- [ ] `thorn-trophy.png`
- [ ] `thorn-bed.png`
- [ ] `thorn-nest.png`
- [ ] `thorn-lamp.png`
- [ ] `thorn-chest.png`
- [ ] `thorn-shelf.png`
- [ ] `thorn-imp.png`
- [ ] `thorn-hatchling.png`

**Tempest**
- [ ] `tempest-room.png`
- [ ] `tempest-banner.png`
- [ ] `tempest-painting.png`
- [ ] `tempest-trophy.png`
- [ ] `tempest-bed.png`
- [ ] `tempest-nest.png`
- [ ] `tempest-lamp.png`
- [ ] `tempest-chest.png`
- [ ] `tempest-shelf.png`
- [ ] `tempest-imp.png`
- [ ] `tempest-hatchling.png`

## Record icon (the study record screen) — save to art-src/icons/

Added 2026-10-02 with the fourth nav button. These follow the ICON rules, not the
illustration rules: one bold silhouette legible at 32x32, a LIGHT core so it reads against a
near-black background, and no ornament of any kind. Verify every one by rendering it at 32px
over its own theme background before accepting it — not at 1024.

Subject for all four: a rolled-open parchment scroll, front on, a rod top and bottom, nothing
written on it. Only the rods and the outline carry the theme; the parchment core stays pale
cream in every theme.

### frost (the default set, saved as record.webp)

Generate a UI ICON, square 1:1, fully transparent background, PNG, centred, no text, no scenery, no ground shadow. SUBJECT: a rolled-open parchment scroll seen front-on, with a wooden rod at the top and bottom — a "record of what you did" icon for a children's app. This is an ICON, not an illustration. These rules outrank style and beauty: ONE bold, simple silhouette that is still recognisable as a scroll at 32x32 pixels. Thick chunky shapes only. NO filigree, NO ornament, NO thin lines, NO texture noise, NO sparkles, NO surrounding effects of any kind. The CORE of the shape must be LIGHT — pale cream parchment — so it pops against a near-black background. Dark outline around the silhouette. Shading only INSIDE the silhouette. Nothing written on the parchment. It is blank. Theme, applied only as a tint at the edges and the rods, never as clutter: glacial winter — deep indigo, ice blue, frost white, bone grey, with a faint cyan edge glow. Match the painterly storybook finish of the attached reference icon, but simpler and bolder than it. Output one image only.

### blaze / thorn / tempest

Same prompt, changing only the tint of the rods and the outline, and repeating the rules so
they are not forgotten:

- **blaze**: dark charred wood rods with a dull ember-orange edge, near-black outline, faint
  warm rim. Explicitly NO flames, NO lava cracks, NO sparks, and **do not make the parchment
  orange** — that is exactly how the first blaze icon batch failed.
- **thorn**: rods bound with dark green vine, moss-and-bark edge, deep forest outline. No
  leaves scattered around, no vines trailing off the silhouette.
- **tempest**: slate-grey rods with a cold violet edge, storm-dark outline. No lightning, no
  clouds, no sparks.
