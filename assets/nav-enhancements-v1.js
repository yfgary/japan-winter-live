(function(){
'use strict';
if(window.__japan2027NavEnhancementsV2)return;
window.__japan2027NavEnhancementsV2=true;

function ensure(){
 document.querySelectorAll('.page-switch').forEach(function(sw){
  let travel=sw.querySelector('a[data-travel-mode-link]');
  if(!travel){
   travel=document.createElement('a');
   travel.href='itinerary.html?travel=1';
   travel.dataset.travelModeLink='1';
   travel.textContent='🧭 今日模式';
   const catalog=sw.querySelector('a[href="attractions.html"],a[href$="/attractions.html"]');
   if(catalog)sw.insertBefore(travel,catalog);else sw.appendChild(travel);
  }
  let drive=sw.querySelector('a[data-driving-mode-link]');
  if(!drive){
   drive=document.createElement('a');
   drive.href='itinerary.html?drive=1';
   drive.dataset.drivingModeLink='1';
   drive.textContent='🚗 揸車模式';
   const catalog=sw.querySelector('a[href="attractions.html"],a[href$="/attractions.html"]');
   if(catalog)sw.insertBefore(drive,catalog);else sw.appendChild(drive);
  }
  const q=new URLSearchParams(location.search),onItinerary=/(?:^|\/)itinerary\.html$/.test(location.pathname),travelActive=onItinerary&&q.get('travel')==='1',driveActive=onItinerary&&q.get('drive')==='1';
  travel.classList.toggle('active',travelActive);drive.classList.toggle('active',driveActive);
  if(travelActive||driveActive){const normal=sw.querySelector('a[href="itinerary.html"],a[href$="/itinerary.html"]');if(normal)normal.classList.remove('active');}
 });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
setTimeout(ensure,500);
})();