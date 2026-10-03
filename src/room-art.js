/** Native pixel dioramas. All rooms and furniture share one 640 × 360 world. */
export const ROOM_LAYOUT = Object.freeze({
  rug: Object.freeze({ x: 230, y: 274, width: 180, height: 55 }),
  left: Object.freeze({ x: 58, y: 218, width: 110, height: 90 }),
  right: Object.freeze({ x: 477, y: 207, width: 108, height: 98 }),
});

/** Tappable architecture, in the same world coordinates as the furniture.
 * A window action opens or closes its curtains/shoji; light actions toggle
 * the room's matching fixtures together. The host provides semantic buttons. */
export const ROOM_INTERACTIONS = Object.freeze({
  nook: Object.freeze([
    Object.freeze({ x: 156, y: 44, width: 72, height: 128, action: 'window', label: 'curtains' }),
    Object.freeze({ x: 392, y: 58, width: 90, height: 58, action: 'light', label: 'pendant light' }),
  ]),
  shrine: Object.freeze([
    Object.freeze({ x: 56, y: 66, width: 48, height: 68, action: 'light', label: 'shrine lanterns' }),
    Object.freeze({ x: 536, y: 66, width: 48, height: 68, action: 'light', label: 'shrine lanterns' }),
  ]),
  tearoom: Object.freeze([
    // The mascot owns the center of the room. Put targets on both door edges
    // so pointer/keyboard activation remains clear of her canvas on mobile.
    Object.freeze({ x: 190, y: 56, width: 50, height: 154, action: 'window', label: 'shoji doors (left edge)' }),
    Object.freeze({ x: 400, y: 56, width: 50, height: 154, action: 'window', label: 'shoji doors (right edge)' }),
    Object.freeze({ x: 278, y: 14, width: 76, height: 34, action: 'light', label: 'paper pendant' }),
  ]),
  sakura: Object.freeze([
    Object.freeze({ x: 93, y: 106, width: 49, height: 71, action: 'light', label: 'garden lanterns' }),
    Object.freeze({ x: 498, y: 106, width: 49, height: 71, action: 'light', label: 'garden lanterns' }),
  ]),
  moon: Object.freeze([
    Object.freeze({ x: 172, y: 70, width: 58, height: 134, action: 'window', label: 'observatory curtains (left edge)' }),
    Object.freeze({ x: 410, y: 70, width: 58, height: 134, action: 'window', label: 'observatory curtains (right edge)' }),
  ]),
});

const r = (x, y, w, h, color, opacity = 1) => `<path fill="${color}" opacity="${opacity}" d="M${x} ${y}h${w}v${h}H${x}z"/>`;
const p = (d, color, opacity = 1) => `<path fill="${color}" opacity="${opacity}" d="${d}"/>`;
const group = (x, y, content, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})">${content}</g>`;
const star = (x, y, color = '#e5d8ac', size = 1) => group(x, y, p('M4 0h2v4h4v2H6v4H4V6H0V4h4z', color), size);
const blossom = (x, y, color = '#d7a2b4', core = '#f4d4bc', scale = 1) => group(x, y, p('M6 0h6v4h6v6h-4v6h-6v-2H2v-6H0V4h6z', color) + r(6, 6, 4, 4, core), scale);
const moon = (x, y, color = '#eaddae', shade = '#cfbfa0', scale = 1) => group(x, y,
  p('M12 0h24v4h8v8h4v24h-4v8h-8v4H12v-4H4v-8H0V12h4V4h8z', color) + p('M4 28h4v8h8v6h20v6H12v-4H4zM30 8h8v8h-8zM18 20h8v4h-8z', shade), scale);
const cloud = (x, y, color, scale = 1) => group(x, y, p('M0 14h14V8h14V0h24v6h18v8h14v8H0z', color), scale);
const canopy = (x, y, color, light, scale = 1) => group(x, y,
  p('M20 0h64v8h28v12h14v32h-16v10H88v10H26V62H6V52H0V20h20z', color) +
  p('M26 6h54v6h24v8H62v-4H22v12H8v-8h18zM92 48h20v6H92zM20 50h28v6H20z', light), scale);

function woodFloor(base = '#63483e', light = '#795647', seam = '#433337') {
  let s = r(0, 245, 640, 115, base) + r(0, 245, 640, 7, '#2a272d');
  for (let row = 0; row < 5; row++) {
    const y = 252 + row * 25;
    s += r(0, y, 640, 2, light) + r(0, y + 23, 640, 2, seam);
    for (let x = row % 2 ? 64 : 0; x < 640; x += 128) {
      s += r(x, y, 2, 23, seam) + r(x + 18, y + 10, 38, 2, light, .45) + r(x + 72, y + 16, 20, 2, seam, .4);
    }
  }
  return s + r(0, 352, 640, 8, seam, .45);
}

