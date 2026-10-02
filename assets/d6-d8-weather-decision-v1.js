(function(){
'use strict';
if(window.__japan2027D6D8WeatherDecisionV1)return;
window.__japan2027D6D8WeatherDecisionV1=true;

const CACHE_KEY='japan2027_shinhotaka_compare_v1';
const TTL=10*60*1000;
const TARGETS=['d6','d7','d8'];
const $=(s,r)=>(r||document).querySelector(s);

function n(v){const x=Number(v);return Number.isFinite(x)?x:null;}
function round1(v){return Math.round(v*10)/10;}
function japanDateKey(){
 try{
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),o={};
  p.forEach(x=>o[x.type]=x.value);return o.year+'-'+o.month+'-'+o.day;
 }catch(e){return new Date().toISOString().slice(0,10);}
}
function fmtDate(s){const d=new Date(s+'T12:00:00');const w=['日','一','二','三','四','五','六'];return (d.getMonth()+1)+'/'+d.getDate()+' ('+w[d.getDay()]+')';}
function leadDays(date){const a=new Date(japanDateKey()+'T12:00:00+09:00'),b=new Date(date+'T12:00:00+09:00');return Math.round((b-a)/86400000);}
function confidence(date){const d=leadDays(date);if(d<=3)return'較高';if(d<=5)return'中等';return'早期趨勢';}
function colourDot(c){return c==='green'?'🟢':c==='yellow'?'🟡':'🔴';}
function weatherText(code){const c=Number(code);if(c===0)return['☀️','晴天'];if(c===1)return['🌤️','大致晴朗'];if(c===2)return['⛅','部分多雲'];if(c===3)return['☁️','多雲／陰天'];if(c===45||c===48)return['🌫️','有霧'];if(c>=51&&c<=57)return['🌦️','毛毛雨'];if(c>=61&&c<=67)return['🌧️','有雨'];if(c>=71&&c<=77)return['🌨️','有雪'];if(c>=80&&c<=82)return['🌦️','驟雨'];if(c===85||c===86)return['🌨️','驟雪'];if(c>=95)return['⛈️','雷暴'];return['🌡️','天氣'];}
function km(v){const x=n(v);return x==null?'—':round1(x/1000)+' km';}
function cacheRead(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'null');}catch(e){return null;}}
function cacheWrite(data){try{localStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),data:data}));}catch(e){}}

function apiUrl(core){
 const r=core.regions&&core.regions.shinhotaka;if(!r)return'';
 const daily=['weather_code','temperature_2m_max','temperature_2m_min','precipitation_probability_max','snowfall_sum','wind_gusts_10m_max','visibility_mean','visibility_min','cloud_cover_mean'].join(',');
 return 'https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(r.lat)+'&longitude='+encodeURIComponent(r.lon)+'&daily='+encodeURIComponent(daily)+'&timezone=Asia%2FTokyo&forecast_days=8';
}

function addStyle(){
 if(document.getElementById('d6d8WeatherDecisionStyleV1'))return;
 const s=document.createElement('style');s.id='d6d8WeatherDecisionStyleV1';s.textContent=`
 #d6d8WeatherDecision{margin:14px 0;padding:14px;background:#fff;border:1px solid #d7e2ea;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
 .d68-head{display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.d68-head h2{margin:0;color:#1f4e79;font-size:18px}.d68-sub{margin:4px 0 0;color:#657681;font-size:10px;line-height:1.5}.d68-refresh{border:1px solid #c9dbe7;background:#eef5f9;color:#1f4e79;border-radius:9px;padding:7px 9px;font-weight:800;cursor:pointer}
 .d68-rec{margin:11px 0;padding:10px 11px;border-radius:10px;background:#eef5fb;border:1px solid #c8deee;color:#244f6d;font-size:11px;line-height:1.55}.d68-rec strong{font-size:13px}.d68-rec.good{background:#edf8ef;border-color:#badcc1;color:#28623a}.d68-rec.warn{background:#fff8df;border-color:#ead38c;color:#755900}.d68-rec.bad{background:#fff0ef;border-color:#efbbb6;color:#92342d}
 .d68-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.d68-card{position:relative;border:1px solid #dce5eb;background:#f8fafb;border-radius:11px;padding:11px;min-width:0}.d68-card.recommended{box-shadow:0 0 0 2px #75aa87}.d68-card.selected{border-color:#1f4e79}.d68-badge{display:inline-block;font-size:9px;font-weight:900;padding:3px 6px;border-radius:10px;background:#eaf1f6;color:#45657a;margin-bottom:5px}.d68-card.recommended .d68-badge{background:#e2f2e7;color:#2d6a41}.d68-day{font-size:15px;font-weight:900;color:#1f4e79}.d68-date{font-size:10px;color:#75848e;margin-top:2px}.d68-score{font-size:21px;font-weight:900;margin-top:7px}.d68-cond{font-size:11px;font-weight:800;margin-top:3px}.d68-metrics{font-size:9px;line-height:1.6;color:#566a77;margin-top:6px}.d68-confidence{font-size:9px;font-weight:800;color:#77682f;margin-top:5px}.d68-unavailable{color:#71818b;font-size:10px;line-height:1.55;margin-top:8px}.d68-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.d68-btn{border:0;border-radius:9px;background:#1f4e79;color:#fff;padding:8px 10px;font-size:10px;font-weight:900;cursor:pointer}.d68-btn.secondary{background:#eef3f7;color:#1f4e79;border:1px solid #ccdae4}.d68-note{margin-top:9px;color:#697983;font-size:9px;line-height:1.5}
 @media(max-width:680px){.d68-grid{grid-template-columns:1fr}.d68-head h2{font-size:16px}.d68-card{padding:10px}}
 `;document.head.appendChild(s);
}

