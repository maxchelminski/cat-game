import {STORAGE_KEY,createState,normalizeState,advanceState,rewardCoins} from './engine.js';

let snapshot=createState(), storageAvailable=true, started=false, unsaved=false;
const listeners=new Set();
let localQueue=Promise.resolve();
function read(){
  if(unsaved)return snapshot;
  try {const raw=localStorage.getItem(STORAGE_KEY);return raw?normalizeState(JSON.parse(raw)):snapshot;}
  catch {storageAvailable=false;return snapshot;}
}
function save(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot));storageAvailable=true;unsaved=false;}
  catch{storageAvailable=false;unsaved=true;}
}
function notify(detail){for(const listener of listeners)listener(snapshot,detail);}
/** Web Locks serialize balance changes across tabs; a per-page queue is the fallback. */
export function transact(fn,label='change'){
  const run=()=>{
    snapshot=read();
    const now=Date.now();
    const catchup=advanceState(snapshot,now);
    const result=fn?.(snapshot,now);
    if(!document.hidden)snapshot.lastSeen=now;
    save();notify({label,result,catchup});
    return result;
  };
  const queued=()=>navigator.locks?.request?navigator.locks.request(STORAGE_KEY,run):run();
  const operation=localQueue.then(queued,queued);
  localQueue=operation.catch(()=>{});
  return operation;
}
export const getState=()=>snapshot;
export const isPersistent=()=>storageAvailable;
export function subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
export async function startSession(){
  if(started)return localQueue;
  started=true;
  await transact(null,'session');
}
window.addEventListener('storage',event=>{
  if(event.key===STORAGE_KEY){snapshot=read();notify({label:'sync'});}
});
document.addEventListener('visibilitychange',()=>{
  if(!started)return;
  if(document.hidden)transact((state,now)=>{state.lastSeen=now;},'tick');
  else transact(null,'resume');
});
// visibilitychange records actual departure. Do not rewrite a full, potentially stale
// save during pagehide: a long-hidden tab must never replace a newer tab's progress.
export async function rewardPetCoins(amount,reason='Chapter finished'){
  return transact((state,now)=>rewardCoins(state,amount,reason,now),'reading');
}
window.rewardPetCoins=rewardPetCoins;
