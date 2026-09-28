
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const slug = v => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function presentationFor(section){
  const explicit = String(section.presentation || '').trim();
  if(explicit && explicit !== 'standard') return explicit;
  const key = `${section.anchor||''} ${section.heading||''} ${section.eyebrow||''}`.toLowerCase();
  if(/talking[\s-]*head|talkinghead/.test(key)) return 'talking-head';
  if(/\bai\b|ai[\s-]*(video|film|visual)/.test(key)) return 'ai-deck';
  if(/\b3d\b|blender/.test(key)) return '3d-showcase';
  return 'standard';
}

function posterMarkup(item, title){
  const image = item.image ? String(item.image) : '';
  return image ? `<img class="special-poster" src="${esc(image)}" alt="${title}" loading="lazy">` : '';
}

function specialMediaMarkup(item, mode='special'){
  const type = item.media_type || 'image';
  const image = item.image ? String(item.image) : '';
  const video = item.video ? String(item.video) : '';
  const embed = item.video_url ? String(item.video_url) : '';
  const title = esc(item.title || 'Portfolio media');

  if(type === 'video' && video){
    return `<div class="special-media local-video-wrap">
      <video class="special-video" src="${esc(video)}" ${image ? `poster="${esc(image)}"` : ''} muted autoplay loop playsinline preload="metadata" data-autoplay-video></video>
      <button class="media-mute" type="button" aria-label="Unmute video" aria-pressed="false"><span class="mute-icon">◌</span><span class="mute-label">UNMUTE</span></button>
    </div>`;
  }

  if(type === 'embed' && embed){
    if(image){
      return `<div class="special-media managed-embed-card special-embed" data-embed-url="${esc(embed)}" role="button" tabindex="0" aria-label="Play ${title}">
        ${posterMarkup(item,title)}
        <span class="managed-play" aria-hidden="true"><span></span></span>
      </div>`;
    }
    return `<div class="special-media managed-embed-card special-embed no-poster" data-embed-url="${esc(embed)}" role="button" tabindex="0" aria-label="Play ${title}">
      <span class="managed-play managed-play-plain" aria-hidden="true"><span></span></span>
    </div>`;
  }

  if(image){
    return `<div class="special-media"><img class="special-poster" src="${esc(image)}" alt="${title}" loading="lazy"></div>`;
  }

  return `<div class="special-media special-empty"><span>ADD MEDIA IN CMS</span></div>`;
}

function standardMediaMarkup(item){
  const type = item.media_type || 'image';
  const image = item.image ? String(item.image) : '';
  const video = item.video ? String(item.video) : '';
  const embed = item.video_url ? String(item.video_url) : '';
  const title = esc(item.title || 'Portfolio media');

  if(type === 'embed' && embed){
    return `<div class="video managed-video-card managed-embed-card" data-embed-url="${esc(embed)}" role="button" tabindex="0" aria-label="Play ${title}">
      ${image ? `<img class="managed-media-poster" src="${esc(image)}" alt="${title}" loading="lazy">` : ''}
      <span class="managed-play ${image?'':'managed-play-plain'}" aria-hidden="true"><span></span></span>
    </div>`;
  }
  if(type === 'video' && video){
    return `<div class="video managed-video-card">
      <video src="${esc(video)}" ${image ? `poster="${esc(image)}"` : ''} controls playsinline preload="metadata"></video>
    </div>`;
  }
  if(image) return `<div class="asset-media"><img src="${esc(image)}" alt="${title}" loading="lazy"></div>`;
  return `<div class="asset-media asset-empty"><span>MEDIA</span></div>`;
}

function renderStandardSection(section,index,items){
  const theme=['dark','light','dark-alt'].includes(section.theme) ? section.theme : 'dark';
  const heading=esc(section.heading || 'Untitled section');
  const process=section.process ? `<div class="process-line"><span>REFERENCE</span><b>→</b><span>MODEL</span><b>→</b><span>LIGHT</span><b>→</b><span>RENDER</span><b>→</b><span>COMPOSITE</span></div>` : '';
  const cards=items.map((item,i)=>{
    const isFilm=item.media_type==='video'||item.media_type==='embed';
    if(isFilm) return `<article class="${item.featured?'film film-feature':'film'} reveal">${standardMediaMarkup(item)}<div class="film-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(item.category||'')}</span><h3>${esc(item.title||'Untitled')}</h3>${item.description?`<p>${esc(item.description)}</p>`:''}</div></article>`;
    return `<figure class="asset reveal" data-cat="${esc(section.anchor || slug(item.category || 'work'))}">${standardMediaMarkup(item)}<figcaption><span>${String(i+1).padStart(2,'0')}</span><b>${esc(item.category || section.nav_label || 'Visual Work')}</b><strong>${esc(item.title||'')}</strong></figcaption></figure>`;
  }).join('');
  const gridClass=items.some(x=>x.media_type==='video'||x.media_type==='embed')?'film-grid':'masonry';
  return `<section id="${esc(section.anchor||`section-${index+1}`)}" class="section managed-section ${theme}"><div class="section-head"><div><span class="eyebrow">${esc(section.eyebrow||`${String(index+1).padStart(2,'0')} / SECTION`)}</span><h2>${heading}</h2></div></div>${section.description?`<p class="managed-description">${esc(section.description)}</p>`:''}${process}<div class="${gridClass}">${cards}</div></section>`;
}

