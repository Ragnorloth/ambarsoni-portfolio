const sets={
 graphics:['005','006','007','008','009','010','011','012','013','014','015','016','017','018','019','020','021','022','023','024','025','026','027','028','029','030','031','032','034','035','036','037','038','039','040','041','042','043','044','045','046','047','048','049','050','051','052','053','054','055'],
 three:['056','058','061','062','064','066','068','069','071','073','077','079','081','082','084','087','089','090','092','094','099','102','103'],
 motion:['104','105','106','107','108','109']
};
const $=s=>document.querySelector(s); const makeCard=(path,cat,num)=>`<figure class="asset" data-cat="${cat}"><img src="${path}" alt="Ambar Soni ${cat} portfolio image ${num}" loading="lazy"><figcaption><span>${num}</span><b>${cat==='3d'?'3D / Blender':cat==='motion'?'After Effects / Motion':'Graphic Design'}</b></figcaption></figure>`;
sets.graphics.forEach(n=>$('#graphicsGrid').insertAdjacentHTML('beforeend',makeCard(`assets/graphics/${n}.webp`,'graphics',n)));
sets.three.forEach(n=>$('#threeGrid').insertAdjacentHTML('beforeend',makeCard(`assets/3d/${n}.webp`,'3d',n)));
sets.motion.forEach(n=>$('#motionGrid').insertAdjacentHTML('beforeend',makeCard(`assets/motion/${n}.webp`,'motion',n)));
const all=[...sets.graphics.map(n=>['graphics',n]),...sets.three.map(n=>['3d',n]),...sets.motion.map(n=>['motion',n])];
all.forEach(([cat,n])=>$('#archiveGrid').insertAdjacentHTML('beforeend',makeCard(`assets/${cat}/${n}.webp`,cat,n)));
document.querySelectorAll('.archive-controls button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.archive-controls button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const v=b.dataset.show;document.querySelectorAll('#archiveGrid .asset').forEach(x=>x.style.display=v==='all'?'':x.dataset.cat===v?'':'none')}));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});document.querySelectorAll('.film,.asset,.cap,.about h2,.contact h2').forEach(e=>{e.classList.add('reveal');io.observe(e)});
