(function(){
'use strict';
if(window.__multiTripLegacyVersionBridge)return;
window.__multiTripLegacyVersionBridge=true;
function cleanup(){
 const shared=document.getElementById('siteVersionBadge');
 const legacy=document.getElementById('catalogVersion');
 if(shared&&legacy&&legacy!==shared)legacy.remove();
 const sharedTop=document.getElementById('backToTopBtn');
 document.querySelectorAll('.floating-top').forEach(el=>{if(sharedTop&&el!==sharedTop)el.remove();});
}
function bridge(){
 cleanup();
 if(window.MultiTrip&&typeof window.MultiTrip.refresh==='function')window.MultiTrip.refresh();
 setTimeout(cleanup,50);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bridge,{once:true});else bridge();
window.addEventListener('online',()=>setTimeout(bridge,100));
window.addEventListener('offline',()=>setTimeout(bridge,100));
document.addEventListener('japan2027:languagechange',()=>setTimeout(bridge,0));
[250,800,1800].forEach(t=>setTimeout(cleanup,t));
})();
