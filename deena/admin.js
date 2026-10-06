/* Admin editor. Edits data/content.json; "Publish" commits it to GitHub via API (needs a token). */
const FILE='data/content.json';
let S=null,sha=null,tab='setup',dirty=false;
const $=s=>document.querySelector(s),el=(h)=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild};
const cfg=()=>JSON.parse(localStorage.getItem('deena_cfg')||'{}');
const guess=()=>{const h=location.hostname,p=location.pathname.split('/').filter(Boolean);
  return h.endsWith('.github.io')?{owner:h.split('.')[0],repo:p[0]&&p[0]!=='deena'?p[0]:h,branch:'main'}:{owner:'',repo:'',branch:'main'}};
function say(msg,type='info'){const s=$('#status');s.className=type;s.textContent=msg;if(type==='ok')setTimeout(()=>{s.className=''},5000)}
const b64=s=>{const b=new TextEncoder().encode(s);let r='';b.forEach(x=>r+=String.fromCharCode(x));return btoa(r)};
const unb64=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g,'')),c=>c.charCodeAt(0)));
const api=(c,path,opt={})=>fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/contents/${path}`+(opt.method==='PUT'?'':`?ref=${c.branch}`),{...opt,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'Content-Type':'application/json'}});

async function load(){
  const c=cfg();
  if(c.token&&c.owner&&c.repo){
    try{const r=await api(c,FILE);if(r.ok){const j=await r.json();sha=j.sha;S=JSON.parse(unb64(j.content));say('Loaded latest saved version from GitHub.','ok');return}
      say('GitHub load failed ('+r.status+'). Check Setup. Showing the version on the site.','err')}catch(e){say('Could not reach GitHub. Showing the version on the site.','err')}
  }
  S=await (await fetch('../'+FILE+'?v='+Date.now())).json();
}
async function publish(){
  const c=cfg();
  if(!c.token){tab='setup';render();say('Add your GitHub details in Setup first (or use Download backup).','err');return}
  say('Publishing…');
  try{
    let r=await api(c,FILE);if(r.ok)sha=(await r.json()).sha;
    r=await api(c,FILE,{method:'PUT',body:JSON.stringify({message:'Update site content (admin panel)',content:b64(JSON.stringify(S,null,2)),sha,branch:c.branch})});
    const j=await r.json();
    if(!r.ok){say('Publish failed: '+(j.message||r.status)+(r.status===404?' (check owner/repo/token permissions)':''),'err');return}
    sha=j.content.sha;dirty=false;say('Published! The live site updates in about 1 minute.','ok');
  }catch(e){say('Publish failed: '+e.message,'err')}
}
const touch=()=>{dirty=true};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});

/* ---- field helpers ---- */
function F(label,obj,key,{area,hint,ph,rows}={}){
  const w=el(`<div><label>${label}</label>${area?`<textarea rows="${rows||4}"></textarea>`:'<input type="text">'}${hint?`<div class="hint">${hint}</div>`:''}</div>`);
  const i=w.querySelector('input,textarea');i.value=obj[key]||'';if(ph)i.placeholder=ph;
  i.addEventListener('input',()=>{obj[key]=i.value;touch()});return w;
}
function LIST(arr,title,blank,fields,rerender){
  const box=document.createElement('div');
  arr.forEach((it,n)=>{
    const c=el(`<div class="card"><div class="card-head"><strong>${title} ${n+1}</strong><div class="btns"><button class="sm" data-a="up">↑</button><button class="sm" data-a="dn">↓</button><button class="sm danger" data-a="rm">Remove</button></div></div></div>`);
    fields(it).forEach(f=>c.appendChild(f));
    c.querySelector('.btns').addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;
      if(a==='rm'){if(!confirm('Remove this item?'))return;arr.splice(n,1)}
      if(a==='up'&&n>0)[arr[n-1],arr[n]]=[arr[n],arr[n-1]];
      if(a==='dn'&&n<arr.length-1)[arr[n+1],arr[n]]=[arr[n],arr[n+1]];
      touch();rerender()});
    box.appendChild(c)});
  const add=el(`<button>+ Add ${title.toLowerCase()}</button>`);add.onclick=()=>{arr.push(JSON.parse(JSON.stringify(blank)));touch();rerender()};
  box.appendChild(add);return box;
}
const tip='Tip: **text** makes bold, *text* makes bold-italic.';

/* ---- tabs ---- */
const TABS={
setup(p){
  const c={...guess(),...cfg()};
  p.appendChild(el(`<div><h2>Setup</h2><p class="hint">One-time setup so “Publish changes” can save to GitHub. Details are stored only in this browser.</p></div>`));
  const box=el(`<div class="setup"><div class="row"><div><label>GitHub username / owner</label><input id="g-owner"></div><div><label>Repository name</label><input id="g-repo"></div></div><div class="row"><div><label>Branch</label><input id="g-branch"></div><div><label>Personal access token</label><input id="g-token" type="password" autocomplete="off"></div></div><div class="hint" style="margin-top:10px">Create a <b>fine-grained token</b> at GitHub → Settings → Developer settings → Personal access tokens, limited to this one repository with <b>Contents: Read and write</b>. Never share the token.</div><div class="btns" style="margin-top:10px"><button class="primary" id="g-save">Save &amp; load latest</button><button id="g-clear" class="danger">Forget token</button></div></div>`);
  p.appendChild(box);
  ['owner','repo','branch','token'].forEach(k=>box.querySelector('#g-'+k).value=c[k]||'');
  box.querySelector('#g-save').onclick=async()=>{localStorage.setItem('deena_cfg',JSON.stringify(Object.fromEntries(['owner','repo','branch','token'].map(k=>[k,box.querySelector('#g-'+k).value.trim()]))));await load();render()};
  box.querySelector('#g-clear').onclick=()=>{localStorage.removeItem('deena_cfg');say('Token removed from this browser.','ok')};
  p.appendChild(el(`<div><h3>Backup</h3><div class="btns"><button id="dl">Download backup (.json)</button><button id="im">Import backup</button></div><input type="file" id="fi" accept=".json" hidden></div>`));
  p.querySelector('#dl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='content.json';a.click()};
  p.querySelector('#im').onclick=()=>p.querySelector('#fi').click();
  p.querySelector('#fi').onchange=async e=>{try{S=JSON.parse(await e.target.files[0].text());touch();say('Imported. Press Publish to save.','ok');render()}catch{say('Not a valid backup file.','err')}};
},
home(p){
  const h=S.home;
  p.appendChild(el('<div><h2>Home page</h2><p class="hint">Button links and results shown on the home page. Leave a link empty and the button stays inactive.</p></div>'));
  p.appendChild(el('<h3>Button links</h3>'));
  [['instagram','Instagram'],['community','Community'],['contact','Contact Us'],['register','Register']].forEach(([k,l])=>p.appendChild(F(l+' link',h.links,k,{ph:'https://…'})));
  p.appendChild(el('<h3>Results</h3>'));
  p.appendChild(F('Big percentage (number only)',h,'percent',{hint:'Example: 85.7'}));
  p.appendChild(F('Note under the percentage',h,'note'));
  [['ticker1','Scrolling line 1'],['ticker2','Scrolling line 2']].forEach(([k,l])=>{
    const w=F(l+' — one student per line',{[k]:h[k].join('\n')},k,{area:true,rows:8,hint:'Format: Name (code) | Grade   e.g. Zoya Tariq (5090) | A'});
    w.querySelector('textarea').addEventListener('input',e=>{h[k]=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean)});p.appendChild(w)});
},
courses(p){
  const k=S.courses,re=()=>render();
  p.appendChild(el('<div><h2>Courses page</h2><p class="hint">'+tip+'</p></div>'));
  p.appendChild(F('Page title',k,'title'));p.appendChild(F('Intro text (dark banner)',k,'intro',{area:true}));
  p.appendChild(F('Call-to-action text',k,'cta_text',{area:true}));
  p.appendChild(el('<div class="row" id="cta"></div>'));
  const r=p.querySelector('#cta');r.appendChild(F('CTA button label',k,'cta_label'));r.appendChild(F('CTA button link',k,'cta_link',{ph:'resources.html'}));
  p.appendChild(el('<h3>Course cards</h3>'));
  p.appendChild(LIST(k.items,'Course',{title:'New Course',desc:''},it=>[F('Title',it,'title'),F('Description',it,'desc',{area:true})],re));
  p.appendChild(el('<h3>Bottom buttons</h3>'));
  p.appendChild(F('Enroll link',k,'enroll_link',{ph:'https://…'}));p.appendChild(F('Text Us link',k,'text_link',{ph:'https://wa.me/92…'}));
},
resources(p){
  const k=S.resources,re=()=>render();
  p.appendChild(el('<div><h2>Resources page</h2><p class="hint">'+tip+' Add as many cards and sections as you like — the page layout adjusts automatically.</p></div>'));
  p.appendChild(F('Page title',k,'title'));p.appendChild(F('Intro text',k,'intro',{area:true}));
  p.appendChild(el('<h3>Top icon cards (Community / Batch Check / Level Up)</h3>'));
  p.appendChild(LIST(k.features,'Card',{icon:'document',title:'New card',desc:'',label:'Open',link:''},it=>{
    const s=el(`<div><label>Icon</label><select>${Object.keys(window.__ICONS||{community:1,graduate:1,document:1,book:1,star:1,link:1}).map(i=>`<option ${it.icon===i?'selected':''}>${i}</option>`).join('')}</select></div>`);
    s.querySelector('select').onchange=e=>{it.icon=e.target.value;touch()};
    return [s,F('Title',it,'title'),F('Description',it,'desc',{area:true,rows:3}),F('Button label',it,'label'),F('Button link',it,'link',{ph:'https://…'})]},re));
  p.appendChild(el('<h3>Resource sections (grey bands like “Start Your Practice.”)</h3>'));
  p.appendChild(LIST(k.sections,'Section',{title:'New Section',items:[]},sec=>{
    const g=el('<div class="group"></div>');g.appendChild(F('Section heading',sec,'title'));
    g.appendChild(LIST(sec.items,'Resource',{title:'New resource',desc:'',label:'Open',link:''},it=>[F('Title',it,'title'),F('Description',it,'desc',{area:true,rows:3}),F('Button label',it,'label'),F('Link (Drive / PDF / website)',it,'link',{ph:'https://drive.google.com/…'})],re));
    return [g]},re));
},
contact(p){
  p.appendChild(el('<div><h2>Contact details</h2><p class="hint">Shown in the footer of every page.</p></div>'));
  ['name','email','phone'].forEach(k=>p.appendChild(F(k[0].toUpperCase()+k.slice(1),S.settings,k)));
}};
const NAMES={home:'Home',courses:'Courses',resources:'Resources',contact:'Contact',setup:'Setup & Backup'};
function render(){
  const t=$('#tabs');t.innerHTML='';
  Object.keys(NAMES).forEach(k=>{const b=document.createElement('button');b.textContent=NAMES[k];if(k===tab)b.className='on';b.onclick=()=>{tab=k;render()};t.appendChild(b)});
  const p=$('#panel');p.innerHTML='';TABS[tab](p);
}
$('#btn-publish').onclick=publish;
(async()=>{
  try{await load()}catch(e){document.body.innerHTML='<p style="padding:30px">Could not load content.json. Open this page from your GitHub Pages site.</p>';return}
  if(!cfg().token)tab='setup';else tab='courses';
  render();
})();