function renderSpecialHeader(section,index,kicker){
  return `<div class="section-head special-head"><div><span class="eyebrow">${esc(section.eyebrow||`${String(index+1).padStart(2,'0')} / ${kicker}`)}</span><h2>${esc(section.heading||kicker)}</h2></div><span class="special-index">${String(index+1).padStart(2,'0')} / ${kicker}</span></div>${section.description?`<p class="managed-description">${esc(section.description)}</p>`:''}<div class="scroll-shuttle" aria-hidden="true"><span>${kicker} · PLAY / PAUSE · DRAG THE FRAME · ${kicker} · PLAY / PAUSE · DRAG THE FRAME ·</span></div>`;
}

function renderAiDeck(section,index,items){
  const cards=items.slice(0,7).map((item,i)=>`<article class="ai-card" data-deck-index="${i}" data-depth="${i}">
    <div class="ai-card-media">${specialMediaMarkup(item,'ai')}</div>
    <div class="ai-card-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(item.category||'AI VIDEO')}</span><strong>${esc(item.title||'Untitled')}</strong></div>
  </article>`).join('');
  return `<section id="${esc(section.anchor)}" class="section managed-section special-section ai-section" data-presentation="ai-deck">
    ${renderSpecialHeader(section,index,'AI VIDEO')}
    <div class="ai-deck" data-ai-deck>${cards}</div>
    <div class="special-foot"><span>AI / GENERATIVE / EDIT / VFX</span><span>SCROLL TO SHIFT THE FRAME ↗</span></div>
  </section>`;
}

function renderTalkingHead(section,index,items){
  const cards=items.slice(0,6).map((item,i)=>`<article class="talk-card ${i===0?'talk-primary':''}" data-talk-index="${i}">
    ${specialMediaMarkup(item,'talking')}
    <div class="talk-card-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(item.category||'TALKING HEAD')}</span><strong>${esc(item.title||'Untitled')}</strong></div>
  </article>`).join('');
  return `<section id="${esc(section.anchor)}" class="section managed-section special-section talking-section" data-presentation="talking-head">
    ${renderSpecialHeader(section,index,'TALKING HEAD')}
    <div class="talking-stage" data-talking-stage>${cards}</div>
    <div class="special-foot"><span>AUTO / MUTED / LOOP</span><span>HOVER TO EXPAND · MOVE THE POINTER ↗</span></div>
  </section>`;
}

function render3DShowcase(section,index,items){
  const cards=items.slice(0,9).map((item,i)=>`<article class="three-card" data-three-index="${i}">
    ${specialMediaMarkup(item,'3d')}
    <div class="three-card-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(item.category||'3D / BLENDER')}</span><strong>${esc(item.title||'Untitled')}</strong></div>
  </article>`).join('');
  return `<section id="${esc(section.anchor)}" class="section managed-section special-section three-showcase-section" data-presentation="3d-showcase">
    ${renderSpecialHeader(section,index,'3D / BLENDER')}
    <div class="three-stage" data-three-stage>${cards}</div>
    <div class="special-foot"><span>BLENDER / CGI / PRODUCT / MOTION</span><span>FRAME SHIFT ↗</span></div>
  </section>`;
}

function renderSection(section,index){
  const items=(section.items||[]).filter(x=>x.visible!==false);
  if(!items.length) return '';
  const presentation=presentationFor(section);
  if(presentation==='ai-deck') return renderAiDeck(section,index,items);
  if(presentation==='talking-head') return renderTalkingHead(section,index,items);
  if(presentation==='3d-showcase') return render3DShowcase(section,index,items);
  return renderStandardSection(section,index,items);
}

