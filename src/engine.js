/** Dependency-free, forgiving companion engine. All mutations are synchronous. */
import { CATALOG, SETS, ROOMS, PASS_REWARDS, ACHIEVEMENTS } from './catalog.js';
export { CATALOG, SETS, ROOMS, PASS_REWARDS, ACHIEVEMENTS } from './catalog.js';
export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MAX_VALUE = 1_000_000_000;
const PASS_MAX_XP = PASS_REWARDS.at(-1).xpRequired;
// Keep this key: existing readers migrate in place and retain their collection.
export const STORAGE_KEY = 'schale-idle-companion:v1';
export const MILESTONES = Object.freeze([]);
const ITEMS = new Map(CATALOG.map((item) => [item.id, item]));
const DEFAULT_ITEMS = ['room-nook', 'outfit-base'];
const LIGHT_DECOR_IDS = ['shrine-lantern', 'sakura-lantern', 'moon-lamp'];
// The rare pass set and the well-fed bonus can stack to 13%. Preserve a valid
// departure snapshot on reload, even if equipment or fullness has since changed.
const MAX_ERRAND_BONUS = Math.max(...SETS.map((set) => set.bonus)) + 0.05;
const ERRANDS = {
  stroll: { duration: 2 * HOUR, energy: 20, leaves: 20, xp: 15, name: 'Neighborhood stroll' },
  bookshop: { duration: 4 * HOUR, energy: 35, leaves: 35, xp: 15, name: 'Bookshop visit' },
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const whole = (value, fallback = 0, max = MAX_VALUE) => Math.floor(clamp(finite(value, fallback), 0, max));
const record = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const unique = (value) => [...new Set(Array.isArray(value) ? value : [])];

function timestamp(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = typeof value === 'string' ? Date.parse(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= 0 ? Math.floor(Math.min(parsed, max)) : fallback;
}
function time(now) { return timestamp(now, Date.now(), Date.parse('9999-12-24T00:00:00Z')); }
function dayKey(now) { return new Date(now).toISOString().slice(0, 10); }
function weekKey(now) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}
function validDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && dayKey(Date.parse(`${value}T00:00:00Z`)) === value;
}
function validWeek(value) { return validDay(value) && weekKey(Date.parse(value)) === value; }

/** UTC windows advance only forwards; clock corrections cannot refill a budget. */
function resetWindows(state, now) {
  const day = dayKey(now), week = weekKey(now);
  if (day > state.reading.day) { state.reading.day = day; state.reading.dailyCoins = 0; }
  if (week > state.reading.week) { state.reading.week = week; state.reading.weeklyCoins = 0; }
  if (day > state.xpBudget.day) { state.xpBudget.day = day; state.xpBudget.dailyXp = 0; }
  if (week > state.xpBudget.week) { state.xpBudget.week = week; state.xpBudget.weeklyXp = 0; }
  if (day > state.care.day) { state.care.day = day; state.care.feedsToday = 0; }
}

export function createState(now = Date.now()) {
  now = time(now);
  const day = dayKey(now), week = weekKey(now);
  return {
    version: 2, hunger: 100, happiness: 90, energy: 100, coins: 60, bondXp: 0,
    lastUpdated: now, lastSeen: now, createdAt: now, welcomeClaimedFor: null,
    owned: [...DEFAULT_ITEMS], equipped: { room: 'room-nook', outfit: 'outfit-base' },
    roomToggles: {}, decorToggles: {},
    badges: [], moodBoostUntil: 0, errand: null, errandsCompleted: 0,
    attendance: { weeks: [], rewardedWeeks: [], streak: 0, best: 0, total: 0, lastWeek: null },
    reading: { day, week, dailyCoins: 0, weeklyCoins: 0, bonusRemainder: 0, chapterIds: [] },
    xpBudget: { day, week, dailyXp: 0, weeklyXp: 0 },
    care: { day, feedsToday: 0, qualifiedPets: 0, lastQualifiedPetAt: null },
    pass: { claimed: [], roles: [], entitlements: [] },
    achievements: { claimed: [], completedSets: [] },
    lastPetDay: null,
  };
}

