# Credits

## Music

The four background tracks come from [Pixabay](https://pixabay.com/) and are used under the
[Pixabay Content License](https://pixabay.com/service/license-summary/), which allows free
commercial use and does not require attribution. They are credited here anyway, because
provenance is worth keeping whether or not a licence demands it.

| File | Title | Author | Source | AI generated |
|------|-------|--------|--------|--------------|
| `public/art/music/lofi-01.mp3` | Study Lofi Music | APALONBeats | https://pixabay.com/music/lofi-study-lofi-music-576259/ | not stated |
| `public/art/music/lofi-02.mp3` | Lofi Study Session | alex-morgan | https://pixabay.com/music/lofi-lofi-study-session-568160/ | yes |
| `public/art/music/lofi-03.mp3` | Lofi Relax | ZephiraMusic | https://pixabay.com/music/lofi-lofi-relax-582283/ | yes |
| `public/art/music/lofi-04.mp3` | Lofi Relaxing | ZephiraMusic | https://pixabay.com/music/lofi-lofi-relaxing-582284/ | yes |

The tracks in this repository are transcoded from the 256 kbps originals down to 96 kbps,
which is why their checksums do not match a fresh Pixabay download. Nothing else was
altered: the durations match the originals to within 25 ms. Total weight dropped from about
19 MB to 7.1 MB, which matters because these are fetched over the network rather than
precached by the service worker.

The identification was recovered from the original download filenames, which encode the
author slug, the title slug and the Pixabay media ID, and then confirmed one-to-one by
track duration — Pixabay strips the ID3 title and artist tags when it re-encodes an upload,
so the files themselves carry no metadata beyond the encoder string.
