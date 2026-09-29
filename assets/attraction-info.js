(function(){
'use strict';

if (window.__japan2027EnhancementLoaderV4) return;
window.__japan2027EnhancementLoaderV4 = true;

function addCss(href){
    if (document.querySelector('link[href="' + href + '"]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
}

addCss('assets/trip-enhancements-v2.css?v=901');
addCss('assets/trip-enhancements-v3.css?v=901');
addCss('assets/site-shell-v7.css?v=901');
addCss('assets/trip-v8.css?v=901');
addCss('assets/trip-v8-1.css?v=901');

const scripts = [
    'assets/site-shell-v7.js?v=901',
    'assets/trip-enhancement-data.js?v=901',
    'assets/trip-user-overrides.js?v=901',
    'assets/trip-deep-info-d1-d4.js?v=901',
    'assets/trip-deep-info-d5-d9.js?v=901',
    'assets/trip-deep-info-backups.js?v=901',
    'assets/trip-v8-data.js?v=901',
    'assets/trip-v8-1-overrides.js?v=901',
    'assets/trip-enhancements-v3.js?v=901',
    'assets/trip-v8-ui.js?v=901',
    'assets/trip-v8-7-user-plan.js?v=901',
    'assets/trip-v8-8-d2-plan.js?v=901',
    'assets/trip-v8-9-user-fixes.js?v=901',
    'assets/trip-v9-final-fixes.js?v=901'
];

/* itinerary.html / trip-info.html load this just before </body>.
 * Parser-blocking document.write keeps script order deterministic on iPhone PWA.
 */
if (document.readyState === 'loading') {
    scripts.forEach(function(src){
        document.write('<script src="' + src + '"><' + '/script>');
    });
    return;
}

/* Fallback if the loading position is changed later. */
function loadScript(src){
    return new Promise(function(resolve,reject){
        const s=document.createElement('script');
        s.src=src;
        s.onload=resolve;
        s.onerror=reject;
        document.head.appendChild(s);
    });
}

scripts.reduce(function(p,src){
    return p.then(function(){ return loadScript(src); });
},Promise.resolve()).catch(function(err){
    console.error('Trip enhancements failed to load',err);
});

})();