function collectedSets(state) {
  return SETS.filter((set) => set.itemIds.every((id) => state.owned.includes(id))).map((set) => set.id);
}
function updateCollections(state) { state.achievements.completedSets = collectedSets(state); }

/** Corrupt fields are repaired independently. v1 owned items and XP are retained. */
export function normalizeState(raw, now = Date.now()) {
  now = time(now); raw = record(raw);
  const state = createState(now);
  for (const key of ['hunger', 'happiness', 'energy']) state[key] = clamp(finite(raw[key], state[key]), 0, 100);
  state.coins = whole(raw.coins, state.coins);
  state.bondXp = whole(raw.bondXp, 0, PASS_MAX_XP);
  state.lastUpdated = timestamp(raw.lastUpdated, now, now);
  state.lastSeen = timestamp(raw.lastSeen, state.lastUpdated, now);
  state.createdAt = timestamp(raw.createdAt, Math.min(state.lastSeen, state.lastUpdated), now);
  state.welcomeClaimedFor = raw.welcomeClaimedFor == null ? null : timestamp(raw.welcomeClaimedFor, null, now);
  state.moodBoostUntil = timestamp(raw.moodBoostUntil, 0, now + 3 * DAY);
  state.owned = unique([...DEFAULT_ITEMS, ...unique(raw.owned)]).filter((id) => ITEMS.has(id) && ITEMS.get(id).category !== 'treat');
  // v1 had a slot for every decoration. Migrate by item's current canonical slot.
  for (const [oldSlot, id] of Object.entries(record(raw.equipped))) {
    const item = ITEMS.get(id);
    const earlyBookmarkSlot = id === 'bookmark' && oldSlot === 'back';
    if (item?.slot && state.owned.includes(id) && (raw.version !== 2 || oldSlot === item.slot || earlyBookmarkSlot)) state.equipped[item.slot] = id;
  }
  // Untouched windows and lights default to open/on in the room renderer. Keep
  // only explicit booleans so older saves and malformed entries share that default.
  const roomToggles = record(raw.roomToggles), decorToggles = record(raw.decorToggles);
  for (const room of ROOMS) {
    const saved = record(roomToggles[room.id]), toggles = {};
    for (const key of ['windowOpen', 'lightOn']) if (typeof saved[key] === 'boolean') toggles[key] = saved[key];
    if (Object.keys(toggles).length) state.roomToggles[room.id] = toggles;
  }
  for (const id of LIGHT_DECOR_IDS) if (typeof decorToggles[id] === 'boolean') state.decorToggles[id] = decorToggles[id];
  const validBadges = new Set(['bookshop-regular', ...PASS_REWARDS.filter((reward) => reward.badge).map((reward) => reward.badge.id)]);
  state.badges = unique(raw.badges).filter((id) => validBadges.has(id));
  state.errandsCompleted = whole(raw.errandsCompleted);

  const attendance = record(raw.attendance), thisWeek = weekKey(now);
  state.attendance.weeks = unique(attendance.weeks).filter((week) => validWeek(week) && week <= thisWeek).sort();
  state.attendance.total = state.attendance.weeks.length;
  state.attendance.lastWeek = state.attendance.weeks.at(-1) ?? null;
  state.attendance.streak = state.attendance.weeks.reduce((count, week, index, weeks) =>
    index === 0 || Date.parse(week) - Date.parse(weeks[index - 1]) === WEEK ? count + 1 : count, 0);
  state.attendance.best = state.attendance.streak;
  // Visited history is the canonical claim ledger, including migrated v1 visits.
  // Missing claim arrays must never replay old weekly payouts.
  state.attendance.rewardedWeeks = [...state.attendance.weeks];

  const reading = record(raw.reading);
  state.reading.day = validDay(reading.day) ? reading.day : state.reading.day;
  state.reading.week = validWeek(reading.week) ? reading.week : state.reading.week;
  state.reading.dailyCoins = whole(reading.dailyCoins, 0, 100);
  state.reading.weeklyCoins = Math.max(state.reading.dailyCoins, whole(reading.weeklyCoins, 0, 300));
  state.reading.bonusRemainder = typeof reading.bonusRemainder === 'number' && Number.isFinite(reading.bonusRemainder)
    && reading.bonusRemainder >= 0 && reading.bonusRemainder < 1 ? reading.bonusRemainder : 0;
  state.reading.chapterIds = unique(unique(reading.chapterIds).filter((id) => typeof id === 'string' && id.trim() && id.trim().length <= 200).map((id) => id.trim()));
  state.lastPetDay = validDay(raw.lastPetDay) ? raw.lastPetDay : null;

  const budget = record(raw.xpBudget);
  state.xpBudget.day = validDay(budget.day) ? budget.day : dayKey(state.lastUpdated);
  state.xpBudget.week = validWeek(budget.week) ? budget.week : weekKey(state.lastUpdated);
  state.xpBudget.dailyXp = whole(budget.dailyXp, Math.min(100, state.bondXp), 100);
  state.xpBudget.weeklyXp = Math.max(state.xpBudget.dailyXp, whole(budget.weeklyXp, Math.min(700, state.bondXp), 700));
  const care = record(raw.care);
  state.care.day = validDay(care.day) ? care.day : dayKey(state.lastUpdated);
  state.care.feedsToday = whole(care.feedsToday, 0, 3);
  state.care.qualifiedPets = whole(care.qualifiedPets);
  state.care.lastQualifiedPetAt = care.lastQualifiedPetAt == null ? null : timestamp(care.lastQualifiedPetAt, null, now);

  const pass = record(raw.pass);
  state.pass.claimed = unique(pass.claimed).filter((level) => Number.isInteger(level) && level >= 1 && level <= 50 && state.bondXp >= PASS_REWARDS[level - 1].xpRequired).sort((a, b) => a - b);
  // Rebuild metadata from claims; claiming never makes an external role assignment.
  for (const level of state.pass.claimed) {
    const reward = PASS_REWARDS[level - 1];
    if (reward.role) state.pass.roles.push(reward.role.id);
    if (reward.entitlement) state.pass.entitlements.push({ ...reward.entitlement });
    for (const id of reward.itemIds) if (!state.owned.includes(id)) state.owned.push(id);
    if (reward.badge && !state.badges.includes(reward.badge.id)) state.badges.push(reward.badge.id);
  }
  state.achievements.claimed = unique(record(raw.achievements).claimed).filter((id) => ACHIEVEMENTS.some((entry) => entry.id === id));
  updateCollections(state);

  const savedErrand = record(raw.errand);
  if (Object.hasOwn(ERRANDS, savedErrand.kind)) {
    const config = ERRANDS[savedErrand.kind];
    const startedAt = timestamp(savedErrand.startedAt, -1, now);
    const endsAt = timestamp(savedErrand.endsAt, -1, now + config.duration);
    if (startedAt >= 0 && endsAt > startedAt && endsAt - startedAt === config.duration) {
      const savedReward = record(savedErrand.reward);
      const bonus = clamp(finite(savedReward.bonus, 0), 0, MAX_ERRAND_BONUS);
      state.errand = { kind: savedErrand.kind, startedAt, endsAt, reward: {
        leaves: raw.version === 2 ? whole(savedReward.leaves, config.leaves, Math.floor(config.leaves * (1 + MAX_ERRAND_BONUS) + 1e-9)) : config.leaves,
        xp: whole(savedReward.xp, config.xp, config.xp), bonus,
        setId: SETS.some((set) => set.id === savedReward.setId) ? savedReward.setId : null,
      } };
    }
  }
  resetWindows(state, now);
  return state;
}

