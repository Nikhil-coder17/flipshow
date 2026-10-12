/* ===========================================================
   MAVERICK FASHION - WEBSITE LOGIC (JavaScript)
   Loads products from the server, builds the pages (home,
   categories, product, cart, checkout) and sends orders.
   Main parts, in order:
     1. Products + categories     5. Product page
     2. Drawing shirts/photos     6. Category pages
     3. Home offer cards          7. Checkout + placing orders
     4. Cart                      8. Hero animation
   =========================================================== */

const P=await (await fetch('/api/products')).json();
const C=['All',...new Set(P.map(x=>x.c))];
const TEE='M62 22L18 52l22 30 20-12v112h80V70l20 12 22-30-44-30q-18 22-38 22T62 22z';
function art(x){if(x.img)return `<img src="${x.img}" alt="${x.n} ${x.v||''}">`;let s='<svg viewBox="0 0 200 200">';
 if(x.t==='pants'){s+=`<path d="M58 14h84l10 176h-38l-14-98-14 98H48z" fill="${x.col}"/><path d="M58 30h84" stroke="#fff" stroke-width="3" opacity=".5"/>`;
  if(x.st)s+='<path d="M70 30l-6 160M130 30l6 160" stroke="#fff" stroke-width="4" opacity=".85"/>';}
 else{s+=`<path d="${TEE}" fill="${x.col}"/>`;
  if(x.t==='shirt'){s+='<path d="M82 22l18 30 18-30M100 52v130" stroke="#8886" stroke-width="2.5" fill="none"/>';
   s+=x.pr?'<g fill="#2b4bff"><circle cx="75" cy="95" r="7"/><circle cx="122" cy="120" r="9"/><circle cx="88" cy="150" r="6"/><circle cx="125" cy="80" r="5"/></g>':'<path d="M62 100h76M62 140h76M80 70v112M120 70v112" stroke="#14161b" stroke-width="2" opacity=".25"/>';}
  else if(x.st)s+='<path d="M18 52l22 30M182 52l-22 30" stroke="#fff" stroke-width="7"/><path d="M60 70h80" stroke="#fff" stroke-width="3" opacity=".7"/>';
  else s+=`<text x="100" y="118" text-anchor="middle" font-family="Anton,Impact" font-size="${x.pr.length>1?30:60}" fill="${x.col==='#14161b'?'#2b4bff':'#fff'}">${x.pr}</text>`;}
 return s+'</svg>';}
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PR=[
{h:'Printed T-shirts at ₹379',s:'Fresh designs for teams and everyday wear',g:'#ff7a1a,#e8312a',i:3,c:'T-Shirts'},
{h:'Build to Win',s:'Bold prints on the front and back',g:'#7b2cff,#d32cb8',i:6,c:'T-Shirts'},
{h:'Rain Series',s:'Sleeveless jersey in a neon print',g:'#00a86b,#00c98d',i:0,c:'T-Shirts'},
{h:'Classic whites',s:'Clean tees with name and number',g:'#2b4bff,#4c8bff',i:13,c:'T-Shirts'},
{h:'Cotton polo T-shirts at ₹499',s:'Collar polos with a printed logo',g:'#e8312a,#ff7a1a',i:22,c:'Polo T-Shirts'},
{h:'Ganpati Special kurtas at ₹650',s:'White kurtas with a printed back',g:'#7a0f14,#c2410c',i:25,c:'Kurtas'},
{h:'Cotton Ganpati T-shirts at ₹499',s:'Black and white tees with a printed back',g:'#d97706,#f59e0b',i:28,c:'Ganpati T-Shirts'},
{h:'Cotton shirts at ₹649',s:'Printed Ganpati designs on the back',g:'#0f766e,#14b8a6',i:32,c:'Shirts'},
{h:'Combo: track pant and T-shirt at ₹720',s:'Printed T-shirt with black track pants',g:'#6d28d9,#2563eb',i:36,c:'Combo'}];
PR.forEach(x=>{if(!(P[x.i]&&P[x.i].c===x.c)){const k=P.findIndex(y=>y.c===x.c);x.i=k<0?0:k}});
$('promos').innerHTML=PR.filter(x=>P.some(y=>y.c===x.c)).map((x,k)=>`<div class="pc" data-c="${x.c}" style="background:linear-gradient(160deg,${x.g.split(',')[0]},${x.g.split(',')[1]})"><h2>${x.h}</h2><small>${x.s}</small><div class="tags">Free delivery · Easy returns</div><div class="pic">${art(P[x.i])}</div><div class="live">Live now · Big Maverick Sale</div></div>`).join('');
$('nx').onclick=()=>$('promos').scrollBy({left:320,behavior:'smooth'});
$('tiles').innerHTML=[['Bright prints',[1,4,5,8,9,12,17,18,0]],['Dark &amp; bold',[3,7,6,10,0,15]],['Cool blues',[2,4,10,11,19,20,21,24,37]],['Clean whites',[13,14,16,28,29,2]]].map(([t,ids])=>`<div class="tile"><div class="th"><h3>${t}</h3><span><button type="button" data-s="-1" aria-label="Scroll left">‹</button><button type="button" data-s="1" aria-label="Scroll right">›</button></span></div><div class="four">${ids.filter(i=>P[i]).map(i=>`<div data-p="${i}"><div class="im" style="background:${P[i].bg}">${art(P[i])}</div>${esc(P[i].v)}</div>`).join('')}</div></div>`).join('');
$('tiles').addEventListener('click',e=>{const bt=e.target.closest&&e.target.closest('[data-s]');if(!bt)return;const row=bt.closest('.tile').querySelector('.four');row.scrollBy({left:+bt.dataset.s*row.clientWidth*.8,behavior:'smooth'})});
let cat='All',q='',cart={},so=0;
function nav(){$('nav').innerHTML=C.map(c=>`<button class="${c===cat?'on':''}" data-c="${c}">${c==='All'?'All products':c}</button>`).join('')+'<button class="fest">Big Maverick Sale · Live now</button>';}
function render(){
 let l=P.map((x,i)=>({...x,i})).filter(x=>(cat==='All'||x.c===cat)&&x.n.toLowerCase().includes(q));
 if(so==1)l.sort((a,b)=>a.p-b.p);if(so==2)l.sort((a,b)=>b.p-a.p);
 $('ttl').textContent=cat==='All'?'Trending now':cat;
 $('grid').innerHTML=l.length?l.map(x=>`<div class="card"><div class="im" data-p="${x.i}" style="background:${x.bg}">${art(x)}</div><div class="info"><small>${x.c}</small><h3 data-p="${x.i}">${x.n}</h3><div class='vr'>${x.v||''}</div><div class="pr">₹${x.p}</div><button class="add" data-i="${x.i}">Add to cart</button></div></div>`).join(''):'<p class="empty">No products match. Try another search or category.</p>';}