function hangingLantern(x, y, color = '#d7ae6c', dark = '#745442', lightOn = true) {
  const glow = lightOn ? p('M2 27h44v7h8v32h-8v10H2V66h-8V34h8z', color, .09) + r(8, 75, 32, 18, color, .045) : '';
  return group(x, y, glow + r(23, 0, 2, 24, dark) + r(12, 24, 24, 5, '#42342e') +
    p('M10 30h28v6h6v28h-6v6H10v-6H4V36h6z', lightOn ? color : '#797b66') +
    r(10, 34, 6, 28, lightOn ? '#efd29a' : '#989a80') + r(28, 34, 6, 28, lightOn ? '#bd8c57' : '#5e6458') +
    r(4, 42, 40, 2, dark, .25) + r(4, 54, 40, 2, dark, .25) +
    r(12, 70, 24, 4, '#42342e') + r(22, 74, 4, 10, dark) + r(18, 84, 12, 4, color));
}

function shrine({ lightOn = true } = {}) {
  let s = r(0, 0, 640, 360, '#23372f') + r(28, 24, 584, 210, '#344b42');
  s += moon(430, 34, '#e1d5a5', '#bbbc95', .7) + cloud(192, 42, '#58685b', 1.7) + cloud(360, 93, '#475c50', 1.4);
  s += p('M0 132h26v-14h34v-18h48v16h48v-18h36v-8h34v16h40v-10h60v10h40V90h62v14h46v16h52v-14h50v18h64v112H0z', '#2d5142');
  // Distant trunks and uneven emerald foliage frame the small shrine gate.
  [74, 154, 438, 534, 588].forEach((x, i) => { s += r(x, 56, 10 + i % 2 * 4, 156, '#294137') + r(x + 2, 56, 2, 130, '#55705a'); });
  s += canopy(-44, -20, '#223c31', '#37523a', 1.5) + canopy(65, 2, '#33533d', '#4b6849', 1.15) + canopy(474, -20, '#294533', '#3e6042', 1.6);
  s += canopy(-40, 118, '#294932', '#47653f', 1.25) + canopy(506, 122, '#2d4d38', '#536d48', 1.18);
  // Vermilion torii stands beyond the veranda, never in an equipment slot.
  s += group(246, 87, p('M0 0h146v8h-12v6H12V8H0z', '#342e2c') + r(8, 8, 130, 8, '#b5765c') + r(22, 16, 12, 100, '#975c4e') + r(112, 16, 12, 100, '#975c4e') + r(18, 36, 110, 8, '#b77758') + r(24, 18, 4, 92, '#c08b66') + r(114, 18, 4, 92, '#c08b66') + r(68, 14, 12, 30, '#d6b17a') + r(72, 18, 4, 18, '#715548') + r(20, 112, 16, 6, '#4c4940') + r(110, 112, 16, 6, '#4c4940'));
  s += p('M290 206h58l28 30h-114z', '#7a8061') + p('M308 166h22v14h8v14h10v12h-58v-12h10v-14h8z', '#66755d');
  s += r(26, 214, 588, 24, '#3b4938') + r(30, 220, 576, 4, '#596647');
  // Veranda posts, header, and a braided shimenawa rope.
  s += r(0, 0, 640, 22, '#302e29') + r(0, 22, 640, 7, '#9a7955') + r(0, 29, 640, 8, '#534536');
  s += r(18, 34, 18, 208, '#644d3d') + r(22, 34, 4, 208, '#987551') + r(604, 34, 18, 208, '#644d3d') + r(608, 34, 4, 208, '#987551');
  s += p('M40 40h82v4h84v4h90v4h56v-4h84v-4h88v-4h76v6h-76v4h-88v4h-84v4h-56v-4h-90v-4h-84v-4H40z', '#a99466');
  [156, 242, 394, 476].forEach(x => { s += p(`M${x} 48h8v10h8v10h-8v12h-8V66h-8v-8h8z`, '#e5ddbf'); });
  s += hangingLantern(56, 44, '#d7ae6c', '#745442', lightOn) + hangingLantern(536, 44, '#d7ae6c', '#745442', lightOn);
  s += r(32, 234, 576, 5, '#ad8759') + r(32, 239, 576, 6, '#4a3c31') + woodFloor('#6c5140', '#89664a', '#4a3b33');
  [[182, 154], [438, 171], [215, 105], [403, 204], [154, 200]].forEach(([x, y]) => { s += star(x, y, '#d0c87f', .6); });
  return s;
}

