import { CATALOG, ROOMS } from './catalog.js';
import { ROOM_INTERACTIONS } from './room-art.js';
import { LIGHT_DECOR_IDS } from './item-art.js';

/** Only the current room and its equipped furniture can be tinkered with. */
export function tinker(state, kind, id) {
  if (kind === 'decor') {
    const item = CATALOG.find(item => item.id === id && item.category === 'decor');
    const equipped = item && state.equipped[item.slot] === id;
    const defaultMat = id === 'default-mat' && !state.equipped.rug;
    if (!equipped && !defaultMat) return { ok: false, message: 'Bring that little joy into your room first.' };
    if (!LIGHT_DECOR_IDS.includes(id)) return { ok: true, shake: true, message: '' };
    state.decorToggles ||= {};
    state.decorToggles[id] = state.decorToggles[id] === false;
    return { ok: true, message: '', active: state.decorToggles[id] };
  }
  const room = ROOMS.find(room => room.itemId === state.equipped.room || room.id === state.equipped.room) || ROOMS[0];
  if (id !== room.id || !ROOM_INTERACTIONS[room.id]?.some(entry => entry.action === kind)) {
    return { ok: false, message: 'That little detail belongs to another room.' };
  }
  const key = kind === 'window' ? 'windowOpen' : 'lightOn';
  state.roomToggles ||= {};
  state.roomToggles[id] ||= {};
  state.roomToggles[id][key] = state.roomToggles[id][key] === false;
  return { ok: true, message: '', active: state.roomToggles[id][key] };
}
