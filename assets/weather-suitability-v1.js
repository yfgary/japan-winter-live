(function(){
'use strict';
if(window.__japan2027WeatherSuitabilityV1)return;
window.__japan2027WeatherSuitabilityV1=true;

const CACHE='japan2027_weather_suitability_v1';
const TTL=10*60*1000;
const REGIONS={
 matsumoto:{name:'松本',label:'松本城／市區',type:'cityscenic',lat:36.2381,lon:137.9720},
 karuizawa:{name:'輕井澤',label:'輕井澤戶外／Outlet',type:'cityscenic',lat:36.3485,lon:138.5969},
 chikuma:{name:'千曲',label:'千曲',type:'road',lat:36.5330,lon:138.1200},
 yamanouchi:{name:'山之內／澀溫泉',label:'地獄谷／澀溫泉',type:'snowwalk',lat:36.7344,lon:138.4331},
 nagano:{name:'長野／須坂',label:'長野／須坂',type:'city',lat:36.6486,lon:138.2450},
 hakuba:{name:'白馬',label:'白馬岩岳',type:'mountain',lat:36.6982,lon:137.8619},
 takayama:{name:'高山',label:'高山市區',type:'cityscenic',lat:36.1461,lon:137.2522},
 shinhotaka:{name:'新穗高',label:'新穗高',type:'mountain',lat:36.2828,lon:137.5804},
 shirakawago:{name:'白川鄉',label:'白川鄉',type:'village',lat:36.2573,lon:136.9068}
};

function cacheRead(){try{return JSON.parse(localStorage.getItem(CACHE)||'{}');}catch(e){return{};}}
function cacheWrite(x){try{localStorage.setItem(CACHE,JSON.stringify(x));}catch(e){}}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null;}
function visKm(v){const x=n(v);return x==null?null:x/1000;}
function round1(v){return Math.round(v*10)/10;}
function weighted(parts){let s=0,w=0;parts.forEach(p=>{if(p[0]!=null&&p[1]>0){s+=p[0]*p[1];w+=p[1];}});return w?Math.max(0,Math.min(10,s/w)):null;}
function bandScore(v,rows){if(v==null)return null;for(const r of rows){if(v>=r[0])return r[1];}return rows[rows.length-1][1];}
function invBandScore(v,rows){if(v==null)return null;for(const r of rows){if(v<=r[0])return r[1];}return rows[rows.length-1][1];}

function visibilityScore(type,km){
 if(km==null)return null;
 if(type==='mountain')return bandScore(km,[[20,10],[15,9],[10,7.5],[5,5],[0,2.5]]);
 if(type==='village')return bandScore(km,[[10,10],[7,9],[5,7.5],[3,5.5],[0,3]]);
 if(type==='snowwalk')return bandScore(km,[[10,10],[7,9],[5,7],[3,5],[0,3]]);
 if(type==='road')return bandScore(km,[[10,10],[5,8],[3,6],[0,3.5]]);
 if(type==='cityscenic')return bandScore(km,[[10,10],[7,9],[5,8],[3,6.5],[0,4]]);
 return bandScore(km,[[7,10],[5,9],[3,7.5],[0,5]]);
}
function cloudScore(type,v){
 if(type==='mountain')return invBandScore(v,[[20,10],[30,9.5],[50,8],[70,5.5],[85,3.5],[100,2]]);
 if(type==='village')return invBandScore(v,[[80,10],[95,9],[100,8]]);
 if(type==='snowwalk')return invBandScore(v,[[70,10],[90,8.5],[100,7]]);
 if(type==='cityscenic')return invBandScore(v,[[60,10],[80,9],[95,8],[100,7]]);
 return invBandScore(v,[[90,10],[100,9]]);
}
function gustScore(type,v){
 if(type==='mountain')return invBandScore(v,[[20,10],[30,9],[40,7],[50,4.5],[999,2]]);
 if(type==='village')return invBandScore(v,[[25,10],[35,8.5],[45,6],[999,3]]);
 if(type==='snowwalk')return invBandScore(v,[[20,10],[30,8.5],[40,6],[50,4],[999,2]]);
 if(type==='road')return invBandScore(v,[[20,10],[30,8.5],[40,6.5],[50,4],[999,2]]);
 if(type==='cityscenic')return invBandScore(v,[[25,10],[35,9],[45,7],[55,5],[999,3]]);
 return invBandScore(v,[[30,10],[40,8.5],[50,6.5],[999,4]]);
}
function precipScore(v,daily){
 if(v==null)return null;
 return daily?invBandScore(v,[[20,10],[40,9],[60,7.5],[80,5.5],[100,3.5]]):invBandScore(v,[[0,10],[0.5,8.5],[2,6.5],[5,4],[999,2]]);
}
function snowScore(type,v,daily){
 if(v==null)return null;
 if(!daily){if(v<=0)return 10;if(v<=0.2)return 9;if(v<=0.7)return 7;if(v<=1.5)return 5;return 3;}
 if(type==='village')return invBandScore(v,[[5,10],[10,9],[20,7],[999,4]]);
 if(type==='snowwalk')return invBandScore(v,[[5,10],[10,8.5],[20,6],[999,3]]);
 if(type==='mountain')return invBandScore(v,[[1,10],[5,8.5],[10,6],[20,4],[999,2]]);
 return invBandScore(v,[[2,10],[5,9],[10,7],[999,4.5]]);
}
function scoreWeather(region,m,daily){
 const p=REGIONS[region];if(!p)return null;
 const vk=visKm(m.visibility);
 const a=visibilityScore(p.type,vk),b=cloudScore(p.type,n(m.cloud)),c=gustScore(p.type,n(m.gust)),d=precipScore(n(m.precip),daily),e=snowScore(p.type,n(m.snow),daily);
 const weights={mountain:[.35,.25,.20,.10,.10],village:[.30,.05,.25,.20,.20],snowwalk:[.20,.08,.25,.22,.25],road:[.25,.05,.30,.25,.15],cityscenic:[.20,.10,.25,.30,.15],city:[.15,.05,.25,.40,.15]}[p.type]||[.20,.10,.25,.30,.15];
 const score=weighted([[a,weights[0]],[b,weights[1]],[c,weights[2]],[d,weights[3]],[e,weights[4]]]);
 if(score==null)return null;
 const s=round1(score),colour=s>=8?'green':s>=5.5?'yellow':'red';
 let text=s>=9?'非常理想':s>=8?'適合':s>=6.5?'可以去':s>=5.5?'勉強可以':'不理想';
 if(region==='shinhotaka'&&s>=9)text='非常適合・值得優先去';
 if(region==='shinhotaka'&&s<5.5)text='不建議用呢日去';
 if(region==='shirakawago'&&s<5.5)text='不理想・道路安全優先';
 const basis=[];
 if(vk!=null)basis.push((daily?'平均能見度 ':'能見度 ')+round1(vk)+' km');
 if(n(m.cloud)!=null)basis.push((daily?'平均雲量 ':'雲量 ')+Math.round(n(m.cloud))+'%');
 if(n(m.gust)!=null)basis.push((daily?'最大陣風 ':'陣風 ')+Math.round(n(m.gust))+' km/h');
 if(daily&&n(m.precip)!=null)basis.push('降水 '+Math.round(n(m.precip))+'%');
 const notes={shinhotaka:'最後仍要睇山頂 Live Cam＋纜車運行',hakuba:'最後仍要睇岩岳 Live Cam／運行狀況',shirakawago:'道路積雪／封路狀況要另外確認',yamanouchi:'步道積雪／結冰要另外確認',chikuma:'實際道路積雪／結冰要另外確認',matsumoto:'道路積雪／結冰要另外確認',karuizawa:'道路積雪／結冰要另外確認',nagano:'道路積雪／結冰要另外確認',takayama:'道路積雪／結冰要另外確認'};
 return {score:s,colour,text,basis:basis.join(' ・ '),note:notes[region]||''};
}
function dot(c){return c==='green'?'🟢':c==='yellow'?'🟡':'🔴';}
function scoreHtml(region,res){if(!res)return '';const p=REGIONS[region];return '<div class="weather-suit weather-suit-'+res.colour+'"><div class="weather-suit-main"><span>'+dot(res.colour)+'</span><strong>'+p.label+'天氣適合度 '+res.score.toFixed(1)+'/10</strong><span>'+res.text+'</span></div><div class="weather-suit-basis">'+res.basis+(res.note?'｜'+res.note:'')+'</div></div>';}
function addStyle(){
 if(document.getElementById('weatherSuitStyleV1'))return;
 const s=document.createElement('style');s.id='weatherSuitStyleV1';s.textContent='.weather-suit{margin:9px 0 0;padding:8px 10px;border-radius:9px;border:1px solid;font-size:10px;line-height:1.45}.weather-suit-main{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.weather-suit-main strong{font-size:11px}.weather-suit-basis{margin-top:3px;opacity:.82}.weather-suit-green{background:#edf8ef;border-color:#b9ddc0;color:#25623a}.weather-suit-yellow{background:#fff8df;border-color:#ead38c;color:#755900}.weather-suit-red{background:#fff0ef;border-color:#efbbb6;color:#9b3029}.weather3d-day .weather-suit{margin-top:8px;padding:7px 8px}.weather3d-day .weather-suit-main strong{font-size:10px}@media(max-width:720px){.weather-suit-main{gap:4px}.weather-suit-basis{font-size:9px}}';document.head.appendChild(s);
}
function apiUrl(r){
 const current=['visibility','cloud_cover','wind_gusts_10m','precipitation','snowfall','weather_code'].join(',');
 const daily=['visibility_mean','visibility_min','cloud_cover_mean','wind_gusts_10m_max','precipitation_probability_max','snowfall_sum','weather_code'].join(',');
 return 'https://api.open-meteo.com/v1/forecast?latitude='+r.lat+'&longitude='+r.lon+'&current='+encodeURIComponent(current)+'&daily='+encodeURIComponent(daily)+'&timezone=Asia%2FTokyo&forecast_days=3';
}
function render(region,data){
 const live=document.querySelector('.weather-live-wrap'),days=[...document.querySelectorAll('.weather3d-day')];
 if(!live||!days.length)return false;
 live.querySelectorAll('.weather-suit').forEach(x=>x.remove());days.forEach(x=>x.querySelectorAll('.weather-suit').forEach(y=>y.remove()));
 const c=data.current||{};
 const cr=scoreWeather(region,{visibility:c.visibility,cloud:c.cloud_cover,gust:c.wind_gusts_10m,precip:c.precipitation,snow:c.snowfall},false);
 const main=live.querySelector('.weather-live-main');if(main)main.insertAdjacentHTML('afterend',scoreHtml(region,cr));
 const d=data.daily||{};
 days.slice(0,3).forEach((card,i)=>{const rr=scoreWeather(region,{visibility:d.visibility_mean&&d.visibility_mean[i],cloud:d.cloud_cover_mean&&d.cloud_cover_mean[i],gust:d.wind_gusts_10m_max&&d.wind_gusts_10m_max[i],precip:d.precipitation_probability_max&&d.precipitation_probability_max[i],snow:d.snowfall_sum&&d.snowfall_sum[i]},true);const temp=card.querySelector('.weather3d-temp');if(temp)temp.insertAdjacentHTML('afterend',scoreHtml(region,rr));});
 return true;
}
function applyWhenReady(region,data,tries){if(render(region,data))return;if((tries||0)>=8)return;setTimeout(()=>applyWhenReady(region,data,(tries||0)+1),180);}
function load(region,force){
 const r=REGIONS[region];if(!r)return;
 const cache=cacheRead(),hit=cache[region];if(!force&&hit&&Date.now()-hit.at<TTL){applyWhenReady(region,hit.data,0);return;}
 fetch(apiUrl(r),{cache:'no-store'}).then(x=>{if(!x.ok)throw new Error('weather-score');return x.json();}).then(data=>{cache[region]={at:Date.now(),data};cacheWrite(cache);applyWhenReady(region,data,0);}).catch(()=>{if(hit)applyWhenReady(region,hit.data,0);});
}
function activeRegion(){const b=document.querySelector('.weather3d-region.active');return b&&REGIONS[b.dataset.region]?b.dataset.region:null;}
function bind(){
 const panel=document.getElementById('weather3dPanel');if(!panel)return false;
 addStyle();
 panel.querySelectorAll('.weather3d-region').forEach(b=>{if(b.dataset.suitBound)return;b.dataset.suitBound='1';b.addEventListener('click',()=>setTimeout(()=>load(b.dataset.region,false),120));});
 const ref=document.getElementById('weather3dRefresh');if(ref&&!ref.dataset.suitBound){ref.dataset.suitBound='1';ref.addEventListener('click',()=>{const id=activeRegion();if(id)setTimeout(()=>load(id,true),120);});}
 const id=activeRegion();if(id)load(id,false);return true;
}
function boot(){let i=0;const go=()=>{i++;if(bind()||i>=12)return;setTimeout(go,i<4?120:300);};go();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
