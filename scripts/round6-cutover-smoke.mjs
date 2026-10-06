import { chromium } from 'playwright';

const base='http://127.0.0.1:8000';
const tripId='shirakawago-shinhotaka-2027';
const failures=[];
const assert=(v,m)=>{if(!v)throw new Error(m);};
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
async function check(name,fn){
  try{await fn();console.log('PASS',name);}
  catch(e){failures.push(name+': '+e.message);console.error('FAIL',name,e.message);}
}
async function getJson(path){
  const r=await fetch(base+path);
  if(!r.ok)throw new Error(path+' HTTP '+r.status);
  return r.json();
}
const [itinerary,attractions,hotels,live,departure]=await Promise.all([
  getJson('/trips/'+tripId+'/itinerary.json'),
  getJson('/trips/'+tripId+'/attractions.json'),
  getJson('/trips/'+tripId+'/hotels.json'),
  getJson('/trips/'+tripId+'/live-cams.json'),
  getJson('/trips/'+tripId+'/departure-checklist.json')
]);

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1365,height:950}});

async function open(url){
  const page=await context.newPage();
  const scripts=[],docs=[],errors=[];
  page.on('request',req=>{
    try{
      const u=new URL(req.url());
      if(u.origin!==base)return;
      if(req.resourceType()==='script')scripts.push(u.pathname.replace(/^\//,''));
      if(req.resourceType()==='document')docs.push(u.pathname);
    }catch{}
  });
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+url,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#app, main.container, main');
  await page.waitForTimeout(500);
  return {page,scripts:[...new Set(scripts)],docs:[...new Set(docs)],errors};
}

await check('Japan public Itinerary routes to Standard runtime only',async()=>{
  const {page,scripts,docs,errors}=await open('/itinerary.html?trip='+tripId+'&day=d6');
  assert(new URL(page.url()).pathname==='/itinerary.html','canonical public itinerary URL not restored');
  assert(docs.includes('/standard/itinerary.html'),'Standard itinerary document was not used');
  const expected=['assets/cutover-router-v1.js','assets/standard-core-v1.js','assets/standard-modes-v1.js','assets/standard-render-itinerary-v1.js'];
  for(const s of expected)assert(scripts.includes(s),'missing script '+s);
  const legacy=scripts.filter(s=>/attraction-info|trip-v8|trip-v9|trip-core|multi-trip|site-shell|d6-d8-weather|japan2027/i.test(s));
  assert(legacy.length===0,'Japan loaded legacy scripts: '+legacy.join(', '));
  assert(await page.locator('.day-card').count()===9,'D1-D9 render count mismatch');
  assert(await page.locator('#d6 .timeline-item').count()===(itinerary.days.find(d=>d.id==='d6').items||[]).length,'D6 timeline count mismatch');
  assert(!(await page.locator('#d6 .timeline').innerText()).includes('平湯神社'),'D6 optional shrine leaked into main timeline');
  assert((await page.locator('#d6').innerText()).includes('平湯神社｜如有時間加'),'D6 backup shrine missing');
  assert(errors.length===0,'page errors: '+errors.join(' | '));
  await page.close();
});

await check('Today and Driving Mode work after public cutover routing',async()=>{
  const {page}=await open('/itinerary.html?trip='+tripId+'&day=d6');
  const d6=itinerary.days.find(d=>d.id==='d6');
  await page.getByRole('button',{name:/Today Mode/}).click();
  let modal=clean(await page.locator('#modalBody').innerText());
  assert(modal.includes('D6'),'Today Mode D6 mismatch');
  assert(modal.includes(clean(d6.title)),'Today Mode title mismatch');
  await page.locator('[data-close-modal]').last().click();
  await page.getByRole('button',{name:/Driving Mode/}).click();
  const stops=(d6.items||[]).filter(i=>i.map||i.attractionId||i.hotelId);
  modal=clean(await page.locator('#modalBody').innerText());
  assert(modal.includes(clean(stops[0].title)),'Driving first stop mismatch');
  if(stops.length>1){
    await page.getByRole('button',{name:/完成／下一站/}).click();
    modal=clean(await page.locator('#modalBody').innerText());
    assert(modal.includes(clean(stops[1].title)),'Driving next stop mismatch');
  }
  const keys=await page.evaluate(()=>Object.keys(localStorage));
  assert(keys.some(k=>k.startsWith('multiTrip.driving.'+tripId+'.')),'canonical Driving state key missing');
  assert(!keys.some(k=>/japanWinter2027|japan2027|tripv2|shinhotakaDay/i.test(k)),'legacy Japan storage key created');
  await page.close();
});

await check('Trip Info preserves 7 hotels and 96-item checklist',async()=>{
  const {page,scripts,docs,errors}=await open('/trip-info.html?trip='+tripId);
  assert(new URL(page.url()).pathname==='/trip-info.html','canonical Trip Info URL not restored');
  assert(docs.includes('/standard/trip-info.html'),'Standard Trip Info document not used');
  assert(!scripts.some(s=>/attraction-info|trip-v8|trip-v9|multi-trip|site-shell/i.test(s)),'Trip Info loaded legacy runtime');
  const body=await page.locator('#app').innerText();
  for(const h of hotels.hotels)assert(body.includes(h.name),'hotel missing: '+h.name);
  const count=(departure.groups||[]).reduce((n,g)=>n+(g.items||[]).length,0);
  assert(count===96,'source checklist is not 96');
  assert(await page.locator('[data-departure-id]').count()===96,'rendered checklist is not 96');
  const first=departure.groups[0].items[0].id;
  const last=departure.groups.at(-1).items.at(-1).id;
  for(const id of [first,last]){
    await page.locator('[data-departure-id="'+id+'"]').check();
    const key='multiTrip.departureChecklist.'+tripId+'.'+id;
    assert(await page.evaluate(k=>localStorage.getItem(k),key)==='true','checklist state missing '+key);
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-departure-id]');
  assert(await page.locator('[data-departure-id="'+first+'"]').isChecked(),'checklist persistence failed');
  assert(errors.length===0,'Trip Info page errors: '+errors.join(' | '));
  await page.close();
});

await check('Attractions preserve 42 rich records',async()=>{
  const {page,docs,errors}=await open('/attractions.html?trip='+tripId);
  assert(docs.includes('/standard/attractions.html'),'Standard Attractions document not used');
  assert(await page.locator('.attraction-card').count()===42,'Attractions card count is not 42');
  for(const id of ['matsumoto-castle','shinhotaka','shirakawago','hirayu-shrine','hida-toshogu','hie-shrine']){
    const a=attractions.attractions.find(x=>x.id===id); assert(a,'missing attraction '+id);
    await page.locator('[data-info="'+id+'"]').click();
    const text=await page.locator('#modalBody').innerText();
    assert(text.includes(a.name),'modal name missing '+id);
    if(a.history)assert(text.includes('歷史／背景'),'history missing '+id);
    if(a.winter)assert(text.includes('冬季／天氣注意'),'winter info missing '+id);
    await page.locator('[data-close-modal]').last().click();
  }
  assert(errors.length===0,'Attractions page errors: '+errors.join(' | '));
  await page.close();
});

await check('Live Cam preserves fixed D1-D9 Standard bindings',async()=>{
  const {page,docs,errors}=await open('/live.html?trip='+tripId);
  assert(docs.includes('/standard/live.html'),'Standard Live document not used');
  assert(await page.locator('.live-day').count()===9,'Live day count is not 9');
  assert(await page.locator('.live-camera').count()===37,'Live camera rendered count is not 37');
  for(const day of live.days){
    assert(await page.locator('#'+day.id+' .live-camera').count()===(day.cameras||[]).length,day.id+' camera binding mismatch');
  }
  const d7=await page.locator('#d7').innerText();
  assert(!d7.includes('新穗高')&&!d7.includes('新穂高'),'D7 Live has Shinhotaka contamination');
  const d8=await page.locator('#d8').innerText();
  assert(!d8.includes('白川鄉')&&!d8.includes('白川郷')&&!d8.includes('新穗高')&&!d8.includes('新穂高'),'D8 Live has alternate-day contamination');
  assert(errors.length===0,'Live page errors: '+errors.join(' | '));
  await page.close();
});

await check('Cross-page Standard navigation keeps public URLs and trip',async()=>{
  const {page}=await open('/itinerary.html?trip='+tripId);
  for(const [name,path] of [[/旅程資料/,'/trip-info.html'],[/景點總覽/,'/attractions.html'],[/Live Cam/,'/live.html']]){
    await page.getByRole('link',{name}).click();
    await page.waitForTimeout(350);
    const u=new URL(page.url());
    assert(u.pathname===path,'navigation did not restore public path '+path);
    assert(u.searchParams.get('trip')===tripId,'navigation lost active trip');
  }
  await page.close();
});

await check('Bangkok and Hokkaido remain on legacy fallback',async()=>{
  for(const [id,label] of [['bangkok-2026','曼谷'],['hokkaido-2025','北海道']]){
    const {page,docs,errors}=await open('/itinerary.html?trip='+id);
    assert(docs.includes('/legacy/itinerary.html'),id+' did not use legacy fallback');
    const u=new URL(page.url());
    assert(u.pathname==='/itinerary.html'&&u.searchParams.get('trip')===id,id+' canonical URL/trip mismatch');
    const text=await page.locator('body').innerText();
    assert(text.includes(label),id+' legacy page did not render expected trip');
    assert(!text.includes('旅程資料載入失敗'),id+' legacy fallback shows load error');
    assert(errors.length===0,id+' page errors: '+errors.join(' | '));
    await page.close();
  }
});

await browser.close();
if(failures.length){
  console.error('\nRound 6 browser failures:\n'+failures.map(x=>' - '+x).join('\n'));
  process.exit(1);
}
console.log('\nRound 6 production cutover browser QA PASS');
