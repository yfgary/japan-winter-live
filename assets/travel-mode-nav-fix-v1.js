(function(){
'use strict';
if(window.__japan2027TravelModeNavFixV1)return;
window.__japan2027TravelModeNavFixV1=true;

function leaveTravelMode(hash){
  const overlay=document.getElementById('travelModeOverlay');
  if(overlay)overlay.hidden=true;
  document.body.style.overflow='';

  document.querySelectorAll('.page-switch a[data-travel-mode-link]').forEach(a=>a.classList.remove('active'));
  const normal=document.querySelector('.page-switch a[href="itinerary.html"],.page-switch a[href$="/itinerary.html"]');
  if(normal)normal.classList.add('active');

  const u=new URL(location.href);
  u.searchParams.delete('travel');
  u.hash=hash||'';
  history.replaceState({},'',u.pathname+(u.search||'')+(u.hash||''));

  const id=(hash||'').replace(/^#/,'');
  if(/^d[1-9]$/.test(id)){
    const day=document.getElementById(id);
    if(day&&day.tagName==='DETAILS')day.open=true;
  }

  requestAnimationFrame(()=>setTimeout(()=>{
    const target=id&&document.getElementById(id);
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
  },60));
}

document.addEventListener('click',function(e){
  const a=e.target.closest&&e.target.closest('#travelModeOverlay a[href]');
  if(!a)return;
  let url;
  try{url=new URL(a.getAttribute('href'),location.href);}catch(err){return;}
  if(url.origin!==location.origin)return;
  if(!/(?:^|\/)itinerary\.html$/.test(url.pathname))return;
  if(!url.hash)return;
  e.preventDefault();
  e.stopPropagation();
  leaveTravelMode(url.hash);
},true);

window.Japan2027TravelModeNavFix={leaveTravelMode};
})();
