export const createAudio = ({ music, effects }) => {
  let muted = false;
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
    playEffect(name) {
      if (muted || !makers[name]) return;
      makers[name]().play().catch(() => {});
    },
  };
  return api;
};