function setCat(c,scroll){showHome();cat=c;nav();render();if(scroll)$('shop').scrollIntoView();}
document.addEventListener('click',e=>{if(pdpClick(e))return;const d=e.target.closest('[data-c]');if(d){e.preventDefault();openCat(d.dataset.c);}
 const a=e.target.closest('.add');if(a){const i=a.dataset.i;cart[i]=(cart[i]||0)+1;upd();a.textContent='Added ✓';a.classList.add('done');setTimeout(()=>{a.textContent='Add to cart';a.classList.remove('done')},1100);}
 const m=e.target.closest('[data-m]');if(m){const[i,v]=m.dataset.m.split(',');cart[i]+=+v;if(cart[i]<1)delete cart[i];upd();}});
$('q').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();openSearch($('q').value)}};
document.querySelector('.sbox button').onclick=()=>openSearch($('q').value);
$('so').onchange=e=>{so=+e.target.value;render()};
$('cb').onclick=()=>$('drawer').classList.add('open');$('cl').onclick=()=>$('drawer').classList.remove('open');
function upd(){const ks=Object.keys(cart);const nn=ks.reduce((s,k)=>s+cart[k],0);$('cn').textContent=nn;$('cn2').textContent=nn;$('cn2').classList.toggle('z',!nn);
 $('items').innerHTML=ks.length?ks.map(k=>`<div class="it"><div class="t" style="background:${P[k].bg}">${art(P[k])}</div><div>${P[k].n}<br><small>${P[k].v}</small><br><b>₹${P[k].p}</b></div><button data-m="${k},-1">−</button>${cart[k]}<button data-m="${k},1">+</button></div>`).join(''):'<p class="empty">Your cart is empty. Add a product to start.</p>';
 $('tt').textContent='₹'+ks.reduce((s,k)=>s+cart[k]*P[k].p,0);}
let cur=null,sz='M',qt=1;
const DESC={'T-Shirts':'Full-print Maverick sports T-shirt with a polo collar, made for teams and everyday wear.','Polo T-Shirts':'Cotton polo T-shirt with a collar and two-button placket, with a printed logo on the chest and back.','Kurtas':'White kurta with a mandarin collar and button placket, printed on the chest and back. Part of the Ganpati Special collection.','Combo':'Combo offer: a printed polo-collar T-shirt with black track pants that have a drawcord waist.','Ganpati T-Shirts':'Cotton round-neck printed T-shirt from the Ganpati Special collection, with a design on the front and back.','Shirts':'Cotton full-sleeve shirt with a collar and button placket, printed on the chest and back.','Track Pants':'Stretch fabric with an elastic waist, drawcord and zip pockets.','Track Tees':'Quick-dry, lightweight fabric made for workouts and everyday wear.'};
function showHome(){setTab('home');cur=null;lastCat=null;lastQ=null;cat='All';$('pdp').hidden=true;$('home').hidden=false;nav();render();window.scrollTo(0,0)}
function openP(i,push=true){cur=i;sz='M';qt=1;const x=P[i];
 $('home').hidden=true;const d=$('pdp');d.hidden=false;
 d.innerHTML=`<p class='crumb'><a href='#' data-back>‹ Back to results</a> &nbsp;/&nbsp; ${x.c}</p>
 <div class='pd'><div class='pimg' style='background:${x.bg}'>${art(x)}</div>
 <div class='pinfo'><h1>${x.n}</h1><div class='vr'>${x.v||''}</div>
 <div class='pp'>₹${x.p}</div><div class='mrp'>Inclusive of all taxes</div>
 <h4>Select size</h4><div class='szs'>${['S','M','L','XL','XXL'].map(s=>`<button class='sz ${s===sz?'on':''}' data-sz='${s}'>${s}</button>`).join('')}</div>
 <h4>Quantity</h4><div class='qty'><button data-q='-1' aria-label='Less'>−</button><b id='qv'>1</b><button data-q='1' aria-label='More'>+</button></div>
 <div class='acts'><button class='padd'>Add to cart</button><button class='buy'>Buy now</button></div>
 <ul class='perks'><li>Free delivery</li><li>7-day easy returns</li><li>Secure online payment (Razorpay)</li></ul>
 <h4>About this item</h4><p>${x.d||DESC[x.c]||''}</p></div></div>
 <div class='head'><h2>You may also like</h2></div>
 <div class='grid'>${P.map((y,k)=>({...y,k})).filter(y=>y.k!==i).slice(0,4).map(y=>`<div class='card'><div class='im' data-p='${y.k}' style='background:${y.bg}'>${art(y)}</div><div class='info'><h3 data-p='${y.k}'>${y.n}</h3><div class='vr'>${y.v||''}</div><div class='pr'>₹${y.p}</div></div></div>`).join('')}</div>`;
 window.scrollTo(0,0);
 if(push){try{history.pushState({p:i},'')}catch(e){}}}
