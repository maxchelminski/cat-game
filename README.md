# Schale Scans · Idle Companion

A cozy fox companion for readers who stop by once or twice a week. Feed her a little treat, share a chapter, send her to the bookshop, and gradually make the reading nook your own. She never dies, runs away, loses collected items, or demands daily attendance.

This is a self-contained **Vanilla JavaScript Web Component** with HTML5 dialogs and CSS isolated in a **Shadow DOM**. It has no runtime dependencies, package installation, or build step. The included page is a working integration preview; the live Schale Scans website has **not** been changed. Its source repository was not available, so connecting real chapter completion requires an adapter in the host reader.

## Run locally

Use Node.js 20 or newer. From this directory:

```sh
npm start
```

Open [http://localhost:4173](http://localhost:4173) (the server binds to `127.0.0.1`). The preview includes an expanded Pet Room and a **Finish a demo chapter** button. That button generates a unique demonstration chapter ID; it is not a production reading detector.

Run the 23 dependency-free game and persistence tests:

```sh
npm test
```

Tests cover multi-day decay, long absences, welcome rewards, clock changes, mood boosts, errands, protected weekly attendance, chapter deduplication and reward caps, purchases, bond levels, and malformed saved data. Serve the files over HTTP or HTTPS; do not open `index.html` as a `file:` URL. The included Node server is for local preview, while production can use the website's existing static hosting.

## Add it to the reader

Copy `src/` and `assets/` together into a public directory such as `/companion/`, preserving their relative layout. Load the module once and add one component to the page:

```html
<script type="module" src="/companion/src/companion.js"></script>
<schale-companion></schale-companion>
```

The default presentation is a small fixed dock. Clicking it opens the Pet Room in a modal. For a dedicated companion page, use the expanded presentation:

```html
<main style="max-width: 1160px; margin: auto; padding: 24px;">
  <schale-companion expanded reader-url="/manga"></schale-companion>
</main>
```

For an unobtrusive dock positioned by the host navigation layout:

```html
<schale-companion
  dock-position="inline"
  reader-url="/manga"
></schale-companion>
```

| Attribute | Behavior |
| --- | --- |
| No attributes | Fixed dock, with the room opened in a modal. |
| `expanded` | Renders the full room in the page; its minimize button reveals the dock. Set this before connecting the element. |
| `dock-position="inline"` | Places the minimized dock in normal layout flow, suitable for navigation. |
| `reader-url` | Destination for the room's reading link. Defaults to `https://www.schalescans.com/manga`; HTTP and HTTPS destinations are accepted. |

The host controls the element's width and surrounding spacing. Container queries adapt the room, shop, journal, and controls to the available width. Internal selectors do not apply to the host website. `demo.css` and the demo page shell are not required for embedding.

### Award chapter coins

The integration hook is asynchronous and returns a **Promise**:

```js
await customElements.whenDefined('schale-companion');

// Call only after the host has verified meaningful reading and the final page.
const result = await window.rewardPetCoins(10, {
  chapterId: 'series:chapter',
  reason: 'Chapter finished',
});

// { ok: boolean, awarded: number, message: string }
console.log(result.awarded);
```

Use a stable, globally unique chapter ID, such as the series ID plus chapter ID. IDs are trimmed, must contain 1–200 characters, and remain in the local save to prevent repeat rewards across reloads or later weeks. `amount` must be a positive safe integer. A new chapter gives bond EXP even when reading coin limits have already been reached; it cannot later be replayed to recover the capped coins.

The simpler `await window.rewardPetCoins(10, 'Chapter finished')` form is also supported, but it does not identify or deduplicate a chapter and does not award chapter bond EXP. Prefer the structured form for real reading integration.

The host reader must decide what constitutes meaningful completion and validate it before calling the hook. A final-page visit alone is not a sufficient production completion rule. This module does not inspect reader routes, intercept reading, or connect to a backend. The local coin caps and ID history are UX safeguards, **not server anti-cheat**: users can edit browser storage or invoke the hook themselves. If balances need trust, accounts, or cross-device continuity, add a server-authoritative completion and balance adapter.

## Long-term game specification

### Care and time away

| Mechanic | Implemented behavior |
| --- | --- |
| Starting state | 100 fullness, 90 happiness, 100 energy, 60 coins, bond level 1. |
| Fullness (`hunger`) | Loses 12 points per 24 hours. Passive loss stops at 20, with at most 80 points lost in one catch-up. Starting full, the sleepy threshold is reached after about six days. |
| Happiness | Loses 10 points per 24 hours. Passive loss stops at 20, with at most 70 points lost in one catch-up. |
| Energy | Recharges at 5 points per hour, up to 100; a completely empty bar refills in 20 hours. Rest continues during errands and absences. |
| Welcome back | An absence longer than 24 hours awards 15 coins and shows a greeting. That return is rewarded once, including across reloads. |
| Low stats | A drowsy expression below 30 fullness or happiness, or below 15 energy. Interaction perks her up; there is no death, abandonment, item loss, or bond loss. |
| Recovery | A feast immediately restores fullness to 100. Headpats are free and work even with zero coins or energy. |

Stats remain within 0–100. Normal passive decay has a floor of 20; imported lower values are kept stable rather than being reduced further by time away. Time uses Unix milliseconds and elapsed-time math, so the site need not remain open. Months away are still recoverable in one visit. Clock rollback does not cause negative decay or duplicate charging of the same elapsed interval.

### Economy and interactions

| Action | Cost | Benefit |
| --- | --- | --- |
| Headpat | Free; spends up to 2 energy | +10 happiness each time; the first headpat each UTC day also gives 5 coins and 10 bond EXP. |
| Onigiri snack | 8 coins | +25 fullness, +5 happiness, +5 bond EXP. |
| Weekly feast | 30 coins | Full fullness, +10 happiness, +5 bond EXP. |
| Matcha mochi | 24 coins | +10 fullness, +30 happiness, +5 bond EXP; happiness decay is halved for the next 3 days. Buying again refreshes that duration. |
| Neighborhood stroll | 20 energy; 2 hours | 20 coins and 15 bond EXP on return. |
| Bookshop visit | 35 energy; 4 hours | 35 coins and 15 bond EXP; first grants the manga stack if unowned, then the Bookshop Regular badge on a later trip. |
| Verified new chapter | Host chooses amount; preview uses 10 coins | Up to the remaining reading allowance, plus 12 bond EXP per unique chapter. |

One errand runs at a time. Its reward is collected automatically when the next state update detects completion, including after reopening the site. Rewards do not expire; subsequent bookshop visits continue giving coins and EXP after both collectibles are owned. The room hides the traveling mascot until she returns.

Only reading coins are capped: **100 per UTC day** and **300 per UTC week**. Welcome, headpat, and errand coins use their own rules. All currency is earned in play; there are no real-money transactions. Stats clamp at 100 when a treat would exceed the maximum.

| Shop item | Price | Type |
| --- | ---: | --- |
| Manga stack | 35 coins | Room decor; also available from the bookshop errand. |
| Sundown rug | 45 coins | Room decor. |
| Little library | 80 coins | Room decor. |
| Cozy kotatsu | 120 coins | Room decor. |
| Sakura headband | 40 coins | Wearable. |
| Round glasses | 50 coins | Wearable. |
| Festival mask | 75 coins | Wearable. |
| Matcha mochi | 24 coins | Immediately consumed premium treat. |

Purchased decor and wearables are permanent. A purchase equips the item immediately. Owned items can be equipped or put away without spending more coins. Room items have independent slots; wearables share one accessory slot.

### Weekly attendance and bond

Weeks run **Monday 00:00 through Sunday 23:59 UTC**. One visit records that week's attendance; repeat visits in the same week do not add another check-in. The journal displays the last eight weeks.

Consecutive visited weeks grow the protected streak. A missed week pauses it instead of resetting it. A return after a gap preserves the previous streak count, and the next consecutive week grows it again. Every distinct visited week—including the return week—still counts toward permanent milestone gifts:

| Total attended weeks | Gift |
| ---: | --- |
| 2 | Companion ribbon wearable. |
| 4 | Moonlit bookmark keepsake. |
| 8 | Little sprout room prop. |

Milestones use total attendance rather than an uninterrupted streak. For example, visits in weeks 1, 2, and 4 give three total visits and a protected streak of two; visiting week 5 brings the total to four, grows the streak to three, and unlocks the bookmark.

Bond EXP never decays. The first level needs 100 EXP; each following level needs 50 more than the previous one. Shared chapters, daily headpats, food, and completed errands build it. There are no time-limited rewards that a weekly reader must rush to claim.

### Mascot and presentation

The room uses the original blonde fox mascot sprites from the supplied artifact, with warm wood, olive accents, burgundy details, and a dark reading-site palette. Sprites retain their original pixels and use `image-rendering: pixelated`.

The sprite controller supports idle breathing, reading with a tiny book after about 25 seconds without interaction, eating with a snack prop, headpats with animated frames and floating hearts, drowsy frames for low stats, and a cheerful reading-reward response. Motion respects `prefers-reduced-motion`. Native dialogs, keyboard tab navigation, labeled controls and progress bars, and status announcements support keyboard and assistive-technology use.

## State, tuning, and handoff

The save lives in `localStorage` under `schale-idle-companion:v1`. It stores timestamps, care stats, coins, owned and equipped items, attendance, chapter IDs, mood boost expiry, errand state, and bond EXP. Defensive loading validates saved values. Storage failure falls back to the current in-memory visit and displays a notice; clearing site data or changing browsers loses local progress. There is no account sync or cross-device persistence.

Same-origin tabs listen for storage changes. Web Locks serialize transactions across tabs where available; a per-page queue is the fallback, so simultaneous cross-tab writes are not guaranteed on browsers without Web Locks. Completion is computed from timestamps, not a background worker or an online server timer.

| File | Responsibility |
| --- | --- |
| `src/engine.js` | Pure game rules, care rates and floors, costs, catalog, milestones, rewards, normalization, and bond calculation. Tune the economy here. |
| `src/store.js` | Persistence, transaction queue, tab sync, session catch-up, and `window.rewardPetCoins`. |
| `src/companion.js` | Web Component, dock, room, shop, journal, dialogs, and interaction wiring. |
| `src/styles.js` | Isolated dark theme, responsive container queries, and animations. |
| `src/sprite-controller.js` | Sprite state mapping and frame timing. |
| `src/item-art.js`, `src/icons.js` | Room props, item illustrations, and interface icons. |
| `assets/` | Local room artwork and original mascot assets. |
| `tests/engine.test.js` | Game-rule regression tests. |
| `tests/store.test.js` | Storage failure/recovery, concurrent transactions, Web Locks, and session timestamp regressions. |
| `tests/scenarios.html` | Disposable saved-state fixtures for long absences, finished errands, milestones, and reward caps. |
| `tests/embed.html` | Navbar dock, modal, mobile layout, and keyboard focus test page. |

When tuning values in the engine, update matching UI descriptions and these specification tables. A production host adapter should load the component, route the reading link correctly, and award coins only after its verified completion event. The preview's demonstration reward button should remain outside the production integration.

Original assets and attribution are documented in [ASSET-SOURCES.md](docs/ASSET-SOURCES.md), including the [provided Claude artifact](https://claude.ai/artifact/DGNc9CcHD6tcRVMf89ERXT) and the Schale Scans mascot credit to **naga u**. No mascot license is inferred or granted by this project.

## Verified preview

The Chromium browser preview was checked at desktop, 390px mobile, and 320px narrow mobile widths with no horizontal overflow. Browser checks covered headpats, food, a wearable purchase, reload persistence, the navbar dock and expanded modal, nested Escape dismissal and focus restoration, a 90-day absence and one-time welcome bonus, completed errands, eight-week keepsakes, duplicate chapters, reading caps, and free care with no resources. The browser console was checked for errors. Other browser engines and the live manga reader still need host integration validation.

See the [desktop screenshot](docs/screenshots/desktop.jpg) and [mobile screenshot](docs/screenshots/mobile.jpg). The QA fixture page intentionally replaces this localhost origin's companion save; use it only for testing.