function loadContent(){
  return Promise.all([
    fetch('content/site.json',{cache:'no-store'}),
    fetch('content/portfolio.json',{cache:'no-store'})
  ]).then(async ([siteRes,portfolioRes])=>{
    if(!siteRes.ok||!portfolioRes.ok) throw new Error('Content files unavailable');
    const site=await siteRes.json();
    const portfolio=await portfolioRes.json();
    const sections=portfolio.sections||[];
    document.title=site.site_title||document.title;
    if(site.favicon){const icon=$('#site-favicon');if(icon) icon.href=site.favicon;}
    const constant=$('.hero-constant'); if(constant) constant.textContent='Creative';
    initTypewriter();
    const heroMeta=$('.hero-meta span'); if(heroMeta) heroMeta.textContent=(site.location||'').split(',').slice(-2).join(' / ').toUpperCase();
    $('#managedSections').innerHTML=sections.map(renderSection).join('');
    const nav=$('#managedNav');
    nav.innerHTML=sections.filter(s=>s.show_in_nav!==false && (s.items||[]).some(x=>x.visible!==false)).map(s=>`<a href="#${esc(s.anchor)}">${esc(s.nav_label||s.eyebrow||s.heading)}</a>`).join('')+'<a href="#about">About</a>';
    if(site.email){const a=$('#contact a[href^="mailto:"]');if(a){a.href=`mailto:${site.email}`;a.querySelector('strong').textContent=site.email;}}
    if(site.whatsapp){const a=$('#contact a[href*="wa.me"]');if(a){a.href=site.whatsapp;}}
    if(site.phone){const a=$('#contact a[href*="wa.me"]');if(a)a.querySelector('strong').textContent=site.phone;}
    if(site.linkedin){const a=$('#contact a[href*="linkedin"]');if(a)a.href=site.linkedin;}
    if(site.behance){const a=$('#contact a[href*="behance"]');if(a)a.href=site.behance;}
    const addr=$('.address strong');if(addr)addr.textContent=site.location||'';
    setupInteractions();
  }).catch(err=>{
    console.error(err);
    $('#managedSections').innerHTML='<section class="section"><div class="eyebrow">CONTENT ERROR</div><h2>Portfolio content could not be loaded.</h2><p>Please check the CMS content files.</p></section>';
    setupInteractions();
  });
}

function setupInteractions(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}}));
  setupPointerGlow();
  setupTypewriterParallax();
  setupGraphicLightbox();
  setupManagedMedia();
  setupSpecialMedia();
  setupAiDeck();
  setupTalkingHead();
  setupThreeShowcase();
  setupScrollMotion();
  setupEnvelopeScroll();
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});
  document.querySelectorAll('.film,.asset,.about h2,.contact h2,.envelope-copy,.special-section .section-head,.special-section .special-foot').forEach(e=>{e.classList.add('reveal');io.observe(e)});
}

function setupManagedMedia(){
  if(!document.querySelector('#managed-media-fixes')){
    const style=document.createElement('style');
    style.id='managed-media-fixes';
    style.textContent=`
      .managed-video-card{position:relative;overflow:hidden;cursor:pointer;background:#080808;min-height:180px}
      .managed-video-card .managed-media-poster{display:block;width:100%;height:100%;min-height:inherit;object-fit:cover}
      .managed-play{position:absolute;left:50%;top:50%;width:66px;height:66px;transform:translate(-50%,-50%);border-radius:50%;background:rgba(255,255,255,.96);display:grid;place-items:center;box-shadow:0 10px 35px rgba(0,0,0,.3);transition:transform .22s ease,box-shadow .22s ease}
      .managed-play span{display:block;width:0;height:0;margin-left:5px;border-top:10px solid transparent;border-bottom:10px solid transparent;border-left:15px solid #111}
      .managed-video-card:hover .managed-play,.managed-video-card:focus-visible .managed-play{transform:translate(-50%,-50%) scale(1.08);box-shadow:0 14px 45px rgba(0,0,0,.42)}
      .managed-play-plain{background:rgba(255,255,255,.94)}
      .managed-embed-playing{cursor:default}
      .managed-embed-playing iframe{display:block;width:100%;height:100%;min-height:420px;border:0}
      .managed-embed-playing{min-height:420px}
      @media(max-width:700px){.managed-play{width:56px;height:56px}.managed-embed-playing iframe,.managed-embed-playing{min-height:260px}}
    `;
    document.head.appendChild(style);
  }
  document.querySelectorAll('.managed-embed-card[data-embed-url]').forEach(card=>{
    const play=()=>{
      if(card.classList.contains('managed-embed-playing'))return;
      const url=card.dataset.embedUrl;if(!url)return;
      const iframe=document.createElement('iframe');
      iframe.src=url;iframe.title=card.getAttribute('aria-label')||'Portfolio video';iframe.loading='lazy';iframe.allow='autoplay; fullscreen; picture-in-picture';iframe.allowFullscreen=true;
      card.innerHTML='';card.appendChild(iframe);card.classList.add('managed-embed-playing');card.removeAttribute('role');card.removeAttribute('tabindex');
    };
    card.addEventListener('click',play);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play();}});
  });
}