function tearoom({ windowOpen = true, lightOn = true } = {}) {
  let s = r(0, 0, 640, 360, '#655340') + r(18, 20, 604, 224, '#9c9271');
  s += r(28, 28, 584, 196, '#a79a76') + r(32, 30, 576, 4, '#c0b08c');
  // Central garden opening; the room itself is an architectural tatami base.
  s += r(204, 38, 232, 184, '#433e35') + r(212, 46, 216, 168, '#5f7565');
  s += moon(342, 57, '#e4d7ad', '#c6c397', .62) + cloud(222, 74, '#819083', 1.2);
  s += p('M212 148h18v-12h28v-10h30v6h28v-12h24v10h24v-12h30v10h34v86H212z', '#48634f');
  s += p('M212 166h24v-12h28v8h28v-8h30v12h38v-10h34v10h34v48H212z', '#354d40');
  s += p('M240 208h152v-8h-20v-12h-18v-8h-62v8h-24v12h-28z', '#8d9280');
  s += r(268, 203, 102, 3, '#bdba95') + r(290, 188, 62, 3, '#a7aa88');
  s += group(225, 100, r(28, 0, 6, 74, '#4c5141') + p('M30 30H8V20h4v4h22V12h22v6H36v22H20v-6h10z', '#4c5141') + canopy(0, 4, '#687c57', '#87936c', .52));
  if (!windowOpen) {
    // The center pair slides together, matching the existing paper lattice.
    s += r(212, 46, 216, 168, '#b6ad8b');
    for (let x = 212; x < 428; x += 27) s += r(x, 46, 4, 168, '#8b7657') + r(x + 4, 47, 22, 2, '#d8caa7');
    for (let y = 74; y < 214; y += 28) s += r(212, y, 216, 4, '#8b7657');
    s += r(316, 46, 8, 168, '#725d45') + r(313, 121, 3, 20, '#4d4435') + r(324, 121, 3, 20, '#4d4435');
  }
  // Two symmetrical shoji panels, with warm paper and fine wood lattice.
  for (const x of [44, 454]) {
    s += r(x, 40, 142, 182, '#584536') + r(x + 6, 46, 130, 170, '#c5b792');
    for (let y = 50; y < 214; y += 32) s += r(x + 6, y, 130, 2, '#d9c9a5');
    for (let xx = x + 8; xx < x + 138; xx += 32) s += r(xx, 46, 4, 170, '#8b7657');
    for (let y = 72; y < 215; y += 32) s += r(x + 6, y, 130, 4, '#8b7657');
    s += r(x + 128, 128, 4, 16, '#4b4033');
  }
  s += r(194, 34, 10, 194, '#765b41') + r(436, 34, 10, 194, '#765b41');
  s += r(18, 16, 604, 12, '#564435') + r(22, 28, 596, 4, '#947353') + r(18, 225, 604, 20, '#66523c') + r(22, 227, 596, 4, '#a88a5d');
  s += r(0, 0, 20, 246, '#3b342c') + r(620, 0, 20, 246, '#3b342c');
  s += r(0, 245, 640, 115, '#95916a');
  // Every seam is part of the tatami flooring, rather than an equipped mat.
  for (let y = 250; y < 360; y += 4) s += r(0, y, 640, 1, '#b0a67b', .45);
  s += r(0, 245, 640, 7, '#4c543f') + r(0, 298, 640, 6, '#4c543f') + r(206, 252, 6, 46, '#4c543f') + r(428, 252, 6, 46, '#4c543f') + r(108, 304, 6, 56, '#4c543f') + r(526, 304, 6, 56, '#4c543f');
  s += r(0, 251, 640, 2, '#697151') + r(0, 302, 640, 2, '#697151') + r(0, 355, 640, 5, '#555640');
  // A light overhead shade and a small wall scroll remain above furniture.
  if (lightOn) s += p('M290 44h52l32 64H258z', '#efd4a0', .045);
  s += r(314, 0, 4, 15, '#514133') + r(292, 16, 48, 6, '#745e44') + p('M288 22h56v8h8v16h-72V30h8z', lightOn ? '#d6bd87' : '#9e9475') + r(286, 40, 60, 4, lightOn ? '#f0d9a0' : '#b1a683');
  s += r(26, 70, 8, 110, '#65523e') + r(606, 70, 8, 110, '#65523e');
  return s;
}

