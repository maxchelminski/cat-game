const base = new URL('../assets/sprites/', import.meta.url);
const frames = {
 idle: ['kemo-neutral.png','kemo-happy.png','kemo-neutral.png',...Array.from({length:6},(_,i)=>`kemo-smug-${i+1}.png`)], reading: ['kemo-neutral.png','kemo-happy.png'], eating: ['kemo-happy.png','kemo-cheerful-2.png','kemo-happy.png','kemo-cheerful-4.png'],
 petting: Array.from({length:8},(_,i)=>`kemo-flustered-${i+1}.png`),
 sleepy: Array.from({length:6},(_,i)=>`kemo-sleepy-${i+1}.png`),
 cheerful: Array.from({length:4},(_,i)=>`kemo-cheerful-${i+1}.png`)
};
const times = {idle:[5500,140,5000,600,120,100,120,520,160],reading:[6000,150],petting:[300,120,160,120,160,120,500,450],sleepy:[450,300,600,250,500,300],eating:[220,180,220,180],cheerful:[150,150,150,150]};
/** Original frames are kept intact. Props and ambient animation live in the UI. */
export class SpriteController {
  constructor(root) { this.root=root; this.state='idle'; this.frame=0; this.reduced=matchMedia('(prefers-reduced-motion: reduce)'); this.tick=this.tick.bind(this); this.onMotion=()=>this.set(this.state,true); this.reduced.addEventListener('change',this.onMotion); this.set('idle',true); }
  set(state,force=false) { if(this.state===state&&!force)return; clearTimeout(this.timer); this.state=frames[state]?state:'idle'; this.frame=0; this.root.dataset.mood=this.state; this.tick(); }
  tick() {
    const sequence=frames[this.state]; const image=this.root.querySelector('[data-sprite]');
    if(image) { image.src=new URL(sequence[this.frame],base).href; image.alt=`Kemomimi, your fox companion, ${this.state}`; }
    if(sequence.length>1&&!this.reduced.matches) {const delay=times[this.state]?.[this.frame]||200; this.frame=(this.frame+1)%sequence.length;this.timer=setTimeout(this.tick,delay);}
  }
  destroy(){clearTimeout(this.timer);this.reduced.removeEventListener('change',this.onMotion);}
}
