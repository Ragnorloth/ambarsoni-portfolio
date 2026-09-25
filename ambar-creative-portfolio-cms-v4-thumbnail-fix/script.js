const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const slug = v => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function mediaMarkup(item){
  const type = item.media_type || 'image';
  const image = item.image ? String(item.image) : '';
  const video = item.video ? String(item.video) : '';
  const embed = item.video_url ? String(item.video_url) : '';
  const title = esc(item.title || 'Portfolio media');

  // External embeds use the CMS thumbnail as the visible card/poster.
  // The actual iframe is created only after the visitor clicks Play.
  if(type === 'embed' && embed){
    if(image){
      return `<div class="video managed-video-card managed-embed-card" data-embed-url="${esc(embed)}" role="button" tabindex="0" aria-label="Play ${title}">
        <img class="managed-media-poster" src="${esc(image)}" alt="${title}" loading="lazy">
        <span class="managed-play" aria-hidden="true"><span></span></span>
      </div>`;
    }
    return `<div class="video managed-video-card managed-embed-card" data-embed-url="${esc(embed)}" role="button" tabindex="0" aria-label="Play ${title}">
      <span class="managed-play managed-play-plain" aria-hidden="true"><span></span></span>
    </div>`;
  }

  if(type === 'video' && video){
    return `<div class="video managed-video-card">
      <video src="${esc(video)}" ${image ? `poster="${esc(image)}"` : ''} controls playsinline preload="metadata"></video>
      ${image ? '' : '<span class="managed-play" aria-hidden="true"><span></span></span>'}
    </div>`;
  }

  if(image){
    return `<div class="asset-media"><img src="${esc(image)}" alt="${title}" loading="lazy"></div>`;
  }

  return `<div class="asset-media asset-empty"><span>MEDIA</span></div>`;
}

