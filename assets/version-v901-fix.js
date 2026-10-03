(function(){
'use strict';
if(window.__multiTripLegacyVersionBridge)return;
window.__multiTripLegacyVersionBridge=true;
function bridge(){
 if(window.MultiTrip&&typeof window.MultiTrip.refresh==='function'){
  window.MultiTrip.refresh();
  return;
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bridge,{once:true});else bridge();
window.addEventListener('online',()=>setTimeout(bridge,100));
window.addEventListener('offline',()=>setTimeout(bridge,100));
document.addEventListener('japan2027:languagechange',()=>setTimeout(bridge,0));
})();
