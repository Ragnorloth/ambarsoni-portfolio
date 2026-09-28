
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
      <video class="special-video" src="${esc(video)}" ${image ? `poster="${esc(image)}"` : ''} muted autoplay loop playsinline preload="auto" data-autoplay-video></video>
      <button class="media-mute" type="button" aria-label="Unmute video" aria-pressed="false"><span class="mute-icon">◌</span><span class="mute-label">UNMUTE</span></button>
    </div>`;
  }

  if(type === 'embed' && embed){
    if(mode === 'ai' || mode === 'talking'){
      // Adobe CCV is cross-origin, so the parent page cannot force the
      // player's internal video element to mute/loop. We therefore request
      // all three behaviors from the embedded player and keep the iframe
      // filling the complete card. Browsers allow muted autoplay more often
      // than audible autoplay.
      const params = 'autoplay=1&muted=1&loop=1';
      const autoUrl = embed + (embed.includes('?') ? '&' : '?') + params;
      const ratio = String(item.aspect_ratio || '16:9');
      const orientation = ratio === '9:16' ? 'portrait' : 'landscape';
      return `<div class="special-media special-embed ai-embed-live ${mode==='talking'?'talk-embed-live':''} ai-media-${orientation}" role="button" tabindex="0" aria-label="Open ${title} fullscreen">
        <iframe src="${esc(autoUrl)}" title="${title}" loading="eager" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>
      </div>`;
    }
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
  const cards=items.slice(0,9).map((item,i)=>`<article class="ai-card" data-deck-index="${i}" data-depth="${i}">
    <div class="ai-card-media">${specialMediaMarkup(item,'ai')}</div>
    <div class="ai-card-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(item.category||'AI VIDEO')}</span><strong>${esc(item.title||'Untitled')}</strong></div>
  </article>`).join('');
  return `<section id="${esc(section.anchor)}" class="section managed-section special-section ai-section" data-presentation="ai-deck">
    ${renderSpecialHeader(section,index,'AI VIDEO')}
    <div class="ai-deck-controls" aria-label="AI video navigation">
      <button type="button" class="ai-deck-nav" data-ai-prev aria-label="Previous AI video"><span>←</span><b>PREVIOUS</b></button>
      <span class="ai-deck-count" data-ai-count>01 / ${String(Math.max(items.length,1)).padStart(2,'0')}</span>
      <button type="button" class="ai-deck-nav" data-ai-next aria-label="Next AI video"><b>NEXT</b><span>→</span></button>
    </div>
    <div class="ai-deck" data-ai-deck>${cards}</div>
    <div class="special-foot"><span>AI / GENERATIVE / EDIT / VFX</span><span>CLICK ANYWHERE ON A VIDEO TO EXPAND ↗</span></div>
  </section>`;
}

function renderTalkingHead(section,index,items){
  const cards=items.map((item,i)=>{
    const ratio=String(item.aspect_ratio||'16:9');
    const orientation=ratio==='9:16'?'portrait':'landscape';
    return `<article class="talk-card talk-${orientation}" data-talk-index="${i}" data-orientation="${orientation}">
      ${specialMediaMarkup(item,'talking')}
      <div class="talk-card-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(item.category||'TALKING HEAD')}</span><strong>${esc(item.title||'Untitled')}</strong></div>
    </article>`;
  }).join('');
  return `<section id="${esc(section.anchor)}" class="section managed-section special-section talking-section" data-presentation="talking-head">
    ${renderSpecialHeader(section,index,'TALKING HEAD')}
    <div class="talking-stage" data-talking-stage>${cards}</div>
    <div class="special-foot"><span>AUTO / MUTED / LOOP</span><span>CLICK ANYWHERE TO EXPAND ↗</span></div>
  </section>`;
}

function render3DShowcase(section,index,items){
  const cards=items.slice(0,9).map((item,i)=>`<article class="three-card" data-three-index="${i}">
    ${specialMediaMarkup(item,'3d')}
    <div class="three-card-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(item.category||'3D / BLENDER')}</span><strong>${esc(item.title||'Untitled')}</strong></div>
  </article>`).join('');
  return `<section id="${esc(section.anchor)}" class="section managed-section special-section three-showcase-section" data-presentation="3d-showcase">
    ${renderSpecialHeader(section,index,'3D / BLENDER')}
    <div class="three-deck-controls" aria-label="3D Blender navigation">
      <button type="button" class="three-deck-nav" data-three-prev aria-label="Previous 3D Blender project"><span>←</span><b>PREVIOUS</b></button>
      <span class="three-deck-count" data-three-count>01 / ${String(Math.max(items.length,1)).padStart(2,'0')}</span>
      <button type="button" class="three-deck-nav" data-three-next aria-label="Next 3D Blender project"><b>NEXT</b><span>→</span></button>
    </div>
    <div class="three-stage" data-three-stage>${cards}</div>
    <div class="special-foot"><span>BLENDER / CGI / PRODUCT / MOTION</span><span>FRAME SHIFT ↗</span></div>
  </section>`;
}



function renderCaseVisual(item,i){
  if(item.image) return `<div class="case-real-visual"><img src="${esc(item.image)}" alt="${esc(item.title||'Workflow visual')}" loading="lazy"></div>`;
  const type=item.visual||'paper';
  if(type==='script') return `<div class="case-visual case-script"><div class="case-file-tag">SCRIPT / CONFIDENTIAL</div><div class="script-page"><span>INT. / CREATIVE ROOM — DAY</span><h4>${esc(item.script_hook||'A rough idea becomes a clear story.')}</h4><div class="script-lines"><i></i><i></i><i></i><i></i><i></i></div><div class="script-checks">☑ HOOK &nbsp;&nbsp; ☑ STORY BEAT &nbsp;&nbsp; ☑ CTA</div></div><div class="case-pencil"></div></div>`;
  if(type==='references') return `<div class="case-visual case-references"><div class="ref-note">VISUAL DIRECTION</div><div class="ref-grid"><span class="ref-photo ref-a"></span><span class="ref-photo ref-b"></span><span class="ref-photo ref-c"></span><span class="ref-photo ref-d"></span></div><div class="ref-tags"><b>CHARACTER</b><b>LIGHTING</b><b>CAMERA</b><b>STYLE</b></div></div>`;
  if(type==='ae') return `<div class="case-visual case-software ae-screen"><div class="screen-bar"><b>Adobe After Effects</b><span>● ● ●</span></div><div class="ae-canvas"><div class="ae-orb"></div><div class="ae-type">MOTION<br>DESIGN</div><div class="ae-guide"></div></div><div class="ae-timeline"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`;
  if(type==='blender') return `<div class="case-visual case-software blender-screen"><div class="screen-bar"><b>BLENDER / 3D SCENE</b><span>CAMERA 01</span></div><div class="blend-canvas"><div class="blend-road"></div><div class="blend-building b1"></div><div class="blend-building b2"></div><div class="blend-tree"></div><div class="blend-camera"></div></div><div class="blend-ui"><span>SCENE</span><span>LIGHT</span><span>CAMERA</span><span>ANIMATION</span></div></div>`;
  if(type==='captions') return `<div class="case-visual case-software captions-screen"><div class="screen-bar"><b>Kalakkar.io / Captions</b><span>GENERATING</span></div><div class="caption-video"><div class="caption-demo">the spaces <em>🏠</em><br><strong>where we live, work, and breathe.</strong></div></div><div class="caption-list"><span>Dust, pollution,</span><span>everyday</span><span>particles moving</span><span>silently through</span><span>the spaces where</span></div></div>`;
  if(type==='edit') return `<div class="case-visual case-software edit-screen"><div class="screen-bar"><b>PREMIERE PRO / FINAL EDIT</b><span>01:03:06</span></div><div class="edit-preview"><div class="edit-play">▶</div></div><div class="edit-timeline"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`;
  return `<div class="case-visual case-paper-visual"><div class="paper-tape"></div><div class="paper-scribble">SELECT<br>REFINE<br>REPEAT</div><div class="paper-arrow">↗</div></div>`;
}

function renderCaseStudy(section,index,items){
  const steps=items.slice(0,8).map((item,i)=>`<article class="case-scene reveal" data-case-step="${i+1}">
    <div class="case-step-marker"><span>0${i+1}</span><i></i></div>
    <div class="case-scene-inner">
      <div class="case-scene-copy">
        <span class="case-scene-phase">${esc(item.phase||'WORKFLOW')}</span>
        <h3>${esc(item.title||'Untitled')}</h3>
        <p>${esc(item.description||'')}</p>
        ${item.tools?.length?`<div class="case-tools">${item.tools.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}
        ${item.note?`<div class="case-hand-note">↳ ${esc(item.note)}</div>`:''}
      </div>
      <div class="case-scene-visual">${renderCaseVisual(item,i)}</div>
    </div>
  </article>`).join('');
  const closeImage=section.case_closing_image||'assets/profile-ambar.webp';
  return `<section id="${esc(section.anchor)}" class="section managed-section case-study-section" data-presentation="case-study">
    <div class="case-hero reveal">
      <div class="case-hero-kicker"><span>CASE FILE / 001</span><span>PRIVATE WORKFLOW ARCHIVE</span></div>
      <div class="case-hero-title"><span class="case-redline"></span><h2>${esc(section.heading||'Behind the edit.')}</h2><p>${esc(section.description||'From the first idea to the final frame — follow the trail.')}</p></div>
      <div class="case-hero-note">A project is never just a timeline.<br><em>It is a chain of decisions.</em></div>
      <div class="case-bulb" aria-hidden="true"><span class="case-bulb-wire"></span><span class="case-bulb-cap"></span><span class="case-bulb-glass"><i></i></span></div>
    </div>
    <div class="case-story">
      <div class="case-story-thread" aria-hidden="true"></div>
      <div class="case-story-label">FOLLOW THE PROCESS <b>↘</b></div>
      ${steps}
    </div>
    <div class="case-close reveal">
      <div class="case-folder">
        <span class="case-confidential">CONFIDENTIAL</span>
        <div class="case-close-strip">CASE FILE CLOSED.<br><small>THANK YOU!</small></div>
        <div class="case-qr" aria-hidden="true"></div>
        <p>${esc(section.case_closing_text||'For creativity, collaborations or just a conversation — let’s connect.')}</p>
      </div>
      <div class="case-portrait-wrap">
        <div class="case-leaves case-leaves-a"></div><div class="case-leaves case-leaves-b"></div>
        <div class="case-portrait-ring"><img src="${esc(closeImage)}" alt="Ambar Soni" loading="lazy"></div>
        <svg class="case-thanks-ring" viewBox="0 0 220 220" aria-hidden="true"><defs><path id="thanksPath" d="M110,110 m-87,0 a87,87 0 1,1 174,0 a87,87 0 1,1 -174,0"/></defs><text><textPath href="#thanksPath" startOffset="2%">THANK YOU FOR SCROLLING • LOOKING FORWARD TO CONNECT • </textPath></text></svg>
      </div>
      <div class="case-close-copy"><span>THE END / FOR NOW</span><h3>${esc(section.case_closing_title||'Looking forward to connect.')}</h3><p>Video editing • Motion • AI • Visual storytelling</p></div>
    </div>
    <div class="special-foot case-study-foot"><span>BRIEF / SCRIPT / REFERENCES / BUILD / EDIT / SOUND / DELIVERY</span><span>CASE FILE / CLOSED ↘</span></div>
  </section>`;
}

