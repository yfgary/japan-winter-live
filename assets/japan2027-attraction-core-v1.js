(function(){
'use strict';
if(window.Japan2027AttractionCore)return;

const BUTTON_CLASSES=['.attraction-info-btn','.enhance-info-btn','.backup-info-btn','.v90-shrine-info-btn'];
function buttonSelector(options){
  const includeBackup=!options||options.includeBackup!==false;
  return BUTTON_CLASSES.filter(selector=>includeBackup||selector!=='.backup-info-btn').join(',');
}
const BUTTON_SELECTOR=buttonSelector();

function data(){return window.Japan2027EnhancementData||null;}
function norm(value){
  return String(value||'').replace(/ⓘ|📍/g,'').replace(/\s+/g,' ').trim();
}
function strippedTitle(value){
  return String(value||'').replace(/^\s*[\p{Extended_Pictographic}\uFE0F]+\s*/u,'').trim();
}
function findBest(text,options){
  const n=norm(text);
  const includeTitle=!options||options.includeTitle!==false;
  let best=null,bestLen=0;
  ((data()||{}).attractions||[]).forEach(item=>{
    (item.aliases||[]).forEach(alias=>{
      if(alias&&n.includes(alias)&&alias.length>bestLen){best=item;bestLen=alias.length;}
    });
    if(includeTitle){
      const title=strippedTitle(item.title);
      if(title&&n.includes(title)&&title.length>bestLen){best=item;bestLen=title.length;}
    }
  });
  return best;
}
function byId(id){return ((data()||{}).attractions||[]).find(item=>item.id===id)||null;}
function ensureInfoButton(heading,info,options){
  if(!heading||!info)return null;
  const existingSelector=(options&&options.existingSelector)||BUTTON_SELECTOR;
  let button=heading.querySelector(existingSelector);
  if(button){
    if(options&&options.setExistingId)button.dataset.deepInfoId=info.id;
    return button;
  }
  button=document.createElement('button');
  button.type='button';
  button.className='enhance-info-btn';
  button.textContent='ⓘ';
  button.dataset.deepInfoId=info.id;
  if(options&&options.title)button.title=options.title;
  if(options&&options.ariaLabel)button.setAttribute('aria-label',options.ariaLabel);
  heading.appendChild(button);
  return button;
}
function dedupeInfoButtons(root){
  (root||document).querySelectorAll('.timeline-card h3').forEach(heading=>{
    const generics=[...heading.querySelectorAll('.attraction-info-btn,.enhance-info-btn,.backup-info-btn')];
    const customs=[...heading.querySelectorAll('.v90-shrine-info-btn')];
    if(generics.length){
      customs.forEach(button=>button.remove());
      generics.slice(1).forEach(button=>button.remove());
    }else if(customs.length>1){
      customs.slice(1).forEach(button=>button.remove());
    }
  });
}

window.Japan2027AttractionCore={
  BUTTON_SELECTOR,
  buttonSelector,
  norm,
  strippedTitle,
  findBest,
  byId,
  ensureInfoButton,
  dedupeInfoButtons
};
})();
