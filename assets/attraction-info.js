(function(){
'use strict';

if (window.__japan2027EnhancementLoaderV16) return;
window.__japan2027EnhancementLoaderV16 = true;

function addCss(href){
    if (document.querySelector('link[href="' + href + '"]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
}

addCss('assets/trip-enhancements-v2.css?v=913');
addCss('assets/trip-enhancements-v3.css?v=913');
addCss('assets/site-shell-v7.css?v=913');
addCss('assets/trip-v8.css?v=913');
addCss('assets/trip-v8-1.css?v=913');

const isTripInfo = /(?:^|\/)trip-info\.html$/.test(location.pathname);

const itineraryScripts = [
    'assets/trip-no-observers-v2.js?v=1',
    'assets/trip-core-v1.js?v=8',
    'assets/site-shell-v7.js?v=915',
    'assets/weather-suitability-v1.js?v=6',
    'assets/d6-d8-weather-decision-v1.js?v=1',
    'assets/version-v901-fix.js?v=11',
    'assets/nav-enhancements-v1.js?v=2',
    'assets/trip-enhancement-data.js?v=913',
    'assets/trip-user-overrides.js?v=913',
    'assets/trip-deep-info-d1-d4.js?v=913',
    'assets/trip-deep-info-d5-d9.js?v=913',
    'assets/trip-deep-info-backups.js?v=913',
    'assets/trip-v8-data.js?v=913',
    'assets/trip-v8-1-overrides.js?v=913',
    'assets/i18n-content-en-v1.js?v=1',
    'assets/trip-enhancements-v3.js?v=913',
    'assets/trip-v8-ui.js?v=913',
    'assets/trip-v8-7-user-plan.js?v=913',
    'assets/trip-v8-8-d2-plan.js?v=913',
    'assets/trip-v8-9-user-fixes.js?v=913',
    'assets/trip-v9-final-fixes.js?v=913',
    'assets/trip-v9-hotfix.js?v=913',
    'assets/trip-v9-1-routing.js?v=2',
    'assets/trip-v9-1-visit-fix.js?v=1',
    'assets/catalog-link.js?v=2',
    'assets/travel-mode-v1.js?v=2',
    'assets/travel-mode-nav-fix-v1.js?v=2',
    'assets/driving-mode-v1.js?v=1',
    'assets/i18n-v1.js?v=3',
    'assets/i18n-polish-en-v1.js?v=1'
];

const tripInfoScripts = [
    'assets/trip-core-v1.js?v=8',
    'assets/site-shell-v7.js?v=915',
    'assets/weather-suitability-v1.js?v=6',
    'assets/d6-d8-weather-decision-v1.js?v=1',
    'assets/version-v901-fix.js?v=11',
    'assets/nav-enhancements-v1.js?v=2',
    'assets/trip-enhancement-data.js?v=913',
    'assets/trip-user-overrides.js?v=913',
    'assets/trip-deep-info-d1-d4.js?v=913',
    'assets/trip-deep-info-d5-d9.js?v=913',
    'assets/trip-deep-info-backups.js?v=913',
    'assets/trip-v8-data.js?v=913',
    'assets/trip-v8-1-overrides.js?v=913',
    'assets/i18n-content-en-v1.js?v=1',
    'assets/trip-v8-7-user-plan.js?v=913',
    'assets/trip-v9-final-fixes.js?v=913',
    'assets/trip-v9-hotfix.js?v=913',
    'assets/catalog-link.js?v=2',
    'assets/i18n-v1.js?v=3',
    'assets/i18n-polish-en-v1.js?v=1'
];

const scripts = isTripInfo ? tripInfoScripts : itineraryScripts;

if (document.readyState === 'loading') {
    scripts.forEach(function(src){
        document.write('<script src="' + src + '"><' + '/script>');
    });
    return;
}

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