function settleStats(state, now) {
  const elapsed = Math.max(0, now - state.lastUpdated);
  const boosted = Math.max(0, Math.min(now, state.moodBoostUntil) - state.lastUpdated);
  state.hunger = Math.max(Math.min(state.hunger, 20), state.hunger - Math.min(80, elapsed / DAY * 12));
  state.happiness = Math.max(Math.min(state.happiness, 20), state.happiness - Math.min(70, (elapsed - boosted * 0.5) / DAY * 10));
  state.energy = Math.min(100, state.energy + elapsed / HOUR * 5);
  state.lastUpdated = Math.max(state.lastUpdated, now);
  resetWindows(state, now);
}
function addLeaves(state, amount) {
  const awarded = Math.max(0, Math.min(Math.floor(amount), MAX_VALUE - state.coins));
  state.coins += awarded;
  return awarded;
}
/** Every XP source uses this one hard budget; excess is discarded, never banked. */
function grantXp(state, amount, now) {
  resetWindows(state, now);
  const awarded = Math.max(0, Math.min(Math.floor(amount), 100 - state.xpBudget.dailyXp,
    700 - state.xpBudget.weeklyXp, PASS_MAX_XP - state.bondXp));
  state.bondXp += awarded; state.xpBudget.dailyXp += awarded; state.xpBudget.weeklyXp += awarded;
  return awarded;
}

