(function(){
'use strict';
if(window.__japan2027InfoIconRepairV1)return;
window.__japan2027InfoIconRepairV1=true;

const TRIP='shirakawago-shinhotaka-2027';
if(!/(?:^|\/)itinerary\.html$/.test(location.pathname))return;
const active=(new URLSearchParams(location.search).get('trip')||localStorage.getItem('multiTrip.activeTrip')||TRIP).trim();
if(active!==TRIP)return;

function norm(v){
 return String(v||'')
  .replace(/ⓘ|📍/g,' ')
  .replace(/[\uFE0F]/g,'')
  .replace(/\s+/g,' ')
  .trim();
}
function strippedTitle(v){
 return String(v||'').replace(/^\s*[\p{Extended_Pictographic}\uFE0F]+\s*/u,'').trim();
}
function eligible(card){
 const type=norm(card&&card.querySelector('.event-type')&&card.querySelector('.event-type').textContent);
 if(!type)return true;
 return !/(🚗|CHECK|HARD CUT|🍳|🍜|✈️|🚆|名鐵|入境|轉車|還車|入油|休息|溫泉\s*\/\s*休息|Gondola|步行|接駁|Check-out|CHECK-OUT|HOTEL|酒店|取車|租車)/i.test(type);
}
function bestMatch(h3){
 const data=window.Japan2027EnhancementData;
 if(!data||!Array.isArray(data.attractions))return null;
 const card=h3.closest('.timeline-card');
 const hay=norm([
  h3.textContent,
  h3.getAttribute('data-map'),
  h3.getAttribute('data-map-label'),
  card&&card.getAttribute('data-map'),
  card&&card.textContent
 ].filter(Boolean).join(' | '));
 let best=null,bestLen=0;
 data.attractions.forEach(a=>{
  const keys=[...(a.aliases||[]),strippedTitle(a.title)];
  keys.forEach(k=>{
   const n=norm(k);
   if(n&&hay.includes(n)&&n.length>bestLen){best=a;bestLen=n.length;}
  });
 });
 return best;
}
function ensureButton(h3,info){
 let b=h3.querySelector('.attraction-info-btn,.enhance-info-btn,.backup-info-btn,.v90-shrine-info-btn');
 if(b){
  if(!b.dataset.deepInfoId)b.dataset.deepInfoId=info.id;
  return false;
 }
 b=document.createElement('button');
 b.type='button';
 b.className='enhance-info-btn';
 b.textContent='ⓘ';
 b.dataset.deepInfoId=info.id;
 b.title='詳盡介紹：歷史、重要性、現場睇乜';
 b.setAttribute('aria-label','詳盡景點介紹：'+(info.title||info.id));
 h3.appendChild(b);
 return true;
}
function repair(){
 let added=0,matched=0;
 document.querySelectorAll('details.day .timeline-card h3').forEach(h3=>{
  const card=h3.closest('.timeline-card');
  if(!card||!eligible(card))return;
  const info=bestMatch(h3);
  if(!info)return;
  matched++;
  if(ensureButton(h3,info))added++;
 });
 document.documentElement.dataset.infoIconMatches=String(matched);
 document.documentElement.dataset.infoIconAdded=String(added);
 return {matched,added};
}
function schedule(){[0,180,450,900,1600,2800,4800,7000].forEach(t=>setTimeout(repair,t));}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('multitrip:itineraryrendered',()=>{[0,120,500].forEach(t=>setTimeout(repair,t));});
document.addEventListener('japan2027:languagechange',()=>{[0,250,800].forEach(t=>setTimeout(repair,t));});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.tripv2-choice'))[100,400,1000].forEach(t=>setTimeout(repair,t));},true);

window.Japan2027InfoIconRepair={repair};
})();
