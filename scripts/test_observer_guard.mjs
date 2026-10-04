import fs from 'node:fs';
import vm from 'node:vm';

const code=fs.readFileSync(new URL('../assets/trip-performance-guard.js',import.meta.url),'utf8');

function assert(ok,message){
  if(!ok)throw new Error(message);
}

function makeSandbox(search='?trip=shirakawago-shinhotaka-2027',pathname='/itinerary.html'){
  const timers=[];
  const listeners={};
  const nativeInstances=[];
  const documentElement={nodeName:'HTML'};

  class FakeNativeMutationObserver{
    constructor(callback){this.callback=callback;this.observed=false;this.disconnected=false;this.target=null;this.options=null;nativeInstances.push(this);}
    observe(target,options){this.observed=true;this.target=target;this.options=options;}
    disconnect(){this.disconnected=true;}
    takeRecords(){return [];}
  }

  const window={
    MutationObserver:FakeNativeMutationObserver,
    addEventListener(type,callback){listeners[type]=callback;},
  };
  const sandbox={
    window,
    document:{documentElement},
    location:{search,pathname},
    URLSearchParams,
    console,
    setTimeout(callback,ms){const token={callback,ms,cancelled:false};timers.push(token);return token;},
    clearTimeout(token){if(token)token.cancelled=true;},
  };
  vm.createContext(sandbox);
  vm.runInContext(code,sandbox,{filename:'trip-performance-guard.js'});
  return{window,documentElement,timers,listeners,nativeInstances,FakeNativeMutationObserver};
}

function fireTimer(env,ms){
  const timer=env.timers.find(t=>t.ms===ms&&!t.cancelled);
  assert(timer,`missing ${ms}ms timer`);
  timer.callback();
}

{
  const env=makeSandbox();
  assert(env.window.MutationObserver!==env.FakeNativeMutationObserver,'Japan itinerary did not install guard');
  let received=[];
  const observer=new env.window.MutationObserver(records=>{received.push(records);});
  observer.observe({}, {childList:true,subtree:true});
  assert(env.nativeInstances.length===1,'guard did not create one native observer');
  assert(env.nativeInstances[0].observed,'native observer was not started');
  env.nativeInstances[0].callback([{type:'childList'},{type:'attributes'}]);
  fireTimer(env,90);
  assert(received.length===1&&received[0].length===2,'guard did not batch and deliver records');
  fireTimer(env,6500);
  assert(env.nativeInstances[0].disconnected,'startup observer did not auto-disconnect');
  fireTimer(env,7500);
  assert(env.window.MutationObserver===env.FakeNativeMutationObserver,'native MutationObserver was not restored');
  assert(typeof env.listeners.pagehide==='function','pagehide cleanup listener missing');
}

{
  const env=makeSandbox();
  const observer=new env.window.MutationObserver(()=>{});
  observer.observe(env.documentElement,{childList:true,subtree:true});
  const startupTimer=env.timers.find(t=>t.ms===6500&&!t.cancelled);
  assert(!startupTimer,'intentional i18n observer must not get the legacy auto-stop timer');
  fireTimer(env,7500);
  assert(!env.nativeInstances[0].disconnected,'intentional i18n observer was disconnected at startup restore');
  assert(env.window.MutationObserver===env.FakeNativeMutationObserver,'native constructor was not restored with persistent observer alive');
  env.listeners.pagehide();
  assert(env.nativeInstances[0].disconnected,'persistent i18n observer was not cleaned up on pagehide');
}

{
  const env=makeSandbox('?trip=multi-trip-demo-okinawa');
  assert(env.window.MutationObserver===env.FakeNativeMutationObserver,'guard must not affect generic trips');
  assert(env.timers.length===0,'generic trip unexpectedly scheduled observer guard timers');
}

{
  const env=makeSandbox('?trip=shirakawago-shinhotaka-2027','/trip-info.html');
  assert(env.window.MutationObserver===env.FakeNativeMutationObserver,'guard must not affect Trip Info');
}

console.log('TravelPilot observer runtime simulation: PASS');
