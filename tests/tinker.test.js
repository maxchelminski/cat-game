import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, normalizeState } from '../src/engine.js';
import { tinker } from '../src/tinker.js';
import { scene } from '../src/views.js';

test('room and lamp switches survive saving without changing progress', () => {
  const now = Date.now(), state = createState(now);
  state.owned.push('shrine-lantern'); state.equipped.left = 'shrine-lantern';
  const before = { coins: state.coins, xp: state.bondXp, hunger: state.hunger, happiness: state.happiness };
  assert.equal(tinker(state, 'window', 'nook').active, false);
  assert.equal(tinker(state, 'light', 'nook').active, false);
  assert.equal(tinker(state, 'decor', 'shrine-lantern').active, false);
  const loaded = normalizeState(JSON.parse(JSON.stringify(state)), now);
  assert.deepEqual(loaded.roomToggles.nook, { windowOpen: false, lightOn: false });
  assert.equal(loaded.decorToggles['shrine-lantern'], false);
  assert.deepEqual({ coins: loaded.coins, xp: loaded.bondXp, hunger: loaded.hunger, happiness: loaded.happiness }, before);
  assert.equal(tinker(loaded, 'window', 'nook').active, true);
  assert.equal(tinker(loaded, 'decor', 'shrine-lantern').active, true);
});

test('tinkering rejects absent props and room details while ordinary furniture only wiggles', () => {
  const state = createState();
  assert.equal(tinker(state, 'window', 'moon').ok, false);
  assert.equal(tinker(state, 'decor', 'moon-lamp').ok, false);
  assert.equal(tinker(state, 'invalid', 'nook').ok, false);
  const before = JSON.stringify(state);
  assert.equal(tinker(state, 'decor', 'default-mat').shake, true);
  assert.equal(JSON.stringify(state), before);
  state.owned.push('rug'); state.equipped.rug = 'rug';
  assert.equal(tinker(state, 'decor', 'default-mat').ok, false);
  assert.equal(tinker(state, 'decor', 'rug').shake, true);
});

test('room view reflects switch state, replaces the rug, and keeps previews noninteractive', () => {
  const state = createState();
  state.owned.push('rug', 'moon-lamp'); state.equipped.rug = 'rug'; state.equipped.left = 'moon-lamp';
  tinker(state, 'window', 'nook'); tinker(state, 'light', 'nook'); tinker(state, 'decor', 'moon-lamp');
  const markup = scene(state);
  assert.match(markup, /aria-label="Open curtains"/);
  assert.match(markup, /aria-label="Turn on pendant light"/);
  assert.match(markup, /aria-label="Turn on Crescent lamp"/);
  assert.equal((markup.match(/class="world-decor slot-rug"/g) || []).length, 1);
  assert.doesNotMatch(markup, /data-decor="default-mat"/);
  assert.doesNotMatch(scene(state, { preview: true }), /data-action="tinker"/);
  assert.match(markup, /class="fox-button" data-action="pet"/);
  assert.doesNotMatch(markup, /class="fox-button"[^>]*tabindex/);
});
