(function(){
'use strict';

function addCss(href){
  if(document.querySelector('link[href="'+href+'"]')) return;
  const l=document.createElement('link');
  l.rel='stylesheet';
  l.href=href;
  document.head.appendChild(l);
}

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[src="'+src+'"]');
    if(existing){resolve();return;}
    const s=document.createElement('script');
    s.src=src;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
}

addCss('assets/trip-enhancements-v2.css?v=2');

loadScript('assets/trip-enhancement-data.js?v=2')
  .then(()=>loadScript('assets/trip-user-overrides.js?v=2'))
  .then(()=>loadScript('assets/trip-enhancements-v2.js?v=2'))
  .catch(err=>console.error('Trip enhancements failed to load',err));
})();
