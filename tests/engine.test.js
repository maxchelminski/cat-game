import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY, HOUR, STORAGE_KEY, CATALOG, ROOMS, SETS, PASS_REWARDS, ACHIEVEMENTS,
  createState, normalizeState, advanceState, checkIn, feed, pet, startErrand, recallErrand,
  getErrandPreview, buyItem, equipItem, rewardCoins, getBond, getPass, getActiveSet,
  getCareBonus, claimPassReward, getAchievementProgress, claimAchievement } from '../src/engine.js';

const MONDAY = Date.parse('2026-09-28T12:00:00Z');
const fresh = () => createState(MONDAY);
function collectSet(state, id, now = MONDAY) {
  state.coins = 10_000;
  for (const itemId of SETS.find((set) => set.id === id).itemIds) {
    if (!state.owned.includes(itemId)) assert.equal(buyItem(state, itemId, now).ok, true);
    else if (!Object.values(state.equipped).includes(itemId)) equipItem(state, itemId);
  }
}

test('catalog has five rooms, six outfits, canonical slots, and three independent shop sets', () => {
  assert.equal(ROOMS.length, 5);
  assert.equal(CATALOG.filter((item) => item.category === 'outfit').length, 6);
  assert.equal(CATALOG.filter((item) => item.category === 'wearable').length, 4);
  assert.equal(new Set(CATALOG.map((item) => item.id)).size, CATALOG.length);
  assert.equal(SETS.filter((set) => set.source === 'shop').length, 3);
  for (const set of SETS) {
    assert.equal(set.itemIds.length, 4);
    const members = set.itemIds.map((id) => CATALOG.find((item) => item.id === id));
    assert.deepEqual(new Set(members.map((item) => item.slot)), new Set(['room', 'rug', 'left', 'right']));
    assert.equal(members.some((item) => item.category === 'outfit'), false);
  }
  assert.deepEqual(fresh().equipped, { room: 'room-nook', outfit: 'outfit-base' });
  assert.equal(getActiveSet(fresh()), null);
});

test('weekly pacing has a gentle floor and recharges energy over long absences', () => {
  const state = fresh(); state.energy = 0;
  advanceState(state, MONDAY + 3 * DAY);
  assert.equal(state.hunger, 64); assert.equal(state.happiness, 60); assert.equal(state.energy, 100);
  advanceState(state, MONDAY + 365 * DAY);
  assert.equal(state.hunger, 20); assert.equal(state.happiness, 20);
  assert.equal(feed(state, 'feast', MONDAY + 365 * DAY).ok, true);
  assert.equal(state.hunger, 100);
  assert.equal(pet(state, MONDAY + 365 * DAY).ok, true);
  assert.equal(state.happiness, 40);
});

test('welcome rewards once per departure across reload and subsequent visits', () => {
  const state = fresh();
  assert.equal(advanceState(state, MONDAY + DAY).welcomeBonus, 0);
  assert.equal(advanceState(state, MONDAY + DAY + 1).welcomeBonus, 15);
  assert.equal(state.lastSeen, MONDAY);
  const restored = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY + 3 * DAY);
  assert.equal(advanceState(restored, MONDAY + 3 * DAY).welcomeBonus, 0);
  restored.lastSeen = MONDAY + 3 * DAY;
  assert.equal(advanceState(restored, MONDAY + 5 * DAY).welcomeBonus, 15);
});

test('weekly gifts grow 20/25/30/35/40, quiet weeks pause, and reload cannot replay a gift', () => {
  const state = fresh();
  const gifts = Array.from({ length: 6 }, (_, index) => checkIn(state, MONDAY + index * 7 * DAY).newWeeklyReward.leaves);
  assert.deepEqual(gifts, [20, 25, 30, 35, 40, 40]);
  assert.deepEqual(state.owned, ['room-nook', 'outfit-base']);
  const paused = checkIn(state, MONDAY + 10 * 7 * DAY);
  assert.equal(paused.streak, 6); assert.equal(paused.newWeeklyReward.leaves, 40);
  assert.equal(paused.total, 7);
  assert.equal(checkIn(state, MONDAY + 10 * 7 * DAY).newWeeklyReward, null);
  const raw = JSON.parse(JSON.stringify(state)); delete raw.attendance.rewardedWeeks;
  const restored = normalizeState(raw, MONDAY + 10 * 7 * DAY);
  assert.equal(checkIn(restored, MONDAY + 10 * 7 * DAY).newWeeklyReward, null);
  assert.equal(restored.coins, state.coins);
});

