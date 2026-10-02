// Neither API exists in jsdom or in older browsers, and both can fail at runtime on
// browsers that have them, so they are looked up lazily and every call degrades to
// silence. A throw from here would break the timer, which is far worse than a missed bell.
const defaultNotification = () => globalThis.Notification ?? null;
const defaultWakeLock = () => globalThis.navigator?.wakeLock ?? null;
const defaultServiceWorker = () => globalThis.navigator?.serviceWorker ?? null;

// Permission states are the browser's own ('default', 'granted', 'denied') plus one of
// ours for an environment with no Notification API at all.
export const UNSUPPORTED = 'unsupported';

// Lookups are injectable as values; `undefined` falls back to the browser global, `null`
// means "this API is absent", which is what tests of the unsupported path pass.
export const createReminders = ({
  notification = defaultNotification(),
  wakeLock = defaultWakeLock(),
  serviceWorker = defaultServiceWorker(),
} = {}) => {
  // A pending acquire is held as a promise so two overlapping keepAwake calls share one
  // request instead of stacking two locks.
  let acquiring = null;
  let sentinel = null;
  let asked = false;

  const readPermission = () => {
    try { return notification?.permission ?? UNSUPPORTED; } catch { return UNSUPPORTED; }
  };

  return {
    get permission() { return readPermission(); },

    async request() {
      // Only an undecided state is worth a prompt: a decided one cannot be changed by
      // the page, and asking twice is nagging.
      if (!notification || asked || readPermission() !== 'default') return readPermission();
      asked = true;
      try {
        await notification.requestPermission();
      } catch { /* the prompt failed or was dismissed; the state below says what stuck */ }
      return readPermission();
    },

    // Android Chrome refuses `new Notification()` and only shows notices through a service
    // worker registration, so that is tried first. Resolves once the attempt is over and
    // never rejects: a missed bell must not break the timer.
    async notify({ title, body }) {
      if (readPermission() !== 'granted') return;
      let registration = null;
      try {
        // With no service worker there is nothing to await, so the constructor fallback
        // below still runs synchronously.
        if (serviceWorker) registration = await serviceWorker.getRegistration();
      } catch { /* the lookup failed; treat it like having no registration */ }
      if (registration) {
        try {
          await registration.showNotification(title, { body });
        } catch { /* the worker owned the attempt; a constructor retry could notify twice */ }
        return;
      }
      try {
        // eslint-disable-next-line no-new
        new notification(title, { body });
      } catch { /* desktop browsers allow this; where it throws there is no other way left */ }
    },

    async keepAwake() {
      if (!wakeLock || sentinel || acquiring) {
        await acquiring;
        return;
      }
      acquiring = (async () => {
        try {
          const lock = await wakeLock.request('screen');
          sentinel = lock;
          // The browser drops the lock whenever the page hides; forget it then, so the
          // next keepAwake takes a fresh one instead of trusting a dead sentinel.
          lock?.addEventListener?.('release', () => { if (sentinel === lock) sentinel = null; });
        } catch { /* refused: the page is hidden, or the battery saver said no */ }
      })();
      try { await acquiring; } finally { acquiring = null; }
    },

    async release() {
      // A lock still being acquired has no sentinel yet; wait for it, or it would land
      // after this release and be held for good.
      await acquiring;
      const held = sentinel;
      sentinel = null;
      if (!held) return;
      try { await held.release(); } catch { /* it was already released */ }
    },
  };
};
