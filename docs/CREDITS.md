# Credits

## Music

The settings screen offers two soundtracks, **Cozy** (the default) and **Lofi**. Both ship
in `public/art/music/` and are fetched only when played.

### Cozy

The four tracks come from **Towball's Crossing Deluxe!** by **Towball**, released
under the [Creative Commons Attribution 4.0 International
licence](https://creativecommons.org/licenses/by/4.0/). That licence requires attribution,
so this file is not a courtesy — it is the condition of use.

Source: https://towball.itch.io/towballs-crossing-deluxe

| File | Track | Length |
|------|-------|--------|
| `public/art/music/crossing-main-theme.mp3` | Main Theme | 2:27 |
| `public/art/music/crossing-noon.mp3` | Noon | 2:06 |
| `public/art/music/crossing-6pm.mp3` | 6pm | 2:43 |
| `public/art/music/crossing-9pm.mp3` | 9pm | 2:36 |

**Changes made to the originals**, as CC-BY requires us to state: each track was transcoded
from its original bitrate down to 96 kbps, and its embedded cover art was stripped. Nothing
was edited, cut or remixed. The transcode took the set from 18 MB to 6.8 MB, which matters
because these are fetched over the network rather than precached by the service worker.

The author states that no generative AI was used in making this music.

#### Why these four

They were chosen by measurement as well as by ear. Across the pack's 26 hourly tracks the
integrated loudness spans 5.3 dB; these four sit within **0.2 dB of each other** (−17.8 to
−18.0 LUFS). The playlist is a shuffled rotation that advances mid-session, so a loud track
following a quiet one is a jolt at exactly the wrong moment.

The Lofi set that Cozy replaced as the default had a **6.3 dB spread** (−11.9 to −18.2 LUFS), which was never
measured when that rotation was built.

### Lofi

Four Pixabay lofi tracks, under the
[Pixabay Content License](https://pixabay.com/service/license-summary/). They were the
only soundtrack until the Cozy set replaced them, and are offered again as an alternative.
Their provenance is recorded here in full, since it cannot be recovered from the files.

| File | Title | Author | Source | AI generated |
|------|-------|--------|--------|--------------|
| `lofi-01.mp3` | Study Lofi Music | APALONBeats | https://pixabay.com/music/lofi-study-lofi-music-576259/ | not stated |
| `lofi-02.mp3` | Lofi Study Session | alex-morgan | https://pixabay.com/music/lofi-lofi-study-session-568160/ | yes |
| `lofi-03.mp3` | Lofi Relax | ZephiraMusic | https://pixabay.com/music/lofi-lofi-relax-582283/ | yes |
| `lofi-04.mp3` | Lofi Relaxing | ZephiraMusic | https://pixabay.com/music/lofi-lofi-relaxing-582284/ | yes |

These files were also transcoded from 256 kbps down to 96 kbps, which is why their
checksums never matched a fresh Pixabay download. They were identified after the fact from
their original download filenames and confirmed by track duration, because Pixabay strips
the ID3 title and artist tags when it re-encodes an upload.

That recovery is the reason the current tracks are named after the music they contain
rather than by index, and the reason their metadata was kept rather than stripped.