test('UTC Monday is the exact attendance boundary', () => {
  const state = fresh();
  checkIn(state, MONDAY);
  const sunday = Date.parse('2026-10-04T23:59:59Z');
  assert.equal(checkIn(state, sunday).newWeeklyReward, null);
  assert.equal(checkIn(state, sunday + 1000).newWeeklyReward.leaves, 25);
});

test('mood boosts only halve happiness decay during their actual overlap', () => {
  const state = fresh(); state.happiness = 50;
  feed(state, 'matcha', MONDAY);
  assert.equal(state.happiness, 80);
  advanceState(state, MONDAY + 4 * DAY);
  assert.equal(state.happiness, 55);
});

test('zero energy never blocks affection; pet achievements count at most once per minute', () => {
  const state = fresh(); state.energy = 0; state.coins = 0; state.happiness = 0;
  assert.deepEqual([pet(state, MONDAY).reward, state.happiness, state.energy], [5, 10, 0]);
  for (let i = 0; i < 50; i++) assert.equal(pet(state, MONDAY).qualified, false);
  assert.equal(state.care.qualifiedPets, 1); assert.equal(state.bondXp, 10); assert.equal(state.coins, 5);
  assert.equal(pet(state, MONDAY + 59_999).qualified, false);
  assert.equal(pet(state, MONDAY + 60_000).qualified, true);
  assert.equal(state.care.qualifiedPets, 2);
  assert.equal(pet(state, MONDAY + 12 * HOUR).reward, 5);
  assert.equal(state.bondXp, 20);
});

test('only the first three successful feeds each UTC day grant XP', () => {
  const state = fresh(); state.coins = 1000;
  assert.deepEqual(Array.from({ length: 8 }, () => feed(state, 'snack', MONDAY).xp), [5, 5, 5, 0, 0, 0, 0, 0]);
  assert.equal(state.bondXp, 15); assert.equal(state.care.feedsToday, 3);
  assert.equal(feed(state, 'snack', MONDAY + DAY).xp, 5);
  assert.equal(state.care.feedsToday, 1);
});

test('all XP sources share one strict daily budget and discard overflow', () => {
  const state = fresh(); state.coins = 1000;
  assert.equal(pet(state, MONDAY).xp, 10);
  for (let i = 0; i < 3; i++) feed(state, 'snack', MONDAY);
  startErrand(state, 'stroll', MONDAY);
  assert.equal(advanceState(state, MONDAY + 2 * HOUR).errandReward.xp, 15);
  assert.equal(state.bondXp, 40);
  const now = MONDAY + 2 * HOUR;
  const reading = Array.from({ length: 10 }, (_, index) => rewardCoins(state, 10, { chapterId: `mixed:${index}` }, now));
  assert.equal(reading.reduce((sum, result) => sum + result.xp, 0), 60);
  assert.equal(state.bondXp, 100); assert.equal(state.xpBudget.dailyXp, 100);
  assert.equal(feed(state, 'matcha', now).xp, 0);
  for (const level of getPass(state).claimable) claimPassReward(state, level, now);
  claimAchievement(state, 'chapters-1', now);
  assert.equal(state.bondXp, 100);
  const restored = normalizeState(state, now);
  assert.equal(rewardCoins(restored, 10, { chapterId: 'after-reload' }, now).xp, 0);
  advanceState(restored, MONDAY + DAY);
  assert.equal(restored.bondXp, 100); // No deferred XP from capped actions.
  assert.equal(rewardCoins(restored, 10, { chapterId: 'next-day' }, MONDAY + DAY).xp, 13);
});

