(function(){
'use strict';

const DATA=window.Japan2027EnhancementData;
if(!DATA||!Array.isArray(DATA.attractions))return;

const LOCATION_ORDER=['松本','輕井澤','上田','小布施／中野','澀溫泉／山之內','須坂','白馬','高山','奧飛驒／新穗高／平湯','白川鄉','飛驒古川','安曇野','其他'];

const META={
 'matsumoto-castle':{location:'松本',day:'D2 主行程｜D1 夜景 Bonus',status:'main',score:9.5},
 'nawate':{location:'松本',day:'D1／D8',status:'backup',score:7.0},
 'nakamachi':{location:'松本',day:'D8',status:'backup',score:7.0},
 'shiraito':{location:'輕井澤',day:'D2',status:'backup',score:7.8},
 'onioshidashi':{location:'輕井澤',day:'D2',status:'backup',score:7.6},
 'karuizawa-outlet':{location:'輕井澤',day:'D2',status:'main',score:7.5},
 'kumoba':{location:'輕井澤',day:'D2',status:'backup',score:6.8},
 'ueda-castle':{location:'上田',day:'D2',status:'backup',score:7.5},
 'yanagimachi':{location:'上田',day:'D2',status:'backup',score:6.5},
 'obuse':{location:'小布施／中野',day:'D3',status:'main',score:8.2},
 'hokusai':{location:'小布施／中野',day:'D3',status:'backup',score:7.5},
 'oranche':{location:'小布施／中野',day:'D3',status:'main',score:6.8},
 'ganshoin':{location:'小布施／中野',day:'D3',status:'backup',score:7.2},
 'shibu-onsen':{location:'澀溫泉／山之內',day:'D3',status:'main',score:9.0},
 'snow-monkey':{location:'澀溫泉／山之內',day:'D4',status:'main',score:9.0},
 'aeon-suzaka':{location:'須坂',day:'D4',status:'main',score:6.5},
 'suzaka-kura':{location:'須坂',day:'D4',status:'backup',score:7.0},
 'hakuba-iwatake':{location:'白馬',day:'D5',status:'main',score:9.0},
 'miyagawa':{location:'高山',day:'D6–D8 高山市區日',status:'main',score:7.5},
 'takayama-jinya':{location:'高山',day:'D6–D8 高山市區日',status:'main',score:8.5},
 'sanmachi':{location:'高山',day:'D6–D8 高山市區日',status:'main',score:9.0},
 'hida-cave':{location:'高山',day:'D6–D8 高山市區日',status:'main',score:8.0},
 'hida-no-sato':{location:'高山',day:'D5／D6',status:'backup',score:8.0},
 'yatai-kaikan':{location:'高山',day:'D5／D6',status:'backup',score:8.0},
 'shinhotaka':{location:'奧飛驒／新穗高／平湯',day:'D6–D8（揀最好天氣一日）',status:'main',score:9.5},
 'hirayu-no-mori':{location:'奧飛驒／新穗高／平湯',day:'D6–D8 新穗高日',status:'backup',score:8.5},
 'bear-park':{location:'奧飛驒／新穗高／平湯',day:'D6–D8 新穗高日',status:'backup',score:6.0},
 'shirakawago':{location:'白川鄉',day:'D6–D8（同新穗高互換）',status:'main',score:10.0},
 'wada-house':{location:'白川鄉',day:'白川鄉主行程日',status:'main',score:8.8},
 'ogimachi-view':{location:'白川鄉',day:'白川鄉主行程日',status:'main',score:9.5},
 'hida-furukawa':{location:'飛驒古川',day:'D7',status:'backup',score:8.0},
 'santera':{location:'飛驒古川',day:'D7・1/15限定',status:'backup',score:9.0},
 'daio':{location:'安曇野',day:'D8',status:'backup',score:7.5}
};

const NAME_META=[
 {match:['飛驒東照宮','飛騨東照宮'],location:'高山',day:'D6–D8 高山市區日',status:'main',score:7.8},
 {match:['豐川城山稻荷','豊川城山稲荷'],location:'高山',day:'D6–D8 高山市區日',status:'main',score:7.2},
 {match:['日枝神社'],location:'高山',day:'D6–D8',status:'backup',score:7.5},
 {match:['平湯神社'],location:'奧飛驒／新穗高／平湯',day:'D6–D8 新穗高日',status:'main',score:7.0},
 {match:['笠森稻荷','笠森稲荷'],location:'高山',day:'D6–D8',status:'backup',score:6.5}
];

function ensureExtraAttractions(){
 if(DATA.attractions.some(x=>/笠森稲荷|笠森稻荷/.test((x.title||'')+' '+(x.aliases||[]).join(' '))))return;
 DATA.attractions.push({
   id:'kasamori-inari',aliases:['笠森稲荷','笠森稻荷','笠森稲荷神社'],
   title:'⛩️ 笠森稻荷｜高山小型稻荷社',jp:'笠森稲荷神社（かさもりいなりじんじゃ）',
   why:'呢個位價值主要係紅色鳥居同高山市內短停攝影，而唔係大型歷史名勝。你本身想搵雪景＋鳥居，所以佢適合作為高山市區時間非常鬆時嘅小型 Backup。',
   background:'笠森稻荷屬高山市內較細規模嘅稻荷信仰地點，網上地圖標示同入口位置相對大型寺社唔算清晰。對今次旅程而言，重點係作為「短停鳥居景」而唔係為佢專程改路線。',
   look:['以朱紅鳥居、雪地同周邊樹木做構圖。','如果現場入口難搵、除雪差或者要兜路，就直接取消。','唔需要為完成打卡而壓縮高山陣屋、三町古街或新穗高等主景點。'],
   fit:'D6–D8高山市區日做 Backup；只有主行程明顯早完成、天色仍好先加。',winter:'小路除雪情況未必及大型景點；結冰／積雪深就唔入。',time:'約15–20分鐘。',source:'https://www.hidatakayama.or.jp/'
 });
}

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function arr(v){if(!v)return[];return Array.isArray(v)?v:[v];}
function plainTitle(v){return String(v||'').replace(/^\s*[\p{Extended_Pictographic}\uFE0F]+\s*/u,'').trim();}
function locationSlug(v){return 'loc-'+v.replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');}

function metaFor(a){
 let m=META[a.id];
 if(m)return m;
 const hay=[a.title,a.jp,...(a.aliases||[])].join(' ');
 const n=NAME_META.find(x=>x.match.some(q=>hay.includes(q)));
 if(n)return n;
 const fit=String(a.fit||'');
 const days=(fit.match(/D\d(?:\s*[／–-]\s*D?\d)*/g)||[]).join('／')||'行程內';
 return {location:'其他',day:days,status:/Backup|Optional|有時間|先加|候補|保留|Bonus/i.test(fit)?'backup':'main',score:7.0};
}

function patchLatestFits(){
 const sh=DATA.attractions.find(x=>x.id==='shiraito');if(sh)sh.fit='D2 Backup #1。完成松本城、取車同 Outlet 後仍明顯早過預期，而且即時導航仍可穩陣 17:30 前到千曲館先考慮。';
 const on=DATA.attractions.find(x=>x.id==='onioshidashi');if(on)on.fit='D2 Backup #2，優先級低過白絲瀑布。唔會為鬼押出園縮短 Outlet 或推遲千曲溫泉酒店。';
 const mc=DATA.attractions.find(x=>x.id==='matsumoto-castle');if(mc)mc.fit='D2 正式主行程：08:30 快早餐後步行去松本城，預約1.5小時影相／參觀；之後返酒店攞行李再取車。D1夜晚只係有時間先睇外觀／Projection Bonus。';
}

function mapQuery(a){return a.jp?plainTitle(a.jp.replace(/（.*?）/g,'')):plainTitle(a.title);}
function scoreText(n){return Number.isInteger(n)?n.toFixed(0)+'/10':n.toFixed(1)+'/10';}
function statusText(s){return s==='main'?'✅ 主行程':'🔄 後備景點';}

function sectionHtml(title,body,cls){if(!body)return'';return '<div class="cat-detail '+(cls||'')+'"><h4>'+title+'</h4>'+body+'</div>';}
function paras(v){return arr(v).filter(Boolean).map(x=>'<p>'+x+'</p>').join('');}
function bullets(v){const a=arr(v).filter(Boolean);return a.length?'<ul>'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'';}

function cardHtml(a,m,index){
 const why=a.whyLong||a.why||'';
 const history=a.history||a.background||'';
 const importance=a.importance||[];
 const look=a.visit||a.look||[];
 const understand=a.understand||'';
 const title=a.title||a.aliases?.[0]||a.id;
 return '<article class="cat-card" data-status="'+m.status+'" id="spot-'+esc(a.id||index)+'">'+
   '<div class="cat-card-head"><div class="cat-title-wrap"><h3>'+title+'</h3>'+(a.jp?'<div class="cat-jp">🇯🇵 '+a.jp+'</div>':'')+'</div><div class="cat-score">'+scoreText(m.score)+'</div></div>'+
   '<div class="cat-badges"><span class="cat-badge '+m.status+'">'+statusText(m.status)+'</span><span class="cat-badge day">🗓️ '+m.day+'</span><a class="cat-map" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(mapQuery(a))+'" target="_blank" rel="noopener">📍 Google Maps</a></div>'+
   '<details class="cat-full" open><summary>完整介紹</summary><div class="cat-full-body">'+
   sectionHtml('🧭 點解值得去',paras(why),'why')+
   sectionHtml('📚 歷史／背景',paras(history))+
   (arr(importance).length?sectionHtml('🏛️ 點解重要',bullets(importance)):'')+
   sectionHtml('👀 去到現場應該睇乜',bullets(look))+
   (understand?sectionHtml('💡 睇完應該明白乜',paras(understand)):'')+
   (a.fit?sectionHtml('🗺️ 行程安排',paras(a.fit),'fit'):'')+
   (a.winter?sectionHtml('❄️ 1月冬季重點',paras(a.winter),'winter'):'')+
   (a.time?'<div class="cat-time"><strong>⏱️ 建議停留：</strong>'+a.time+'</div>':'')+
   (a.source?'<a class="cat-source" href="'+esc(a.source)+'" target="_blank" rel="noopener">↗ 官方／主要資料來源</a>':'')+
   '</div></details></article>';
}

function render(){
 ensureExtraAttractions();
 patchLatestFits();
 const host=document.getElementById('catalogGroups');if(!host)return;
 const list=DATA.attractions.map((a,i)=>({a,m:metaFor(a),i}));
 const groups={};LOCATION_ORDER.forEach(x=>groups[x]=[]);
 list.forEach(x=>{if(!groups[x.m.location])groups[x.m.location]=[];groups[x.m.location].push(x);});
 Object.values(groups).forEach(g=>g.sort((x,y)=>(x.m.status===y.m.status?y.m.score-x.m.score:(x.m.status==='main'?-1:1))));
 const main=list.filter(x=>x.m.status==='main').length,backup=list.length-main;
 const count=document.getElementById('catalogCount');if(count)count.textContent='共 '+list.length+' 個景點｜主行程 '+main+'｜後備 '+backup;
 const nav=document.getElementById('locationNav');if(nav){nav.innerHTML=LOCATION_ORDER.filter(l=>groups[l]?.length).map(l=>'<a href="#'+locationSlug(l)+'">'+l+' <b>'+groups[l].length+'</b></a>').join('');}
 host.innerHTML=LOCATION_ORDER.filter(l=>groups[l]?.length).map(l=>'<section class="cat-group" id="'+locationSlug(l)+'"><div class="cat-group-head"><h2>📍 '+l+'</h2><span>'+groups[l].length+' 個</span></div><div class="cat-grid">'+groups[l].map(x=>cardHtml(x.a,x.m,x.i)).join('')+'</div></section>').join('');
 applyFilter('all');
}

function applyFilter(mode){
 document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter===mode));
 document.querySelectorAll('.cat-card').forEach(c=>c.hidden=mode!=='all'&&c.dataset.status!==mode);
 document.querySelectorAll('.cat-group').forEach(g=>g.hidden=![...g.querySelectorAll('.cat-card')].some(c=>!c.hidden));
}

document.addEventListener('click',e=>{
 const f=e.target.closest('.filter-btn');if(f){applyFilter(f.dataset.filter);return;}
 if(e.target.closest('#expandAll'))document.querySelectorAll('.cat-full').forEach(d=>d.open=true);
 if(e.target.closest('#collapseAll'))document.querySelectorAll('.cat-full').forEach(d=>d.open=false);
});

function version(){fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(v=>{const b=document.getElementById('catalogVersion');if(b)b.textContent='版本 '+(v.version||'')+'・build '+(v.build||'');}).catch(()=>{});}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{render();version();},40),{once:true});else setTimeout(()=>{render();version();},40);
})();
