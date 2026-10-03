import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY, HOUR, CATALOG, createState, normalizeState, advanceState, checkIn, feed, pet,
  startErrand, buyItem, equipItem, rewardCoins, getBond } from '../src/engine.js';

const MONDAY = Date.parse('2026-09-28T12:00:00Z');
const fresh = () => createState(MONDAY);

test('weekly pacing reaches a gentle floor and recharges idle energy', () => {
  const state = fresh();
  state.energy = 0;
  advanceState(state, MONDAY + 3 * DAY);
  assert.equal(state.hunger, 64);
  assert.equal(state.happiness, 60);
  assert.equal(state.energy, 100);
  advanceState(state, MONDAY + 7 * DAY);
  assert.equal(state.hunger, 20);
  assert.equal(state.happiness, 20);
});

test('months away never kill the pet and a feast recovers hunger immediately', () => {
  const state = fresh();
  advanceState(state, MONDAY + 365 * DAY);
  assert.equal(state.hunger, 20);
  assert.equal(state.happiness, 20);
  assert.equal(feed(state, 'feast', MONDAY + 365 * DAY).ok, true);
  assert.equal(state.hunger, 100);
  assert.equal(pet(state, MONDAY + 365 * DAY).ok, true);
  assert.equal(state.happiness, 40);
});

test('welcome bonus is awarded once per saved last-seen value, surviving reload', () => {
  const state = fresh();
  assert.equal(advanceState(state, MONDAY + DAY).welcomeBonus, 0);
  assert.equal(advanceState(state, MONDAY + DAY + 1).welcomeBonus, 15);
  assert.equal(state.lastSeen, MONDAY);
  assert.equal(advanceState(state, MONDAY + 2 * DAY).welcomeBonus, 0);
  const restored = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY + 3 * DAY);
  assert.equal(advanceState(restored, MONDAY + 3 * DAY).welcomeBonus, 0);
  restored.lastSeen = MONDAY + 3 * DAY;
  assert.equal(advanceState(restored, MONDAY + 5 * DAY).welcomeBonus, 15);
});

test('negative clock changes do not double-charge decay', () => {
  const state = fresh();
  advanceState(state, MONDAY + DAY);
  advanceState(state, MONDAY - DAY);
  assert.equal(state.hunger, 88);
  assert.equal(state.lastUpdated, MONDAY + DAY);
  advanceState(state, MONDAY + 2 * DAY);
  assert.equal(state.hunger, 76);
});

test('premium mood boost applies only to the overlapping three-day interval', () => {
  const state = fresh();
  state.happiness = 50;
  assert.equal(feed(state, 'matcha', MONDAY).ok, true);
  assert.equal(state.happiness, 80);
  advanceState(state, MONDAY + 4 * DAY);
  assert.equal(state.happiness, 55); // 15 loss during boost, 10 afterward.
});

test('zero stats remain stable and free pets always work with no energy or coins', () => {
  const state = fresh();
  state.hunger = 0;
  state.happiness = 0;
  state.energy = 0;
  state.coins = 0;
  advanceState(state, MONDAY);
  assert.equal(state.hunger, 0);
  assert.equal(pet(state, MONDAY).ok, true);
  assert.equal(state.happiness, 10);
  assert.equal(state.energy, 0);
  assert.equal(state.coins, 5);
});

test('daily pet coin and bond reward cannot be farmed and resets at UTC midnight', () => {
  const state = fresh();
  assert.equal(pet(state, MONDAY).reward, 5);
  assert.equal(pet(state, MONDAY + HOUR).reward, 0);
  assert.equal(state.bondXp, 10);
  assert.equal(pet(state, MONDAY + 12 * HOUR).reward, 5);
  assert.equal(state.bondXp, 20);
});

test('errands charge energy, finish at the boundary, and claim exactly once after reload', () => {
  const state = fresh();
  assert.equal(startErrand(state, 'stroll', MONDAY).ok, true);
  assert.equal(state.energy, 80);
  assert.equal(startErrand(state, 'bookshop', MONDAY).ok, false);
  assert.equal(advanceState(state, MONDAY + 2 * HOUR - 1).errandReward, null);
  const reward = advanceState(state, MONDAY + 2 * HOUR).errandReward;
  assert.equal(reward.coins, 20);
  assert.equal(state.energy, 90);
  assert.equal(state.errand, null);
  const restored = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY + 3 * HOUR);
  assert.equal(advanceState(restored, MONDAY + 3 * HOUR).errandReward, null);
  assert.equal(restored.coins, 80);
});