test('reading leaf and XP budgets reset separately with no chapter replay', () => {
  const state = fresh();
  assert.equal(rewardCoins(state, 80, { chapterId: 'first' }, MONDAY).awarded, 80);
  assert.equal(rewardCoins(state, 80, { chapterId: 'second' }, MONDAY).awarded, 20);
  assert.equal(rewardCoins(state, 80, { chapterId: 'third' }, MONDAY).awarded, 0);
  assert.equal(state.bondXp, 39);
  for (let day = 1; day <= 6; day++) {
    for (let chapter = 0; chapter < 10; chapter++) rewardCoins(state, 20, { chapterId: `${day}:${chapter}` }, MONDAY + day * DAY);
  }
  assert.equal(state.reading.weeklyCoins, 300);
  assert.equal(state.xpBudget.weeklyXp, 639);
  const restored = normalizeState(state, MONDAY + 7 * DAY);
  assert.equal(rewardCoins(restored, 20, { chapterId: 'first' }, MONDAY + 7 * DAY).awarded, 0);
  assert.equal(rewardCoins(restored, 20, { chapterId: 'new-week' }, MONDAY + 7 * DAY).awarded, 20);
  assert.equal(restored.reading.weeklyCoins, 20);
});

test('backwards clocks cannot refill leaf/XP budgets or double-charge stat decay', () => {
  const state = fresh();
  for (let i = 0; i < 10; i++) rewardCoins(state, 20, { chapterId: `today:${i}` }, MONDAY + DAY);
  const before = state.hunger;
  assert.equal(rewardCoins(state, 20, { chapterId: 'clock-reversed' }, MONDAY).xp, 0);
  assert.equal(rewardCoins(state, 20, { chapterId: 'clock-returned' }, MONDAY + DAY).awarded, 0);
  assert.equal(state.hunger, before); assert.equal(state.bondXp, 100);
  assert.equal(state.lastUpdated, MONDAY + DAY);
});

test('care bonuses are positive only and chapter XP rounds consistently', () => {
  const state = fresh(); state.hunger = 69; state.happiness = 69;
  assert.equal(getCareBonus(state).adventureLeaves, 0); assert.equal(getCareBonus(state).chapterXp, 0);
  assert.equal(rewardCoins(state, 20, { chapterId: 'ordinary' }, MONDAY).xp, 12);
  state.hunger = 70; state.happiness = 70;
  assert.equal(getCareBonus(state).adventureLeaves, 0.05); assert.equal(getCareBonus(state).chapterXp, 0.05);
  assert.equal(rewardCoins(state, 20, { chapterId: 'happy' }, MONDAY).xp, 13);
});

test('matching room and three equipped decor pieces activates one bonus; outfits remain independent', () => {
  const state = fresh(); collectSet(state, 'shrine');
  assert.equal(getActiveSet(state).id, 'shrine');
  assert.equal(rewardCoins(state, 20, 'Reading', MONDAY).awarded, 21);
  buyItem(state, 'outfit-yukata', MONDAY);
  assert.equal(getActiveSet(state).id, 'shrine');
  equipItem(state, 'room-nook'); assert.equal(getActiveSet(state), null);
  equipItem(state, 'room-shrine');
  buyItem(state, 'plant', MONDAY); // Replaces the left lantern.
  assert.equal(state.equipped.left, 'plant'); assert.equal(getActiveSet(state), null);
  equipItem(state, 'shrine-lantern'); assert.equal(getActiveSet(state).id, 'shrine');
  equipItem(state, 'shrine-lantern'); assert.equal(getActiveSet(state), null);
});

test('canonical slots replace furniture and default room/outfit remain present', () => {
  const state = fresh(); state.coins = 1000;
  for (const id of ['manga', 'kotatsu', 'bookshelf', 'plant']) buyItem(state, id, MONDAY);
  assert.equal(state.equipped.right, 'kotatsu'); assert.equal(state.equipped.left, 'plant');
  assert.equal(state.equipped.manga, undefined); assert.equal(state.equipped.bookshelf, undefined);
  equipItem(state, 'room-nook'); equipItem(state, 'outfit-base');
  assert.equal(state.equipped.room, 'room-nook'); assert.equal(state.equipped.outfit, 'outfit-base');
  assert.equal(equipItem(state, 'outfit-moon').ok, false);
  assert.equal(buyItem(state, 'room-moon', MONDAY).ok, false);
});

