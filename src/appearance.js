/** Pixel composition for the original 64×72 artwork. Source PNGs are never altered. */
export const FRAME_NAMES = Object.freeze([
  'kemo-neutral.png', 'kemo-happy.png',
  ...Array.from({length:4}, (_, i) => `kemo-cheerful-${i+1}.png`),
  ...Array.from({length:6}, (_, i) => `kemo-smug-${i+1}.png`),
  ...Array.from({length:6}, (_, i) => `kemo-sleepy-${i+1}.png`),
  ...Array.from({length:8}, (_, i) => `kemo-flustered-${i+1}.png`),
]);
export const OUTFIT_IDS = Object.freeze(['outfit-base', 'outfit-miko', 'outfit-school', 'outfit-yukata', 'outfit-garden', 'outfit-moon']);
export const ACCESSORY_IDS = Object.freeze(['glasses', 'headband', 'mask', 'ribbon']);
const WIDTH = 64, HEIGHT = 72;
const base = new URL('../assets/sprites/', import.meta.url);
const sources = new Map(), compositions = new Map(), requests = new WeakMap();
const MAX_COMPOSITIONS = 192;

/** Anchors measured on source pixels, including the lowered headpat poses. */
export const FRAME_METADATA = Object.freeze(Object.fromEntries(FRAME_NAMES.map(name => {
  const sleeping = name.includes('sleepy');
  const index = Number(name.match(/-(\d+)\.png$/)?.[1] || 0);
  const headDown = name.includes('flustered') && [2,4,6].includes(index);
  const dx = sleeping && index === 5 ? 1 : 0;
  const dy = sleeping ? ([4,5].includes(index) ? 17 : 16) : headDown ? 1 : 0;
  return [name, Object.freeze({sleeping, dx, dy,
    eyes: Object.freeze([[19+dx,37+dy],[32+dx,37+dy]]),
    crown: Object.freeze([28+dx,23+dy]),
    handInFront: name.includes('flustered') && index<=6,
    handBottom: headDown ? 21 : 20,
  })];
})));

function source(name) {
  if (!FRAME_NAMES.includes(name)) name = 'kemo-neutral.png';
  if (!sources.has(name)) sources.set(name, new Promise((resolve,reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;
      const context=canvas.getContext('2d',{willReadFrequently:true});context.imageSmoothingEnabled=false;
      context.drawImage(image,0,0);resolve({canvas,pixels:context.getImageData(0,0,WIDTH,HEIGHT).data});
    };
    image.onerror = () => {sources.delete(name);reject(new Error(`Could not load companion frame: ${name}`));};
    image.src = new URL(name,base).href;
  }));
  return sources.get(name);
}
export function preloadSprites() { return Promise.all(FRAME_NAMES.map(source)); }

const rgb = hex => [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255];
const COLORS={green:[153,150,93],greenShade:[83,84,76],skirt:[164,54,84],skirtShade:[131,50,69],red:[213,78,85]};
const same=(pixels,index,color)=>pixels[index]===color[0]&&pixels[index+1]===color[1]&&pixels[index+2]===color[2];

function painter(pixels) {
  const colorCache=new Map();
  const set=(x,y,color,mask=null)=>{
    x=Math.round(x);y=Math.round(y);
    if(x<0||x>=WIDTH||y<0||y>=HEIGHT||(mask&&!mask(x,y)))return;
    if(!colorCache.has(color))colorCache.set(color,rgb(color));
    pixels.set(colorCache.get(color),(y*WIDTH+x)*4);
  };
  const rect=(x,y,w,h,color,mask)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)set(xx,yy,color,mask);};
  const line=(x0,y0,x1,y1,color,mask)=>{
    const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let error=dx+dy;
    for(;;){set(x0,y0,color,mask);if(x0===x1&&y0===y1)break;const e=2*error;if(e>=dy){error+=dy;x0+=sx;}if(e<=dx){error+=dx;y0+=sy;}}
  };
  const pattern=(x,y,rows,palette,mask)=>rows.forEach((row,yy)=>[...row].forEach((key,xx)=>{if(palette[key])set(x+xx,y+yy,palette[key],mask);}));
  return {set,rect,line,pattern};
}

