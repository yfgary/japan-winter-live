(function(){
'use strict';

if (window.__japan2027SiteShellV7) return;
window.__japan2027SiteShellV7 = true;

const INSTALLED_VERSION = 'v8.1';
const VERSION_URL = 'version.json';
const WEATHER_CACHE_KEY = 'japan2027_weather_cache_v1';
const WEATHER_REGION_KEY = 'japan2027_weather_region';
const WEATHER_TTL = 30 * 60 * 1000;

const REGIONS = [
    {id:'matsumoto', name:'松本', jp:'松本市', lat:36.2381, lon:137.9720},
    {id:'karuizawa', name:'輕井澤', jp:'軽井沢町', lat:36.3485, lon:138.5969},
    {id:'chikuma', name:'千曲', jp:'千曲市', lat:36.5330, lon:138.1200},
    {id:'yamanouchi', name:'山之內／澀溫泉', jp:'山ノ内町・渋温泉', lat:36.7344, lon:138.4331},
    {id:'nagano', name:'長野／須坂', jp:'長野市・須坂市', lat:36.6486, lon:138.2450},
    {id:'hakuba', name:'白馬', jp:'白馬村', lat:36.6982, lon:137.8619},
    {id:'takayama', name:'高山', jp:'高山市', lat:36.1461, lon:137.2522},
    {id:'shinhotaka', name:'新穗高', jp:'新穂高ロープウェイ周辺', lat:36.2828, lon:137.5804},
    {id:'shirakawago', name:'白川鄉', jp:'白川郷・荻町', lat:36.2573, lon:136.9068}
];

function japanDateKey(){
    try{
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone:'Asia/Tokyo', year:'numeric', month:'2-digit', day:'2-digit'
        }).formatToParts(new Date());
        const v={};
        parts.forEach(p=>v[p.type]=p.value);
        return v.year+'-'+v.month+'-'+v.day;
    }catch(e){
        return new Date().toISOString().slice(0,10);
    }
}

function japanTimeLabel(date){
    try{
        return new Intl.DateTimeFormat('zh-HK', {
            timeZone:'Asia/Tokyo', hour:'2-digit', minute:'2-digit', hour12:false
        }).format(date || new Date());
    }catch(e){ return ''; }
}

function setupVersion(){
    let badge=document.getElementById('siteVersionBadge');
    if(!badge){
        badge=document.createElement('button');
        badge.type='button';
        badge.id='siteVersionBadge';
        badge.className='site-version-badge';
        badge.setAttribute('aria-label','網站版本');
        document.body.appendChild(badge);
    }

    let latestVersion=null;
    badge.textContent='版本 '+INSTALLED_VERSION;
    badge.title='本機網站版本：'+INSTALLED_VERSION;

    function markOffline(){
        badge.classList.remove('current','outdated');
        badge.classList.add('offline');
        badge.textContent='版本 '+INSTALLED_VERSION+'・離線';
        badge.title='目前離線；本機版本 '+INSTALLED_VERSION;
    }

    function checkVersion(){
        if(!navigator.onLine){ markOffline(); return; }
        fetch(VERSION_URL+'?t='+Date.now(), {cache:'no-store'})
            .then(r=>{ if(!r.ok) throw new Error('version'); return r.json(); })
            .then(v=>{
                latestVersion=v.version || null;
                badge.classList.remove('offline','current','outdated');
                if(latestVersion && latestVersion !== INSTALLED_VERSION){
                    badge.classList.add('outdated');
                    badge.textContent='⚠️ '+INSTALLED_VERSION+' → '+latestVersion;
                    badge.title='本機 '+INSTALLED_VERSION+'；最新 '+latestVersion+'。撳一下檢查更新。';
                }else{
                    badge.classList.add('current');
                    badge.textContent='版本 '+INSTALLED_VERSION;
                    badge.title='已係最新版本 '+INSTALLED_VERSION;
                }
            })
            .catch(markOffline);
    }

    badge.addEventListener('click', function(){
        if(latestVersion && latestVersion !== INSTALLED_VERSION){
            if('serviceWorker' in navigator){
                navigator.serviceWorker.getRegistration().then(function(reg){
                    if(reg) return reg.update();
                }).catch(function(){}).finally(function(){ location.reload(); });
            }else{
                location.reload();
            }
        }
    });

    window.addEventListener('online',checkVersion);
    window.addEventListener('offline',markOffline);
    checkVersion();
}

function setupBackToTop(){
    let btn=document.getElementById('backToTopBtn');
    if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.id='backToTopBtn';
        btn.className='back-to-top-btn';
        btn.textContent='↑';
        btn.title='返頁頂';
        btn.setAttribute('aria-label','返頁頂');
        document.body.appendChild(btn);
    }
    function refresh(){ btn.classList.toggle('show', window.scrollY > 500); }
    window.addEventListener('scroll',refresh,{passive:true});
    btn.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
    refresh();
}