function sakura({ lightOn = true } = {}) {
  let s = r(0, 0, 640, 360, '#615367') + r(0, 74, 640, 110, '#7a6376') + r(0, 132, 640, 108, '#a37b86');
  s += moon(414, 36, '#f0d9bf', '#d7b99f', .85) + cloud(166, 50, '#a18897', 1.8) + cloud(410, 102, '#b1919d', 1.3);
  s += p('M0 169h36v-12h32v8h40v-14h46v6h28v-14h44v8h44v-18h50v14h44v-8h44v12h32v-14h42v14h32v-4h46v8h36v-10h44v18h40v-8h24v71H0z', '#6b6572');
  s += r(0, 194, 640, 48, '#657b7d') + r(0, 202, 640, 3, '#96a1a0', .5) + r(188, 220, 130, 3, '#b3aea3', .5) + r(374, 212, 104, 3, '#a8a0a1', .5);
  // A low arched garden bridge on the far side of the pond.
  s += p('M252 190h12v-12h14v-8h20v-4h44v4h20v8h14v12h12v6h-18v-12h-16v-8h-66v8h-16v12h-20z', '#614f57') + r(290, 174, 60, 4, '#c59b91');
  for (const x of [266, 288, 310, 332, 354, 374]) s += r(x, x < 280 || x > 366 ? 184 : 176, 3, 18, '#694e55');
  // Two sculptural trunks carry an arch of stepped blossom clusters.
  s += p('M12 238V116h8V80h12V44h14v30h18V48h42V34h46v10h-40v14H78v32H54v46H42v56h-8v46z', '#443a43');
  s += p('M18 234V126h8V92h12V62h6v48H32v74h-6v50z', '#745762');
  s += p('M612 240V138h-10V90h-18V68h-34V52h-46V36h-32V26h44v12h46v14h36v24h18v40h14v124z', '#493c46');
  s += p('M618 230V140h-12V96h-10V74h-18v-8h24v22h12v38h10v104z', '#795864');
  s += canopy(-40, -12, '#af778f', '#d3a0af', 1.25) + canopy(70, -20, '#bc879b', '#e3b2bd', 1.3) + canopy(216, -45, '#ab778f', '#cd92a8', 1.05);
  s += canopy(362, -44, '#b57f9a', '#d7a4b7', 1.3) + canopy(480, -16, '#c08ba3', '#e2b4c0', 1.4) + canopy(563, 51, '#a7728b', '#ce94a9', 1);
  s += canopy(-78, 76, '#ae7c94', '#d7a7b4', 1) + canopy(37, 43, '#be899e', '#e0afba', .64);
  [[38, 29], [94, 45], [154, 20], [205, 13], [528, 30], [580, 73], [495, 7], [84, 79]].forEach(([x, y]) => { s += blossom(x, y, '#e7bbc5', '#f0d7bd', .7); });
  // A pair of paper lights hangs from the low branches, above the furniture.
  s += hangingLantern(93, 84, '#dfb2b0', '#775764', lightOn) + hangingLantern(498, 84, '#dfb2b0', '#775764', lightOn);
  // Stone terrace. Furniture is placed on this plane, never over a second rug.
  s += r(0, 240, 640, 120, '#8a7c83') + r(0, 240, 640, 5, '#b5a0a2') + r(0, 245, 640, 5, '#655d69');
  for (let row = 0; row < 4; row++) {
    const y = 252 + row * 30;
    s += r(0, y + 28, 640, 3, '#69636f') + r(0, y, 640, 2, '#a19498');
    for (let x = row % 2 ? 56 : 126; x < 640; x += 140) s += r(x, y, 3, 29, '#69636f') + r(x + 10, y + 4, 24, 2, '#b0a1a1', .4);
  }
  [[172, 90], [238, 135], [445, 149], [400, 74], [192, 213], [466, 240], [49, 315], [611, 296], [408, 338]].forEach(([x, y], i) => { s += p(`M${x} ${y}h6v4h-2v2h-6v-4h2z`, i % 2 ? '#edbcca' : '#d79fb5'); });
  return s;
}

