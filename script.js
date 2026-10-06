/* Biology With Deena Aftab — renders pages from data/content.json (edited via /deena) */
(async function(){
const ROOT=(document.currentScript&&document.currentScript.dataset.root)||'';
const page=document.body.dataset.page;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// tiny markup for admin text: **bold**, *italic*, new line
const rich=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em><strong>$1</strong></em>').replace(/\n/g,'<br>');
const link=u=>{u=(u||'').trim();if(!u)return 'href="#" class="NOLINK" aria-disabled="true"';
  const ext=/^(https?:)?\/\//.test(u)||/^(mailto|tel):/.test(u);
  return `href="${esc(u)}"${/^https?:/.test(u)?' target="_blank" rel="noopener"':''}`};
const btn=(cls,u,label)=>{const l=link(u);return `<a ${l.includes('NOLINK')?l.replace('class="NOLINK"',`class="${cls} nolink"`):`class="${cls}" ${l}`}>${esc(label)}</a>`};
const ICONS={
 community:'<svg viewBox="0 0 120 120" fill="currentColor"><circle cx="60" cy="24" r="17"/><circle cx="24" cy="46" r="15"/><circle cx="96" cy="46" r="15"/><path d="M40 108V58c0-8 9-12 20-12s20 4 20 12v50z"/><path d="M4 108V72c0-9 8-14 18-14 5 0 9 1 12 3L14 82v26zM116 108V72c0-9-8-14-18-14-5 0-9 1-12 3l20 21v26z"/></svg>',
 graduate:'<svg viewBox="0 0 120 120" fill="currentColor"><path d="M60 6 14 24l46 17 38-14v22h6V27z"/><path d="M34 46v18c0 8 11 14 26 14s26-6 26-14V46L60 56z"/><path d="M24 114c0-20 15-30 36-30s36 10 36 30z"/><path fill="#fff" d="M42 64v22c0 8 8 12 18 12s18-4 18-12V64h-6v22c0 4-5 6-12 6s-12-2-12-6V64z"/></svg>',
 document:'<svg viewBox="0 0 120 120" fill="currentColor"><path d="M26 10h56v6H32v88h-6z"/><path d="M12 18 22 14v94l-10 4z"/><path d="M38 14h44l24 24v72H38z"/><path fill="#fff" d="M46 42h30v5H46zm0 14h46v5H46zm0 14h46v5H46zm0 14h46v5H46z"/></svg>',
 book:'<svg viewBox="0 0 120 120" fill="currentColor"><path d="M10 20c20-6 38-4 50 6v78c-12-10-30-12-50-6zM110 20c-20-6-38-4-50 6v78c12-10 30-12 50-6z"/></svg>',
 star:'<svg viewBox="0 0 120 120" fill="currentColor"><path d="m60 8 15 34 37 4-28 25 8 37-32-19-32 19 8-37L8 46l37-4z"/></svg>',
 link:'<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"><path d="M52 68a20 20 0 0 0 28 0l22-22a20 20 0 0 0-28-28l-6 6M68 52a20 20 0 0 0-28 0L18 74a20 20 0 0 0 28 28l6-6"/></svg>'};
window.__ICONS=ICONS;

let C=null;
try{const r=await fetch(ROOT+'data/content.json?v='+Date.now());C=await r.json()}catch(e){console.warn('content.json not loaded',e)}

/* ---- footer (all pages) ---- */
const ft=document.getElementById('footer');
if(C&&ft){const s=C.settings||{};ft.innerHTML=`${esc(s.name)} &nbsp; <a href="mailto:${esc(s.email)}">${esc(s.email)}</a> &nbsp; <a href="tel:${esc(s.phone)}">${esc(s.phone)}</a>`}

/* ---- pages ---- */
const app=document.getElementById('app');
if(page==='courses'&&C&&app){
  const k=C.courses;
  app.innerHTML=`
  <section class="page-hero left"><div class="wrap"><h1>${esc(k.title)}</h1><p>${rich(k.intro)}</p></div></section>
  <section class="cta-row"><div class="wrap cta-inner reveal"><p>${rich(k.cta_text)}</p>${btn('btn-dark',k.cta_link,k.cta_label)}</div></section>
  <section><div class="wrap"><div class="course-grid">${(k.items||[]).map(i=>`<article class="course reveal"><h2>${esc(i.title)}</h2><p>${rich(i.desc)}</p></article>`).join('')}</div></div></section>
  <section class="action-row ${k.enroll_link||k.text_link?'':'empty'}"><div class="wrap reveal">${btn('btn-dark',k.enroll_link,'Enroll')}${btn('btn-dark',k.text_link,'Text Us')}</div></section>
  <div class="page-end"></div>`;
}
if(page==='resources'&&C&&app){
  const k=C.resources;
  app.innerHTML=`
  <section class="page-hero left"><div class="wrap"><h1>${esc(k.title)}</h1><p>${rich(k.intro)}</p></div></section>
  <section><div class="feat-grid">${(k.features||[]).map(f=>`<div class="feat reveal">${ICONS[f.icon]||ICONS.document}<h2>${esc(f.title)}</h2><p>${rich(f.desc)}</p>${btn('btn-dark',f.link,f.label)}</div>`).join('')}</div></section>
  ${(k.sections||[]).map(s=>`<section class="rsec"><div class="rsec-title"><div class="wrap reveal"><h2>${esc(s.title)}</h2></div></div><div class="wrap"><div class="rsec-grid">${(s.items||[]).map(i=>`<article class="rcard reveal"><h3>${esc(i.title)}</h3><p>${rich(i.desc)}</p>${btn('btn-dark',i.link,i.label||'Open')}</article>`).join('')}</div></div></section>`).join('')}
  <div class="page-end"></div>`;
}
if(page==='home'&&C){
  const h=C.home||{};
  const set=(id,u)=>{const a=document.getElementById(id);if(!a)return;u=(u||'').trim();if(u){a.href=u;if(/^https?:/.test(u)){a.target='_blank';a.rel='noopener'}}else a.classList.add('nolink')};
  set('link-instagram',h.links&&h.links.instagram);set('link-community',h.links&&h.links.community);
  set('link-contact',h.links&&h.links.contact);set('link-register',h.links&&h.links.register);
  const n=document.querySelector('[data-count]');if(n&&h.percent){n.dataset.count=h.percent;n.textContent=h.percent+'%'}
  const note=document.querySelector('.results .note em');if(note&&h.note)note.textContent=h.note;
  const mk=a=>(a||[]).map(l=>{const [name,g]=l.split('|').map(x=>x.trim());return `<div class="result-box">${esc(name)} <span>${esc(g||'')}</span></div>`}).join('');
  document.querySelectorAll('[data-ticker]').forEach(el=>{const t=mk(h['ticker'+el.dataset.ticker]);el.innerHTML=t+t});
}

/* ---- shared behaviour ---- */
document.addEventListener('click',e=>{const a=e.target.closest('a.nolink');if(a)e.preventDefault()});
const btnM=document.querySelector('.menu-btn'),nav=document.querySelector('.nav');
if(btnM)btnM.addEventListener('click',()=>{const o=nav.classList.toggle('open');btnM.setAttribute('aria-expanded',o)});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%3)*70+'ms';io.observe(el)});
const num=document.querySelector('[data-count]');
if(num){const t=parseFloat(num.dataset.count);const o=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;o.disconnect();let s=null;const f=ts=>{s=s||ts;const p=Math.min((ts-s)/1400,1);num.textContent=(t*(1-Math.pow(1-p,3))).toFixed(1)+'%';if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)},{threshold:.6});o.observe(num)}
})();