function getDefaultRegion(){
    const saved=localStorage.getItem(WEATHER_REGION_KEY);
    if(REGIONS.some(r=>r.id===saved)) return saved;

    const d=japanDateKey();
    const sh=localStorage.getItem('japanWinter2027_shinhotakaDay');
    const map={
        '2027-01-09':'matsumoto',
        '2027-01-10':'karuizawa',
        '2027-01-11':'yamanouchi',
        '2027-01-12':'yamanouchi',
        '2027-01-13':'hakuba',
        '2027-01-17':'matsumoto'
    };
    if(d==='2027-01-14') return sh==='d6' ? 'shinhotaka' : 'takayama';
    if(d==='2027-01-15') return sh==='d7' ? 'shinhotaka' : 'shirakawago';
    if(d==='2027-01-16'){
        if(sh==='d8') return 'shinhotaka';
        if(sh==='d7') return 'shirakawago';
        return 'takayama';
    }
    return map[d] || 'matsumoto';
}

function weatherText(code){
    const c=Number(code);
    if(c===0) return ['☀️','晴天'];
    if(c===1) return ['🌤️','大致晴朗'];
    if(c===2) return ['⛅','部分多雲'];
    if(c===3) return ['☁️','多雲／陰天'];
    if(c===45 || c===48) return ['🌫️','有霧'];
    if(c>=51 && c<=57) return ['🌦️','毛毛雨'];
    if(c>=61 && c<=67) return ['🌧️','有雨'];
    if(c>=71 && c<=77) return ['🌨️','有雪'];
    if(c>=80 && c<=82) return ['🌦️','驟雨'];
    if(c===85 || c===86) return ['🌨️','驟雪'];
    if(c>=95) return ['⛈️','雷暴'];
    return ['🌡️','天氣'];
}

function formatDate(s){
    const d=new Date(s+'T12:00:00');
    const week=['日','一','二','三','四','五','六'];
    return (d.getMonth()+1)+'/'+d.getDate()+' ('+week[d.getDay()]+')';
}

function readWeatherCache(){
    try{ return JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)||'{}'); }
    catch(e){ return {}; }
}

function writeWeatherCache(cache){
    try{ localStorage.setItem(WEATHER_CACHE_KEY,JSON.stringify(cache)); }
    catch(e){}
}

function weatherApiUrl(region){
    const daily=[
        'weather_code','temperature_2m_max','temperature_2m_min',
        'precipitation_probability_max','snowfall_sum','wind_gusts_10m_max'
    ].join(',');
    return 'https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(region.lat)+
        '&longitude='+encodeURIComponent(region.lon)+
        '&daily='+encodeURIComponent(daily)+
        '&timezone=Asia%2FTokyo&forecast_days=3';
}

function tripForecastNote(){
    const now=japanDateKey();
    if(now<'2026-12-20'){
        return '⚠️ 而家顯示係「由今日起 3 日」短期預報，唔係 2027 年 1 月行程天氣。到出發前幾日／旅途中會自動變成真正有用嘅 3 日預報。';
    }
    return '❄️ 山區天氣變化快；白馬／新穗高仍要配合官方 Live Cam、纜車運行及道路狀況先決定。';
}

