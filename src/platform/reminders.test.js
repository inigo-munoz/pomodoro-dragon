import { vi, describe, it, expect } from 'vitest';
import { createReminders } from './reminders.js';

// A stand-in for the Notification constructor: records what it was built with and
// carries the static `permission` / `requestPermission` the real one has.
const fakeNotification = ({ permission = 'default', answer = 'granted' } = {}) => {
  const shown = [];
  const Fake = function Fake(title, options) { shown.push({ title, options }); };
  Fake.permission = permission;
  Fake.requestPermission = vi.fn(async () => { Fake.permission = answer; return answer; });
  Fake.shown = shown;
  return Fake;
};

const fakeWakeLock = () => {
  const sentinels = [];
  const lock = {
    request: vi.fn(async (type) => {
      const sentinel = { type, release: vi.fn(async () => {}) };
      sentinels.push(sentinel);
      return sentinel;
    }),
    sentinels,
  };
  return lock;
};

describe('createReminders without either API', () => {
  const bare = () => createReminders({ notification: null, wakeLock: null });

  it('reports the API as unsupported', () => {
    expect(bare().permission).toBe('unsupported');
  });

  it('makes every method a safe no-op', async () => {
    const reminders = bare();
    await expect(reminders.request()).resolves.toBe('unsupported');
    expect(() => reminders.notify({ title: 't', body: 'b' })).not.toThrow();
    await expect(reminders.keepAwake()).resolves.toBeUndefined();
    await expect(reminders.release()).resolves.toBeUndefined();
  });

  it('is safe with the real defaults under jsdom, where neither API exists', async () => {
    const reminders = createReminders();
    expect(reminders.permission).toBe('unsupported');
    await reminders.request();
    reminders.notify({ title: 't', body: 'b' });
    await reminders.keepAwake();
    await reminders.release();
  });
});

describe('notify', () => {
  it('shows a notification with the title and body once permission is granted', () => {
    const notification = fakeNotification({ permission: 'granted' });
    createReminders({ notification }).notify({ title: 'Block done', body: 'Take a break' });
    expect(notification.shown).toHaveLength(1);
    expect(notification.shown[0].title).toBe('Block done');
    expect(notification.shown[0].options.body).toBe('Take a break');
  });

  it.each(['default', 'denied'])('stays silent while permission is %s', (permission) => {
    const notification = fakeNotification({ permission });
    createReminders({ notification }).notify({ title: 't', body: 'b' });
    expect(notification.shown).toHaveLength(0);
  });

  it('swallows a constructor that throws', () => {
    const notification = function Throwing() { throw new TypeError('Illegal constructor'); };
    notification.permission = 'granted';
    expect(() => createReminders({ notification }).notify({ title: 't', body: 'b' })).not.toThrow();
  });
});

