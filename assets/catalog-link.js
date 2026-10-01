(function(){
'use strict';
function add(){
  document.querySelectorAll('.page-switch').forEach(sw=>{
    if(sw.querySelector('a[href="attractions.html"],a[href$="/attractions.html"]'))return;
    const a=document.createElement('a');
    a.href='attractions.html';
    a.textContent='🗾 景點總覽';
    if(/(?:^|\/)attractions\.html$/.test(location.pathname))a.classList.add('active');
    sw.appendChild(a);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();
})();