test('dispatch snapshots additive set/care bonuses; changing gear or feeding cannot alter them', () => {
  const state = fresh(); collectSet(state, 'shrine');
  startErrand(state, 'stroll', MONDAY);
  assert.equal(state.errand.reward.leaves, 22);
  equipItem(state, 'room-nook'); state.hunger = 20;
  const restored = normalizeState(state, MONDAY + HOUR);
  assert.equal(getErrandPreview(restored, MONDAY + HOUR).leaves, 11);
  assert.equal(recallErrand(restored, MONDAY + HOUR).leaves, 11);
  const plain = fresh(); plain.hunger = 20;
  startErrand(plain, 'stroll', MONDAY);
  collectSet(plain, 'shrine', MONDAY); feed(plain, 'feast', MONDAY);
  assert.equal(getErrandPreview(plain, MONDAY + 2 * HOUR).leaves, 20);
});

test('recall rewards exactly 0/25/50/75/100 percent at quarter boundaries and never refunds energy', () => {
  const cases = [[0, 0], [HOUR / 2 - 1, 0], [HOUR / 2, 25], [HOUR - 1, 25], [HOUR, 50], [1.5 * HOUR, 75], [2 * HOUR - 1, 75], [2 * HOUR, 100]];
  for (const [elapsed, percent] of cases) {
    const state = fresh(); state.hunger = 20;
    startErrand(state, 'stroll', MONDAY);
    const result = recallErrand(state, MONDAY + elapsed);
    assert.equal(result.percent, percent); assert.equal(result.leaves, Math.floor(20 * percent / 100));
    assert.equal(result.xp, Math.floor(15 * percent / 100));
    assert.equal(state.energy, 80 + elapsed / HOUR * 5);
    assert.equal(state.errandsCompleted, percent === 100 ? 1 : 0);
    assert.equal(state.errand, null); assert.equal(recallErrand(state, MONDAY + elapsed).ok, false);
  }
});

test('partial errands never grant full-completion collectibles, badges, or achievements', () => {
  const state = fresh();
  startErrand(state, 'bookshop', MONDAY);
  const result = recallErrand(state, MONDAY + 3 * HOUR);
  assert.equal(result.percent, 75); assert.equal(result.itemId, null); assert.equal(result.badge, null);
  assert.equal(state.owned.includes('manga'), false); assert.equal(state.errandsCompleted, 0);
  assert.equal(claimAchievement(state, 'errands-1', MONDAY + 3 * HOUR).ok, false);
  startErrand(state, 'bookshop', MONDAY + 3 * HOUR);
  assert.equal(advanceState(state, MONDAY + 7 * HOUR).errandReward.itemId, 'manga');
  startErrand(state, 'bookshop', MONDAY + 7 * HOUR);
  assert.equal(advanceState(state, MONDAY + 11 * HOUR).errandReward.badge, 'bookshop-regular');
  const restored = normalizeState(state, MONDAY + 12 * HOUR);
  assert.equal(advanceState(restored, MONDAY + 12 * HOUR).errandReward, null);
  assert.equal(restored.errandsCompleted, 2);
});

test('pass has 50 exact thresholds, ten badges, five metadata-only roles, and a reserved final surprise', () => {
  assert.equal(PASS_REWARDS.length, 50); assert.equal(PASS_REWARDS[0].xpRequired, 50);
  assert.equal(PASS_REWARDS[9].xpRequired, 1000); assert.equal(PASS_REWARDS.at(-1).xpRequired, 18200);
  for (let i = 1; i < 50; i++) assert.ok(PASS_REWARDS[i].xpRequired > PASS_REWARDS[i - 1].xpRequired);
  assert.equal(PASS_REWARDS.filter((reward) => reward.badge).length, 10);
  assert.deepEqual(PASS_REWARDS.filter((reward) => reward.role).map((reward) => reward.level), [10, 20, 30, 40, 50]);
  assert.deepEqual(PASS_REWARDS.at(-1).entitlement, { id: 'six-month-surprise', status: 'reserved' });
  assert.deepEqual(PASS_REWARDS.at(-1).itemIds, []);
  const state = fresh();
  assert.equal(getPass(state).level, 0); assert.equal(getBond(state).needed, 50);
  state.bondXp = 50;
  assert.equal(getPass(state).level, 1); assert.equal(getPass(state).current, 0); assert.equal(getPass(state).needed, 60);
});

