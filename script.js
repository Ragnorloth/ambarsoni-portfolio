const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const slug = v => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function mediaMarkup(item){
  const type = item.media_type || 'image';
  if(type === 'video' && item.video){
    return `<div class="video"><video src="${esc(item.video)}" poster="${esc(item.image || '')}" controls playsinline preload="metadata"></video></div>`;
  }
  if(type === 'embed' && item.video_url){
    return `<div class="video"><iframe src="${esc(item.video_url)}" title="${esc(item.title)}" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`;
  }
  if(item.image){
    return `<div class="asset-media"><img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"></div>`;
  }
  return `<div class="asset-media asset-empty"><span>MEDIA</span></div>`;
}

function renderSection(section, index){
  const theme = ['dark','light','dark-alt'].includes(section.theme) ? section.theme : 'dark';
  const items = (section.items || []).filter(x => x.visible !== false);
  const headingParts = String(section.heading || '').split(/\s+/);
  const heading = headingParts.length > 2 ? `${headingParts.slice(0,-1).join(' ')}<br><em>${headingParts.at(-1)}</em>` : esc(section.heading || 'Untitled section');
  const process = section.process ? `<div class="process-line"><span>REFERENCE</span><b>→</b><span>MODEL</span><b>→</b><span>LIGHT</span><b>→</b><span>RENDER</span><b>→</b><span>COMPOSITE</span></div>` : '';
  const cards = items.map((item,i)=>{
    const cls = item.featured ? 'film film-feature' : 'film';
    const isFilm = item.media_type === 'video' || item.media_type === 'embed';
    if(isFilm){
      return `<article class="${cls}">${mediaMarkup(item)}<div class="film-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(item.category || '')}</span><h3>${esc(item.title)}</h3>${item.description?`<p>${esc(item.description)}</p>`:''}</div></article>`;
    }
    return `<figure class="asset" data-cat="${esc(section.anchor || slug(item.category || section.nav_label || 'work'))}">${mediaMarkup(item)}<figcaption><span>${String(i+1).padStart(2,'0')}</span><b>${esc(item.category || section.nav_label || 'Visual Work')}</b><strong>${esc(item.title)}</strong></figcaption></figure>`;
  }).join('');
  const gridClass = items.some(x=>x.media_type==='video'||x.media_type==='embed') ? 'film-grid' : 'masonry';
  return `<section id="${esc(section.anchor || `section-${index+1}`)}" class="section managed-section ${theme}"><div class="section-head"><div><span class="eyebrow">${esc(section.eyebrow || `${String(index+1).padStart(2,'0')} / SECTION`)}</span><h2>${heading}</h2></div></div>${section.description?`<p class="managed-description">${esc(section.description)}</p>`:''}${process}<div class="${gridClass}">${cards}</div></section>`;
}

function renderArchive(sections){
  const all=[];
  sections.forEach(s => (s.items||[]).filter(x=>x.visible!==false).forEach(x=>{ if(x.media_type==='image' && x.image) all.push({item:x, section:s}); }));
  const grid = $('#archiveGrid'); if(!grid) return;
  grid.innerHTML = all.map(({item,section},i)=>`<figure class="asset" data-cat="${esc(section.anchor || slug(item.category || section.nav_label || 'work'))}">${mediaMarkup(item)}<figcaption><span>${String(i+1).padStart(2,'0')}</span><b>${esc(item.category || section.nav_label || 'Visual Work')}</b><strong>${esc(item.title)}</strong></figcaption></figure>`).join('');
}

async function loadContent(){
  try{
    const [siteRes, portfolioRes] = await Promise.all([fetch('content/site.json',{cache:'no-store'}),fetch('content/portfolio.json',{cache:'no-store'})]);
    if(!siteRes.ok || !portfolioRes.ok) throw new Error('Content files unavailable');
    const site=await siteRes.json(); const portfolio=await portfolioRes.json(); const sections=portfolio.sections||[];
    document.title=site.site_title || document.title;
    const heroTitle=site.hero_title || 'Ideas in motion.';
    const heroWords=heroTitle.split(/\s+/); $('.hero-copy h1').innerHTML=heroWords.length>2?`${esc(heroWords.slice(0,-1).join(' '))}<br><em>${esc(heroWords.at(-1))}</em>`:esc(heroTitle);
    $('.hero-lede').textContent=site.hero_description||'';
    document.querySelector('.hero-meta span').textContent=(site.location||'').split(',').slice(-2).join(' / ').toUpperCase();
    $('#managedSections').innerHTML=sections.map(renderSection).join('');
    const nav=$('#managedNav'); nav.innerHTML=sections.filter(s=>s.show_in_nav!==false).map(s=>`<a href="#${esc(s.anchor)}">${esc(s.nav_label||s.eyebrow||s.heading)}</a>`).join('')+'<a href="#about">About</a>';
    renderArchive(sections);
    if(site.email){const a=document.querySelector('#contact a[href^="mailto:"]'); a.href=`mailto:${site.email}`; a.querySelector('strong').textContent=site.email;}
    if(site.whatsapp){const a=document.querySelector('#contact a[href*="wa.me"]'); a.href=site.whatsapp;}
    if(site.phone){const a=document.querySelector('#contact a[href*="wa.me"]'); a.querySelector('strong').textContent=site.phone;}
    if(site.linkedin){const a=document.querySelector('#contact a[href*="linkedin"]'); a.href=site.linkedin;}
    if(site.behance){const a=document.querySelector('#contact a[href*="behance"]'); a.href=site.behance;}
    const addr=$('.address strong'); if(addr) addr.textContent=site.location||'';
    setupInteractions();
  }catch(err){
    console.error(err);
    $('#managedSections').innerHTML='<section class="section"><div class="eyebrow">CONTENT ERROR</div><h2>Portfolio content could not be loaded.</h2><p>Please check the CMS content files.</p></section>';
    setupInteractions();
  }
}

function setupInteractions(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}}));
  document.querySelectorAll('.archive-controls button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.archive-controls button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const v=slug(b.dataset.show);document.querySelectorAll('#archiveGrid .asset').forEach(x=>{x.style.display=v==='all'?'':x.dataset.cat===v?'':'none';});}));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});
  document.querySelectorAll('.film,.asset,.cap,.about h2,.contact h2').forEach(e=>{e.classList.add('reveal');io.observe(e)});
}
loadContent();
