const defaultContext = () => new (window.AudioContext || window.webkitAudioContext)();

const playTone = (ctx, { freq, duration }, startAt) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.linearRampToValueAtTime(0.25, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
};

export const createAudio = ({ music, effects, tones, createAudioContext = defaultContext }) => {
  let muted = false;
  let ctx = null;
  let ctxFailed = false;
  const getContext = () => {
    if (!ctx && !ctxFailed) {
      try { ctx = createAudioContext(); } catch { ctxFailed = true; }
    }
    return ctx;
  };
  const bg = music ? new Audio(music) : null;
  if (bg) { bg.loop = true; bg.volume = 0.4; }

  const makers = {};
  for (const [name, src] of Object.entries(effects ?? {})) {
    makers[name] = () => new Audio(src);
  }

  const api = {
    get muted() { return muted; },
    setMuted(value) {
      muted = value;
      if (bg) bg.muted = value;
      return muted;
    },
    toggleMute() { return api.setMuted(!muted); },
    playMusic() { if (bg && !muted) bg.play().catch(() => {}); },
    stopMusic() { if (bg) bg.pause(); },
    unlock() {
      const audioCtx = getContext();
      if (audioCtx?.state !== 'suspended') return;
      try { audioCtx.resume()?.catch(() => {}); } catch { /* no resume support */ }
    },
    playEffect(name) {
      if (muted) return;
      if (makers[name]) { makers[name]().play().catch(() => {}); return; }
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
