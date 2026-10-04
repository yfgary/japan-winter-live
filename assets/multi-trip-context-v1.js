(function(){
'use strict';
const APP_VERSION='v10.11.1';
const LEGACY_URL='assets/multi-trip-context-legacy-v10.10.12.js?appv=10.11.1';
function loadLegacy(){
  if(window.MultiTrip&&window.MultiTrip.__v1)return;
  try{
    const x=new XMLHttpRequest();
    x.open('GET',LEGACY_URL,false);
    x.setRequestHeader('Cache-Control','no-cache');
    x.send(null);
    if((x.status>=200&&x.status<300)||x.status===0){
      let src=x.responseText||'';
      src=src.replace("const APP_VERSION='v10.10.12'","const APP_VERSION='v10.11.1'");
      (0,eval)(src+'\n//# sourceURL=multi-trip-context-legacy-v10.10.12.js');
    }
  }catch(e){console.error('MultiTrip legacy context load failed',e);}
}
loadLegacy();
try{if(window.MultiTrip)window.MultiTrip.version=APP_VERSION;}catch(e){}
let reloaded=false;
function reloadOnce(){
  if(reloaded||sessionStorage.getItem('travelpilot-sw-reloaded')==='10.11.1')return;
  reloaded=true;sessionStorage.setItem('travelpilot-sw-reloaded','10.11.1');
  const u=new URL(location.href);u.searchParams.set('_appv','10.11.1');location.replace(u.pathname+u.search+u.hash);
}
function updateWorker(){
  if(!('serviceWorker' in navigator))return;
  navigator.serviceWorker.addEventListener('controllerchange',reloadOnce,{once:true});
  navigator.serviceWorker.register('./sw.js?release=10.11.1',{scope:'./',updateViaCache:'none'}).then(async reg=>{
    const kick=w=>{if(!w)return;if(w.state==='installed'||w.state==='activated'){try{w.postMessage({type:'SKIP_WAITING'});}catch(e){}}else w.addEventListener('statechange',()=>{if(w.state==='installed')try{w.postMessage({type:'SKIP_WAITING'});}catch(e){};});};
    kick(reg.waiting);kick(reg.installing);
    try{await reg.update();}catch(e){}
    kick(reg.waiting);kick(reg.installing);
  }).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateWorker,{once:true});else updateWorker();
})();
