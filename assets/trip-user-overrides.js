(function(){
'use strict';
const d=window.Japan2027EnhancementData;
if(!d) return;

function replaceHotel(alias, patch){
  const h=d.hotels.find(x=>x.aliases.some(a=>a.includes(alias)||alias.includes(a)));
  if(h) Object.assign(h,patch);
}

/* Arrival-payment view: only show what still needs to be paid at the hotel. */
replaceHotel('TABINO HOTEL lit 松本',{
  badges:[['arrival-pay','🏨 到店要付房費']],
  detail:'到店以日圓支付房費 ¥13,668。'
});
replaceHotel('Club Wyndham 千曲館',{
  badges:[['onsen','♨️ 溫泉酒店'],['arrival-clear','✅ 到店唔使付房費']],
  detail:'房費按預訂安排稍後由信用卡扣款；去到酒店唔需要再付房費。'
});
replaceHotel('一乃湯果亭',{
  badges:[['onsen','♨️ 溫泉旅館'],['arrival-tax','⚠️ 到店只付地方稅']],
  detail:'房費唔需要再付；到店只需付地方稅約 HK$15.25。'
});
replaceHotel('Hotel JAL City Nagano',{
  badges:[['arrival-clear','✅ 到店唔使付房費']],
  detail:'房費已處理；到店毋須再付房費。'
});
replaceHotel('高山櫻庵',{
  badges:[['onsen','♨️ 天然溫泉酒店'],['arrival-tax','⚠️ 到店只付地方稅']],
  detail:'房費唔需要再付；到店只需付城市／地方稅約 HK$30.19（2晚合計）。'
});
replaceHotel('Residence Hotel Takayama Station',{
  badges:[['booked','✅ 已正式預訂'],['arrival-clear','✅ 到店唔使付房費']],
  detail:'Hotels.com 訂單已確認，HK$447.28 已支付；到店毋須再付房費。',
  noteOverride:'標準雙人房・非吸煙｜1/15 15:00 入住 → 1/16 11:00 退房｜已正式預訂'
});

/* Extra pre-departure items that are easy to forget. */
const ids=new Set(d.departureChecklist.flatMap(g=>g.items.map(x=>x[0])));
function addGroup(group,items){
  const fresh=items.filter(x=>!ids.has(x[0]));
  fresh.forEach(x=>ids.add(x[0]));
  if(fresh.length) d.departureChecklist.push({group,items:fresh});
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
