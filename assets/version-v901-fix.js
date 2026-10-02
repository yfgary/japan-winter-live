(function(){
'use strict';
if(window.__japan2027VersionV908Fix)return;
window.__japan2027VersionV908Fix=true;
const VERSION='v9.0.8';
function fix(){
  const b=document.getElementById('siteVersionBadge');if(!b)return;
  const offline=/離線/.test(b.textContent||'');
  b.classList.remove('outdated');
  b.classList.add(offline?'offline':'current');
  b.textContent='版本 '+VERSION+(offline?'・離線':'');
  b.title=(offline?'目前離線；本機版本 ':'已係最新版本 ')+VERSION;
}
function schedule(){[0,250,800,1800,3000,6000].forEach(t=>setTimeout(fix,t));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('online',()=>setTimeout(fix,250));
window.addEventListener('offline',()=>setTimeout(fix,50));
})();
