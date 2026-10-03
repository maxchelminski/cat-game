import {CATALOG, SETS, ROOMS, ACHIEVEMENTS, getPass, getActiveSet, getCareBonus, getAchievementProgress, getErrandPreview} from './engine.js';
import {icon} from './icons.js';
import {itemArt, decorArt, badgeArt, LIGHT_DECOR_IDS} from './item-art.js';
import {roomArt, ROOM_LAYOUT, ROOM_INTERACTIONS} from './room-art.js';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const leaves = amount => `${icon('leaf',15)} <span>${amount}</span>`;
export const timeLeft = end => {
  const minutes = Math.max(0, Math.ceil((end-Date.now())/60000));
  return minutes >= 60 ? `${Math.floor(minutes/60)}h ${minutes%60}m` : `${minutes}m`;
};
export const itemById = id => CATALOG.find(item => item.id === id);
export const appearance = state => ({outfit:state.equipped.outfit || 'outfit-base', accessory:state.equipped.accessory || null});
export const isEquipped = (s,id) => Object.values(s.equipped).includes(id);
export const roomInfo = s => ROOMS.find(r => r.itemId === s.equipped.room || r.id === s.equipped.room) || ROOMS[0];
export function characterCanvas(extra='') {return `<canvas data-sprite width="64" height="72" role="img" aria-label="Kemomimi, your fox companion" ${extra}></canvas>`;}
export function previewCanvas(outfit, accessory=null) {
  return `<canvas class="outfit-preview" width="64" height="72" data-preview-outfit="${escape(outfit)}" data-preview-accessory="${escape(accessory || '')}" role="img" aria-label="${escape(itemById(outfit)?.name || 'Outfit')} preview"></canvas>`;
}
export function rewardArt(reward) {
  if(reward.badge) return badgeArt(Math.max(1,Math.floor(reward.level/5)));
  if(reward.itemIds?.length) return itemArt(reward.itemIds[0]);
  if(reward.entitlement) return icon('gift',62);
  return `<div class="leaf-bundle">${icon('leaf',45)}<b>+${reward.leaves}</b></div>`;
}
export function header(s,tab) {
  const pass = getPass(s);
  const notices = pass.claimable.length;
  return `<div class="intro"><div><div class="eyebrow">${icon('spark',14)} YOUR LITTLE CORNER</div><h1>A little reading.<br>A little company.</h1><p>Collect small joys. Make this corner your own.</p></div>
    <div class="intro-actions"><div class="coin-chip leaf-chip" title="Leaves earned by stories and little adventures">${icon('leaf',19)}<span data-coins>${s.coins}</span><small>leaves</small></div>
    <button class="icon-button" data-action="help" aria-label="How your companion works">${icon('info',18)}</button><button class="icon-button" data-action="minimize" aria-label="Minimize to companion dock">${icon('minimize',18)}</button></div></div>
    <div class="tabs" role="tablist" aria-label="Companion sections">${[['room','home','Pet room'],['shop','bag','Little shop'],['pass','book','Bond pass'],['achievements','star','Milestones']].map(([id,img,label])=>`<button class="tab" role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${id===tab}" tabindex="${id===tab?0:-1}" data-action="tab" data-value="${id}">${icon(img,19)}${label}${id==='pass'&&notices?`<span class="tab-count">${notices}</span>`:''}</button>`).join('')}</div>`;
}
export function scene(s,{preview=false}={}) {
  const room = roomInfo(s);
  const toggles=s.roomToggles?.[room.id]||{},windowOpen=toggles.windowOpen!==false,lightOn=toggles.lightOn!==false;
  const hotspots=preview?'':(ROOM_INTERACTIONS[room.id]||[]).map((p,index)=>{
    const active=p.action==='window'?windowOpen:lightOn;
    const label=p.action==='window'?`${active?'Close':'Open'} ${p.label}`:`Turn ${active?'off':'on'} ${p.label}`;
    return `<button type="button" class="scene-tinker architecture-toggle" data-action="tinker" data-kind="${p.action}" data-id="${room.id}" data-hotspot="${index}" aria-label="${escape(label)}" title="${escape(label)}" aria-pressed="${active}" style="left:${p.x/640*100}%;top:${p.y/360*100}%;width:${p.width/640*100}%;height:${p.height/360*100}%"></button>`;
  }).join('');
  const props = ['rug','left','right'].map(slot => {
    const id=s.equipped[slot] || (slot==='rug'?'default-mat':null);
    if(!id)return '';
    const p=ROOM_LAYOUT[slot],name=itemById(id)?.name||'Starter mat',luminous=LIGHT_DECOR_IDS.includes(id),active=s.decorToggles?.[id]!==false;
    const label=luminous?`Turn ${active?'off':'on'} ${name}`:`Tinker with ${name}`;
    return `<div class="world-decor slot-${slot}" data-decor="${escape(id)}" style="left:${p.x/640*100}%;top:${p.y/360*100}%;width:${p.width/640*100}%;height:${p.height/360*100}%"><span class="decor-art">${decorArt(id,{active})}</span>${preview?'':`<button type="button" class="scene-tinker furniture-toggle" data-action="tinker" data-kind="decor" data-id="${escape(id)}" aria-label="${escape(label)}" title="${escape(label)}" ${luminous?`aria-pressed="${active}"`:''}></button>`}</div>`;
  }).join('');
  const trip=!preview&&s.errand;
  return `<div class="scene ${preview?'scene-preview':''}" data-room="${escape(room.id)}"><div class="room-world"><div class="world-background" role="img" aria-label="${escape(room.name)} background">${roomArt(room.id,{windowOpen,lightOn})}</div>${hotspots}${props}
    <div class="fox-position"><div class="fox-button" ${!preview?'data-action="pet"':''} ${trip?'hidden':''} aria-label="Kemomimi. Use the Headpat button for keyboard interaction.">${characterCanvas()}</div></div></div>
    ${!preview?`<div class="speech" ${trip?'hidden':''}><span>I saved a little space for you.</span></div>`:''}
    ${trip?`<div class="errand-scene">${itemArt(s.errand.kind)}<strong>A little adventure</strong><small data-countdown>Back in ${timeLeft(s.errand.endsAt)}</small><button class="text-button" data-action="errand">Check in / call her home ${icon('arrow',12)}</button></div>`:''}
    ${!preview?`<span class="scene-hint">${trip?'HER NEXT STORY IS TAKING SHAPE':'TRY THE LIGHTS AND LITTLE THINGS'}</span>`:''}</div>`;
}
function stat(key,label,img,value) {
  return `<div class="stat ${key}"><div class="stat-label"><span>${icon(img,14)}${label}</span><span><b data-stat-number="${key}">${Math.round(value)}</b><em> / 100</em></span></div><div class="stat-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value)}"><div class="stat-fill" data-stat-bar="${key}" style="width:${value}%"></div></div></div>`;
}
export function weekly(s) {
  const streak=Math.min(5,s.attendance.streak);
  return `<section class="weekly-card"><div class="card-heading"><div><h2>${icon('calendar',18)}A little reason to return</h2><p>A thank-you for stopping by each week.</p></div><span class="streak-label">${streak} / 5 week streak</span></div><div class="weeks five-weeks">${[20,25,30,35,40].map((amount,i)=>`<div class="week ${i<streak?'attended':''} ${i===streak-1?'current':''}"><span class="week-stamp">${icon(i<streak?'check':'leaf',18)}</span><span>Week ${i+1}</span><strong>${leaves(amount)}</strong></div>`).join('')}</div><p class="weekly-note">${icon('leaf',12)}After week five, each visit brings 40 leaves. Quiet weeks pause your streak.</p></section>`;
}
export function room(s,readerUrl) {
  const info=roomInfo(s),set=getActiveSet(s),pass=getPass(s),care=getCareBonus(s),next=pass.rewards.find(x=>!x.claimed);
  return `<div class="room-grid"><div class="scene-card">${scene(s)}<div class="scene-footer"><div class="leaf-note">${icon('home',15)}<p>${escape(info.name)}</p></div><button class="text-button" data-action="collection">${icon('settings',14)}Room & wardrobe</button></div><div class="set-status ${set?'active':''}">${icon(set?'check':'spark',14)}${set?`${escape(set.name)} complete · +${Math.round(set.bonus*100)}% reading & adventure leaves`:'Complete a room set for a little extra luck.'}<button class="text-button" data-action="sets">View sets ${icon('arrow',12)}</button></div></div>
    <aside class="side-panel" aria-label="Companion care"><div class="pet-name"><div><h2>Kemomimi</h2><p>Your fox-eared reading friend</p></div><span class="bond-level">Tier ${pass.level} / 50</span></div><div class="mood-badge">${icon('spark',12)}<span data-status>${s.errand?'Finding a story to bring home':s.hunger<30||s.happiness<30?'A little sleepy, always safe':'Feeling right at home'}</span></div>
    <div class="stat-group">${stat('hunger','Fullness','bowl',s.hunger)}${stat('happiness','Happiness','heart',s.happiness)}${stat('energy','Energy','energy',s.energy)}</div>
    <div class="care-perks"><span class="${care.wellFed?'on':''}">${icon('bowl',12)}70+ fullness: +5% outing leaves</span><span class="${care.happy?'on':''}">${icon('heart',12)}70+ happiness: +5% reading EXP</span><span>${icon('energy',12)}Energy fuels outings; rest refills it.</span></div>
    <div class="actions"><button class="action primary" data-action="pet" ${s.errand?'disabled':''}>${icon('heart',16)}Headpat</button><button class="action" data-action="food" ${s.errand?'disabled':''}>${icon('bowl',16)}A little treat</button><button class="action wide" data-action="errand">${icon('compass',16)}${s.errand?'Call her home':'Send on an adventure'}${icon('arrow',13)}</button></div>
    <div class="bond"><div class="bond-label"><strong>Our next little milestone</strong><span>${pass.complete?'Complete':`${pass.current} / ${pass.needed} EXP`}</span></div><div class="stat-track" role="progressbar" aria-label="Bond pass progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pass.progress)}"><div class="stat-fill" style="width:${pass.progress}%"></div></div><button class="text-button" data-action="tab" data-value="pass">${pass.claimable.length?`${pass.claimable.length} rewards ready to claim`:pass.complete?'Your collection of memories':`Explore the bond pass`}${icon('arrow',12)}</button></div></aside></div>
    <div class="under-room">${weekly(s)}<div class="reading-card">${icon('book',25)}<h3>A chapter for you.<br>A new leaf for her.</h3><p>Stories grow your bond. Collect outfits, little keepsakes, and places to call home.</p><a href="${readerUrl}">Find your next read ${icon('arrow',14)}</a></div></div>
    <div class="shop-tease"><div class="section-top"><div><h2>A world of little escapes</h2><p>Three new room sets. A wardrobe for every mood.</p></div><button class="text-button" data-action="sets">Explore sets ${icon('arrow',14)}</button></div><div class="room-teasers">${ROOMS.filter(r=>r.id!=='nook').map(r=>`<button class="room-teaser" data-action="item" data-id="${r.itemId}"><div>${roomArt(r.id)}</div><strong>${escape(r.name)}</strong><small>${r.source==='pass'?'Exclusive bond-pass collection':'A cozy new chapter'}</small></button>`).join('')}</div></div>`;
}
function productPicture(s,item) {
  if(item.category==='room')return `<div class="product-room">${roomArt(item.id)}</div>`;
  if(item.category==='outfit')return previewCanvas(item.id,s.equipped.accessory);
  if(item.category==='wearable')return previewCanvas(s.equipped.outfit,item.id);
  return itemArt(item.id);
}
export function productCard(s,item) {
  const owned=s.owned.includes(item.id),equipped=isEquipped(s,item.id),locked=item.price==null&&!owned,permanent=equipped&&['room','outfit'].includes(item.slot);
  const tag=equipped?'Equipped':owned?'Yours to keep':item.source==='pass'?'Bond pass exclusive':null;
  return `<article class="product" data-item="${item.id}"><button class="product-picture" data-action="item" data-id="${item.id}" aria-label="Preview ${escape(item.name)}">${tag?`<span class="item-tag">${tag}</span>`:''}${productPicture(s,item)}</button><div class="product-copy"><h3>${escape(item.name)}</h3><p>${escape(item.description)}</p><div class="product-end"><span class="price">${owned?`${icon('check',13)} Collected`:locked?`${icon('lock',13)} Pass reward`:leaves(item.price)}</span>
    <button data-action="${locked?'pass-item':owned?'equip':'buy'}" data-id="${item.id}" aria-label="${locked?'Find in pass':permanent?'Equipped':owned?equipped?'Put away':'Equip':'Get'} ${escape(item.name)}" ${permanent||!owned&&!locked&&s.coins<item.price?'disabled':''}>${locked?'View pass':permanent?'Equipped':owned?equipped?'Put away':'Equip':item.category==='treat'?'Enjoy':'Get item'}</button></div></div></article>`;
}
export function shop(s,filter) {
  const count=s.owned.filter(id=>!['room-nook','outfit-base'].includes(id)).length;
  let items=CATALOG.filter(x=>x.price!==0||s.owned.includes(x.id));
  if(filter==='owned')items=items.filter(x=>s.owned.includes(x.id));
  else if(!['all','sets'].includes(filter))items=items.filter(x=>x.category===filter);
  return `<div class="shop-header"><div><div class="eyebrow">SMALL JOYS, GATHERED SLOWLY</div><h2>The little shop</h2><p>Dress for the day. Find a favorite place. Collect the whole set.</p></div><div class="coin-chip leaf-chip">${leaves(s.coins)}<small>leaves</small></div></div>
    <div class="filter-list" aria-label="Shop categories">${[['all','Everything'],['room','Rooms'],['outfit','Outfits'],['decor','Furniture'],['wearable','Accessories'],['treat','Treats'],['sets','Room sets'],['owned',`My collection (${count})`]].map(([id,label])=>`<button class="filter" data-action="filter" data-value="${id}" aria-pressed="${filter===id}">${label}</button>`).join('')}</div>
    ${filter==='sets'?setCards(s):`<div class="product-grid">${items.map(item=>productCard(s,item)).join('')}</div>`}<p class="shop-message">${icon('leaf',13)} Leaves are gathered through stories and play. Little joys, no checkout.</p>`;
}
export function setCards(s) {
  return `<div class="set-grid">${SETS.map(set=>{
    const room=ROOMS.find(r=>r.itemId===set.roomId||r.id===set.roomId),owned=set.itemIds.filter(id=>s.owned.includes(id)).length,active=getActiveSet(s)?.id===set.id;
    return `<article class="set-card"><div class="set-landscape">${roomArt(room?.id||set.roomId)}</div><div class="set-copy"><div class="set-title"><h3>${escape(set.name)}</h3><span class="bonus-pill">+${Math.round(set.bonus*100)}% leaves</span></div><p>${set.source==='pass'?'An exclusive keepsake from the bond pass.':'Equip the room and all three pieces for a small reading and adventure bonus.'}</p><div class="set-pieces">${set.itemIds.map(id=>{const item=itemById(id);return `<button data-action="item" data-id="${id}" class="set-piece ${s.owned.includes(id)?'owned':''}" title="${escape(item?.name)}" aria-label="Preview ${escape(item?.name)}">${item?.category==='room'?icon('home',24):itemArt(id)}<span>${s.owned.includes(id)?icon('check',10):icon('lock',10)}</span></button>`;}).join('')}</div><div class="set-bottom"><small>${owned} / ${set.itemIds.length} collected</small><button class="text-button" data-action="equip-set" data-id="${set.id}" ${owned<set.itemIds.length?'disabled':''}>${active?'Set equipped':'Equip collection'} ${icon('arrow',12)}</button></div></div></article>`;
  }).join('')}</div>`;
}
export function passView(s) {
  const pass=getPass(s);
  return `<div class="pass-hero"><div><div class="eyebrow">OUR STORY · PERMANENT COLLECTION</div><h2>A bond that keeps growing.</h2><p>Fifty little milestones. One long story together.</p><span class="pass-promise">${icon('leaf',13)}No season deadline. Your progress always stays.</span></div><div class="pass-level"><strong>${pass.level}<span> / 50</span></strong><small>tiers unlocked</small></div></div>
    <div class="pass-progress-row"><div class="pass-progress"><div><strong>${pass.complete?'Every chapter, treasured':`On the way to tier ${pass.nextLevel}`}</strong><span>${pass.complete?'Collection complete':`${pass.current} / ${pass.needed} EXP`}</span></div><div class="stat-track"><div class="stat-fill" style="width:${pass.progress}%"></div></div></div><div class="pass-controls"><button class="icon-button" data-action="pass-scroll" data-value="-1" aria-label="Previous pass rewards">${icon('arrow',18)}</button><button class="icon-button" data-action="pass-scroll" data-value="1" aria-label="Next pass rewards">${icon('arrow',18)}</button></div></div>
    <div class="pass-track" tabindex="0" role="region" aria-label="Bond pass rewards; scroll horizontally">${pass.rewards.map(r=>`<article class="pass-card ${r.unlocked?'unlocked':''} ${r.claimed?'claimed':''} ${r.level===50?'final-reward':''}" data-tier="${r.level}"><div class="pass-card-top"><span>TIER ${String(r.level).padStart(2,'0')}</span>${icon(r.claimed?'check':r.unlocked?'gift':'lock',14)}</div><div class="pass-art">${rewardArt(r)}</div><h3>${escape(r.name)}</h3><p>${r.role?`Includes ${escape(r.role.name)} role eligibility`:r.itemIds?.length?'An exclusive little keepsake':r.badge?'A badge for your growing story':r.leaves?`${r.leaves} leaves to make your own memories`:'Our longest story deserves something special.'}</p>${r.level===50?'<small class="reserved-gift">Final gift reserved · to be revealed</small>':''}<button class="pass-claim" data-action="claim-pass" data-level="${r.level}" ${!r.unlocked||r.claimed?'disabled':''}>${r.claimed?'Collected':r.unlocked?'Claim reward':`${r.xpRequired.toLocaleString()} EXP`}</button></article>`).join('')}</div>
    <div class="pass-info-grid"><div class="journal-note"><strong>The Moonlit Archive collection</strong><p>A room, its furniture, and an outfit found only on this pass. The full set gives +8% leaves; shop collections give +5%.</p></div><div class="journal-note"><strong>A badge every five tiers</strong><p>Every second badge also earns a Discord-role entitlement. Profile displays and Discord linking will connect later.</p></div></div>
    <section class="badge-shelf"><div class="section-top"><div><h2>Your growing story</h2><p>Small enough for a profile. Meaningful enough to keep.</p></div></div><div class="badge-row">${pass.rewards.filter(r=>r.badge).map(r=>`<div class="badge-tile ${s.badges.includes(r.badge.id)?'earned':''}">${badgeArt(r.level/5)}<strong>${escape(r.badge.name)}</strong><small>Tier ${r.level}${r.role?' · role reward':''}</small></div>`).join('')}</div></section>`;
}
export function achievementsView(s) {
  const complete=ACHIEVEMENTS.filter(a=>getAchievementProgress(s,a.id).claimed).length;
  return `<div class="shop-header"><div><div class="eyebrow">THE LITTLE THINGS ADD UP</div><h2>Milestones, made together.</h2><p>Read a little. Show some love. Find your favorite things.</p></div><span class="streak-label">${complete} / ${ACHIEVEMENTS.length} collected</span></div><div class="achievement-grid">${ACHIEVEMENTS.map(a=>{const p=getAchievementProgress(s,a.id);const symbols={chapters:'book',pets:'heart',errands:'compass',sets:'home'};return `<article class="achievement ${p.claimed?'claimed':''}"><div class="achievement-icon">${icon(symbols[a.metric]||'star',24)}</div><div class="achievement-content"><h3>${escape(a.name)}</h3><p>${escape(a.description)}</p><div class="achievement-progress"><div class="stat-track"><div class="stat-fill" style="width:${Math.min(100,p.progress)}%"></div></div><small>${Math.min(p.current,p.target)} / ${p.target}</small></div><div class="achievement-end"><span class="price">${leaves(a.leaves)}</span><button class="action" data-action="claim-achievement" data-id="${a.id}" ${!p.complete||p.claimed?'disabled':''}>${p.claimed?'Collected':p.complete?'Claim leaves':'In progress'}</button></div></div></article>`;}).join('')}</div>`;
}
export function errandDetails(s) {
  const trip=getErrandPreview(s);
  if(!trip)return '';
  return `<div class="trip-progress"><div>${itemArt(trip.kind)}</div><h3>${escape(trip.name)}</h3><p>Back in ${timeLeft(s.errand.endsAt)}. Or call her home whenever you like.</p><div class="stat-track"><div class="stat-fill" style="width:${trip.progress}%"></div></div><div class="recall-tiers">${[0,25,50,75,100].map(n=>`<span class="${trip.percent===n?'active':''}">${n}%</span>`).join('')}</div><div class="recall-reward"><strong>${trip.percent}% return reward</strong><span>${leaves(trip.leaves)} · ${trip.xp} EXP</span></div><p class="muted-note">Early rewards round down to the last quarter of the trip. Keepsakes need a full outing; spent energy stays spent.</p><button class="button-full" data-action="recall">Call her home now</button></div>`;
}
