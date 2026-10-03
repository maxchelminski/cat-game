/** Presentation-friendly content data. The state engine supplies all reward rules. */
export const ROOMS = Object.freeze([
  { id: 'nook', itemId: 'room-nook', name: 'Reading nook', description: 'The familiar little corner where your story begins.', setId: null, source: 'default' },
  { id: 'shrine', itemId: 'room-shrine', name: 'Quiet shrine', description: 'Warm lanterns and a peaceful woodland shrine.', setId: 'shrine', source: 'shop' },
  { id: 'tearoom', itemId: 'room-tearoom', name: 'Afternoon tea', description: 'A cup of tea and nowhere else to be.', setId: 'tearoom', source: 'shop' },
  { id: 'sakura', itemId: 'room-sakura', name: 'Sakura garden', description: 'A soft breeze, falling petals, and another chapter.', setId: 'sakura', source: 'shop' },
  { id: 'moon', itemId: 'room-moon', name: 'Moonlit library', description: 'A special place for a long story together.', setId: 'moon', source: 'pass' },
]);

const item = (id, name, description, category, price, slot, extra = {}) => ({
  id, name, description, category, price, slot, source: price === null ? 'pass' : 'shop', ...extra,
});
export const CATALOG = Object.freeze([
  ...ROOMS.map((room) => item(room.itemId, room.name, room.description, 'room',
    room.id === 'nook' ? 0 : room.id === 'moon' ? null : 100, 'room', { setId: room.setId, source: room.source, roomId: room.id })),
  item('outfit-base', 'Everyday cardigan', 'Olive knitwear, a burgundy skirt, and a favorite story.', 'outfit', 0, 'outfit', { source: 'default' }),
  item('outfit-miko', 'Shrine day', 'A red-and-white outfit for quiet afternoons.', 'outfit', 90, 'outfit'),
  item('outfit-school', 'After-school reader', 'The school day is done. One more chapter?', 'outfit', 85, 'outfit'),
  item('outfit-yukata', 'Festival evening', 'A soft yukata for lantern-lit strolls.', 'outfit', 100, 'outfit'),
  item('outfit-garden', 'Garden companion', 'A little sunshine for a slow afternoon.', 'outfit', 90, 'outfit'),
  item('outfit-moon', 'Moonwoven story', 'A keepsake outfit from your permanent companion pass.', 'outfit', null, 'outfit'),
  item('rug', 'Sundown rug', 'A soft landing for little paws.', 'decor', 45, 'rug'),
  item('bookshelf', 'Little library', 'Every favorite story, within reach.', 'decor', 80, 'left'),
  item('kotatsu', 'Cozy kotatsu', 'The perfect place for one more chapter.', 'decor', 120, 'right'),
  item('manga', 'Manga stack', 'A tiny, delightfully ambitious reading list.', 'decor', 35, 'right'),
  item('plant', 'Little sprout', 'Good things grow at their own pace.', 'decor', 55, 'left'),
  item('bookmark', 'Moonlit bookmark', 'A special place to keep your story.', 'decor', null, 'right'),
  item('glasses', 'Round glasses', 'For very serious manga research.', 'wearable', 50, 'accessory'),
  item('headband', 'Sakura headband', 'A little springtime, all year round.', 'wearable', 40, 'accessory'),
  item('mask', 'Festival mask', 'A keepsake from a lantern-lit evening.', 'wearable', 75, 'accessory'),
  item('ribbon', 'Companion ribbon', 'A little thank-you from your companion pass.', 'wearable', null, 'accessory'),
  item('matcha', 'Matcha mochi', '+30 happiness, +10 fullness, and slower happiness decay for 3 days.', 'treat', 24, null),
  item('shrine-mat', 'Shrine woven mat', 'A little place to pause.', 'decor', 45, 'rug', { setId: 'shrine' }),
  item('shrine-lantern', 'Forest lantern', 'A warm light along the woodland path.', 'decor', 65, 'left', { setId: 'shrine' }),
  item('shrine-offering', 'Seasonal offering', 'A carefully arranged little kindness.', 'decor', 55, 'right', { setId: 'shrine' }),
  item('tea-mat', 'Tea-house tatami', 'Soft straw under a cozy afternoon.', 'decor', 45, 'rug', { setId: 'tearoom' }),
  item('tea-table', 'Tea for two', 'An extra cup is always waiting.', 'decor', 65, 'right', { setId: 'tearoom' }),
  item('tea-bonsai', 'Patient bonsai', 'Growing a little, day by day.', 'decor', 55, 'left', { setId: 'tearoom' }),
  item('sakura-mat', 'Petal picnic mat', 'Spread out a blanket and a new story.', 'decor', 45, 'rug', { setId: 'sakura' }),
  item('sakura-lantern', 'Petal lantern', 'A little glow beneath the blossoms.', 'decor', 55, 'left', { setId: 'sakura' }),
  item('sakura-bench', 'Garden reading bench', 'There is room here for another reader.', 'decor', 65, 'right', { setId: 'sakura' }),
  item('moon-mat', 'Stardust rug', 'A quiet patch of midnight blue.', 'decor', null, 'rug', { setId: 'moon' }),
  item('moon-lamp', 'Crescent lamp', 'Moonlight for the page you cannot put down.', 'decor', null, 'left', { setId: 'moon' }),
  item('moon-books', 'Midnight collection', 'Stories gathered over a long friendship.', 'decor', null, 'right', { setId: 'moon' }),
]);