test('all pass rewards claim once across serialization and cannot create XP or counterfeit final items', () => {
  let state = fresh();
  assert.equal(claimPassReward(state, 1, MONDAY).ok, false);
  state.bondXp = 18200;
  const startingLeaves = state.coins;
  for (let level = 50; level >= 1; level--) assert.equal(claimPassReward(state, level, MONDAY).ok, true);
  assert.equal(state.coins, startingLeaves + PASS_REWARDS.reduce((sum, reward) => sum + reward.leaves, 0));
  assert.equal(state.pass.roles.length, 5); assert.equal(state.badges.length, 10);
  assert.deepEqual(state.pass.entitlements, [{ id: 'six-month-surprise', status: 'reserved' }]);
  assert.equal(state.owned.includes('six-month-surprise'), false);
  assert.equal(state.bondXp, 18200);
  state = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY);
  const leaves = state.coins;
  for (let level = 1; level <= 50; level++) assert.equal(claimPassReward(state, level, MONDAY).ok, false);
  assert.equal(state.coins, leaves); assert.equal(getPass(state).claimable.length, 0);
  assert.equal(getPass(state).complete, true);
  for (const id of SETS.find((set) => set.id === 'moon').itemIds) equipItem(state, id);
  assert.equal(getActiveSet(state).bonus, 0.08);
});

test('achievement claims use distinct chapters, qualified pets, full errands and collected shop sets', () => {
  let state = fresh();
  assert.equal(claimAchievement(state, 'chapters-1', MONDAY).ok, false);
  for (let chapter = 0; chapter < 100; chapter++) rewardCoins(state, 1, { chapterId: `a:${chapter}` }, MONDAY);
  for (let i = 0; i < 25; i++) pet(state, MONDAY + i * 60_000);
  state.errandsCompleted = 10;
  for (const set of SETS.filter((entry) => entry.source === 'shop')) collectSet(state, set.id, MONDAY + HOUR);
  assert.equal(getAchievementProgress(state, 'set-three').current, 3);
  const xpBefore = state.bondXp, leavesBefore = state.coins;
  for (const achievement of ACHIEVEMENTS) assert.equal(claimAchievement(state, achievement.id, MONDAY + HOUR).ok, true);
  assert.equal(state.coins, leavesBefore + ACHIEVEMENTS.reduce((sum, entry) => sum + entry.leaves, 0));
  assert.equal(state.bondXp, xpBefore);
  state = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY + HOUR);
  for (const achievement of ACHIEVEMENTS) assert.equal(claimAchievement(state, achievement.id, MONDAY + HOUR).ok, false);
});

test('fresh maximum pace finishes at 182 earning days with every source under a single hard cap', () => {
  let state = fresh(), earningDays = 0;
  for (let day = 0; day < 190; day++) {
    const now = MONDAY + day * DAY;
    advanceState(state, now);
    const dayStartXp = state.bondXp - state.xpBudget.dailyXp;
    pet(state, now);
    for (let i = 0; i < 12; i++) rewardCoins(state, 10, { chapterId: `pace:${day}:${i}` }, now);
    for (let i = 0; i < 5; i++) feed(state, 'snack', now);
    if (!state.errand) startErrand(state, 'stroll', now);
    for (const level of getPass(state).claimable) claimPassReward(state, level, now);
    assert.ok(state.bondXp - dayStartXp <= 100);
    assert.ok(state.xpBudget.weeklyXp <= 700);
    earningDays += 1;
    if (getPass(state).complete) break;
    state = normalizeState(JSON.parse(JSON.stringify(state)), now);
  }
  assert.equal(earningDays, 182);
  assert.equal(state.bondXp, 18200);
  assert.equal(state.pass.claimed.length, 50);
  assert.ok(earningDays - 1 >= 175 && earningDays - 1 <= 190);
});

