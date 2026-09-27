(function(){
'use strict';

if (window.__japan2027EnhancementLoaderV3) return;
window.__japan2027EnhancementLoaderV3 = true;

function addCss(href){
    if (document.querySelector('link[href="' + href + '"]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
}

addCss('assets/trip-enhancements-v2.css?v=7');
addCss('assets/trip-enhancements-v3.css?v=7');
addCss('assets/site-shell-v7.css?v=7');

const scripts = [
    'assets/site-shell-v7.js?v=7',
    'assets/trip-enhancement-data.js?v=7',
    'assets/trip-user-overrides.js?v=7',
    'assets/trip-deep-info-d1-d4.js?v=7',
    'assets/trip-deep-info-d5-d9.js?v=7',
    'assets/trip-deep-info-backups.js?v=7',
    'assets/trip-enhancements-v3.js?v=7'
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