function pdpClick(e){const t=e.target;let m;
 if(m=t.closest('[data-p]')){openP(+m.dataset.p);return true}
 if(t.closest('[data-home]')){e.preventDefault();showHome();return true}
 if(t.closest('[data-back]')){e.preventDefault();const c=lastCat;c?openCat(c,false):showHome();return true}
 if(m=t.closest('[data-sz]')){sz=m.dataset.sz;document.querySelectorAll('.sz').forEach(b=>b.classList.toggle('on',b.dataset.sz===sz));return true}
 if(m=t.closest('[data-q]')){qt=Math.max(1,qt+ +m.dataset.q);$('qv').textContent=qt;return true}
 if(m=t.closest('.padd,.buy')){if(m.classList.contains('buy')){openCheckout({[cur]:qt});}else{cart[cur]=(cart[cur]||0)+qt;upd();m.textContent='Added ✓';setTimeout(()=>m.textContent='Add to cart',1100)}return true}
 return false}
let lastCat=null,lastQ=null,csort=0,cpr=0;
const RNG=[[0,1e9,'All prices'],[0,399,'Under ₹400'],[400,1e9,'₹400 & above']];
function openCat(c,push=true){if(c==='All'){showHome();return}setTab('cats');
 lastQ=null;lastCat=c;cat=c;csort=0;cpr=0;nav();$('home').hidden=true;$('pdp').hidden=false;drawCat();window.scrollTo(0,0);
 if(push){try{history.pushState({c:c},'')}catch(e){}}}
function drawCat(){const c=lastCat,sq=lastQ;
 let l=P.map((x,i)=>({...x,i})).filter(x=>(sq!==null?(c==='All'||x.c===c)&&(x.n+' '+x.c+' '+(x.v||'')).toLowerCase().includes(sq):x.c===c)&&x.p>=RNG[cpr][0]&&x.p<=RNG[cpr][1]);
 if(csort==1)l.sort((a,b)=>a.p-b.p);if(csort==2)l.sort((a,b)=>b.p-a.p);
 const title=sq!==null?'Results for "'+esc(sq)+'"':c,crumb=sq!==null?'Search':esc(c);
 $('pdp').innerHTML=`<p class='crumb'><a href='#' data-home>‹ Home</a> &nbsp;/&nbsp; ${crumb}</p>
 <div class='head'><h2>${title}</h2><span class='cnt'>${l.length} items</span><select id='cso' aria-label='Sort'><option value='0' ${csort==0?'selected':''}>Featured</option><option value='1' ${csort==1?'selected':''}>Price: low to high</option><option value='2' ${csort==2?'selected':''}>Price: high to low</option></select></div>
 <div class='pf'><b>Price</b>${RNG.map((r,k)=>`<label class='${k===cpr?'on':''}'><input type='radio' name='pr' value='${k}' ${k===cpr?'checked':''}> ${r[2]}</label>`).join('')}</div>
 <div class='grid'>${l.length?l.map(x=>`<div class='card'><div class='im' data-p='${x.i}' style='background:${x.bg}'>${art(x)}</div><div class='info'><small>${x.c}</small><h3 data-p='${x.i}'>${x.n}</h3><div class='vr'>${x.v||''}</div><div class='pr'>₹${x.p}</div><button class='add' data-i='${x.i}'>Add to cart</button></div></div>`).join(''):`<p class='empty'>${sq!==null?'Nothing found for "'+esc(sq)+'". Try another word.':'No '+esc(c)+' in this price range. Choose another range.'}</p>`}</div>`;}
function openSearch2(t){lastQ=t;lastCat='All';cpr=0;csort=0;$('home').hidden=true;$('pdp').hidden=false;drawCat();window.scrollTo(0,0)}
function openSearch(term){term=(term||'').trim().toLowerCase();if(!term){showHome();return}
 lastQ=term;lastCat='All';cpr=0;csort=0;$('home').hidden=true;$('pdp').hidden=false;drawCat();window.scrollTo(0,0);
 try{history.pushState({q:term},'')}catch(e){}}
