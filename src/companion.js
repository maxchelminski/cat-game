import {CATALOG, SETS, PASS_REWARDS, feed, pet, startErrand, recallErrand, buyItem, equipItem, claimPassReward, claimAchievement} from './engine.js';
import {getState,isPersistent,subscribe,startSession,transact} from './store.js';
import {styles} from './styles.js';
import {v2Styles} from './v2-styles.js';
import {icon} from './icons.js';
import {itemArt} from './item-art.js';
import {SpriteController} from './sprite-controller.js';
import {renderAppearance} from './appearance.js';
import {getDockVariant,onCompanionPageChange} from './navigation.js';
import {tinker} from './tinker.js';
import * as view from './views.js';

const openDialogs=new Set();let previousOverflow='';
function openDialog(dialog){if(dialog.open)return;dialog.showModal();if(!openDialogs.size){previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';}openDialogs.add(dialog);}
function releaseDialog(dialog){if(openDialogs.delete(dialog)&&!openDialogs.size)document.documentElement.style.overflow=previousOverflow;}
const modalHead=title=>`<div class="modal-head"><h2 id="modal-title">${view.escape(title)}</h2><button class="icon-button" data-action="close" aria-label="Close dialog">${icon('close',18)}</button></div>`;

export class SchaleCompanion extends HTMLElement {
  constructor(){
    super();this.attachShadow({mode:'open'});this.tab='room';this.filter='all';this.lastInteraction=Date.now();this.activeMood=null;
    this.shadowRoot.innerHTML=`<style>${styles}${v2Styles}</style><div id="inline"></div><button class="dock" data-action="open" hidden aria-label="Open your companion’s room"></button><dialog class="room-modal" aria-label="Companion room"><div id="floating"></div></dialog><dialog class="modal" aria-labelledby="modal-title"><div class="modal-content"></div><div class="dialog-toast" role="status" aria-live="polite"></div></dialog><div class="toast" role="status" aria-live="polite"></div>`;
    this.shadowRoot.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(button&&!button.disabled)this.handleAction(button.dataset.action,button.dataset).catch(()=>this.toast('That little moment could not be saved. Please try again.'));});
    this.shadowRoot.addEventListener('animationend',event=>{if(event.animationName==='tinker-wiggle')event.target.classList.remove('tinkering');});
    this.shadowRoot.addEventListener('keydown',event=>{
      if(event.target.matches('[role=tab]')&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
        event.preventDefault();const tabs=[...this.shadowRoot.querySelectorAll('[role=tab]')];let next=tabs.indexOf(event.target)+(event.key==='ArrowRight'?1:-1);if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
        this.tab=tabs[(next+tabs.length)%tabs.length].dataset.value;this.render();this.shadowRoot.querySelector(`[role=tab][data-value="${this.tab}"]`)?.focus();
      }
    });
    this.shadowRoot.querySelector('.room-modal').addEventListener('close',()=>{this.opened=false;this.render();this.shadowRoot.querySelector('.dock')?.focus();});
    this.shadowRoot.querySelector('.modal').addEventListener('close',()=>{
      this.modalSprite?.destroy();this.modalResize?.disconnect();this.modalKind=null;
      const saved=this.modalOpener;const match=[...this.shadowRoot.querySelectorAll('#inline [data-action], #floating [data-action], .dock')].find(el=>saved&&el.dataset.action===saved.action&&(!saved.id||el.dataset.id===saved.id));
      (match||this.shadowRoot.querySelector('[role=tab][aria-selected=true]')||this.shadowRoot.querySelector('.dock'))?.focus({preventScroll:true});
    });
    this.shadowRoot.querySelectorAll('dialog').forEach(dialog=>{dialog.addEventListener('close',()=>releaseDialog(dialog));dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});});
  }
  async connectedCallback(){
    if(this.unsubscribe)return;this.inlineMode=this.hasAttribute('expanded');this.opened=this.inlineMode;
    this.unsubscribe=subscribe((state,detail)=>this.onState(state,detail));this.unsubscribePage=onCompanionPageChange(()=>this.dockSprite?.setVariant(getDockVariant()));
    await startSession();if(!this.isConnected)return;this.render();
    this.clock=setInterval(()=>{if(!document.hidden)transact(null,'tick');},30000);this.ambient=setInterval(()=>this.updateMood(),3000);
  }
  disconnectedCallback(){this.unsubscribe?.();this.unsubscribe=null;this.unsubscribePage?.();clearInterval(this.clock);clearInterval(this.ambient);clearTimeout(this.moodTimer);clearTimeout(this.toastTimer);this.sprite?.destroy();this.dockSprite?.destroy();this.modalSprite?.destroy();this.resize?.disconnect();this.modalResize?.disconnect();this.shadowRoot.querySelectorAll('dialog').forEach(d=>{d.close();releaseDialog(d);});}
  onState(state,detail){
    const c=detail.catchup||{};
    if(detail.label==='tick'&&!c.errandReward&&!c.newWeeklyReward){this.updateNumbers();this.updateMood();const details=this.shadowRoot.querySelector('.trip-details');if(this.modalKind==='errand'&&state.errand&&details)details.innerHTML=view.errandDetails(state);}
    else this.render();
    if(this.modalKind==='errand'&&c.errandReward)this.closeModal();
    if(c.welcomeBonus>0)this.showWelcome(c);
    else {const messages=[c.errandReward?.message,c.newWeeklyReward?.message].filter(Boolean);if(messages.length)this.toast(messages.join(' '));}
    if(detail.label==='reading'&&detail.result){this.toast(detail.result.message);if(detail.result.awarded>0||detail.result.coins>0)this.animate('cheerful');}
  }
  render(){
    const s=getState(),focused=this.shadowRoot.activeElement,focusData=focused?.dataset?{...focused.dataset}:null;
    const focusContent=focused?.closest('#inline,#floating');const oldScroll=this.shadowRoot.querySelector('.pass-track')?.scrollLeft||0;
    this.sprite?.destroy();this.dockSprite?.destroy();this.resize?.disconnect();
    this.shadowRoot.querySelector('#inline').innerHTML='';this.shadowRoot.querySelector('#floating').innerHTML='';
    const dock=this.shadowRoot.querySelector('.dock');dock.hidden=this.opened;
    dock.innerHTML=`${view.characterCanvas()}<span><strong>Your little companion</strong><small>${s.errand?'Out gathering a story':`${s.coins} leaves · come say hello`}</small></span>${icon('arrow',15)}`;
    if(!this.opened){
      this.dockSprite=new SpriteController(dock,{...view.appearance(s),dock:true,variant:getDockVariant()});
      if(this.inlineMode)this.shadowRoot.querySelector('#inline').innerHTML=`<div class="collapsed-message">${icon('leaf',30)}<h2>A little company, wherever you go.</h2><p>She’ll be waiting in the corner while you read.</p><button class="action" data-action="open">Open the pet room ${icon('arrow',14)}</button></div>`;
      return;
    }
    const target=this.shadowRoot.querySelector(this.inlineMode?'#inline':'#floating');
    const content=this.tab==='room'?view.room(s,this.readerUrl()):this.tab==='shop'?view.shop(s,this.filter):this.tab==='pass'?view.passView(s):view.achievementsView(s);
    target.innerHTML=`${view.header(s,this.tab)}${!isPersistent()?'<p class="storage-warning">Your browser is blocking saves. This visit works, but progress may disappear when you leave.</p>':''}<section role="tabpanel" id="panel-${this.tab}" aria-labelledby="tab-${this.tab}">${content}</section><div class="saved-line">${icon('check',11)}Saved on this device · Always here, at your pace.<span> · </span><button class="text-button about-button" data-action="help">About your companion</button></div>`;
    const fox=target.querySelector('.fox-button');if(fox){this.sprite=new SpriteController(fox,view.appearance(s));this.updateMood();this.resize=this.observeWorld(target);}
    this.drawPreviews(target);
    const track=target.querySelector('.pass-track');if(track){track.scrollLeft=oldScroll;if(this.scrollToTier){const card=track.querySelector(`[data-tier="${this.scrollToTier}"]`);track.scrollLeft=card?.offsetLeft-track.offsetLeft||0;this.scrollToTier=null;}}
    if(focusContent&&focusData?.action){const buttons=[...target.querySelectorAll('[data-action]')];const match=buttons.find(el=>el.dataset.action===focusData.action&&['id','value','level','kind','hotspot'].every(k=>!focusData[k]||el.dataset[k]===focusData[k]))||buttons.find(el=>focusData.id&&el.dataset.id===focusData.id&&el.classList.contains('product-picture'));match?.focus({preventScroll:true});}
  }
  observeWorld(root){
    const observer=new ResizeObserver(entries=>entries.forEach(({target})=>{
      const world=target.querySelector('.room-world');if(!world)return;
      const scale=Math.max(target.clientWidth/640,target.clientHeight/360),width=640*scale;
      world.style.width=`${width}px`;world.style.height=`${360*scale}px`;
      // Keep both furniture stations inside a portrait crop, without moving the floor.
      const crop=Math.max(0,(width-target.clientWidth)/2),inset=10;
      const left=world.querySelector('.slot-left'),right=world.querySelector('.slot-right');
      if(left)left.style.left=`${Math.max(58*scale,crop+inset)}px`;
      if(right)right.style.left=`${Math.min(477*scale,width-crop-inset-108*scale)}px`;
    }));root.querySelectorAll('.scene').forEach(scene=>observer.observe(scene));return observer;
  }
  drawPreviews(root){root.querySelectorAll('[data-preview-outfit]').forEach(canvas=>renderAppearance(canvas,'kemo-neutral',{outfit:canvas.dataset.previewOutfit,accessory:canvas.dataset.previewAccessory||null}).catch(()=>{}));}
  readerUrl(){try{const url=new URL(this.getAttribute('reader-url')||'https://www.schalescans.com/manga',location.href);return ['http:','https:'].includes(url.protocol)?view.escape(url.href):'https://www.schalescans.com/manga';}catch{return 'https://www.schalescans.com/manga';}}
  updateNumbers(){const s=getState();this.shadowRoot.querySelectorAll('[data-coins]').forEach(el=>el.textContent=s.coins);for(const key of ['hunger','happiness','energy']){this.shadowRoot.querySelectorAll(`[data-stat-number=${key}]`).forEach(el=>el.textContent=Math.round(s[key]));this.shadowRoot.querySelectorAll(`[data-stat-bar=${key}]`).forEach(el=>{el.style.width=`${s[key]}%`;el.parentElement.setAttribute('aria-valuenow',Math.round(s[key]));});}if(s.errand)this.shadowRoot.querySelectorAll('[data-countdown]').forEach(el=>el.textContent=`Back in ${view.timeLeft(s.errand.endsAt)}`);}
  updateMood(){if(!this.sprite)return;const s=getState(),mood=this.activeMood||(s.hunger<30||s.happiness<30?'sleepy':Date.now()-this.lastInteraction>25000?'reading':'idle');this.sprite.set(mood);const speech=this.shadowRoot.querySelector('#inline .speech span,#floating .speech span');if(speech)speech.textContent={idle:'I saved a little space for you.',reading:'Just one more chapter…',eating:'My favorite. How did you know?',petting:'Hehe… one more?',sleepy:'A slow day is a lovely day, too.',cheerful:'Another little memory, together.'}[mood];}
  animate(mood){this.lastInteraction=Date.now();this.activeMood=mood;this.updateMood();clearTimeout(this.moodTimer);this.moodTimer=setTimeout(()=>{this.activeMood='idle';this.updateMood();this.moodTimer=setTimeout(()=>{this.activeMood=null;this.updateMood();},12000);},3200);}
  hearts(){const scene=this.shadowRoot.querySelector('#inline .scene,#floating .scene');if(!scene||matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<5;i++){const heart=document.createElement('span');heart.className='particle';heart.innerHTML=icon('heart',14);heart.style.cssText=`left:${43+Math.random()*14}%;bottom:${100+Math.random()*60}px;--drift:${Math.random()*60-30}px;animation-delay:${i*90}ms`;scene.append(heart);setTimeout(()=>heart.remove(),2300);}}
  wiggle(id){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const prop=[...this.shadowRoot.querySelectorAll('#inline [data-decor],#floating [data-decor]')].find(el=>el.dataset.decor===id)?.querySelector('.decor-art');if(prop){prop.classList.remove('tinkering');void prop.offsetWidth;prop.classList.add('tinkering');}}
  toast(message){if(!message)return;const el=this.shadowRoot.querySelector(this.shadowRoot.querySelector('.modal').open?'.dialog-toast':'.toast');el.textContent=message;el.classList.add('visible');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>this.shadowRoot.querySelectorAll('.toast,.dialog-toast').forEach(x=>x.classList.remove('visible')),5200);}
  showModal(html,kind){this.modalSprite?.destroy();this.modalResize?.disconnect();this.modalOpener={...this.shadowRoot.activeElement?.dataset};this.modalKind=kind;const dialog=this.shadowRoot.querySelector('.modal');dialog.querySelector('.modal-content').innerHTML=html;dialog.querySelector('.dialog-toast').classList.remove('visible');openDialog(dialog);}
  closeModal(){this.shadowRoot.querySelector('.modal').close();}
  showItem(id){
    const item=view.itemById(id);if(!item)return;const s=getState(),owned=s.owned.includes(id),locked=item.price==null&&!owned,equipped=view.isEquipped(s,id),permanent=equipped&&['room','outfit'].includes(item.slot);const preview={...s,errand:null,equipped:{...s.equipped}};if(item.slot)preview.equipped[item.slot]=id;
    const scene=item.category==='treat'?`<div class="treat-preview">${itemArt(id)}</div>`:view.scene(preview,{preview:true});
    this.showModal(`${modalHead(item.name)}${scene}<p class="item-description">${view.escape(item.description)}</p>${item.setId?'<p class="preview-note">Part of a room collection. Match all four pieces to activate its leaf bonus.</p>':''}${['outfit','wearable'].includes(item.category)?'<div class="pose-controls"><button data-action="preview-pose" data-value="idle">Standing</button><button data-action="preview-pose" data-value="petting">Headpats</button><button data-action="preview-pose" data-value="sleepy">Sleepy</button></div>':''}<button class="button-full" data-action="${locked?'pass-item':owned?'equip':'buy'}" data-id="${id}" ${permanent||!owned&&!locked&&s.coins<item.price?'disabled':''}>${locked?'Find this in the bond pass':permanent?'Already equipped':owned?equipped?'Put away':'Equip this little joy':`Bring it home · ${item.price} leaves`}</button><p class="preview-note">${item.category==='treat'?'Enjoyed immediately when purchased.':'Previewing only. Your room changes when you equip it.'}</p>`,'item');
    const root=this.shadowRoot.querySelector('.modal-content');if(item.category!=='treat'){this.modalSprite=new SpriteController(root.querySelector('.fox-button'),view.appearance(preview));this.modalResize=this.observeWorld(root);}
  }
  showFood(){this.showModal(`${modalHead('A little something tasty')}<p>Small comforts for now, or a full feast for the week ahead.</p>${[['snack','A little taiyaki','+25 fullness · a sweet little pause',8],['feast','A weekly feast','Full fullness · ready for the week',30],['matcha','Matcha & mochi','A three-day mood boost',24]].map(([id,name,desc,price])=>`<button class="choice" data-action="${id==='matcha'?'buy':'feed'}" data-id="${id}" ${getState().coins<price?'disabled':''}>${itemArt(id)}<span class="choice-copy"><strong>${name}</strong><small>${desc}</small></span><span class="cost">${view.leaves(price)}</span></button>`).join('')}`,'food');}
  showErrands(){const s=getState();this.showModal(`${modalHead(s.errand?'A little check-in':'A small adventure')}${s.errand?`<div class="trip-details">${view.errandDetails(s)}</div>`:`<p>A few hours to gather a story. You can call her home any time.</p>${[['stroll','A shrine stroll','2 hours · 20 energy · 20 base leaves',20],['bookshop','Bookshop browsing','4 hours · 35 energy · 35 base leaves + little discoveries',35]].map(([id,name,desc,energy])=>`<button class="choice" data-action="start-errand" data-id="${id}" ${s.energy<energy?'disabled':''}>${itemArt(id)}<span class="choice-copy"><strong>${name}</strong><small>${desc}</small></span>${icon('arrow',17)}</button>`).join('')}<p class="preview-note">Fullness and matching room sets can bring a few extra leaves.</p>`}`,'errand');}
  showWelcome(c){const reward=c.welcomeBonus;this.showModal(`<div class="welcome-copy">${view.characterCanvas('class="welcome-art"')}<h2 id="modal-title">Welcome back!</h2><p>I kept our little corner cozy.<br>Look what drifted in while you were away.</p><div class="welcome-bonus">${view.leaves(reward||15)} leaves for a fresh start</div>${c.errandReward?`<p>${view.escape(c.errandReward.message)}</p>`:''}${c.newWeeklyReward?`<p>${view.escape(c.newWeeklyReward.message)}</p>`:''}<button class="button-full" data-action="close">It’s good to be here</button></div>`,'welcome');this.modalSprite=new SpriteController(this.shadowRoot.querySelector('.welcome-copy'),view.appearance(getState()));this.modalSprite.set('cheerful');}
  showHelp(){this.showModal(`${modalHead('At your own pace')}<p class="modal-lead">A friend for the moments between chapters. No deadlines, no goodbyes.</p><div class="info-list">${[['leaf','A small thank-you','Read chapters, check in each week, and claim milestones to gather leaves. Weekly streaks stop growing at five; missed weeks simply pause them.'],['heart','Care adds a little extra','70+ fullness gives +5% adventure leaves. 70+ happiness gives +5% reading EXP. Energy quietly refills for outings. Low stats only make her sleepy.'],['home','Make yourself at home','Equip a room and its three matching pieces for +5% leaves. The exclusive Moonlit Archive pass set gives +8%. Try the room lights and little things to make yourself at home. Outfits are yours to mix and match.'],['book','A permanent bond pass','Fifty tiers of outfits, badges, leaves, and future Discord-role entitlements. The final gift is reserved for a long story together. There is no season deadline.'],['compass','Always welcome home','Call her back at any point. Early outing rewards round down to 0%, 25%, 50%, or 75%; keepsakes arrive after a full outing.']].map(([i,t,p])=>`<div class="info-row">${icon(i,19)}<div><strong>${t}</strong><p>${p}</p></div></div>`).join('')}</div><p class="preview-note">Original Kemomimi pixel frames by naga u, supplied through your Claude artifact. Progress is currently saved on this browser.</p>`,'help');}
  async handleAction(action,data){
    let result;this.lastInteraction=Date.now();
    if(action==='open'){this.opened=true;this.render();if(!this.inlineMode)openDialog(this.shadowRoot.querySelector('.room-modal'));return;}
    if(action==='minimize'){if(this.shadowRoot.querySelector('.room-modal').open)this.shadowRoot.querySelector('.room-modal').close();else{this.opened=false;this.render();this.shadowRoot.querySelector('.dock').focus();}return;}
    if(action==='tab'){this.tab=data.value;this.render();return;}
    if(action==='filter'){this.filter=data.value;this.render();return;}
    if(action==='collection'||action==='sets'){this.tab='shop';this.filter=action==='sets'?'sets':'owned';this.render();return;}
    if(action==='close'){this.closeModal();return;}
    if(action==='help'){this.showHelp();return;}
    if(action==='food'){this.showFood();return;}
    if(action==='errand'){this.showErrands();return;}
    if(action==='item'){this.showItem(data.id);return;}
    if(action==='preview-pose'){this.modalSprite?.set(data.value,true);return;}
    if(action==='tinker'){result=await transact(s=>tinker(s,data.kind,data.id),'tinker');if(result?.shake)this.wiggle(data.id);if(result?.message)this.toast(result.message);return;}
    if(action==='pass-scroll'){const track=this.shadowRoot.querySelector('.pass-track');track?.scrollBy({left:Number(data.value)*Math.max(240,track.clientWidth*.75),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
    if(action==='pass-item'){this.scrollToTier=PASS_REWARDS.find(r=>r.itemIds.includes(data.id))?.level;this.closeModal();this.tab='pass';this.render();return;}
    if(action==='pet'){result=await transact((s,n)=>s.errand?{ok:false,message:'Call her home for a little headpat.'}:pet(s,n));if(result?.ok){this.animate('petting');this.hearts();}}
    if(action==='feed'){result=await transact((s,n)=>s.errand?{ok:false,message:'Call her home for a treat.'}:feed(s,data.id,n));if(result?.ok){this.closeModal();this.animate('eating');}}
    if(action==='start-errand'){result=await transact((s,n)=>startErrand(s,data.id,n));if(result?.ok)this.closeModal();}
    if(action==='recall'){result=await transact((s,n)=>recallErrand(s,n));if(result?.ok){this.closeModal();this.animate('cheerful');}}
    if(action==='buy'){result=await transact((s,n)=>data.id==='matcha'&&s.errand?{ok:false,message:'Call her home for a treat.'}:buyItem(s,data.id,n));if(result?.ok){this.closeModal();if(data.id==='matcha')this.animate('eating');}}
    if(action==='equip'){result=await transact(s=>equipItem(s,data.id));if(result?.ok)this.closeModal();}
    if(action==='equip-set'){result=await transact(s=>{const set=SETS.find(x=>x.id===data.id);if(!set||!set.itemIds.every(id=>s.owned.includes(id)))return {ok:false,message:'Gather every piece of this collection first.'};set.itemIds.forEach(id=>{const item=CATALOG.find(x=>x.id===id);if(s.equipped[item.slot]!==id)equipItem(s,id);});return {ok:true,message:`${set.name} is all settled in. Its leaf bonus is active.`};});}
    if(action==='claim-pass'){result=await transact((s,n)=>claimPassReward(s,Number(data.level),n));if(result?.ok)this.dispatchEvent(new CustomEvent('companion-reward-claimed',{detail:{kind:'bond-pass',level:Number(data.level),reward:result},bubbles:true,composed:true}));}
    if(action==='claim-achievement')result=await transact((s,n)=>claimAchievement(s,data.id,n));
    if(result?.message)this.toast(result.message);
  }
}
if(!customElements.get('schale-companion'))customElements.define('schale-companion',SchaleCompanion);
