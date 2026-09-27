(function(){
'use strict';

if (window.__japan2027EnhancementLoader) return;
window.__japan2027EnhancementLoader = true;

function addCss(href){
    if (document.querySelector('link[href="' + href + '"]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
}

addCss('assets/trip-enhancements-v2.css?v=3');

/*
 * itinerary.html / trip-info.html load this file as a normal parser-blocking
 * script just before </body>. Inject the enhancement scripts synchronously so
 * they can register their DOMContentLoaded handler before that event fires.
 * This fixes the iPhone Home Screen/PWA case where the previous Promise-based
 * dynamic loader could finish after DOMContentLoaded and therefore never build
 * the departure checklist / backup panels.
 */
if (document.readyState === 'loading') {
    document.write('<script src="assets/trip-enhancement-data.js?v=3"><\/script>');
    document.write('<script src="assets/trip-user-overrides.js?v=3"><\/script>');
    document.write('<script src="assets/trip-enhancements-v2.js?v=3"><\/script>');
    return;
}

/* Fallback if the loading position is changed in future. */
function loadScript(src){
    return new Promise((resolve,reject)=>{
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

loadScript('assets/trip-enhancement-data.js?v=3')
    .then(()=>loadScript('assets/trip-user-overrides.js?v=3'))
    .then(()=>loadScript('assets/trip-enhancements-v2.js?v=3'))
    .then(()=>document.dispatchEvent(new Event('DOMContentLoaded')))
    .catch(err=>console.error('Trip enhancements failed to load', err));

})();