test('bookshop grants manga then a reader badge, without duplicate collectibles', () => {
  const state = fresh();
  startErrand(state, 'bookshop', MONDAY);
  assert.equal(advanceState(state, MONDAY + 4 * HOUR).errandReward.itemId, 'manga');
  startErrand(state, 'bookshop', MONDAY + 4 * HOUR);
  assert.equal(advanceState(state, MONDAY + 8 * HOUR).errandReward.badge, 'bookshop-regular');
  assert.deepEqual(state.owned, ['manga']);
  assert.deepEqual(state.badges, ['bookshop-regular']);
  state.energy = 0;
  assert.equal(startErrand(state, 'stroll', MONDAY + 8 * HOUR).ok, false);
});

test('attendance uses Monday UTC, paused chains survive gaps, milestones use total attendance', () => {
  const state = fresh();
  const sunday = Date.parse('2026-10-04T23:59:59Z');
  assert.equal(checkIn(state, MONDAY).isNewWeek, true);
  assert.equal(checkIn(state, sunday).isNewWeek, false);
  const week2 = checkIn(state, sunday + 1000);
  assert.equal(week2.streak, 2);
  assert.equal(week2.newMilestones[0].itemId, 'ribbon');
  assert.deepEqual(checkIn(state, sunday + 2000).newMilestones, []);
  const afterGap = checkIn(state, MONDAY + 4 * 7 * DAY);
  assert.equal(afterGap.streak, 2);
  assert.equal(afterGap.total, 3);
  const week4 = checkIn(state, MONDAY + 5 * 7 * DAY);
  assert.equal(week4.streak, 3);
  assert.equal(week4.newMilestones[0].itemId, 'bookmark');
  for (let i = 6; i <= 9; i++) checkIn(state, MONDAY + i * 7 * DAY);
  assert.equal(state.attendance.total, 8);
  assert.deepEqual(state.owned, ['ribbon', 'bookmark', 'plant']);
  const restored = normalizeState(state, MONDAY + 9 * 7 * DAY);
  assert.deepEqual(restored.attendance, state.attendance);
});

test('reading rewards enforce daily/weekly caps and UTC resets', () => {
  const state = fresh();
  assert.equal(rewardCoins(state, 80, 'Reading', MONDAY).awarded, 80);
  assert.equal(rewardCoins(state, 80, 'Reading', MONDAY).awarded, 20);
  assert.equal(rewardCoins(state, 80, 'Reading', MONDAY).awarded, 0);
  assert.equal(rewardCoins(state, 100, 'Reading', MONDAY + DAY).awarded, 100);
  assert.equal(rewardCoins(state, 100, 'Reading', MONDAY + 2 * DAY).awarded, 100);
  assert.equal(rewardCoins(state, 100, 'Reading', MONDAY + 3 * DAY).awarded, 0);
  assert.equal(rewardCoins(state, 100, 'Reading', MONDAY + 7 * DAY).awarded, 100);
  assert.equal(state.reading.dailyCoins, 100);
  assert.equal(state.reading.weeklyCoins, 100);
});

test('chapter IDs deduplicate across reloads and weeks; new chapters build bond even at coin cap', () => {
  const state = fresh();
  assert.equal(rewardCoins(state, 100, { chapterId: ' series:chapter-1 ', reason: 'First chapter' }, MONDAY).awarded, 100);
  assert.equal(rewardCoins(state, 20, { chapterId: 'series:chapter-1' }, MONDAY).ok, false);
  assert.equal(rewardCoins(state, 20, { chapterId: 'series:chapter-2' }, MONDAY).awarded, 0);
  assert.equal(state.bondXp, 24);
  const restored = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY + 7 * DAY);
  assert.equal(rewardCoins(restored, 20, { chapterId: 'series:chapter-1' }, MONDAY + 7 * DAY).awarded, 0);
  assert.equal(restored.bondXp, 24);
});

