(function(){
'use strict';
if(window.__japan2027I18nV1)return;
window.__japan2027I18nV1=true;

const KEY='japan2027_language';
let lang=localStorage.getItem(KEY)==='en'?'en':'zh';
const textState=new WeakMap();
const attrState=new WeakMap();
let observer=null;

const EXACT={
'📹 Live Cam':'📹 Live Cam','🗓️ 詳細行程':'🗓️ Detailed Itinerary','🧳 旅程資料':'🧳 Trip Info','🗾 景點總覽':'🗾 Attractions','🧭 今日模式':'🧭 Today Mode','🚗 揸車模式':'🚗 Driving Mode',
'全部景點':'All Attractions','全部':'All','✅ 主行程':'✅ Main Itinerary','🔄 後備景點':'🔄 Backup Attractions','整理景點中…':'Preparing attractions…','載入地區…':'Loading areas…','返頁頂':'Back to top',
'版本讀取中…':'Loading version…','返回完整行程':'Back to Full Itinerary','返回行程':'Back to Itinerary','完整行程':'Full Itinerary','今日模式':'Today Mode','揸車模式':'Driving Mode',
'🌤️ 今日天氣':'🌤️ Today’s Weather','🌤️ 睇 5 日預測':'🌤️ View 5-Day Forecast','🌤️ 天氣預測':'🌤️ Weather Forecast','📹 Live Cam':'📹 Live Cam','📍 Google Maps':'📍 Google Maps',
'今日主要行程已完成':'Today’s main itinerary is complete','之後行程':'Upcoming Stops','今日冇更多行程。':'No more stops today.','今日冇可用行程資料。':'No usable itinerary data for today.',
'下一站':'Next Stop','第一站':'First Stop','目前':'Current','已選擇':'Selected','新穗高候選':'Shinhotaka Candidate','推薦':'Recommended','趨勢參考':'Trend Reference','預覽模式':'Preview Mode',
'重設／規劃模式':'Reset / Planning Mode','🗓️ 睇 D6–D8 行程':'🗓️ View D6–D8 Itinerary','🚡 D6 去新穗高':'🚡 D6 Shinhotaka','🚡 D7 去新穗高':'🚡 D7 Shinhotaka','🚡 D8 去新穗高':'🚡 D8 Shinhotaka',
'🌨️ D6–D8 新穗高日子｜同行程同步':'🌨️ D6–D8 Shinhotaka Day | Synced with Itinerary','🚡 D6–D8 新穗高天氣自動比較':'🚡 D6–D8 Shinhotaka Weather Comparison',
'↻ 刷新':'↻ Refresh','📡 即時天氣':'📡 Current Weather','📅 未來 5 日':'📅 Next 5 Days','非常理想':'Excellent','適合':'Good','可以去':'Suitable','勉強可以':'Marginal','不理想':'Poor',
'非常適合・值得優先去':'Excellent — Prioritize This Day','不建議用呢日去':'Not Recommended for This Day','不理想・道路安全優先':'Poor — Road Safety First',
'能見度':'Visibility','平均能見度':'Avg Visibility','最低':'Min','平均':'Avg','平均雲量':'Avg Cloud','雲量':'Cloud','濕度':'Humidity','風速／陣風':'Wind / Gusts','最大陣風':'Max Gust','陣風':'Gusts','降水':'Precipitation','新降雪':'New Snow','地面積雪':'Snow Depth','積雪':'Snow Depth','體感':'Feels Like',
'晴天':'Clear','大致晴朗':'Mostly Clear','部分多雲':'Partly Cloudy','多雲／陰天':'Cloudy / Overcast','有霧':'Fog','毛毛雨':'Drizzle','有雨':'Rain','有雪':'Snow','驟雨':'Showers','驟雪':'Snow Showers','雷暴':'Thunderstorm','天氣':'Weather',
'🅿️ 下一個停車點':'🅿️ Next Parking','🅿️ 下一個停車／導航點':'🅿️ Next Parking / Navigation','🅿️ 停車／導航':'🅿️ Parking / Navigation','🅿️ 停車':'🅿️ Parking','🅿️ 導航去停車場':'🅿️ Navigate to Parking','📍 導航':'📍 Navigate',
'🏨 今日住宿／結束':'🏨 Tonight’s Hotel / End','📍 酒店導航':'📍 Hotel Navigation','⏰ 今日時間底線':'⏰ Today’s Time Limit','今日時間底線':'Today’s Time Limit','今日住宿／終點':'Tonight’s Hotel / End',
'← 上一站':'← Previous Stop','✅ 已到達・下一站':'✅ Arrived · Next Stop','🕒 按時間自動':'🕒 Auto by Schedule','☀️ 保持螢幕常亮':'☀️ Keep Screen Awake','🌙 取消常亮':'🌙 Allow Screen Sleep',
'🚗 開 Google Maps 導航':'🚗 Open Google Maps Navigation','📍 地圖搜尋':'📍 Map Search','未有獨立停車場標記；到埗前可用 Google Maps 搜尋附近停車場。':'No dedicated parking point is marked; use Google Maps to find nearby parking before arrival.',
'⚠️ 駕駛期間請由乘客操作；司機要操作手機請先安全停車。Google Maps 開啟後會提供實時路線同 ETA。':'⚠️ Passenger operation only while driving. Drivers should stop safely before using the phone. Google Maps will provide live routing and ETA.',
'未進入目前 8 日預報範圍。':'Not yet within the current 8-day forecast window.','三日資料未齊，暫時唔作最終推薦。最早由 1/9 起會逐步有 D6–D8 預報，越接近 1/14 可信度越高。':'All three days are not available yet, so no final recommendation is made. D6–D8 forecasts will start appearing from Jan 9 and confidence improves closer to Jan 14.',
'三日目前都唔理想，暫時唔建議鎖定新穗高日。等下一輪預報，再配合 Live Cam／纜車運行。':'All three days currently look poor. Do not lock in a Shinhotaka day yet; wait for the next forecast and confirm with Live Cam / ropeway operation.',
'準備比較 D6–D8…':'Preparing D6–D8 comparison…','更新 D6–D8 新穗高預報比較…':'Updating D6–D8 Shinhotaka forecast comparison…','暫時攞唔到比較資料；有網絡後再按刷新。':'Comparison data is unavailable. Refresh when online.',
'套用推薦':'Apply Recommendation','🌤️ 睇新穗高 5 日預測':'🌤️ View Shinhotaka 5-Day Forecast','目前：未鎖定新穗高日':'Current: Shinhotaka day not locked','預報可信度：':'Forecast confidence: ','較高':'Higher','中等':'Medium','早期趨勢':'Early Trend',
'版本 ':'Version ','・離線':' · Offline','已係最新版本 ':'Latest version ','目前離線；本機版本 ':'Offline; local version ','網站版本':'Site version',
'主行程':'Main Itinerary','後備景點':'Backup Attraction','導航':'Navigation','景點導航':'Attraction Navigation','今日景點導航':'Today’s Attractions','道路重點':'Road Notes','天氣決策':'Weather Decision','新穗高判斷':'Shinhotaka Check','規劃模式':'Planning Mode'
};

const PHRASES=[
['新穗高纜車','Shinhotaka Ropeway'],['新穗高','Shinhotaka'],['白川鄉','Shirakawa-go'],['白川郷','Shirakawa-go'],['松本城','Matsumoto Castle'],['松本','Matsumoto'],['輕井澤王子購物廣場','Karuizawa Prince Shopping Plaza'],['輕井澤','Karuizawa'],['千曲館','Chikumakan'],['千曲','Chikuma'],['地獄谷野猿公苑','Jigokudani Snow Monkey Park'],['地獄谷','Jigokudani'],['澀溫泉','Shibu Onsen'],['山之內','Yamanouchi'],['長野','Nagano'],['須坂','Suzaka'],['白馬岩岳','Hakuba Iwatake'],['白馬','Hakuba'],['高山市區','Takayama City'],['高山陣屋','Takayama Jinya'],['高山中橋','Takayama Nakabashi'],['高山','Takayama'],['飛驒大鐘乳洞','Hida Great Limestone Cave'],['宮川朝市','Miyagawa Morning Market'],['三町古街','Sanmachi Historic District'],['三寺まいり','Santera Mairi'],['飛驒古川','Hida-Furukawa'],['平湯神社','Hirayu Shrine'],['平湯','Hirayu'],['西穗高口','Nishihotakaguchi'],['荻町城跡展望台','Ogimachi Castle Observation Deck'],['和田家','Wada House'],['合掌村','Gassho Village'],['奧飛驒','Okuhida'],['飛驒','Hida'],['松本站','Matsumoto Station'],['高山站','Takayama Station'],['名古屋','Nagoya'],['中部國際機場','Chubu Centrair Airport'],['新穗高日子','Shinhotaka Day'],
['詳細行程','Detailed Itinerary'],['旅程資料','Trip Info'],['景點總覽','Attractions'],['今日模式','Today Mode'],['揸車模式','Driving Mode'],['完整行程','Full Itinerary'],['下一站','Next Stop'],['上一站','Previous Stop'],['已到達','Arrived'],['第一站','First Stop'],['之後行程','Upcoming Stops'],['即時天氣','Current Weather'],['天氣預測','Weather Forecast'],['天氣適合度','Weather Suitability'],['天氣自動比較','Weather Comparison'],['天氣決策','Weather Decision'],['道路安全','Road Safety'],['道路狀況','Road Conditions'],['道路雪況','Road Snow Conditions'],['道路積雪','Road Snow'],['道路','Road'],['纜車運行','Ropeway Operation'],['運行狀況','Operation Status'],['山頂','Summit'],['能見度','Visibility'],['平均雲量','Avg Cloud'],['雲量','Cloud'],['陣風','Gusts'],['風況','Wind'],['降水','Precipitation'],['新降雪','New Snow'],['降雪','Snowfall'],['地面積雪','Snow Depth'],['積雪','Snow Depth'],['結冰','Icing'],['體感','Feels Like'],['最高','High'],['最低','Low'],
['停車場','Parking'],['停車','Parking'],['酒店','Hotel'],['住宿','Accommodation'],['今日住宿','Tonight’s Hotel'],['今日完結','End of Day'],['出發','Depart'],['到達','Arrive'],['取車','Pick Up Car'],['還車','Return Car'],['早餐','Breakfast'],['午餐','Lunch'],['晚餐','Dinner'],['快速早餐','Quick Breakfast'],['快早餐','Quick Breakfast'],['行李','Luggage'],['影相','Photos'],['步行','Walk'],['開車','Drive'],['自駕','Drive'],['導航','Navigate'],['地圖','Map'],
['主行程','Main Itinerary'],['後備','Backup'],['候補','Backup'],['如有時間','If Time Allows'],['取消','Cancelled'],['保留','Keep'],['推薦','Recommended'],['已選擇','Selected'],['目前','Current'],['今日','Today'],['今次','This Trip'],['規劃','Planning'],['模式','Mode'],['刷新','Refresh'],['重設','Reset'],['同步','Synced'],['版本','Version'],['離線','Offline'],['最新資料','Latest Data'],['更新','Updated'],['載入','Loading'],['讀取','Loading'],['資料','Data'],['預報','Forecast'],['預測','Forecast'],['趨勢','Trend'],['參考','Reference'],['適合','Suitable'],['非常理想','Excellent'],['不理想','Poor'],['不建議','Not Recommended'],['優先','Priority'],['安全優先','Safety First'],
['如果','If'],['只有','Only'],['完成後','After finishing'],['完成','Complete'],['之後','Afterwards'],['之前','Before'],['先','First'],['再','Then'],['可以','Can'],['需要','Need'],['視','Depending on'],['決定','Decide'],['改計劃','Change Plan'],['自動','Automatically'],['手動','Manual'],['鎖定','Lock In'],['未鎖定','Not Locked'],['已去','Already Visited'],['去','Go to'],['返','Return to'],['往','towards'],['方向','direction'],['入口','Entrance'],['附近','Nearby'],['市區','City'],['官方','Official'],['時間','Time'],['最遲','Latest'],['原定','Scheduled'],['分鐘','min'],['小時','hr'],['公里','km'],['大雪','Heavy Snow'],['封路','Road Closure'],['晴朗','Clear'],['多雲','Cloudy'],['陰天','Overcast'],['有霧','Fog'],['有雨','Rain'],['有雪','Snow']
];
PHRASES.sort((a,b)=>b[0].length-a[0].length);

function ignored(node){
 const p=node.nodeType===1?node:node.parentElement;
 return !!(p&&p.closest&&p.closest('script,style,noscript,code,pre,[data-i18n-ignore],.jp-place-name,.weather3d-jp'));
}
function translateString(input){
 const m=String(input).match(/^(\s*)([\s\S]*?)(\s*)$/),lead=m?m[1]:'',core=m?m[2]:String(input),trail=m?m[3]:'';
 if(!core)return input;
 if(EXACT[core])return lead+EXACT[core]+trail;
 let out=core;
 PHRASES.forEach(([z,e])=>{if(out.includes(z))out=out.split(z).join(e);});
 out=out.replace(/（/g,' (').replace(/）/g,')').replace(/，/g,', ').replace(/。/g,'.').replace(/；/g,'; ').replace(/：/g,': ').replace(/｜/g,' | ').replace(/／/g,' / ').replace(/＋/g,' + ');
 out=out.replace(/\s{2,}/g,' ');
 return lead+out+trail;
}
function processText(node){
 if(!node||node.nodeType!==3||ignored(node))return;
 const cur=node.nodeValue||'',st=textState.get(node);
 if(lang==='en'){
  if(st&&cur===st.en)return;
  if(/[\u3400-\u9fff]/.test(cur)){
   const en=translateString(cur);textState.set(node,{zh:cur,en});if(en!==cur)node.nodeValue=en;
  }
 }else if(st&&cur===st.en){node.nodeValue=st.zh;}
}
function processAttrs(el){
 if(!el||el.nodeType!==1||ignored(el))return;
 const names=['title','aria-label','placeholder'];let map=attrState.get(el);if(!map){map={};attrState.set(el,map);}
 names.forEach(name=>{
  if(!el.hasAttribute(name))return;const cur=el.getAttribute(name)||'',st=map[name];
  if(lang==='en'){
   if(st&&cur===st.en)return;if(/[\u3400-\u9fff]/.test(cur)){const en=translateString(cur);map[name]={zh:cur,en};if(en!==cur)el.setAttribute(name,en);}
  }else if(st&&cur===st.en)el.setAttribute(name,st.zh);
 });
}
function walk(root){
 if(!root)return;
 if(root.nodeType===3){processText(root);return;}
 if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
 if(root.nodeType===1)processAttrs(root);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 let n;while((n=walker.nextNode())){if(n.nodeType===3)processText(n);else processAttrs(n);}
}
function buttonText(){return lang==='en'?'🌐 中文':'🌐 EN';}
function ensureButtons(){
 document.querySelectorAll('.page-switch').forEach(sw=>{
  let a=sw.querySelector('[data-i18n-toggle]');
  if(!a){a=document.createElement('a');a.href='#';a.dataset.i18nToggle='1';a.dataset.i18nIgnore='1';a.className='i18n-toggle';a.addEventListener('click',e=>{e.preventDefault();setLang(lang==='en'?'zh':'en');});sw.appendChild(a);}a.textContent=buttonText();
 });
 [['.tm-head-row','.tm-close'],['.dm-head-row','.dm-close']].forEach(([rowSel,closeSel])=>{
  document.querySelectorAll(rowSel).forEach(row=>{let b=row.querySelector('[data-i18n-overlay-toggle]');if(!b){b=document.createElement('button');b.type='button';b.dataset.i18nOverlayToggle='1';b.dataset.i18nIgnore='1';b.className=rowSel.includes('dm-')?'dm-close':'tm-close';b.addEventListener('click',()=>setLang(lang==='en'?'zh':'en'));const close=row.querySelector(closeSel);if(close)row.insertBefore(b,close);else row.appendChild(b);}b.textContent=buttonText();});
 });
}
function setLang(next){
 lang=next==='en'?'en':'zh';localStorage.setItem(KEY,lang);document.documentElement.lang=lang==='en'?'en':'zh-HK';
 walk(document);ensureButtons();document.dispatchEvent(new CustomEvent('japan2027:languagechange',{detail:{lang}}));
}
function boot(){
 document.documentElement.lang=lang==='en'?'en':'zh-HK';ensureButtons();walk(document);
 observer=new MutationObserver(list=>{
  list.forEach(m=>{if(m.type==='characterData')processText(m.target);else m.addedNodes.forEach(n=>walk(n));});ensureButtons();
 });
 observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 [300,900,1800,3500].forEach(t=>setTimeout(()=>{ensureButtons();if(lang==='en')walk(document);},t));
}
window.Japan2027I18n={getLang:()=>lang,setLang,t:s=>lang==='en'?translateString(s):s,refresh:()=>{ensureButtons();walk(document);}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
