/** Native pixel dioramas. All rooms and furniture share one 640 × 360 world. */
export const ROOM_LAYOUT = Object.freeze({
  rug: Object.freeze({ x: 230, y: 274, width: 180, height: 55 }),
  left: Object.freeze({ x: 58, y: 218, width: 110, height: 90 }),
  right: Object.freeze({ x: 477, y: 207, width: 108, height: 98 }),
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

function hangingLantern(x, y, color = '#d7ae6c', dark = '#745442') {
  return group(x, y, r(23, 0, 2, 24, dark) + r(12, 24, 24, 5, '#42342e') +
    p('M10 30h28v6h6v28h-6v6H10v-6H4V36h6z', color) +
    r(10, 34, 6, 28, '#efd29a') + r(28, 34, 6, 28, '#bd8c57') +
    r(4, 42, 40, 2, dark, .25) + r(4, 54, 40, 2, dark, .25) +
    r(12, 70, 24, 4, '#42342e') + r(22, 74, 4, 10, dark) + r(18, 84, 12, 4, color));
}

function shrine() {
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
  s += hangingLantern(56, 44) + hangingLantern(536, 44);
  s += r(32, 234, 576, 5, '#ad8759') + r(32, 239, 576, 6, '#4a3c31') + woodFloor('#6c5140', '#89664a', '#4a3b33');
  [[182, 154], [438, 171], [215, 105], [403, 204], [154, 200]].forEach(([x, y]) => { s += star(x, y, '#d0c87f', .6); });
  return s;
}

function tearoom() {
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
  s += r(314, 0, 4, 15, '#514133') + r(292, 16, 48, 6, '#745e44') + p('M288 22h56v8h8v16h-72V30h8z', '#d6bd87') + r(286, 40, 60, 4, '#f0d9a0');
  s += r(26, 70, 8, 110, '#65523e') + r(606, 70, 8, 110, '#65523e');
  return s;
}

function sakura() {
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

function observatory() {
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

const nookURL = new URL('../assets/reading-room.svg', import.meta.url).href;
const rooms = { nook: () => `<image href="${nookURL}" width="640" height="360" style="image-rendering:pixelated"/>`, shrine, tearoom, sakura, moon: observatory };

/** Accept either a room key or the corresponding shop ID. The SVG is decorative. */
export function roomArt(roomId = 'nook') {
  const key = String(roomId).replace(/^room-/, '');
  const draw = Object.hasOwn(rooms, key) ? rooms[key] : rooms.nook;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" fill="none" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${draw()}</svg>`;
}
