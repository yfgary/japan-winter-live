(function(){
'use strict';
if(window.MultiTripItineraryRenderer&&window.MultiTripItineraryRenderer.__v1)return;

const TYPE_META={
 flight:['✈️','航班'],train:['🚆','鐵路'],transport:['🚆','交通'],drive:['🚗','駕車'],car:['🚗','租車'],hotel:['🏨','酒店'],attraction:['📍','景點'],shopping:['🛍️','購物'],meal:['🍽️','餐飲'],onsen:['♨️','溫泉'],luggage:['🧳','行李'],walk:['🚶','步行'],ferry:['⛴️','渡輪'],activity:['🎯','活動']
};
const DEFAULT_TRIP='shirakawago-shinhotaka-2027';
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const mapUrl=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q||'');

function cfg(){return window.MultiTrip&&window.MultiTrip.config||{};}
function mode(){
 const c=cfg(),r=c.renderers&&c.renderers.itinerary;
 if(r&&r.mode)return r.mode;
 return (c.id||'')===DEFAULT_TRIP?'hydrate':'generate';
}
function days(){const d=window.MultiTripData&&window.MultiTripData.all('itinerary');return d&&Array.isArray(d.days)?d.days:[];}
function formatDate(date){
 if(!date)return'';
 try{
  const c=cfg(),tz=c.timezone||'Asia/Tokyo',dt=new Date(date+'T12:00:00');
  const wk=new Intl.DateTimeFormat('zh-HK',{weekday:'short',timeZone:tz}).format(dt);
  return date.replace(/-/g,'/')+(wk?' · '+wk:'');
 }catch(e){return String(date).replace(/-/g,'/');}
}
function typeMeta(t){return TYPE_META[t]||['•','行程'];}
function hardCutMap(day){const m=new Map();(day.hardCuts||[]).forEach(x=>{if(x&&x.time)m.set(x.time,x);});return m;}
function mapPin(q){return q?'<a class="map-pin" href="'+mapUrl(q)+'" target="_blank" rel="noopener" title="Google Maps">📍</a>':'';}

function hydrateDay(day){
 const el=document.getElementById(day.id);if(!el)return false;
 el.dataset.tripDataSource='itinerary.json';
 el.dataset.tripDay=String(day.day||'');
 el.dataset.tripDate=day.date||'';
 const n=el.querySelector('.day-number');if(n)n.textContent='DAY '+(day.day||String(day.id||'').replace(/\D/g,''));
 const t=el.querySelector('.day-title');if(t&&day.title)t.textContent=day.title;
 const d=el.querySelector('.day-date');if(d&&day.date)d.textContent=formatDate(day.date);
 const r=el.querySelector('.day-route');if(r&&day.route)r.textContent=day.route;
 return true;
}
function hydrateAll(){
 let count=0;days().forEach(d=>{if(hydrateDay(d))count++;});
 document.documentElement.dataset.itineraryRenderer='hydrate';
 document.documentElement.dataset.itineraryDataDays=String(count);
 return count;
}

function renderHighlights(day){
 const cuts=day.hardCuts||[],backs=day.backups||[],constraints=day.constraints||[],bonus=day.bonus||[];
 if(!cuts.length&&!backs.length&&!constraints.length&&!bonus.length)return'';
 const rows=[];
 cuts.forEach(x=>rows.push('<div class="highlight-item highlight-danger">⏰ <strong>'+esc(x.time||'')+'</strong> '+esc(x.label||'Hard Cut')+'</div>'));
 backs.forEach(x=>rows.push('<div class="highlight-item">🅱️ Backup：'+esc(x)+'</div>'));
 constraints.forEach(x=>rows.push('<div class="highlight-item highlight-road">⚠️ '+esc(x)+'</div>'));
 bonus.forEach(x=>rows.push('<div class="highlight-item">✨ Bonus：'+esc(x)+'</div>'));
 return '<div class="day-highlights"><div class="highlights-title">今日重點</div><div class="highlights-grid">'+rows.join('')+'</div></div>';
}
function renderItem(item,cutMap){
 const meta=typeMeta(item.type),cut=cutMap.get(item.time||'');
 const hard=!!cut||item.hardCut===true;
 let note=item.note||'';
 if(item.durationMinutes)note+=(note?' · ':'')+'預計 '+item.durationMinutes+' 分鐘';
 if(cut&&cut.label)note+=(note?' · ':'')+'Hard Cut：'+cut.label;
 return '<div class="timeline-item" data-item-type="'+esc(item.type||'item')+'">'
  +'<div class="time">'+esc(item.time||'—')+'</div>'
  +'<div class="timeline-card'+(hard?' hard-cut':'')+'">'
  +'<div class="event-type">'+meta[0]+' '+esc(meta[1])+'</div>'
  +'<h3>'+esc(item.title||'行程')+mapPin(item.map)+'</h3>'
  +(note?'<p>'+esc(note)+'</p>':'')
  +'</div></div>';
}
function renderHotel(day){
 if(!day.hotelId||!window.MultiTripData)return'';
 const h=window.MultiTripData.hotel(day.hotelId);if(!h)return'';
 const title=h.name||h.title||day.hotelId;
 const detail=[h.payment,h.note].filter(Boolean).join(' · ');
 return '<div class="special-box"><strong>🏨 今日住宿：</strong>'+esc(title)+(detail?'<br>'+esc(detail):'')+'</div>';
}
function renderDay(day){
 const cutMap=hardCutMap(day),items=Array.isArray(day.items)?day.items:[];
 const timeline=items.length?'<div class="timeline">'+items.map(x=>renderItem(x,cutMap)).join('')+'</div>':'<div class="special-box">🧭 呢日由專用 Module／彈性規則決定；目前路線：'+esc(day.route||'待定')+'</div>';
 return '<details class="day" id="'+esc(day.id)+'" data-trip-data-source="itinerary.json" data-trip-day="'+esc(day.day)+'">'
  +'<summary><div class="day-summary-main"><div class="day-number">DAY '+esc(day.day)+'</div><div class="day-title">'+esc(day.title||'')+'</div><div class="day-date">'+esc(formatDate(day.date))+'</div><div class="day-route">'+esc(day.route||'')+'</div></div></summary>'
  +renderHighlights(day)
  +'<div class="day-content">'+timeline+renderHotel(day)+'</div>'
  +'</details>';
}
function rebuildNav(ds){
 const inner=document.querySelector('.day-nav-inner');if(!inner)return;
 inner.querySelectorAll('a[href^="#d"],a[data-day]').forEach(a=>a.remove());
 const firstControl=inner.querySelector('.nav-btn');
 ds.forEach(d=>{
  const a=document.createElement('a');a.href='#'+d.id;a.dataset.day=d.id;a.textContent='D'+d.day;
  if(firstControl)inner.insertBefore(a,firstControl);else inner.appendChild(a);
 });
}
function generateAll(){
 const ds=days();if(!ds.length)return 0;
 const container=document.querySelector('.container');if(!container)return 0;
 let mount=document.getElementById('multiTripGeneratedDays');
 const legacy=[...container.querySelectorAll('details.day')];
 if(!mount){mount=document.createElement('div');mount.id='multiTripGeneratedDays';mount.dataset.tripGenerated='1';if(legacy[0])container.insertBefore(mount,legacy[0]);else container.appendChild(mount);}
 legacy.forEach(x=>x.remove());
 mount.innerHTML=ds.map(renderDay).join('');
 rebuildNav(ds);
 document.documentElement.dataset.itineraryRenderer='generate';
 document.documentElement.dataset.itineraryDataDays=String(ds.length);
 return ds.length;
}
function render(){
 if(!/(?:^|\/)itinerary\.html$/.test(location.pathname))return 0;
 const m=mode();
 const count=m==='generate'?generateAll():hydrateAll();
 document.dispatchEvent(new CustomEvent('multitrip:itineraryrendered',{detail:{mode:m,count,tripId:window.MultiTrip&&window.MultiTrip.id}}));
 return count;
}

window.MultiTripItineraryRenderer={__v1:true,render,hydrateAll,generateAll,mode};

Promise.all([
 window.MultiTrip&&window.MultiTrip.ready?window.MultiTrip.ready:Promise.resolve(),
 window.MultiTripData&&window.MultiTripData.ready?window.MultiTripData.ready:Promise.resolve()
]).then(()=>{
 const m=mode();
 if(m==='hydrate'){
  [0,350,900,1800].forEach(t=>setTimeout(render,t));
 }else{
  render();
 }
}).catch(err=>console.error('Multi Trip itinerary renderer failed',err));
})();
