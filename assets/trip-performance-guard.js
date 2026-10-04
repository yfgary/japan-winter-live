(function(){
'use strict';

if(window.__japan2027TripPerformanceGuard)return;
window.__japan2027TripPerformanceGuard=true;

const DEFAULT_TRIP='shirakawago-shinhotaka-2027';
const selectedTrip=(new URLSearchParams(location.search).get('trip')||DEFAULT_TRIP).trim();
if(!/(?:^|\/)itinerary\.html$/.test(location.pathname)||selectedTrip!==DEFAULT_TRIP)return;

const NativeMutationObserver=window.MutationObserver;
if(!NativeMutationObserver)return;

const active=new Set();

class GuardedMutationObserver{
  constructor(callback){
    this._callback=callback;
    this._pending=false;
    this._records=[];
    this._stopped=false;
    this._persistent=false;
    this._native=new NativeMutationObserver((records)=>{
      if(this._stopped)return;
      this._records.push(...records);
      if(this._pending)return;
      this._pending=true;
      setTimeout(()=>{
        this._pending=false;
        if(this._stopped)return;
        const batch=this._records.splice(0);
        if(!batch.length)return;
        try{this._callback(batch,this);}catch(err){console.error('Mutation observer callback failed',err);}
      },90);
    });
    active.add(this);
  }
  observe(target,options){
    if(this._stopped)return;
    /* i18n-v1 intentionally watches documentElement for nodes inserted later by
       Today/Driving mode. Keep that one observer alive; legacy itinerary
       observers watch body/.container and remain startup-bounded. */
    const isI18nRoot=typeof document!=='undefined'&&target===document.documentElement&&
      !!options&&options.childList===true&&options.subtree===true&&!options.attributes;
    if(isI18nRoot)this._persistent=true;
    this._native.observe(target,options);
    if(!this._persistent&&!this._autoStop){
      this._autoStop=setTimeout(()=>this.disconnect(),6500);
    }
  }
  disconnect(){
    if(this._stopped)return;
    this._stopped=true;
    this._records.length=0;
    if(this._autoStop)clearTimeout(this._autoStop);
    this._native.disconnect();
    active.delete(this);
  }
  takeRecords(){
    const nativeRecords=this._native.takeRecords();
    if(nativeRecords.length)this._records.push(...nativeRecords);
    return this._records.splice(0);
  }
}

window.MutationObserver=GuardedMutationObserver;

/*
  Japan 2027 still has two legacy whole-page observers that only need the
  startup window while delayed patches finish rendering. Keep those functional,
  but stop them after startup. The intentional i18n documentElement observer is
  left running so UI created later can still be translated. Then restore the
  browser-native constructor for every observer created after startup.
*/
setTimeout(()=>{
  [...active].filter(o=>!o._persistent).forEach(o=>o.disconnect());
  if(window.MutationObserver===GuardedMutationObserver){
    window.MutationObserver=NativeMutationObserver;
  }
},7500);

window.addEventListener('pagehide',()=>{
  [...active].forEach(o=>o.disconnect());
  if(window.MutationObserver===GuardedMutationObserver){
    window.MutationObserver=NativeMutationObserver;
  }
},{once:true});

})();
