/** Pure, dependency-free state engine for the Schale idle companion. */
export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MAX_COINS = 1_000_000_000;
export const STORAGE_KEY = 'schale-idle-companion:v1';

export const CATALOG = Object.freeze([
  { id: 'rug', name: 'Sundown rug', description: 'A soft landing for little paws.', category: 'decor', price: 45, icon: '▰', slot: 'rug' },
  { id: 'bookshelf', name: 'Little library', description: 'Every favorite story, within reach.', category: 'decor', price: 80, icon: '▥', slot: 'bookshelf' },
  { id: 'kotatsu', name: 'Cozy kotatsu', description: 'The perfect place for one more chapter.', category: 'decor', price: 120, icon: '▤', slot: 'kotatsu' },
  { id: 'manga', name: 'Manga stack', description: 'A tiny, delightfully ambitious reading list.', category: 'decor', price: 35, icon: '▱', slot: 'manga' },
  { id: 'glasses', name: 'Round glasses', description: 'For very serious manga research.', category: 'wearable', price: 50, icon: '◎', slot: 'accessory' },
  { id: 'headband', name: 'Sakura headband', description: 'A little springtime, all year round.', category: 'wearable', price: 40, icon: '✿', slot: 'accessory' },
  { id: 'mask', name: 'Festival mask', description: 'A keepsake from a lantern-lit evening.', category: 'wearable', price: 75, icon: '◈', slot: 'accessory' },
  { id: 'matcha', name: 'Matcha mochi', description: '+30 joy, +10 fullness, and slower joy decay for 3 days.', category: 'treat', price: 24, icon: '●' },
  { id: 'ribbon', name: 'Companion ribbon', description: 'A thank-you for 2 weeks together.', category: 'wearable', price: null, icon: '⋈', slot: 'accessory' },
  { id: 'bookmark', name: 'Moonlit bookmark', description: 'A special place to keep your story. Earned at 4 weeks.', category: 'keepsake', price: null, icon: '▮', slot: 'bookmark' },
  { id: 'plant', name: 'Little sprout', description: 'A friendship that keeps growing. Earned at 8 weeks.', category: 'decor', price: null, icon: '♧', slot: 'plant' },
]);

export const MILESTONES = Object.freeze([
  { weeks: 2, itemId: 'ribbon', name: 'Companion ribbon', description: 'Two weeks, a little closer.' },
  { weeks: 4, itemId: 'bookmark', name: 'Moonlit bookmark', description: 'A month of stories together.' },
  { weeks: 8, itemId: 'plant', name: 'Little sprout', description: 'Good things grow at their own pace.' },
]);