const WARDROBE={
  'outfit-miko':{top:'#f6e7d6',shade:'#c7ada9',bottom:'#c75549',bottomShade:'#87373b',trim:'#b54746',light:'#fff1dc'},
  'outfit-school':{top:'#f0e8d7',shade:'#b5b7b3',bottom:'#43546b',bottomShade:'#303b54',trim:'#43546b',light:'#fff1dc'},
  'outfit-yukata':{top:'#9b667d',shade:'#69455c',bottom:'#80536e',bottomShade:'#53354d',trim:'#edcfa5',light:'#fae5ba'},
  'outfit-garden':{top:'#d59594',shade:'#a96b79',bottom:'#87966c',bottomShade:'#536e58',trim:'#f0debf',light:'#fff0d5'},
  'outfit-moon':{top:'#a9c3d9',shade:'#728daa',bottom:'#485270',bottomShade:'#303a59',trim:'#e9d79c',light:'#e2e9e9'},
};

function drawOutfit(output,original,meta,outfit) {
  if(outfit==='outfit-base')return;
  const colors=WARDROBE[outfit],p=painter(output);
  const garment=new Uint8Array(WIDTH*HEIGHT),skirt=new Uint8Array(WIDTH*HEIGHT);
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
    const i=(y*WIDTH+x)*4;if(!original[i+3])continue;
    // These palette colors also occur in eyes/hair: exclude those regions explicitly.
    const topRegion=meta.sleeping?(y<38||y>=56):y>=46;
    const top=topRegion&&(same(original,i,COLORS.green)||same(original,i,COLORS.greenShade));
    const bottom=!meta.sleeping&&y>=55&&y<=64&&x>=20&&x<=43&&(same(original,i,COLORS.skirt)||same(original,i,COLORS.skirtShade));
    const collar=!meta.sleeping&&y>=45&&y<=49&&x>=20&&x<=37&&(same(original,i,COLORS.red)||same(original,i,COLORS.skirt)||same(original,i,COLORS.skirtShade));
    if(top){garment[y*WIDTH+x]=1;p.set(x,y,same(original,i,COLORS.greenShade)?colors.shade:colors.top);}
    else if(bottom){skirt[y*WIDTH+x]=1;p.set(x,y,same(original,i,COLORS.skirtShade)?colors.bottomShade:colors.bottom);}
    else if(collar){garment[y*WIDTH+x]=1;p.set(x,y,colors.top);}
  }
  const cloth=(x,y)=>!!garment[y*WIDTH+x],hem=(x,y)=>!!skirt[y*WIDTH+x],any=(x,y)=>cloth(x,y)||hem(x,y);
  const flower=(x,y,color,mask=cloth)=>p.pattern(x,y,[' .p. ','.ppp.','ppcpp','.ppp.',' .p. '],{p:color,c:'#e9c876'},mask);
  const star=(x,y,mask=cloth)=>p.pattern(x,y,['..g..','..g..','ggwgg','..g..','..g..'],{g:colors.trim,w:colors.light},mask);
  if(meta.sleeping){
    // Nightcap/blanket adopt the outfit; paws, face, pillow and tail stay original.
    p.line(24,34,43,34,colors.trim,cloth);p.line(17,65,40,65,colors.trim,cloth);
    if(outfit==='outfit-yukata'||outfit==='outfit-garden'){flower(28+meta.dx,28,colors.light);flower(13,61,colors.light);flower(34,63,colors.light);}
    else if(outfit==='outfit-moon'){star(27+meta.dx,28);star(13,61);star(35,62);}
    else if(outfit==='outfit-school'){p.rect(12,63,31,2,colors.trim,cloth);p.line(14,66,37,66,colors.light,cloth);}
    else{p.rect(12,64,31,2,colors.bottom,cloth);p.line(20,61,20,67,colors.bottom,cloth);p.line(31,62,31,67,colors.bottom,cloth);}
    return;
  }
  if(outfit==='outfit-miko'){
    // Ivory sleeves, crossed red collar, tied waist and pleated hakama.
    p.line(22,47,29,54,colors.trim,cloth);p.line(34,47,28,53,colors.trim,cloth);
    p.line(12,56,18,56,colors.trim,cloth);p.line(33,57,39,57,colors.trim,cloth);p.rect(21,54,18,3,colors.bottom,cloth);
    p.pattern(25,54,['rr.r.rr','rrrcrrr','.r.r.r.','..r.r..'],{r:colors.bottomShade,c:colors.light},cloth);
    [26,31,36,40].forEach(x=>p.line(x,59,x-1,64,colors.bottomShade,hem));p.line(26,62,38,62,'#e07860',hem);
  }else if(outfit==='outfit-school'){
    // Navy sailor collar, ivory edging and a burgundy necktie.
    p.rect(20,47,18,4,colors.trim,cloth);p.line(22,50,28,55,colors.trim,cloth);p.line(35,50,28,55,colors.trim,cloth);
    p.line(22,48,28,53,colors.light,cloth);p.line(34,48,29,53,colors.light,cloth);
    p.pattern(27,49,['.rr.','rrrr','.rr.','.rr.','.rr.','..r.'],{r:'#a44e64'},cloth);
    p.line(11,55,18,55,colors.trim,cloth);p.line(34,57,38,57,colors.trim,cloth);
    [25,29,33,37,41].forEach(x=>p.line(x,59,x,64,colors.bottomShade,hem));p.line(23,62,40,62,'#8a9db0',hem);
  }else if(outfit==='outfit-yukata'){
    p.line(22,47,31,54,colors.trim,cloth);p.line(34,47,28,52,colors.light,cloth);
    p.rect(21,54,17,4,colors.trim,cloth);p.line(22,56,37,56,'#b99a80',cloth);
    p.pattern(22,54,['ll.ll','lllll','.lcl.','ll.ll'],{l:colors.light,c:'#b99a80'},cloth);
    flower(12,51,'#f0bbc0');flower(32,48,'#f0bbc0');flower(36,59,'#f0bbc0',any);p.line(30,60,29,64,colors.trim,hem);
  }else if(outfit==='outfit-garden'){
    // Cream sleeve panels and lace over rose cardigan, with a sage dress below.
    p.rect(10,51,10,5,colors.trim,cloth);p.rect(34,52,7,5,colors.trim,cloth);
    p.line(23,49,25,58,colors.light,cloth);p.line(32,49,29,58,colors.light,cloth);
    [51,54,57].forEach(y=>p.set(28,y,'#e7c371',cloth));p.rect(24,57,13,1,colors.light,cloth);
    for(let x=24;x<=38;x+=2)p.set(x,62,colors.light,hem);flower(32,49,'#f3d4bf');p.rect(29,59,5,4,'#a9b98a',hem);
  }else if(outfit==='outfit-moon'){
    // Blue cape panels, midnight collar/hem and a gold star fastening.
    p.rect(21,47,15,3,colors.bottom,cloth);p.line(22,49,18,57,colors.light,cloth);p.line(34,49,38,57,colors.light,cloth);
    p.line(13,51,12,56,colors.trim,cloth);p.line(37,52,37,57,colors.trim,cloth);star(26,48);star(34,58,hem);
    p.line(24,63,38,63,colors.trim,hem);p.set(26,60,colors.light,hem);p.set(31,62,colors.light,hem);p.set(39,60,colors.light,hem);
  }
}

