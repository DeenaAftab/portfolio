// Results ticker data (edit names/grades here)
const line1=[["Student 016 (9700)","A*"],["Haniya Irfan (5090)","A"],["Student 017 (9700)","A"],["Alishba Faheem (0610)","A"],["Student 018 (9700)","A"],["Zoya Tariq (5090)","A"],["Student 019 (9700)","A*"],["Abeer A2 (9700)","A"],["Student 020 (9700)","A"],["Fariha Abid A2 (9700)","A"],["Jaweria (0610)","A*"]];
const line2=[["Muzna (9700)","A*"],["Student 021 (5090)","A"],["Mehak (0610)","A"],["Student 022 (9700)","A*"],["M. Adnan (9700)","A"],["Student 023 (5090)","A"],["Hunaiza (0610)","A"],["Student 024 (9700)","A"],["Wahib A2 (9700)","A"],["Student 025 (5090)","B"],["Aisha A2 (9700)","A*"],["Student 026 (0610)","A"],["Aun (9700)","A"],["Student 027 (9700)","A*"]];
function fill(el,data){
  const html=data.map(([n,g])=>`<div class="result-box">${n} <span>${g}</span></div>`).join('');
  el.innerHTML=html+html; // duplicated for a seamless -50% loop
}
document.querySelectorAll('[data-ticker]').forEach(el=>fill(el,el.dataset.ticker==='1'?line1:line2));

// Mobile menu
const btn=document.querySelector('.menu-btn'),nav=document.querySelector('.nav');
if(btn)btn.addEventListener('click',()=>{const o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o)});

// Scroll reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%2)*80+'ms';io.observe(el)});

// 85.7% count-up
const num=document.querySelector('[data-count]');
if(num){const t=parseFloat(num.dataset.count);const o=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;o.disconnect();let s=null;const f=ts=>{s=s||ts;const p=Math.min((ts-s)/1400,1);num.textContent=(t*(1-Math.pow(1-p,3))).toFixed(1)+'%';if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)},{threshold:.6});o.observe(num)}