export function getActiveSet(state) {
  return SETS.find((set) => set.itemIds.every((id) => state.owned.includes(id) && state.equipped[ITEMS.get(id).slot] === id)) ?? null;
}
export function getCareBonus(state) {
  const wellFed = state.hunger >= 70, happy = state.happiness >= 70;
  return { wellFed, happy, adventureLeaves: wellFed ? 0.05 : 0, chapterXp: happy ? 0.05 : 0 };
}

/** Quiet weeks pause the chain; only one payout is possible per UTC week. */
export function checkIn(state, now = Date.now()) {
  now = time(now);
  const week = weekKey(now), attendance = state.attendance;
  const isNewWeek = !attendance.weeks.includes(week) && (!attendance.lastWeek || week > attendance.lastWeek);
  let newWeeklyReward = null;
  if (isNewWeek) {
    const consecutive = attendance.lastWeek && Date.parse(week) - Date.parse(attendance.lastWeek) === WEEK;
    if (!attendance.lastWeek || consecutive) attendance.streak += 1;
    attendance.weeks.push(week); attendance.rewardedWeeks.push(week);
    attendance.total = attendance.weeks.length;
    attendance.best = Math.max(attendance.best, attendance.streak); attendance.lastWeek = week;
    const leaves = addLeaves(state, 20 + 5 * (Math.min(5, Math.max(1, attendance.streak)) - 1));
    newWeeklyReward = { week, streak: attendance.streak, leaves, coins: leaves, message: `A little weekly gift: ${leaves} leaves. Lovely to see you!` };
  }
  return { isNewWeek, week, streak: attendance.streak, total: attendance.total, newMilestones: [], newWeeklyReward };
}

export function getErrandPreview(state, now = Date.now()) {
  if (!state.errand) return null;
  now = time(now);
  const { kind, startedAt, endsAt, reward } = state.errand;
  const durationMs = endsAt - startedAt, elapsedMs = clamp(now - startedAt, 0, durationMs);
  const fraction = Math.min(1, Math.floor(elapsedMs / durationMs * 4) / 4);
  const leaves = Math.floor(reward.leaves * fraction);
  // Preview the amount claimable now, including a budget reset that has not yet
  // been settled by a store transaction. Never advertise EXP that will be lost.
  const dailyXp = dayKey(now) > state.xpBudget.day ? 0 : state.xpBudget.dailyXp;
  const weeklyXp = weekKey(now) > state.xpBudget.week ? 0 : state.xpBudget.weeklyXp;
  const xp = Math.max(0, Math.min(Math.floor(reward.xp * fraction), 100 - dailyXp, 700 - weeklyXp, PASS_MAX_XP - state.bondXp));
  return { kind, name: ERRANDS[kind].name, elapsedMs, durationMs, remainingMs: Math.max(0, endsAt - now),
    progress: elapsedMs / durationMs * 100, fraction, percent: fraction * 100,
    leaves, coins: leaves, xp, full: fraction === 1, ready: fraction === 1,
    bonus: reward.bonus, setId: reward.setId };
}
function finishErrand(state, now) {
  const preview = getErrandPreview(state, now);
  if (!preview) return null;
  state.errand = null;
  const leaves = addLeaves(state, preview.leaves), xp = grantXp(state, preview.xp, now);
  let itemId = null, badge = null;
  if (preview.full) {
    state.errandsCompleted += 1;
    if (preview.kind === 'bookshop' && !state.owned.includes('manga')) { itemId = 'manga'; state.owned.push(itemId); }
    else if (preview.kind === 'bookshop' && !state.badges.includes('bookshop-regular')) { badge = 'bookshop-regular'; state.badges.push(badge); }
  }
  const message = preview.full ? `Home with ${leaves} leaves${itemId ? ' and a manga stack' : badge ? ' and a reader badge' : ''}!`
    : `Home early, happy to see you. ${leaves ? `${leaves} leaves gathered along the way.` : 'There is always another day for exploring.'}`;
  return { kind: preview.kind, coins: leaves, leaves, xp, fraction: preview.fraction, percent: preview.percent,
    full: preview.full, itemId, itemName: ITEMS.get(itemId)?.name ?? null, badge, message };
}

