(function(){
'use strict';
if(window.__japan2027I18nPolishEnV1)return;
window.__japan2027I18nPolishEnV1=true;
if(localStorage.getItem('japan2027_language')!=='en')return;

const CJK=/[\u3400-\u9fff]/;
const R=[
 ['中部國際機場','Chubu Centrair Airport'],['香港國際機場','Hong Kong International Airport'],['新穗高纜車','Shinhotaka Ropeway'],['新穗高','Shinhotaka'],['白川鄉','Shirakawa-go'],['松本城','Matsumoto Castle'],['松本站前','Matsumoto Station Area'],['松本站','Matsumoto Station'],['松本','Matsumoto'],['輕井澤王子購物廣場','Karuizawa Prince Shopping Plaza'],['輕井澤','Karuizawa'],['千曲館','Chikumakan'],['千曲','Chikuma'],['地獄谷野猿公苑','Jigokudani Snow Monkey Park'],['地獄谷','Jigokudani'],['澀溫泉','Shibu Onsen'],['小布施','Obuse'],['栗之小徑','Chestnut Lane'],['北齋館','Hokusai Museum'],['須坂','Suzaka'],['長野','Nagano'],['白馬岩岳','Hakuba Iwatake'],['白馬','Hakuba'],['高山陣屋','Takayama Jinya'],['宮川朝市','Miyagawa Morning Market'],['三町古街','Sanmachi Historic District'],['飛驒大鐘乳洞','Hida Great Limestone Cave'],['飛驒古川','Hida-Furukawa'],['高山','Takayama'],['和田家','Wada House'],['荻町城跡展望台','Ogimachi Castle Observation Deck'],['平湯神社','Hirayu Shrine'],['平湯','Hirayu'],['名古屋','Nagoya'],['香港','Hong Kong'],
 ['開門','Open'],['最後入場','Last Admission'],['關門','Close'],['收費','Fee'],['免費','Free'],['已預訂','Booked'],['已正式預訂','Confirmed Booking'],['到店唔使付房費','No Room Payment at Hotel'],['到店只付地方稅','Local Tax Only at Hotel'],['到店要付房費','Pay Room Charge at Hotel'],['天然溫泉酒店','Natural Onsen Hotel'],['溫泉酒店','Onsen Hotel'],['溫泉旅館','Onsen Ryokan'],['早餐','Breakfast'],['晚餐','Dinner'],['去程','Outbound'],['回程','Return'],['注意','Note'],['租車資料','Car Rental'],['停車資料','Parking'],['酒店資料','Hotels'],['緊急資料','Emergency'],['緊急','Emergency'],['交通','Transport'],['租車','Car Rental'],['酒店','Hotel'],['停車','Parking'],['天氣日','Weather Days'],['證件','Documents'],['金錢','Money'],['上網','Connectivity'],['冬季衣物','Winter Clothing'],['電子用品','Electronics'],['雪地自駕','Winter Driving'],['實用用品','Practical Items'],['主行程','Main Itinerary'],['後備','Backup'],['景點','Attraction'],['行程','Itinerary'],['道路','Road'],['雪況','Snow Conditions'],['積雪','Snow Depth'],['導航','Navigation'],['版本','Version'],['收起','Collapse'],['展開','Expand']
];
R.sort((a,b)=>b[0].length-a[0].length);
function tr(s){let o=String(s||'');R.forEach(([a,b])=>{if(o.includes(a))o=o.split(a).join(b);});return o.replace(/（/g,' (').replace(/）/g,')').replace(/，/g,', ').replace(/。/g,'.').replace(/；/g,'; ').replace(/：/g,': ').replace(/｜/g,' | ').replace(/／/g,' / ').replace(/＋/g,' + ').replace(/・/g,' · ').replace(/\s{2,}/g,' ');}
function txt(el,s){if(el&&s!=null)el.textContent=s;}
function patchDays(){
 const fixed={
  d1:['🏯 Hong Kong → Nagoya → Matsumoto','Hong Kong Airport T2 → Chubu Centrair Airport → Nagoya → Limited Express Shinano → Matsumoto'],
  d2:['🏯 Matsumoto Castle · Karuizawa · Chikuma','08:30 quick breakfast → Matsumoto Castle (1.5 hr) → hotel for luggage → Times car pickup → Karuizawa Outlet (2 hr) → Chikuma'],
  d3:['🌰 Chikuma → Obuse → JA Oranche → Shibu Onsen','Chikuma → Obuse Old Town / Chestnut Lane → JA Oranche → Shibu Onsen → public-bath circuit'],
  d4:['🐒 Shibu Onsen → Jigokudani → Suzaka → Nagano','Shibu Onsen → Kanbayashi Parking → snowy trail → Jigokudani Snow Monkey Park → AEON Mall Suzaka → Nagano'],
  d5:['🏔️ Nagano → Hakuba Iwatake → Takayama','Nagano → Hakuba Iwatake → summit views / snow activities → lunch → Takayama'],
  d9:['✈️ Matsumoto → Nagoya → Chubu Centrair → Hong Kong','Matsumoto → return car → Limited Express Shinano → Nagoya → Chubu Centrair Airport T2 → Hong Kong']
 };
 Object.entries(fixed).forEach(([id,v])=>{const d=document.getElementById(id);if(!d)return;txt(d.querySelector('.day-title'),v[0]);txt(d.querySelector('.day-route'),v[1]);});
 const core=window.Japan2027Core,plan=core&&core.resolveFlexibleDays?core.resolveFlexibleDays():null;
 if(plan){['d6','d7','d8'].forEach(id=>{const d=document.getElementById(id);if(!d)return;const kind=plan[id];let title='',route='';if(kind==='shinhotaka'){title='🚡 '+id.toUpperCase()+' · Shinhotaka Ropeway';route='Takayama → Shinhotaka Ropeway → Hirayu Shrine'+(id==='d8'?' → Matsumoto':' → Takayama');}else if(kind==='shirakawago'){title='🏘️ '+id.toUpperCase()+' · Shirakawa-go';route='Takayama → Shirakawa-go Ogimachi → Wada House → Observation Deck → Takayama';}else if(kind==='cityCave'){title='🧊 '+id.toUpperCase()+' · Takayama City + Hida Great Limestone Cave'+(id==='d8'?' → Matsumoto':'');route='Miyagawa Morning Market → Takayama Jinya → Sanmachi → Hida Great Limestone Cave'+(id==='d8'?' → Hirayu / Abo → Matsumoto':'');}else{title='🌨️ '+id.toUpperCase()+' · Flexible Weather Day';route=id==='d8'?'Shinhotaka / Hida Great Limestone Cave → Hirayu / Abo → Matsumoto':'Shinhotaka or Takayama City + Hida Great Limestone Cave';}txt(d.querySelector('.day-title'),title);txt(d.querySelector('.day-route'),route);});}
 const nav={d1:'🏯 D1 Matsumoto',d2:'🏯 D2 Karuizawa',d3:'🌰 D3 Obuse',d4:'🐒 D4 Jigokudani',d5:'🏔️ D5 Hakuba',d6:'🏯 D6 Takayama',d7:'🏘️ D7 Flexible',d8:'🚗 D8 Matsumoto',d9:'✈️ D9 Hong Kong'};Object.entries(nav).forEach(([id,s])=>{const a=document.querySelector('.day-nav a[data-day="'+id+'"]');if(a)a.textContent=s;});
}
function patchTripInfo(){
 const sectionNames={transport:['✈️ Flights · JR · Meitetsu','Main outbound and return transport information'],car:['🚗 Car Rental','D2–D8 winter self-drive'],hotels:['🏨 Hotels','Booking, payment, breakfast and check-in notes'],parking:['🅿️ Parking','Navigation targets and winter parking notes'],hardcuts:['⏰ Hard Cuts','Times that must not be delayed'],weather:['🌨️ Weather-Flexible Days','D6–D8 Shinhotaka / Shirakawa-go decision support'],checklist:['🎒 Packing Checklist','Departure checklist'],emergency:['☎️ Emergency','Emergency numbers and key offline information']};
 Object.entries(sectionNames).forEach(([id,v])=>{const s=document.getElementById(id);if(!s)return;txt(s.querySelector('.section-title'),v[0]);txt(s.querySelector('.section-desc'),v[1]);});
 document.querySelectorAll('.quick-nav a').forEach(a=>{const h=(a.getAttribute('href')||'').slice(1);const names={transport:'✈️ Transport',car:'🚗 Car Rental',hotels:'🏨 Hotels',parking:'🅿️ Parking',hardcuts:'⏰ Hard Cuts',weather:'🌨️ Weather Days',checklist:'🎒 Checklist',emergency:'☎️ Emergency'};if(names[h])a.textContent=names[h];});
 document.querySelectorAll('.visit-meta-card strong').forEach(e=>{const x=tr(e.textContent);if(x!==e.textContent)e.textContent=x;});
 document.querySelectorAll('.visit-photo-warning').forEach(e=>{if(CJK.test(e.textContent||''))e.textContent=e.classList.contains('ban')?'🚫 Photography equipment restrictions apply here. Follow the official and onsite rules.':'⚠️ Use selfie sticks carefully and follow onsite rules; do not block paths or other visitors.';});
 document.querySelectorAll('.emergency-title,.emergency-note').forEach(e=>{if(CJK.test(e.textContent||'')){const t=tr(e.textContent);e.textContent=CJK.test(t)?(e.classList.contains('emergency-title')?'Emergency Service':'Keep this number available offline during the trip.'):t;}});
}
function patchResidual(){
 document.querySelectorAll('.section-title,.section-desc,.info-card h3,.hotel-name,.hotel-detail,.hotel-note,.parking-title,.hardcut-title,.decision-title,.check-group-title,.checklist-title,.catalog-intro,.cat-group-head h2,.catalog-status-note').forEach(e=>{if(!CJK.test(e.textContent||''))return;const t=tr(e.textContent);if(!CJK.test(t))e.textContent=t;});
 document.querySelectorAll('.visit-meta-line strong').forEach(e=>{const m={'開門':'Open','最後入場':'Last Admission','關門':'Close','收費':'Fee'};if(m[e.textContent.trim()])e.textContent=m[e.textContent.trim()];});
}
function run(){patchDays();patchTripInfo();patchResidual();if(window.Japan2027I18n)window.Japan2027I18n.refresh();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{[0,350,900,1800,2800].forEach(t=>setTimeout(run,t));},{once:true});else [0,350,900,1800,2800].forEach(t=>setTimeout(run,t));
})();
