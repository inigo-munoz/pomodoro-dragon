import { registerSW } from 'virtual:pwa-register';

// `autoUpdate` already reloads open windows once the browser DETECTS a new build — but a
// service worker only looks when it registers. An installed app left open on a tablet
// therefore keeps running the version it started with, which is how a pushed fix can sit
// live on the server while the child still sees the old screen.
//
// So ask periodically. `prompt` was the alternative and is the wrong trade here: it puts
// a technical question in front of a nine year old, and the plugin's own docs warn that
// moving from autoUpdate to prompt later is painful. There are no forms to lose either,
// so an unannounced reload costs nothing.
const CHECK_EVERY_MS = 30 * 60 * 1000;

export const registerServiceWorker = () => registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;

    setInterval(async () => {
      // Skip while an install is already in flight, and while offline — on a tablet
      // that is most of the time the app is carried around.
      if (registration.installing) return;
      if ('connection' in navigator && !navigator.onLine) return;

      try {
        // Ask the network, not the cache, or this check reads back the very version it
        // is supposed to be replacing.
        const response = await fetch(swUrl, {
          cache: 'no-store',
          headers: { cache: 'no-store', 'cache-control': 'no-cache' },
        });
        if (response?.status === 200) await registration.update();
      } catch {
        // Server down or the network dropped mid-check. Try again next interval.
      }
    }, CHECK_EVERY_MS);
  },
});