export function advanceState(state, now = Date.now()) {
  now = time(now);
  const awayMs = Math.max(0, now - state.lastSeen);
  settleStats(state, now);
  let welcomeBonus = 0;
  if (awayMs > DAY && state.welcomeClaimedFor !== state.lastSeen) {
    welcomeBonus = addLeaves(state, 15); state.welcomeClaimedFor = state.lastSeen;
  }
  const errandReward = state.errand && now >= state.errand.endsAt ? finishErrand(state, now) : null;
  const { newWeeklyReward } = checkIn(state, now);
  return { awayMs, welcomeBonus, errandReward, newMilestones: [], newWeeklyReward };
}
export function recallErrand(state, now = Date.now()) {
  now = time(now); settleStats(state, now);
  const reward = finishErrand(state, now);
  return reward ? { ok: true, ...reward, reward } : { ok: false, message: 'Your companion is already home.' };
}

export function feed(state, kind, now = Date.now()) {
  now = time(now); settleStats(state, now);
  const treats = {
    snack: { cost: 8, hunger: 25, happiness: 5, message: 'A little snack, a very happy fox. +25 fullness!' },
    feast: { cost: 30, hunger: 100, happiness: 10, message: 'Full tummy, cozy week. Fullness restored!' },
    matcha: { cost: 24, hunger: 10, happiness: 30, message: 'Matcha mochi! +30 happiness and a cozy mood for 3 days.' },
  };
  if (!Object.hasOwn(treats, kind)) return { ok: false, message: 'That treat is not on the menu.' };
  const treat = treats[kind];
  if (state.coins < treat.cost) return { ok: false, message: `Save ${treat.cost - state.coins} more leaves for this treat. Headpats are always free.` };
  state.coins -= treat.cost; state.hunger = Math.min(100, state.hunger + treat.hunger); state.happiness = Math.min(100, state.happiness + treat.happiness);
  const xp = state.care.feedsToday < 3 ? grantXp(state, 5, now) : 0;
  state.care.feedsToday = Math.min(3, state.care.feedsToday + 1);
  if (kind === 'matcha') state.moodBoostUntil = Math.max(state.moodBoostUntil, now + 3 * DAY);
  return { ok: true, xp, message: treat.message };
}

export function pet(state, now = Date.now()) {
  now = time(now); settleStats(state, now);
  state.happiness = Math.min(100, state.happiness + 10); state.energy = Math.max(0, state.energy - 2);
  const qualified = state.care.lastQualifiedPetAt === null || now - state.care.lastQualifiedPetAt >= 60_000;
  if (qualified) { state.care.qualifiedPets += 1; state.care.lastQualifiedPetAt = now; }
  let reward = 0, xp = 0;
  if (!state.lastPetDay || dayKey(now) > state.lastPetDay) {
    state.lastPetDay = dayKey(now); reward = addLeaves(state, 5); xp = grantXp(state, 10, now);
  }
  return { ok: true, reward, leaves: reward, xp, qualified,
    message: reward ? 'The best part of the day. +10 happiness and 5 leaves!' : 'A little love goes a long way. +10 happiness!' };
}

