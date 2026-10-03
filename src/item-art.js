/** Original, code-native pixel illustrations. No remote images or dependencies. */
import { roomArt } from './room-art.js';
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
    path('M12 22h16v4h6v18h-6v4H12v-4H6V26h6zM52 22h16v4h6v18h-6v4H52v-4h-6V26h6z', ink),
    path('M13 25h14v4h4v12h-4v4H13v-4H9V29h4zM53 25h14v4h4v12h-4v4H53v-4h-4V29h4z', '#d2ad70'),
    path('M15 28h10v3h3v8h-3v3H15v-3h-3v-8h3zM55 28h10v3h3v8h-3v3H55v-3h-3v-8h3z', '#6c7d7e'),
    rect(15, 29, 4, 9, '#bdcabc'), rect(55, 29, 4, 9, '#bdcabc'), rect(20, 31, 3, 3, '#8fa5a0'), rect(60, 31, 3, 3, '#8fa5a0'),
    path('M31 29h18v4H31zM3 26h4v5H3zM74 26h4v5h-4z', amber), rect(33, 29, 14, 2, cream), sparkle(21, 9, cream), sparkle(62, 13, amber),
  ].join(''),
  headband: () => [
    path('M12 50V30h6V20h10v-6h24v6h10v10h6v20H56V32h-8v-6H32v6h-8v18z', ink),
    path('M16 48V32h6V23h8v-5h20v5h8v9h6v16h-5V30h-9v-7H30v7h-9v18z', '#8d8a66'),
    path('M18 31h4v13h-4zM30 19h20v3H30zM60 32h3v13h-3z', '#c6b780'),
    path('M23 13h7V7h9v6h8v8h-6v8H30v-5h-9v-8h2z', '#c591a9'),
    path('M26 14h6V9h5v8h8v3h-8v7h-5v-8h-8v-3h2z', '#e4bdc7'), rect(31, 16, 6, 6, '#ecd29d'),
    path('M49 19h6v-5h7v5h6v7h-5v6h-8v-5h-6z', '#d1a2b3'), rect(56, 21, 5, 5, '#e8cb92'),
    path('M20 21h-8v-6h8zM63 35h8v-7h-8z', '#8a9c6b'),
  ].join(''),
  mask: () => [
    path('M16 8h8l12 12h8L56 8h8v30h-4v8h-8v8H28v-8h-8v-8h-4z', ink),
    path('M20 12h4l12 12h8l12-12h4v24h-4v8h-8v6H32v-6h-8v-8h-4z', cream),
    path('M22 16h2l6 10h-8zM56 16h2v10h-8z', red),
    path('M26 28h8v4h-8zM46 28h8v4h-8zM34 36h12v4H34zM38 40h4v4h-4z', ink),
    path('M24 32h8v3h-5v4h-3zM48 32h8v7h-3v-4h-5z', red), rect(38, 23, 4, 6, amber), rect(39, 19, 2, 3, '#cf9d69'),
    path('M60 38h6v10h-4v8h-4v-6h4V40h-2z', red), rect(56, 54, 8, 4, amber), rect(56, 58, 3, 4, red), rect(61, 58, 3, 4, red),
  ].join(''),
  ribbon: () => [
    path('M12 12h14l14 10 14-10h14v28H54l-4-4v22l-10-6-10 6V36l-4 4H12z', ink),
    path('M16 16h8l14 10v6L24 36h-8zM64 16h-8L42 26v6l14 4h8z', red),
    path('M32 32h8v16l-8 6zM40 32h8v22l-8-6z', plum),
    rect(34, 22, 12, 14, amber), rect(36, 24, 8, 8, cream), rect(38, 26, 4, 4, '#b79165'), rect(18, 18, 6, 4, '#d6a193'), rect(56, 18, 6, 4, '#d6a193'),
    path('M20 29h10v2H20zM50 29h10v2H50zM33 38h2v10h-2zM45 38h2v10h-2z', '#c997a0'),
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

const wrap = (body, width = 80, height = 64) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${body}</svg>`;
const at = (x, y, body, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
const R = rect, P = path;
const flower = (x, y, color = '#dca3b5', scale = 1) => at(x, y, P('M6 0h6v4h6v6h-4v6H8v-2H2V8H0V4h6z', color) + R(6, 6, 4, 4, '#f3d7a6'), scale);
const shadow = () => P('M8 94h94v4H8zM18 98h74v2H18z', '#292730');
const smallBook = (x, y, w, h, cover, spine = cream) => R(x, y, w, h, cover) + R(x + 2, y + 3, Math.max(2, w - 4), 2, spine) + R(x + 2, y + h - 5, Math.max(2, w - 4), 2, spine);

// Furnishings have a real room footprint. Their feet touch y100; there is no
// thumbnail padding in this artwork and no separately baked floor decoration.
const furnishings = {
  bookshelf: () => [
    shadow(), R(8, 0, 94, 96, ink), R(12, 4, 86, 90, '#9c7051'), R(18, 10, 74, 78, '#513b35'),
    R(10, 2, 90, 4, '#c39865'), R(16, 90, 10, 10, '#74513e'), R(84, 90, 10, 10, '#74513e'),
    ...[34, 62, 88].map(y => R(16, y, 78, 5, '#c09361') + R(16, y + 5, 78, 3, '#74503f')),
    smallBook(22, 13, 10, 21, '#929c6b'), smallBook(34, 11, 12, 23, '#b47e72'), smallBook(48, 17, 8, 17, '#b3a384'),
    P('M62 14h10l6 20H68z', '#837589'), P('M64 18h10v2H64z', '#d6bd9b'), smallBook(80, 16, 8, 18, '#9c8b60'),
    smallBook(22, 44, 12, 18, '#7c9196'), smallBook(36, 42, 8, 20, '#c6986d'), R(52, 52, 32, 10, '#8d687d'), R(54, 54, 28, 5, '#d9c9a9'), R(56, 44, 30, 8, '#9aab7e'), R(58, 46, 26, 3, '#e2d4b3'),
    R(22, 77, 36, 11, '#b88374'), R(24, 80, 32, 5, '#e7d7ba'), R(24, 71, 30, 6, '#7b8b91'),
    R(70, 72, 14, 16, '#c79b70'), R(68, 72, 18, 4, '#dfbe8c'), R(74, 68, 6, 4, '#9fac78'),
    R(12, 8, 3, 80, '#b38b60'), R(94, 8, 4, 84, '#7a5642'),
  ].join(''),
  kotatsu: () => [
    shadow(), P('M16 44h78v8h6v16h6v30H4V68h6V52h6z', ink),
    P('M18 48h74v8h6v14h4v26H8V70h6V56h4z', '#79586e'),
    P('M28 48h12v48H28zM70 48h12v48H70zM10 68h90v10H10z', '#a47887'), R(8, 92, 94, 4, '#513e56'),
    P('M42 52h6v6h-6zM60 82h6v6h-6zM16 82h6v6h-6zM88 58h6v6h-6z', '#d8baa2'),
    R(8, 42, 94, 10, '#60463c'), R(4, 36, 102, 8, '#c09365'), R(10, 32, 90, 6, '#aa7c52'), R(10, 36, 90, 2, '#e4bb7d'),
    R(24, 19, 24, 13, '#d3bd8d'), R(28, 18, 16, 4, '#87905f'), R(46, 21, 7, 7, '#c0a87b'), R(26, 24, 4, 6, '#efdfb4'),
    R(65, 23, 27, 9, '#8f9b84'), R(67, 25, 23, 4, '#dfd7b7'), R(72, 18, 18, 5, '#9c7483'),
    P('M30 4h3v5h-3v5h-2V7h2zM42 0h3v5h-3v7h-2V3h2z', '#bbab9a'),
  ].join(''),
  manga: () => [
    shadow(), R(10, 81, 88, 19, ink), R(12, 82, 82, 15, '#87667e'), R(22, 85, 74, 9, '#e7d7b8'), R(24, 90, 66, 2, '#b7a897'),
    R(20, 62, 82, 19, ink), R(22, 64, 78, 14, '#8c9b72'), R(30, 67, 70, 8, '#e9dfc6'), R(32, 71, 64, 2, '#b9b8a2'),
    R(6, 45, 82, 17, ink), R(8, 47, 78, 12, '#b27a72'), R(18, 50, 68, 6, '#e6d2b7'), R(20, 53, 60, 1, '#b9a58f'),
    P('M14 39h72v8H8v-4h6z', '#c38d80'), R(27, 38, 32, 7, '#e4c3a3'), R(31, 39, 24, 3, '#8e6576'),
    P('M72 54h8v28l-4-4-4 4z', '#d6b376'),
    // A tiny ceramic fox bookend, rather than another generic stack.
    P('M66 19h6l6 6 6-6h6v15h-4v6H72v-6h-6z', '#e7d4ac'), R(72, 28, 2, 3, ink), R(82, 28, 2, 3, ink), R(77, 32, 3, 2, '#ad7e65'),
  ].join(''),
  plant: () => [
    shadow(), P('M28 66h56v12h-6v20H34V78h-6z', ink), R(30, 68, 52, 9, '#c29568'), R(37, 77, 38, 20, '#987052'), R(41, 80, 5, 14, '#bb9069'), R(68, 78, 7, 19, '#705141'),
    P('M54 24h5v45h-5zM48 47h8v6h-8zM58 39h12v5H58z', '#4e6647'),
    P('M48 4h12v8h8v18h-8v8H48V22h-6V10h6zM18 30h20v6h14v18H36V44H18zM66 34h14V20h18v14h-8v14H66zM20 52h16v6h14v10H34V62H20zM62 56h20v-6h14v10H82v8H62z', '#849867'),
    P('M50 6h6v18h-6zM20 32h16v6H20zM82 22h12v6H82zM22 54h14v4H22zM82 52h12v4H82z', '#b1bf83'),
    P('M56 30h4v32h-4zM38 41h14v4H38zM66 38h15v4H66z', '#5c774e'),
  ].join(''),
  'shrine-lantern': () => [
    shadow(), P('M26 90h58v10H26zM34 82h42v8H34zM43 57h24v25H43z', '#687064'), R(45, 59, 5, 23, '#a6aa8b'), R(63, 59, 4, 23, '#484f4a'),
    P('M32 34h46v26H32zM28 60h54v6H28z', '#4d5c50'), R(36, 37, 38, 21, '#c6a673'), R(44, 38, 22, 18, '#ebd099'), R(38, 39, 5, 17, '#87927b'), R(67, 39, 5, 17, '#79856f'),
    P('M18 28h12v-6h10v-8h30v8h10v6h12v8H18z', '#35443d'), P('M22 28h14v-6h12v-6h14v6h12v6h14v4H22z', '#7c8870'), R(24, 30, 62, 3, '#a7ad87'),
    R(48, 8, 14, 8, '#66765f'), R(51, 3, 8, 5, '#9fa98a'), R(52, 44, 6, 10, '#eddfab'), R(55, 47, 2, 5, '#f9efd0'),
    P('M30 94h13v3H30zM65 84h9v3h-9zM38 63h10v3H38z', '#a1ac75'),
  ].join(''),
  'shrine-offering': () => [
    shadow(), P('M24 61h62v11H24zM30 72h50v24H30zM24 96h62v4H24z', '#764b3d'), R(34, 72, 8, 24, '#b47954'), R(70, 72, 8, 24, '#b47954'), R(42, 80, 28, 4, '#9d6546'),
    R(16, 55, 78, 9, '#cb9860'), R(12, 49, 86, 7, '#a9754d'), R(18, 51, 74, 2, '#e1b781'),
    P('M32 43h8V32h8v-8h18v8h8v11h8v6H26v-6z', '#ece2c6'), R(42, 33, 29, 7, '#f7ecd2'), R(40, 42, 36, 4, '#c7bca2'), R(50, 19, 14, 8, '#dca368'), R(54, 17, 5, 3, '#8e9b63'),
    P('M17 15h8v15h-3v19h-4V30h-3V15zM86 15h8v15h-3v19h-4V30h-3V15z', '#d6c49c'), R(17, 11, 8, 5, '#efe0b9'), R(86, 11, 8, 5, '#efe0b9'),
    P('M45 62h21v9h-6v9h-6v-9h-9z', '#e8dfc6'), R(52, 69, 5, 13, '#e8dfc6'),
  ].join(''),
  'tea-table': () => [
    shadow(), R(18, 74, 12, 26, '#694f3d'), R(80, 74, 12, 26, '#694f3d'), R(20, 75, 4, 21, '#a78155'), R(82, 75, 4, 21, '#a78155'),
    R(9, 63, 92, 13, '#6e513d'), R(5, 56, 100, 9, '#bd9867'), R(13, 50, 84, 8, '#a08058'), R(12, 58, 86, 2, '#daba82'),
    R(19, 42, 72, 8, '#745846'), R(23, 44, 64, 4, '#bcaa81'),
    P('M42 22h22v6h6v14H38V28h4z', '#5c7568'), R(46, 17, 16, 6, '#829887'), R(51, 14, 6, 4, '#adbaa1'), P('M68 28h8v-8h5v16H68z', '#6c8576'),
    P('M37 27h-8v7h-5v5h15z', '#809885'), R(45, 26, 4, 12, '#a4b5a0'),
    R(23, 35, 12, 8, '#c5bd9b'), R(25, 34, 8, 3, '#7f8e5f'), R(77, 35, 12, 8, '#c5bd9b'), R(79, 34, 8, 3, '#7f8e5f'),
    P('M48 1h3v5h-3v6h-2V4h2zM59 4h3v5h-3v5h-2V7h2z', '#bfb9a0'),
  ].join(''),
  'tea-bonsai': () => [
    shadow(), P('M16 78h80v10h-6v10H24V88h-8z', '#364b58'), R(20, 79, 72, 4, '#769396'), R(27, 91, 12, 9, '#435a63'), R(75, 91, 12, 9, '#435a63'), R(25, 85, 60, 4, '#536e77'),
    P('M45 77h20v-8H54V57h8V43h14v-8H56v14H42v14h4z', '#81664a'), R(49, 57, 4, 17, '#b38b5d'), P('M46 51H27V38h7v8h19zM59 42V25h9v17z', '#735b42'),
    P('M12 29h12v-8h26v6h10v13H12zM44 11h12V3h30v8h12v14H44zM64 45h14v-8h19v8h10v14H64z', '#5d7852'),
    P('M16 29h12v-4h20v5H36v5H16zM50 11h10V7h23v4h9v5H68v4H50zM72 45h10v-4h13v6H83v6H70z', '#9aaa70'),
    P('M17 39h38v4H17zM52 24h42v4H52zM70 58h30v4H70z', '#3e5c45'),
    R(30, 73, 18, 5, '#7b8c5a'), R(63, 73, 18, 5, '#a0aa70'),
  ].join(''),
  'sakura-lantern': () => [
    shadow(), R(32, 92, 46, 8, '#895a61'), R(40, 84, 30, 8, '#ba7a79'), R(48, 63, 14, 23, '#80565b'), R(50, 64, 4, 20, '#c08e83'),
    P('M28 24h54v6h6v30h-6v6H28v-6h-6V30h6z', '#825463'), R(30, 28, 50, 33, '#efd2b2'), R(34, 31, 8, 27, '#f8e2c4'), R(73, 30, 5, 28, '#cfa38f'),
    R(28, 38, 54, 2, '#d2a392'), R(28, 50, 54, 2, '#d2a392'),
    P('M18 20h12v-6h16V8h18v6h16v6h12v6H18z', '#81516a'), R(25, 20, 60, 3, '#bd8390'), R(45, 4, 20, 5, '#b17c87'),
    flower(44, 36, '#bc819b', 1.1), R(46, 66, 18, 3, '#bd8a86'),
  ].join(''),
  'sakura-bench': () => [
    shadow(), R(16, 68, 10, 32, '#65434f'), R(84, 68, 10, 32, '#65434f'), R(16, 94, 14, 6, '#9d6a73'), R(82, 94, 14, 6, '#9d6a73'),
    R(12, 38, 8, 40, '#8f616b'), R(90, 38, 8, 40, '#8f616b'), R(18, 34, 74, 8, '#b9858b'), R(18, 47, 74, 7, '#ac7782'), R(18, 59, 74, 7, '#95636f'),
    R(10, 70, 90, 12, '#774f5c'), R(6, 64, 98, 8, '#c99394'), R(10, 64, 90, 2, '#e1b1a6'),
    P('M44 60h32v-6h10v14H38v-8z', '#d1a1ad'), R(42, 59, 39, 3, '#efc5c6'),
    flower(19, 26, '#dcb0b9', .75), flower(79, 24, '#d79baa', .8),
    P('M25 31h-9v-6h9zM91 27h9v-5h-9z', '#84916a'),
  ].join(''),
  'moon-lamp': () => [
    shadow(), P('M28 94h54v6H28zM38 88h34v6H38z', '#817b9b'), R(50, 53, 10, 36, '#95889e'), R(52, 54, 3, 33, '#d1b995'),
    P('M54 2h18v6H58v6H48v12H42v16h8v10h14v4H46v-6H34V40h-6V20h6V10h10V4h10z', '#cdbb90'),
    P('M48 10h8v5h-8v10h-8v16h-6V22h6V14h8z', '#f1dfad'),
    R(71, 8, 2, 17, '#ac9cab'), P('M66 25h12v5h6v12h-6v6H66v-6h-6V30h6z', '#8f96c5'), R(66, 29, 4, 11, '#d4dcef'), R(72, 44, 3, 12, '#a4a7ca'),
    sparkle(81, 11, '#d9c9a4'), sparkle(12, 43, '#b6c0e0'), R(52, 75, 7, 3, '#dfcca8'),
  ].join(''),
  'moon-books': () => [
    shadow(), R(15, 85, 84, 15, '#5e617d'), R(19, 89, 76, 7, '#cac3c6'), R(20, 92, 71, 1, '#9a98af'), R(12, 80, 88, 7, '#8d80a2'),
    R(22, 63, 75, 17, '#586785'), R(28, 67, 67, 8, '#d1cfcf'), R(30, 71, 60, 1, '#9ea6b4'), R(20, 59, 78, 6, '#8794b2'),
    // An upright star atlas with a stepped gold cover and a loose ribbon.
    P('M23 12h44v47H19V17h4z', '#353c62'), R(24, 14, 39, 42, '#7e739d'), R(28, 18, 31, 34, '#a995b4'), R(31, 21, 25, 28, '#555c87'),
    sparkle(42, 28, '#e7d2a5'), R(25, 16, 3, 37, '#cfb893'), P('M52 51h6v22l-3-4-3 4z', '#d8bf94'),
    P('M76 31h14v4h6v17h-6v7H76v-7h-6V35h6z', '#a9b6cf'), P('M76 32h7v6h-5v12h-5V36h3z', '#e0dceb'), R(80, 56, 9, 5, '#d0b48f'),
    sparkle(86, 8, '#d9c69d'),
  ].join(''),
  bookmark: () => [shadow(), P('M18 52h34v4h8v-4h34v40H60v4h-8v-4H18z', '#765c49'), P('M22 48h28v4h6v38h-6v-3H22zM60 52h6v-4h24v39H66v3h-6z', '#e0d1ac'), R(28, 59, 17, 2, '#a69c80'), R(28, 66, 17, 2, '#a69c80'), R(70, 59, 13, 2, '#a69c80'), P('M69 47h9v32l-4-4-5 4z', '#869469'), R(18, 96, 76, 4, '#886b50')].join(''),
};

const matPalettes = {
  'default-mat': ['#687149', '#929c69', '#4b563d', '#bbc091'],
  rug: ['#795668', '#b2818b', '#513d51', '#d9b7a3'],
  'shrine-mat': ['#617d5e', '#91a176', '#354f43', '#d6c795'],
  'tea-mat': ['#b69b67', '#d2b884', '#5d7358', '#eee0b2'],
  'sakura-mat': ['#b17b95', '#d2a1af', '#79546e', '#ecd0be'],
  'moon-mat': ['#676992', '#9995ba', '#3e476e', '#d9c7a6'],
};

function matArt(id) {
  const [base, edging, shade, motif] = matPalettes[id] || matPalettes['default-mat'];
  let s = P('M16 0h148v4h10v6h6v35h-8v6h-10v4H18v-4H8v-6H0V10h8V4h8z', shade) +
    P('M20 3h140v5h12v6h5v28h-9v6h-10v4H22v-4H12v-6H3V14h9V8h8z', edging) +
    P('M23 10h134v4h10v28h-10v4H23v-4H13V14h10z', base);
  for (let y = 16; y <= 40; y += 6) s += R(20, y, 140, 1, shade);
  if (id === 'default-mat') {
    for (let x = 26; x < 160; x += 14) s += R(x, 13, 1, 29, edging);
  } else if (id === 'rug') {
    s += P('M88 16h4v5h16v4h12v5h-12v4H92v5h-4v-5H72v-4H60v-5h12v-4h16z', motif);
    [30, 146].forEach(x => { s += P(`M${x} 20h4v5h5v5h-5v5h-4v-5h-5v-5h5z`, edging); });
  } else if (id === 'shrine-mat') {
    s += P('M74 15h8l8 7 8-7h8v14h-5v7H79v-7h-5z', motif) + R(81, 25, 3, 3, shade) + R(96, 25, 3, 3, shade) + R(88, 31, 4, 3, shade);
    s += R(28, 24, 25, 2, edging) + R(126, 24, 25, 2, edging) + R(36, 30, 17, 2, edging) + R(126, 30, 17, 2, edging);
  } else if (id === 'tea-mat') {
    s += R(16, 13, 9, 31, shade) + R(155, 13, 9, 31, shade);
    for (let x = 30; x < 154; x += 8) s += R(x, 12, 2, 32, edging);
    for (let y = 17; y < 42; y += 8) s += R(18, y, 5, 3, motif) + R(157, y, 5, 3, motif);
  } else if (id === 'sakura-mat') {
    s += at(70, 16, P('M14 0h12v6h14v8H30v8H14v-4H2v-8H0V6h14z', motif) + R(15, 9, 9, 5, edging));
    s += flower(31, 21, motif, .55) + flower(138, 20, motif, .55);
  } else {
    s += P('M92 13h15v5H94v5h-5v9h7v5h-15v-5h-7v-9h7v-5h11z', motif) + sparkle(57, 22, motif) + sparkle(121, 22, motif);
    [28, 146].forEach(x => { s += R(x, 27, 3, 3, motif); });
  }
  return s;
}

const outfitPalette = {
  base: ['#818963', '#665364', '#c9cba6'], miko: ['#e0d9c4', '#aa5865', '#bb7775'], school: ['#59647c', '#55556e', '#dacdaf'],
  yukata: ['#897091', '#6b506e', '#d7ac88'], garden: ['#92a079', '#647952', '#e4d7ac'], moon: ['#7b82b0', '#5d648e', '#d7c8a5'],
};
function outfitArt(id) {
  const key = id.replace(/^outfit-/, ''), [top, bottom, trim] = outfitPalette[key] || outfitPalette.base;
  let s = P('M53 29h9v5h8v14h-4v8H50v-8h4V37h-1z', '#a58358') + P('M61 33h7v11h-4v6h-7V37h4z', '#edd9a7');
  s += P('M25 29h28v6h7v17H18V35h7z', ink) + P('M26 31h25v5h6v14H21V36h5z', top) + P('M26 46h26l4 11H22z', bottom);
  s += R(29, 57, 6, 5, '#b6a18b') + R(43, 57, 6, 5, '#b6a18b') + R(28, 61, 8, 3, '#4a3d41') + R(42, 61, 8, 3, '#4a3d41');
  s += P('M24 3h6l8 9h4l8-9h6v21h-4v9H28v-9h-4z', ink) + P('M27 6h3l7 10h6l7-10h3v16h-4v8H31v-8h-4z', '#d6b67e');
  s += P('M30 15h20v12h-4v5H34v-5h-4z', '#efdcb5') + R(27, 7, 3, 9, '#b1857b') + R(50, 7, 3, 9, '#b1857b') + R(33, 21, 3, 4, ink) + R(44, 21, 3, 4, ink) + R(38, 28, 4, 2, '#b88376');
  s += R(31, 26, 4, 2, '#ddb3a1') + R(46, 26, 4, 2, '#ddb3a1') + R(27, 16, 5, 11, '#c4a271') + R(49, 16, 5, 11, '#c4a271');
  if (key === 'miko') s += P('M29 32h6l5 9 5-9h6l-8 14h-6z', trim) + R(30, 44, 20, 4, '#ba6f79') + R(18, 38, 5, 11, '#eee4d2') + R(55, 38, 5, 11, '#eee4d2');
  else if (key === 'school') s += P('M28 33h7l5 6 5-6h7l-9 10h-6z', trim) + P('M36 39h8v4h-3v7h-3v-7h-2z', '#bf7c81') + R(24, 50, 30, 2, '#89899a');
  else if (key === 'yukata') s += P('M29 32h5l12 12h-6z', trim) + R(25, 43, 29, 6, '#cbad85') + flower(46, 35, '#d9becb', .32) + flower(29, 50, '#c8a8bf', .3);
  else if (key === 'garden') s += R(30, 32, 4, 16, '#627d54') + R(46, 32, 4, 16, '#627d54') + R(31, 41, 18, 10, '#5e7850') + R(35, 44, 10, 5, '#9aac7b');
  else if (key === 'moon') s += P('M27 31h8l5 8 5-8h8l4 22h-9V40l-8 7-8-7v13h-9z', '#9ca0c4') + R(27, 49, 7, 2, trim) + R(48, 49, 7, 2, trim) + sparkle(39, 40, trim);
  else s += R(38, 33, 3, 14, trim) + R(41, 36, 2, 2, '#515d42') + R(41, 42, 2, 2, '#515d42') + R(25, 44, 8, 3, '#64714f');
  return s;
}

const aliases = { 'manga-stack': 'manga', 'manga-stacks': 'manga', 'floor-rug': 'rug', 'round-glasses': 'glasses', 'festival-mask': 'mask', 'favorite-food': 'matcha', 'reading-break': 'stroll', 'moon-ribbon': 'ribbon', 'weekly-bookmark': 'bookmark' };

/** These furnishings have a persistent on/off state instead of a simple wiggle. */
export const LIGHT_DECOR_IDS = Object.freeze(['shrine-lantern', 'sakura-lantern', 'moon-lamp']);

function furnishingArt(id, { active = true } = {}) {
  let body = furnishings[id]();
  if (!LIGHT_DECOR_IDS.includes(id)) return body;
  if (active) {
    const halo = id === 'shrine-lantern'
      ? P('M29 31h52v7h8v24h-8v9H29v-9h-8V38h8z', '#dfc987')
      : id === 'sakura-lantern'
        ? P('M24 21h62v8h9v33h-9v10H24V62h-9V29h9z', '#f0c5b2')
        : P('M32 6h52v9h11v31H84v15H32v-9H20V18h12z', '#c7cce8');
    return `<g opacity=".11">${halo}</g>` + body;
  }
  const palette = id === 'shrine-lantern'
    ? { '#c6a673': '#788174', '#ebd099': '#919581', '#eddfab': '#9ba38d', '#f9efd0': '#adb09a' }
    : id === 'sakura-lantern'
      ? { '#efd2b2': '#a3939c', '#f8e2c4': '#b6a6af', '#cfa38f': '#8a7e8d', '#d2a392': '#887e8b', '#bc819b': '#8c6e85', '#f3d7a6': '#b8a196' }
      : { '#cdbb90': '#99959e', '#f1dfad': '#b8b2bb', '#8f96c5': '#656e89', '#d4dcef': '#929cad', '#a4a7ca': '#777e99', '#dfcca8': '#b0a399' };
  for (const [lit, unlit] of Object.entries(palette)) body = body.replaceAll(lit, unlit);
  if (id === 'moon-lamp') body = body.replace(sparkle(81, 11, '#d9c9a4'), '').replace(sparkle(12, 43, '#b6c0e0'), '');
  return body;
}

/** Catalog thumbnails always use the same transparent 80 × 64 viewport. */
export function itemArt(id) {
  id = aliases[id] || id;
  let body;
  if (String(id).startsWith('room-')) body = R(2, 7, 76, 48, ink) + roomArt(id).replace('<svg ', '<svg x="4" y="9" width="72" height="44" ') + R(6, 55, 68, 2, '#7c7260');
  else if (String(id).startsWith('outfit-')) body = outfitArt(id);
  else if (matPalettes[id]) body = at(3, 21, matArt(id), .41);
  else if (furnishings[id]) body = `<svg x="7" y="3" width="66" height="60" viewBox="0 0 110 100">${furnishingArt(id)}</svg>`;
  else body = (art[id] || art.bookmark)();
  return wrap(body);
}

/** Native furniture art; all rug variants have exactly the same footprint. */
export function decorArt(id, { active = true } = {}) {
  id = aliases[id] || id;
  if (matPalettes[id]) return wrap(matArt(id), 180, 55);
  if (furnishings[id]) return wrap(furnishingArt(id, { active }), 110, 100);
  return wrap('', 110, 100);
}

const badgeNames = ['leaf', 'fox', 'pages', 'lantern', 'sakura', 'torii', 'star', 'moon', 'celestial', 'ninetail'];
const badgeColors = [
  ['#6d7a53', '#aeba85', '#d9dfb7'], ['#aa7e51', '#d4ad75', '#f3dfb0'], ['#667f83', '#9eb4b1', '#e1e6ce'], ['#987053', '#d6b074', '#f5dda4'],
  ['#926179', '#ce9dae', '#f2d4d7'], ['#935b58', '#c58c79', '#f2d4a7'], ['#76658e', '#b29ac3', '#e5d7ea'], ['#596c96', '#9baed0', '#e0e7ec'],
  ['#696496', '#b2aed4', '#f0deae'], ['#876889', '#d0a8bc', '#f6e3b2'],
];
function foxCrest() { return P('M4 0h6l10 9L30 0h6v19h-5v8h-8v4h-6v-4H9v-8H4z', '#f0d7a7') + R(10, 12, 4, 5, '#594653') + R(26, 12, 4, 5, '#594653') + P('M17 20h6v4h-6z', '#9c6c70') + R(5, 3, 4, 7, '#bd8a83') + R(31, 3, 4, 7, '#bd8a83'); }

/** Ten distinct readable fox-guild crests, accepting either tier 1–10 or name. */
export function badgeArt(tier = 1) {
  const index = typeof tier === 'string' && badgeNames.includes(tier) ? badgeNames.indexOf(tier) : Math.min(9, Math.max(0, Math.floor(Number(tier) || 1) - 1));
  const [base, edge, highlight] = badgeColors[index];
  let s = '';
  if (index >= 4) s += P('M10 40H4V24h6v8h5v24h-5zM70 40h6V24h-6v8h-5v24h5zM10 56h8v8h8v6H14v-6h-4zM70 56h-8v8h-8v6h12v-6h4z', edge);
  if (index >= 6) s += P('M4 20h6v-6h6v6h6v6h-6v6h-6v-6H4zM58 20h6v-6h6v6h6v6h-6v6h-6v-6h-6z', highlight);
  if (index >= 8) s += P('M26 8V0h7v5h14V0h7v8h-7v5H33V8zM34 70h12v10H34z', highlight);
  s += P('M14 10h12l14 10 14-10h12v34h-4v12H52v10H28V56H18V44h-4z', '#302d3c');
  s += P('M18 14h8l14 10 14-10h8v28h-4v12h-8v8H30v-8h-8V42h-4z', edge);
  s += P('M23 21h5l12 9 12-9h5v20h-4v11h-8v5H35v-5h-8V41h-4z', base);
  s += R(20, 17, 3, 16, highlight) + R(57, 17, 3, 16, highlight);
  if (index === 0) s += P('M32 30h22v8h-5v7H39v7h-5V40h-8v-5h6z', highlight) + P('M34 38h4v12h-4zM38 34h8v4h-8z', base);
  else if (index === 1) s += at(20, 29, foxCrest(), 1);
  else if (index === 2) s += P('M25 31h12v4h6v-4h12v20H44v4h-8v-4H25z', highlight) + R(38, 35, 4, 18, base) + R(28, 36, 7, 2, edge) + R(46, 36, 7, 2, edge) + R(28, 42, 7, 2, edge) + R(46, 42, 7, 2, edge);
  else if (index === 3) s += R(32, 26, 16, 4, highlight) + P('M30 31h20v5h4v12h-4v5H30v-5h-4V36h4z', highlight) + R(36, 33, 8, 18, edge) + R(32, 54, 16, 3, highlight) + R(38, 57, 4, 5, highlight);
  else if (index === 4) s += at(26, 30, P('M9 0h10v6h10v9h-8v10H11v-5H2V9H0V4h9z', highlight) + R(11, 10, 7, 7, edge));
  else if (index === 5) s += P('M24 29h32v5H24zM28 34h5v22h-5zM47 34h5v22h-5zM25 39h30v4H25z', highlight) + R(38, 34, 4, 8, edge);
  else if (index === 6) s += P('M37 27h6v8h10v6h-7v10h-5v-5h-4v5h-5V41h-7v-6h12z', highlight) + R(38, 37, 4, 5, edge);
  else if (index === 7) s += P('M39 28h12v5h-9v7h-4v8h12v5H35v-5h-6V36h5v-5h5z', highlight) + sparkle(51, 32, highlight);
  else if (index === 8) s += P('M28 31h24v4h5v14h-5v5H28v-5h-5V35h5z', edge) + P('M34 30h12v27H34z', base) + P('M24 39h33v6H24z', base) + sparkle(39, 32, highlight) + sparkle(23, 44, highlight) + sparkle(53, 46, highlight);
  else {
    s += P('M20 27h7v10h5V25h6v12h4V25h6v12h5V27h7v15h-5v12H25V42h-5z', highlight);
    s += at(24, 34, foxCrest(), .8) + R(26, 59, 28, 3, highlight);
  }
  if (index >= 3) s += P('M33 63h14v6h-5v5h-4v-5h-5z', highlight);
  return wrap(s, 80, 80);
}