function drawAccessory(output,original,meta,accessory){
  if(!ACCESSORY_IDS.includes(accessory))return;
  const p=painter(output),dx=meta.dx,dy=meta.dy;
  if(accessory==='glasses'){
    // Seven-pixel round lenses surround the actual three-pixel eyes.
    const lens=['..fff..','.f...f.','f.....f','f.....f','f.....f','.f...f.','..fff..'];
    for(const [x,y]of meta.eyes)p.pattern(x-3,y-3,lens,{f:'#664444'});
    p.line(23+dx,36+dy,28+dx,36+dy,'#664444');p.line(14+dx,36+dy,15+dx,36+dy,'#664444');p.line(36+dx,36+dy,38+dx,36+dy,'#664444');
    p.set(17+dx,35+dy,'#b28b78');p.set(30+dx,35+dy,'#b28b78');
  }else if(accessory==='headband'){
    p.line(22+dx,24+dy,34+dx,24+dy,'#965666');p.line(23+dx,25+dy,33+dx,25+dy,'#df9dab');
    p.pattern(26+dx,20+dy,['..p.p..','.ppppp.','ppplppp','.plclp.','ppplppp','.ppppp.','..p.p..'],{p:'#e7a5b2',l:'#ffd4cc',c:'#c99750'});
  }else if(accessory==='ribbon'){
    p.pattern(34+dx,19+dy,['pp...pp','plp.plp','pllcllp','.ppcpp.','..p.p..','..p.p..'],{p:'#8a435b',l:'#d0879b',c:'#efc990'});
  }else if(accessory==='mask'){
    // The festival mask rests at the temple, leaving the face readable.
    p.line(38+dx,25+dy,44+dx,28+dy,'#994d56');
    p.pattern(40+dx,22+dy,['k.....k','kwk.kwk','kwwwwwk','.kwwwk.','.krwrk.','.kwwwk.','..kwk..','...k...'],{k:'#74414d',w:'#f4e3bd',r:'#b34f53'});
  }
  if(meta.handInFront){
    // Restore the patting hand/forearm over hair ornaments, pixel for pixel.
    for(let y=0;y<=meta.handBottom;y++)for(let x=19;x<=37;x++){
      const i=(y*WIDTH+x)*4;if(original[i+3])output.set(original.subarray(i,i+4),i);
    }
  }
}

