(function(){
'use strict';
if(window.__japan2027VersionV911Fix)return;
window.__japan2027VersionV911Fix=true;
const VERSION='v9.1.1';
function fix(){
  const b=document.getElementById('siteVersionBadge');if(!b)return;
  const en=document.documentElement.lang==='en';
  const offline=/離線|Offline/.test(b.textContent||'');
  b.classList.remove('outdated');
  b.classList.add(offline?'offline':'current');
  b.textContent=(en?'Version ':'版本 ')+VERSION+(offline?(en?' · Offline':'・離線'):'');
  b.title=(offline?(en?'Offline; local version ':'目前離線；本機版本 '):(en?'Latest version ':'已係最新版本 '))+VERSION;
}
function schedule(){[0,250,800,1800,3000,6000].forEach(t=>setTimeout(fix,t));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('online',()=>setTimeout(fix,250));
window.addEventListener('offline',()=>setTimeout(fix,50));
})();
