(function(){
'use strict';

if(window.__japan2027V901Hotfix)return;
window.__japan2027V901Hotfix=true;

function removeDuplicateInfoButtons(root){
  (root||document).querySelectorAll('.timeline-card h3').forEach(h=>{
    const generic=h.querySelector('.attraction-info-btn,.enhance-info-btn,.backup-info-btn');
    const custom=[...h.querySelectorAll('.v90-shrine-info-btn')];
    if(generic&&custom.length){custom.forEach(b=>b.remove());}
    if(custom.length>1){custom.slice(1).forEach(b=>b.remove());}
  });
}

function ensureTripInfoNav(){
  if(!/trip-info\.html(?:$|[?#])/.test(location.pathname+location.search+location.hash))return;
  const nav=document.querySelector('.quick-nav-inner');
  if(nav){
    if(!nav.querySelector('a[href="#trains"]')){
      const a=document.createElement('a');a.href='#trains';a.textContent='🚆 火車';
      const ref=nav.querySelector('a[href="#transport"]');ref?ref.insertAdjacentElement('afterend',a):nav.appendChild(a);
    }
    if(!nav.querySelector('a[href="#winter-shrines"]')){
      const a=document.createElement('a');a.href='#winter-shrines';a.textContent='⛩️ 神社';
      const ref=nav.querySelector('a[href="#hotels"]');ref?ref.insertAdjacentElement('afterend',a):nav.appendChild(a);
    }
  }
}

function run(){
  removeDuplicateInfoButtons(document);
  ensureTripInfoNav();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',run,{once:true});
}else run();

[120,350,800,1600,2600].forEach(t=>setTimeout(run,t));
})();
