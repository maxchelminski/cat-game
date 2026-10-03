/** Original, code-native pixel illustrations. No remote images or dependencies. */
const colors = { ink: '#322a31', cream: '#eed9a7', light: '#f5e6bf', amber: '#c89a5b', wood: '#9a7051', darkWood: '#60463e', olive: '#828963', leaf: '#a5b17b', plum: '#886274', red: '#b97c72', blue: '#808c98' };
const { ink, cream, light, amber, wood, darkWood, olive, leaf, plum, red, blue } = colors;
const rect = (x, y, w, h, fill) => `<path fill="${fill}" d="M${x} ${y}h${w}v${h}H${x}z"/>`;
const path = (d, fill) => `<path fill="${fill}" d="${d}"/>`;
const sparkle = (x, y, fill = cream) => path(`M${x} ${y}h2v4h4v2h-4v4h-2v-4h-4v-2h4z`, fill);

const art = {
  snack: () => [
    path('M16 46h48v6H16zM22 52h36v4H22z', ink), rect(16, 44, 48, 6, blue), rect(20, 44, 40, 2, light),
    path('M20 36h4V24h8v-4h18v4h8v8h4v14H20z', ink),
    path('M24 34h4V26h8v-2h12v4h8v8h2v8H24z', amber),
    path('M28 28h10v-2h8v4h8v6H28z', cream),
    rect(28, 36, 28, 6, wood), rect(26, 36, 30, 2, red), rect(32, 28, 4, 4, light),
    rect(42, 32, 4, 4, wood), rect(48, 28, 2, 2, wood), sparkle(62, 18, amber),
  ].join(''),
  feast: () => [
    path('M10 24h60v28H10zM16 52h48v4H16z', ink), rect(12, 26, 56, 22, darkWood),
    rect(14, 28, 28, 18, light), rect(16, 26, 24, 4, cream), rect(16, 30, 2, 2, cream), rect(30, 38, 4, 2, cream),
    path('M24 30h8v4h4v6h-4v4h-8v-4h-4v-6h4z', red), rect(26, 32, 4, 4, '#d49883'),
    rect(44, 28, 20, 8, olive), rect(46, 28, 4, 6, leaf), rect(54, 28, 4, 6, leaf),
    rect(44, 38, 20, 8, amber), rect(48, 38, 4, 8, cream), rect(58, 38, 4, 8, cream),
    rect(12, 48, 56, 4, wood), rect(16, 54, 48, 2, wood),
    path('M20 14h44v2H20zM20 20h44v2H20z', amber), sparkle(12, 8), sparkle(66, 8, amber),
  ].join(''),
  matcha: () => [
    path('M14 26h46v6h10v18H56v6H20v-6h-6z', ink), rect(18, 28, 40, 20, cream),
    path('M20 46h34v6H22v-2h-2z', wood), rect(58, 34, 8, 12, cream), rect(58, 36, 4, 6, ink),
    rect(20, 28, 34, 6, olive), rect(24, 28, 26, 2, leaf), rect(22, 36, 4, 8, light),
    path('M30 10h4v6h-4v6h-2v-8h2zM42 6h4v6h-4v8h-2V10h2z', '#b8a89c'),
    rect(12, 54, 52, 4, blue), rect(18, 58, 40, 2, ink), sparkle(64, 14, amber),
  ].join(''),
  rug: () => [
    path('M18 16h44v4h6v4h6v22h-6v4h-6v4H18v-4h-6v-4H6V24h6v-4h6z', ink),
    path('M20 18h40v4h8v4h4v18h-8v6H16v-6H8V26h8v-4h4z', plum),
    path('M22 22h36v4h8v18h-8v4H22v-4h-8V26h8z', red),
    path('M24 26h32v4h6v10h-6v4H24v-4h-6V30h6z', plum),
    path('M38 28h4v4h8v4h-8v4h-4v-4h-8v-4h8z', cream),
    rect(4, 28, 4, 2, amber), rect(4, 34, 4, 2, amber), rect(4, 40, 4, 2, amber),
    rect(72, 28, 4, 2, amber), rect(72, 34, 4, 2, amber), rect(72, 40, 4, 2, amber),
  ].join(''),
  bookshelf: () => [
    rect(16, 6, 48, 54, ink), rect(18, 8, 44, 48, wood), rect(22, 12, 36, 40, darkWood),
    rect(20, 30, 40, 4, amber), rect(20, 50, 40, 4, amber), rect(20, 56, 6, 6, wood), rect(54, 56, 6, 6, wood),
    rect(24, 16, 6, 14, olive), rect(30, 14, 6, 16, red), rect(36, 18, 6, 12, cream), rect(46, 14, 8, 16, plum),
    rect(24, 18, 6, 2, leaf), rect(30, 16, 6, 2, cream), rect(48, 24, 4, 2, cream),
    rect(24, 38, 8, 12, blue), rect(26, 40, 4, 2, cream), rect(34, 42, 20, 8, red),
    rect(34, 38, 20, 4, cream), rect(36, 46, 16, 2, cream), rect(18, 8, 42, 2, amber),
  ].join(''),
  kotatsu: () => [
    path('M16 22h48v8h4v10h4v14H8V40h4V30h4z', ink),
    path('M18 28h44v4h4v10h4v10H10V42h4V32h4z', plum),
    path('M24 28h8v24h-8zM48 28h8v24h-8zM12 40h56v6H12z', red),
    rect(20, 30, 40, 4, '#674a60'), rect(14, 24, 52, 6, darkWood), rect(12, 18, 56, 6, amber),
    rect(16, 16, 48, 4, wood), rect(18, 18, 42, 2, '#dcba83'),
    path('M28 8h12v8H28z', cream), rect(30, 8, 8, 2, olive), rect(40, 10, 4, 4, cream),
    rect(48, 12, 12, 4, blue), rect(50, 12, 10, 2, cream), rect(8, 52, 64, 4, '#5a3e50'),
  ].join(''),
  manga: () => [
    rect(12, 42, 50, 12, ink), rect(14, 44, 44, 8, plum), rect(20, 46, 40, 4, cream), rect(20, 48, 36, 2, '#baa590'),
    rect(18, 30, 48, 12, ink), rect(20, 32, 42, 8, olive), rect(26, 34, 38, 4, light), rect(26, 36, 32, 2, '#baa590'),
    rect(14, 18, 48, 12, ink), rect(16, 20, 44, 8, red), rect(20, 22, 40, 4, cream), rect(20, 24, 34, 2, '#baa590'),
    rect(16, 14, 44, 6, red), rect(24, 14, 20, 4, cream), rect(28, 14, 12, 2, plum),
    path('M46 24h6v18l-3-3-3 3z', amber), sparkle(68, 12),
  ].join(''),
  plant: () => [
    path('M24 38h32v10h-4v12H28V48h-4z', ink), rect(26, 40, 28, 6, amber), rect(30, 46, 20, 12, wood),
    rect(32, 48, 4, 8, amber), rect(46, 46, 4, 12, darkWood), rect(38, 18, 4, 22, '#566147'),
    path('M38 6h8v4h4v12h-6v6h-6zM16 20h14v4h8v10H26v-6H16zM46 26h8v-8h12v8h-6v8H46z', olive),
    path('M40 8h4v12h-4zM18 22h12v4H18zM54 20h10v4H54z', leaf),
    path('M26 8h8v12h-8v-4h-4V8zM48 8h14v6h-8v6h-6z', leaf), rect(28, 12, 4, 12, olive),
  ].join(''),
  glasses: () => [
    path('M8 24h26v4h12v-4h26v24H46V34H34v14H8z', ink),
    rect(12, 28, 18, 16, amber), rect(50, 28, 18, 16, amber), rect(16, 30, 12, 12, '#808b8b'), rect(54, 30, 12, 12, '#808b8b'),
    rect(18, 30, 4, 8, '#c9d1bd'), rect(56, 30, 4, 8, '#c9d1bd'), rect(34, 28, 12, 4, amber),
    rect(4, 26, 4, 6, amber), rect(72, 26, 4, 6, amber), sparkle(18, 12, cream),
  ].join(''),
  headband: () => [
    path('M14 38h4V26h8v-6h28v6h8v12h4v12H54V36h-8v-4H34v4h-8v14H14z', ink),
    path('M18 38h4V28h6v-4h24v4h6v10h4v10h-6V36h-8v-6H32v6h-8v12h-6z', plum),
    path('M38 26V10h-6V6H20v12h4v6zM42 26V10h6V6h12v12h-4v6z', ink),
    path('M36 22V12h-6V10h-6v6h4v6zM44 22V12h6V10h6v6h-4v6z', red),
    rect(36, 18, 8, 10, amber), rect(38, 20, 4, 4, cream),
  ].join(''),
  mask: () => [
    path('M16 8h8l12 12h8L56 8h8v30h-4v8h-8v8H28v-8h-8v-8h-4z', ink),
    path('M20 12h4l12 12h8l12-12h4v24h-4v8h-8v6H32v-6h-8v-8h-4z', cream),
    path('M22 16h2l6 10h-8zM56 16h2v10h-8z', red),
    path('M26 28h8v4h-8zM46 28h8v4h-8zM34 36h12v4H34zM38 40h4v4h-4z', ink),
    rect(24, 34, 8, 4, red), rect(48, 34, 8, 4, red), rect(38, 26, 4, 6, amber),
    path('M60 38h6v10h-4v8h-4v-6h4V40h-2z', red), rect(56, 54, 8, 4, amber),
  ].join(''),
  ribbon: () => [
    path('M12 12h14l14 10 14-10h14v28H54l-4-4v22l-10-6-10 6V36l-4 4H12z', ink),
    path('M16 16h8l14 10v6L24 36h-8zM64 16h-8L42 26v6l14 4h8z', red),
    path('M32 32h8v16l-8 6zM40 32h8v22l-8-6z', plum),
    rect(34, 22, 12, 14, amber), rect(36, 24, 8, 8, cream), rect(18, 18, 6, 4, '#d6a193'), rect(56, 18, 6, 4, '#d6a193'),
  ].join(''),
  bookmark: () => [
    path('M24 8h32v52l-16-8-16 8z', ink), path('M28 12h24v42l-12-6-12 6z', olive),
    rect(30, 12, 2, 36, leaf), rect(48, 12, 2, 36, '#626d4c'),
    path('M38 20h4v4h6v4h-4v6h-8v-6h-4v-4h6z', cream), rect(36, 38, 8, 2, amber),
    rect(38, 6, 4, 8, amber), path('M40 4h20v4h4v12h-4V10h-6V8H40z', amber),
    rect(58, 18, 8, 6, cream), rect(58, 24, 2, 6, amber), rect(62, 24, 2, 6, amber),
  ].join(''),
  badge: () => [
    path('M22 34h16v26l-8-6-8 6zM42 34h16v26l-8-6-8 6z', plum),
    path('M30 6h20v4h8v8h4v18h-4v8h-8v4H30v-4h-8v-8h-4V18h4v-8h8z', ink),
    path('M32 10h16v4h8v6h2v14h-4v8h-8v2H32v-4h-6v-6h-4V20h4v-6h6z', amber),
    path('M32 16h16v4h6v14h-6v6H32v-6h-6V20h6z', cream),
    path('M30 22h8v2h4v-2h8v12h-8v2h-4v-2h-8z', olive), rect(38, 24, 4, 10, '#566147'),
    rect(32, 24, 4, 2, light), rect(44, 24, 4, 2, light),
  ].join(''),
  stroll: () => [
    path('M14 50h52v4H14z', ink), path('M28 50h24v-8H40v-8h8v-6H34v10h-6z', amber),
    path('M12 34h8v16h-8zM60 34h8v16h-8z', darkWood),
    path('M14 8h4v8h6v8h4v10H4V24h4v-8h6zM62 10h4v8h6v8h4v10H52V26h4v-8h6z', olive),
    path('M14 10h4v10h-6v6H8v6H4v-8h4v-8h6zM62 12h4v8h-6v8h-4v6h-4v-8h4v-8h6z', leaf),
    path('M36 8h12v4h4v8h-4v4H36v-4h-4v-8h4z', cream), rect(38, 8, 8, 4, light),
    rect(16, 54, 4, 2, olive), rect(60, 54, 4, 2, olive), sparkle(26, 4, amber),
  ].join(''),
  bookshop: () => [
    path('M10 16h60v42H10z', ink), rect(14, 18, 52, 38, cream), rect(18, 30, 24, 20, darkWood), rect(48, 30, 14, 26, darkWood),
    path('M12 12h56v6h4v8H8v-8h4z', ink), path('M14 14h52v6h4v4H10v-4h4z', olive),
    rect(18, 14, 8, 10, leaf), rect(34, 14, 8, 10, leaf), rect(50, 14, 8, 10, leaf),
    rect(18, 26, 8, 2, leaf), rect(34, 26, 8, 2, leaf), rect(50, 26, 8, 2, leaf),
    rect(20, 34, 4, 12, red), rect(24, 32, 6, 14, blue), rect(32, 36, 6, 10, olive), rect(20, 46, 20, 2, amber),
    rect(50, 32, 10, 12, '#555863'), rect(50, 48, 2, 2, cream), rect(46, 56, 18, 2, wood),
    rect(26, 4, 28, 8, wood), rect(32, 6, 16, 4, cream), rect(38, 6, 2, 4, olive),
  ].join(''),
};

/** Return a transparent icon for any catalog item, safe to place inside a button. */
export function itemArt(id) {
  const aliases = { 'manga-stack': 'manga', 'manga-stacks': 'manga', 'floor-rug': 'rug', 'round-glasses': 'glasses', 'festival-mask': 'mask', 'favorite-food': 'matcha', 'reading-break': 'stroll', 'moon-ribbon': 'ribbon', 'weekly-bookmark': 'bookmark' };
  const drawing = art[id] || art[aliases[id]] || art.bookmark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64" fill="none" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${drawing()}</svg>`;
}

/** Decor uses the same exact palette and pixel grid as its catalog thumbnail. */
export function decorArt(id) { return itemArt(id); }