test('v1 migration retains currency, earned items, XP and chapters without replaying attendance', () => {
  const raw = { version: 1, coins: 321, bondXp: 400, hunger: 82, happiness: 76, energy: 40,
    lastUpdated: MONDAY, lastSeen: MONDAY, createdAt: MONDAY - 60 * DAY,
    owned: ['rug', 'bookshelf', 'kotatsu', 'manga', 'plant', 'bookmark', 'ribbon'],
    equipped: { rug: 'rug', bookshelf: 'bookshelf', kotatsu: 'kotatsu', manga: 'manga', plant: 'plant', bookmark: 'bookmark', accessory: 'ribbon' },
    attendance: { weeks: ['2026-09-21', '2026-09-28'], streak: 2, total: 2 },
    reading: { day: '2026-09-28', week: '2026-09-28', dailyCoins: 20, weeklyCoins: 60, chapterIds: ['legacy:1'] },
    errand: { kind: 'stroll', startedAt: MONDAY, endsAt: MONDAY + 2 * HOUR } };
  const state = normalizeState(raw, MONDAY);
  assert.equal(STORAGE_KEY, 'schale-idle-companion:v1'); assert.equal(state.version, 2);
  assert.equal(state.coins, 321); assert.equal(state.bondXp, 400);
  for (const id of raw.owned) assert.ok(state.owned.includes(id));
  assert.equal(state.equipped.left, 'plant'); assert.equal(state.equipped.right, 'bookmark');
  assert.equal(state.equipped.back, undefined); assert.equal(state.equipped.room, 'room-nook');
  assert.equal(checkIn(state, MONDAY).newWeeklyReward, null);
  assert.equal(state.xpBudget.dailyXp, 100); // Conservative migration of an uncapped same-day ledger.
  assert.equal(rewardCoins(state, 20, { chapterId: 'legacy:1' }, MONDAY).awarded, 0);
  assert.equal(getErrandPreview(state, MONDAY + 2 * HOUR).leaves, 20);
});

test('malformed imports repair budgets and claims without allowing repeated grants', () => {
  for (const raw of [null, undefined, 'broken', [], 0]) assert.deepEqual(normalizeState(raw, MONDAY), fresh());
  const state = normalizeState({ version: 2, hunger: -5, energy: 300, happiness: Infinity, coins: -3, bondXp: 200,
    lastUpdated: 'bad', lastSeen: MONDAY + DAY, owned: ['rug', 'rug', 'matcha', '__proto__'],
    equipped: { rug: 'rug', left: 'rug' }, errand: { kind: '__proto__' },
    xpBudget: { day: '2026-09-28', week: '2026-09-28', dailyXp: 9999, weeklyXp: 9999 },
    pass: { claimed: [1, 1, 2, 50, -1, '2'], roles: ['admin'], entitlements: [{ id: 'fake' }] },
    achievements: { claimed: ['chapters-1', 'chapters-1', 'fake'], completedSets: ['shrine'] },
    reading: { chapterIds: [' a ', 'a', 5, null] },
    attendance: { weeks: ['2026-09-28', '2026-09-28', '2026-09-29', 'bad'] },
  }, MONDAY);
  assert.equal(state.hunger, 0); assert.equal(state.energy, 100); assert.equal(state.happiness, 90);
  assert.equal(state.coins, 0); assert.equal(state.errand, null);
  assert.equal(state.xpBudget.dailyXp, 100); assert.equal(state.xpBudget.weeklyXp, 700);
  assert.deepEqual(state.pass.claimed, [1, 2]); assert.deepEqual(state.pass.roles, []); assert.deepEqual(state.pass.entitlements, []);
  assert.deepEqual(state.achievements.claimed, ['chapters-1']); assert.deepEqual(state.achievements.completedSets, []);
  assert.deepEqual(state.reading.chapterIds, ['a']); assert.equal(state.attendance.total, 1);
  assert.equal(claimPassReward(state, 1, MONDAY).ok, false);
  assert.equal(feed(state, '__proto__', MONDAY).ok, false); assert.equal(startErrand(state, '__proto__', MONDAY).ok, false);
});

