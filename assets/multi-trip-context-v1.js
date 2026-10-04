(function(){
'use strict';
if(window.MultiTrip&&window.MultiTrip.__v1)return;

const APP_VERSION='v10.12.0';
const DEFAULT_TRIP='shirakawago-shinhotaka-2027';
const STORAGE_KEY='multiTrip.activeTrip';
const params=new URLSearchParams(location.search);
const requested=(params.get('trip')||'').trim();
const tripId=requested||DEFAULT_TRIP;

const fallback={
  id:DEFAULT_TRIP,
  name:'白川鄉・新穗高之旅 2027',
  shortName:'白川鄉・新穗高 2027',
  subtitle:'日本中部冬季自駕・9日8夜',
  startDate:'2027-01-09',
  endDate:'2027-01-17',
  timezone:'Asia/Tokyo',
  features:{
    itinerary:true,tripInfo:true,attractions:true,liveCam:true,
    todayMode:true,drivingMode:true,weather:true,weatherScore:true,
    weatherActivityProfiles:true,packingChecklist:true,bilingual:true,
    winterDriving:true,shinhotakaPlanner:true
  },
  pages:{itinerary:'itinerary.html',tripInfo:'trip-info.html',attractions:'attractions.html',liveCam:'live.html'}
};

let config=fallback;
let resolveReady;
let latestVersion=null;
let versionChecking=false;
const ready=new Promise(resolve=>{resolveReady=resolve;});

function currentPageType(){
  const page=location.pathname.split('/').pop()||'index.html';
  if(page==='itinerary.html')return'itinerary';
  if(page==='trip-info.html')return'tripInfo';
  if(page==='attractions.html')return'attractions';
  if(page==='live.html')return'liveCam';
  return'home';
}

function pageLabel(type){
  return({itinerary:'詳細行程',tripInfo:'旅程資料',attractions:'景點總覽',liveCam:'Live Cam'})[type]||'';
}

function feature(name){
  return !config.features||config.features[name]!==false;
}

function withTrip(url,id){
  try{
    const u=new URL(url,location.href);
    if(u.origin!==location.origin)return url;
    const file=u.pathname.split('/').pop();
    if(!['itinerary.html','trip-info.html','attractions.html','live.html'].includes(file))return url;
    u.searchParams.set('trip',id||config.id||tripId);
    return file+(u.search||'')+(u.hash||'');
  }catch(e){return url;}
}

/* Compatibility only: old trip pages still contain a retired update banner.
   Keep it visually disabled until those large legacy HTML files are migrated. */
function suppressRetiredUpdateUi(){
  if(!document.getElementById('multiTripRetiredUpdateUi')){
    const style=document.createElement('style');
    style.id='multiTripRetiredUpdateUi';
    style.textContent='#multiTripUpdatePrompt,#tripv2UpdatePrompt,.tripv2-update{display:none!important;visibility:hidden!important;pointer-events:none!important}';
    (document.head||document.documentElement).appendChild(style);
  }
  document.querySelectorAll('#multiTripUpdatePrompt,#tripv2UpdatePrompt').forEach(el=>el.remove());
}

function versionText(state){
  const en=document.documentElement.lang==='en';
  if(state==='offline')return(en?'Version ':'版本 ')+APP_VERSION+(en?' · Offline':'・離線');
  return(en?'Version ':'版本 ')+APP_VERSION;
}

function paintVersion(state){
  const en=document.documentElement.lang==='en';
  document.querySelectorAll('#siteVersionBadge,#catalogVersion').forEach(badge=>{
    badge.classList.remove('offline','outdated','current');
    badge.classList.add(state);
    badge.textContent=versionText(state);
    if(state==='outdated'&&latestVersion){
      badge.title=(en?'New version available: ':'網站有新版：')+latestVersion+(en?'. Reload the page to update.':'。重新開頁即可更新。');
    }else if(state==='offline'){
      badge.title=(en?'Offline; local version ':'目前離線；本機版本 ')+APP_VERSION;
    }else{
      badge.title=(en?'Current version ':'目前版本 ')+APP_VERSION;
    }
  });
}

function checkVersion(force){
  if(versionChecking)return Promise.resolve(latestVersion);
  const badge=document.getElementById('siteVersionBadge');
  if(!navigator.onLine){paintVersion('offline');return Promise.resolve(null);}
  versionChecking=true;
  if(force&&badge){badge.textContent='檢查版本…';badge.disabled=true;}
  return fetch('version.json?t='+Date.now(),{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error('version');return r.json();})
    .then(v=>{
      latestVersion=v&&v.version||null;
      paintVersion(latestVersion&&latestVersion!==APP_VERSION?'outdated':'current');
      return latestVersion;
    })
    .catch(()=>{paintVersion('offline');return null;})
    .finally(()=>{versionChecking=false;if(badge)badge.disabled=false;});
}

/* Kept as a public API for older modules. Updates are now user initiated only;
   there is no controllerchange listener and no automatic reload loop. */
function beginUpdate(){
  if(!navigator.onLine)return Promise.resolve(false);
  const doReload=()=>{
    const u=new URL(location.href);
    u.searchParams.set('_appv',latestVersion||APP_VERSION);
    location.replace(u.pathname+u.search+u.hash);
    return true;
  };
  if(!('serviceWorker' in navigator))return Promise.resolve(doReload());
  return navigator.serviceWorker.getRegistration()
    .then(reg=>reg?reg.update():null)
    .catch(()=>null)
    .then(doReload);
}

function ensureVersionBadge(){
  let badge=document.getElementById('siteVersionBadge');
  if(!badge){
    badge=document.createElement('button');
    badge.type='button';
    badge.id='siteVersionBadge';
    badge.className='site-version-badge';
    badge.setAttribute('aria-label','網站版本');
    document.body.appendChild(badge);
  }

  /* site-shell-v7 is legacy and still attaches its old v9 version handler.
     Once that shell has loaded, replace the DOM node once so its listeners keep
     pointing at a detached node. The visible badge is then owned only here. */
  if(window.__japan2027SiteShellV7&&badge.dataset.multiTripExclusive!=='1'){
    const clean=badge.cloneNode(true);
    clean.disabled=false;
    clean.dataset.multiTripExclusive='1';
    delete clean.dataset.multiTripBound;
    badge.replaceWith(clean);
    badge=clean;
  }

  badge.dataset.multiTripVersionOwner='1';
  if(!badge.dataset.multiTripBound){
    badge.dataset.multiTripBound='1';
    badge.addEventListener('click',event=>{
      event.stopImmediatePropagation();
      if(latestVersion&&latestVersion!==APP_VERSION)beginUpdate();
      else checkVersion(true);
    });
  }
  paintVersion(navigator.onLine?'current':'offline');
  checkVersion(false);
}

function cleanupLegacySharedUi(){
  const shared=document.getElementById('siteVersionBadge');
  const legacy=document.getElementById('catalogVersion');
  if(shared&&legacy&&legacy!==shared)legacy.remove();
  document.querySelectorAll('.floating-top').forEach(el=>el.remove());
  suppressRetiredUpdateUi();
}

function ensureSharedUi(){
  if(!document.querySelector('link[data-multi-trip-shared-ui]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='assets/multi-trip-shared-ui-v1.css?v=7';
    link.dataset.multiTripSharedUi='1';
    document.head.appendChild(link);
  }
  ensureVersionBadge();
  cleanupLegacySharedUi();
  let top=document.getElementById('backToTopBtn');
  if(!top){
    top=document.createElement('button');
    top.type='button';
    top.id='backToTopBtn';
    top.className='back-to-top-btn';
    top.textContent='↑';
    top.title='返頁頂';
    top.setAttribute('aria-label','返頁頂');
    document.body.appendChild(top);
    const refresh=()=>top.classList.toggle('show',window.scrollY>500);
    window.addEventListener('scroll',refresh,{passive:true});
    top.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    refresh();
  }
}

function syncLinks(){
  if(currentPageType()==='home')return;
  const id=config.id||tripId;
  const map={'itinerary.html':'itinerary','trip-info.html':'tripInfo','attractions.html':'attractions','live.html':'liveCam'};
  document.querySelectorAll('a[href]').forEach(a=>{
    const raw=a.getAttribute('href')||'';
    if(!raw||raw.startsWith('#')||raw.startsWith('javascript:'))return;
    let u;
    try{u=new URL(raw,location.href);}catch(e){return;}
    const file=u.pathname.split('/').pop();
    const f=map[file];
    if(!f)return;
    a.hidden=!feature(f);
    if(!a.hidden)a.setAttribute('href',withTrip(raw,id));
  });
  document.querySelectorAll('[data-feature-link]').forEach(a=>{
    const f=a.dataset.featureLink;
    if(f)a.hidden=!feature(f);
  });
  document.querySelectorAll('.page-switch').forEach(sw=>{
    if(sw.querySelector('a[data-multi-trip-home]'))return;
    const a=document.createElement('a');
    a.href='index.html';
    a.dataset.multiTripHome='1';
    a.textContent='🏠 旅程';
    sw.insertBefore(a,sw.firstChild);
  });
}

function ensureNav(){
  if(currentPageType()==='home')return;
  if(window.MultiTripNav&&typeof window.MultiTripNav.render==='function'){
    window.MultiTripNav.render();
    return;
  }
  if(document.querySelector('script[data-multi-trip-nav-loader]'))return;
  const s=document.createElement('script');
  s.src='assets/multi-trip-nav-v1.js?v=2';
  s.dataset.multiTripNavLoader='1';
  s.onload=()=>{if(window.MultiTripNav)window.MultiTripNav.render();};
  document.head.appendChild(s);
}

function syncBrand(){
  ensureSharedUi();
  const type=currentPageType();
  const label=pageLabel(type);
  const name=config.name||fallback.name;
  const shortName=config.shortName||name;
  document.documentElement.dataset.tripId=config.id||tripId;
  document.documentElement.dataset.multiTrip='1';
  if(type!=='home')document.title=name+(label?'・'+label:'');
  const h=document.querySelector('header h1');
  if(h&&type!=='home'){
    const icon=type==='itinerary'?'🗓️':type==='tripInfo'?'🧳':type==='attractions'?'🗾':type==='liveCam'?'📹':'';
    h.textContent=(icon?icon+' ':'')+shortName+(type==='attractions'?'・景點總覽':'');
  }
  const hp=document.querySelector('header p');
  if(hp&&type==='itinerary')hp.textContent=(config.subtitle||'')+(label?'・'+label:'');
  document.querySelectorAll('footer').forEach(f=>{
    if(type!=='home'&&/Japan Winter|Japan Winter Trip|Japan 2027|Multi Trip/i.test(f.textContent||''))f.textContent=shortName+(label?'｜'+label:'');
  });
  syncLinks();
  ensureNav();
}

function setActive(id){
  if(!id)return;
  try{localStorage.setItem(STORAGE_KEY,id);}catch(e){}
}
function shouldPersistActive(){return currentPageType()!=='home'||!!requested;}
function switchTrip(id,target){
  if(!id)return;
  setActive(id);
  location.href=(target||'itinerary.html')+'?trip='+encodeURIComponent(id);
}

function registerServiceWorker(){
  if(!('serviceWorker' in navigator)||window.__travelPilotSwRequested)return;
  window.__travelPilotSwRequested=true;
  navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
}

window.MultiTrip={
  __v1:true,
  version:APP_VERSION,
  get id(){return config.id||tripId;},
  get config(){return config;},
  ready,
  feature,
  withTrip,
  setActive,
  switchTrip,
  refresh:syncBrand,
  checkVersion,
  beginUpdate,
  defaultTrip:DEFAULT_TRIP
};

suppressRetiredUpdateUi();
if(shouldPersistActive())setActive(tripId);

fetch('trips/'+encodeURIComponent(tripId)+'/trip.json?t='+Date.now(),{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('trip config');return r.json();})
  .then(c=>{
    config=Object.assign({},fallback,c||{});
    if(shouldPersistActive())setActive(config.id||tripId);
    syncBrand();
    resolveReady(config);
  })
  .catch(()=>{
    config=Object.assign({},fallback,{id:tripId||DEFAULT_TRIP});
    syncBrand();
    resolveReady(config);
  });

window.addEventListener('online',()=>{paintVersion('current');setTimeout(()=>checkVersion(false),50);});
window.addEventListener('offline',()=>paintVersion('offline'));
window.addEventListener('pageshow',()=>setTimeout(()=>{suppressRetiredUpdateUi();ensureVersionBadge();checkVersion(false);},250));

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{syncBrand();suppressRetiredUpdateUi();},{once:true});
  window.addEventListener('load',registerServiceWorker,{once:true});
}else{
  syncBrand();
  registerServiceWorker();
}
[350,1200,2600].forEach(t=>setTimeout(()=>{syncBrand();suppressRetiredUpdateUi();},t));
})();
