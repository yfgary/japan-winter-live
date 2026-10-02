(function(){
'use strict';
if(window.__japan2027V91VisitFix)return;
window.__japan2027V91VisitFix=true;
const DATA=window.Japan2027EnhancementData||null;
const V8=window.Japan2027V8||null;
if(!DATA||!V8)return;
function norm(v){return String(v||'').replace(/ⓘ|📍/g,'').replace(/\s+/g,' ').trim();}
function findAttraction(text){
 const n=norm(text);let best=null,len=0;
 (DATA.attractions||[]).forEach(a=>{
  (a.aliases||[]).forEach(x=>{if(x&&n.includes(x)&&x.length>len){best=a;len=x.length;}});
  const t=String(a.title||'').replace(/^\s*[\p{Extended_Pictographic}\uFE0F]+\s*/u,'').trim();
  if(t&&n.includes(t)&&t.length>len){best=a;len=t.length;}
 });
 return best;
}
function decorate(){
 ['d6','d7','d8'].forEach(id=>{
  const day=document.getElementById(id);if(!day)return;
  day.querySelectorAll('.timeline-card').forEach(card=>{
   const h=card.querySelector('h3');if(!h)return;
   const a=findAttraction(h.textContent);if(!a)return;
   if(!h.querySelector('.attraction-info-btn,.enhance-info-btn,.backup-info-btn,.v90-shrine-info-btn')){
    const b=document.createElement('button');b.type='button';b.className='enhance-info-btn';b.textContent='ⓘ';b.dataset.deepInfoId=a.id;b.title='詳盡介紹：歷史、重要性、現場睇乜';h.appendChild(b);
   }
   const v=V8.visits&&V8.visits[a.id];if(!v||card.querySelector('.visit-meta-card'))return;
   const box=document.createElement('div');box.className='visit-meta-card';
   box.innerHTML='<div class="visit-meta-line"><span>🕒 <strong>開門</strong> '+v.open+'</span><span>⏳ <strong>最後入場</strong> '+v.last+'</span><span>🚪 <strong>關門</strong> '+v.close+'</span><span>🎟️ <strong>收費</strong> '+v.fee+'</span></div>'+(v.note?'<div class="visit-meta-note">'+v.note+'</div>':'')+((v.photo&&v.photo.show)?'<div class="visit-photo-warning '+(v.photo.level||'caution')+'">'+v.photo.text+'</div>':'');
   card.appendChild(box);
  });
 });
 if(typeof window.addMapPins==='function')try{window.addMapPins();}catch(e){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{[1650,2300].forEach(t=>setTimeout(decorate,t));},{once:true});else [1650,2300].forEach(t=>setTimeout(decorate,t));
})();