test('reading hook rejects malformed amounts and chapter identifiers', () => {
  const state = fresh();
  for (const amount of [0, -1, 1.5, NaN, Infinity, '20', null, Number.MAX_SAFE_INTEGER + 1]) assert.equal(rewardCoins(state, amount, 'Reading', MONDAY).ok, false);
  for (const chapterId of ['', ' ', {}, 17, 'a'.repeat(201)]) assert.equal(rewardCoins(state, 20, { chapterId }, MONDAY).ok, false);
  assert.equal(state.coins, 60); assert.equal(state.bondXp, 0);
});

test('earlier v2 bookmark saves migrate to the visible right furniture slot', () => {
  const raw = fresh();
  raw.owned.push('bookmark', 'manga');
  raw.equipped.right = 'manga'; raw.equipped.back = 'bookmark';
  const state = normalizeState(raw, MONDAY);
  assert.equal(state.equipped.right, 'bookmark'); assert.equal(state.equipped.back, undefined);
  assert.ok(state.owned.includes('manga'));
});

test('room interactions migrate independently and preserve only known boolean toggles', () => {
  const oldSave = fresh();
  delete oldSave.roomToggles; delete oldSave.decorToggles;
  const migrated = normalizeState(oldSave, MONDAY);
  assert.deepEqual(migrated.roomToggles, {}); assert.deepEqual(migrated.decorToggles, {});
  const state = normalizeState({ ...oldSave,
    roomToggles: {
      nook: { windowOpen: false, lightOn: true, other: false },
      shrine: { windowOpen: 'false', lightOn: false },
      tearoom: { windowOpen: true, lightOn: 0 },
      sakura: null, moon: { windowOpen: false, lightOn: false },
      invented: { windowOpen: false, lightOn: false },
    },
    decorToggles: { 'shrine-lantern': false, 'sakura-lantern': 'false', 'moon-lamp': true, rug: false },
  }, MONDAY);
  assert.deepEqual(state.roomToggles, {
    nook: { windowOpen: false, lightOn: true }, shrine: { lightOn: false },
    tearoom: { windowOpen: true }, moon: { windowOpen: false, lightOn: false },
  });
  assert.deepEqual(state.decorToggles, { 'shrine-lantern': false, 'moon-lamp': true });
  const restored = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY);
  assert.deepEqual(restored.roomToggles, state.roomToggles);
  assert.deepEqual(restored.decorToggles, state.decorToggles);
  assert.equal(restored.coins, oldSave.coins); assert.equal(restored.bondXp, oldSave.bondXp);
});

test('errand EXP preview matches the claim when budgets are full or reset', () => {
  const state = fresh();
  startErrand(state, 'stroll', MONDAY);
  for (let i = 0; i < 10; i++) rewardCoins(state, 10, { chapterId: `preview:${i}` }, MONDAY);
  assert.equal(getErrandPreview(state, MONDAY + HOUR).xp, 0);
  const restored = normalizeState(state, MONDAY + HOUR);
  assert.equal(recallErrand(restored, MONDAY + HOUR).xp, 0);
  assert.equal(getErrandPreview(state, MONDAY + DAY).xp, 15);
  assert.equal(recallErrand(state, MONDAY + DAY).xp, 15);
});

test('small chapter payouts retain an exact 5% shop-set bonus across days and reloads', () => {
  let state = fresh(); collectSet(state, 'shrine');
  let awarded = 0;
  for (let day = 0; day < 5; day++) {
    for (let chapter = 0; chapter < 4; chapter++) {
      awarded += rewardCoins(state, 10, { chapterId: `carry:${day}:${chapter}` }, MONDAY + day * DAY).awarded;
      state = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY + day * DAY);
    }
  }
  assert.equal(awarded, 210);
  assert.equal(state.reading.bonusRemainder, 0);
  assert.equal(state.reading.weeklyCoins, 210);
});