function buildWeatherPanel(){
    if(document.getElementById('weather3dPanel')) return;
    const host=document.querySelector('main.container') || document.querySelector('.container');
    if(!host) return;

    const panel=document.createElement('section');
    panel.id='weather3dPanel';
    panel.className='weather3d-panel';
    panel.innerHTML='\
        <div class="weather3d-head">\
            <div>\
                <h2 class="weather3d-title">🌤️ 行程地區・3天天氣預測</h2>\
                <p class="weather3d-subtitle">由今日起 3 日｜最高／最低溫、降水機率、降雪量、最大陣風</p>\
            </div>\
            <button type="button" class="weather3d-refresh" id="weather3dRefresh">↻ 刷新</button>\
        </div>\
        <div class="weather3d-regions" id="weather3dRegions"></div>\
        <div class="weather3d-body" id="weather3dBody"><div class="weather3d-status">載入天氣資料…</div></div>';

    const first=host.firstElementChild;
    if(first && first.classList && (first.classList.contains('today-panel') || first.classList.contains('intro'))){
        first.insertAdjacentElement('afterend',panel);
    }else{
        host.insertBefore(panel,first || null);
    }

    const regionBar=panel.querySelector('#weather3dRegions');
    const body=panel.querySelector('#weather3dBody');
    let activeId=getDefaultRegion();

    REGIONS.forEach(function(region){
        const b=document.createElement('button');
        b.type='button';
        b.className='weather3d-region';
        b.dataset.region=region.id;
        b.textContent=region.name;
        b.addEventListener('click',function(){
            activeId=region.id;
            localStorage.setItem(WEATHER_REGION_KEY,activeId);
            activateButton();
            load(region,false);
        });
        regionBar.appendChild(b);
    });

    function activateButton(){
        regionBar.querySelectorAll('.weather3d-region').forEach(function(b){
            b.classList.toggle('active',b.dataset.region===activeId);
        });
    }

    function render(region,data,meta){
        if(!data || !data.daily || !data.daily.time){
            body.innerHTML='<div class="weather3d-status weather3d-offline">暫時攞唔到天氣資料。</div>';
            return;
        }
        const x=data.daily;
        const cards=x.time.slice(0,3).map(function(day,i){
            const w=weatherText(x.weather_code && x.weather_code[i]);
            const max=x.temperature_2m_max && x.temperature_2m_max[i];
            const min=x.temperature_2m_min && x.temperature_2m_min[i];
            const rain=x.precipitation_probability_max && x.precipitation_probability_max[i];
            const snow=x.snowfall_sum && x.snowfall_sum[i];
            const gust=x.wind_gusts_10m_max && x.wind_gusts_10m_max[i];
            return '<div class="weather3d-day">'+
                '<div class="weather3d-date">'+formatDate(day)+'</div>'+
                '<div class="weather3d-main"><span class="weather3d-icon">'+w[0]+'</span><span class="weather3d-condition">'+w[1]+'</span></div>'+
                '<div class="weather3d-temp">'+Math.round(max)+'° <span>/ '+Math.round(min)+'°C</span></div>'+
                '<div class="weather3d-metrics">'+
                    '<div>☔ 降水 '+(rain==null?'—':Math.round(rain)+'%')+'</div>'+
                    '<div>❄️ 降雪 '+(snow==null?'—':Number(snow).toFixed(1)+' cm')+'</div>'+
                    '<div>💨 陣風 '+(gust==null?'—':Math.round(gust)+' km/h')+'</div>'+
                '</div></div>';
        }).join('');
        const stamp=meta && meta.cachedAt ? new Date(meta.cachedAt) : new Date();
        body.innerHTML='\
            <div class="weather3d-location">\
                <strong>'+region.name+'</strong><span class="weather3d-jp">🇯🇵 '+region.jp+'</span>\
            </div>\
            <div class="weather3d-days">'+cards+'</div>\
            <div class="weather3d-foot">\
                <span>資料：Open-Meteo</span>\
                <span>'+((meta&&meta.fromCache)?'上次資料':'更新')+'：日本時間 '+japanTimeLabel(stamp)+'</span>\
            </div>\
            <div class="weather3d-warning">'+tripForecastNote()+'</div>';
    }

    function load(region,force){
        body.innerHTML='<div class="weather3d-status">🌤️ 讀取 '+region.name+' 3 日預報…</div>';
        const cache=readWeatherCache();
        const hit=cache[region.id];
        if(!force && hit && (Date.now()-hit.cachedAt)<WEATHER_TTL){
            render(region,hit.data,{cachedAt:hit.cachedAt,fromCache:true});
            return;
        }

        fetch(weatherApiUrl(region),{cache:'no-store'})
            .then(function(r){ if(!r.ok) throw new Error('weather'); return r.json(); })
            .then(function(data){
                cache[region.id]={cachedAt:Date.now(),data:data};
                writeWeatherCache(cache);
                render(region,data,{cachedAt:Date.now(),fromCache:false});
            })
            .catch(function(){
                if(hit){
                    render(region,hit.data,{cachedAt:hit.cachedAt,fromCache:true});
                    const note=document.createElement('div');
                    note.className='weather3d-warning weather3d-offline';
                    note.textContent='目前無法連線更新，以上係上次成功下載嘅預報。';
                    body.appendChild(note);
                }else{
                    body.innerHTML='<div class="weather3d-status weather3d-offline">🟠 天氣預報需要上網；目前未有離線快取。</div>';
                }
            });
    }

    panel.querySelector('#weather3dRefresh').addEventListener('click',function(){
        const region=REGIONS.find(r=>r.id===activeId) || REGIONS[0];
        load(region,true);
    });

    activateButton();
    load(REGIONS.find(r=>r.id===activeId) || REGIONS[0],false);
}

function init(){
    setupVersion();
    setupBackToTop();
    buildWeatherPanel();
}

if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
}else{
    init();
}

})();
