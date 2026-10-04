(function(){
'use strict';

if(window.__japan2027V901Hotfix)return;
window.__japan2027V901Hotfix=true;

const DATA=window.Japan2027EnhancementData||null;
let modal=null;

function isTripInfo(){return /(?:^|\/)trip-info\.html$/.test(location.pathname);}
function norm(t){return String(t||'').replace(/📍|ⓘ/g,'').replace(/\s+/g,' ').trim();}
function bestInfo(text){
  const n=norm(text);let best=null,bestLen=-1;
  (DATA?.attractions||[]).forEach(x=>(x.aliases||[]).forEach(a=>{if(a&&n.includes(a)&&a.length>bestLen){best=x;bestLen=a.length;}}));
  return best;
}
function byId(id){return (DATA?.attractions||[]).find(x=>x.id===id)||null;}
function paras(v){if(!v)return'';if(!Array.isArray(v))v=[v];return v.filter(Boolean).map(x=>'<p>'+x+'</p>').join('');}
function bullets(v){if(!v)return'';if(!Array.isArray(v))v=[v];return '<ul>'+v.filter(Boolean).map(x=>'<li>'+x+'</li>').join('')+'</ul>';}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function ensureModal(){
  if(modal)return;
  modal=document.createElement('div');
  modal.className='enhance-modal';
  modal.id='v901TripInfoModal';
  modal.innerHTML='<div class="enhance-modal-card" role="dialog" aria-modal="true"><div class="enhance-modal-head"><h2 class="enhance-modal-title"></h2><button type="button" class="enhance-modal-close" aria-label="關閉">×</button></div><div class="enhance-modal-body"></div></div>';
  document.body.appendChild(modal);
  const close=()=>{modal.classList.remove('show');document.body.style.overflow='';};
  modal.querySelector('.enhance-modal-close').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
}
function openInfo(info){
  if(!info)return;ensureModal();
  modal.querySelector('.enhance-modal-title').textContent=info.title||'';
  const why=info.whyLong||info.why||'';
  const hist=info.history||info.background||'';
  const imp=info.importance||[];
  const look=info.visit||info.look||[];
  modal.querySelector('.enhance-modal-body').innerHTML=
    (info.jp?'<div class="deep-jp-name">🇯🇵 '+esc(info.jp)+'</div>':'')+
    '<div class="deep-summary"><h3>🧭 點解值得去</h3>'+paras(why)+'</div>'+
    '<div class="deep-section"><h3>📚 歷史／背景</h3>'+paras(hist)+'</div>'+
    (imp&&imp.length?'<div class="deep-section"><h3>🏛️ 點解重要</h3>'+bullets(imp)+'</div>':'')+
    '<div class="deep-section"><h3>👀 去到現場應該睇乜</h3>'+bullets(look)+'</div>'+
    (info.fit?'<div class="deep-trip-fit"><strong>🗺️ 行程安排：</strong><br>'+info.fit+'</div>':'')+
    (info.winter?'<div class="deep-winter"><strong>❄️ 1月重點：</strong><br>'+info.winter+'</div>':'')+
    (info.time?'<div class="deep-time">⏱️ 建議停留：'+info.time+'</div>':'')+
    (info.source?'<a class="deep-source" href="'+esc(info.source)+'" target="_blank" rel="noopener">↗ 官方／主要資料來源</a>':'');
  modal.classList.add('show');document.body.style.overflow='hidden';
}

function removeDuplicateInfoButtons(root){
  (root||document).querySelectorAll('.timeline-card h3').forEach(h=>{
    const generics=[...h.querySelectorAll('.attraction-info-btn,.enhance-info-btn,.backup-info-btn')];
    const customs=[...h.querySelectorAll('.v90-shrine-info-btn')];
    if(generics.length){customs.forEach(b=>b.remove());generics.slice(1).forEach(b=>b.remove());}
    else if(customs.length>1){customs.slice(1).forEach(b=>b.remove());}
  });
}

function ensureTripInfoNav(){
  if(!isTripInfo())return;
  const nav=document.querySelector('.quick-nav-inner');if(!nav)return;
  if(!nav.querySelector('a[href="#trains"]')){
    const a=document.createElement('a');a.href='#trains';a.textContent='🚆 火車';
    const ref=nav.querySelector('a[href="#transport"]');ref?ref.insertAdjacentElement('afterend',a):nav.appendChild(a);
  }
  if(!nav.querySelector('a[href="#winter-shrines"]')){
    const a=document.createElement('a');a.href='#winter-shrines';a.textContent='⛩️ 神社';
    const ref=nav.querySelector('a[href="#hotels"]');ref?ref.insertAdjacentElement('afterend',a):nav.appendChild(a);
  }
}

function wireTripInfoButtons(){
  if(!isTripInfo())return;
  document.querySelectorAll('#winter-shrines .parking-main h3').forEach(h=>{
    let b=h.querySelector('.enhance-info-btn,.v90-shrine-info-btn,.attraction-info-btn');
    const info=bestInfo(h.textContent);if(!info)return;
    if(!b){b=document.createElement('button');b.type='button';b.className='enhance-info-btn';b.textContent='ⓘ';h.appendChild(b);}
    b.dataset.deepInfoId=info.id;
  });
}

function run(){
  removeDuplicateInfoButtons(document);
  ensureTripInfoNav();
  wireTripInfoButtons();
}

document.addEventListener('click',e=>{
  if(!isTripInfo())return;
  const b=e.target.closest('#winter-shrines .enhance-info-btn,#winter-shrines .v90-shrine-info-btn,#winter-shrines .attraction-info-btn');
  if(!b)return;
  const h=b.closest('h3');const info=(b.dataset.deepInfoId&&byId(b.dataset.deepInfoId))||bestInfo(h?.textContent||'');
  if(!info)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openInfo(info);
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
[120,350,800,1600,2600].forEach(t=>setTimeout(run,t));
})();