function setupSpecialMedia(){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const video=entry.target;
    if(entry.isIntersecting){video.play().catch(()=>{});}
    else{video.pause();}
  }),{threshold:.25});
  document.querySelectorAll('[data-autoplay-video]').forEach(video=>observer.observe(video));

  document.querySelectorAll('.media-mute').forEach(button=>{
    button.addEventListener('click',e=>{
      e.stopPropagation();
      const video=button.closest('.special-media')?.querySelector('video');
      if(!video)return;
      const now=!video.muted;
      video.muted=now;
      button.setAttribute('aria-pressed',String(!now));
      button.setAttribute('aria-label',now?'Unmute video':'Mute video');
      button.querySelector('.mute-icon').textContent=now?'◌':'◉';
      button.querySelector('.mute-label').textContent=now?'UNMUTE':'MUTE';
      if(!now) video.play().catch(()=>{});
    });
  });

  document.querySelectorAll('.special-media.managed-embed-card[data-embed-url]').forEach(card=>{
    const play=()=>{
      if(card.classList.contains('managed-embed-playing'))return;
      const iframe=document.createElement('iframe');
      iframe.src=card.dataset.embedUrl;
      iframe.title=card.getAttribute('aria-label')||'Portfolio video';
      iframe.allow='autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen=true;
      card.innerHTML='';
      card.appendChild(iframe);
      card.classList.add('managed-embed-playing');
      card.removeAttribute('role');card.removeAttribute('tabindex');
    };
    card.addEventListener('click',play);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play();}});
  });
}

function setupAiDeck(){
  document.querySelectorAll('[data-ai-deck]').forEach(deck=>{
    const cards=[...deck.querySelectorAll('.ai-card')];
    if(!cards.length)return;
    let active=0, timer=null, hovering=false;
    const positions=['far-left','left','active','right','far-right'];
    const paint=()=>{
      cards.forEach((card,i)=>{
        let rel=(i-active+cards.length)%cards.length;
        if(rel>Math.floor(cards.length/2))rel-=cards.length;
        const pos=rel===0?'active':rel===-1?'left':rel===1?'right':rel===-2?'far-left':rel===2?'far-right':'hidden';
        card.dataset.position=pos;
      });
    };
    const next=()=>{active=(active+1)%cards.length;paint();};
    paint();
    timer=setInterval(()=>{if(!hovering)next();},4200);
    deck.addEventListener('mouseenter',()=>hovering=true);
    deck.addEventListener('mouseleave',()=>hovering=false);
    deck.addEventListener('click',e=>{
      const card=e.target.closest('.ai-card'); if(!card)return;
      const i=cards.indexOf(card);
      if(i>=0 && i!==active){active=i;paint();}
    });
  });
}

function setupTalkingHead(){
  document.querySelectorAll('[data-talking-stage]').forEach(stage=>{
    const cards=[...stage.querySelectorAll('.talk-card')];
    cards.forEach(card=>{
      card.addEventListener('pointermove',e=>{
        if(matchMedia('(pointer:coarse)').matches)return;
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.setProperty('--rx',`${y*-4}deg`);
        card.style.setProperty('--ry',`${x*5}deg`);
        card.style.setProperty('--mx',`${x*24}px`);
        card.style.setProperty('--my',`${y*18}px`);
      });
      card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');card.style.setProperty('--mx','0px');card.style.setProperty('--my','0px');});
    });
  });
}

function setupThreeShowcase(){
  document.querySelectorAll('[data-three-stage]').forEach(stage=>{
    const cards=[...stage.querySelectorAll('.three-card')];
    if(!cards.length)return;
    let active=Math.min(1,cards.length-1), timer=null, hover=false;
    const paint=()=>{
      cards.forEach((card,i)=>{
        let rel=i-active;
        if(rel>2)rel-=cards.length;
        if(rel<-2)rel+=cards.length;
        card.dataset.position=rel===0?'center':rel===-1?'left':rel===1?'right':rel===-2?'far-left':rel===2?'far-right':'hidden';
      });
    };
    paint();
    timer=setInterval(()=>{if(!hover){active=(active+1)%cards.length;paint();}},5000);
    stage.addEventListener('mouseenter',()=>hover=true);
    stage.addEventListener('mouseleave',()=>hover=false);
  });
}