function ensurePanel(){
 let p=document.getElementById('d6d8WeatherDecision');if(p)return p;
 const weather=document.getElementById('weather3dPanel');if(!weather)return null;
 p=document.createElement('section');p.id='d6d8WeatherDecision';
 p.innerHTML='<div class="d68-head"><div><h2>🚡 D6–D8 新穗高天氣自動比較</h2><div class="d68-sub">用同一套新穗高 /10 評分比較 1/14、1/15、1/16，App 只會推薦，唔會自動改你行程。</div></div><button type="button" class="d68-refresh" id="d68Refresh">↻ 刷新</button></div><div id="d68Body"><div class="d68-rec">準備比較 D6–D8…</div></div>';
 weather.insertAdjacentElement('afterend',p);return p;
}

function extract(core,scoring,data){
 const d=data&&data.daily;if(!d||!Array.isArray(d.time))return[];
 return TARGETS.map(dayId=>{
  const date=core.days[dayId]&&core.days[dayId].date,idx=d.time.indexOf(date);
  if(idx<0)return{dayId,date,available:false};
  const m={visibility:d.visibility_mean&&d.visibility_mean[idx],cloud:d.cloud_cover_mean&&d.cloud_cover_mean[idx],gust:d.wind_gusts_10m_max&&d.wind_gusts_10m_max[idx],precip:d.precipitation_probability_max&&d.precipitation_probability_max[idx],snow:d.snowfall_sum&&d.snowfall_sum[idx]};
  return{dayId,date,available:true,idx,score:scoring.scoreWeather('shinhotaka',m,true),code:d.weather_code&&d.weather_code[idx],max:d.temperature_2m_max&&d.temperature_2m_max[idx],min:d.temperature_2m_min&&d.temperature_2m_min[idx],metrics:m};
 });
}

function recommendation(rows){
 const avail=rows.filter(x=>x.available&&x.score);
 if(avail.length<3)return{day:null,kind:'warn',text:'三日資料未齊，暫時唔作最終推薦。最早由 1/9 起會逐步有 D6–D8 預報，越接近 1/14 可信度越高。'};
 const sorted=avail.slice().sort((a,b)=>b.score.score-a.score.score),top=sorted[0],second=sorted[1],diff=top.score.score-second.score.score;
 if(top.score.score<5.5)return{day:null,kind:'bad',text:'三日目前都唔理想，暫時唔建議鎖定新穗高日。等下一輪預報，再配合 Live Cam／纜車運行。'};
 if(diff<0.4)return{day:top.dayId,kind:'warn',close:true,text:top.dayId.toUpperCase()+' 暫時最高 '+top.score.score.toFixed(1)+'/10，但同 '+second.dayId.toUpperCase()+' 只差 '+diff.toFixed(1)+' 分，天氣非常接近，建議等下一輪更新先鎖定。'};
 return{day:top.dayId,kind:top.score.score>=8?'good':'warn',text:'目前最推薦 '+top.dayId.toUpperCase()+' 去新穗高：'+top.score.score.toFixed(1)+'/10，比第二名高 '+diff.toFixed(1)+' 分。'};
}