$('pdp').onchange=e=>{if(e.target.id==='cso'){csort=+e.target.value;drawCat()}if(e.target.name==='pr'){cpr=+e.target.value;drawCat()}};
function openCheckout(items){const ks=Object.keys(items);$('drawer').classList.remove('open');
 $('home').hidden=true;const d=$('pdp');d.hidden=false;window.scrollTo(0,0);
 if(!ks.length){d.innerHTML=`<p class='crumb'><a href='#' data-home>‹ Home</a></p><p class='empty'>Your cart is empty. Add a product to check out.</p>`;return}
 const tot=ks.reduce((s,k)=>s+items[k]*P[k].p,0);
 d.innerHTML=`<p class='crumb'><a href='#' data-home>‹ Continue shopping</a> &nbsp;/&nbsp; Checkout</p>
 <div class='cl co2'><div class='fl' style='gap:12px'><h4>Pay with</h4><div class='pmg'><label class='pmo'><input type='radio' name='pm' value='gpay' checked><i style='background:#1a73e8'>G</i><b>Google Pay</b></label><label class='pmo'><input type='radio' name='pm' value='phonepe'><i style='background:#5f259f'>P</i><b>PhonePe</b></label><label class='pmo'><input type='radio' name='pm' value='paytm'><i style='background:#00b9f1'>T</i><b>Paytm</b></label><label class='pmo'><input type='radio' name='pm' value='upi'><i style='background:#1a9b5b'>U</i><b>Other UPI app</b></label><label class='pmo wide'><input type='radio' name='pm' value='other'><i style='background:#555'>₹</i><span><b>Cards, Net banking &amp; Wallets</b><small>Debit card · Credit card · Net banking</small></span></label></div><p class='pmn'>Secure payment by Razorpay. The payment window opens after you tap Place order.</p><h4>Delivery address</h4><input id='fn' placeholder='Full name'><input id='fp' placeholder='Mobile number (10 digits)' inputmode='numeric'><input id='fe' placeholder='Gmail / email (optional)' inputmode='email' autocomplete='email'><input id='fz' placeholder='Pincode (6 digits)' inputmode='numeric'><input id='fa' placeholder='House no, street, area'><input id='fc' placeholder='City'></div>
 <div class='fl'><h4>Order summary</h4>${ks.map(k=>`<div class='it'><div class='t' style='background:${P[k].bg}'>${art(P[k])}</div><div>${P[k].n} (${P[k].v})<br>Qty ${items[k]}<br><select class='szsel' data-k='${k}'>${['S','M','L','XL','XXL'].map(z=>`<option ${z===sz?'selected':''}>${z}</option>`).join('')}</select></div><b>₹${items[k]*P[k].p}</b></div>`).join('')}<div class='row2'><span>Delivery</span><span>Free</span></div><div class='tot'><span>Total</span><span>₹${tot}</span></div><p id='er' class='err'></p><button class='co' id='po'>Place order</button></div></div>`;
 if(LOC.pin){$('fz').value=LOC.pin;if(LOC.area)$('fc').value=LOC.area}
 if(PROF.name)$('fn').value=PROF.name;if(PROF.phone)$('fp').value=PROF.phone;if(PROF.email)$('fe').value=PROF.email;
 $('po').onclick=async()=>{const v=id=>$(id).value.trim();
  if(!v('fn')||!/^\d{10}$/.test(v('fp'))||!/^\d{6}$/.test(v('fz'))||!v('fa')||!v('fc')){$('er').textContent='Fill every field. Mobile needs 10 digits and pincode needs 6 digits.';return}
  const pm='Razorpay',pick=(document.querySelector("input[name='pm']:checked")||{}).value||'upi',btn=$('po');let placed=false;
  if(v('fe')&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v('fe'))){$('er').textContent='Enter a valid email address or leave it empty.';return}
  btn.disabled=true;$('er').textContent='Placing your order...';
  try{
   const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer:{name:v('fn'),phone:v('fp'),email:v('fe'),pincode:v('fz'),address:v('fa'),city:v('fc')},payment:pm,items:ks.map(k=>({id:P[k].id,qty:items[k],size:(document.querySelector(".szsel[data-k='"+k+"']")||{}).value||''}))})});
   const o=await r.json();if(!r.ok)throw new Error(o.error||'Could not place the order');placed=true;SNAP=ks.map(k=>({n:P[k].n,q:items[k]}));
   if(o.razorpay){await new Promise((ok,no)=>{const go=()=>new Razorpay({key:o.razorpay.key,amount:o.razorpay.amount,currency:'INR',order_id:o.razorpay.orderId,name:'Maverick Fashion',prefill:{name:v('fn'),contact:v('fp'),email:v('fe')},config:{display:RZCFG(pick)},
     handler:async x=>{try{const vr=await fetch('/api/orders/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:o.orderId,...x})});if(!vr.ok)throw 0;ok()}catch(e){no(new Error('Payment done but not confirmed. Please contact us with order '+o.orderId))}},
     modal:{ondismiss:()=>no(new Error('Payment cancelled. Your order '+o.orderId+' is saved. Please contact us to pay.'))}}).open();
    if(window.Razorpay)go();else{const sc=document.createElement('script');sc.src='https://checkout.razorpay.com/v1/checkout.js';sc.onload=go;sc.onerror=()=>no(new Error('Could not load the payment window.'));document.head.appendChild(sc)}})}
   if(items===cart){for(const k in cart)delete cart[k]}upd();
   saveOrder(o.orderId,o.total,v('fn'),v('fp'),v('fe'));
   d.innerHTML=`<div class='ok'><div class='tick'>\u2713</div><h1>Order placed</h1><p>Order ID ${o.orderId}</p><p>Delivering to ${esc(v('fn'))}, ${esc(v('fc'))} \u00b7 Total \u20b9${o.total}</p><p class='cnt'>${esc(o.message||'Payment received.')}</p><p style='margin-top:20px'><button class='co' style='padding:13px 26px' data-home>Continue shopping</button></p></div>`;window.scrollTo(0,0);
  }catch(e){$('er').textContent=e.message;btn.disabled=placed}};
 try{history.pushState({k:1},'')}catch(e){}}
