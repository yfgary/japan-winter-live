(function(){
'use strict';
const APP_VERSION='v10.11.2';
const LEGACY_URL='assets/multi-trip-context-legacy-v10.10.12.js?appv=10.11.2-fix1';
function suppressStaleUpdatePrompt(){
  try{
    const style=document.createElement('style');
    style.id='multiTripPromptSuppressor';
    style.textContent='#multiTripUpdatePrompt{display:none!important}';
    if(!document.getElementById(style.id))document.head.appendChild(style);
    const remove=()=>{const box=document.getElementById('multiTripUpdatePrompt');if(box)box.remove();};
    remove();
    if(document.body){
      const obs=new MutationObserver(remove);
      obs.observe(document.body,{childList:true,subtree:true});
      setTimeout(()=>obs.disconnect(),15000);
    }
  }catch(e){}
}
function loadLegacy(){
  if(window.MultiTrip&&window.MultiTrip.__v1){suppressStaleUpdatePrompt();return;}
  try{
    const x=new XMLHttpRequest();
    x.open('GET',LEGACY_URL,false);
    x.setRequestHeader('Cache-Control','no-cache');
    x.send(null);
    if((x.status>=200&&x.status<300)||x.status===0){
      let src=x.responseText||'';
      src=src.replace(/const APP_VERSION='v[^']+'/,"const APP_VERSION='v10.11.2'");
      (0,eval)(src+'\n//# sourceURL=multi-trip-context-legacy-v10.10.12.js');
    }
  }catch(e){console.error('MultiTrip legacy context load failed',e);}
  suppressStaleUpdatePrompt();
}
loadLegacy();
try{if(window.MultiTrip)window.MultiTrip.version=APP_VERSION;}catch(e){}
function updateWorker(){
  if(!('serviceWorker' in navigator))return;
  navigator.serviceWorker.register('./sw.js?release=10.11.2-fix1',{scope:'./',updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{suppressStaleUpdatePrompt();updateWorker();},{once:true});else{ suppressStaleUpdatePrompt();updateWorker(); }
})();
