from pathlib import Path
p=Path('assets/trip-v9-final-fixes.js')
s=p.read_text(encoding='utf-8')
old=""" [...day.querySelectorAll('.timeline-item')].forEach(x=>{const h=text(x.querySelector('h3'));if(x.compareDocumentPosition(ref)&Node.DOCUMENT_POSITION_PRECEDING)return;if(/新穗高\\s*→\\s*(高山|松本|安曇野)/.test(h))x.remove();});"""
new=""" let passed=false;[...day.querySelectorAll('.timeline-item')].forEach(x=>{if(x===ref){passed=true;return;}if(!passed)return;const h=text(x.querySelector('h3'));if(/新穗高\\s*→\\s*(高山|松本|安曇野)/.test(h))x.remove();});"""
if old not in s:
    raise SystemExit('return-route snippet not found')
s=s.replace(old,new,1)
needle=""" let tail=ref;[a,b,c,d].forEach(n=>{insertAfter(tail,n);tail=n;});
}"""
repl=""" let tail=ref;[a,b,c,d].forEach(n=>{insertAfter(tail,n);tail=n;});
 if(mode==='after-cave'){
   const shop=findItem(day,'高山地元超市');if(shop){const t=shop.querySelector('.time');if(t)t.textContent='17:15–17:45';}
 }
}"""
if needle not in s:
    raise SystemExit('city timing anchor not found')
s=s.replace(needle,repl,1)
needle2=""" let tail=ref;[a,b,c].forEach(n=>{insertAfter(tail,n);tail=n;});
}"""
repl2=""" let tail=ref;[a,b,c].forEach(n=>{insertAfter(tail,n);tail=n;});
 if(dayId==='d7'){
   const hotel=findItem(day,'Residence Hotel Takayama Station');if(hotel){const t=hotel.querySelector('.time');if(t)t.textContent='15:50';}
 }
 if(dayId==='d8'){
   const bonus=findItem(day,'大王山葵農場');if(bonus){const t=bonus.querySelector('.time');if(t)t.textContent='超早到先加';const p=bonus.querySelector('p');if(p)p.textContent='加咗平湯神社後，正常時間已唔追呢個Bonus；只有實際行程比預定早好多，而且仍趕到冬季關門前先考慮。';}
 }
}"""
if needle2 not in s:
    raise SystemExit('hirayu timing anchor not found')
s=s.replace(needle2,repl2,1)
p.write_text(s,encoding='utf-8')
print('patched v9 timing')
