(function(){
'use strict';
const APP_VERSION='v10.10.14';
const LEGACY='assets/multi-trip-context-legacy-v10.10.12.js?bridge='+Date.now();
try{
  const x=new XMLHttpRequest();
  x.open('GET',LEGACY,false);
  x.setRequestHeader('Cache-Control','no-cache');
  x.send(null);
  if((x.status>=200&&x.status<300)||x.status===0){(0,eval)(x.responseText+'\n//# sourceURL=multi-trip-context-legacy-v10.10.12.js');}
}catch(e){console.error('MultiTrip legacy bridge failed',e);}
function paintVersion(){
  document.querySelectorAll('#siteVersionBadge,#catalogVersion').forEach(b=>{
    if(!b)return;
    b.textContent=(document.documentElement.lang==='en'?'Version ':'版本 ')+APP_VERSION;
    b.classList.remove('outdated','offline');b.classList.add('current');
    b.title='已係最新版本 '+APP_VERSION;
  });
  const p=document.getElementById('multiTripUpdatePrompt');if(p)p.remove();
}
let paintTimer=null;
function keepVersionPainted(){paintVersion();if(!paintTimer)paintTimer=setInterval(paintVersion,700);setTimeout(()=>{if(paintTimer){clearInterval(paintTimer);paintTimer=null;}paintVersion();},8000);}
function hardReload(){
  if(sessionStorage.getItem('travelpilot.swReload.101014')==='1')return;
  sessionStorage.setItem('travelpilot.swReload.101014','1');
  const u=new URL(location.href);u.searchParams.set('_appv','10.10.14');location.replace(u.pathname+u.search+u.hash);
}
function forceServiceWorker(){
  if(!('serviceWorker' in navigator))return;
  let changed=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(changed)return;changed=true;hardReload();},{once:true});
  navigator.serviceWorker.register('sw.js?release=10.10.14',{scope:'./',updateViaCache:'none'}).then(reg=>{
    const kick=w=>{if(!w)return;if(w.state==='installed'||w.state==='activated'){try{w.postMessage({type:'SKIP_WAITING'});}catch(e){}}else w.addEventListener('statechange',()=>{if(w.state==='installed')try{w.postMessage({type:'SKIP_WAITING'});}catch(e){}});};
    kick(reg.waiting);kick(reg.installing);
    return reg.update().then(()=>{kick(reg.waiting);kick(reg.installing);});
  }).catch(()=>{});
  setTimeout(()=>{navigator.serviceWorker.getRegistration().then(reg=>{if(reg&&reg.waiting)try{reg.waiting.postMessage({type:'SKIP_WAITING'});}catch(e){}}).catch(()=>{});},1500);
}
if(window.MultiTrip)window.MultiTrip.version=APP_VERSION;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{keepVersionPainted();forceServiceWorker();},{once:true});else{keepVersionPainted();forceServiceWorker();}
window.addEventListener('pageshow',()=>{sessionStorage.removeItem('travelpilot.swReload.101014');keepVersionPainted();forceServiceWorker();});
})();
