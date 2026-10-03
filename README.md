# Schale Scans · Idle Companion v2

A cozy fox companion for readers who stop by once or twice a week. Share chapters, gather **leaves**, decorate a favorite room, and collect a permanent 50-tier bond pass. Quiet weeks never take away the companion, earned EXP, or collected items.

The module is a dependency-free **Vanilla JavaScript Web Component**. It uses HTML5 dialogs, a canvas sprite compositor, and CSS isolated in a **Shadow DOM**. No package installation or build step is needed. The included pages are working integration previews; the live [Schale Scans website](https://www.schalescans.com/) has not been changed. Its source repository was not available, so verified chapter completion and account services still need host adapters.

## Run and verify

Use Node.js 20 or newer, then run from this directory:

```sh
npm start
npm test
```

Open [the local preview](http://localhost:4173). The server binds to `127.0.0.1`; production should serve the files through the reader's existing static hosting. Use HTTP or HTTPS, not a `file:` URL.

The automated suite covers care and elapsed time, migration, weekly rewards, reading and EXP budgets, fractional set bonuses, outfit and furniture slots, quarter-step recall, pass rewards, achievements, corrupted saves, storage failures, concurrent tabs, and one-time claims. Its maximum-pace simulation reaches the final tier on the **182nd earning day**, including reading, care, errands, and reward claims.

Two browser QA pages are included:

- [Saved-state scenarios](http://localhost:4173/tests/scenarios.html): fresh visitor, 90-day absence, all-owned collector, four recall stages, completed errand, pass rewards, and achievement claims. It uses the isolated key `schale-idle-companion:qa-v2`, leaving the normal preview save untouched. Expand its live state summary to inspect leaves, equipment, claims, role metadata, and the final entitlement.
- [Navbar dock](http://localhost:4173/tests/embed.html): the minimized component inside a sample navigation bar, with modal, focus, and mobile layout checks. This page shares the normal preview save.

The demo chapter button generates a unique demonstration chapter ID. It is not a production reading detector. The next-chapter button exercises route-driven dock animation changes.

Browser checks covered all 30 outfit/accessory combinations across three poses, 28 room scenes including all 18 decorations, all ten badges, each recall quarter, welcome catch-up, achievements, the tier-50 entitlement, and five dock animation choices. Modal layouts were also checked at 390px and 320px phone widths. See [VISUAL-QA.md](docs/VISUAL-QA.md) for the visual verification record.

## Embed in the reader

Copy `src/` and `assets/` together into a public directory such as `/companion/`, preserving their relative layout. Load the module once:

```html
<script type="module" src="/companion/src/companion.js"></script>
<schale-companion reader-url="/manga"></schale-companion>
```

The default presentation is a small fixed dock. Opening it shows the Pet Room in a modal. A dedicated page can render the room directly:

```html
<main style="max-width: 1160px; margin: auto; padding: 24px;">
  <schale-companion expanded reader-url="/manga"></schale-companion>
</main>
```

For a dock inside the host navigation layout:

```html
<schale-companion dock-position="inline" reader-url="/manga"></schale-companion>
```

| Attribute | Behavior |
| --- | --- |
| No attributes | Fixed dock; opens the room in a modal. |
| `expanded` | Full room in the page; minimizing reveals the dock. Set before connecting the element. |
| `dock-position="inline"` | Minimized dock participates in normal document flow. |
| `reader-url` | Destination of the reading link; defaults to `https://www.schalescans.com/manga`. HTTP and HTTPS destinations are accepted. |

The host controls outer width and spacing. Container queries adapt the room, shop, pass, and milestone controls to their available width. Internal styles do not apply to the host page. `demo.css` and the preview page shell are not required when embedding.

### Chapter completion hook

The preferred hook is asynchronous:

```js
await customElements.whenDefined('schale-companion');

// The reader must verify meaningful completion before calling this.
const result = await window.rewardPetLeaves(10, {
  chapterId: 'series-id:chapter-id',
  reason: 'Chapter finished',
});

// { ok, awarded, xp, message }
console.log(result.awarded, result.xp);
```

`window.rewardPetCoins` remains an alias for existing integrations. Both hooks use the same balance and transaction queue; they do not create separate currencies.

Use a stable, globally unique chapter ID. IDs are trimmed, must contain 1–200 characters, and stay in the save so a chapter cannot award again after a reload or a later week. Amounts must be positive safe integers. A capped chapter is still recorded as shared; its unawarded leaves or EXP are not stored for later replay.

The simpler `await window.rewardPetLeaves(10, 'Chapter finished')` form is supported, but it has no chapter identity, chapter deduplication, or chapter EXP. Prefer the structured form.

The host decides what constitutes meaningful reading. This component does not verify final-page exposure, account identity, or reading time. Browser balances and caps provide local pacing, not a trusted currency ledger: browser storage and public hooks can be edited by the reader. Account continuity or trusted rewards require a server-authoritative completion and balance adapter.

### Page changes and dock animations

The minimized companion cycles among five ambient choices between page or chapter changes. The navigation adapter observes `pushState`, `replaceState`, `popstate`, and hash changes while preserving the original history methods. Readers whose page transitions do not change the URL can call:

```js
window.petCompanionPageChanged('series-id:chapter-id:page-7');
```

Repeating the same page key does not change the choice again. Navigation changes affect presentation only and never grant chapter rewards.

## Care and time away

| Mechanic | Rule |
| --- | --- |
| Initial state | 100 fullness, 90 happiness, 100 energy, 60 leaves, 0 pass EXP, and the default room/outfit. The first weekly check-in adds 20 leaves, giving a new visitor 80. |
| Fullness (`hunger`) | −12 per 24 hours, stopping at 20. One catch-up loses at most 80. |
| Happiness | −10 per 24 hours, stopping at 20. One catch-up loses at most 70. |
| Energy | +5 per hour up to 100, including while away or on an errand. |
| Welcome back | More than 24 hours away gives a greeting and 15 leaves, once for that saved departure. |
| Low stats | Below 30 fullness or happiness, the companion looks drowsy. Interaction perks her up. No death, departure, item loss, or EXP decay. |
| Well-fed bonus | At least 70 fullness when an errand starts gives +5% adventure leaves. |
| Happy-reader bonus | At least 70 happiness when a new chapter is awarded gives +5% chapter EXP, rounded to the nearest whole point: 12 becomes 13. |

Care bonuses only add rewards. Lower stats never reduce a reward below its base amount. Stats stay in the 0–100 range. Imported values already below the passive floor stay stable instead of decaying further. Elapsed-time math uses Unix milliseconds; the browser need not remain open. Backwards clock changes do not double-charge decay or refill the current reward budgets.

| Interaction | Cost | Effect |
| --- | --- | --- |
| Headpat | Free; spends up to 2 energy | +10 happiness. The first headpat each UTC day also grants 5 leaves and up to 10 EXP. |
| Taiyaki snack | 8 leaves | +25 fullness and +5 happiness. |
| Weekly feast | 30 leaves | Fullness restored to 100 and +10 happiness. |
| Matcha mochi | 24 leaves | +10 fullness, +30 happiness, and half-speed happiness decay for 72 hours. Another mochi refreshes the duration. |

The first three successful feeds per UTC day can each grant 5 EXP. Further food still restores stats. The first headpat always works even with zero leaves or energy. Rapid headpats still animate and add happiness, but achievement progress qualifies at most once per minute. All EXP awards remain subject to the shared budget described below.

## Adventures and recall

| Adventure | Cost | Duration | Base return |
| --- | --- | --- | --- |
| Neighborhood stroll | 20 energy | 2 hours | 20 leaves and 15 EXP. |
| Bookshop visit | 35 energy | 4 hours | 35 leaves and 15 EXP, plus one-time discoveries. |

Only one outing runs at a time. The first full bookshop return grants a manga stack if it is not already owned. A later full visit grants the Bookshop Regular badge if unearned. Further completed visits retain their ordinary leaves and EXP. Completion is caught automatically on the next state transaction, including after reopening the site; rewards do not expire.

Readers can call the companion home immediately. The return fraction is:

```text
fraction = min(1, floor(elapsed / duration × 4) / 4)
```

This gives 0%, 25%, 50%, or 75% before completion, and 100% at the end. Leaves and EXP round down after multiplying by the fraction. Early returns do not grant keepsakes, badges, or full-completion achievement credit. Spent energy is not refunded; ordinary time-based recharge continues.

Set and fullness bonuses are added together and snapshotted when the outing starts. For example, a 5% shop set plus 5% fullness turns a 20-leaf stroll into 22 leaves. Re-equipping or feeding during the outing cannot change that snapshot. The recall preview accounts for the current shared EXP allowance, so it shows the EXP actually claimable at that moment.

## Rooms, wardrobe, and collections

There are five backgrounds: the starting Reading Nook; the purchasable Quiet Shrine, Afternoon Tea, and Sakura Garden; and the pass-exclusive Moonlit Library. Each new shop background costs 100 leaves.

Each complete room set has **one background and three furniture pieces**. Outfits and accessories are independent, so readers can combine a favorite costume with any active set.

| Collection | Required items | Bonus while equipped |
| --- | --- | --- |
| Shrine sanctuary | `room-shrine`, `shrine-mat`, `shrine-lantern`, `shrine-offering` | +5% reading and adventure leaves. |
| Tea for two | `room-tearoom`, `tea-mat`, `tea-table`, `tea-bonsai` | +5% reading and adventure leaves. |
| Under the blossoms | `room-sakura`, `sakura-mat`, `sakura-lantern`, `sakura-bench` | +5% reading and adventure leaves. |
| A moonlit story | `room-moon`, `moon-mat`, `moon-lamp`, `moon-books` | +3% reading and adventure leaves; pass exclusive. |

Only one matching set can be active, because its background and three canonical furniture slots must all match. Owning the pieces alone does not activate the bonus. The default nook and legacy furniture do not form a bonus set.

Reading bonuses retain fractional leaves across qualifying awards and reloads. Two 10-leaf chapter awards with a 5% set produce 21 leaves together when the allowance permits. Twenty 10-leaf awards spread across uncapped days produce 210 leaves for a shop set, or 206 for the 3% moon set. Fractions accrue only from base leaves that fit the remaining allowance. Duplicate chapters and fully capped requests accrue nothing; whole bonus leaves that cannot fit the cap are discarded.

Canonical slots are `room`, `outfit`, `accessory`, `rug`, `left`, and `right`. Equipping new furniture replaces the visible item in that slot; both items remain owned. Decorations and accessories can be put away. A room and outfit always remain selected. The bookmark uses the right furniture slot.

The six outfits are the default cardigan, Shrine Day, After-school Reader, Festival Evening, Garden Companion, and the pass-exclusive Moonwoven Story. Accessories are round glasses, a sakura headband, a festival mask, and the pass ribbon. The exact prices and item descriptions are centralized in `src/catalog.js`.

## Weekly leaves

Weeks begin **Monday at 00:00 UTC**. The first check-in in each week automatically grants leaves; repeat visits in that week give no additional attendance payout.

| Protected streak tier | Weekly gift |
| --- | ---: |
| 1 | 20 leaves |
| 2 | 25 leaves |
| 3 | 30 leaves |
| 4 | 35 leaves |
| 5 and later | 40 leaves |

Consecutive weeks grow the protected streak. A gap pauses it; the return week retains the previous count, and the next consecutive week grows it again. Total visited weeks always accumulate. For example, weeks 1, 2, and 4 give three visits and a streak of two; week 5 grows that streak to three. The display and reward tier stop at five even as visit history continues.

Weekly attendance no longer awards cosmetics. Previously earned v1 ribbon, bookmark, and plant items remain owned after migration. New ribbon and bookmark copies come from the bond pass; the plant is available in the shop. Historical attended weeks are treated as already processed during migration, so they do not produce retroactive duplicate leaf payouts.

## Permanent 50-tier bond pass

The pass never resets or expires. All EXP sources—new chapters, daily headpats, the first three feeds, and completed or recalled errands—share **100 EXP per UTC day and 700 EXP per UTC week**. These limits are implementation details, not counters in the normal room interface. Unawarded overflow is discarded, not banked. Pass and achievement claims award no EXP and cannot bypass the budget.

The first ten tier costs are 50, 60, 70, 80, 90, 100, 110, 120, 140, and 180 EXP, totaling 1,000. The next forty cost 235, 245, …, 625 EXP. The final tier requires **18,200 total EXP**. At the maximum budget, a new save needs 182 earning days, approximately 181–182 elapsed days depending on its first UTC boundary. There is no additional calendar wait. A reader visiting less often progresses at their own pace without losing progress.

Every tier has a claimable reward. Every fifth tier awards a badge. Every second badge—tiers 10, 20, 30, 40, and 50—also records role eligibility metadata.

| Tier | Featured collectible |
| --- | --- |
| 2 | Companion ribbon. |
| 7 | Moonlit bookmark. |
| 30 | Moonlit Library background. |
| 35 | Stardust rug. |
| 40 | Crescent lamp. |
| 45 | Midnight Collection books; the moon room set can now be completed. |
| 48 | Moonwoven Story outfit. |
| 50 | **The long story** badge, role eligibility, and a reserved final surprise. |

The final surprise is deliberately represented only as:

```js
{ id: 'six-month-surprise', status: 'reserved' }
```

Its actual reward has not been chosen. The application does not invent a final item, claim that a physical reward was delivered, or assign a Discord role. Profile presentation, identity verification, and Discord linking remain host integration work.

Successful pass claims emit a bubbling, composed `companion-reward-claimed` event with `{ kind: 'bond-pass', level, reward: claimResult }`. The catalog reward is in `claimResult.reward`. A production service should verify its own authoritative account state before fulfilling any entitlement.

## Milestones

Ten one-time achievements give leaves for distinct chapter counts (1, 10, 50, 100), qualified headpats (5, 25), full adventures (1, 10), and collecting one or all three shop room sets. The exclusive moon set does not count toward the three-shop-set achievement. Collection achievements check ownership; the smaller ongoing set bonus requires matching equipment.

Claims persist and cannot be repeated through normal reloads. Achievements do not expire and do not grant EXP. `src/catalog.js` contains their targets, descriptions, and leaf rewards.

## Persistence and migration

The default save key remains `schale-idle-companion:v1` for compatibility, while the saved state's `version` is 2. The internal numeric field remains `coins`; the interface and preferred integration API call the currency leaves. There is one balance.

The state includes timestamps, stats, inventory and equipment, weekly history, chapter IDs, fractional reading bonuses, shared EXP budgets, care counters, pending outing snapshots, pass claims, badges, role metadata, and achievement claims. Loading validates fields independently, deduplicates IDs and claims, repairs missing defaults, and maps old furniture slots into current canonical slots. Previous EXP is retained up to the completed pass limit. A legacy uncapped same-day EXP save migrates conservatively into the new budget.

Storage failures retain the working in-memory snapshot so the next transaction does not silently undo progress. A later successful write persists that snapshot. This cannot provide cross-device continuity; clearing site data or switching browsers loses local progress unless the host supplies account storage.

Same-origin tabs listen for storage events. Web Locks serialize transactions where available. A per-page queue is the fallback; simultaneous cross-tab writes cannot be guaranteed in browsers without Web Locks. Visibility changes record actual departure. A long-hidden tab does not overwrite a newer save during `pagehide`.

For isolated previews, set a storage override **before loading the module**:

```html
<meta name="schale-companion-storage" content="schale-idle-companion:qa-v2">
```

Use the default key on the actual reader unless a deliberate separate save is wanted.

## Files and maintenance

| File | Responsibility |
| --- | --- |
| `src/catalog.js` | Rooms, outfits, items, sets, pass thresholds and rewards, and achievements. |
| `src/engine.js` | Pure care, economy, bonus, recall, progression, and migration rules. |
| `src/store.js` | Persistence, transactions, tab synchronization, visibility catch-up, and reading hooks. |
| `src/companion.js` | Custom element lifecycle, dialogs, actions, animations, and focus restoration. |
| `src/views.js` | Room, shop, set collection, sideways pass, and milestone markup. |
| `src/styles.js`, `src/v2-styles.js` | Isolated theme, responsive layouts, and motion. |
| `src/appearance.js`, `src/sprite-controller.js` | Outfit/accessory canvas composition and animation state timing. |
| `src/room-art.js`, `src/item-art.js`, `src/icons.js` | Pixel-style backgrounds, canonical prop layouts, item and badge art, and interface icons. |
| `src/navigation.js` | Stable dock animation changes between reader pages. |
| `assets/` | Original extracted mascot PNGs and bundled local assets. |
| `tests/engine.test.js`, `tests/store.test.js` | Game-rule and persistence regressions. |
| `tests/scenarios.html`, `tests/embed.html` | Isolated scenario fixtures and a navbar integration harness. |

When tuning economy values, update matching UI descriptions and this specification. Keep trusted reading verification in the host adapter. Check desktop and narrow mobile layouts, keyboard tab movement, nested dialog dismissal, focus restoration, and reduced motion after presentation changes. Native dialogs and status announcements support keyboard and assistive-technology use; browser-engine and live-site integration still require host validation.

## Asset provenance and credit

The original 26 mascot PNG frames and the Schale Scans logo were extracted from the [Claude artifact supplied for this project](https://claude.ai/artifact/DGNc9CcHD6tcRVMf89ERXT). The bundled source PNG pixels remain unchanged. The v2 canvas compositor derives outfit and accessory appearances at render time; original frames remain available locally. Pixel presentation uses `image-rendering: pixelated` and motion respects `prefers-reduced-motion`.

The [Schale Scans website](https://www.schalescans.com/) credits its original Kemomimi mascot artwork to **naga u**. Preserve that credit. The logo belongs to Schale Scans. Exact extracted filenames, dimensions, and artifact blob references are recorded in [ASSET-SOURCES.md](docs/ASSET-SOURCES.md). No mascot license, ownership transfer, or redistribution license is inferred or granted by this project.