window.onpopstate=e=>{const s=e.state;s&&s.q?openSearch2(s.q):s&&s.p!=null?openP(s.p,false):s&&s.c?openCat(s.c,false):showHome()};
function mix(a,b,k){const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const A=h(a),B=h(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')}
function grad(st,k){const n=st.length-1,x=Math.min(k*n,n-1e-6),i=Math.floor(x);return mix(st[i],st[i+1],x-i)}
function brand(el,txt,st,base){el.innerHTML=[...txt].map((c,i)=>`<span style='color:${grad(st,i/(txt.length-1))};animation-delay:${base+i*.07}s,${base+1.3+i*.2}s'>${c}</span>`).join('')}
brand($('hh'),'MAVERICK',['#190f2e','#3d1a5c','#6b2c8e'],0);
brand($('hf'),'FASHION',['#f7931e','#e8452c'],.75);
$('mq').textContent='PRINTED T-SHIRTS   •   COTTON POLO T-SHIRTS   •   COTTON SHIRTS   •   COMBO OFFERS   •   BUILD TO WIN   •   '.repeat(8);
const FL=[[P[5%P.length],'right:5%;top:8%',40,'-6deg'],[P[8%P.length],'right:22%;bottom:5%',-30,'7deg'],[P[3%P.length],'right:1%;bottom:24%',55,'5deg'],[P[12%P.length],'right:35%;top:5%',-50,'-10deg']];
FL.forEach(([o,pos,s,r],i)=>{const d=document.createElement('div');d.className='float';d.style.cssText=pos+';animation-delay:-'+i*1.3+'s';d.dataset.s=s;d.dataset.r=r;d.style.transform='rotate('+r+')';d.innerHTML=art(o);$('hero').appendChild(d)});
$('hero').onmousemove=e=>{const b=$('hero').getBoundingClientRect(),mx=(e.clientX-b.left)/b.width-.5,my=(e.clientY-b.top)/b.height-.5;document.querySelectorAll('.float').forEach(f=>{f.style.transform='perspective(900px) translate('+mx*f.dataset.s+'px,'+my*f.dataset.s+'px) rotateY('+mx*18+'deg) rotateX('+(-my*14)+'deg) rotate('+f.dataset.r+')'})};
$('hero').onmouseleave=()=>document.querySelectorAll('.float').forEach(f=>{f.style.transform='rotate('+f.dataset.r+')'});
document.querySelector('.hcta').onclick=e=>{e.preventDefault();$('promos').scrollIntoView({behavior:'smooth',block:'center'})};
const els=document.querySelectorAll('.pc,.tile');
if('IntersectionObserver' in window){const io=new IntersectionObserver(en=>en.forEach(n=>{if(n.isIntersecting){const el=n.target;el.classList.add('in');io.unobserve(el);setTimeout(()=>{el.classList.remove('rv','in');el.style.transitionDelay=''},1100)}}),{threshold:.15});els.forEach((el,i)=>{el.classList.add('rv');el.style.transitionDelay=(i%5)*90+'ms';io.observe(el)})}
(function(){
 const cv=$('bgc'),hero=$('hero'),ctx=cv.getContext('2d');let W=0,H=0,dpr=1,t=0,raf=0,mx=.5,my=.5;
 const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const COLS=['#f58220','#fbb017','#e8452c','#8a2f8a','#c0398f'];
 const SP=Array.from({length:46},()=>({x:Math.random(),y:Math.random(),r:Math.random()*2+.6,v:Math.random()*.00025+.0001,p:Math.random()*6.28,c:COLS[(Math.random()*5)|0]}));
 function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=hero.clientWidth;H=hero.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
 hero.addEventListener('mousemove',e=>{const b=hero.getBoundingClientRect();mx=(e.clientX-b.left)/b.width;my=(e.clientY-b.top)/b.height});
 function draw(){ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
  for(let i=0;i<7;i++){
   const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,COLS[i%5]);g.addColorStop(.5,COLS[(i+2)%5]);g.addColorStop(1,COLS[(i+4)%5]);
   const base=H*(.16+i*.115)+(my-.5)*24*(i-3),amp=24+i*7;
   [[16,.1],[2.2,.5]].forEach(([lw,al])=>{ctx.beginPath();
    for(let x=0;x<=W+14;x+=14){const y=base+Math.sin(x*.004+t*.8+i*.9)*amp+Math.sin(x*.011-t*1.1+i)*amp*.4+(mx-.5)*Math.sin(x*.002+i)*40;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    ctx.strokeStyle=g;ctx.globalAlpha=al;ctx.lineWidth=lw;ctx.stroke()});
  }
  SP.forEach(p=>{p.y-=p.v*16;if(p.y<-.02){p.y=1.02;p.x=Math.random()}
   ctx.globalAlpha=.3+.4*Math.sin(t*2+p.p);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x*W+Math.sin(t+p.p)*12,p.y*H,p.r,0,6.283);ctx.fill()});
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
 function loop(){if(hero.clientWidth!==W||hero.clientHeight!==H)size();t+=.016;draw();raf=requestAnimationFrame(loop)}
 size();draw();
 addEventListener('resize',()=>{size();draw()});
 if(!reduce){if('IntersectionObserver' in window){new IntersectionObserver(en=>{if(en[0].isIntersecting){if(!raf)loop()}else{cancelAnimationFrame(raf);raf=0}}).observe(hero)}else loop()}
})();
window.openCheckout=openCheckout;window.cart=cart;
nav();render();upd();

/* ---- Phone bottom menu (Home / Categories / Account / Cart) ---- */
function setTab(t){document.querySelectorAll('.bnav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t))}
function openCats(){setTab('cats');$('home').hidden=true;const d=$('pdp');d.hidden=false;lastCat=null;lastQ=null;
 d.innerHTML=`<p class='crumb'><a href='#' data-home>‹ Home</a> &nbsp;/&nbsp; Categories</p><div class='head'><h2>Categories</h2></div><div class='catl'>${C.slice(1).map(k=>`<button data-c='${k}'>${k}<small>${P.filter(x=>x.c===k).length} items ›</small></button>`).join('')}</div>`;window.scrollTo(0,0)}
function openAcc(){setTab('acc');$('home').hidden=true;const d=$('pdp');d.hidden=false;lastCat=null;lastQ=null;
 const fd=iso=>{try{return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}catch(e){return''}};
 const lt=LOC.pin?esc((LOC.area?LOC.area+' - ':'')+LOC.pin):'Not set yet';
 d.innerHTML=`<p class='crumb'><a href='#' data-home>‹ Home</a> &nbsp;/&nbsp; Account</p><div class='accw'>
 <div class='acc'><h2>${PROF.name?'Hello, '+esc(PROF.name):'My Account'}</h2><p>${PROF.name?'Your details are saved on this phone.':'Save your name and mobile number so checkout is quicker.'}</p>
  <input id='an' placeholder='Your name' maxlength='60' value="${esc(PROF.name)}"><input id='ap' placeholder='Mobile number (10 digits)' inputmode='numeric' maxlength='10' value="${esc(PROF.phone)}"><input id='ae' placeholder='Gmail / email (optional)' inputmode='email' maxlength='80' value="${esc(PROF.email)}"><p class='err' id='aer'></p><button class='accb' data-acc='save'>Save details</button>${PROF.name&&PROF.phone?"<div class='saved'><span>✓ Details saved</span><button class='accb g' data-acc='buy'>Buy now</button></div>":''}</div>
 <div class='acc'><div class='arow'><div><h4>Delivery location</h4>${lt}</div><button class='accb o' data-acc='loc'>${LOC.pin?'Change':'Set'}</button></div></div>
 <div class='acc'><h4>My orders</h4>${ORD.length?ORD.map(o=>`<div class='ord'><div class='arow'><b>${esc(o.id)}</b><b>₹${+o.total||0}</b></div><small>${fd(o.date)} · ${esc((o.items||[]).map(i=>i.n+' ×'+i.q).join(', '))}</small><div class='arow'><span class='st' id='st-${esc(o.id)}'></span><button class='accb o' data-acc='status' data-id='${esc(o.id)}' data-ph='${esc(o.phone)}'>Check status</button></div></div>`).join(''):'<p>No orders yet. Orders you place from this phone will appear here.</p>'}</div>
 <div><button class='accb r' data-acc='clear'>Clear my saved data on this phone</button></div></div>`;window.scrollTo(0,0)}
async function accClick(e){const t=e.target.closest&&e.target.closest('[data-acc]');if(!t)return;const k=t.dataset.acc;
 if(k==='save'){const n=$('an').value.trim().replace(/[<>]/g,''),ph=$('ap').value.trim();
  if(!n){$('aer').textContent='Enter your name.';return}if(!/^\d{10}$/.test(ph)){$('aer').textContent='Mobile number needs 10 digits.';return}
  const em=$('ae').value.trim().replace(/[<>]/g,'');if(em&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(em)){$('aer').textContent='Enter a valid email address or leave it empty.';return}
  PROF={name:n,phone:ph,email:em};try{localStorage.setItem('mf_prof',JSON.stringify(PROF))}catch(x){}showProf();openAcc()}
 else if(k==='loc'){$('loc').click()}
 else if(k==='buy'){if(Object.keys(cart).length)openCheckout(cart);else{showHome();setTimeout(()=>$('shop').scrollIntoView(),60)}}
 else if(k==='status'){const el=$('st-'+t.dataset.id);el.textContent='Checking...';
  try{const r=await fetch('/api/orders/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:t.dataset.id,phone:t.dataset.ph})});const j=await r.json();
   el.textContent=r.ok&&j.status?'Status: '+j.status+(j.paid?' · Paid':' · Payment pending'):(r.status===404?'Order not found.':'Status is not available right now.')}
  catch(x){el.textContent='Could not check right now.'}}
 else if(k==='clear'){if(t.dataset.sure!=='1'){t.dataset.sure='1';t.textContent='Tap again to confirm';return}
  PROF={name:'',phone:'',email:''};ORD=[];LOC={pin:'',area:'',lat:null,lng:null};try{localStorage.removeItem('mf_prof');localStorage.removeItem('mf_orders');localStorage.removeItem('mf_loc')}catch(x){}showProf();showLoc();openAcc()}}
$('pdp').addEventListener('click',accClick);
function saveOrder(id,total,name,phone,email){PROF={name:name||PROF.name,phone:phone||PROF.phone,email:email||PROF.email||''};ORD.unshift({id,date:new Date().toISOString(),total,items:SNAP,phone});ORD=ORD.slice(0,30);
 try{localStorage.setItem('mf_prof',JSON.stringify(PROF));localStorage.setItem('mf_orders',JSON.stringify(ORD))}catch(x){}showProf()}
function showProf(){$('hlN').textContent=PROF.name?PROF.name.split(' ')[0]:'sign in'}
let PROF={name:'',phone:'',email:''},ORD=[],SNAP=[];
try{const t=JSON.parse(localStorage.getItem('mf_prof')||'null');if(t&&typeof t.name==='string')PROF={name:t.name,phone:String(t.phone||''),email:String(t.email||'')};const o=JSON.parse(localStorage.getItem('mf_orders')||'[]');if(Array.isArray(o))ORD=o}catch(e){}
showProf();document.querySelector('.hl').onclick=openAcc;
document.querySelector('.bnav').onclick=e=>{const b=e.target.closest('button');if(!b)return;const t=b.dataset.t;
 if(t==='home')showHome();else if(t==='cats')openCats();else if(t==='acc')openAcc();else if(t==='cart')$('cb').click()};

/* ---- Delivery location (saved in this phone's browser) ---- */
let LOC={pin:'',area:'',lat:null,lng:null};
try{const t=JSON.parse(localStorage.getItem('mf_loc')||'null');if(t&&/^\d{6}$/.test(t.pin))LOC=t}catch(e){}
function showLoc(){$('locT').textContent=LOC.pin?((LOC.area?LOC.area+' - ':'')+LOC.pin):'Update location'}
showLoc();
let GPS={lat:LOC.lat||null,lng:LOC.lng||null};
function showMap(q){if(window.__PREVIEW){$('mapph').textContent='Map shows on your real website (this demo page blocks it).';return}$('map').src='https://www.google.com/maps?q='+encodeURIComponent(q)+'&z=16&output=embed';$('mapbox').classList.add('on')}
$('loc').onclick=()=>{$('lp').value=LOC.pin;$('la').value=LOC.area;$('le').textContent='';$('lst').textContent='';GPS={lat:LOC.lat||null,lng:LOC.lng||null};
 $('locm').hidden=false;if(GPS.lat!=null)showMap(GPS.lat+','+GPS.lng);else if(LOC.pin)showMap(LOC.pin+', India')};
$('lp').oninput=()=>{const v=$('lp').value.trim();if(/^\d{6}$/.test(v)){GPS={lat:null,lng:null};showMap(v+', India')}};

$('lx').onclick=()=>{$('locm').hidden=true};
$('locm').onclick=e=>{if(e.target===$('locm'))$('locm').hidden=true};
$('ls').onclick=()=>{const pin=$('lp').value.trim(),area=$('la').value.trim().replace(/[<>]/g,'');
 if(!/^\d{6}$/.test(pin)){$('le').textContent='Enter a valid 6 digit pincode.';return}
 LOC={pin,area};if(GPS.lat!=null){LOC.lat=GPS.lat;LOC.lng=GPS.lng}try{localStorage.setItem('mf_loc',JSON.stringify(LOC))}catch(e){}
 showLoc();$('locm').hidden=true};

/* ---- Map picker: drag the map, pin stays in the middle (OpenStreetMap tiles, no key) ---- */
const TILE=(z,x,y)=>'https://tile.openstreetmap.org/'+z+'/'+x+'/'+y+'.png';
const M={lat:20.59,lng:78.96,z:5,tiles:new Map(),tok:0,addr:null,t:null};
const wpx=(lat,lng,z)=>{const s=256*2**z,r=lat*Math.PI/180;return[(lng+180)/360*s,(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*s]};
const unp=(x,y,z)=>{const s=256*2**z;return[Math.atan(Math.sinh(Math.PI*(1-2*y/s)))*180/Math.PI,x/s*360-180]};
const clampLat=v=>Math.max(-84,Math.min(84,v));
function mapDraw(){const el=$('mpmap'),w=el.clientWidth||360,h=el.clientHeight||400,z=M.z,n=2**z,[cx,cy]=wpx(M.lat,M.lng,z),x0=cx-w/2,y0=cy-h/2,need=new Set();
 for(let tx=Math.floor(x0/256);tx<=Math.floor((x0+w)/256);tx++)for(let ty=Math.floor(y0/256);ty<=Math.floor((y0+h)/256);ty++){
  if(ty<0||ty>=n)continue;const k=z+'/'+tx+'/'+ty;need.add(k);let im=M.tiles.get(k);
  if(!im){im=document.createElement('img');im.alt='';im.onload=()=>{M.ok=true;$('mpnote').hidden=true};im.onerror=()=>{im.style.visibility='hidden';if(!M.ok)$('mpnote').hidden=false};im.src=TILE(z,((tx%n)+n)%n,ty);$('mptiles').appendChild(im);M.tiles.set(k,im)}
  im.style.left=Math.round(tx*256-x0)+'px';im.style.top=Math.round(ty*256-y0)+'px'}
 M.tiles.forEach((im,k)=>{if(!need.has(k)){im.remove();M.tiles.delete(k)}})}
function mapDone(){clearTimeout(M.t);$('mpaddr').textContent='Finding address...';$('mpok').disabled=true;const tok=++M.tok,lat=M.lat,lng=M.lng,pos=()=>({lat:+lat.toFixed(6),lng:+lng.toFixed(6)});
 M.t=setTimeout(async()=>{try{
  const r=await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat='+lat.toFixed(6)+'&lon='+lng.toFixed(6));const j=await r.json();if(tok!==M.tok)return;
  const a=j.address||{},pin=String(a.postcode||'').replace(/\s/g,''),area=(a.suburb||a.neighbourhood||a.city_district||a.town||a.city||a.village||a.county||'').slice(0,40);
  M.addr={...pos(),pin:/^\d{6}$/.test(pin)?pin:'',area};$('mpaddr').textContent=(j.display_name||area||'Selected location').slice(0,160)}
 catch(e){if(tok!==M.tok)return;M.addr={...pos(),pin:'',area:''};$('mpaddr').textContent='Pin placed here. Address could not be loaded.'}
 $('mpok').disabled=false},600)}
function setView(lat,lng,z){M.lat=clampLat(lat);M.lng=((lng+540)%360)-180;M.z=z;mapDraw();mapDone()}
function zoomBy(d){const z=Math.max(3,Math.min(19,M.z+d));if(z!==M.z){M.z=z;mapDraw();mapDone()}}
const ptr=new Map();let pinch0=0;const pdist=()=>{const a=[...ptr.values()];return a.length>1?Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]):0};
$('mpmap').onpointerdown=e=>{if(e.target.closest&&e.target.closest('button'))return;try{$('mpmap').setPointerCapture(e.pointerId)}catch(x){}ptr.set(e.pointerId,[e.clientX,e.clientY]);pinch0=pdist()};
$('mpmap').onpointermove=e=>{if(!ptr.has(e.pointerId))return;const o=ptr.get(e.pointerId);ptr.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptr.size===1){const[cx,cy]=wpx(M.lat,M.lng,M.z),[la,ln]=unp(cx-(e.clientX-o[0]),cy-(e.clientY-o[1]),M.z);M.lat=clampLat(la);M.lng=ln;mapDraw()}
 else{const d=pdist();if(pinch0&&d/pinch0>1.6){zoomBy(1);pinch0=d}else if(pinch0&&d/pinch0<.62){zoomBy(-1);pinch0=d}}};
const pend=e=>{if(ptr.delete(e.pointerId)){pinch0=0;mapDone()}};$('mpmap').onpointerup=pend;$('mpmap').onpointercancel=pend;
let wt=0;$('mpmap').onwheel=e=>{e.preventDefault();if(Date.now()-wt>250){wt=Date.now();zoomBy(e.deltaY<0?1:-1)}};
$('mpmap').ondblclick=()=>zoomBy(1);$('mpzi').onclick=()=>zoomBy(1);$('mpzo').onclick=()=>zoomBy(-1);
function mapGps(){const m=$('mpmsg');if(!navigator.geolocation){m.textContent='This browser cannot share location. Move the map to your place.';return}
 m.textContent='Getting your location...';
 navigator.geolocation.getCurrentPosition(p=>{setView(p.coords.latitude,p.coords.longitude,17);m.textContent='Move the map to fine-tune the pin.'},
  e=>{m.textContent=e&&e.code===1?'Location is blocked. Allow it in your browser or phone settings, or move the map to your place.':'Could not get your location. Move the map to your place.'},{enableHighAccuracy:true,timeout:15000,maximumAge:0})}
$('mpgps').onclick=mapGps;$('mpx').onclick=()=>{$('mp').hidden=true};
$('lg').onclick=()=>{$('mp').hidden=false;M.addr=null;if(LOC.lat!=null){setView(LOC.lat,LOC.lng,17);$('mpmsg').textContent='Move the map to change the pin.'}else{setView(20.59,78.96,5);mapGps()}};
$('mpok').onclick=()=>{const a=M.addr;if(!a)return;GPS={lat:a.lat,lng:a.lng};$('mp').hidden=true;$('lp').value=a.pin;$('la').value=a.area;
 if(a.pin){LOC={pin:a.pin,area:a.area,lat:a.lat,lng:a.lng};try{localStorage.setItem('mf_loc',JSON.stringify(LOC))}catch(e){}showLoc();$('locm').hidden=true}
 else{showMap(a.lat+','+a.lng);$('le').textContent='';$('lst').textContent='Pin saved. Type your pincode and tap Save.';$('lp').focus()}};

$('mpt').onclick=()=>{$('mp').hidden=true;$('lst').textContent='Type your pincode and tap Save.';$('lp').focus()};

/* Which payment methods the Razorpay window shows first */
function RZCFG(pick){const U={gpay:['Google Pay','google_pay'],phonepe:['PhonePe','phonepe'],paytm:['Paytm','paytm']};
 const b=pick==='other'?{name:'Cards, Net banking & Wallets',instruments:[{method:'card'},{method:'netbanking'},{method:'wallet'}]}
  :U[pick]?{name:'Pay with '+U[pick][0],instruments:[{method:'upi',apps:[U[pick][1]]}]}:{name:'Pay via UPI',instruments:[{method:'upi'}]};
 return{blocks:{first:b},sequence:['block.first'],preferences:{show_default_blocks:true}}}