test('reading rewards reject invalid amounts and malformed chapter identifiers', () => {
  const state = fresh();
  for (const amount of [0, -1, 1.5, NaN, Infinity, '20', null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(rewardCoins(state, amount, 'Reading', MONDAY).ok, false);
  }
  for (const chapterId of ['', ' ', {}, 17, 'a'.repeat(201)]) {
    assert.equal(rewardCoins(state, 20, { chapterId }, MONDAY).ok, false);
  }
  assert.equal(state.coins, 60);
  assert.equal(state.bondXp, 0);
});

test('shop charges once, equips independent decor, switches wearables, and toggles owned items', () => {
  const state = fresh();
  state.coins = 300;
  assert.equal(buyItem(state, 'rug', MONDAY).ok, true);
  assert.equal(buyItem(state, 'rug', MONDAY).ok, false);
  assert.equal(buyItem(state, 'manga', MONDAY).ok, true);
  assert.deepEqual(state.equipped, { rug: 'rug', manga: 'manga' });
  buyItem(state, 'glasses', MONDAY);
  buyItem(state, 'headband', MONDAY);
  assert.equal(state.equipped.accessory, 'headband');
  assert.equal(equipItem(state, 'headband').ok, true);
  assert.equal(state.equipped.accessory, undefined);
  assert.equal(equipItem(state, 'mask').ok, false);
  assert.equal(buyItem(state, 'ribbon', MONDAY).ok, false);
  assert.equal(state.coins, 130);
});

test('bond levels have exact boundaries and meaningful progress', () => {
  const state = fresh();
  assert.deepEqual(getBond(state), { level: 1, current: 0, needed: 100, progress: 0 });
  state.bondXp = 50;
  assert.equal(getBond(state).progress, 50);
  state.bondXp = 100;
  assert.deepEqual(getBond(state), { level: 2, current: 0, needed: 150, progress: 0 });
  state.bondXp = 249;
  assert.equal(getBond(state).level, 2);
  state.bondXp = 250;
  assert.deepEqual(getBond(state), { level: 3, current: 0, needed: 200, progress: 0 });
});

test('malformed saves become safe usable state without trusting counters or prototype keys', () => {
  for (const raw of [null, undefined, 'broken', [], 0]) {
    assert.deepEqual(normalizeState(raw, MONDAY), fresh());
  }
  const raw = {
    hunger: -999, happiness: Infinity, energy: 900, coins: -1, bondXp: NaN,
    lastUpdated: 'bad', lastSeen: MONDAY + 100 * DAY, createdAt: -42,
    owned: ['rug', 'rug', 'fake', 'matcha', '__proto__'],
    equipped: { rug: 'rug', accessory: 'fake', '__proto__': 'rug' },
    errand: { kind: '__proto__', startedAt: 0, endsAt: 0 },
    attendance: { weeks: ['2026-09-28', '2026-09-28', '2026-09-29', '2100-01-04', 'bad'], total: 900, streak: 800 },
    reading: { day: 'bad', week: 'bad', dailyCoins: -1, weeklyCoins: Infinity, chapterIds: ['a', 'a', 5, null] },
  };
  const state = normalizeState(raw, MONDAY);
  assert.equal(state.hunger, 0);
  assert.equal(state.happiness, 90);
  assert.equal(state.energy, 100);
  assert.equal(state.coins, 0);
  assert.equal(state.lastUpdated, MONDAY);
  assert.equal(state.lastSeen, MONDAY);
  assert.deepEqual(state.owned, ['rug']);
  assert.deepEqual(state.equipped, { rug: 'rug' });
  assert.equal(state.errand, null);
  assert.equal(state.attendance.total, 1);
  assert.equal(state.attendance.streak, 1);
  assert.deepEqual(state.reading.chapterIds, ['a']);
  assert.doesNotThrow(() => advanceState(state, MONDAY + DAY));
  assert.equal(feed(state, '__proto__', MONDAY).ok, false);
  assert.equal(startErrand(state, '__proto__', MONDAY).ok, false);
});

test('ISO timestamps migrate and future clocks clamp safely', () => {
  const state = normalizeState({ lastUpdated: '2026-09-27T12:00:00Z', lastSeen: '2026-09-27T12:00:00Z', moodBoostUntil: '9999-01-01T00:00:00Z' }, MONDAY);
  assert.equal(state.lastUpdated, MONDAY - DAY);
  assert.equal(state.moodBoostUntil, MONDAY + 3 * DAY);
  advanceState(state, MONDAY);
  assert.equal(state.hunger, 88);
  assert.equal(state.happiness, 85);
});

test('catalog item IDs are unique and every non-treat collectible has an equipment slot', () => {
  assert.equal(new Set(CATALOG.map((item) => item.id)).size, CATALOG.length);
  for (const item of CATALOG) if (item.category !== 'treat') assert.ok(item.slot);
});
