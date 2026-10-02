(function(){
'use strict';

if(window.__japan2027TripPerformanceGuard)return;
window.__japan2027TripPerformanceGuard=true;

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
  The itinerary scripts only need observers during the first few seconds while
  delayed patches finish building the page. Keeping several whole-page observers
  alive forever makes every later DOM/class change rescan the complete itinerary,
  which can eventually stall Safari/Chrome. Stop those startup observers, then
  restore the browser's native constructor for anything created later.
*/
setTimeout(()=>{
  [...active].forEach(o=>o.disconnect());
  if(window.MutationObserver===GuardedMutationObserver){
    window.MutationObserver=NativeMutationObserver;
  }
},7500);

})();
