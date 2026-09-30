// Short sine-wave note sequences, synthesized with Web Audio (no asset files).
//
// Tuned for a tablet speaker heard across a room by a child who is not looking at the
// screen. The first version was half a second of quiet notes and went unnoticed in real
// use, so these are louder and long enough to read as an event. `gain` is optional and
// defaults to the peak in audio.js.
export const tones = {
  // End of a work block — the one sound that has to carry from another room. Rising
  // A5-D6-G6, with the last note left ringing so it reads as an announcement.
  bell: [
    { freq: 880, duration: 0.16 },
    { freq: 1175, duration: 0.16 },
    { freq: 1568, duration: 0.75 },
  ],

  // Feeding the dragon. Deliberately the quietest of the three: it fires on every tap in
  // the shop, so it should feel like a confirmation, not an alarm. A two-note drop reads
  // as "eaten" where the old single 90ms blip read as nothing at all.
  eat: [
    { freq: 523, duration: 0.07, gain: 0.35 },
    { freq: 392, duration: 0.16, gain: 0.35 },
  ],

  // Level up: the reward. C-E-G-C rising an octave, ending on a held note.
  levelup: [
    { freq: 523, duration: 0.13 },
    { freq: 659, duration: 0.13 },
    { freq: 784, duration: 0.13 },
    { freq: 1047, duration: 0.6 },
  ],
};
