(function(){
'use strict';
if(window.MultiTrip&&window.MultiTrip.__v1)return;

const APP_VERSION='v10.2.0';
const DEFAULT_TRIP='shirakawago-shinhotaka-2027';
const STORAGE_KEY='multiTrip.activeTrip';
const params=new URLSearchParams(location.search);
const requested=(params.get('trip')||'').trim();
const saved=(localStorage.getItem(STORAGE_KEY)||'').trim();
const tripId=requested||saved||DEFAULT_TRIP;

const fallback={
 id:DEFAULT_TRIP,
 name:'白川鄉・新穗高之旅 2027',
 shortName:'白川鄉・新穗高 2027',
 subtitle:'日本中部冬季自駕・9日8夜',
 startDate:'2027-01-09',
 endDate:'2027-01-17',
 timezone:'Asia/Tokyo',
 features:{itinerary:true,tripInfo:true,attractions:true,liveCam:true,todayMode:true,drivingMode:true,weather:true,weatherScore:true,packingChecklist:true,bilingual:true,winterDriving:true,shinhotakaPlanner:true},
 pages:{itinerary:'itinerary.html',tripInfo:'trip-info.html',attractions:'attractions.html',liveCam:'live.html'}
};

let config=fallback;
let resolveReady;
const ready=new Promise(r=>resolveReady=r);

function currentPageType(){
 const p=location.pathname.split('/').pop()||'index.html';
 if(p==='itinerary.html')return'itinerary';
 if(p==='trip-info.html')return'tripInfo';
 if(p==='attractions.html')return'attractions';
 if(p==='live.html')return'liveCam';
 return'home';
}
function pageLabel(type){return({itinerary:'詳細行程',tripInfo:'旅程資料',attractions:'景點總覽',liveCam:'Live Cam'})[type]||'';}
function feature(name){return !config.features||config.features[name]!==false;}
function withTrip(url,id){
 try{
  const u=new URL(url,location.href);
  if(u.origin!==location.origin)return url;
  const file=u.pathname.split('/').pop();
  if(!['itinerary.html','trip-info.html','attractions.html','live.html'].includes(file))return url;
  u.searchParams.set('trip',id||config.id||tripId);
  return u.pathname.split('/').pop()+(u.search||'')+(u.hash||'');
 }catch(e){return url;}
}
function syncLinks(){
 const id=config.id||tripId;
 document.querySelectorAll('a[href]').forEach(a=>{
  const raw=a.getAttribute('href')||'';
  if(!raw||raw.startsWith('#')||raw.startsWith('javascript:'))return;
  const text=(a.textContent||'').trim();
  if((raw==='index.html'||raw.endsWith('/index.html'))&&/Live Cam/i.test(text)){
   a.setAttribute('href',withTrip('live.html'+(new URL(raw,location.href).hash||''),id));
   return;
  }
  const next=withTrip(raw,id);
  if(next!==raw)a.setAttribute('href',next);
 });
 document.querySelectorAll('.page-switch').forEach(sw=>{
  let home=sw.querySelector('a[data-multi-trip-home]');
  if(!home){
   home=document.createElement('a');home.href='index.html';home.dataset.multiTripHome='1';home.textContent='🏠 旅程';sw.insertBefore(home,sw.firstChild);
  }
 });
}
function syncVersion(){
 const ids=['siteVersionBadge','catalogVersion'];
 ids.forEach(id=>{const b=document.getElementById(id);if(!b)return;const offline=/離線|Offline/.test(b.textContent||'');b.classList.remove('outdated');b.classList.add(offline?'offline':'current');const en=document.documentElement.lang==='en';b.textContent=(en?'Version ':'版本 ')+APP_VERSION+(offline?(en?' · Offline':'・離線'):'');b.title=(offline?(en?'Offline; local version ':'目前離線；本機版本 '):(en?'Latest version ':'已係最新版本 '))+APP_VERSION;});
}
function syncBrand(){
 const type=currentPageType(),label=pageLabel(type),name=config.name||fallback.name,shortName=config.shortName||name;
 document.documentElement.dataset.tripId=config.id||tripId;
 document.documentElement.dataset.multiTrip='1';
 if(type!=='home')document.title=name+(label?'・'+label:'');
 const h=document.querySelector('header h1');
 if(h){
  const icon=type==='itinerary'?'🗓️':type==='tripInfo'?'🧳':type==='attractions'?'🗾':type==='liveCam'?'📹':'';
  h.textContent=(icon?icon+' ':'')+shortName+(type==='attractions'?'・景點總覽':'');
 }
 document.querySelectorAll('footer').forEach(f=>{if(/Japan Winter|Japan Winter Trip|Japan 2027/i.test(f.textContent||''))f.textContent=shortName+(label?'｜'+label:'');});
 syncLinks();syncVersion();
}
function setActive(id){if(id)localStorage.setItem(STORAGE_KEY,id);}
function switchTrip(id,target){if(!id)return;setActive(id);const file=target||'itinerary.html';location.href=file+'?trip='+encodeURIComponent(id);}

window.MultiTrip={
 __v1:true,
 version:APP_VERSION,
 get id(){return config.id||tripId;},
 get config(){return config;},
 ready,feature,withTrip,setActive,switchTrip,refresh:syncBrand,defaultTrip:DEFAULT_TRIP
};

setActive(tripId);
fetch('trips/'+encodeURIComponent(tripId)+'/trip.json?t='+Date.now(),{cache:'no-store'})
 .then(r=>{if(!r.ok)throw new Error('trip config');return r.json();})
 .then(c=>{config=Object.assign({},fallback,c||{});setActive(config.id||tripId);syncBrand();resolveReady(config);})
 .catch(()=>{config=Object.assign({},fallback,{id:tripId||DEFAULT_TRIP});syncBrand();resolveReady(config);});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncBrand,{once:true});else syncBrand();
[350,1200,2600,5200].forEach(t=>setTimeout(syncBrand,t));
})();