function observatory({ windowOpen = true } = {}) {
  let s = r(0, 0, 640, 360, '#383a57') + r(12, 14, 616, 230, '#474661');
  // Pixel-stepped vaulted opening looking into a violet night.
  s += p('M110 224V68h10V48h18V30h24V16h36V6h244v10h36v14h24v18h18v20h10v156z', '#242b48');
  s += p('M124 218V70h10V52h16V36h24V24h34V16h224v8h34v12h24v16h16v18h10v148z', '#303854');
  s += p('M124 154h44v-18h34v-12h40v8h42v-14h46v6h42v-18h42v10h42v-8h36v18h28v92H124z', '#444a6b');
  s += p('M124 184h48v-8h30v-8h36v12h40v-6h38v-14h44v10h48v-8h32v18h42v-8h34v46H124z', '#39405e');
  s += moon(370, 48, '#e9e5d4', '#b4b5ca', 1.32);
  // Thin constellation links with small, readable diamond stars.
  s += p('M190 72h28v2h-28zM218 72h2v28h-2zM220 100h34v2h-34zM254 100h2v26h-2zM256 126h42v2h-42z', '#7280a1', .55);
  [[185, 67], [214, 68], [216, 96], [250, 95], [252, 122], [294, 122]].forEach(([x, y]) => { s += star(x, y, '#cbd6e1', .75); });
  [[156, 48], [300, 36], [352, 82], [466, 142], [182, 142], [324, 172], [478, 72], [292, 90], [416, 184], [222, 194]].forEach(([x, y], i) => { s += r(x, y, i % 3 === 0 ? 3 : 2, 2, '#d5d8df'); });
  s += cloud(145, 157, '#65708a', 1.4) + cloud(342, 181, '#555f7d', 1.4);
  if (!windowOpen) {
    // Heavy velvet follows the stepped vault and parts along a narrow seam.
    s += p('M124 218V70h10V52h16V36h24V24h34V16h224v8h34v12h24v16h16v18h10v148z', '#63536f');
    s += p('M132 218V70h10V54h16V38h24V26h32V18h26v200zM278 18h24v200h-24zM340 18h24v200h-24zM404 18h24v8h30v12h24v16h16v16h10v148H404z', '#76627f');
    s += p('M152 64h6v152h-6zM204 34h6v182h-6zM258 20h6v196h-6zM378 20h6v196h-6zM436 38h6v178h-6zM488 64h6v152h-6z', '#a28a9e');
    s += r(317, 18, 6, 198, '#3e3b58') + r(124, 212, 392, 6, '#b7a4ad') + r(128, 208, 388, 4, '#7d6886');
    s += star(175, 170, '#c3b294', .65) + star(245, 148, '#c3b294', .65) + star(390, 150, '#c3b294', .65) + star(459, 170, '#c3b294', .65);
  }
  // Tall masonry and inset celestial wall plaques stay clear of decor anchors.
  for (const x of [24, 540]) {
    s += r(x, 24, 74, 218, '#54516d') + r(x + 6, 28, 8, 210, '#71677f') + r(x + 64, 26, 8, 214, '#31324c');
    for (let y = 42; y < 240; y += 34) s += r(x + 6, y, 58, 3, '#383952');
    s += r(x + 16, 62, 42, 70, '#292f4a') + r(x + 20, 66, 34, 62, '#424865');
    s += group(x + 30, 82, p('M8 0h6v10h10v6H14v12H8V16H0v-6h8z', '#c7b99f'));
    s += r(x + 14, 134, 48, 4, '#9a8d91');
  }
  s += r(0, 0, 640, 8, '#24283e') + r(0, 8, 640, 4, '#78738a') + r(108, 218, 424, 10, '#7c7184') + r(108, 228, 424, 12, '#343951');
  s += r(0, 240, 640, 120, '#4d526f') + r(0, 240, 640, 8, '#918596');
  for (let row = 0; row < 4; row++) {
    const y = 250 + row * 30;
    s += r(0, y, 640, 2, '#676982') + r(0, y + 28, 640, 2, '#363d5c');
    for (let x = row % 2 ? 80 : 0; x < 640; x += 160) s += r(x, y, 2, 30, '#363d5c');
  }
  // Brass inlay at the perimeter; the center remains an empty floor.
  s += r(20, 260, 600, 2, '#ae9e87', .4) + r(20, 343, 600, 2, '#ae9e87', .4) + p('M20 260h2v83h-2zM618 260h2v83h-2z', '#ae9e87', .4);
  s += star(185, 313, '#aeb9cd', .7) + star(446, 279, '#c2bcae', .6) + star(38, 325, '#b6aec0', .65) + star(598, 324, '#b6aec0', .65);
  return s;
}

let roomInstance = 0;
function nook({ windowOpen = true, lightOn = true } = {}) {
  const prefix = `nook-${++roomInstance}`;
  let s = nookArtwork.replaceAll('id="wall"', `id="${prefix}-wall"`).replaceAll('id="floor"', `id="${prefix}-floor"`)
    .replaceAll('url(#wall)', `url(#${prefix}-wall)`).replaceAll('url(#floor)', `url(#${prefix}-floor)`);
  if (!lightOn) {
    s = s.replaceAll('fill="#ddb878" opacity=".04"', 'fill="#ddb878" opacity="0"').replaceAll('fill="#ddb878" opacity=".035"', 'fill="#ddb878" opacity="0"')
      .replaceAll('fill="#e9c684"', 'fill="#8e805f"').replaceAll('fill="#f5d997"', 'fill="#77715c"').replaceAll('fill="#d6ab6c" opacity=".25"', 'fill="#d6ab6c" opacity="0"');
  }
  if (!windowOpen) {
    s += r(34, 29, 302, 154, '#76535d') + r(36, 29, 10, 154, '#5a414d') + r(178, 29, 9, 154, '#493844') + r(328, 29, 8, 154, '#5a414d');
    for (let x = 50; x < 328; x += 24) s += r(x, 30, 6, 150, '#976b6b') + r(x + 8, 30, 7, 153, '#63434e');
    s += r(180, 29, 5, 154, '#493844') + r(34, 181, 144, 5, '#b58479') + r(187, 181, 149, 5, '#b58479');
    s += r(28, 24, 318, 4, '#8b664a') + r(24, 22, 8, 8, '#c59b64') + r(342, 22, 8, 8, '#c59b64');
  }
  return s;
}
const rooms = { nook, shrine, tearoom, sakura, moon: observatory };

