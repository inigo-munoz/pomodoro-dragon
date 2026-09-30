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
