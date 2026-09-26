(function(){
'use strict';

const data=window.Japan2027EnhancementData;
if(!data) return;

let modal,titleEl,bodyEl;
const byId=new Map(data.attractions.map(x=>[x.id,x]));

function norm(t){return (t||'').replace(/📍/g,'').replace(/ⓘ/g,'').replace(/\s+/g,' ').trim();}
function findAttraction(text){const n=norm(text);return data.attractions.find(a=>a.aliases.some(alias=>n.includes(alias)))||null;}
function findHotel(text){const n=norm(text);return data.hotels.find(h=>h.aliases.some(alias=>n.includes(alias)))||null;}

function ensureModal(){
 if(modal) return;
 modal=document.createElement('div');
 modal.id='tripEnhanceModal';
 modal.className='enhance-modal';
 modal.innerHTML='<div class="enhance-modal-card" role="dialog" aria-modal="true"><div class="enhance-modal-head"><h2 class="enhance-modal-title"></h2><button type="button" class="enhance-modal-close" aria-label="關閉">×</button></div><div class="enhance-modal-body"></div></div>';
 document.body.appendChild(modal);
 titleEl=modal.querySelector('.enhance-modal-title');
 bodyEl=modal.querySelector('.enhance-modal-body');
 modal.querySelector('.enhance-modal-close').addEventListener('click',closeModal);
 modal.addEventListener('click',e=>{if(e.target===modal) closeModal();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('show')) closeModal();});
}

function openModal(info){
 ensureModal();
 titleEl.textContent=info.title;
 bodyEl.innerHTML=
  '<div class="enhance-why"><h3>🧭 點解值得去</h3><p>'+info.why+'</p></div>'+
  '<div class="enhance-section"><h3>📚 背景／點解會有呢個地方</h3><p>'+info.background+'</p></div>'+
  '<div class="enhance-section"><h3>👀 去到應該睇乜</h3><ul>'+info.look.map(x=>'<li>'+x+'</li>').join('')+'</ul></div>'+
  '<div class="enhance-section"><h3>🗺️ 點解排喺你呢日行程</h3><p>'+info.fit+'</p></div>'+
  '<div class="enhance-section"><h3>❄️ 1月冬季重點</h3><p>'+info.winter+'</p></div>'+
  '<div class="enhance-time"><strong>⏱️ 建議停留：</strong>'+info.time+'</div>'+
  '<a class="enhance-source" href="'+info.source+'" target="_blank" rel="noopener">↗ 官方／主要資料來源</a>';
 modal.classList.add('show');
 document.body.style.overflow='hidden';
}
function closeModal(){if(!modal)return;modal.classList.remove('show');document.body.style.overflow='';}

function makeButton(info,cls='enhance-info-btn'){
 const b=document.createElement('button');
 b.type='button'; b.className=cls; b.textContent='ⓘ'; b.dataset.enhanceId=info.id;
 b.title='詳細介紹：點解值得去／背景／睇乜';
 b.setAttribute('aria-label','詳細景點介紹：'+info.title);
 return b;
}

/* Capture old attraction-info buttons before the old script's target handler fires. */
document.addEventListener('click',function(e){
 const btn=e.target.closest('.attraction-info-btn,.enhance-info-btn,.backup-info-btn');
 if(!btn) return;
 let info=null;
 if(btn.dataset.enhanceId) info=byId.get(btn.dataset.enhanceId)||null;
 if(!info){
  const host=btn.closest('h3,.backup-attraction-title');
  if(host) info=findAttraction(host.textContent);
 }
 if(!info) return;
 e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
 openModal(info);
},true);

function attractionEligible(card){
 if(!card) return true;
 const type=(card.querySelector('.event-type')?.textContent||'');
 return !/(🚗|🏨|CHECK|HARD CUT|🍳|🍜|✈️|🚆|還車)/.test(type);
}

function decorateMain(root){
 (root||document).querySelectorAll('.timeline-card h3').forEach(h3=>{
  if(!attractionEligible(h3.closest('.timeline-card'))) return;
  const info=findAttraction(h3.textContent);
  if(!info) return;
  const old=h3.querySelector('.attraction-info-btn');
  if(old){old.dataset.enhanceId=info.id;return;}
  if(!h3.querySelector('.enhance-info-btn')) h3.appendChild(makeButton(info));
 });
}

function clearOldHotelStatus(root){
 (root||document).querySelectorAll('.hotel-status-inline,.hotel-status-badges,.hotel-payment-line').forEach(x=>x.classList.add('legacy-hotel-status'));
}
function addArrivalBadges(container,h){
 if(container.querySelector('.arrival-status-inline')) return;
 const wrap=document.createElement('div'); wrap.className='arrival-status-inline';
 h.badges.forEach(([type,label])=>{const s=document.createElement('span');s.className='arrival-badge '+type;s.textContent=label;wrap.appendChild(s);});
 const detail=document.createElement('div');detail.className='arrival-payment-detail';detail.textContent=h.detail;
 container.appendChild(wrap); container.appendChild(detail);
}
function decorateHotels(root){
 clearOldHotelStatus(root);
 (root||document).querySelectorAll('.timeline-card h3').forEach(h3=>{
  const h=findHotel(h3.textContent); if(!h) return;
  const card=h3.closest('.timeline-card')||h3.parentElement;
  addArrivalBadges(card,h);
 });
 document.querySelectorAll('.hotel-row').forEach(row=>{
  if(row.dataset.arrivalStatusAdded==='true') return;
  const name=row.querySelector('.hotel-name'),note=row.querySelector('.hotel-note');
  if(!name||!note) return;
  const h=findHotel(name.textContent); if(!h) return;
  if(h.noteOverride) note.textContent=h.noteOverride;
  addArrivalBadges(name,h);
  row.dataset.arrivalStatusAdded='true';
 });
}

function mapsUrl(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);}
function makeBackupCard(item){
 const info=byId.get(item.id); if(!info) return null;
 const card=document.createElement('div');card.className='backup-attraction-card';
 const head=document.createElement('div');head.className='backup-attraction-title';
 const title=document.createElement('strong');title.textContent=info.title;head.appendChild(title);
 head.appendChild(makeButton(info,'backup-info-btn'));
 const map=document.createElement('a');map.className='backup-map';map.href=mapsUrl(info.aliases[0]);map.target='_blank';map.rel='noopener';map.textContent='📍';map.title='Google Maps';head.appendChild(map);
 card.appendChild(head);
 card.insertAdjacentHTML('beforeend','<div class="backup-row"><span>✅ 乜情況用</span><p>'+item.when+'</p></div><div class="backup-row"><span>🗺️ 最順路擺法</span><p>'+item.route+'</p></div><div class="backup-row backup-rule"><span>⚠️ 底線</span><p>'+item.rule+'</p></div>');
 return card;
}
function injectBackups(){
 Object.entries(data.backups).forEach(([dayId,items])=>{
  const day=document.getElementById(dayId); if(!day||day.querySelector('.backup-panel')) return;
  const panel=document.createElement('details');panel.className='backup-panel';
  panel.innerHTML='<summary>🧩 後備／早到景點 <span class="backup-count">'+items.length+' 個</span></summary><div class="backup-panel-body"><div class="backup-intro">主行程唔變；只係早到、路況差或天氣切換先用。每個後備位都寫明放喺邊個景點之後最順路。</div></div>';
  const body=panel.querySelector('.backup-panel-body');
  items.forEach(item=>{const c=makeBackupCard(item);if(c)body.appendChild(c);});
  if(['d6','d7','d8'].includes(dayId)){
   const x=document.createElement('div');x.className='backup-excluded';x.innerHTML='<strong>🚫 上高地唔列入後備</strong><span>1月屬冬季閉山期，冇一般觀光巴士／旅遊配套；今次唔用佢做臨時替代。</span>';body.appendChild(x);
  }
  day.appendChild(panel);
 });
}