function setupScrollMotion(){
  const sections=[...document.querySelectorAll('.special-section')];
  if(!sections.length)return;
  let raf=0;
  const update=()=>{
    const vh=innerHeight;
    sections.forEach(section=>{
      const r=section.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height*.7)));
      section.style.setProperty('--scroll-p',progress.toFixed(3));
      const shuttle=section.querySelector('.scroll-shuttle span');
      if(shuttle) shuttle.style.transform=`translate3d(${(progress-.5)*-180}px,0,0)`;
      section.querySelectorAll('.ai-card,.talk-card,.three-card').forEach((card,i)=>{
        const depth=Number(card.dataset.depth||i%5);
        card.style.setProperty('--scroll-y',`${(progress-.5)*depth*-20}px`);
      });
    });
    raf=0;
  };
  addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});
  addEventListener('resize',update,{passive:true});
  update();
}

function setupPointerGlow(){
  if(matchMedia('(pointer:coarse)').matches)return;
  const a=document.querySelector('.pointer-glow-a'),b=document.querySelector('.pointer-glow-b');if(!a||!b)return;
  let tx=innerWidth*.5,ty=innerHeight*.45,x=tx,y=ty,bx=x,by=y;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;document.body.classList.add('pointer-active')},{passive:true});
  const tick=()=>{x+=(tx-x)*.08;y+=(ty-y)*.08;bx+=(tx-bx)*.035;by+=(ty-by)*.035;a.style.transform=`translate3d(${x}px,${y}px,0)`;b.style.transform=`translate3d(${bx}px,${by}px,0)`;requestAnimationFrame(tick)};tick();
}

function setupTypewriterParallax(){
  const hero=document.querySelector('.hero'),card=document.querySelector('.profile-card'),copy=document.querySelector('.hero-copy');if(!hero)return;
  let raf=0;
  addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{const y=scrollY;if(y<innerHeight*1.2){const p=Math.min(y/innerHeight,1);if(card)card.style.transform=`translate3d(0,${p*-34}px,0) rotate(${1.5+p*-2}deg)`;if(copy)copy.style.transform=`translate3d(0,${p*-18}px,0)`;hero.style.setProperty('--hero-depth',`${p*18}px`);}raf=0;})},{passive:true});
}

function setupGraphicLightbox(){
  const cards=document.querySelectorAll('#graphics .asset,.managed-section#graphics .asset');if(!cards.length)return;
  let modal=document.querySelector('.media-lightbox');
  if(!modal){
    modal=document.createElement('div');modal.className='media-lightbox';
    modal.innerHTML='<button class="lightbox-close" aria-label="Close">×</button><div class="lightbox-inner"><img alt=""><div class="lightbox-caption"></div></div>';
    document.body.appendChild(modal);
    const close=()=>{modal.classList.remove('open');document.body.classList.remove('modal-open');};
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.lightbox-close'))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  }
  const image=modal.querySelector('img'),caption=modal.querySelector('.lightbox-caption');
  cards.forEach(card=>card.addEventListener('click',()=>{
    const img=card.querySelector('img');if(!img)return;
    image.src=img.currentSrc||img.src;image.alt=img.alt||'';
    const title=card.querySelector('strong')?.textContent||img.alt||'Graphic design';
    const category=card.querySelector('b')?.textContent||'GRAPHIC DESIGN';
    caption.innerHTML=`<span>${esc(category)}</span><strong>${esc(title)}</strong>`;
    modal.classList.add('open');document.body.classList.add('modal-open');
  }));
}

function setupEnvelopeScroll(){
  const section=document.querySelector('.envelope-section'),wrap=document.querySelector('.envelope-wrap'),card=document.querySelector('.envelope-card'),flap=document.querySelector('.envelope-flap');
  if(!section||!wrap||!card||!flap)return;
  let raf=0;
  const update=()=>{const rect=section.getBoundingClientRect(),range=Math.max(section.offsetHeight-innerHeight,1),progress=Math.max(0,Math.min(1,-rect.top/range)),lift=Math.max(0,Math.min(1,(progress-.18)/.64));wrap.style.setProperty('--card-lift',`${lift*300}px`);wrap.style.setProperty('--card-tilt',`${(1-lift)*2.5}deg`);flap.style.transform=`rotateX(${lift*175}deg)`;wrap.classList.toggle('opened',lift>.45);raf=0;};
  addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});update();
}

loadContent().then(()=>{});