function render(core,scoring,panel,data,meta){
 const body=$('#d68Body',panel),rows=extract(core,scoring,data),rec=recommendation(rows),selected=core.getSelectedShinhotakaDay&&core.getSelectedShinhotakaDay();
 const cards=rows.map(x=>{
  const isRec=rec.day===x.dayId&&!rec.close,isSel=selected===x.dayId,badge=isRec?'⭐ 推薦':isSel?'✓ 已選擇':'新穗高候選';
  if(!x.available)return '<div class="d68-card'+(isSel?' selected':'')+'"><div class="d68-badge">'+badge+'</div><div class="d68-day">'+x.dayId.toUpperCase()+'</div><div class="d68-date">'+fmtDate(x.date)+'</div><div class="d68-unavailable">未進入目前 8 日預報範圍。</div></div>';
  const w=weatherText(x.code),s=x.score||{score:0,colour:'red',text:'未能評分'},m=x.metrics;
  return '<div class="d68-card'+(isRec?' recommended':'')+(isSel?' selected':'')+'"><div class="d68-badge">'+badge+'</div><div class="d68-day">'+x.dayId.toUpperCase()+'</div><div class="d68-date">'+fmtDate(x.date)+'</div><div class="d68-score">'+colourDot(s.colour)+' '+s.score.toFixed(1)+'/10</div><div class="d68-cond">'+w[0]+' '+w[1]+'｜'+Math.round(n(x.max)||0)+'° / '+Math.round(n(x.min)||0)+'°C</div><div class="d68-metrics">👁️ 平均能見度 '+km(m.visibility)+'<br>☁️ 雲量 '+(n(m.cloud)==null?'—':Math.round(n(m.cloud))+'%')+'｜💨 陣風 '+(n(m.gust)==null?'—':Math.round(n(m.gust))+' km/h')+'<br>☔ 降水 '+(n(m.precip)==null?'—':Math.round(n(m.precip))+'%')+'｜❄️ 新降雪 '+(n(m.snow)==null?'—':round1(n(m.snow))+' cm')+'</div><div class="d68-confidence">預報可信度：'+confidence(x.date)+'</div></div>';
 }).join('');
 const action=rec.day&&!rec.close?'<button class="d68-btn" id="d68Apply" data-day="'+rec.day+'">套用推薦 '+rec.day.toUpperCase()+'</button>':'';
 const selectedText=selected?'<span>目前手動選擇：<strong>'+selected.toUpperCase()+'</strong></span>':'<span>目前：未鎖定新穗高日</span>';
 body.innerHTML='<div class="d68-rec '+rec.kind+'"><strong>'+rec.text+'</strong><div style="margin-top:4px">'+selectedText+(meta&&meta.cached?'｜📦 暫用快取':'')+'</div></div><div class="d68-grid">'+cards+'</div><div class="d68-actions">'+action+'<button class="d68-btn secondary" id="d68OpenWeather">🌤️ 睇新穗高 5 日預測</button></div><div class="d68-note">判斷重點：能見度、雲量、陣風、降水、新降雪。推薦只作行程排序；出發當朝仍要睇山頂 Live Cam、纜車 Operation Status 同道路狀況。</div>';
 const apply=$('#d68Apply',body);if(apply)apply.onclick=()=>{core.setSelectedShinhotakaDay(apply.dataset.day);location.reload();};
 const open=$('#d68OpenWeather',body);if(open)open.onclick=()=>{
  if(core.setWeatherRegion)core.setWeatherRegion('shinhotaka');
  const b=document.querySelector('#weather3dPanel .weather3d-region[data-region="shinhotaka"]');if(b)b.click();
  const w=document.getElementById('weather3dPanel');if(w)w.scrollIntoView({behavior:'smooth',block:'start'});
 };
}

function load(core,scoring,panel,force){
 const body=$('#d68Body',panel),hit=cacheRead();
 if(!force&&hit&&Date.now()-hit.at<TTL){render(core,scoring,panel,hit.data,{cached:false});return;}
 if(body)body.innerHTML='<div class="d68-rec">更新 D6–D8 新穗高預報比較…</div>';
 fetch(apiUrl(core),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('weather');return r.json();}).then(data=>{cacheWrite(data);render(core,scoring,panel,data,{cached:false});}).catch(()=>{if(hit&&hit.data)render(core,scoring,panel,hit.data,{cached:true});else if(body)body.innerHTML='<div class="d68-rec warn">暫時攞唔到比較資料；有網絡後再按刷新。</div>';});
}

function boot(){
 const core=window.Japan2027Core,scoring=window.Japan2027WeatherScoring;
 if(!core||!scoring||typeof scoring.scoreWeather!=='function')return false;
 addStyle();const panel=ensurePanel();if(!panel)return false;
 $('#d68Refresh',panel).onclick=()=>load(core,scoring,panel,true);
 load(core,scoring,panel,false);document.documentElement.dataset.d6d8WeatherDecision='v1';return true;
}

let tries=0;function start(){tries++;if(boot()||tries>=20)return;setTimeout(start,tries<6?120:300);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