const ITEMS = new Map(CATALOG.map((item) => [item.id, item]));
const ERRANDS = {
  stroll: { duration: 2 * HOUR, energy: 20, coins: 20, name: 'Neighborhood stroll' },
  bookshop: { duration: 4 * HOUR, energy: 35, coins: 35, name: 'Bookshop visit' },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const whole = (value, fallback = 0, max = MAX_COINS) => Math.floor(clamp(finite(value, fallback), 0, max));
const record = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const unique = (value) => [...new Set(Array.isArray(value) ? value : [])];

function timestamp(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = typeof value === 'string' ? Date.parse(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= 0
    ? Math.floor(Math.min(parsed, max)) : fallback;
}

function time(now) {
  return timestamp(now, Date.now(), 8_640_000_000_000_000);
}

function dayKey(now) {
  return new Date(now).toISOString().slice(0, 10);
}

/** Calendar boundaries use UTC, so changing time zones cannot double a reward. */
function weekKey(now) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

function validDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && dayKey(Date.parse(`${value}T00:00:00Z`)) === value;
}

function resetReadingWindows(state, now) {
  const day = dayKey(now);
  const week = weekKey(now);
  if (state.reading.day !== day) {
    state.reading.day = day;
    state.reading.dailyCoins = 0;
  }
  if (state.reading.week !== week) {
    state.reading.week = week;
    state.reading.weeklyCoins = 0;
  }
}

export function createState(now = Date.now()) {
  now = time(now);
  return {
    version: 1,
    hunger: 100,
    happiness: 90,
    energy: 100,
    coins: 60,
    bondXp: 0,
    lastUpdated: now,
    lastSeen: now,
    createdAt: now,
    welcomeClaimedFor: null,
    owned: [],
    equipped: {},
    badges: [],
    moodBoostUntil: 0,
    errand: null,
    errandsCompleted: 0,
    attendance: { weeks: [], streak: 0, best: 0, total: 0, lastWeek: null },
    reading: { day: dayKey(now), week: weekKey(now), dailyCoins: 0, weeklyCoins: 0, chapterIds: [] },
    lastPetDay: null,
  };
}

/** Read saves defensively; callers should catch JSON.parse/storage errors separately. */
export function normalizeState(raw, now = Date.now()) {
  now = time(now);
  raw = record(raw);
  const state = createState(now);
  for (const key of ['hunger', 'happiness', 'energy']) state[key] = clamp(finite(raw[key], state[key]), 0, 100);
  state.coins = whole(raw.coins, state.coins);
  state.bondXp = whole(raw.bondXp);
  state.lastUpdated = timestamp(raw.lastUpdated, now, now);
  state.lastSeen = timestamp(raw.lastSeen, state.lastUpdated, now);
  state.createdAt = timestamp(raw.createdAt, Math.min(state.lastSeen, state.lastUpdated), now);
  state.welcomeClaimedFor = raw.welcomeClaimedFor == null ? null : timestamp(raw.welcomeClaimedFor, null, now);
  state.moodBoostUntil = timestamp(raw.moodBoostUntil, 0, now + 3 * DAY);
  state.owned = unique(raw.owned).filter((id) => ITEMS.has(id) && ITEMS.get(id).category !== 'treat');
  for (const [slot, id] of Object.entries(record(raw.equipped))) {
    if (state.owned.includes(id) && ITEMS.get(id)?.slot === slot) state.equipped[slot] = id;
  }
  state.badges = unique(raw.badges).filter((id) => ['bookshop-regular'].includes(id));
  state.errandsCompleted = whole(raw.errandsCompleted);
  const savedErrand = record(raw.errand);
  if (Object.hasOwn(ERRANDS, savedErrand.kind)) {
    const startedAt = timestamp(savedErrand.startedAt, -1, now);
    const endsAt = timestamp(savedErrand.endsAt, -1, now + ERRANDS[savedErrand.kind].duration);
    if (startedAt >= 0 && endsAt >= startedAt && endsAt - startedAt <= ERRANDS[savedErrand.kind].duration) {
      state.errand = { kind: savedErrand.kind, startedAt, endsAt };
    }
  }

  const attendance = record(raw.attendance);
  const thisWeek = weekKey(now);
  state.attendance.weeks = unique(attendance.weeks)
    .filter((week) => validDay(week) && week <= thisWeek && weekKey(Date.parse(`${week}T00:00:00Z`)) === week).sort();
  state.attendance.total = state.attendance.weeks.length;
  state.attendance.lastWeek = state.attendance.weeks.at(-1) ?? null;
  // Rebuild the protected chain from the canonical history instead of trusting counters.
  state.attendance.streak = state.attendance.weeks.reduce((count, week, index, weeks) =>
    index === 0 || Date.parse(week) - Date.parse(weeks[index - 1]) === WEEK ? count + 1 : count, 0);
  state.attendance.best = state.attendance.streak;

  const reading = record(raw.reading);
  state.reading.day = validDay(reading.day) ? reading.day : state.reading.day;
  state.reading.week = validDay(reading.week) && weekKey(Date.parse(reading.week)) === reading.week ? reading.week : state.reading.week;
  state.reading.dailyCoins = whole(reading.dailyCoins, 0, 100);
  state.reading.weeklyCoins = whole(reading.weeklyCoins, 0, 300);
  state.reading.chapterIds = unique(reading.chapterIds).filter((id) => typeof id === 'string' && id.length > 0 && id.length <= 200);
  state.lastPetDay = validDay(raw.lastPetDay) ? raw.lastPetDay : null;
  resetReadingWindows(state, now);
  return state;
}

function settleStats(state, now) {
  const elapsed = Math.max(0, now - state.lastUpdated);
  const boosted = Math.max(0, Math.min(now, state.moodBoostUntil) - state.lastUpdated);
  const hungerLoss = Math.min(80, elapsed / DAY * 12);
  const happinessLoss = Math.min(70, (elapsed - boosted * 0.5) / DAY * 10);
  // Values already below 20 are kept stable, never made worse by time away.
  state.hunger = Math.max(Math.min(state.hunger, 20), state.hunger - hungerLoss);
  state.happiness = Math.max(Math.min(state.happiness, 20), state.happiness - happinessLoss);
  state.energy = Math.min(100, state.energy + elapsed / HOUR * 5);
  // A backwards clock must not make the same time period charge twice.
  state.lastUpdated = Math.max(state.lastUpdated, now);
  resetReadingWindows(state, now);
}

function addCoins(state, amount) {
  const awarded = Math.min(amount, MAX_COINS - state.coins);
  state.coins += awarded;
  return awarded;
}

function grantMilestones(state) {
  const rewards = [];
  for (const milestone of MILESTONES) {
    if (state.attendance.total >= milestone.weeks && !state.owned.includes(milestone.itemId)) {
      state.owned.push(milestone.itemId);
      rewards.push({ ...milestone });
    }
  }
  return rewards;
}

/** Missed weeks pause the chain. A return week reconnects it; the next consecutive week grows it. */
export function checkIn(state, now = Date.now()) {
  now = time(now);
  const week = weekKey(now);
  const attendance = state.attendance;
  const isNewWeek = !attendance.weeks.includes(week) && (!attendance.lastWeek || week > attendance.lastWeek);
  if (isNewWeek) {
    const consecutive = attendance.lastWeek && Date.parse(week) - Date.parse(attendance.lastWeek) === WEEK;
    if (!attendance.lastWeek || consecutive) attendance.streak += 1;
    attendance.weeks.push(week);
    attendance.total = attendance.weeks.length;
    attendance.best = Math.max(attendance.best, attendance.streak);
    attendance.lastWeek = week;
  }
  const newMilestones = grantMilestones(state);
  return { isNewWeek, week, streak: attendance.streak, total: attendance.total, newMilestones };
}

export function advanceState(state, now = Date.now()) {
  now = time(now);
  const awayMs = Math.max(0, now - state.lastSeen);
  settleStats(state, now);
  let welcomeBonus = 0;
  if (awayMs > DAY && state.welcomeClaimedFor !== state.lastSeen) {
    welcomeBonus = addCoins(state, 15);
    state.welcomeClaimedFor = state.lastSeen;
  }
  let errandReward = null;
  if (state.errand && now >= state.errand.endsAt) {
    const kind = state.errand.kind;
    const config = ERRANDS[kind];
    state.errand = null; // Clear first: a reward is claimable only once, including after serialization.
    const coins = addCoins(state, config.coins);
    state.errandsCompleted += 1;
    state.bondXp = Math.min(MAX_COINS, state.bondXp + 15);
    let itemId = null;
    let badge = null;
    if (kind === 'bookshop' && !state.owned.includes('manga')) {
      itemId = 'manga';
      state.owned.push(itemId);
    } else if (kind === 'bookshop' && !state.badges.includes('bookshop-regular')) {
      badge = 'bookshop-regular';
      state.badges.push(badge);
    }
    errandReward = { kind, coins, itemId, itemName: ITEMS.get(itemId)?.name ?? null, badge,
      message: `Back from ${kind === 'bookshop' ? 'the bookshop' : 'a little stroll'} with ${coins} coins${itemId ? ' and a manga stack' : badge ? ' and a reader badge' : ''}!` };
  }
  const { newMilestones } = checkIn(state, now);
  return { awayMs, welcomeBonus, errandReward, newMilestones };
}

export function feed(state, kind, now = Date.now()) {
  now = time(now);
  settleStats(state, now);
  const treats = {
    snack: { cost: 8, hunger: 25, happiness: 5, message: 'A little snack, a very happy fox. +25 fullness!' },
    feast: { cost: 30, hunger: 100, happiness: 10, message: 'Full tummy, cozy week. Fullness restored!' },
    matcha: { cost: 24, hunger: 10, happiness: 30, message: 'Matcha mochi! +30 joy and a cozy mood for 3 days.' },
  };
  if (!Object.hasOwn(treats, kind)) return { ok: false, message: 'That treat is not on the menu.' };
  const treat = treats[kind];
  if (state.coins < treat.cost) return { ok: false, message: `Save ${treat.cost - state.coins} more coins for this treat. Pets are always free.` };
  state.coins -= treat.cost;
  state.hunger = Math.min(100, state.hunger + treat.hunger);
  state.happiness = Math.min(100, state.happiness + treat.happiness);
  state.bondXp = Math.min(MAX_COINS, state.bondXp + 5);
  if (kind === 'matcha') state.moodBoostUntil = Math.max(state.moodBoostUntil, now + 3 * DAY);
  return { ok: true, message: treat.message };
}

export function pet(state, now = Date.now()) {
  now = time(now);
  settleStats(state, now);
  state.happiness = Math.min(100, state.happiness + 10);
  state.energy = Math.max(0, state.energy - 2);
  let reward = 0;
  if (state.lastPetDay !== dayKey(now)) {
    state.lastPetDay = dayKey(now);
    reward = addCoins(state, 5);
    state.bondXp = Math.min(MAX_COINS, state.bondXp + 10);
  }
  return { ok: true, reward, message: reward ? 'The best part of the day. +10 joy and 5 coins!' : 'A little love goes a long way. +10 joy!' };
}

export function startErrand(state, kind, now = Date.now()) {
  now = time(now);
  settleStats(state, now);
  if (!Object.hasOwn(ERRANDS, kind)) return { ok: false, message: 'That adventure is not available.' };
  if (state.errand) return { ok: false, message: 'Already out on a little adventure. Check back soon!' };
  const config = ERRANDS[kind];
  if (state.energy < config.energy) return { ok: false, message: `A little rest first. This trip needs ${config.energy} energy.` };
  state.energy -= config.energy;
  state.errand = { kind, startedAt: now, endsAt: now + config.duration };
  return { ok: true, message: `${config.name} started. Back in ${config.duration / HOUR} hours!` };
}

export function buyItem(state, id, now = Date.now()) {
  const item = ITEMS.get(id);
  if (!item) return { ok: false, message: 'That item is not in the shop.' };
  if (item.category === 'treat') return feed(state, id, now);
  settleStats(state, time(now));
  if (item.price === null) return { ok: false, message: 'This keepsake is a weekly attendance reward.' };
  if (state.owned.includes(id)) return { ok: false, message: 'Already in your collection.' };
  if (state.coins < item.price) return { ok: false, message: `${item.price - state.coins} more coins until this little treasure is yours.` };
  state.coins -= item.price;
  state.owned.push(id);
  state.equipped[item.slot] = id;
  return { ok: true, message: `${item.name} added to your room!` };
}

/** Selecting an equipped item again puts it away; decorations have independent slots. */
export function equipItem(state, id) {
  const item = ITEMS.get(id);
  if (!item?.slot || !state.owned.includes(id)) return { ok: false, message: 'Collect this item first.' };
  const removing = state.equipped[item.slot] === id;
  if (removing) delete state.equipped[item.slot];
  else state.equipped[item.slot] = id;
  return { ok: true, message: `${item.name} ${removing ? 'put away' : 'equipped'}.` };
}

/**
 * Client-side UX caps, not a trusted currency ledger. Production chapter completion
 * should be validated by the reader backend before calling this integration hook.
 */
export function rewardCoins(state, amount, reason = 'Reading reward', now = Date.now()) {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || !Number.isSafeInteger(amount) || amount <= 0) {
    return { ok: false, awarded: 0, message: 'Reading rewards need a positive whole number of coins.' };
  }
  now = time(now);
  settleStats(state, now);
  const details = record(reason);
  const hasChapterId = Object.hasOwn(details, 'chapterId');
  if (hasChapterId && (typeof details.chapterId !== 'string' || !details.chapterId.trim() || details.chapterId.trim().length > 200)) {
    return { ok: false, awarded: 0, message: 'A chapter reward needs a valid chapter ID.' };
  }
  const chapterId = hasChapterId ? details.chapterId.trim() : null;
  if (chapterId && state.reading.chapterIds.includes(chapterId)) {
    return { ok: false, awarded: 0, message: 'You and your companion already shared this chapter.' };
  }
  if (chapterId) {
    state.reading.chapterIds.push(chapterId);
    state.bondXp = Math.min(MAX_COINS, state.bondXp + 12);
  }
  const available = Math.max(0, Math.min(100 - state.reading.dailyCoins, 300 - state.reading.weeklyCoins));
  const awarded = addCoins(state, Math.min(amount, available));
  state.reading.dailyCoins += awarded;
  state.reading.weeklyCoins += awarded;
  if (!awarded) return { ok: true, awarded: 0, message: 'All reading coins collected for now. Enjoy the next chapter at your own pace!' };
  const label = typeof reason === 'string' ? reason.slice(0, 160) : typeof details.reason === 'string' ? details.reason.slice(0, 160) : 'Chapter finished';
  return { ok: true, awarded, message: `${label || 'Reading reward'} · +${awarded} coins${awarded < amount ? ' (reading limit reached)' : ''}.` };
}

export function getBond(state) {
  const xp = whole(state.bondXp);
  const completedLevels = Math.floor((-75 + Math.sqrt(5625 + 100 * xp)) / 50);
  const current = xp - (25 * completedLevels ** 2 + 75 * completedLevels);
  const needed = 100 + 50 * completedLevels;
  return { level: completedLevels + 1, current, needed, progress: current / needed * 100 };
}
