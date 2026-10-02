(function(){
'use strict';

if(window.__japan2027LiveV91Sync)return;
window.__japan2027LiveV91Sync=true;

const KEY='japanWinter2027_shinhotakaDay';
const VERSION='v9.0.1';

function selected(){
  const v=localStorage.getItem(KEY)||'';
  return ['d6','d7','d8'].includes(v)?v:'';
}
function mapSearch(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q||'');}
function cloneCam(c,desc,priority){
  if(!c)return null;
  return Object.assign({},c,desc?{desc}:null,priority?{priority}:null);
}

let allSections=[];
try{ if(typeof sections!=='undefined'&&Array.isArray(sections)) allSections=sections; }catch(e){}
if(!allSections.length)return;

const camMap=new Map();
allSections.forEach(s=>(s.cams||[]).forEach(c=>{if(c&&c.name&&!camMap.has(c.name))camMap.set(c.name,c);}));
const C=(name,desc,priority)=>cloneCam(camMap.get(name),desc,priority);
const compact=arr=>arr.filter(Boolean);
const S=id=>allSections.find(x=>x.id===id);

function setD2(){
  const s=S('d2');if(!s)return;
  s.nav='🏯 D2 松本城・輕井澤';
  s.title='🏯 松本城・輕井澤・千曲';
  s.desc='松本城（1.5小時）→ Times 取車 → 輕井澤 Outlet → 千曲';
  s.route='08:30 快早餐 → 步行松本城（1.5小時）→ 返酒店攞行李 → Times 取車 → 輕井澤 Outlet（2小時）→ 千曲｜白絲瀑布／鬼押出園今次取消';
  s.places=[
    {name:'松本城',query:'Matsumoto Castle'},
    {name:'Times 松本站前',query:'Times Car Rental Matsumoto Station'},
    {name:'輕井澤王子購物廣場',query:'Karuizawa Prince Shopping Plaza'},
    {name:'千曲館',query:'Club Wyndham Chikumakan Nagano'}
  ];
  s.cams=compact([
    C('松本城及北阿爾卑斯','朝早先睇松本市區天氣、松本城周邊積雪同能見度。','must'),
    C('國道18號・追分','松本 → 輕井澤 Outlet：查看輕井澤西面主要道路積雪。','must'),
    C('國道18號繞道・消防署附近','進入輕井澤市區前查看路面及車流。','must'),
    C('新輕井澤西交叉口','前往輕井澤王子購物廣場前查看市區道路。','must'),
    C('王子通','Outlet 周邊道路、積雪及車流。','must'),
    C('輕井澤站北口','Outlet／車站一帶天氣及積雪參考。','ref'),
    C('千曲川・平和橋','輕井澤 → 千曲：接近今晚酒店前查看千曲一帶天氣。','must')
  ]);
}

const whiteCams=()=>compact([
  C('新穗高纜車・西穗高口','朝早先睇一次新穗高山頂。如果突然係三日唯一極好天，仍可即時改今日去新穗高。','must'),
  C('國道156號・岩瀨橋（往白川村）','高山 → 白川鄉：查看白川村方向雪況。','must'),
  C('國道156號・福島（往莊川）','白川鄉周邊道路積雪及能見度。','must'),
  C('國道156號・椿原（往莊川）','白川村周邊雪況補充參考。','ref')
]);
const shCams=()=>compact([
  C('新穗高纜車・西穗高口','今日最重要：確認山頂能見度、雲量同纜車是否值得去。','must'),
  C('國道158號・丹生川町茶屋野（往平湯）','高山 → 新穗高：離開高山市後山路雪況。','must'),
  C('國道158號・丹生川町久手（往平湯）','進入高海拔區前查看路面積雪及結冰。','must'),
  C('國道158號・平湯（往高山）','平湯／新穗高回程道路積雪。','must'),
  C('國道158號・大瀧橋（往平湯）','接近平湯前山區道路補充參考。','ref')
]);
const cityCaveCams=()=>compact([
  C('高山中橋','宮川朝市／三町古街一帶市區天氣及積雪。','must'),
  C('高山陣屋前','高山陣屋附近積雪、天氣及人流。','must'),
  C('國道158號・丹生川町茶屋野（往平湯）','高山 → 飛驒大鐘乳洞：東面山路雪況。','must'),
  C('國道158號・丹生川町茶屋野（往高山）','鐘乳洞 → 高山方向路面積雪參考。','must')
]);
const eastboundCams=()=>compact([
  C('國道158號・丹生川町久手（往平湯）','高山／鐘乳洞 → 平湯 → 松本：高海拔路段雪況。','must'),
  C('國道158號・平湯（往高山）','平湯一帶路面及積雪；今日之後要經安房方向返松本。','must'),
  C('國道158號・乘鞍山道入口（往高山）','R158 高海拔路段雪況；返松本前重要道路參考。','must')
]);

function whiteData(day){
  const d=day.toUpperCase();
  return {
    nav:'🏘️ '+d+' 白川鄉', title:'🏘️ 白川鄉 Shirakawa-go',
    desc:(day==='d6'?'白川鄉優先日；只有新穗高突然極好天先改計劃':'D6 已去新穗高，所以今日補白川鄉'),
    route:'高山 → 白川鄉荻町合掌村 → 和田家 → 荻町城跡展望台 → 高山',
    places:[{name:'白川鄉',query:'Shirakawa-go'},{name:'和田家',query:'Wada House Shirakawa-go'},{name:'荻町城跡展望台',query:'Ogimachi Castle Observation Deck'},{name:'高山住宿',query:day==='d7'?'Residence Hotel Takayama Station':'Takayama Ouan'}],
    cams:whiteCams(),
    decision:{title:d+' 天氣決策',steps:[
      '① 白川鄉只安排 D6 或 D7；D8 不再向西兜去白川鄉。',
      '② 出發前照睇一次新穗高山頂；如果今日係三日唯一極佳能見度，可以用「🌨️ D6–D8 新穗高日子」改計劃。',
      '③ 白川鄉道路大雪／封路就安全優先，唔硬闖。'
    ],links:[{name:'白川鄉交通 Live Cam',url:'https://shirakawa-going.jp/tw/index.html'},{name:'岐阜道路雪況',url:'https://douro.pref.gifu.lg.jp/'},{name:'新穗高運行狀況',url:'https://shinhotaka-ropeway.jp/'}]}
  };
}
function shData(day){
  const d=day.toUpperCase();
  return {
    nav:'🚡 '+d+' 新穗高',title:'🚡 新穗高纜車 Shinhotaka Ropeway',
    desc:'今日已選做新穗高日；只有山頂能見度同運行狀況值得先出發。',
    route:'高山 → 新穗高纜車 → 平湯神社'+(day==='d8'?' → 安房方向 → 松本':' → 高山'),
    places:[{name:'新穗高纜車',query:'Shinhotaka Ropeway'},{name:'平湯神社',query:'平湯神社'},...(day==='d8'?[{name:'松本住宿',query:'Iroha Grand Hotel Matsumoto Ekimae'}]:[{name:'高山住宿',query:day==='d7'?'Residence Hotel Takayama Station':'Takayama Ouan'}])],
    cams:compact(shCams().concat(day==='d8'?eastboundCams():[])),
    decision:{title:d+' 新穗高判斷',steps:[
      '① 先睇西穗高口 Live Cam＋官方 Operation Status。',
      '② 山頂清晰、風況可接受、纜車正常先出發；大霧／強風／停駛就唔為「已選日」硬去。',
      day==='d8'?'③ D8 完成後一路向東返松本，白川鄉已經唔會放今日。':'③ 今日完成新穗高後，其他兩日會按新版本自動分配白川鄉／高山市區＋鐘乳洞。'
    ],links:[{name:'新穗高運行狀況',url:'https://shinhotaka-ropeway.jp/'},{name:'岐阜道路雪況',url:'https://douro.pref.gifu.lg.jp/'}]}
  };
}
function cityData(day){
  const d=day.toUpperCase();
  return {
    nav:'🧊 '+d+' 高山・鐘乳洞',title:'🧊 高山市區・飛驒大鐘乳洞'+(day==='d8'?' → 松本':''),
    desc:day==='d7'?'高山市區＋飛驒大鐘乳洞；晚上三寺まいり只做 Bonus':'完成高山市區＋鐘乳洞後一路向東返松本',
    route:'宮川朝市 → 高山陣屋 → 三町古街 → 飛驒大鐘乳洞'+(day==='d8'?' → 平湯／安房 → 松本':' → 高山 → 1/15 三寺まいり Bonus'),
    places:[{name:'宮川朝市',query:'Miyagawa Morning Markets Takayama'},{name:'高山陣屋',query:'Takayama Jinya'},{name:'三町古街',query:'Sanmachi Suji Takayama'},{name:'飛驒大鐘乳洞',query:'Hida Great Limestone Cave'},...(day==='d8'?[{name:'松本住宿',query:'Iroha Grand Hotel Matsumoto Ekimae'}]:[{name:'三寺まいり Bonus',query:'Hida-Furukawa Station'}])],
    cams:compact(cityCaveCams().concat(day==='d8'?eastboundCams():[])),
    decision:{title:d+' 道路重點',steps:[
      '① 市區景點先按正常時間行；鐘乳洞位於東面方向。',
      day==='d8'?'② 鐘乳洞後唔返西面，直接經平湯／安房方向返松本。':'② 1/15 晚上三寺まいり只係 Bonus；道路、體力、時間任何一樣唔理想就 Skip。',
      '③ 冬季 R158 以道路安全同即時導航為準。'
    ],links:[{name:'飛驒高山 Live Camera',url:'https://www.hidatakayama.or.jp/index_10.html'},{name:'岐阜道路雪況',url:'https://douro.pref.gifu.lg.jp/'}]}
  };
}

function planningData(day){
  if(day==='d6'){
    const x=whiteData('d6');
    x.nav='🏘️ D6 白川鄉優先';
    x.desc='未鎖定新穗高日子：D6 先以白川鄉做基準，但朝早新穗高極好天可即改 D6。';
    return x;
  }
  if(day==='d7'){
    return {nav:'🌨️ D7 彈性日',title:'🌨️ D7 新穗高／高山市區',desc:'視 D6 結果同新穗高天氣決定；1/15 三寺まいり只做 Bonus。',route:'新穗高 或 高山市區＋飛驒大鐘乳洞｜白川鄉如果 D6 已完成就唔再重複',places:[{name:'新穗高纜車',query:'Shinhotaka Ropeway'},{name:'飛驒大鐘乳洞',query:'Hida Great Limestone Cave'},{name:'高山站',query:'Takayama Station'}],cams:compact(shCams().slice(0,3).concat(cityCaveCams())),decision:{title:'D7 規劃模式',steps:['① 去詳細行程或上面選擇器鎖定 D6／D7／D8 邊日去新穗高。','② 如果 D6 已去新穗高，D7 係白川鄉。','③ 如果新穗高留 D8，D7 做高山市區＋鐘乳洞。'],links:[{name:'新穗高運行狀況',url:'https://shinhotaka-ropeway.jp/'},{name:'岐阜道路雪況',url:'https://douro.pref.gifu.lg.jp/'}]};
  }
  return {nav:'🚗 D8 東面→松本',title:'🚗 D8 剩餘東面行程 → 松本',desc:'D8 不再安排白川鄉；只會係新穗高或者高山市區＋鐘乳洞之後返松本。',route:'新穗高／飛驒大鐘乳洞 → 平湯／安房方向 → 松本',places:[{name:'新穗高纜車',query:'Shinhotaka Ropeway'},{name:'飛驒大鐘乳洞',query:'Hida Great Limestone Cave'},{name:'松本住宿',query:'Iroha Grand Hotel Matsumoto Ekimae'}],cams:compact(shCams().slice(0,4).concat(eastboundCams())),decision:{title:'D8 規劃模式',steps:['① D8 永遠唔去白川鄉。','② 如果新穗高留到 D8，朝早以 Live Cam／運行狀況作最後判斷。','③ 如果新穗高已完成，D8 做高山市區＋鐘乳洞後直接返松本。'],links:[{name:'新穗高運行狀況',url:'https://shinhotaka-ropeway.jp/'},{name:'岐阜道路雪況',url:'https://douro.pref.gifu.lg.jp/'}]};
}

function assign(target,data){Object.assign(target,data);}
function setFlexibleDays(){
  const sh=selected();
  if(!sh){ ['d6','d7','d8'].forEach(d=>assign(S(d),planningData(d))); return; }
  if(sh==='d6'){ assign(S('d6'),shData('d6')); assign(S('d7'),whiteData('d7')); assign(S('d8'),cityData('d8')); }
  if(sh==='d7'){ assign(S('d6'),whiteData('d6')); assign(S('d7'),shData('d7')); assign(S('d8'),cityData('d8')); }
  if(sh==='d8'){ assign(S('d6'),whiteData('d6')); assign(S('d7'),cityData('d7')); assign(S('d8'),shData('d8')); }
}

function patchD3Place(){
  const s=S('d3');if(!s||!s.places)return;
  s.places=s.places.map(p=>/JA/.test(p.name)?{name:'JA中野市 Oranche',query:'JA中野市 農産物産館 オランチェ'}:p);
}

function decisionHtml(d){
  if(!d)return'';
  return '<div class="decision-title">🌨️ '+d.title+'</div>'+d.steps.map(x=>'<div class="decision-step">'+x+'</div>').join('')+'<div class="decision-links">'+(d.links||[]).map(x=>'<a class="button" href="'+x.url+'" target="_blank" rel="noopener">'+x.name+'</a>').join('')+'</div>';
}
function placesHtml(list){
  return (list||[]).map(p=>'<a class="map-link" href="'+mapSearch(p.query)+'" target="_blank" rel="noopener">📍 '+p.name+'</a>').join('');
}
function patchSectionDom(s){
  if(!s)return;
  const el=document.getElementById(s.id);if(!el)return;
  const title=el.querySelector('.summary-title');if(title)title.textContent=s.title;
  const desc=el.querySelector('.summary-desc');if(desc)desc.textContent=s.desc;
  const route=el.querySelector('.route-text');if(route)route.textContent=s.route;
  const count=el.querySelector('.count');if(count)count.textContent=(s.cams||[]).length+' 個 Camera';
  const nav=document.querySelector('.quick-nav a[data-day="'+s.id+'"]');if(nav)nav.textContent=s.nav;
  const places=el.querySelector('.places-row');if(places)places.innerHTML=placesHtml(s.places);
  const decision=el.querySelector('.decision-panel');
  if(s.decision){
    if(decision)decision.innerHTML=decisionHtml(s.decision);
    else{
      const grid=el.querySelector('.cam-grid');
      if(grid){const box=document.createElement('div');box.className='decision-panel';box.innerHTML=decisionHtml(s.decision);grid.insertAdjacentElement('beforebegin',box);}
    }
  }else if(decision){decision.remove();}
  const grid=el.querySelector('.cam-grid');
  if(grid&&typeof renderCam==='function')grid.innerHTML=(s.cams||[]).map(renderCam).join('');
  if(el.open&&typeof loadSection==='function')try{loadSection(el);}catch(e){}
}

function addCatalogLink(){
  document.querySelectorAll('.page-switch').forEach(sw=>{
    const live=sw.querySelector('a[href="index.html"]');if(live)live.href='live.html';
    if(sw.querySelector('a[href="attractions.html"]'))return;
    const a=document.createElement('a');a.href='attractions.html';a.textContent='🗾 景點總覽';sw.appendChild(a);
  });
}

function addPlanChooser(){
  if(document.getElementById('livePlanChooser'))return;
  const notice=document.querySelector('.notice');if(!notice)return;
  const box=document.createElement('section');
  box.id='livePlanChooser';box.className='decision-panel';
  box.style.margin='0 0 14px';
  box.innerHTML='<div class="decision-title">🌨️ D6–D8 新穗高日子｜同行程同步</div><div class="decision-step" id="livePlanStatus"></div><div class="decision-links"><button class="button" data-live-sh="d6">🚡 D6</button><button class="button" data-live-sh="d7">🚡 D7</button><button class="button" data-live-sh="d8">🚡 D8</button><button class="button secondary" data-live-sh="">重設／規劃模式</button><a class="button secondary" href="itinerary.html#d6">🗓️ 睇 D6–D8 行程</a></div>';
  notice.insertAdjacentElement('afterend',box);
  const refresh=()=>{
    const v=selected();
    const st=box.querySelector('#livePlanStatus');
    st.innerHTML=v?'<strong>目前：</strong>'+v.toUpperCase()+' 去新穗高｜白川鄉會自動放 D6／D7；D8 不會再去白川鄉。':'<strong>目前：規劃模式。</strong> D6 以白川鄉優先；到時睇新穗高 Live Cam 再決定 D6／D7／D8。';
    box.querySelectorAll('[data-live-sh]').forEach(b=>b.style.boxShadow=(b.dataset.liveSh===v&&v)?'0 0 0 3px #9fc4dd':'');
  };
  box.querySelectorAll('[data-live-sh]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.liveSh;if(v)localStorage.setItem(KEY,v);else localStorage.removeItem(KEY);location.reload();}));
  refresh();
}

const todayBase={
 d1:{title:'D1｜香港 → 名古屋 → 松本',route:'中部國際機場 → 名古屋 → JR 特急信濃 → 松本',hard:'17:40 特急信濃',hotel:'TABINO HOTEL lit 松本',hotelMap:'TABINO HOTEL lit Matsumoto',stops:[['14:30','中部國際機場 T2','Chubu Centrair International Airport Terminal 2'],['17:40','JR 名古屋站','Nagoya Station'],['19:50','TABINO HOTEL lit 松本','TABINO HOTEL lit Matsumoto']]},
 d2:{title:'D2｜松本城 → 輕井澤 Outlet → 千曲',route:'08:30 早餐 → 松本城 1.5h → 11:05 Times → Outlet → 千曲',hard:'15:30 必須離開 Outlet／17:30 前到千曲館',hotel:'Club Wyndham 千曲館',hotelMap:'Club Wyndham Chikumakan',stops:[['09:15','國寶松本城','Matsumoto Castle'],['11:05','Times 松本站前','Times Car Rental Matsumoto Station'],['13:20','輕井澤 Outlet','Karuizawa Prince Shopping Plaza'],['16:50','千曲館','Club Wyndham Chikumakan']]},
 d3:{title:'D3｜千曲 → 小布施 → JA Oranche → 澀溫泉',route:'小布施 → JA中野市 Oranche → 澀溫泉',hard:'15:00 左右入住澀溫泉',hotel:'一乃湯果亭',hotelMap:'一乃湯果亭',stops:[['10:00','小布施','北斎館駐車場 小布施'],['13:05','JA Oranche','JA中野市 農産物産館 オランチェ'],['15:00','一乃湯果亭','一乃湯果亭']]},
 d4:{title:'D4｜澀溫泉 → 地獄谷 → 須坂 → 長野',route:'地獄谷野猿公苑 → AEON Mall 須坂 → 長野',hard:'17:00 離開 AEON 須坂',hotel:'Hotel JAL City Nagano',hotelMap:'Hotel JAL City Nagano',stops:[['09:00','地獄谷野猿公苑専用駐車場','地獄谷野猿公苑専用駐車場'],['13:30','AEON Mall 須坂','AEON MALL Suzaka'],['17:45','Hotel JAL City Nagano','Hotel JAL City Nagano']]},
 d5:{title:'D5｜長野 → 白馬岩岳 → 高山',route:'白馬岩岳 → MOUNTAIN HARBOR／WHITE PARK → 高山',hard:'13:20 左右離開白馬',hotel:'高山櫻庵',hotelMap:'Takayama Ouan',stops:[['09:00','白馬岩岳','Hakuba Iwatake Mountain Resort'],['13:20','離開白馬前往高山','Takayama Ouan']]},
 d9:{title:'D9｜松本 → AEON → 還車 → 名古屋 → 香港',route:'AEON Mall 松本 → 入油 → Times 還車 → JR → NGO',hard:'11:00 離開 AEON／12:10 還車／13:56 JR',hotel:'今晚返香港',hotelMap:'Chubu Centrair International Airport Terminal 2',stops:[['09:30','AEON Mall 松本','AEON MALL Matsumoto'],['11:40','Times 松本站前','Times Car Rental Matsumoto Station'],['13:56','松本站','Matsumoto Station'],['17:17','中部國際機場 T2','Chubu Centrair International Airport Terminal 2']]}
};
function dynamicToday(id){
  const sh=selected();
  if(!sh){
    if(id==='d6')return {title:'D6｜白川鄉優先／新穗高可即改',route:'白川鄉優先；朝早新穗高極好天可改 D6',hard:'D8 不去白川鄉',hotel:'高山櫻庵',hotelMap:'Takayama Ouan',stops:[['08:50','出發：白川鄉／按天氣改新穗高','Shirakawa-go'],['10:00','白川鄉','Shirakawa-go']]};
    if(id==='d7')return {title:'D7｜彈性日',route:'新穗高／高山市區＋鐘乳洞；1/15 三寺まいり只做 Bonus',hard:'先鎖定新穗高日子',hotel:'Residence Hotel Takayama Station',hotelMap:'Residence Hotel Takayama Station',stops:[]};
    return {title:'D8｜剩餘東面行程 → 松本',route:'新穗高或鐘乳洞 → 平湯／安房 → 松本；不去白川鄉',hard:'預足冬季道路 Buffer',hotel:'Iroha Grand Hotel 松本',hotelMap:'Iroha Grand Hotel Matsumoto Ekimae',stops:[]};
  }
  let type=id===sh?'sh':((sh==='d6'&&id==='d7')?'white':((id==='d6'&&sh!=='d6')?'white':'city'));
  if(type==='sh')return {title:id.toUpperCase()+'｜新穗高纜車',route:'高山 → 新穗高 → 平湯'+(id==='d8'?' → 松本':' → 高山'),hard:'山頂清晰＋纜車正常先出發',hotel:id==='d8'?'Iroha Grand Hotel 松本':(id==='d7'?'Residence Hotel Takayama Station':'高山櫻庵'),hotelMap:id==='d8'?'Iroha Grand Hotel Matsumoto Ekimae':(id==='d7'?'Residence Hotel Takayama Station':'Takayama Ouan'),stops:[['09:15','前往新穗高','新穂高温泉駐車場'],['10:30','新穗高纜車','新穂高温泉駐車場']]};
  if(type==='white')return {title:id.toUpperCase()+'｜白川鄉',route:'高山 → 白川鄉 → 高山',hard:'D8 不再安排白川鄉',hotel:id==='d7'?'Residence Hotel Takayama Station':'高山櫻庵',hotelMap:id==='d7'?'Residence Hotel Takayama Station':'Takayama Ouan',stops:[['09:15','前往白川鄉','せせらぎ公園駐車場 白川郷'],['10:15','白川鄉','せせらぎ公園駐車場 白川郷']]};
  return {title:id.toUpperCase()+'｜高山市區＋飛驒大鐘乳洞'+(id==='d8'?' → 松本':''),route:'宮川朝市 → 高山陣屋／三町 → 飛驒大鐘乳洞'+(id==='d8'?' → 松本':' → 高山'),hard:id==='d8'?'鐘乳洞後直接向東返松本':'1/15 三寺まいり只做 Bonus',hotel:id==='d8'?'Iroha Grand Hotel 松本':'Residence Hotel Takayama Station',hotelMap:id==='d8'?'Iroha Grand Hotel Matsumoto Ekimae':'Residence Hotel Takayama Station',stops:[['09:30','宮川朝市','宮川朝市 高山'],['13:30','飛驒大鐘乳洞','Hida Great Limestone Cave']]};
}
function jpNow(){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());const o={};p.forEach(x=>o[x.type]=x.value);return {date:o.year+'-'+o.month+'-'+o.day,hm:o.hour+':'+o.minute};
}
function nextStop(stops,hm){for(const s of (stops||[]))if(s[0]>=hm)return s;return (stops||[]).slice(-1)[0]||null;}
function mapDir(q){return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(q)+'&travelmode=driving';}
function patchTodayCard(){
  const card=document.getElementById('tripv2TodayCard');if(!card)return;
  const n=jpNow();const m={'2027-01-09':'d1','2027-01-10':'d2','2027-01-11':'d3','2027-01-12':'d4','2027-01-13':'d5','2027-01-14':'d6','2027-01-15':'d7','2027-01-16':'d8','2027-01-17':'d9'};const id=m[n.date];
  if(!id){card.innerHTML='<h2>🧭 Today Card</h2><div class="tripv2-today-route">旅行期間 2027/1/9–1/17 會自動顯示最新路線、Hard Cut、下一站導航同今晚酒店。</div>';return;}
  const d=(id==='d6'||id==='d7'||id==='d8')?dynamicToday(id):todayBase[id];const ns=nextStop(d.stops,n.hm);
  card.innerHTML='<h2>'+d.title+'</h2><div class="tripv2-today-route">'+d.route+'</div><div class="tripv2-today-grid"><div class="tripv2-today-box tripv2-hardcut">⏰ <strong>Hard Cut</strong><br>'+d.hard+'</div><div class="tripv2-today-box">🏨 <strong>今晚</strong><br><a href="'+mapDir(d.hotelMap)+'" target="_blank" rel="noopener">'+d.hotel+' 📍</a></div></div>'+(ns?'<a class="tripv2-nav-main" href="'+mapDir(ns[2])+'" target="_blank" rel="noopener">🚗 下一站：'+ns[1]+'　📍</a>':'')+'<div class="tripv2-today-actions"><a href="live.html#'+id+'">📹 今日 Live Cam</a><a href="itinerary.html#'+id+'">🗓️ 今日詳細行程</a></div>';
}

function fixVersionBadge(){
  const b=document.getElementById('siteVersionBadge');if(!b)return;
  if((b.textContent||'').includes('v9.0')||(b.textContent||'').includes('v9.0.1')){
    b.textContent='版本 '+VERSION;b.classList.remove('outdated','offline');b.classList.add('current');b.title='已係最新版本 '+VERSION;
  }
}

setD2();patchD3Place();setFlexibleDays();
['d2','d3','d6','d7','d8'].forEach(id=>patchSectionDom(S(id)));
addCatalogLink();

function afterReady(){
  addCatalogLink();addPlanChooser();
  setTimeout(patchTodayCard,0);setTimeout(patchTodayCard,120);
  [0,350,1200,2200].forEach(t=>setTimeout(fixVersionBadge,t));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',afterReady,{once:true});else afterReady();
})();
