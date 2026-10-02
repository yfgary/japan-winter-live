(function(){
'use strict';
if(window.__japan2027LiveV92Sync)return;
window.__japan2027LiveV92Sync=true;

const KEY='japanWinter2027_shinhotakaDay';
const tpl=new Map();
const $=s=>document.querySelector(s);
const section=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const mapUrl=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q||'');
const chosen=()=>{const v=localStorage.getItem(KEY)||'';return ['d6','d7','d8'].includes(v)?v:'';};

function capture(){
 document.querySelectorAll('.cam-card').forEach(card=>{
  const h=card.querySelector('h3');
  const name=h?(h.textContent||'').replace(/\s+/g,' ').trim():'';
  if(name&&!tpl.has(name))tpl.set(name,card.cloneNode(true));
 });
}
function cloneCam(name){
 const x=tpl.get(name);if(!x)return null;
 const n=x.cloneNode(true);
 n.querySelectorAll('iframe.live-video').forEach(f=>{f.removeAttribute('src');const b=f.closest('.media-box');if(b)b.classList.remove('loaded');});
 n.querySelectorAll('img.live-img').forEach(i=>{i.removeAttribute('src');const b=i.closest('.media-box');if(b)b.classList.remove('loaded');});
 return n;
}
function rebuild(id,names){
 const el=section(id);if(!el)return;
 const grid=el.querySelector('.cam-grid');if(!grid)return;
 const frag=document.createDocumentFragment();
 names.forEach(name=>{const c=cloneCam(name);if(c)frag.appendChild(c);});
 if(frag.childNodes.length){grid.innerHTML='';grid.appendChild(frag);}
 const count=el.querySelector('.count');if(count)count.textContent=grid.querySelectorAll('.cam-card').length+' 個 Camera';
 if(el.open&&typeof loadSection==='function'){try{loadSection(el);}catch(e){}}
}
function places(id,items){
 const el=section(id);if(!el)return;
 let box=el.querySelector('.places-box');const grid=el.querySelector('.cam-grid');
 if(!box&&grid){box=document.createElement('div');box.className='places-box';box.innerHTML='<div class="places-title">📍 今日景點導航</div><div class="places-row"></div>';grid.insertAdjacentElement('beforebegin',box);}
 if(!box)return;const row=box.querySelector('.places-row');if(!row)return;
 row.innerHTML=items.map(x=>'<a class="map-link" href="'+mapUrl(x[1])+'" target="_blank" rel="noopener">📍 '+esc(x[0])+'</a>').join('');
}
function decision(id,title,steps,links){
 const el=section(id);if(!el)return;
 let box=el.querySelector('.decision-panel');const grid=el.querySelector('.cam-grid');
 if(!box&&grid){box=document.createElement('div');box.className='decision-panel';grid.insertAdjacentElement('beforebegin',box);}
 if(!box)return;
 box.innerHTML='<div class="decision-title">🌨️ '+esc(title)+'</div>'+steps.map(s=>'<div class="decision-step">'+esc(s)+'</div>').join('')+'<div class="decision-links">'+(links||[]).map(x=>'<a class="button" href="'+x[1]+'" target="_blank" rel="noopener">'+esc(x[0])+'</a>').join('')+'</div>';
}
function patch(id,cfg){
 const el=section(id);if(!el)return;
 const t=el.querySelector('.summary-title');if(t)t.textContent=cfg.title;
 const d=el.querySelector('.summary-desc');if(d)d.textContent=cfg.desc;
 const r=el.querySelector('.route-text');if(r)r.textContent=cfg.route;
 const nav=document.querySelector('.quick-nav a[data-day="'+id+'"]');if(nav)nav.textContent=cfg.nav;
 places(id,cfg.places||[]);
 if(cfg.decision)decision(id,cfg.decision.title,cfg.decision.steps,cfg.decision.links);
 rebuild(id,cfg.cams||[]);
}

const D2=['松本城及北阿爾卑斯','國道18號・追分','國道18號繞道・消防署附近','新輕井澤西交叉口','王子通','輕井澤站北口','千曲川・平和橋'];
const WHITE=['新穗高纜車・西穗高口','國道156號・岩瀨橋（往白川村）','國道156號・福島（往莊川）','國道156號・椿原（往莊川）'];
const SH=['新穗高纜車・西穗高口','國道158號・丹生川町茶屋野（往平湯）','國道158號・丹生川町久手（往平湯）','國道158號・平湯（往高山）','國道158號・大瀧橋（往平湯）'];
const CITY=['高山中橋','高山陣屋前','國道158號・丹生川町茶屋野（往平湯）','國道158號・丹生川町茶屋野（往高山）'];
const EAST=['國道158號・丹生川町久手（往平湯）','國道158號・平湯（往高山）','國道158號・乘鞍山道入口（往高山）'];
const uniq=a=>[...new Set(a)];

function cfgD2(){return{
 nav:'🏯 D2 松本城・輕井澤',title:'🏯 松本城・輕井澤・千曲',
 desc:'松本城（1.5小時）→ Times 取車 → 輕井澤 Outlet → 千曲',
 route:'08:30 快早餐 → 步行松本城（1.5小時）→ 返酒店攞行李 → Times 取車 → 輕井澤 Outlet（2小時）→ 千曲｜白絲瀑布／鬼押出園今次取消',
 places:[['松本城','Matsumoto Castle'],['Times 松本站前','Times Car Rental Matsumoto Station'],['輕井澤王子購物廣場','Karuizawa Prince Shopping Plaza'],['千曲館','Club Wyndham Chikumakan Nagano']],cams:D2
};}
function cfgWhite(day){return{
 nav:'🏘️ '+day.toUpperCase()+' 白川鄉',title:'🏘️ 白川鄉 Shirakawa-go',
 desc:day==='d6'?'白川鄉優先日；只有新穗高突然極好天先改計劃':'D6 已去新穗高，所以今日補白川鄉',
 route:'高山 → 白川鄉荻町合掌村 → 和田家 → 荻町城跡展望台 → 高山',
 places:[['白川鄉','Shirakawa-go'],['和田家','Wada House Shirakawa-go'],['荻町城跡展望台','Ogimachi Castle Observation Deck'],['高山住宿',day==='d7'?'Residence Hotel Takayama Station':'Takayama Ouan']],cams:WHITE,
 decision:{title:day.toUpperCase()+' 天氣決策',steps:['白川鄉只安排 D6 或 D7；D8 不再向西兜去白川鄉。','出發前照睇一次新穗高山頂；如果今日係三日唯一極佳能見度，可以即時改今日去新穗高。','白川鄉道路大雪／封路就安全優先。'],links:[['白川鄉交通 Live Cam','https://shirakawa-going.jp/tw/index.html'],['岐阜道路雪況','https://douro.pref.gifu.lg.jp/'],['新穗高運行狀況','https://shinhotaka-ropeway.jp/']]}
};}
function cfgSh(day){return{
 nav:'🚡 '+day.toUpperCase()+' 新穗高',title:'🚡 新穗高纜車 Shinhotaka Ropeway',
 desc:'今日已選做新穗高日；山頂能見度、風況同纜車運行正常先出發。',
 route:'高山 → 新穗高纜車 → 平湯神社'+(day==='d8'?' → 安房方向 → 松本':' → 高山'),
 places:[['新穗高纜車','Shinhotaka Ropeway'],['平湯神社','平湯神社'],[day==='d8'?'松本住宿':'高山住宿',day==='d8'?'Iroha Grand Hotel Matsumoto Ekimae':(day==='d7'?'Residence Hotel Takayama Station':'Takayama Ouan')]],cams:uniq(SH.concat(day==='d8'?EAST:[])),
 decision:{title:day.toUpperCase()+' 新穗高判斷',steps:['先睇西穗高口 Live Cam＋官方 Operation Status。','山頂清晰、風況可接受、纜車正常先出發。',day==='d8'?'D8 完成後一路向東返松本；白川鄉唔會放今日。':'完成新穗高後，其餘兩日自動分配白川鄉／高山市區＋鐘乳洞。'],links:[['新穗高運行狀況','https://shinhotaka-ropeway.jp/'],['岐阜道路雪況','https://douro.pref.gifu.lg.jp/']]}
};}
function cfgCity(day){return{
 nav:'🧊 '+day.toUpperCase()+' 高山・鐘乳洞',title:'🧊 高山市區・飛驒大鐘乳洞'+(day==='d8'?' → 松本':''),
 desc:day==='d7'?'高山市區＋飛驒大鐘乳洞；晚上三寺まいり只做 Bonus':'完成高山市區＋鐘乳洞後一路向東返松本',
 route:'宮川朝市 → 高山陣屋 → 三町古街 → 飛驒大鐘乳洞'+(day==='d8'?' → 平湯／安房 → 松本':' → 高山 → 1/15 三寺まいり Bonus'),
 places:[['宮川朝市','Miyagawa Morning Markets Takayama'],['高山陣屋','Takayama Jinya'],['三町古街','Sanmachi Suji Takayama'],['飛驒大鐘乳洞','Hida Great Limestone Cave'],[day==='d8'?'松本住宿':'三寺まいり Bonus',day==='d8'?'Iroha Grand Hotel Matsumoto Ekimae':'Hida-Furukawa Station']],cams:uniq(CITY.concat(day==='d8'?EAST:[])),
 decision:{title:day.toUpperCase()+' 道路重點',steps:['鐘乳洞位於高山東面方向。',day==='d8'?'鐘乳洞後直接經平湯／安房方向返松本。':'1/15 三寺まいり只係 Bonus；道路、體力、時間任何一樣唔理想就 Skip。','冬季 R158 以道路安全同即時導航為準。'],links:[['飛驒高山 Live Camera','https://www.hidatakayama.or.jp/index_10.html'],['岐阜道路雪況','https://douro.pref.gifu.lg.jp/']]}
};}
function cfgPlanD7(){return{nav:'🌨️ D7 彈性日',title:'🌨️ D7 新穗高／高山市區',desc:'視 D6 結果同新穗高天氣決定；1/15 三寺まいり只做 Bonus。',route:'新穗高 或 高山市區＋飛驒大鐘乳洞',places:[['新穗高纜車','Shinhotaka Ropeway'],['飛驒大鐘乳洞','Hida Great Limestone Cave'],['高山站','Takayama Station']],cams:uniq(SH.concat(CITY)),decision:{title:'D7 規劃模式',steps:['用上方「D6–D8 新穗高日子」鎖定日子。','如果 D6 已去新穗高，D7 就係白川鄉。','如果新穗高留 D8，D7 做高山市區＋鐘乳洞。'],links:[['新穗高運行狀況','https://shinhotaka-ropeway.jp/'],['岐阜道路雪況','https://douro.pref.gifu.lg.jp/']]}};}
function cfgPlanD8(){return{nav:'🚗 D8 東面→松本',title:'🚗 D8 剩餘東面行程 → 松本',desc:'D8 不再安排白川鄉；只會係新穗高或者高山市區＋鐘乳洞後返松本。',route:'新穗高／飛驒大鐘乳洞 → 平湯／安房方向 → 松本',places:[['新穗高纜車','Shinhotaka Ropeway'],['飛驒大鐘乳洞','Hida Great Limestone Cave'],['松本住宿','Iroha Grand Hotel Matsumoto Ekimae']],cams:uniq(SH.concat(EAST)),decision:{title:'D8 規劃模式',steps:['D8 永遠唔去白川鄉。','如果新穗高留 D8，朝早以 Live Cam／運行狀況作最後判斷。','如果新穗高已完成，D8 做高山市區＋鐘乳洞後直接返松本。'],links:[['新穗高運行狀況','https://shinhotaka-ropeway.jp/'],['岐阜道路雪況','https://douro.pref.gifu.lg.jp/']]}};}

function chooser(){
 let box=document.getElementById('livePlanChooserV92');if(box)return;
 const notice=$('.notice');if(!notice)return;
 box=document.createElement('section');box.id='livePlanChooserV92';box.className='decision-panel';box.style.margin='0 0 14px';
 box.innerHTML='<div class="decision-title">🌨️ D6–D8 新穗高日子｜同行程同步</div><div class="decision-step" id="livePlanStatusV92"></div><div class="decision-links"><button class="button" data-v92="d6">🚡 D6</button><button class="button" data-v92="d7">🚡 D7</button><button class="button" data-v92="d8">🚡 D8</button><button class="button secondary" data-v92="">重設／規劃模式</button><a class="button secondary" href="itinerary.html#d6">🗓️ 睇 D6–D8 行程</a></div>';
 notice.insertAdjacentElement('afterend',box);
 const cur=chosen();box.querySelector('#livePlanStatusV92').innerHTML=cur?'<strong>目前：</strong>'+cur.toUpperCase()+' 去新穗高｜白川鄉自動放 D6／D7；D8 不去白川鄉。':'<strong>目前：規劃模式。</strong> D6 白川鄉優先；到時睇新穗高 Live Cam 再決定 D6／D7／D8。';
 box.querySelectorAll('[data-v92]').forEach(b=>{if(cur&&b.dataset.v92===cur)b.style.boxShadow='0 0 0 3px #9fc4dd';b.onclick=()=>{const v=b.dataset.v92;if(v)localStorage.setItem(KEY,v);else localStorage.removeItem(KEY);location.reload();};});
}
function patchD3(){const el=section('d3');if(!el)return;el.querySelectorAll('.map-link').forEach(a=>{if(/JA/.test(a.textContent||'')){a.textContent='📍 JA中野市 Oranche';a.href=mapUrl('JA中野市 農産物産館 オランチェ');}});}
function run(){
 if(!section('d2'))return false;
 capture();
 patch('d2',cfgD2());patchD3();
 const v=chosen();
 if(v==='d6'){patch('d6',cfgSh('d6'));patch('d7',cfgWhite('d7'));patch('d8',cfgCity('d8'));}
 else if(v==='d7'){patch('d6',cfgWhite('d6'));patch('d7',cfgSh('d7'));patch('d8',cfgCity('d8'));}
 else if(v==='d8'){patch('d6',cfgWhite('d6'));patch('d7',cfgCity('d7'));patch('d8',cfgSh('d8'));}
 else{const x=cfgWhite('d6');x.nav='🏘️ D6 白川鄉優先';x.desc='D6 先以白川鄉做基準；如果新穗高突然極好天可即改 D6。';patch('d6',x);patch('d7',cfgPlanD7());patch('d8',cfgPlanD8());}
 chooser();
 document.documentElement.dataset.liveSync='v9.2';
 return true;
}
function boot(){let n=0;const go=()=>{n++;if(run()||n>=12)return;setTimeout(go,n<4?100:300);};go();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