test('the exclusive 8% set bonus exceeds shop sets and carries fractional leaves across reloads', () => {
  let state = fresh();
  const moon = SETS.find(set => set.id === 'moon');
  assert.equal(moon.bonus, 0.08);
  assert.ok(SETS.filter(set => set.source === 'shop').every(set => set.bonus === 0.05 && set.bonus < moon.bonus));
  for (const id of moon.itemIds) {
    state.owned.push(id); equipItem(state, id);
  }
  let awarded = 0;
  for (let day = 0; day < 5; day++) {
    for (let chapter = 0; chapter < 4; chapter++) {
      awarded += rewardCoins(state, 10, { chapterId: `moon-carry:${day}:${chapter}` }, MONDAY + day * DAY).awarded;
      state = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY + day * DAY);
    }
  }
  assert.equal(awarded, 216); assert.equal(state.reading.bonusRemainder, 0);
});

test('moon set and fullness snapshot 13% adventure rewards through reloads and recalls', () => {
  let state = fresh();
  for (const id of SETS.find(set => set.id === 'moon').itemIds) {
    state.owned.push(id); equipItem(state, id);
  }
  assert.equal(startErrand(state, 'bookshop', MONDAY).ok, true);
  assert.equal(state.errand.reward.bonus, 0.13);
  assert.equal(state.errand.reward.leaves, 39);
  equipItem(state, 'room-nook'); state.hunger = 20;
  state = normalizeState(JSON.parse(JSON.stringify(state)), MONDAY + 3 * HOUR);
  assert.equal(state.errand.reward.bonus, 0.13);
  assert.equal(state.errand.reward.leaves, 39);
  const preview = getErrandPreview(state, MONDAY + 3 * HOUR);
  assert.equal(preview.percent, 75); assert.equal(preview.leaves, 29);
  assert.equal(recallErrand(state, MONDAY + 3 * HOUR).leaves, preview.leaves);
});

test('errand snapshot repairs cap oversized rewards without retroactively upgrading older trips', () => {
  const state = fresh();
  startErrand(state, 'bookshop', MONDAY);
  state.errand.reward = { leaves: 1000, xp: 1000, bonus: 1, setId: 'moon' };
  const repaired = normalizeState(state, MONDAY + HOUR);
  assert.equal(repaired.errand.reward.leaves, 39);
  assert.equal(repaired.errand.reward.bonus, 0.13);
  assert.equal(repaired.errand.reward.xp, 15);
  state.errand.reward = { leaves: 37, xp: 15, bonus: 0.08, setId: 'moon' };
  const earlierTrip = normalizeState(state, MONDAY + HOUR);
  assert.equal(earlierTrip.errand.reward.leaves, 37);
  assert.equal(earlierTrip.errand.reward.bonus, 0.08);
  assert.equal(recallErrand(earlierTrip, MONDAY + 4 * HOUR).leaves, 37);
});

test('duplicates and capped requests cannot farm or bank fractional set bonuses', () => {
  const state = fresh(); collectSet(state, 'shrine');
  rewardCoins(state, 10, { chapterId: 'fraction:1' }, MONDAY);
  assert.equal(state.reading.bonusRemainder, 0.5);
  rewardCoins(state, 10, { chapterId: 'fraction:1' }, MONDAY);
  assert.equal(state.reading.bonusRemainder, 0.5);
  assert.equal(rewardCoins(state, 1000, { chapterId: 'fraction:large' }, MONDAY).awarded, 90);
  assert.equal(state.reading.dailyCoins, 100);
  assert.equal(state.reading.bonusRemainder, 0); // 0.5 + 90*5%; whole overflow is discarded.
  for (let i = 0; i < 20; i++) rewardCoins(state, 1000, { chapterId: `fully-capped:${i}` }, MONDAY);
  assert.equal(state.reading.bonusRemainder, 0);
  assert.equal(rewardCoins(state, 10, { chapterId: 'next-fraction-day' }, MONDAY + DAY).awarded, 10);
  assert.equal(state.reading.bonusRemainder, 0.5);
  for (const malformed of [-1, 1, 99, NaN, Infinity, '0.5']) {
    const raw = fresh(); raw.reading.bonusRemainder = malformed;
    assert.equal(normalizeState(raw, MONDAY).reading.bonusRemainder, 0);
  }
});
