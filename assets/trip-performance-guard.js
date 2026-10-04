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
    this._native.observe(target,options);
    if(!this._autoStop){
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
  Japan 2027 still has several legacy whole-page observers that only need the
  startup window while delayed patches finish rendering. Keep those observers
  functional, but batch callbacks and stop them after startup. Then restore the
  browser-native constructor so newer UI (Today/Driving modes and shared code)
  is not globally disabled or permanently wrapped.
*/
setTimeout(()=>{
  [...active].forEach(o=>o.disconnect());
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