export const SETS = Object.freeze([
  { id: 'shrine', name: 'Shrine sanctuary', roomId: 'shrine', itemIds: ['room-shrine', 'shrine-mat', 'shrine-lantern', 'shrine-offering'], bonus: 0.05, source: 'shop' },
  { id: 'tearoom', name: 'Tea for two', roomId: 'tearoom', itemIds: ['room-tearoom', 'tea-mat', 'tea-table', 'tea-bonsai'], bonus: 0.05, source: 'shop' },
  { id: 'sakura', name: 'Under the blossoms', roomId: 'sakura', itemIds: ['room-sakura', 'sakura-mat', 'sakura-lantern', 'sakura-bench'], bonus: 0.05, source: 'shop' },
  { id: 'moon', name: 'A moonlit story', roomId: 'moon', itemIds: ['room-moon', 'moon-mat', 'moon-lamp', 'moon-books'], bonus: 0.03, source: 'pass' },
]);

// 10 gentle opening tiers total 1,000 XP. The next 40 cost 235, 245, ... 625:
// 17,200 more XP, exactly 18,200 overall. At 100 XP/day this takes 182 earning
// days (at least ~181 elapsed days even with a first visit just before midnight).
const earlyCosts = [50, 60, 70, 80, 90, 100, 110, 120, 140, 180];
const badgeNames = ['A familiar face', 'Between chapters', 'A cozy routine', 'Stories to share', 'A little closer', 'A place to belong', 'Through the seasons', 'A cherished corner', 'So many memories', 'The long story'];
const passItems = { 2: ['ribbon'], 7: ['bookmark'], 30: ['room-moon'], 35: ['moon-mat'], 40: ['moon-lamp'], 45: ['moon-books'], 48: ['outfit-moon'] };
let cumulativeXp = 0;
export const PASS_REWARDS = Object.freeze(Array.from({ length: 50 }, (_, index) => {
  const level = index + 1;
  cumulativeXp += level <= 10 ? earlyCosts[index] : 235 + (level - 11) * 10;
  const badge = level % 5 === 0 ? { id: `pass-badge-${level}`, name: badgeNames[level / 5 - 1] } : null;
  const role = level % 10 === 0 ? { id: `companion-role-${level}`, name: badgeNames[level / 5 - 1], status: 'eligible' } : null;
  const itemIds = passItems[level] ?? [];
  const entitlement = level === 50 ? { id: 'six-month-surprise', status: 'reserved' } : null;
  const name = level === 50 ? 'The long story' : itemIds.length ? CATALOG.find((entry) => entry.id === itemIds[0]).name : badge?.name ?? 'A handful of leaves';
  return { level, xpRequired: cumulativeXp, name, title: name, leaves: level === 50 ? 0 : itemIds.length ? 0 : badge ? 50 : 25, itemIds, badge, role, entitlement };
}));

export const ACHIEVEMENTS = Object.freeze([
  { id: 'chapters-1', name: 'The first page', description: 'Share your first chapter.', metric: 'chapters', target: 1, leaves: 15 },
  { id: 'chapters-10', name: 'Just one more', description: 'Share 10 different chapters.', metric: 'chapters', target: 10, leaves: 30 },
  { id: 'chapters-50', name: 'Favorite stories', description: 'Share 50 different chapters.', metric: 'chapters', target: 50, leaves: 60 },
  { id: 'chapters-100', name: 'A well-loved library', description: 'Share 100 different chapters.', metric: 'chapters', target: 100, leaves: 100 },
  { id: 'pets-5', name: 'A little affection', description: 'Share 5 headpats, at least a minute apart.', metric: 'pets', target: 5, leaves: 15 },
  { id: 'pets-25', name: 'Right here with you', description: 'Share 25 headpats, at least a minute apart.', metric: 'pets', target: 25, leaves: 40 },
  { id: 'errands-1', name: 'A small adventure', description: 'Welcome your companion home from a full adventure.', metric: 'errands', target: 1, leaves: 20 },
  { id: 'errands-10', name: 'Places to remember', description: 'Complete 10 full adventures.', metric: 'errands', target: 10, leaves: 65 },
  { id: 'set-first', name: 'A place of your own', description: 'Collect every piece of one shop room set.', metric: 'sets', target: 1, leaves: 40 },
  { id: 'set-three', name: 'Every cozy corner', description: 'Collect all three shop room sets.', metric: 'sets', target: 3, leaves: 100 },
]);
