(function(){
'use strict';
if(window.__japan2027NavEnhancementsV1)return;
window.__japan2027NavEnhancementsV1=true;

function ensure(){
 document.querySelectorAll('.page-switch').forEach(function(sw){
  let a=sw.querySelector('a[data-travel-mode-link]');
  if(!a){
   a=document.createElement('a');
   a.href='itinerary.html?travel=1';
   a.dataset.travelModeLink='1';
   a.textContent='🧭 今日模式';
   const catalog=sw.querySelector('a[href="attractions.html"],a[href$="/attractions.html"]');
   if(catalog)sw.insertBefore(a,catalog);else sw.appendChild(a);
  }
  const active=/(?:^|\/)itinerary\.html$/.test(location.pathname)&&new URLSearchParams(location.search).get('travel')==='1';
  a.classList.toggle('active',active);
  if(active){
   const normal=sw.querySelector('a[href="itinerary.html"],a[href$="/itinerary.html"]');
   if(normal)normal.classList.remove('active');
  }
 });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
setTimeout(ensure,500);
})();