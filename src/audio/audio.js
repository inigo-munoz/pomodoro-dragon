const defaultContext = () => new (window.AudioContext || window.webkitAudioContext)();

// These play on a tablet speaker, across a room, to a child who is not watching the
// screen. 0.25 was inaudible in practice; a note also needs long enough to register as
// a sound rather than a tick.
const PEAK = 0.55;
// A hard attack at this level clicks, so open slightly slower than before.
const ATTACK = 0.02;

const playTone = (ctx, { freq, duration, gain: peak = PEAK }, startAt) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + ATTACK);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
};

// HTMLMediaElement.play() returns a promise in modern browsers, undefined in older ones,
// and can throw outright where it is not implemented at all. None of that is worth
// taking the app down for, so every call goes through here.
const tryPlay = (el) => {
  try { el.play()?.catch?.(() => {}); } catch { /* no playback available */ }
};

// Fisher-Yates, on a copy.
const shuffled = (list, random) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// `music` takes a single URL or a list of them. A list is played as a shuffled
// playlist that advances when each track ends and reshuffles when it runs out, so a
// study block does not repeat the same two minutes a dozen times.
export const createAudio = ({
  music, effects, tones, createAudioContext = defaultContext, random = Math.random,
}) => {
  let muted = false;
  let ctx = null;
  let ctxFailed = false;
  const getContext = () => {
    if (!ctx && !ctxFailed) {
      try { ctx = createAudioContext(); } catch { ctxFailed = true; }
    }
    return ctx;
  };

  const toTracks = (list) => (Array.isArray(list) ? list.filter(Boolean) : (list ? [list] : []));
  let tracks = toTracks(music);
  // Always built, even with no tracks yet: the element has to outlive any playlist swap
  // (mute state lives on it), and a later setPlaylist cannot conjure one up in its place.
  const bg = new Audio();
  let order = [];
  let atTrack = -1;
  // Tracks whether the soundtrack is meant to be running. The element's own `paused`
  // is no use for this: it is also true before the first play and under test.
  let wanted = false;

  const reshuffle = () => {
    const last = order[atTrack];
    order = shuffled(tracks, random);
    // Reshuffling can otherwise deal the track that just finished straight back.
    if (order.length > 1 && order[0] === last) [order[0], order[1]] = [order[1], order[0]];
    atTrack = -1;
  };

  const playNext = () => {
    if (muted || !tracks.length) return;
    if (atTrack + 1 >= order.length) reshuffle();
    atTrack += 1;
    bg.src = order[atTrack];
    tryPlay(bg);
  };

  // One track at a time, not one looping track: `ended` is what drives the rotation.
  bg.loop = false;
  bg.volume = 0.4;
  bg.addEventListener('ended', playNext);

  const makers = {};
  for (const [name, src] of Object.entries(effects ?? {})) {
    makers[name] = () => new Audio(src);
  }

  const api = {
    get muted() { return muted; },
    setMuted(value) {
      muted = value;
      bg.muted = value;
      return muted;
    },
    toggleMute() { return api.setMuted(!muted); },
    playMusic() {
      if (muted || !tracks.length) return;
      wanted = true;
      // Resume where it was paused; only pick a track when nothing is loaded yet.
      if (bg.src) tryPlay(bg); else playNext();
    },
    stopMusic() { wanted = false; bg.pause(); },
    // Swaps the soundtrack without touching the element, so mute and the element survive.
    // A running soundtrack moves straight onto the new list; an idle one is only armed,
    // because starting sound nobody asked for would break the autoplay-after-gesture rule.
    setPlaylist(list) {
      tracks = toTracks(list);
      order = [];
      atTrack = -1;
      if (wanted && !muted && tracks.length) { playNext(); return; }
      // Drop the loaded track so playMusic picks from the new list instead of resuming
      // the old one.
      bg.pause();
      bg.removeAttribute('src');
      if (!tracks.length) wanted = false;
    },
    // What `ended` calls. Public because moving to the next track is a real thing to
    // want, and because the rotation is worth testing without faking media events.
    skipTrack() { playNext(); },
    get nowPlaying() { return bg.src || null; },
    unlock() {
      const audioCtx = getContext();
      if (audioCtx?.state !== 'suspended') return;
      try { audioCtx.resume()?.catch(() => {}); } catch { /* no resume support */ }
    },
    playEffect(name) {
      if (muted) return;
      if (makers[name]) { tryPlay(makers[name]()); return; }
      const notes = tones?.[name];
      const audioCtx = notes && getContext();
      if (!audioCtx) return;
      let at = audioCtx.currentTime;
      for (const note of notes) {
        playTone(audioCtx, note, at);
        at += note.duration;
      }
    },
  };
  return api;
};
