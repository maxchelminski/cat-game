import {renderAppearance, cancelAppearanceRender} from './appearance.js';

export const IDLE_VARIANTS = Object.freeze([
  {id:0,name:'A quiet moment',description:'Slow breathing and a little blink.'},
  {id:1,name:'One more page',description:'A book, a blink, and an occasional page turn.'},
  {id:2,name:'A happy tail',description:'A gentle tail swish between long rests.'},
  {id:3,name:'A little doze',description:'A soft, unhurried nap.'},
  {id:4,name:'Feeling shy',description:'A bashful smile and a little head tilt.'},
]);

const step=(name,ms,extra={})=>({name:`kemo-${name}.png`,ms,...extra});
const roomFrames={
  idle:[step('neutral',3800),step('neutral',3800,{offsetY:-1}),step('happy',150),step('neutral',3400)],
  reading:[step('neutral',5200,{prop:'book'}),step('neutral',600,{prop:'book',pageTurn:true}),step('happy',170,{prop:'book'}),step('neutral',3800,{prop:'book',offsetY:-1})],
  eating:[step('happy',300,{prop:'snack'}),step('cheerful-2',250,{prop:'snack',offsetY:-1}),step('happy',300,{prop:'snack'}),step('cheerful-4',300,{prop:'snack'})],
  petting:Array.from({length:8},(_,i)=>step(`flustered-${i+1}`,[300,120,160,120,160,120,500,450][i])),
  sleepy:Array.from({length:6},(_,i)=>step(`sleepy-${i+1}`,[1100,900,1300,1000,1100,1000][i])),
  cheerful:Array.from({length:4},(_,i)=>step(`cheerful-${i+1}`,230)),
};
const dockFrames=[
  [step('neutral',4600),step('neutral',4600,{offsetY:-1}),step('happy',180),step('neutral',4100)],
  [step('neutral',6000,{prop:'book'}),step('neutral',700,{prop:'book',pageTurn:true}),step('neutral',3700,{prop:'book',offsetY:-1}),step('happy',200,{prop:'book'})],
  [step('neutral',6200),...Array.from({length:6},(_,i)=>step(`smug-${i+1}`,[650,250,200,250,650,350][i])),step('neutral',3700)],
  Array.from({length:6},(_,i)=>step(`sleepy-${i+1}`,[1600,1200,1800,1500,1400,1600][i])),
  [step('smug-1',4200),step('smug-4',900),step('flustered-8',2200),step('happy',450),step('neutral',5000)],
];

/** One timer, one composed canvas; accessories always use the current pose. */
export class SpriteController {
  constructor(root,options={}) {
    this.root=root;this.canvas=root.matches?.('[data-sprite]')?root:root.querySelector('[data-sprite]');
    this.appearance={outfit:options.outfit||'outfit-base',accessory:options.accessory||null};
    this.dock=!!options.dock;this.variant=this.validVariant(options.variant);this.state=this.dock?'dock':'idle';
    this.frame=0;this.destroyed=false;
    this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
    this.onMotion=()=>this.set(this.state,true);this.reduced.addEventListener('change',this.onMotion);
    this.onVisibility=()=>{clearTimeout(this.timer);if(!document.hidden&&!this.destroyed)this.tick();};
    document.addEventListener('visibilitychange',this.onVisibility);
    this.set(this.state,true);
  }
  validVariant(index){return Number.isInteger(Number(index))?((Number(index)%dockFrames.length)+dockFrames.length)%dockFrames.length:0;}
  sequence(){return this.state==='dock'||(this.dock&&this.state==='idle')?dockFrames[this.variant]:roomFrames[this.state]||roomFrames.idle;}
  set(state,force=false) {
    if(this.destroyed)return;
    state=state==='dock'||Object.hasOwn(roomFrames,state)?state:'idle';
    if(this.state===state&&!force)return;
    clearTimeout(this.timer);this.state=state;this.frame=0;this.root.dataset.mood=this.state;this.tick();
  }
  updateAppearance(options={}) {
    if(this.destroyed)return;
    const next={...this.appearance,...options};
    if(next.outfit===this.appearance.outfit&&next.accessory===this.appearance.accessory)return;
    this.appearance=next;this.paint();
  }
  setVariant(index) {
    const next=this.validVariant(index);
    if(next===this.variant||this.destroyed)return;
    this.variant=next;
    if(this.state==='dock'||(this.dock&&this.state==='idle'))this.set(this.state,true);
  }
  paint() {
    if(this.destroyed||!this.canvas)return;
    const frame=this.sequence()[this.frame]||this.sequence()[0];
    this.canvas.setAttribute('role','img');
    this.canvas.setAttribute('aria-label',`Kemomimi, your fox companion, ${this.state==='dock'?IDLE_VARIANTS[this.variant].name.toLowerCase():this.state}`);
    renderAppearance(this.canvas,frame.name,{...this.appearance,...frame,offsetY:this.reduced.matches?0:frame.offsetY||0})
      .catch(()=>{if(!this.destroyed)this.canvas.setAttribute('aria-label','Your fox companion');});
  }
  tick() {
    clearTimeout(this.timer);
    if(this.destroyed)return;
    this.paint();
    if(this.reduced.matches||document.hidden)return;
    const sequence=this.sequence();
    this.timer=setTimeout(()=>{this.frame=(this.frame+1)%sequence.length;this.tick();},sequence[this.frame].ms);
  }
  destroy() {
    if(this.destroyed)return;
    this.destroyed=true;clearTimeout(this.timer);cancelAppearanceRender(this.canvas);
    this.reduced.removeEventListener('change',this.onMotion);document.removeEventListener('visibilitychange',this.onVisibility);
  }
}
