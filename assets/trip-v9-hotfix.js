(function(){
'use strict';

if(window.__japan2027V901Hotfix)return;
window.__japan2027V901Hotfix=true;

const DATA=window.Japan2027EnhancementData||null;
const HOTFIX_VERSION='v9.0.1';
let modal=null;
let versionObserver=null;

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

function ensureDepartureChecklist(){
  if(!isTripInfo())return;
  const existing=document.getElementById('checklist');
  if(!existing||!DATA||!Array.isArray(DATA.departureChecklist))return;

  let section=document.getElementById('departure-checklist');
  if(!section){
    section=document.createElement('section');
    section.className='section';
    section.id='departure-checklist';
    section.innerHTML='<div class="section-header"><h2 class="section-title">🧳 香港出發前・已帶物品 Checklist</h2><div class="section-desc">呢份係離開香港前執行李用，唔同每日出車 Checklist。Tick 狀態會保留喺呢部 iPhone／PWA。</div><div class="departure-progress" id="departureProgress"></div></div><div class="section-body"><div id="departureChecklistGroups"></div><div class="departure-actions"><button type="button" id="resetDepartureChecklist">↺ 全部重設</button></div></div>';
    existing.parentNode.insertBefore(section,existing);

    const key='japanWinter2027DepartureChecklistV1';
    let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}');}catch(e){}
    const box=section.querySelector('#departureChecklistGroups');

    DATA.departureChecklist.forEach(group=>{
      const g=document.createElement('div');g.className='departure-group';
      const h=document.createElement('h3');h.textContent=group.group;g.appendChild(h);
      const grid=document.createElement('div');grid.className='departure-grid';
      group.items.forEach(([id,label])=>{
        const item=document.createElement('label');item.className='departure-item'+(saved[id]?' checked':'');
        const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!saved[id];
        const span=document.createElement('span');span.textContent=label;
        item.append(cb,span);
        cb.addEventListener('change',()=>{
          saved[id]=cb.checked;
          item.classList.toggle('checked',cb.checked);
          localStorage.setItem(key,JSON.stringify(saved));
          updateProgress();
        });
        grid.appendChild(item);
      });
      g.appendChild(grid);box.appendChild(g);
    });

    function updateProgress(){
      const all=section.querySelectorAll('input[type="checkbox"]');
      const done=section.querySelectorAll('input[type="checkbox"]:checked');
      const p=section.querySelector('#departureProgress');
      if(p)p.textContent='完成 '+done.length+' / '+all.length+(done.length===all.length&&all.length?'　✅ 可以出發':'');
    }
    updateProgress();

    const reset=section.querySelector('#resetDepartureChecklist');
    if(reset)reset.addEventListener('click',()=>{
      localStorage.removeItem(key);
      saved={};
      section.querySelectorAll('input[type="checkbox"]').forEach(cb=>{cb.checked=false;cb.closest('.departure-item')?.classList.remove('checked');});
      updateProgress();
    });
  }

  const nav=document.querySelector('.quick-nav-inner');
  if(nav&&!nav.querySelector('a[href="#departure-checklist"]')){
    const a=document.createElement('a');a.href='#departure-checklist';a.textContent='🧳 出發前';
    const before=nav.querySelector('a[href="#checklist"]');before?nav.insertBefore(a,before):nav.appendChild(a);
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

function setBadgeCurrent(badge){
  if(!badge)return;
  badge.classList.remove('offline','outdated');
  badge.classList.add('current');
  badge.textContent='版本 '+HOTFIX_VERSION;
  badge.title='已係最新版本 '+HOTFIX_VERSION;
  badge.dataset.v901Current='1';
}
function fixVersionBadge(){
  const badge=document.getElementById('siteVersionBadge');if(!badge)return;
  fetch('version.json?t='+Date.now(),{cache:'no-store'})
    .then(r=>r.ok?r.json():Promise.reject())
    .then(v=>{
      if(v&&v.version===HOTFIX_VERSION){
        setBadgeCurrent(badge);
        if(!versionObserver){
          versionObserver=new MutationObserver(()=>{
            if(badge.dataset.v901Current==='1'&&badge.textContent!=='版本 '+HOTFIX_VERSION)setBadgeCurrent(badge);
          });
          versionObserver.observe(badge,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});
        }
      }else{
        badge.dataset.v901Current='';
        if(versionObserver){versionObserver.disconnect();versionObserver=null;}
      }
    }).catch(()=>{});
}

function run(){
  removeDuplicateInfoButtons(document);
  ensureTripInfoNav();
  ensureDepartureChecklist();
  wireTripInfoButtons();
  fixVersionBadge();
}

document.addEventListener('click',e=>{
  const badge=e.target.closest?.('#siteVersionBadge');
  if(badge&&badge.dataset.v901Current==='1'){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return;
  }
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
