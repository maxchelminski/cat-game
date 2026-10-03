# Idle Companion v2 — browser verification

Verified against the running local server on 3 October 2026 using the browser, with isolated QA saves. The normal reader preview save was preserved.

## Cosmetic inspection

| Assets | Browser views inspected | Result |
| --- | --- | --- |
| Everyday cardigan, Shrine day, After-school reader, Festival evening, Garden companion, Moonwoven story | Each outfit with no accessory, glasses, sakura headband, festival mask, and ribbon: 30 combinations in standing, lowered headpat, and lowered sleepy poses | Face and hair preserved; accessory positions follow the pose. Hands remain in front of ornaments. Outfits change sleeves, body, skirt, and sleepy clothing consistently. |
| Round glasses | Standing eyes, closed headpat eyes, lowered sleepy face, animated dock | Thin pixel rims and bridge align with both eyes; lenses remain transparent. |
| Five room scenes | Reading nook, Quiet shrine, Afternoon tea, Sakura garden, Moonlit library, each empty and furnished | Distinct palettes and architecture, consistent floor and mascot alignment. |
| Six mat appearances | Starter mat and five catalog rugs | Identical placement and silhouette; the equipped rug replaces the starter layer. |
| All 18 catalog decorations | Every item individually in its canonical rug/left/right slot | Grounded placement; no baked default rug underneath. Furniture slots replace their previous item. |
| Ten profile crests | 88 px, 32 px, and 24 px | Distinct fox silhouettes, colors, and tier emblems remain readable at profile sizes. |
| Five dock variants | Slow blink/breathe, reading, tail swish, doze, shy pose | All five rendered. Repeated Next chapter actions rotated through every variant. |

Saved browser screenshots:

- [Finished desktop preview](screenshots/v2-desktop.png)
- [All standing outfit combinations](screenshots/v2-outfits-neutral.png)
- [All headpat combinations](screenshots/v2-outfits-headpat.png)
- [All sleepy combinations](screenshots/v2-outfits-sleepy.png)
- [Rooms, individual furniture, and crests](screenshots/v2-room-gallery.png)
- [Mobile recall dialog](screenshots/v2-recall-mobile.png)

The visual galleries remain available at `/tests/visual-qa.html` and `/tests/room-gallery.html`. They load the actual runtime art functions, with no save access.

## Interaction and layout checks

- Equipped the complete shrine collection through the shop; the room shows all three matching pieces and the +5% set status.
- Checked the furnished room at 390 px. Both furniture stations stay within the portrait crop; the mascot and rug remain aligned.
- Checked the navbar dock's expanded modal at 320 px. Fixed overflow and verified dialog scroll width equals client width.
- Tab from the selected room tab goes to Room & wardrobe, skipping the decorative mascot. The separate Headpat control remains accessible.
- Escape closes the inner dialog before the room; closing the room restores dock focus and releases page scroll lock.
- All four early recall dialogs matched actual payouts: 0/25/50/75% of the snapshotted reward, with floored EXP, no full-trip keepsakes, and the mascot back home.
- A 90-day absence displays the welcome dialog and its 15-leaf bonus.
- A milestone claim changes to Collected and adds its advertised leaves.
- The reading hook gives 10 leaves for a new chapter, zero for its duplicate, and only the remaining 90 leaves for a 1,000-leaf request that day. Buying glasses then spends exactly 50 leaves and equips the frame-tracked accessory.
- Tier 50 claims its badge, role eligibility, and reserved surprise entitlement once. The surprise is not represented as an already implemented cosmetic.
- The permanent pass scrolls horizontally on mobile. Claiming a distant tier preserves the scroll position.
- No browser errors or warnings were recorded during the checked gameplay flows.

The rules and persistence tests cover longer time spans and reward boundaries; visual inspection does not replace those tests. Profile display, Discord delivery, account sync, and server-authoritative rewards remain host integration work.
