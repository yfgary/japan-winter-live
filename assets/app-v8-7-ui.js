(function(){
'use strict';
const data=window.Japan2027EnhancementData||null;
const SH_KEY='japanWinter2027_shinhotakaDay';

function placeUrl(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q||'');}
function extractMapQuery(a){
  const host=a?.closest?.('[data-map]');
  if(host?.dataset?.map)return host.dataset.map;
  if(a?.dataset?.mapQuery)return a.dataset.mapQuery;
  try{
    const u=new URL(a.href,location.href);
    const q=u.searchParams.get('destination')||u.searchParams.get('daddr')||u.searchParams.get('query');
    if(q)return q;
    const p=decodeURIComponent(u.pathname).split('/').filter(Boolean);
    if(p.includes('dir')&&p.length)return p[p.length-1];
  }catch(e){}
  return '';
}
function rewriteMapLinks(root){
  (root||document).querySelectorAll('a.map-pin,a.backup-map,a[href*="google.com/maps/dir"],a[href*="maps.google.com"]').forEach(a=>{
    const q=extractMapQuery(a);if(!q)return;
    a.href=placeUrl(q);a.title='Google Maps：開啟地點';a.setAttribute('aria-label','Google Maps：開啟地點 '+q);
  });
}

function itemHtml(time,type,title,jp,desc,map,opt){
  opt=opt||{};
  return '<div class="timeline-item '+(opt.cls||'')+'"><div class="time">'+time+'</div><div class="timeline-card'+(opt.hard?' hard-cut':'')+'"><span class="event-type">'+type+'</span>'+(opt.duration?'<span class="duration-badge">⏱ '+opt.duration+'</span>':'')+'<h3'+(map?' data-map="'+String(map).replace(/"/g,'&quot;')+'"':'')+'>'+title+'</h3>'+(jp?'<div class="jp-place-name">🇯🇵 '+jp+'</div>':'')+'<p>'+desc+'</p>'+(opt.price?'<span class="price">'+opt.price+'</span>':'')+'</div></div>';
}
function makeNode(time,type,title,jp,desc,map,dur,cls){const w=document.createElement('div');w.innerHTML=itemHtml(time,type,title,jp,desc,map,{duration:dur,cls:cls||''});return w.firstElementChild;}
function insertAfter(ref,node){if(ref&&node)ref.insertAdjacentElement('afterend',node);}
function findItem(day,needle){return [...(day?.querySelectorAll('.timeline-item')||[])].find(x=>(x.querySelector('h3')?.textContent||'').includes(needle))||null;}

function patchD2(){
  const day=document.getElementById('d2');if(!day||day.dataset.v87Patched==='1')return;
  const title=day.querySelector('.day-title'),route=day.querySelector('.day-route');
  if(title)title.textContent='🏯 松本城 → 輕井澤 Outlet → 千曲溫泉酒店';
  if(route)route.textContent='TABINO → 早餐 → 松本城（約1.5小時）→ 回酒店拎行李 → Times取車 → 輕井澤Outlet（2小時）→ 千曲；白絲瀑布＋鬼押出園保留Backup';
  const photo=day.querySelector('.photo-section');
  if(photo)photo.innerHTML='<div class="hero-photo"><img class="zoomable" src="assets/images/d2-matsumoto-day.jpg" alt="松本城冬日日景" data-caption="🏯 松本城・冬日日景" loading="lazy"><div class="photo-caption">🏯 松本城・冬日日景</div></div><div class="photo-gallery"><div class="photo-card"><img class="zoomable" src="assets/images/d2-shiraito.jpg" alt="Backup・白絲瀑布" data-caption="🔄 Backup・白絲瀑布" loading="lazy"><div class="photo-caption">🔄 Backup・白絲瀑布</div></div><div class="photo-card"><img class="zoomable" src="assets/images/d2-onioshidashi.jpg" alt="Backup・鬼押出園" data-caption="🔄 Backup・鬼押出園" loading="lazy"><div class="photo-caption">🔄 Backup・鬼押出園</div></div></div>';
  const tl=day.querySelector('.timeline');
  if(tl)tl.innerHTML=''+
    itemHtml('08:30–09:00','🍳 早餐','松本站附近・快速早餐','松本駅周辺','酒店不包早餐。食完直接步行去松本城，唔好坐低食太耐。',null,{duration:'30分鐘'})+
    itemHtml('09:00–09:15','🚶 步行','酒店 → 松本城','松本城','冬季路面可能有薄冰，步行預15分鐘。','松本城',{duration:'15分鐘'})+
    itemHtml('09:15–10:45','🏯 核心景點','國寶・松本城（日間）','松本城（まつもとじょう）','預足約1小時30分畀你影相＋參觀。主角係日間黑天守、護城河倒影同冬季北阿爾卑斯背景；10:45左右開始返酒店。','松本城',{duration:'1小時30分',price:'入城票以出發前官方最新票價為準'})+
    itemHtml('10:45–11:10','🚶／🧳','松本城 → TABINO・拎行李','たびのホテル lit 松本','步行返酒店拎寄存行李，再去Times。','TABINO HOTEL lit 松本',{duration:'25分鐘'})+
    itemHtml('11:10–11:30','🚗 租車','Times 松本站前・取4WD＋雪軚','タイムズカー松本駅前店','完成文件、車身／輪胎檢查同雪刷確認。呢版行程按約11點後取車；出發前確保Times最終預約時間同呢個安排一致。','Times Car Rental Matsumoto Station',{duration:'20分鐘'})+
    itemHtml('11:30–13:40','🚗 車','松本 → 輕井澤王子購物廣場','軽井沢・プリンスショッピングプラザ','用主要道路前往，冬季預約2小時10分Buffer；唔追Google細山路捷徑。','軽井沢・プリンスショッピングプラザ',{duration:'約2小時10分'})+
    itemHtml('13:40–15:40','🛍️ 購物＋午餐','輕井澤王子購物廣場','軽井沢・プリンスショッピングプラザ','完整保留2小時。午餐喺Outlet內解決，15:40左右準時離開。','軽井沢・プリンスショッピングプラザ',{duration:'2小時'})+
    itemHtml('15:40–17:05','🚗 車','輕井澤 → 千曲','軽井沢 → 千曲市','下午直接去溫泉酒店，保留冬季道路Buffer；唔再加白絲／鬼押。','Club Wyndham Chikumakan',{duration:'約1小時25分'})+
    itemHtml('17:05–17:25','♨️ Check-in','千曲館溫泉酒店・Club Wyndham','クラブウィンダム千曲館 長野','目標17:30前到酒店。Check-in後正式開始溫泉旅館時間。','Club Wyndham Chikumakan',{duration:'20分鐘'})+
    itemHtml('17:30後','♨️／🍽️','溫泉＋旅館晚餐','クラブウィンダム千曲館 長野','浸溫泉、休息，再按酒店安排食一泊二食晚餐。','Club Wyndham Chikumakan',{});
  day.dataset.v87Patched='1';
  if(typeof window.addMapPins==='function')try{window.addMapPins();}catch(e){}
}

function addHidaPair(dayId,afterNeedle,mode){
  const day=document.getElementById(dayId);if(!day||day.querySelector('.v87-hida-toshogu'))return;
  let ref=findItem(day,afterNeedle);if(!ref)return;
  if(mode==='d6'){
    const h=ref.querySelector('h3');if(h){h.textContent='飛驒大鐘乳洞 → 飛驒東照宮';h.dataset.map='飛騨東照宮';}
    const p=ref.querySelector('p');if(p)p.textContent='鐘乳洞返高山市區後直接去飛驒東照宮，唔需要先返酒店。';
  }
  const drive1=mode==='d7'?makeNode('16:00–16:10','🚗 車','Residence → 飛驒東照宮','レジデンスホテル高山駅前 → 飛騨東照宮','Check-in放低行李後短程去飛驒東照宮。','飛騨東照宮','10分鐘','v87-hida-drive1'):null;
  const a=makeNode(mode==='d6'?'16:00–16:20':'16:10–16:30','⛩️ 神社','飛驒東照宮・德川家康與飛驒匠人','飛騨東照宮（ひだとうしょうぐう）','正式加入主行程：重點睇本殿、唐門同透塀。免費參拜；社務所／御朱印時間以當日為準。','飛騨東照宮','20分鐘','v87-hida-toshogu');
  const drive2=makeNode(mode==='d6'?'16:20–16:30':'16:30–16:40','🚗 車','飛驒東照宮 → 豐川城山稻荷','飛騨東照宮 → 豊川城山稲荷','高山市內短程移動。','豊川城山稲荷','10分鐘','v87-hida-drive2');
  const b=makeNode(mode==='d6'?'16:30–16:50':'16:40–17:00','⛩️ 神社','豐川城山稻荷・朱紅鳥居','豊川城山稲荷（とよかわしろやまいなり）','同飛驒東照宮一程串連，影朱紅鳥居同寺社林景；免費參拜。','豊川城山稲荷','20分鐘','v87-toyokawa');
  const drive3=makeNode(mode==='d6'?'16:50–17:00':'17:00–17:10','🚗 車',mode==='d6'?'城山 → 高山地元超市':'城山 → Residence',mode==='d6'?'城山 → 高山市内スーパー':'城山 → レジデンスホテル高山駅前',mode==='d6'?'短程去超市補給。':'返Residence，之後仍保留時間準備三寺巡禮Bonus。',mode==='d6'?'高山駅':'Residence Hotel Takayama Station','10分鐘','v87-hida-drive3');
  let tail=ref;if(drive1){insertAfter(tail,drive1);tail=drive1;}insertAfter(tail,a);tail=a;insertAfter(tail,drive2);tail=drive2;insertAfter(tail,b);tail=b;insertAfter(tail,drive3);
  if(mode==='d6'){
    const shop=findItem(day,'高山地元超市');if(shop){const t=shop.querySelector('.time');if(t)t.innerHTML='17:00<span class="end-time">17:35</span>';const b1=shop.querySelector('.duration-badge');if(b1)b1.textContent='⏱ 35分鐘';}
    const onsen=[...day.querySelectorAll('.timeline-item')].find(x=>(x.querySelector('.event-type')?.textContent||'').includes('溫泉／休息'));if(onsen){const t=onsen.querySelector('.time');if(t)t.innerHTML='17:40<span class="end-time">19:00</span>';const b2=onsen.querySelector('.duration-badge');if(b2)b2.textContent='⏱ 1小時20分';}
  }
}

function addHirayu(dayId){
  const day=document.getElementById(dayId);if(!day||day.querySelector('.v87-hirayu'))return;
  const items=[...day.querySelectorAll('.timeline-item')];
  const lunch=items.find(x=>(x.querySelector('.event-type')?.textContent||'').includes('午餐')&&(x.querySelector('h3')?.textContent||'').includes('新穗高'));if(!lunch)return;
  const old=items.find(x=>{const h=x.querySelector('h3')?.textContent||'';return h.includes('新穗高 → 高山')||h.includes('新穗高 → 安曇野')||h.includes('新穗高 → 松本');});if(old)old.remove();
  let t;if(dayId==='d6')t=['13:30–14:05','14:05–14:25','14:25–15:15'];else if(dayId==='d7')t=['14:00–14:35','14:35–14:55','14:55–15:45'];else t=['13:30–14:00','14:00–14:20','14:20–16:00'];
  const a=makeNode(t[0],'🚗 車','新穗高 → 平湯神社','新穂高温泉 → 平湯神社','返程順住主要道路去平湯，唔需要折返。','平湯神社',dayId==='d8'?'30分鐘':'35分鐘','v87-hirayu-drive1');
  const b=makeNode(t[1],'⛩️ 神社','平湯神社・溫泉鄉信仰與白猿傳說','平湯神社（ひらゆじんじゃ）','正式加入新穗高日：20分鐘短停，參拜之餘理解平湯溫泉同白猿傳說；免費參拜。','平湯神社','20分鐘','v87-hirayu');
  const c=makeNode(t[2],'🚗 車',dayId==='d8'?'平湯 → 松本':'平湯 → 高山',dayId==='d8'?'平湯 → 松本市':'平湯 → 高山市',dayId==='d8'?'由平湯直接沿主要道路去松本，本身就順路。':'返回高山市區，保留冬季道路Buffer。',dayId==='d8'?'Iroha Grand Hotel Matsumoto Ekimae':(dayId==='d7'?'Residence Hotel Takayama Station':'Takayama Ouan'),dayId==='d8'?'約1小時40分':'約50分鐘','v87-hirayu-drive2');
  insertAfter(lunch,a);insertAfter(a,b);insertAfter(b,c);
  if(dayId==='d6'){const flex=findItem(day,'高山古街／地元超市');if(flex){const tm=flex.querySelector('.time');if(tm)tm.innerHTML='15:20<span class="end-time">16:15</span>';const bd=flex.querySelector('.duration-badge');if(bd)bd.textContent='⏱ 55分鐘';}}
  if(dayId==='d7'){const ck=findItem(day,'Residence Hotel');if(ck){const tm=ck.querySelector('.time');if(tm)tm.innerHTML='15:50<span class="end-time">16:10</span>';const bd=ck.querySelector('.duration-badge');if(bd)bd.textContent='⏱ 20分鐘';}}
  if(dayId==='d8'){const daio=findItem(day,'大王山葵農場');if(daio)daio.remove();const azu=findItem(day,'安曇野 → 松本');if(azu)azu.remove();const ht=findItem(day,'Iroha Grand Hotel');if(ht){const tm=ht.querySelector('.time');if(tm)tm.innerHTML='16:00<span class="end-time">16:30</span>';}}
}

function patchShrines(){
  const selected=localStorage.getItem(SH_KEY);
  ['d6','d7','d8'].forEach(id=>{const day=document.getElementById(id);day?.querySelectorAll('.v87-hida-toshogu,.v87-toyokawa,.v87-hida-drive1,.v87-hida-drive2,.v87-hida-drive3,.v87-hirayu,.v87-hirayu-drive1,.v87-hirayu-drive2').forEach(x=>x.remove());});
  if(selected==='d6'){addHirayu('d6');addHidaPair('d7','高山站前 Residence Hotel','d7');}
  else if(selected==='d7'){addHidaPair('d6','飛驒大鐘乳洞 → 高山','d6');addHirayu('d7');}
  else if(selected==='d8'){addHidaPair('d6','飛驒大鐘乳洞 → 高山','d6');addHirayu('d8');}
  if(typeof window.addMapPins==='function')try{window.addMapPins();}catch(e){}
}

function shrineCard(id,badge,zh,jp,note){
  const info=data?.attractions?.find(x=>x.id===id),q=(info?.aliases||[])[0]||jp;
  return '<div class="info-card"><h3>'+zh+' <button type="button" class="enhance-info-btn" data-deep-info-id="'+id+'" title="詳盡介紹">ⓘ</button> <a class="map-pin" data-map-query="'+q+'" href="'+placeUrl(q)+'" target="_blank" rel="noopener">📍</a></h3><p>🇯🇵 '+jp+'</p><p><span class="label label-blue">'+badge+'</span></p><p>'+note+'</p></div>';
}
function patchTripInfo(){
  const nav=document.querySelector('.quick-nav-inner');if(!nav)return;
  if(!nav.querySelector('a[href="#trains"]')){const base=nav.querySelector('a[href="#transport"]'),a=document.createElement('a');a.href='#trains';a.textContent='🚆 火車';base?.insertAdjacentElement('afterend',a);}
  if(!nav.querySelector('a[href="#shrines"]')){const base=nav.querySelector('a[href="#hotels"]'),a=document.createElement('a');a.href='#shrines';a.textContent='⛩️ 神社';base?.insertAdjacentElement('afterend',a);}
  if(!document.getElementById('trains')){const base=document.getElementById('transport'),s=document.createElement('section');s.className='section';s.id='trains';s.innerHTML='<div class="section-header"><h2 class="section-title">🚆 火車／車票</h2><div class="section-desc">D1、D9真正要用嘅鐵路、買票位置同Hard Cut。</div></div><div class="section-body"><div class="card-grid"><div class="info-card"><h3>名鐵 μSKY｜中部國際機場 → 名古屋</h3><p>🇯🇵 名鉄ミュースカイ</p><p>D1 去Access Plaza／中部國際空港站售票機或櫃位買乘車券＋μticket。</p></div><div class="info-card"><h3>JR 特急信濃｜名古屋 → 松本</h3><p>🇯🇵 特急しなの</p><p>D1規劃17:40左右班次；係最重要Hard Cut。機場排隊短可先喺Central Japan Travel Center出票，否則到JR名古屋站買。</p></div><div class="info-card"><h3>D9｜松本 → 名古屋</h3><p>🇯🇵 特急しなの</p><p>現行規劃約13:56 → 16:07；AEON、入油、還車全部要留Buffer。</p></div><div class="info-card"><h3>D9｜名古屋 → 中部國際機場</h3><p>🇯🇵 名鉄</p><p>現行規劃約16:49 → 17:17；到機場再確認UO685 Terminal。</p></div></div><div class="note-box">📌 2027年1月正式JR／名鐵時刻表要喺2026年12月再核對。</div></div>';base?.insertAdjacentElement('afterend',s);}
  if(!document.getElementById('shrines')){const base=document.getElementById('hotels'),s=document.createElement('section');s.className='section';s.id='shrines';s.innerHTML='<div class="section-header"><h2 class="section-title">⛩️ 神社／寺社短停</h2><div class="section-desc">已review實際行程：三個正式加入主線；日枝神社保留Backup，唔Cut核心景點。</div></div><div class="section-body"><div class="card-grid">'+shrineCard('hida-toshogu','D6或D7固定','飛驒東照宮','飛騨東照宮','按新穗高選擇日自動擺位：D6市區日，或者D7返回高山Check-in後。')+shrineCard('toyokawa-shiroyama-inari','D6或D7固定','豐川城山稻荷','豊川城山稲荷','同飛驒東照宮一程串連，短停15–20分鐘。')+shrineCard('hirayu-shrine','新穗高日固定','平湯神社','平湯神社','任何D6／D7／D8選定做新穗高，都會喺回程／去松本方向順路加入。')+shrineCard('hie-shrine','Backup','日枝神社','飛騨山王宮 日枝神社','高山市區主線提早完成先用；唔Cut高山陣屋、三町、鐘乳洞或新穗高。')+'</div></div>';base?.insertAdjacentElement('afterend',s);}
}

function addCredit(){const sm=[...document.querySelectorAll('summary')].find(x=>/Photo Credits/i.test(x.textContent||'')),d=sm?.closest('details');if(!d||d.querySelector('.v87-matsumoto-credit'))return;const p=document.createElement('p');p.className='v87-matsumoto-credit';p.innerHTML='松本城冬日日景 — Japanexperterna.se / CC BY-SA 3.0 — <a href="https://commons.wikimedia.org/wiki/File:Matsumoto_Castle_snow.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>';d.appendChild(p);}
function zoom(){document.addEventListener('click',e=>{const img=e.target.closest('#d2 img.zoomable');if(!img)return;const m=document.getElementById('photoModal'),mi=document.getElementById('modalImage'),c=document.getElementById('modalCaption');if(!m||!mi||!c)return;mi.src=img.src;mi.alt=img.alt;c.textContent=img.dataset.caption||img.alt;m.classList.add('show');document.body.style.overflow='hidden';});}

function apply(){patchD2();patchShrines();patchTripInfo();rewriteMapLinks(document);addCredit();}
function boot(){apply();zoom();document.addEventListener('click',e=>{if(e.target.closest('.tripv2-choice'))setTimeout(apply,180);});new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes?.length))setTimeout(()=>{rewriteMapLinks(document);patchTripInfo();},40);}).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
