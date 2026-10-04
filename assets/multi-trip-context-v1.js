(function(){
'use strict';
const APP_VERSION='v10.11.2';
const LEGACY_URL='assets/multi-trip-context-legacy-v10.10.12.js?appv=10.11.2-fix2';

function suppressStaleUpdatePrompts(){
  try{
    const style=document.createElement('style');
    style.id='multiTripPromptSuppressor';
    style.textContent='#multiTripUpdatePrompt,#tripv2UpdatePrompt,.tripv2-update{display:none!important;visibility:hidden!important;pointer-events:none!important}';
    if(!document.getElementById(style.id))(document.head||document.documentElement).appendChild(style);

    const remove=()=>{
      document.querySelectorAll('#multiTripUpdatePrompt,#tripv2UpdatePrompt').forEach(box=>box.remove());
    };
    remove();

    if(!window.__multiTripPromptObserver){
      window.__multiTripPromptObserver=new MutationObserver(remove);
      window.__multiTripPromptObserver.observe(document.documentElement,{childList:true,subtree:true});
    }
  }catch(e){}
}

suppressStaleUpdatePrompts();

function loadLegacy(){
  if(window.MultiTrip&&window.MultiTrip.__v1){suppressStaleUpdatePrompts();return;}
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
  suppressStaleUpdatePrompts();
}

loadLegacy();
try{if(window.MultiTrip)window.MultiTrip.version=APP_VERSION;}catch(e){}

function updateWorker(){
  if(!('serviceWorker' in navigator))return;
  navigator.serviceWorker.register('./sw.js?release=10.11.2-fix2',{scope:'./',updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{suppressStaleUpdatePrompts();updateWorker();},{once:true});
}else{
  suppressStaleUpdatePrompts();
  updateWorker();
}
})();
