(function(){
'use strict';
const d=window.Japan2027EnhancementData;
if(!d) return;

function replaceHotel(alias, patch, extraAliases){
  const h=d.hotels.find(x=>x.aliases.some(a=>a.includes(alias)||alias.includes(a)));
  if(!h) return;
  Object.assign(h,patch);
  (extraAliases||[]).forEach(a=>{if(!h.aliases.includes(a))h.aliases.push(a);});
}

/* Arrival-payment view: only show what still needs to be paid at the hotel. */
replaceHotel('TABINO HOTEL lit 松本',{
  badges:[['arrival-pay','🏨 到店要付房費']],
  detail:'到店以日圓支付房費 ¥13,668。🍳 此訂房方案不包早餐。'
},['松本・TABINO HOTEL lit']);

replaceHotel('Club Wyndham 千曲館',{
  badges:[['onsen','♨️ 溫泉酒店'],['arrival-clear','✅ 到店唔使付房費'],['breakfast','🍳 包早餐']],
  detail:'房費按預訂安排稍後由信用卡扣款；去到酒店唔需要再付房費。🍳 行程預定早餐 08:00–09:00；酒店官方未見公開固定早餐供應時段，入住時再確認。'
},['千曲館溫泉酒店・Club Wyndham']);

replaceHotel('一乃湯果亭',{
  badges:[['onsen','♨️ 溫泉旅館'],['arrival-tax','⚠️ 到店只付地方稅'],['breakfast','🍳 包早餐']],
  detail:'房費唔需要再付；到店只需付地方稅約 HK$15.25。🍳 行程預定早餐 08:00–09:00；官方訂單確認包早晚餐，但未列固定早餐供應時間，入住時再確認。'
},['澀溫泉・一乃湯果亭']);

replaceHotel('Hotel JAL City Nagano',{
  badges:[['arrival-clear','✅ 到店唔使付房費'],['breakfast','🍳 包2人自助早餐']],
  detail:'房費已處理；到店毋須再付房費。🍳 酒店現行早餐 06:30–09:30，最遲入場 09:10；行程預定 07:45–08:30。繁忙日酒店可能提早開餐或採分時段安排。'
},['長野日航都市酒店']);

replaceHotel('高山櫻庵',{
  badges:[['onsen','♨️ 天然溫泉酒店'],['arrival-tax','⚠️ 到店只付地方稅']],
  detail:'房費唔需要再付；到店只需付城市／地方稅約 HK$30.19（2晚合計）。🍳 目前訂房資料寫「早餐另議」，未確認包含早餐；如最終方案包含／加購，酒店現行早餐用餐時段 06:30–10:00，季節可能調整。'
},['飛驒花里之湯・高山櫻庵']);

replaceHotel('Residence Hotel Takayama Station',{
  badges:[['booked','✅ 已正式預訂'],['arrival-clear','✅ 到店唔使付房費']],
  detail:'Hotels.com 訂單已確認，HK$447.28 已支付；到店毋須再付房費。🍳 目前預訂資料未見包含早餐。',
  noteOverride:'標準雙人房・非吸煙｜1/15 15:00 入住 → 1/16 11:00 退房｜已正式預訂'
},['高山站前 Residence Hotel']);

replaceHotel('Iroha Grand Hotel Matsumoto Ekimae',{
  badges:[['pending','📝 尚待正式訂單／付款資料'],['breakfast','🍳 目前選定方案包2人早餐']],
  detail:'目前未有正式付款資料，所以暫時只標示為待確認；確認後只會顯示「到店要付／到店唔使付」。🍳 酒店現行早餐 06:30–10:00，最遲入場／LO 09:30；行程預定 08:00–09:00。'
},['松本站前 Iroha Grand Hotel']);

/* Extra pre-departure items that are easy to forget. */
const ids=new Set(d.departureChecklist.flatMap(g=>g.items.map(x=>x[0])));
function addGroup(group,items){
  const fresh=items.filter(x=>!ids.has(x[0]));
  fresh.forEach(x=>ids.add(x[0]));
  if(fresh.length)d.departureChecklist.push({group,items:fresh});
}
addGroup('🧴 個人用品／藥物',[
  ['meds','平時需要嘅藥物＋少量常用藥'],
  ['toiletries','牙刷／牙膏／剃鬚／護膚用品'],
  ['lipbalm','潤唇膏＋護手霜／凡士林（日本冬天空氣乾）'],
  ['tissues','紙巾／濕紙巾'],
  ['heatpacks','暖包／暖貼'],
  ['smalltowel','細毛巾／溫泉用小袋'],
  ['mask','口罩（長途交通／乾燥環境備用）']
]);
addGroup('🧳 行李／雜項',[
  ['luggage','28吋＋26吋＋20吋行李箱狀態／鎖確認'],
  ['daybag','每日用背囊／斜孭袋'],
  ['zipbags','密實袋／膠袋：濕襪、濕手套、垃圾用'],
  ['laundry','少量洗衣袋／污衣袋'],
  ['pen','原子筆＋少量便條'],
  ['copies','護照／駕照／保險重要資料另存雲端＋離線副本']
]);
})();


/* Cross-device departure checklist sync */
(function(){
  if(document.getElementById("checklistSyncScript")) return;
  const s=document.createElement("script");
  s.id="checklistSyncScript";
  s.src="assets/checklist-sync.js?v=1";
  s.defer=true;
  document.head.appendChild(s);
})();