/** Accept either a room key or the corresponding shop ID. The SVG is decorative. */
export function roomArt(roomId = 'nook', { windowOpen = true, lightOn = true } = {}) {
  const key = String(roomId).replace(/^room-/, '');
  const draw = Object.hasOwn(rooms, key) ? rooms[key] : rooms.nook;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" fill="none" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${draw({ windowOpen, lightOn })}</svg>`;
}

// Inline the original native artwork so light emission can be toggled without filters.
const nookArtwork = "<defs>\n    <pattern id=\"wall\" width=\"32\" height=\"32\" patternUnits=\"userSpaceOnUse\">\n      <path fill=\"#3b3337\" d=\"M0 0h32v32H0z\"/>\n      <path fill=\"#443a3e\" opacity=\".5\" d=\"M0 0h2v32H0zM16 0h2v32h-2z\"/>\n      <path fill=\"#665044\" opacity=\".14\" d=\"M8 8h2v2H8zM24 24h2v2h-2z\"/>\n    </pattern>\n    <pattern id=\"floor\" width=\"128\" height=\"32\" patternUnits=\"userSpaceOnUse\">\n      <path fill=\"#60433c\" d=\"M0 0h128v32H0z\"/>\n      <path fill=\"#715047\" d=\"M0 2h128v2H0z\"/>\n      <path fill=\"#4b3534\" d=\"M0 0h128v2H0zM0 30h128v2H0zM0 0h2v32H0z\"/>\n      <path fill=\"#845e4c\" opacity=\".38\" d=\"M16 12h42v2H16zM84 22h28v2H84zM66 7h20v2H66z\"/>\n      <path fill=\"#4b3534\" opacity=\".6\" d=\"M42 23h20v2H42zM92 12h14v2H92z\"/>\n    </pattern>\n  </defs>\n  <!-- A quiet room after the last chapter. Every form follows a 2px grid. -->\n  <path fill=\"#2b2730\" d=\"M0 0h640v360H0z\"/>\n  <path fill=\"url(#wall)\" d=\"M0 0h640v244H0z\"/>\n  <path fill=\"#29272e\" d=\"M0 0h640v8H0zM0 0h12v244H0zM628 0h12v244h-12z\"/>\n  <path fill=\"#75604f\" d=\"M12 10h616v4H12z\"/>\n  <path fill=\"#28242b\" d=\"M12 14h616v8H12z\"/>\n  <path fill=\"#4b3b3b\" d=\"M12 188h616v52H12z\"/>\n  <path fill=\"#62483f\" d=\"M12 188h616v6H12z\"/>\n  <path fill=\"#30292f\" d=\"M12 194h616v4H12z\"/>\n  <path fill=\"#3b3034\" d=\"M36 198h4v40h-4zM110 198h4v40h-4zM184 198h4v40h-4zM258 198h4v40h-4zM332 198h4v40h-4zM406 198h4v40h-4zM480 198h4v40h-4zM554 198h4v40h-4z\"/>\n  <path fill=\"#6f5145\" d=\"M12 236h616v6H12z\"/>\n  <path fill=\"#28242b\" d=\"M0 240h640v5H0z\"/>\n  <path fill=\"url(#floor)\" d=\"M0 245h640v115H0z\"/>\n  <path fill=\"#815a49\" opacity=\".4\" d=\"M0 252h640v4H0zM0 286h640v2H0zM0 318h640v2H0z\"/>\n  <path fill=\"#443033\" d=\"M64 250h2v36h-2zM320 250h2v36h-2zM574 250h2v36h-2zM190 288h2v30h-2zM448 288h2v30h-2zM64 320h2v40h-2zM320 320h2v40h-2zM576 320h2v40h-2z\"/>\n  <path fill=\"#382b31\" opacity=\".32\" d=\"M0 344h640v16H0zM0 250h16v94H0zM624 250h16v94h-16z\"/>\n  <!-- Deep, wooden window with pale moonlight and layered night hills. -->\n  <path fill=\"#27242c\" d=\"M44 26h278v164H44z\"/>\n  <path fill=\"#765749\" d=\"M48 28h270v156H48z\"/>\n  <path fill=\"#b48c61\" d=\"M52 32h262v4H52z\"/>\n  <path fill=\"#332b32\" d=\"M58 38h250v136H58z\"/>\n  <path fill=\"#303044\" d=\"M64 44h238v124H64z\"/>\n  <path fill=\"#35384a\" d=\"M64 92h238v76H64z\"/>\n  <path fill=\"#414153\" d=\"M64 116h238v52H64z\"/>\n  <path fill=\"#98917e\" opacity=\".08\" d=\"M198 54h52v2h8v8h4v24h-4v8h-8v4h-52v-4h-8v-8h-4V64h4v-8h8z\"/>\n  <path fill=\"#eee0aa\" d=\"M214 52h18v4h8v8h4v18h-4v8h-8v4h-18v-4h-8v-8h-4V64h4v-8h8z\"/>\n  <path fill=\"#d3c294\" d=\"M206 76h4v10h10v4h12v4h-18v-4h-8zM230 58h6v8h-6zM216 66h8v4h-8z\"/>\n  <path fill=\"#d7d1b4\" d=\"M92 60h2v2h-2zM122 84h2v2h-2zM170 56h2v2h-2zM274 72h2v2h-2zM250 110h2v2h-2zM192 112h2v2h-2zM80 108h2v2h-2z\"/>\n  <path fill=\"#aab3ae\" d=\"M144 66h2v6h-2zM142 68h6v2h-6zM284 94h2v6h-2zM282 96h6v2h-6z\"/>\n  <path fill=\"#626074\" opacity=\".8\" d=\"M74 82h12v-4h26v4h14v4h10v4H74zM224 100h28v-4h28v4h14v6h-70z\"/>\n  <path fill=\"#777084\" opacity=\".45\" d=\"M86 84h26v2H86zM238 100h40v2h-40z\"/>\n  <path fill=\"#495250\" d=\"M64 138h12v-6h16v-6h20v-6h28v4h18v8h22v8h20v-4h18v-8h24v-6h22v8h18v8h20v30H64z\"/>\n  <path fill=\"#343e43\" d=\"M64 154h20v-6h20v-8h22v-4h24v8h18v6h32v-4h22v-6h18v4h18v8h22v6h22v10H64z\"/>\n  <path fill=\"#24333a\" d=\"M64 164h34v-4h24v4h36v-6h28v2h32v4h34v-4h24v4h26v4H64z\"/>\n  <path fill=\"#a29d8b\" opacity=\".12\" d=\"M64 46h6v120h-6zM70 46h44v4H70z\"/>\n  <path fill=\"#302a31\" d=\"M178 38h12v136h-12zM58 110h250v10H58z\"/>\n  <path fill=\"#826451\" d=\"M180 38h4v136h-4zM58 112h250v4H58z\"/>\n  <path fill=\"#a18461\" d=\"M176 170h14v4h-14z\"/>\n  <path fill=\"#967154\" d=\"M40 180h290v8H40z\"/>\n  <path fill=\"#60473e\" d=\"M46 188h278v6H46z\"/>\n  <path fill=\"#372c31\" d=\"M52 194h266v4H52z\"/>\n  <!-- Soft, folded curtains hug the edges of the window. -->\n  <path fill=\"#30252f\" d=\"M28 22h42v168H28zM300 22h42v168h-42z\"/>\n  <path fill=\"#77535b\" d=\"M32 28h34v98h-4v20h-6v16h-6v24H32zM304 28h34v158h-18v-24h-6v-16h-6v-20h-4z\"/>\n  <path fill=\"#63434e\" d=\"M36 28h8v134h-4v24h-8V28zM56 28h6v112h-6zM310 28h8v112h-8zM326 28h8v158h-8z\"/>\n  <path fill=\"#976b6b\" d=\"M46 30h4v124h-4zM320 30h4v124h-4z\"/>\n  <path fill=\"#bc925a\" d=\"M30 150h24v6H30zM318 150h22v6h-22z\"/>\n  <path fill=\"#8b664a\" d=\"M28 24h318v4H28z\"/>\n  <path fill=\"#c59b64\" d=\"M24 22h8v8h-8zM342 22h8v8h-8z\"/>\n  <!-- A pendant lamp casts a restrained pool of amber light. -->\n  <path fill=\"#ddb878\" opacity=\".04\" d=\"M402 92h72l78 152H328z\"/>\n  <path fill=\"#ddb878\" opacity=\".035\" d=\"M414 98h48l50 146H366z\"/>\n  <path fill=\"#27252c\" d=\"M436 0h4v64h-4z\"/>\n  <path fill=\"#977249\" d=\"M436 4h2v60h-2z\"/>\n  <path fill=\"#29262b\" d=\"M426 62h24v8h12v12h12v14h-72V82h12V70h12z\"/>\n  <path fill=\"#8d7758\" d=\"M428 64h20v8h12v12h10v8h-64v-8h10V72h12z\"/>\n  <path fill=\"#b89a65\" d=\"M428 68h6v8h-12v10h-12v4h-4v-6h10V72h12z\"/>\n  <path fill=\"#6c5f4c\" d=\"M446 72h12v12h12v6h-14v-8h-10z\"/>\n  <path fill=\"#e9c684\" d=\"M402 92h72v4h-72z\"/>\n  <path fill=\"#f5d997\" d=\"M424 98h28v4h-28z\"/>\n  <path fill=\"#d6ab6c\" opacity=\".25\" d=\"M420 102h36v4h-36z\"/>\n  <!-- A few treasured books and pottery on wall-mounted ledges. -->\n  <path fill=\"#28252d\" d=\"M510 52h106v80H510z\"/>\n  <path fill=\"#5a403a\" d=\"M514 56h98v72h-98z\"/>\n  <path fill=\"#443437\" d=\"M518 60h90v58h-90z\"/>\n  <path fill=\"#82604b\" d=\"M508 122h110v8H508z\"/>\n  <path fill=\"#a88059\" d=\"M508 122h110v2H508z\"/>\n  <path fill=\"#30282d\" d=\"M514 130h98v6h-98z\"/>\n  <path fill=\"#878669\" d=\"M526 80h10v40h-10z\"/>\n  <path fill=\"#b7a078\" d=\"M526 84h10v4h-10zM528 108h6v2h-6z\"/>\n  <path fill=\"#a27067\" d=\"M538 88h12v32h-12z\"/>\n  <path fill=\"#d4a787\" d=\"M540 92h8v2h-8zM540 114h8v2h-8z\"/>\n  <path fill=\"#64566c\" d=\"m550 82 10-2 8 38-10 2z\"/>\n  <path fill=\"#b3a184\" d=\"m552 88 10-2 1 4-10 2z\"/>\n  <path fill=\"#29292e\" d=\"M578 98h22v20h-4v4h-14v-4h-4z\"/>\n  <path fill=\"#b58d71\" d=\"M580 100h18v16h-4v4h-10v-4h-4z\"/>\n  <path fill=\"#d1af86\" d=\"M582 102h4v12h-4z\"/>\n  <path fill=\"#565d46\" d=\"M588 80h4v20h-4zM580 82h8v8h-4v-4h-4zM592 74h8v8h-4v4h-4z\"/>\n  <path fill=\"#889367\" d=\"M576 80h8v4h4v4h-8v-4h-4zM594 72h8v6h-4v4h-6v-6h2z\"/>\n  <!-- A small print, brass pins, and hanging stars make the room lived-in. -->\n  <path fill=\"#29262d\" d=\"M544 156h58v68h-58z\"/>\n  <path fill=\"#88684f\" d=\"M548 158h50v62h-50z\"/>\n  <path fill=\"#b9a48b\" d=\"M552 162h42v54h-42z\"/>\n  <path fill=\"#bdaa87\" d=\"M556 166h34v46h-34z\"/>\n  <path fill=\"#60694f\" d=\"M560 196h4v-10h4v-8h6v8h4v10h4v8h-22z\"/>\n  <path fill=\"#8c815b\" d=\"M576 196h4v-10h4v10h4v8h-12z\"/>\n  <path fill=\"#78664d\" d=\"M556 204h34v4h-34zM568 204h4v8h-4z\"/>\n  <path fill=\"#eee0b4\" d=\"M580 170h6v6h-6z\"/>\n  <path fill=\"#99835e\" d=\"M482 26h2v26h-2zM466 26h32v2h-32zM466 28h2v10h-2zM496 28h2v14h-2z\"/>\n  <path fill=\"#c9ac75\" d=\"M480 52h6v4h4v4h-4v4h-6v-4h-4v-4h4zM466 38h2v4h4v2h-4v4h-2v-4h-4v-2h4zM494 42h6v4h-6z\"/>\n  <!-- Furnishings are rendered as separately equipped objects. -->\r\n  <path fill=\"#c7a078\" opacity=\".2\" d=\"M482 296h56v2h-56zM102 330h44v2h-44zM370 344h22v2h-22z\"/>\n  <path fill=\"#dab981\" opacity=\".55\" d=\"M380 148h2v6h-2zM378 150h6v2h-6zM490 202h2v2h-2zM130 214h2v2h-2zM464 274h2v2h-2z\"/>";