describe('request', () => {
  it('asks once and reports the result', async () => {
    const notification = fakeNotification({ answer: 'granted' });
    const reminders = createReminders({ notification });
    await expect(reminders.request()).resolves.toBe('granted');
    expect(reminders.permission).toBe('granted');
    expect(notification.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('does not ask a second time', async () => {
    const notification = fakeNotification({ answer: 'denied' });
    const reminders = createReminders({ notification });
    await reminders.request();
    await expect(reminders.request()).resolves.toBe('denied');
    expect(notification.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('does not ask when the browser already decided', async () => {
    const notification = fakeNotification({ permission: 'denied' });
    await expect(createReminders({ notification }).request()).resolves.toBe('denied');
    expect(notification.requestPermission).not.toHaveBeenCalled();
  });

  it('resolves to the current state when asking rejects', async () => {
    const notification = fakeNotification();
    notification.requestPermission = vi.fn(async () => { throw new Error('nope'); });
    await expect(createReminders({ notification }).request()).resolves.toBe('default');
  });

  it('resolves to the current state when asking throws synchronously', async () => {
    const notification = fakeNotification();
    notification.requestPermission = vi.fn(() => { throw new Error('nope'); });
    await expect(createReminders({ notification }).request()).resolves.toBe('default');
  });
});

describe('wake lock', () => {
  it("acquires a 'screen' lock", async () => {
    const wakeLock = fakeWakeLock();
    await createReminders({ wakeLock }).keepAwake();
    expect(wakeLock.request).toHaveBeenCalledWith('screen');
  });

  it('does not stack a second lock on top of a held one', async () => {
    const wakeLock = fakeWakeLock();
    const reminders = createReminders({ wakeLock });
    await reminders.keepAwake();
    await reminders.keepAwake();
    expect(wakeLock.request).toHaveBeenCalledTimes(1);
  });

  it('does not stack when two calls overlap before the first resolves', async () => {
    const wakeLock = fakeWakeLock();
    const reminders = createReminders({ wakeLock });
    await Promise.all([reminders.keepAwake(), reminders.keepAwake()]);
    expect(wakeLock.request).toHaveBeenCalledTimes(1);
  });

  it('releases the held lock and is safe to release twice', async () => {
    const wakeLock = fakeWakeLock();
    const reminders = createReminders({ wakeLock });
    await reminders.keepAwake();
    await reminders.release();
    await reminders.release();
    expect(wakeLock.sentinels[0].release).toHaveBeenCalledTimes(1);
  });

  it('can acquire again after a release', async () => {
    const wakeLock = fakeWakeLock();
    const reminders = createReminders({ wakeLock });
    await reminders.keepAwake();
    await reminders.release();
    await reminders.keepAwake();
    expect(wakeLock.request).toHaveBeenCalledTimes(2);
  });

  it('releases a lock that was still being acquired when release was called', async () => {
    const wakeLock = fakeWakeLock();
    const reminders = createReminders({ wakeLock });
    const acquiring = reminders.keepAwake();
    await reminders.release();
    await acquiring;
    expect(wakeLock.sentinels[0].release).toHaveBeenCalledTimes(1);
  });

  it('is safe to release when nothing is held', async () => {
    await expect(createReminders({ wakeLock: fakeWakeLock() }).release()).resolves.toBeUndefined();
  });

  it('swallows a rejected request, as happens when the page is hidden', async () => {
    const wakeLock = { request: vi.fn(async () => { throw new DOMException('hidden', 'NotAllowedError'); }) };
    await expect(createReminders({ wakeLock }).keepAwake()).resolves.toBeUndefined();
  });

  it('swallows a synchronous throw from request', async () => {
    const wakeLock = { request: vi.fn(() => { throw new Error('boom'); }) };
    await expect(createReminders({ wakeLock }).keepAwake()).resolves.toBeUndefined();
  });

  it('can retry after a failed request', async () => {
    const good = fakeWakeLock();
    const wakeLock = { request: vi.fn() };
    wakeLock.request.mockRejectedValueOnce(new Error('hidden'));
    wakeLock.request.mockImplementation(good.request);
    const reminders = createReminders({ wakeLock });
    await reminders.keepAwake();
    await reminders.keepAwake();
    expect(good.sentinels).toHaveLength(1);
  });

  it('swallows a release that rejects and still forgets the sentinel', async () => {
    const wakeLock = fakeWakeLock();
    const reminders = createReminders({ wakeLock });
    await reminders.keepAwake();
    wakeLock.sentinels[0].release = vi.fn(async () => { throw new Error('already gone'); });
    await expect(reminders.release()).resolves.toBeUndefined();
    await reminders.keepAwake();
    expect(wakeLock.request).toHaveBeenCalledTimes(2);
  });

  it('forgets a sentinel the browser released on its own', async () => {
    // The browser drops the lock when the page hides and fires `release` on the sentinel.
    const sentinels = [];
    const wakeLock = {
      request: vi.fn(async () => {
        const sentinel = Object.assign(new EventTarget(), { release: vi.fn(async () => {}) });
        sentinels.push(sentinel);
        return sentinel;
      }),
    };
    const reminders = createReminders({ wakeLock });
    await reminders.keepAwake();
    sentinels[0].dispatchEvent(new Event('release'));
    await reminders.keepAwake();
    expect(wakeLock.request).toHaveBeenCalledTimes(2);
  });
});