function drawProp(output,original,meta,prop,pageTurn){
  if(meta.sleeping||!['book','snack'].includes(prop))return;
  const p=painter(output);
  if(prop==='book'){
    p.pattern(19,50,['kkkkkkkkk.kkkkkkkkk','kccccccckkkccccccck','kcllllcckdkcclllcck','kccccccckdkccccccck','kclllllckdkcllllcck','kccccccckdkccccccck','kcllllcckdkcclllcck','kccccccckdkccccccck','kccccccckdkccccccck','krrrrrrrkrkrrrrrrrk','.kkkkkkkkrkkkkkkk.'],{k:'#543138',c:'#eee0bb',l:'#baab8e',d:'#cbbb98',r:'#aa677a'});
    if(pageTurn){p.line(28,51,32,53,'#fff0d4');p.line(32,53,31,58,'#fff0d4');p.line(31,58,28,58,'#fff0d4');}
  }else{
    p.pattern(24,51,['....kk....','...kcck...','..kcccck..','.kcccccck.','kcccccccck','kccggggcck','kccggggcck','.kkkkkkkk.'],{k:'#795245',c:'#fff0d3',g:'#485846'});p.set(27,53,'#dc9870');p.set(30,54,'#dc9870');
  }
  // Foreground paws hold the prop; copy skin tones, never old garment colors.
  for(let y=57;y<=60;y++)for(let x=11;x<=34;x++){
    if(x>18&&x<26)continue;
    const i=(y*WIDTH+x)*4,skin=[[250,228,201],[251,240,219],[180,142,126]].some(c=>same(original,i,c));
    if(original[i+3]&&skin)output.set(original.subarray(i,i+4),i);
  }
}

async function composed(name,options){
  const outfit=OUTFIT_IDS.includes(options.outfit)?options.outfit:'outfit-base';
  const accessory=ACCESSORY_IDS.includes(options.accessory)?options.accessory:null;
  const prop=['book','snack'].includes(options.prop)?options.prop:null;
  const key=[name,outfit,accessory,prop,!!options.pageTurn].join('|');
  if(compositions.has(key)){const cached=compositions.get(key);compositions.delete(key);compositions.set(key,cached);return cached;}
  const original=await source(name),pixels=new Uint8ClampedArray(original.pixels),metadata=FRAME_METADATA[name];
  drawOutfit(pixels,original.pixels,metadata,outfit);drawProp(pixels,original.pixels,metadata,prop,options.pageTurn);drawAccessory(pixels,original.pixels,metadata,accessory);
  const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;
  canvas.getContext('2d').putImageData(new ImageData(pixels,WIDTH,HEIGHT),0,0);compositions.set(key,canvas);
  if(compositions.size>MAX_COMPOSITIONS)compositions.delete(compositions.keys().next().value);
  return canvas;
}

/** Latest request wins if appearance changes while its source frame loads. */
export async function renderAppearance(canvas,frameName='kemo-neutral.png',options={}){
  if(!canvas||typeof canvas.getContext!=='function')return false;
  const name=FRAME_NAMES.includes(frameName)?frameName:'kemo-neutral.png';
  const request=(requests.get(canvas)||0)+1;requests.set(canvas,request);
  const frame=await composed(name,options);if(requests.get(canvas)!==request)return false;
  if(canvas.width!==WIDTH)canvas.width=WIDTH;if(canvas.height!==HEIGHT)canvas.height=HEIGHT;
  const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;context.clearRect(0,0,WIDTH,HEIGHT);
  const offsetY=Math.max(-1,Math.min(1,Math.round(options.offsetY||0)));context.drawImage(frame,0,offsetY);canvas.dataset.frame=name;return true;
}

/** Cancel pending work without retaining the controller. */
export function cancelAppearanceRender(canvas){if(canvas)requests.set(canvas,(requests.get(canvas)||0)+1);}
