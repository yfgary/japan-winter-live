(async function(){
'use strict';

const LOCAL='japanWinter2027DepartureChecklistV1';
const PENDING='japanWinter2027DepartureChecklistPendingV1';
const URL='https://rihnuowhkzrpfkvrsxej.supabase.co';
const KEY='sb_publishable_BRRplXPLHlRw2vcr5aMGmw_bHaHlJvy';
const CONFIRM_REDIRECT='https://yfgary.github.io/japan-winter-live/trip-info.html';

let createClient;
try{
  ({createClient}=await import('https://esm.sh/@supabase/supabase-js@2'));
}catch(e){
  return;
}

const db=createClient(URL,KEY,{
  auth:{
    persistSession:true,
    autoRefreshToken:true,
    detectSessionInUrl:true
  }
});

const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const ids=()=>((window.Japan2027EnhancementData||{}).departureChecklist||[]).flatMap(g=>g.items.map(x=>x[0]));

function waitSection(){
  return new Promise(resolve=>{
    const now=document.getElementById('departure-checklist');
    if(now)return resolve(now);
    const o=new MutationObserver(()=>{
      const s=document.getElementById('departure-checklist');
      if(s){o.disconnect();resolve(s);}
    });
    o.observe(document.documentElement,{childList:true,subtree:true});
  });
}

const section=await waitSection();
const head=section.querySelector('.section-header');
const panel=document.createElement('div');
panel.style.cssText='margin-top:10px;padding:10px;border:1px solid #d8e3ea;border-radius:9px;background:#f7fafc;display:flex;gap:7px;flex-wrap:wrap;align-items:center';
panel.innerHTML='\
<span id="cloudSyncStatus" style="flex:1 1 190px;font-size:11px;font-weight:700">☁️ 未登入同步</span>\
<button id="cloudSyncLogin" type="button" style="border:0;border-radius:7px;padding:7px 10px;background:#1f4e79;color:white;font-weight:700">登入同步</button>\
<button id="cloudSyncCreate" type="button" style="border:0;border-radius:7px;padding:7px 10px;background:#dff0e5;color:#295c3a;font-weight:700">首次建立帳戶</button>\
<button id="cloudSyncNow" type="button" style="border:0;border-radius:7px;padding:7px 10px;background:#e9f0f5;color:#294c67;font-weight:700">↻ 同步</button>\
<div style="width:100%;font-size:10.5px;color:#6b7882">同一個同步帳戶登入 PC／iPhone，即可共用 Checklist；離線仍可 Tick，重新有網後再同步。</div>';
head.appendChild(panel);

const status=panel.querySelector('#cloudSyncStatus');
const loginBtn=panel.querySelector('#cloudSyncLogin');
const createBtn=panel.querySelector('#cloudSyncCreate');
const syncBtn=panel.querySelector('#cloudSyncNow');
const setStatus=t=>status.textContent=t;

function mapInputs(){
  const all=[...section.querySelectorAll('#departureChecklistGroups input[type="checkbox"]')];
  const out={};
  ids().forEach((id,i)=>{
    if(all[i]){
      all[i].dataset.syncId=id;
      out[id]=all[i];
    }
  });
  return out;
}

function applyState(state){
  const m=mapInputs();
  Object.entries(m).forEach(([id,cb])=>{
    cb.checked=!!state[id];
    cb.closest('.departure-item')?.classList.toggle('checked',!!state[id]);
  });
  localStorage.setItem(LOCAL,JSON.stringify(state));
}

async function session(){
  return (await db.auth.getSession()).data.session;
}

async function refreshAccountUI(){
  const s=await session();
  if(s){
    loginBtn.textContent='登出同步';
    createBtn.style.display='none';
    const mail=s.user && s.user.email ? s.user.email : '同步帳戶';
    setStatus('☁️ 已登入：'+mail);
  }else{
    loginBtn.textContent='登入同步';
    createBtn.style.display='inline-block';
    setStatus('☁️ 未登入同步');
  }
  return s;
}

async function sync(){
  const s=await session();
  if(!s){
    setStatus('☁️ 未登入同步');
    return;
  }
  if(!navigator.onLine){
    setStatus('📴 離線：稍後自動同步');
    return;
  }

  setStatus('🔄 同步中…');
  const local=read(LOCAL);
  const pending=read(PENDING);

  const {data,error}=await db
    .from('trip_checklist_state')
    .select('item_id,checked,updated_at')
    .eq('user_id',s.user.id);

  if(error){
    setStatus('⚠️ 同步失敗：'+error.message);
    return;
  }

  const remote={};
  (data||[]).forEach(r=>remote[r.item_id]=!!r.checked);

  if((data||[]).length===0){
    const rows=Object.keys(local).map(id=>({
      user_id:s.user.id,
      item_id:id,
      checked:!!local[id]
    }));
    if(rows.length){
      const up=await db.from('trip_checklist_state').upsert(rows);
      if(up.error){setStatus('⚠️ 同步失敗：'+up.error.message);return;}
    }
    write(PENDING,{});
  }else{
    Object.keys(pending).forEach(id=>remote[id]=!!local[id]);
    if(Object.keys(pending).length){
      const rows=Object.keys(pending).map(id=>({
        user_id:s.user.id,
        item_id:id,
        checked:!!local[id]
      }));
      const up=await db.from('trip_checklist_state').upsert(rows);
      if(up.error){setStatus('⚠️ 同步失敗：'+up.error.message);return;}
      write(PENDING,{});
    }
    applyState(remote);
  }

  setStatus('✅ 已同步');
}

function cleanAuthErrorHash(){
  const h=new URLSearchParams((location.hash||'').replace(/^#/,''));
  const code=h.get('error_code');
  if(!code)return;
  if(code==='otp_expired'){
    setStatus('ℹ️ 確認連結已使用／已過期；如已確認帳戶，直接按「登入同步」。');
  }else{
    setStatus('⚠️ 驗證連結錯誤：'+(h.get('error_description')||code));
  }
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
}

loginBtn.onclick=async()=>{
  const cur=await session();
  if(cur){
    if(confirm('要登出目前同步帳戶？')){
      await db.auth.signOut();
      await refreshAccountUI();
    }
    return;
  }

  const email=prompt('同步帳戶 Email：');
  if(!email)return;
  const password=prompt('同步帳戶密碼：');
  if(!password)return;

  setStatus('🔐 登入中…');
  const r=await db.auth.signInWithPassword({email,password});
  if(r.error){
    const msg=(r.error.message||'').toLowerCase();
    if(msg.includes('email not confirmed')){
      alert('Email 尚未確認。請用最新一封確認電郵完成確認；如果之前連結已經顯示 localhost，但你曾經成功開過一次，可以再直接試登入。');
    }else{
      alert('登入失敗：'+r.error.message+'\n\n如果係第一次使用，請按「首次建立帳戶」，唔需要重複建立同一個 Email。');
    }
    await refreshAccountUI();
    return;
  }

  await refreshAccountUI();
  await sync();
};

createBtn.onclick=async()=>{
  const cur=await session();
  if(cur){await refreshAccountUI();return;}

  const email=prompt('建立同步帳戶 Email：');
  if(!email)return;
  const password=prompt('建立密碼（之後 PC／iPhone 都用同一組）：');
  if(!password)return;
  if(password.length<6){alert('密碼最少 6 個字元。');return;}

  setStatus('🆕 建立帳戶中…');
  const r=await db.auth.signUp({
    email,
    password,
    options:{emailRedirectTo:CONFIRM_REDIRECT}
  });

  if(r.error){
    alert('建立帳戶失敗：'+r.error.message);
    await refreshAccountUI();
    return;
  }

  if(r.data.session){
    await refreshAccountUI();
    await sync();
    return;
  }

  setStatus('📧 已寄確認電郵');
  alert('帳戶已建立。請去 Email 按確認連結。\n\n確認後應返回 Japan Winter 2027 網站；之後再按「登入同步」登入同一 Email＋密碼。');
};

syncBtn.onclick=sync;

section.addEventListener('change',async e=>{
  const cb=e.target.closest('input[type="checkbox"]');
  if(!cb||!cb.dataset.syncId)return;
  const id=cb.dataset.syncId;
  const p=read(PENDING);
  p[id]=true;
  write(PENDING,p);

  const s=await session();
  if(s&&navigator.onLine){
    const {error}=await db.from('trip_checklist_state').upsert({
      user_id:s.user.id,
      item_id:id,
      checked:cb.checked
    });
    if(!error){
      const q=read(PENDING);
      delete q[id];
      write(PENDING,q);
      setStatus('✅ 已同步');
    }else{
      setStatus('⚠️ 待同步');
    }
  }
},true);

window.addEventListener('online',sync);
db.auth.onAuthStateChange(()=>setTimeout(async()=>{await refreshAccountUI();await sync();},0));

mapInputs();
cleanAuthErrorHash();
await refreshAccountUI();
await sync();
})();
