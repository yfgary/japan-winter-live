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

addCss('assets/trip-enhancements-v2.css?v=6');
addCss('assets/trip-enhancements-v3.css?v=6');

const scripts = [
    'assets/trip-enhancement-data.js?v=6',
    'assets/trip-user-overrides.js?v=6',
    'assets/trip-deep-info-d1-d4.js?v=6',
    'assets/trip-deep-info-d5-d9.js?v=6',
    'assets/trip-deep-info-backups.js?v=6',
    'assets/trip-enhancements-v3.js?v=6'
];

/* itinerary.html / trip-info.html load this just before </body>.
 * Parser-blocking document.write keeps script order deterministic on iPhone PWA.
 */
if (document.readyState === 'loading') {
    scripts.forEach(function(src){
        document.write('<script src="' + src + '"><\\/script>');
    });
    return;
}

/* Fallback if the loader is ever moved to another position. */
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
    return p.then(function(){return loadScript(src);});
},Promise.resolve()).catch(function(err){
    console.error('Trip V3 enhancements failed to load',err);
});

})();