function setupManagedMedia(){
  // Inject the small amount of CSS needed by the CMS-driven media cards.
  if(!document.querySelector('#managed-media-fixes')){
    const style=document.createElement('style');
    style.id='managed-media-fixes';
    style.textContent=`
      .managed-video-card{position:relative;overflow:hidden;cursor:pointer;background:#080808;min-height:180px}
      .managed-video-card .managed-media-poster{display:block;width:100%;height:100%;min-height:inherit;object-fit:cover}
      .managed-play{position:absolute;left:50%;top:50%;width:66px;height:66px;transform:translate(-50%,-50%);
        border-radius:50%;background:rgba(255,255,255,.96);display:grid;place-items:center;
        box-shadow:0 10px 35px rgba(0,0,0,.3);transition:transform .22s ease,box-shadow .22s ease}
      .managed-play span{display:block;width:0;height:0;margin-left:5px;border-top:10px solid transparent;border-bottom:10px solid transparent;border-left:15px solid #111}
      .managed-video-card:hover .managed-play,.managed-video-card:focus-visible .managed-play{
        transform:translate(-50%,-50%) scale(1.08);box-shadow:0 14px 45px rgba(0,0,0,.42)}
      .managed-play-plain{background:rgba(255,255,255,.94)}
      .managed-embed-playing{cursor:default}
      .managed-embed-playing iframe{display:block;width:100%;height:100%;min-height:420px;border:0}
      .managed-embed-playing{min-height:420px}
      @media(max-width:700px){
        .managed-play{width:56px;height:56px}
        .managed-embed-playing iframe,.managed-embed-playing{min-height:260px}
      }
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('.managed-embed-card[data-embed-url]').forEach(card=>{
    const play=()=>{
      if(card.classList.contains('managed-embed-playing')) return;
      const url=card.dataset.embedUrl;
      if(!url) return;
      const iframe=document.createElement('iframe');
      iframe.src=url;
      iframe.title=card.getAttribute('aria-label') || 'Portfolio video';
      iframe.loading='lazy';
      iframe.allow='autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen=true;
      card.innerHTML='';
      card.appendChild(iframe);
      card.classList.add('managed-embed-playing');
      card.removeAttribute('role');
      card.removeAttribute('tabindex');
    };
    card.addEventListener('click',play);
    card.addEventListener('keydown',e=>{
      if(e.key==='Enter' || e.key===' '){e.preventDefault();play();}
    });
  });
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

async function loadContent(){
  try{
    const [siteRes, portfolioRes] = await Promise.all([fetch('content/site.json',{cache:'no-store'}),fetch('content/portfolio.json',{cache:'no-store'})]);
    if(!siteRes.ok || !portfolioRes.ok) throw new Error('Content files unavailable');
    const site=await siteRes.json(); const portfolio=await portfolioRes.json(); const sections=portfolio.sections||[];
    document.title=site.site_title || document.title;
    if(site.favicon){ const icon=document.querySelector('#site-favicon'); if(icon) icon.href=site.favicon; }
    const heroTitle=site.hero_title || 'Creative';
    const constant=$('.hero-constant'); if(constant) constant.textContent='Creative';
    initTypewriter();
    document.querySelector('.hero-meta span').textContent=(site.location||'').split(',').slice(-2).join(' / ').toUpperCase();
    $('#managedSections').innerHTML=sections.map(renderSection).join('');
    const nav=$('#managedNav'); nav.innerHTML=sections.filter(s=>s.show_in_nav!==false).map(s=>`<a href="#${esc(s.anchor)}">${esc(s.nav_label||s.eyebrow||s.heading)}</a>`).join('')+'<a href="#about">About</a>';
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
  setupPointerGlow();
  setupTypewriterParallax();
  setupGraphicLightbox();
  setupManagedMedia();
  setupEnvelopeScroll();
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});
  document.querySelectorAll('.film,.asset,.cap,.about h2,.contact h2,.envelope-copy').forEach(e=>{e.classList.add('reveal');io.observe(e)});
}
loadContent();


const ROLE_WORDS = [
  'video editor.',
  'graphic designer.',
  'social media optimisation.',
  'AI animator.',
  'Magnific creator.',
  'ChatGPT AI creative.',
  'Higgsfield artist.',
  'AI 3D animator.',
  'Seedance 2.0 expert.'
];

function initTypewriter(){
  const el=document.querySelector('#heroRole');
  if(!el || el.dataset.ready) return;
  el.dataset.ready='1';
  let index=0;
  const type=(text, done)=>{
    let i=0;
    el.textContent='';
    const timer=setInterval(()=>{
      el.textContent=text.slice(0,++i);
      if(i>=text.length){clearInterval(timer); if(done) setTimeout(done,850);}
    },34);
  };
  const erase=(done)=>{
    const timer=setInterval(()=>{
      el.textContent=el.textContent.slice(0,-1);
      if(!el.textContent){clearInterval(timer); done();}
    },22);
  };
  const cycle=()=>{
    const next=ROLE_WORDS[index % ROLE_WORDS.length];
    type(next,()=>erase(()=>{index=(index+1)%ROLE_WORDS.length; cycle();}));
  };
  cycle();
}

function setupPointerGlow(){
  if(matchMedia('(pointer:coarse)').matches) return;
  const a=document.querySelector('.pointer-glow-a');
  const b=document.querySelector('.pointer-glow-b');
  if(!a || !b) return;
  let tx=innerWidth*.5, ty=innerHeight*.45, x=tx, y=ty, bx=x, by=y;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;document.body.classList.add('pointer-active')},{passive:true});
  const tick=()=>{
    x += (tx-x)*.08; y += (ty-y)*.08;
    bx += (tx-bx)*.035; by += (ty-by)*.035;
    a.style.transform=`translate3d(${x}px,${y}px,0)`;
    b.style.transform=`translate3d(${bx}px,${by}px,0)`;
    requestAnimationFrame(tick);
  };
  tick();
}

function setupTypewriterParallax(){
  const hero=document.querySelector('.hero');
  const card=document.querySelector('.profile-card');
  const copy=document.querySelector('.hero-copy');
  if(!hero) return;
  let raf=0;
  addEventListener('scroll',()=>{
    if(raf) return;
    raf=requestAnimationFrame(()=>{
      const y=scrollY;
      if(y<innerHeight*1.2){
        const p=Math.min(y/innerHeight,1);
        if(card) card.style.transform=`translate3d(0,${p*-34}px,0) rotate(${1.5+p*-2}deg)`;
        if(copy) copy.style.transform=`translate3d(0,${p*-18}px,0)`;
        hero.style.setProperty('--hero-depth', `${p*18}px`);
      }
      raf=0;
    });
  },{passive:true});
}

function setupGraphicLightbox(){
  const cards=document.querySelectorAll('#graphics .asset, .managed-section#graphics .asset');
  if(!cards.length) return;
  let modal=document.querySelector('.media-lightbox');
  if(!modal){
    modal=document.createElement('div');
    modal.className='media-lightbox';
    modal.innerHTML='<button class="lightbox-close" aria-label="Close">×</button><div class="lightbox-inner"><img alt=""><div class="lightbox-caption"></div></div>';
    document.body.appendChild(modal);
    const close=()=>{modal.classList.remove('open');document.body.classList.remove('modal-open');};
    modal.addEventListener('click',e=>{if(e.target===modal || e.target.closest('.lightbox-close')) close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
  }
  const image=modal.querySelector('img'), caption=modal.querySelector('.lightbox-caption');
  cards.forEach(card=>card.addEventListener('click',()=>{
    const img=card.querySelector('img'); if(!img) return;
    image.src=img.currentSrc || img.src; image.alt=img.alt || '';
    const title=card.querySelector('strong')?.textContent || img.alt || 'Graphic design';
    const category=card.querySelector('b')?.textContent || 'GRAPHIC DESIGN';
    caption.innerHTML=`<span>${esc(category)}</span><strong>${esc(title)}</strong>`;
    modal.classList.add('open'); document.body.classList.add('modal-open');
  }));
}

function setupEnvelopeScroll(){
  const section=document.querySelector('.envelope-section');
  const wrap=document.querySelector('.envelope-wrap');
  const card=document.querySelector('.envelope-card');
  const flap=document.querySelector('.envelope-flap');
  if(!section || !wrap || !card || !flap) return;
  let raf=0;
  const update=()=>{
    const rect=section.getBoundingClientRect();
    const range=Math.max(section.offsetHeight-innerHeight,1);
    const progress=Math.max(0,Math.min(1,-rect.top/range));
    const lift=Math.max(0,Math.min(1,(progress-.18)/.64));
    wrap.style.setProperty('--card-lift',`${lift*300}px`);
    wrap.style.setProperty('--card-tilt',`${(1-lift)*2.5}deg`);
    flap.style.transform=`rotateX(${lift*175}deg)`;
    wrap.classList.toggle('opened',lift>.45);
    raf=0;
  };
  addEventListener('scroll',()=>{if(!raf) raf=requestAnimationFrame(update)},{passive:true});
  update();
}
