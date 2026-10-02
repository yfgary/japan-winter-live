(function(){
'use strict';

if(window.__japan2027NoMutationObserversV2)return;
window.__japan2027NoMutationObserversV2=true;

/*
  The itinerary is built from static HTML/data on every reload. All enhancement
  scripts already perform their own initial pass, delayed startup passes, and
  explicit click handling for choices/modals. Whole-page MutationObservers are
  therefore unnecessary and were causing repeated D1-D9 rescans after normal
  UI changes. Replace MutationObserver with a no-op implementation on the
  itinerary page so no legacy script can start a long-running DOM watcher.
*/
class NoopMutationObserver{
  constructor(callback){this.callback=callback;}
  observe(){/* intentionally disabled */}
  disconnect(){/* nothing to disconnect */}
  takeRecords(){return [];}
}

window.MutationObserver=NoopMutationObserver;
})();
