(async function(){
'use strict';
const LOCAL='japanWinter2027DepartureChecklistV1';
const PENDING='japanWinter2027DepartureChecklistPendingV1';
const URL='https://rihnuowhkzrpfkvrsxej.supabase.co';
const KEY='sb_publishable_BRRplXPLHlRw2vcr5aMGmw_bHaHlJvy';
let createClient;
try{({createClient}=await import('https://esm.sh/@supabase/supabase-js@2'));}catch(e){return;}
const db=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});
const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const ids=()=>((window.Japan2027EnhancementData||{}).departureChecklist||[]).flatMap(g=>g.items.map(x=>x[0]));

function waitSection(){return new Promise(resolve=>{const now=document.getElementById('departure-checklist');if(now)return resolve(now);const o=new MutationObserver(()=>{const s=document.getElementById('departure-checklist');if(s){o.disconnect();resolve(s);}});o.observe(document.documentElement,{childList:true,subtree:true});});}
const section=await waitSection();
const head=section.querySelector('.section-header');
const panel=document.createElement('div');panel.style.cssText='margin-top:10px;padding:10px;border:1px solid #d8e3ea;border-radius:9px;background:#f7fafc;display:flex;gap:7px;flex-wrap:wrap;align-items:center';
panel.innerHTML='<span id="cloudSyncStatus" style="flex:1 1 180px;font-size:11px;font-weight:700">☁️ 未登入同步</span><button id="cloudSyncLogin" type="button" style="border:0;border-radius:7px;padding:7px 10px;background:#1f4e79;color:white;font-weight:700">登入同步</button><button id="cloudSyncNow" type="button" style="border:0;border-radius:7px;padding:7px 10px;background:#e9f0f5;color:#294c67;font-weight:700">↻ 同步</button><div style="width:100%;font-size:10.5px;color:#6b7882">同一個 Supabase 帳戶登入 PC／iPhone，即可共用 Checklist；離線照樣可以 Tick。</div>';
head.appendChild(panel);
const status=panel.querySelector('#cloudSyncStatus');
const setStatus=t=>status.textContent=t;

function mapInputs(){const all=[...section.querySelectorAll('#departureChecklistGroups input[type="checkbox"]')];const out={};ids().forEach((id,i)=>{if(all[i]){all[i].dataset.syncId=id;out[id]=all[i];}});return out;}
function applyState(state){const m=mapInputs();Object.entries(m).forEach(([id,cb])=>{cb.checked=!!state[id];cb.closest('.departure-item')?.classList.toggle('checked',!!state[id]);});localStorage.setItem(LOCAL,JSON.stringify(state));}

async function session(){return (await db.auth.getSession()).data.session;}
async function sync(){const s=await session();if(!s){setStatus('☁️ 未登入同步');return;}if(!navigator.onLine){setStatus('📴 離線：稍後自動同步');return;}setStatus('🔄 同步中…');const local=read(LOCAL),pending=read(PENDING);const {data,error}=await db.from('trip_checklist_state').select('item_id,checked,updated_at').eq('user_id',s.user.id);if(error){setStatus('⚠️ 同步失敗');return;}const remote={};(data||[]).forEach(r=>remote[r.item_id]=!!r.checked);if((data||[]).length===0){const rows=Object.keys(local).map(id=>({user_id:s.user.id,item_id:id,checked:!!local[id]}));if(rows.length)await db.from('trip_checklist_state').upsert(rows);}else{Object.keys(pending).forEach(id=>remote[id]=!!local[id]);if(Object.keys(pending).length){const rows=Object.keys(pending).map(id=>({user_id:s.user.id,item_id:id,checked:!!local[id]}));await db.from('trip_checklist_state').upsert(rows);write(PENDING,{});}applyState(remote);}setStatus('✅ 已同步');}

panel.querySelector('#cloudSyncLogin').onclick=async()=>{const cur=await session();if(cur){if(confirm('而家已登入。要登出同步帳戶？')){await db.auth.signOut();setStatus('☁️ 已登出');}return;}const email=prompt('Supabase 登入 Email：');if(!email)return;const password=prompt('密碼（首次使用會建立帳戶；之後其他裝置用同一 Email＋密碼）：');if(!password)return;let r=await db.auth.signInWithPassword({email,password});if(r.error){r=await db.auth.signUp({email,password});if(r.error){alert('登入／建立帳戶失敗：'+r.error.message);return;}if(!r.data.session){alert('已建立帳戶。請先去 Email 按確認連結，之後返嚟再撳「登入同步」。');return;}}await sync();};
panel.querySelector('#cloudSyncNow').onclick=sync;

section.addEventListener('change',async e=>{const cb=e.target.closest('input[type="checkbox"]');if(!cb||!cb.dataset.syncId)return;const id=cb.dataset.syncId;const p=read(PENDING);p[id]=true;write(PENDING,p);const s=await session();if(s&&navigator.onLine){const {error}=await db.from('trip_checklist_state').upsert({user_id:s.user.id,item_id:id,checked:cb.checked});if(!error){const q=read(PENDING);delete q[id];write(PENDING,q);setStatus('✅ 已同步');}}},true);
window.addEventListener('online',sync);
mapInputs();sync();
})();
