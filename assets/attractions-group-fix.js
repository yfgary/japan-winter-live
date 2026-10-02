(function(){
'use strict';

if(window.__japan2027AttractionGroupFix)return;
window.__japan2027AttractionGroupFix=true;

const ORDER=['松本','輕井澤','上田','小布施／中野','澀溫泉／山之內','須坂','白馬','高山','奧飛驒／新穗高／平湯','白川鄉','飛驒古川','安曇野'];
const MOVES={
  'v2-matsumoto-projection':{group:'松本',day:'D1',note:'夜景 Bonus'},
  'v2-aeon-matsumoto':{group:'松本',day:'D9',note:'回程補貨'},
  'v2-mountain-harbor':{group:'白馬',day:'D5',note:'白馬岩岳山頂'},
  'v2-white-park':{group:'白馬',day:'D5',note:'白馬岩岳山頂'},
  'v2-takayama-supermarket':{group:'高山',day:'D6–D8',note:'高山市區日'}
};

function slug(v){return 'loc-'+v.replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');}
function section(name){return document.getElementById(slug(name));}
function setDay(item,meta){
  const d=item.querySelector('.catalog-day');
  if(!d)return;
  d.innerHTML=meta.day+(meta.note?'<small>'+meta.note+'</small>':'');
}
function updateCount(sec){
  if(!sec)return;
  const count=sec.querySelectorAll('.catalog-item').length;
  const s=sec.querySelector('.cat-group-head span');
  if(s)s.textContent=count+' 個';
  sec.hidden=count===0;
}
function rebuildNav(){
  const nav=document.getElementById('locationNav');if(!nav)return;
  nav.innerHTML=ORDER.map(name=>{
    const sec=section(name);if(!sec)return'';
    const count=sec.querySelectorAll('.catalog-item').length;
    if(!count)return'';
    return '<a href="#'+sec.id+'">'+name+' <b>'+count+'</b></a>';
  }).join('');
}
function run(){
  if(!document.querySelector('.catalog-item'))return false;
  Object.entries(MOVES).forEach(([id,meta])=>{
    const item=document.getElementById(id);if(!item)return;
    const target=section(meta.group)?.querySelector('.catalog-timeline');
    if(!target)return;
    if(item.parentElement!==target)target.appendChild(item);
    setDay(item,meta);
  });
  document.querySelectorAll('.cat-group').forEach(updateCount);
  const other=section('其他');
  if(other&&!other.querySelector('.catalog-item'))other.remove();
  rebuildNav();
  return true;
}

function boot(){
  if(run())return;
  [80,180,400,800].forEach(t=>setTimeout(run,t));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