export function startErrand(state, kind, now = Date.now()) {
  now = time(now); settleStats(state, now);
  if (!Object.hasOwn(ERRANDS, kind)) return { ok: false, message: 'That adventure is not available.' };
  if (state.errand) return { ok: false, message: 'Already out on a little adventure. You can call her home whenever you like.' };
  const config = ERRANDS[kind];
  if (state.energy < config.energy) return { ok: false, message: `A little rest first. This trip needs ${config.energy} energy.` };
  const set = getActiveSet(state), bonus = (set?.bonus ?? 0) + getCareBonus(state).adventureLeaves;
  state.energy -= config.energy;
  state.errand = { kind, startedAt: now, endsAt: now + config.duration,
    reward: { leaves: Math.floor(config.leaves * (1 + bonus) + 1e-9), xp: config.xp, bonus, setId: set?.id ?? null } };
  return { ok: true, message: `${config.name} started. Back in ${config.duration / HOUR} hours!` };
}

export function buyItem(state, id, now = Date.now()) {
  const item = ITEMS.get(id);
  if (!item) return { ok: false, message: 'That item is not in the shop.' };
  if (item.category === 'treat') return feed(state, id, now);
  settleStats(state, time(now));
  if (item.price === null) return { ok: false, message: 'This keepsake comes from your permanent companion pass.' };
  if (state.owned.includes(id)) return { ok: false, message: 'Already in your collection.' };
  if (state.coins < item.price) return { ok: false, message: `${item.price - state.coins} more leaves until this little treasure is yours.` };
  state.coins -= item.price; state.owned.push(id); state.equipped[item.slot] = id; updateCollections(state);
  return { ok: true, message: `${item.name} added to your room!` };
}
export function equipItem(state, id) {
  const item = ITEMS.get(id);
  if (!item?.slot || !state.owned.includes(id)) return { ok: false, message: 'Collect this item first.' };
  const removing = state.equipped[item.slot] === id && !['room', 'outfit'].includes(item.slot);
  if (removing) delete state.equipped[item.slot]; else state.equipped[item.slot] = id;
  updateCollections(state);
  return { ok: true, message: `${item.name} ${removing ? 'put away' : 'equipped'}.` };
}

/** Browser caps support cozy pacing; production completion is verified by the reader backend. */
export function rewardCoins(state, amount, reason = 'Reading reward', now = Date.now()) {
  if (typeof amount !== 'number' || !Number.isSafeInteger(amount) || amount <= 0) return { ok: false, awarded: 0, xp: 0, message: 'Reading rewards need a positive whole number of leaves.' };
  now = time(now); settleStats(state, now);
  const details = record(reason), hasChapterId = Object.hasOwn(details, 'chapterId');
  if (hasChapterId && (typeof details.chapterId !== 'string' || !details.chapterId.trim() || details.chapterId.trim().length > 200)) return { ok: false, awarded: 0, xp: 0, message: 'A chapter reward needs a valid chapter ID.' };
  const chapterId = hasChapterId ? details.chapterId.trim() : null;
  if (chapterId && state.reading.chapterIds.includes(chapterId)) return { ok: false, awarded: 0, xp: 0, message: 'You and your companion already shared this chapter.' };
  let xp = 0;
  if (chapterId) { state.reading.chapterIds.push(chapterId); xp = grantXp(state, Math.round(12 * (1 + getCareBonus(state).chapterXp)), now); }
  const available = Math.max(0, Math.min(100 - state.reading.dailyCoins, 300 - state.reading.weeklyCoins, MAX_VALUE - state.coins));
  const eligibleBase = Math.min(amount, available);
  const rate = getActiveSet(state)?.bonus ?? 0;
  let extra = 0;
  if (eligibleBase > 0 && rate > 0) {
    // Small chapter payouts still earn a real percentage bonus. Accrue only on
    // base leaves that fit the allowance; never bank a capped request's excess.
    const pool = Number((state.reading.bonusRemainder + eligibleBase * rate).toFixed(10));
    extra = Math.floor(pool);
    state.reading.bonusRemainder = Number((pool - extra).toFixed(10));
  }
  // Any whole bonus that does not fit the current allowance is discarded. Only
  // a fractional remainder survives; duplicate or fully capped reads add none.
  const awarded = addLeaves(state, Math.min(eligibleBase + extra, available));
  state.reading.dailyCoins += awarded; state.reading.weeklyCoins += awarded;
  if (!awarded) return { ok: true, awarded: 0, xp, message: 'Another story shared. Enjoy the next chapter at your own pace!' };
  const label = typeof reason === 'string' ? reason.slice(0, 160) : typeof details.reason === 'string' ? details.reason.slice(0, 160) : 'Chapter finished';
  return { ok: true, awarded, xp, message: `${label || 'Reading reward'} · +${awarded} leaves.` };
}

