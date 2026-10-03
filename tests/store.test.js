import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY, HOUR, STORAGE_KEY, createState, pet } from '../src/engine.js';

const MONDAY = Date.parse('2026-09-28T12:00:00Z');
let moduleId = 0;

function events() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    emit(type, event = {}) {
      for (const listener of listeners.get(type) ?? []) listener(event);
    },
  };
}

/** Each test gets a fresh store module and browser globals, restored after completion. */
function browser(t, { now = MONDAY, saved = createState(now), webLocks = false } = {}) {
  const originalGlobals = new Map(['window', 'document', 'navigator', 'localStorage']
    .map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const originalNow = Date.now;
  const fixture = {
    now,
    failWrites: false,
    writes: 0,
    storage: new Map([[STORAGE_KEY, JSON.stringify(saved)]]),
    window: events(),
    document: { ...events(), hidden: false },
  };
  const localStorage = {
    getItem(key) { return fixture.storage.get(key) ?? null; },
    setItem(key, value) {
      fixture.writes += 1;
      if (fixture.failWrites) throw new Error('Storage quota exceeded');
      fixture.storage.set(key, String(value));
    },
  };
  const navigator = {};
  if (webLocks) {
    const queues = new Map();
    navigator.locks = {
      request(name, callback) {
        const operation = (queues.get(name) ?? Promise.resolve()).then(callback);
        queues.set(name, operation.catch(() => {}));
        return operation;
      },
    };
  }
  for (const [name, value] of Object.entries({ window: fixture.window, document: fixture.document, navigator, localStorage })) {
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  Date.now = () => fixture.now;
  t.after(() => {
    Date.now = originalNow;
    for (const [name, descriptor] of originalGlobals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  fixture.readSave = () => JSON.parse(fixture.storage.get(STORAGE_KEY));
  fixture.load = () => import(`../src/store.js?store-test=${++moduleId}`);
  return fixture;
}

test('working reads and failing writes retain session progress, then persist it when storage recovers', async (t) => {
  const env = browser(t);
  const store = await env.load();
  await store.startSession();
  env.failWrites = true;

  assert.equal((await store.rewardPetCoins(20, { chapterId: 'series:1' })).awarded, 20);
  assert.equal(store.getState().coins, 80);
  assert.equal(env.readSave().coins, 60);
  assert.equal(store.isPersistent(), false);

  assert.equal((await store.transact((state, now) => pet(state, now))).reward, 5);
  await store.transact(null, 'tick');
  assert.equal(store.getState().coins, 85);
  assert.deepEqual(store.getState().reading.chapterIds, ['series:1']);
  assert.equal((await store.rewardPetCoins(20, { chapterId: 'series:1' })).awarded, 0);
  assert.equal(store.getState().coins, 85);

  env.failWrites = false;
  assert.equal((await store.rewardPetCoins(15, { chapterId: 'series:2' })).awarded, 15);
  assert.equal(store.isPersistent(), true);
  assert.equal(env.readSave().coins, 100);
  assert.equal(env.readSave().reading.dailyCoins, 35);
  assert.deepEqual(env.readSave().reading.chapterIds, ['series:1', 'series:2']);

  const reloaded = await env.load();
  await reloaded.startSession();
  assert.equal(reloaded.getState().coins, 100);
  assert.equal((await reloaded.rewardPetCoins(20, { chapterId: 'series:1' })).awarded, 0);
});

test('concurrent local reading and pet requests preserve caps and one-time rewards', async (t) => {
  const env = browser(t);
  const store = await env.load();
  await store.startSession();
  const results = await Promise.all(Array.from({ length: 20 }, (_, index) =>
    store.rewardPetCoins(10, { chapterId: `series:${index}`, reason: 'Chapter finished' })));
  assert.equal(results.reduce((sum, result) => sum + result.awarded, 0), 100);
  assert.equal(store.getState().coins, 160);
  assert.equal(store.getState().reading.dailyCoins, 100);
  assert.equal(store.getState().reading.weeklyCoins, 100);
  assert.equal(store.getState().reading.chapterIds.length, 20);
  assert.equal(store.getState().bondXp, 240);

  const pets = await Promise.all(Array.from({ length: 12 }, () =>
    store.transact((state, now) => pet(state, now))));
  assert.equal(pets.reduce((sum, result) => sum + result.reward, 0), 5);
  assert.equal(store.getState().coins, 165);
  assert.equal(store.getState().bondXp, 250);
  assert.equal(env.readSave().coins, 165);
  assert.equal(env.readSave().reading.chapterIds.length, 20);
});

test('a shared Web Lock prevents duplicate chapter awards between separate store instances', async (t) => {
  const env = browser(t, { webLocks: true });
  const first = await env.load();
  const second = await env.load();
  await Promise.all([first.startSession(), second.startSession()]);
  const rewards = await Promise.all([
    first.rewardPetCoins(20, { chapterId: 'shared:chapter-1' }),
    second.rewardPetCoins(20, { chapterId: 'shared:chapter-1' }),
    first.rewardPetCoins(20, { chapterId: 'shared:chapter-2' }),
    second.rewardPetCoins(20, { chapterId: 'shared:chapter-3' }),
  ]);
  assert.equal(rewards.reduce((sum, result) => sum + result.awarded, 0), 60);
  assert.equal(env.readSave().coins, 120);
  assert.equal(env.readSave().bondXp, 36);
  assert.deepEqual(env.readSave().reading.chapterIds.sort(), [
    'shared:chapter-1', 'shared:chapter-2', 'shared:chapter-3',
  ]);

  env.window.emit('storage', { key: STORAGE_KEY });
  assert.equal(first.getState().coins, 120);
  assert.equal(second.getState().coins, 120);
});

test('visibility records actual departure and a later hidden pagehide never rewrites it', async (t) => {
  const env = browser(t);
  const store = await env.load();
  const notifications = [];
  store.subscribe((_state, detail) => notifications.push(detail));
  await store.startSession();

  env.now += HOUR;
  env.document.hidden = true;
  env.document.emit('visibilitychange');
  await store.startSession(); // Drain the visibility transaction already in the queue.
  assert.equal(env.readSave().lastSeen, MONDAY + HOUR);
  const departureSave = env.storage.get(STORAGE_KEY);
  const departureWrites = env.writes;

  env.now += 3 * DAY;
  env.window.emit('pagehide', { persisted: true });
  assert.equal(env.writes, departureWrites);
  assert.equal(env.storage.get(STORAGE_KEY), departureSave);

  env.document.hidden = false;
  env.document.emit('visibilitychange');
  await store.startSession();
  const resume = notifications.findLast((detail) => detail.label === 'resume');
  assert.equal(resume.catchup.awayMs, 3 * DAY);
  assert.equal(resume.catchup.welcomeBonus, 15);
  assert.equal(store.getState().lastSeen, env.now);
  assert.equal(env.readSave().coins, 75);
});

test('welcome awards once across repeated starts, reloads, and subsequent resumes', async (t) => {
  const env = browser(t, { now: MONDAY + 7 * DAY, saved: createState(MONDAY) });
  const first = await env.load();
  const initialEvents = [];
  first.subscribe((_state, detail) => initialEvents.push(detail));
  await first.startSession();
  await first.startSession();
  assert.equal(first.getState().coins, 75);
  assert.equal(initialEvents.filter((detail) => detail.catchup?.welcomeBonus === 15).length, 1);

  const second = await env.load();
  const reloadEvents = [];
  second.subscribe((_state, detail) => reloadEvents.push(detail));
  await second.startSession();
  await second.transact(null, 'resume');
  assert.equal(second.getState().coins, 75);
  assert.equal(reloadEvents.some((detail) => detail.catchup?.welcomeBonus), false);

  env.now += 2 * DAY;
  await second.transact(null, 'resume');
  assert.equal(second.getState().coins, 90);
  await second.transact(null, 'resume');
  assert.equal(second.getState().coins, 90);
  assert.equal(env.readSave().coins, 90);
});