function injectDepartureChecklist(){
 const existingChecklist=document.getElementById('checklist');
 if(!existingChecklist||document.getElementById('departure-checklist')) return;
 const section=document.createElement('section');section.className='section';section.id='departure-checklist';
 section.innerHTML='<div class="section-header"><h2 class="section-title">🧳 香港出發前・已帶物品 Checklist</h2><div class="section-desc">呢份係離開香港前用。Tick 狀態會保留喺呢部手機／PWA，下次開返仍然記得。</div><div class="departure-progress" id="departureProgress"></div></div><div class="section-body"><div id="departureChecklistGroups"></div><div class="departure-actions"><button type="button" id="resetDepartureChecklist">↺ 全部重設</button></div></div>';
 existingChecklist.parentNode.insertBefore(section,existingChecklist);
 const nav=document.querySelector('.quick-nav-inner');
 if(nav&&!nav.querySelector('a[href="#departure-checklist"]')){
  const a=document.createElement('a');a.href='#departure-checklist';a.textContent='🧳 出發前';
  const before=nav.querySelector('a[href="#checklist"]');if(before)nav.insertBefore(a,before);else nav.appendChild(a);
 }
 const key='japanWinter2027DepartureChecklistV1';let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}');}catch(e){}
 const box=section.querySelector('#departureChecklistGroups');
 data.departureChecklist.forEach(group=>{
  const g=document.createElement('div');g.className='departure-group';
  const h=document.createElement('h3');h.textContent=group.group;g.appendChild(h);
  const grid=document.createElement('div');grid.className='departure-grid';
  group.items.forEach(([id,label])=>{
   const item=document.createElement('label');item.className='departure-item'+(saved[id]?' checked':'');
   const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!saved[id];
   const span=document.createElement('span');span.textContent=label;item.append(cb,span);
   cb.addEventListener('change',()=>{saved[id]=cb.checked;item.classList.toggle('checked',cb.checked);localStorage.setItem(key,JSON.stringify(saved));update();});
   grid.appendChild(item);
  });
  g.appendChild(grid);box.appendChild(g);
 });
 const progress=section.querySelector('#departureProgress');
 function update(){const all=section.querySelectorAll('input[type="checkbox"]'),done=section.querySelectorAll('input[type="checkbox"]:checked');progress.textContent='完成 '+done.length+' / '+all.length+(done.length===all.length?'　✅ 可以出發':'');}
 update();
 section.querySelector('#resetDepartureChecklist').addEventListener('click',()=>{if(!confirm('重設所有「香港出發前」Checklist？'))return;saved={};localStorage.removeItem(key);section.querySelectorAll('input[type="checkbox"]').forEach(cb=>{cb.checked=false;cb.closest('.departure-item').classList.remove('checked');});update();});
}

function runAll(root=document){decorateMain(root);decorateHotels(root);}

document.addEventListener('DOMContentLoaded',()=>{
 ensureModal();
 runAll(document);
 injectBackups();
 injectDepartureChecklist();
 const target=document.querySelector('.container')||document.body;
 new MutationObserver(ms=>{
  let needs=false;
  ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1) needs=true;}));
  if(needs) setTimeout(()=>runAll(document),0);
 }).observe(target,{childList:true,subtree:true});
});

})();