function renderSection(section,index){
  const items=(section.items||[]).filter(x=>x.visible!==false);
  if(!items.length) return '';
  const presentation=presentationFor(section);
  if(presentation==='ai-deck') return renderAiDeck(section,index,items);
  if(presentation==='talking-head') return renderTalkingHead(section,index,items);
  if(presentation==='3d-showcase') return render3DShowcase(section,index,items);
  if(presentation==='case-study') return renderCaseStudy(section,index,items);
  return renderStandardSection(section,index,items);
}

function initTypewriter(){
  const target=document.querySelector('#heroRole');
  if(!target || target.dataset.typewriterReady==='true') return;
  target.dataset.typewriterReady='true';
  const roles=[
    'video editor',
    'graphic designer',
    'Social Media Optimisatin',
    'Ai animation',
    'Magnific',
    'Chatgpt ai',
    'Higsfield',
    'Ai 3D animation',
    'Seedance 2.0 Expert'
  ];
  let roleIndex=0;
  let charIndex=roles[0].length;
  let deleting=true;
  target.textContent=roles[0]+'.';

  const tick=()=>{
    const role=roles[roleIndex];
    if(deleting){
      charIndex=Math.max(0,charIndex-1);
      target.textContent=role.slice(0,charIndex)+(charIndex?'.':'');
      if(charIndex===0){
        deleting=false;
        roleIndex=(roleIndex+1)%roles.length;
        setTimeout(tick,180);
        return;
      }
      setTimeout(tick,32);
      return;
    }
    const nextRole=roles[roleIndex];
    charIndex=Math.min(nextRole.length,charIndex+1);
    target.textContent=nextRole.slice(0,charIndex)+(charIndex===nextRole.length?'.':'');
    if(charIndex===nextRole.length){
      deleting=true;
      setTimeout(tick,900);
      return;
    }
    setTimeout(tick,52);
  };
  setTimeout(tick,900);
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

  const caseBulb=document.querySelector('.case-bulb');
  if(caseBulb && !caseBulb.dataset.flickerReady){
    caseBulb.dataset.flickerReady='true';
    const flicker=()=>{
      const glass=caseBulb.querySelector('.case-bulb-glass');
      if(!glass) return;
      glass.classList.add('is-flickering');
      setTimeout(()=>glass.classList.remove('is-flickering'),120+Math.random()*180);
      setTimeout(flicker,2800+Math.random()*5200);
    };
    setTimeout(flicker,1800+Math.random()*2600);
  }
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
    const section=deck.closest('.ai-section');
    const prev=section?.querySelector('[data-ai-prev]');
    const nextBtn=section?.querySelector('[data-ai-next]');
    const count=section?.querySelector('[data-ai-count]');
    let active=0, timer=null, hovering=false;

    const paint=()=>{
      cards.forEach((card,i)=>{
        let rel=(i-active+cards.length)%cards.length;
        if(rel>Math.floor(cards.length/2))rel-=cards.length;
        const pos=rel===0?'active':rel===-1?'left':rel===1?'right':rel===-2?'far-left':rel===2?'far-right':'hidden';
        card.dataset.position=pos;
      });
      if(count) count.textContent=`${String(active+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    };
    const go=(delta)=>{active=(active+delta+cards.length)%cards.length;paint();};
    const resetTimer=()=>{
      clearInterval(timer);
      timer=setInterval(()=>{if(!hovering && !document.body.classList.contains('modal-open'))go(1);},1000);
    };
    paint(); resetTimer();
    deck.addEventListener('mouseenter',()=>hovering=true);
    deck.addEventListener('mouseleave',()=>hovering=false);
    prev?.addEventListener('click',()=>{go(-1);resetTimer();});
    nextBtn?.addEventListener('click',()=>{go(1);resetTimer();});
    document.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft' && !document.body.classList.contains('modal-open')){go(-1);resetTimer();}
      if(e.key==='ArrowRight' && !document.body.classList.contains('modal-open')){go(1);resetTimer();}
    });

    let modal=document.querySelector('.ai-video-lightbox');
    if(!modal){
      modal=document.createElement('div');
      modal.className='ai-video-lightbox';
      modal.innerHTML=`<button class="ai-lightbox-close" type="button" aria-label="Close video">×</button><button class="ai-lightbox-prev" type="button" aria-label="Previous video">←</button><button class="ai-lightbox-next" type="button" aria-label="Next video">→</button><div class="ai-lightbox-stage"><div class="ai-lightbox-media"></div><div class="ai-lightbox-caption"></div></div>`;
      document.body.appendChild(modal);
      const close=()=>{
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        const holder=modal.querySelector('.ai-lightbox-media');
        if(holder) holder.innerHTML='';
      };
      modal.addEventListener('click',e=>{if(e.target===modal || e.target.closest('.ai-lightbox-close'))close();});
      modal.querySelector('.ai-lightbox-prev').addEventListener('click',e=>{e.stopPropagation();go(-1);openCard(cards[active]);});
      modal.querySelector('.ai-lightbox-next').addEventListener('click',e=>{e.stopPropagation();go(1);openCard(cards[active]);});
      document.addEventListener('keydown',e=>{
        if(!modal.classList.contains('open'))return;
        if(e.key==='Escape')close();
        if(e.key==='ArrowLeft'){go(-1);openCard(cards[active]);}
        if(e.key==='ArrowRight'){go(1);openCard(cards[active]);}
      });
    }

    const openCard=(card)=>{
      const frame=card.querySelector('iframe');
      const video=card.querySelector('video');
      const holder=modal.querySelector('.ai-lightbox-media');
      const caption=modal.querySelector('.ai-lightbox-caption');
      if(!holder)return;
      const isPortrait=!!card.querySelector('.ai-media-portrait');
      modal.classList.toggle('portrait',isPortrait);
      holder.innerHTML='';
      if(frame){
        const clone=document.createElement('iframe');
        clone.src=frame.src;
        clone.title=frame.title||'Portfolio video';
        clone.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';
        clone.allowFullscreen=true;
        holder.appendChild(clone);
      } else if(video){
        const clone=video.cloneNode(true);
        clone.controls=true; clone.autoplay=true; clone.muted=false; clone.loop=true; clone.playsInline=true;
        holder.appendChild(clone);
        clone.play().catch(()=>{});
      } else return;
      const title=card.querySelector('.ai-card-meta strong')?.textContent || 'AI Video';
      const category=card.querySelector('.ai-card-meta span')?.textContent || 'AI VIDEO';
      caption.innerHTML=`<span>${esc(category)}</span><strong>${esc(title)}</strong>`;
      modal.classList.add('open');
      document.body.classList.add('modal-open');
    };

    cards.forEach((card,i)=>{
      const media=card.querySelector('.ai-card-media');
      media?.addEventListener('click',e=>{
        e.preventDefault(); e.stopPropagation();
        active=i; paint(); openCard(card); resetTimer();
      });
      media?.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();active=i;paint();openCard(card);resetTimer();}
      });
      media?.setAttribute('role','button');
      media?.setAttribute('tabindex','0');
      media?.setAttribute('aria-label',`Open ${card.querySelector('.ai-card-meta strong')?.textContent||'AI video'} fullscreen`);
    });
  });
}
function setupTalkingHead(){
  document.querySelectorAll('[data-talking-stage]').forEach(stage=>{
    const cards=[...stage.querySelectorAll('.talk-card')];
    cards.forEach((card,i)=>{
      card.addEventListener('pointermove',e=>{
        if(matchMedia('(pointer:coarse)').matches)return;
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.setProperty('--rx',`${y*-3}deg`);
        card.style.setProperty('--ry',`${x*4}deg`);
      });
      card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
      const media=card.querySelector('.special-media');
      media?.setAttribute('role','button');
      media?.setAttribute('tabindex','0');
      media?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openTalkingLightbox(card);});
      media?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTalkingLightbox(card);}});
    });
  });
}

function openTalkingLightbox(card){
  let modal=document.querySelector('.talk-video-lightbox');
  if(!modal){
    modal=document.createElement('div');
    modal.className='talk-video-lightbox ai-video-lightbox';
    modal.innerHTML='<button class="ai-lightbox-close" type="button" aria-label="Close video">×</button><div class="ai-lightbox-stage"><div class="ai-lightbox-media"></div><div class="ai-lightbox-caption"></div></div>';
    document.body.appendChild(modal);
    const close=()=>{modal.classList.remove('open');document.body.classList.remove('modal-open');modal.querySelector('.ai-lightbox-media').innerHTML='';};
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.ai-lightbox-close'))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close();});
  }
  const holder=modal.querySelector('.ai-lightbox-media');
  const frame=card.querySelector('iframe');
  const video=card.querySelector('video');
  holder.innerHTML='';
  if(frame){
    const clone=document.createElement('iframe');
    clone.src=frame.src;
    clone.title=frame.title||'Talking head video';
    clone.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';
    clone.allowFullscreen=true;
    holder.appendChild(clone);
  }else if(video){
    const clone=video.cloneNode(true);clone.controls=true;clone.autoplay=true;clone.muted=false;clone.playsInline=true;holder.appendChild(clone);clone.play().catch(()=>{});
  }else return;
  const title=card.querySelector('.talk-card-meta strong')?.textContent||'Talking Head Video';
  const cat=card.querySelector('.talk-card-meta span')?.textContent||'TALKING HEAD';
  modal.querySelector('.ai-lightbox-caption').innerHTML=`<span>${esc(cat)}</span><strong>${esc(title)}</strong>`;
  modal.classList.add('open');document.body.classList.add('modal-open');
}
function setupThreeShowcase(){
  document.querySelectorAll('[data-three-stage]').forEach(stage=>{
    const cards=[...stage.querySelectorAll('.three-card')];
    if(!cards.length)return;
    const section=stage.closest('.three-showcase-section');
    const prev=section?.querySelector('[data-three-prev]');
    const next=section?.querySelector('[data-three-next]');
    const count=section?.querySelector('[data-three-count]');
    let active=Math.min(2,cards.length-1), timer=null, hover=false;

    const paint=()=>{
      cards.forEach((card,i)=>{
        let rel=i-active;
        if(rel>2)rel-=cards.length;
        if(rel<-2)rel+=cards.length;
        card.dataset.position=rel===0?'center':rel===-1?'left':rel===1?'right':rel===-2?'far-left':rel===2?'far-right':'hidden';
      });
      if(count) count.textContent=`${String(active+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    };
    const go=(delta)=>{
      if(cards.length<2)return;
      active=(active+delta+cards.length)%cards.length;
      paint();
    };
    const resetTimer=()=>{
      clearInterval(timer);
      timer=setInterval(()=>{if(!hover && !document.body.classList.contains('modal-open'))go(1);},1000);
    };

    paint();
    resetTimer();
    stage.addEventListener('mouseenter',()=>hover=true);
    stage.addEventListener('mouseleave',()=>hover=false);
    prev?.addEventListener('click',()=>{go(-1);resetTimer();});
    next?.addEventListener('click',()=>{go(1);resetTimer();});

    document.addEventListener('keydown',e=>{
      if(document.body.classList.contains('modal-open'))return;
      if(e.key==='ArrowLeft'){go(-1);resetTimer();}
      if(e.key==='ArrowRight'){go(1);resetTimer();}
    });
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