export function getPass(state) {
  const xp = whole(state.bondXp, 0, PASS_MAX_XP);
  const level = PASS_REWARDS.filter((reward) => xp >= reward.xpRequired).length;
  const previous = level ? PASS_REWARDS[level - 1].xpRequired : 0, next = PASS_REWARDS[level];
  const current = next ? xp - previous : 0, needed = next ? next.xpRequired - previous : 0;
  const claimed = [...state.pass.claimed];
  return { level, xp, totalXp: PASS_MAX_XP, current, needed, progress: next ? current / needed * 100 : 100,
    completionProgress: xp / PASS_MAX_XP * 100, nextLevel: next?.level ?? null, complete: !next,
    claimed, claimable: PASS_REWARDS.filter((reward) => reward.level <= level && !claimed.includes(reward.level)).map((reward) => reward.level),
    rewards: PASS_REWARDS.map((reward) => ({ ...reward, unlocked: reward.level <= level, claimed: claimed.includes(reward.level) })) };
}
export function getBond(state) {
  const pass = getPass(state);
  return { level: Math.min(50, pass.level + 1), current: pass.current, needed: pass.needed, progress: pass.progress };
}
export function claimPassReward(state, level, now = Date.now()) {
  settleStats(state, time(now));
  if (!Number.isInteger(level) || level < 1 || level > 50) return { ok: false, message: 'That pass chapter is not available.' };
  const reward = PASS_REWARDS[level - 1];
  if (state.pass.claimed.includes(level)) return { ok: false, message: 'This little gift is already yours.' };
  if (state.bondXp < reward.xpRequired) return { ok: false, message: 'This chapter of your story is still ahead. There is no rush.' };
  state.pass.claimed.push(level); state.pass.claimed.sort((a, b) => a - b);
  const leaves = addLeaves(state, reward.leaves);
  for (const id of reward.itemIds) if (!state.owned.includes(id)) state.owned.push(id);
  if (reward.badge && !state.badges.includes(reward.badge.id)) state.badges.push(reward.badge.id);
  if (reward.role && !state.pass.roles.includes(reward.role.id)) state.pass.roles.push(reward.role.id);
  if (reward.entitlement && !state.pass.entitlements.some((entry) => entry.id === reward.entitlement.id)) state.pass.entitlements.push({ ...reward.entitlement });
  updateCollections(state);
  return { ok: true, leaves, coins: leaves, reward, message: level === 50 ? 'The long story. Your special surprise is reserved; its details are still to come.' : `${reward.name} claimed. Another little memory to keep.` };
}
export function getAchievementProgress(state, id) {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === id);
  if (!achievement) return null;
  const metrics = { chapters: state.reading.chapterIds.length, pets: state.care.qualifiedPets,
    errands: state.errandsCompleted, sets: SETS.filter((set) => set.source === 'shop' && set.itemIds.every((itemId) => state.owned.includes(itemId))).length };
  const current = metrics[achievement.metric];
  return { current, target: achievement.target, progress: Math.min(100, current / achievement.target * 100),
    complete: current >= achievement.target, claimed: state.achievements.claimed.includes(id) };
}
export function claimAchievement(state, id, now = Date.now()) {
  settleStats(state, time(now));
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === id), progress = getAchievementProgress(state, id);
  if (!achievement) return { ok: false, message: 'That memory is not available.' };
  if (progress.claimed) return { ok: false, message: 'You already collected this little thank-you.' };
  if (!progress.complete) return { ok: false, message: 'There are more lovely moments ahead. Take your time.' };
  state.achievements.claimed.push(id);
  const leaves = addLeaves(state, achievement.leaves);
  return { ok: true, leaves, coins: leaves, achievement, message: `${achievement.name} · ${leaves} leaves to celebrate!` };
}
