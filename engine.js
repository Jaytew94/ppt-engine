/* ══════════════════════════════════════════════════
   PPT ENGINE — Core JavaScript
   Host on GitHub Pages. Never regenerate — update here, all PPTs benefit.
   Version: v3.1
   ══════════════════════════════════════════════════ */

// ── SCALE TO FIT ──
function scaleToFit(){
  const el=document.getElementById('scaler');
  const container=el.parentElement;
  const availW=(container&&container!==document.body)?container.clientWidth:window.innerWidth;
  const availH=(container&&container!==document.body)?container.clientHeight:window.innerHeight;
  if(!availW||!availH)return;
  const scale=Math.min(availW/1920,availH/1080);
  el.style.transform=`scale(${scale})`;
  el.style.marginLeft=Math.max(0,(availW-1920*scale)/2)+'px';
  el.style.marginTop=Math.max(0,(availH-1080*scale)/2)+'px';
}
window.addEventListener('resize',scaleToFit);
window.addEventListener('orientationchange',scaleToFit);
document.fonts.ready.then(()=>setTimeout(scaleToFit,50));
setTimeout(scaleToFit,100);
scaleToFit();

// ── ENGINE STATE ──
const slides=document.querySelectorAll('.slide');
const total=slides.length;
let cur=0,animating=false,editMode=false,presentMode=false;

// Nav dots
const dotsEl=document.getElementById('navDots');
slides.forEach((_,i)=>{
  const d=document.createElement('div');
  d.className='nav-dot'+(i===0?' active':'');
  d.onclick=()=>goTo(i);
  dotsEl.appendChild(d);
});

function goTo(i){
  if(animating||i===cur||i<0||i>=total)return;
  animating=true;
  const old=slides[cur],nw=slides[i],dir=i>cur?1:-1;
  resetAnims(old);
  gsap.set(nw,{zIndex:15,x:dir*80,opacity:0});
  nw.classList.add('active');
  gsap.to(old,{opacity:0,x:dir*-60,duration:.4,ease:'power2.in',
    onComplete:()=>{old.classList.remove('active');gsap.set(old,{x:0,zIndex:0});}});
  gsap.to(nw,{opacity:1,x:0,duration:.5,ease:'power3.out',
    onComplete:()=>{animating=false;gsap.set(nw,{zIndex:10});}});
  setTimeout(()=>triggerAnim(nw),180);
  cur=i;updateUI();
}
function next(){goTo(cur+1);}
function prev(){goTo(cur-1);}

function resetAnims(s){
  gsap.set(s.querySelectorAll('.animate'),{opacity:0,y:55,x:0,skewY:0,scale:1});
  gsap.set(s.querySelectorAll('.hero-title,.closing-title'),{opacity:0,y:100,skewY:0});
  gsap.set(s.querySelectorAll('.chapter-word'),{opacity:0,scale:0.82});
  gsap.set(s.querySelectorAll('.chapter-line'),{width:0});
  gsap.set(s.querySelectorAll('.timeline-line-h'),{width:0});
}

function updateUI(){
  document.getElementById('progressBar').style.width=((cur+1)/total*100)+'%';
  document.getElementById('slideCounter').textContent=`${cur+1} / ${total}`;
  document.querySelectorAll('.nav-dot').forEach((d,i)=>{
    const a=i===cur;
    d.classList.toggle('active',a);
    d.style.width=a?'22px':'7px';
    d.style.borderRadius=a?'4px':'50%';
    d.style.background=a?'var(--color-primary)':'rgba(255,255,255,0.3)';
  });
}

function triggerAnim(slide){
  const type=slide.dataset.animation||'stagger';
  if(type==='stagger')
    gsap.fromTo(slide.querySelectorAll('.animate'),
      {opacity:0,y:55},{opacity:1,y:0,duration:.75,stagger:.13,ease:'power3.out'});
  if(type==='cinematic'){
    const t=slide.querySelector('.hero-title,.closing-title');
    if(t)gsap.fromTo(t,{opacity:0,y:100,skewY:4},
      {opacity:1,y:0,skewY:0,duration:1.1,ease:'expo.out'});
    gsap.fromTo(slide.querySelectorAll('.animate:not(.hero-title):not(.closing-title)'),
      {opacity:0,y:28},{opacity:1,y:0,duration:.8,stagger:.1,delay:.45,ease:'power3.out'});
  }
  if(type==='chapter'){
    gsap.fromTo(slide.querySelector('.chapter-word'),
      {opacity:0,scale:.82},{opacity:1,scale:1,duration:1,ease:'back.out(1.7)'});
    gsap.to(slide.querySelector('.chapter-line'),
      {width:140,duration:.9,delay:.55,ease:'power4.out'});
    gsap.fromTo(slide.querySelectorAll('.animate'),
      {opacity:0,y:-20},{opacity:1,y:0,duration:.6,stagger:.1,delay:.2,ease:'power2.out'});
  }
  if(type==='counter'){
    gsap.fromTo(slide.querySelectorAll('.animate'),
      {opacity:0,y:40},{opacity:1,y:0,duration:.75,stagger:.1,ease:'power3.out'});
    slide.querySelectorAll('.counter').forEach(el=>
      anime({targets:el,innerHTML:[0,+el.dataset.target],round:1,
        duration:2200,easing:'easeOutExpo',delay:350}));
  }
  if(type==='timeline'){
    gsap.to(slide.querySelector('.timeline-line-h'),
      {width:'100%',duration:1.2,ease:'power3.out'});
    gsap.fromTo(slide.querySelectorAll('.t-node'),
      {opacity:0,y:30},{opacity:1,y:0,stagger:.18,delay:.8,duration:.6,ease:'power3.out'});
  }
  if(type==='process')
    gsap.fromTo(slide.querySelectorAll('.process-step'),
      {opacity:0,x:40},{opacity:1,x:0,stagger:.2,duration:.7,ease:'power3.out'});
  if(type==='wipe')
    slide.querySelectorAll('.animate').forEach((el,i)=>
      gsap.fromTo(el,{clipPath:'inset(0 100% 0 0)'},
        {clipPath:'inset(0 0% 0 0)',duration:.9,delay:i*.15,ease:'power4.inOut'}));
}

// ── KEYBOARD + REMOTE CONTROL ──
document.body.setAttribute('tabindex','0');
document.body.focus();
document.addEventListener('keydown',e=>{
  if(['ArrowRight','ArrowDown',' ','PageDown'].includes(e.key)){e.preventDefault();next();}
  if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();prev();}
  if(e.key==='F5'||e.key==='f'||e.key==='F'){e.preventDefault();startPresent();}
  if(e.key==='Escape')exitPresent();
  if((e.key==='e'||e.key==='E')&&!presentMode){e.preventDefault();toggleEdit();}
  if(e.key==='MediaNextTrack'||e.key==='MediaTrackNext')next();
  if(e.key==='MediaPreviousTrack'||e.key==='MediaTrackPrevious')prev();
  if(e.key==='b'||e.key==='B'){
    const s=document.getElementById('scaler');
    s.style.visibility=s.style.visibility==='hidden'?'visible':'hidden';
  }
});
document.body.addEventListener('click',()=>{if(!editMode)document.body.focus();});
let tx=0;
document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;},{passive:true});
document.addEventListener('touchend',e=>{
  const dx=tx-e.changedTouches[0].clientX;
  if(Math.abs(dx)>50){dx>0?next():prev();}
},{passive:true});

// ── SAFETY: auto-create UI chrome if AI forgot ──
(function ensureUIChrome(){
  if(!document.getElementById('uiChrome')){
    const chrome=document.createElement('div');
    chrome.className='ui-chrome';chrome.id='uiChrome';
    chrome.innerHTML=`
      <button class="ui-btn btn-edit" id="editBtn" onclick="toggleEdit()">✏️ 编辑</button>
      <button class="ui-btn btn-save" id="saveBtn" onclick="saveHTML()" style="display:none;">💾 保存HTML</button>
      <button class="ui-btn btn-pdf" id="pdfBtn" onclick="exportPDF()">📄 导出PDF</button>
      <button class="ui-btn btn-pptx" id="pptxBtn" onclick="exportPPTX()">📊 导出PPTX</button>
      <button class="ui-btn btn-present" onclick="startPresent()">▶ 演示</button>`;
    document.body.appendChild(chrome);
  } else if(!document.getElementById('saveBtn')){
    // Add save button to existing chrome if missing
    const saveBtn=document.createElement('button');
    saveBtn.className='ui-btn btn-save';saveBtn.id='saveBtn';
    saveBtn.textContent='💾 保存HTML';saveBtn.onclick=saveHTML;
    saveBtn.style.display='none';
    const editBtn=document.getElementById('editBtn');
    editBtn.parentNode.insertBefore(saveBtn,editBtn.nextSibling);
  }
  document.body.classList.remove('present-mode');
})();

// ── THREE MODES ──
function toggleEdit(){
  if(presentMode)return;
  editMode=!editMode;
  document.body.classList.toggle('edit-mode',editMode);
  const btn=document.getElementById('editBtn');
  const saveBtn=document.getElementById('saveBtn');
  if(btn)btn.textContent=editMode?'✅ 完成':'✏️ 编辑';
  if(saveBtn)saveBtn.style.display=editMode?'':'none';
  // Expanded: all text-bearing elements become editable
  document.querySelectorAll([
    'h1','h2','h3','h4','h5','h6','p','li',
    '.eyebrow','.chapter-word','.statement-text','.closing-title',
    '.data-number','.data-label','.col-num',
    '.presenter-name','.presenter-title','.presenter-brand',
    '.process-title','.t-title','.t-year','.t-desc'
  ].join(','))
    .forEach(el=>el.contentEditable=editMode?'true':'false');
  if(editMode){
    document.querySelectorAll('.counter').forEach(el=>el.title='点击编辑数值');
    initDragMode();
  } else {
    destroyDragMode();
  }
}
function startPresent(){
  if(editMode)toggleEdit();
  presentMode=true;
  document.body.classList.add('present-mode');
  document.body.focus();
  const el=document.documentElement;
  if(el.requestFullscreen)el.requestFullscreen().catch(()=>{});
  else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();
}
function exitPresent(){
  presentMode=false;
  document.body.classList.remove('present-mode');
  if(document.exitFullscreen)document.exitFullscreen().catch(()=>{});
  else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
}
document.addEventListener('fullscreenchange',()=>{
  if(!document.fullscreenElement)exitPresent();
});

// ── LOAD EXTERNAL SCRIPT ──
function loadScript(src){
  return new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)){resolve();return;}
    const s=document.createElement('script');
    s.src=src;s.onload=resolve;s.onerror=reject;
    document.head.appendChild(s);
  });
}

// ── SHARED SLIDE CAPTURE (PDF + PPTX) ──
async function captureAllSlides(onProgress){
  const scaler=document.getElementById('scaler');
  const allSlides=document.querySelectorAll('.slide');
  const savedTransform=scaler.style.transform;
  const savedML=scaler.style.marginLeft;
  const savedMT=scaler.style.marginTop;
  scaler.style.transform='scale(1)';
  scaler.style.marginLeft='0';
  scaler.style.marginTop='0';

  const images=[];
  for(let i=0;i<allSlides.length;i++){
    if(onProgress)onProgress(i,allSlides.length);
    allSlides.forEach(s=>{s.style.opacity='0';s.style.zIndex='0';});
    allSlides[i].style.opacity='1';
    allSlides[i].style.zIndex='10';
    allSlides[i].querySelectorAll('.animate,.hero-title,.closing-title,.chapter-word')
      .forEach(el=>{el.style.opacity='1';el.style.transform='none';el.style.clipPath='none';});
    // Wait for Unsplash async images to finish loading before screenshot
    await Promise.all(
      [...allSlides[i].querySelectorAll('img')]
        .filter(img=>!img.complete)
        .map(img=>new Promise(r=>{img.onload=r;img.onerror=r;}))
    );
    await new Promise(r=>setTimeout(r,800)); // extra buffer for fonts + render
    const canvas=await html2canvas(scaler,{
      width:1920,height:1080,scale:1,
      useCORS:true,allowTaint:true,
      backgroundColor:'#000000',
      logging:false,x:0,y:0,scrollX:0,scrollY:0
    });
    images.push(canvas.toDataURL('image/jpeg',0.93));
  }

  scaler.style.transform=savedTransform;
  scaler.style.marginLeft=savedML;
  scaler.style.marginTop=savedMT;
  allSlides.forEach(s=>{
    s.style.opacity='';s.style.zIndex='';
    s.querySelectorAll('.animate,.hero-title,.closing-title,.chapter-word')
      .forEach(el=>{el.style.opacity='';el.style.transform='';el.style.clipPath='';});
  });
  return images;
}

// ── PDF EXPORT ──
async function exportPDF(){
  const savedCur=cur;
  const overlay=document.getElementById('pdfOverlay');
  const statusText=document.getElementById('pdfStatusText');
  const progressFill=document.getElementById('pdfProgressFill');
  try{
    const b=document.getElementById('pdfBtn');if(b)b.textContent='⏳ 加载中...';
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    overlay.classList.add('show');
    document.body.classList.add('present-mode');
    const images=await captureAllSlides((i,total)=>{
      progressFill.style.width=Math.round((i/total)*100)+'%';
      statusText.textContent=`正在截图第 ${i+1} / ${total} 页...`;
    });
    progressFill.style.width='100%';
    statusText.textContent='✅ 正在生成文件...';
    await new Promise(r=>setTimeout(r,300));
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'px',format:[1920,1080]});
    images.forEach((img,i)=>{
      if(i>0)pdf.addPage([1920,1080],'landscape');
      pdf.addImage(img,'JPEG',0,0,1920,1080);
    });
    pdf.save(`${document.title||'presentation'}.pdf`);
  }catch(err){
    console.error('PDF export error:',err);
    alert('PDF生成失败：'+err.message);
  }finally{
    overlay.classList.remove('show');
    document.body.classList.remove('present-mode');
    const b=document.getElementById('pdfBtn');if(b)b.textContent='📄 导出PDF';
    goTo(savedCur);updateUI();
  }
}

// ── PPTX EXPORT ──
async function exportPPTX(){
  const savedCur=cur;
  const overlay=document.getElementById('pdfOverlay');
  const statusText=document.getElementById('pdfStatusText');
  const progressFill=document.getElementById('pdfProgressFill');
  try{
    const b=document.getElementById('pptxBtn');if(b)b.textContent='⏳ 加载中...';
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js');
    overlay.classList.add('show');
    document.body.classList.add('present-mode');
    const images=await captureAllSlides((i,total)=>{
      progressFill.style.width=Math.round((i/total)*100)+'%';
      statusText.textContent=`正在截图第 ${i+1} / ${total} 页...`;
    });
    progressFill.style.width='98%';
    statusText.textContent='✅ 正在生成PPTX...';
    await new Promise(r=>setTimeout(r,200));
    const pptx=new PptxGenJS();
    pptx.layout='LAYOUT_WIDE';
    pptx.title=document.title||'Presentation';
    images.forEach(imgData=>{
      const slide=pptx.addSlide();
      slide.addImage({data:imgData,x:0,y:0,w:'100%',h:'100%'});
    });
    await pptx.writeFile({fileName:`${document.title||'presentation'}.pptx`});
  }catch(err){
    console.error('PPTX export error:',err);
    alert('PPTX生成失败：'+err.message);
  }finally{
    overlay.classList.remove('show');
    document.body.classList.remove('present-mode');
    const b=document.getElementById('pptxBtn');if(b)b.textContent='📊 导出PPTX';
    goTo(savedCur);updateUI();
  }
}

// ── GLOBAL IMAGE REPLACEMENT ──
function initEditableImages(){
  let globalImgInput=document.getElementById('_globalImgInput');
  if(!globalImgInput){
    globalImgInput=document.createElement('input');
    globalImgInput.type='file';globalImgInput.accept='image/*';
    globalImgInput.id='_globalImgInput';globalImgInput.style.display='none';
    document.body.appendChild(globalImgInput);
  }
  let targetImg=null;
  document.querySelectorAll('.scaler img').forEach(img=>{
    img.addEventListener('click',e=>{
      if(!editMode)return;
      e.stopPropagation();targetImg=img;
      globalImgInput.value='';globalImgInput.click();
    });
    img.addEventListener('contextmenu',e=>{
      if(!editMode)return;
      e.preventDefault();
      if(img.dataset.originalSrc&&img.dataset.replaced==='true'){
        if(confirm('恢复原始图片？')){
          gsap.to(img,{opacity:0,duration:.2,onComplete:()=>{
            img.src=img.dataset.originalSrc;
            img.dataset.replaced='false';
            gsap.to(img,{opacity:1,duration:.3});
          }});
        }
      }
    });
  });
  globalImgInput.addEventListener('change',e=>{
    const file=e.target.files[0];
    if(!file||!targetImg)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      if(!targetImg.dataset.originalSrc)targetImg.dataset.originalSrc=targetImg.src;
      gsap.to(targetImg,{opacity:0,scale:.95,duration:.25,ease:'power2.in',
        onComplete:()=>{
          targetImg.src=ev.target.result;targetImg.dataset.replaced='true';
          gsap.fromTo(targetImg,{opacity:0,scale:.95},{opacity:1,scale:1,duration:.35,ease:'power3.out'});
        }});
    };
    reader.readAsDataURL(file);
  });
}

// ── EDITABLE COUNTERS + PROGRESS BARS ──
function initEditableCounters(){
  document.querySelectorAll('.counter').forEach(el=>{
    el.classList.add('data-editable');
    el.style.position='relative';
    el.addEventListener('click',()=>{
      if(!editMode)return;
      const newVal=prompt('输入新数值：',el.dataset.target||el.textContent);
      if(newVal===null)return;
      const val=parseFloat(newVal.replace(/[^0-9.]/g,''));
      if(isNaN(val))return;
      el.dataset.target=val;
      anime.remove(el);
      anime({targets:el,innerHTML:[0,val],round:1,duration:1800,easing:'easeOutExpo'});
    });
  });
}
function initEditableProgressBars(){
  document.querySelectorAll('.progress-track').forEach(track=>{
    const fill=track.querySelector('.progress-fill');
    const label=track.parentElement?.querySelector('.progress-label');
    if(!fill)return;
    track.addEventListener('click',()=>{
      if(!editMode)return;
      const newPct=prompt('输入百分比（0-100）：',fill.dataset.value||'50');
      if(newPct===null)return;
      const val=Math.min(100,Math.max(0,parseFloat(newPct)));
      if(isNaN(val))return;
      fill.dataset.value=val;
      gsap.to(fill,{width:val+'%',duration:.9,ease:'power3.out'});
      if(label)anime({targets:{v:parseFloat(label.textContent)||0},v:val,round:1,
        duration:900,easing:'easeOutExpo',
        update:a=>label.textContent=Math.round(a.animations[0].currentValue)+'%'});
    });
  });
}

// ── IMG ZONE UPLOAD ──
document.querySelectorAll('.img-zone').forEach(zone=>{
  let inp=zone.querySelector('input[type=file]');
  if(!inp){inp=document.createElement('input');inp.type='file';
    inp.accept='image/*';zone.appendChild(inp);}
  let del=zone.querySelector('.img-delete');
  if(!del){del=document.createElement('button');del.className='img-delete';
    del.innerHTML='✕';zone.appendChild(del);}
  inp.addEventListener('change',e=>{
    const file=e.target.files[0];if(!file)return;
    const r=new FileReader();
    r.onload=ev=>{
      let img=zone.querySelector('img');
      if(!img){img=document.createElement('img');zone.insertBefore(img,zone.firstChild);}
      img.src=ev.target.result;
    };
    r.readAsDataURL(file);
  });
  del.addEventListener('click',e=>{
    e.stopPropagation();
    const img=zone.querySelector('img');
    const def=zone.dataset.defaultSrc;
    if(img&&def)img.src=def;else if(img)img.remove();
    inp.value='';
  });
});

// ── IP CHARACTER UPLOAD ──
(function(){
  const char=document.getElementById('ipCharacter');
  if(!char)return;
  const inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';inp.style.display='none';
  document.body.appendChild(inp);
  char.addEventListener('click',()=>inp.click());
  inp.addEventListener('change',e=>{
    const file=e.target.files[0];if(!file)return;
    const r=new FileReader();
    r.onload=ev=>{
      char.style.display='block';
      let img=char.querySelector('img');
      if(!img){img=document.createElement('img');
        img.style.cssText='width:100%;height:100%;object-fit:contain;';
        char.appendChild(img);}
      img.src=ev.target.result;
      gsap.to(char,{y:-12,duration:2.5,yoyo:true,repeat:-1,ease:'sine.inOut'});
    };
    r.readAsDataURL(file);
  });
})();

// ── AMBIENT ──
function buildAmbient(){
  const layer=document.getElementById('ambientLayer');
  if(total>40){buildAmbientCSS(layer);return;}
  if(typeof buildAmbientTheme==='function'){buildAmbientTheme(layer);return;}
  buildAmbientDefault(layer);
}
function buildAmbientDefault(layer){
  [{col:'var(--color-primary)',size:400,pos:'top:-80px;left:-80px'},
   {col:'var(--color-accent)',size:350,pos:'bottom:-70px;right:-70px'}
  ].forEach((o,i)=>{
    const orb=document.createElement('div');
    orb.style.cssText=`position:absolute;border-radius:50%;width:${o.size}px;height:${o.size}px;background:${o.col};filter:blur(100px);opacity:.13;pointer-events:none;${o.pos}`;
    layer.appendChild(orb);
    gsap.to(orb,{x:'random(-80,80)',y:'random(-80,80)',
      duration:'random(10,16)',repeat:-1,yoyo:true,ease:'sine.inOut',delay:i*3});
  });
  const grid=document.createElement('div');
  grid.style.cssText=`position:absolute;inset:0;opacity:.04;pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px);
    background-size:80px 80px;`;
  layer.appendChild(grid);
  gsap.to(grid,{opacity:.08,duration:4,yoyo:true,repeat:-1,ease:'sine.inOut'});
}
function buildAmbientCSS(layer){
  layer.innerHTML=`
    <div style="position:absolute;width:500px;height:500px;border-radius:50%;background:var(--color-primary);filter:blur(120px);opacity:.12;top:-80px;left:-80px;animation:_af1 14s ease-in-out infinite alternate;pointer-events:none;"></div>
    <div style="position:absolute;width:400px;height:400px;border-radius:50%;background:var(--color-accent);filter:blur(100px);opacity:.10;bottom:-60px;right:-60px;animation:_af2 18s ease-in-out infinite alternate;pointer-events:none;"></div>
    <style>@keyframes _af1{from{transform:translate(0,0)}to{transform:translate(100px,70px)}}@keyframes _af2{from{transform:translate(0,0)}to{transform:translate(-80px,-60px)}}</style>`;
}

// ── EMPTY SLIDE GUARD ──
function validateSlides(){
  document.querySelectorAll('.slide').forEach((s,i)=>{
    if(s.innerText.trim().length<5)
      console.warn(`⚠️ Slide ${i+1} appears empty`);
  });
}

// ── UNSPLASH IMAGE LOADER ──
// Reads window.UNSPLASH_KEY injected by AI from ppt-brief USER CONFIG
// All <img data-topic="keyword"> tags are auto-fetched at page load
// Fallback: gradient background (always visible instantly, never broken)
async function initUnsplashImages(){
  const key=window.UNSPLASH_KEY;
  const imgs=document.querySelectorAll('img[data-topic]');
  if(!imgs.length)return;
  if(!key||key.includes('READ FROM')||key.length<10){
    // No valid key — gradient fallback already showing via inline style, done
    return;
  }
  const fetched={};
  await Promise.all([...imgs].map(async img=>{
    const topic=img.dataset.topic||'abstract';
    try{
      // Reuse same fetch result for identical keywords (saves API quota)
      if(!fetched[topic]){
        const res=await fetch(
          `https://api.unsplash.com/photos/random?query=${encodeURIComponent(topic)}&orientation=landscape&client_id=${key}`,
          {headers:{'Accept-Version':'v1'}}
        );
        if(!res.ok)throw new Error(res.status);
        fetched[topic]=await res.json();
      }
      const data=fetched[topic];
      // Fade in the real image over the gradient background
      const tempImg=new Image();
      tempImg.crossOrigin='anonymous';
      tempImg.onload=()=>{
        img.src=tempImg.src;
        img.style.background='none';
        img.title=`Photo by ${data.user.name} on Unsplash`;
      };
      tempImg.onerror=()=>{}; // keep gradient fallback
      tempImg.src=data.urls.regular; // 1080px wide, high quality
    }catch(e){
      // Network error or quota exceeded — gradient fallback stays, no broken img
    }
  }));
}

// ── DRAG FREE LAYOUT ──
// Uses interact.js for drag. Positions stored as data-drag-x/y (px in 1920×1080 space).
// Uses position:relative + top/left so GSAP transform-based animations don't conflict.

function getScaleValue(){
  const t=document.getElementById('scaler').style.transform;
  const m=t.match(/scale\(([\d.]+)\)/);
  return m?parseFloat(m[1]):1;
}

function restoreDragPositions(slide){
  // Re-apply saved drag offsets (top/left survive GSAP, but call after resetAnims just in case)
  const scope=slide||document;
  scope.querySelectorAll('.ppt-draggable[data-drag-x]').forEach(el=>{
    el.style.position='relative';
    el.style.left=parseFloat(el.dataset.dragX||0)+'px';
    el.style.top=parseFloat(el.dataset.dragY||0)+'px';
  });
}

async function initDragMode(){
  await loadScript('https://cdn.jsdelivr.net/npm/interactjs@1.10.27/dist/interact.min.js');
  const SKIP=['span','a','strong','em','i','b','br','small'];
  document.querySelectorAll('.slide .animate').forEach(el=>{
    if(SKIP.includes(el.tagName.toLowerCase()))return;
    if(el.closest('.ppt-drag-handle'))return;
    el.classList.add('ppt-draggable');
    el.style.position='relative';
    // Restore any previously saved drag position
    el.style.left=parseFloat(el.dataset.dragX||0)+'px';
    el.style.top=parseFloat(el.dataset.dragY||0)+'px';
    // Add drag handle if not present
    if(!el.querySelector('.ppt-drag-handle')){
      const h=document.createElement('div');
      h.className='ppt-drag-handle';
      h.innerHTML='⠿⠿';
      h.title='拖拽移动';
      el.appendChild(h);
    }
    // Init interact drag (allowFrom handle so text is still editable)
    interact(el).draggable({
      allowFrom:'.ppt-drag-handle',
      listeners:{
        move(e){
          const s=getScaleValue()||1;
          const nx=parseFloat(e.target.dataset.dragX||0)+e.dx/s;
          const ny=parseFloat(e.target.dataset.dragY||0)+e.dy/s;
          e.target.dataset.dragX=nx;
          e.target.dataset.dragY=ny;
          e.target.style.left=nx+'px';
          e.target.style.top=ny+'px';
        },
        start(e){e.target.classList.add('is-dragging');},
        end(e){e.target.classList.remove('is-dragging');}
      }
    });
  });
}

function destroyDragMode(){
  document.querySelectorAll('.ppt-draggable').forEach(el=>{
    try{if(window.interact)interact(el).unset();}catch(e){}
    el.classList.remove('ppt-draggable','is-dragging');
    el.querySelectorAll('.ppt-drag-handle').forEach(h=>h.remove());
    // Keep position:relative and left/top so positions survive
  });
}

// ── SAVE HTML (bakes current state into downloadable file) ──
function saveHTML(){
  const clone=document.documentElement.cloneNode(true);
  // Remove file inputs (unserializable)
  clone.querySelectorAll('input[type=file]').forEach(el=>el.remove());
  // Remove drag handles
  clone.querySelectorAll('.ppt-drag-handle').forEach(el=>el.remove());
  // Clean drag classes
  clone.querySelectorAll('.ppt-draggable').forEach(el=>el.classList.remove('ppt-draggable'));
  clone.querySelectorAll('.is-dragging').forEach(el=>el.classList.remove('is-dragging'));
  // Clean edit/present mode classes
  const body=clone.querySelector('body');
  if(body)body.classList.remove('edit-mode','present-mode');
  // Reset to first slide active; make all .animate elements visible
  clone.querySelectorAll('.slide').forEach((s,i)=>{
    s.classList.toggle('active',i===0);
    s.style.opacity=i===0?'1':'0';
    s.style.zIndex=i===0?'10':'0';
    s.querySelectorAll('.animate,.hero-title,.closing-title,.chapter-word')
      .forEach(el=>{el.style.opacity='1';el.style.transform='';el.style.clipPath='';});
  });
  // Restore edit button label
  const editBtn=clone.getElementById('editBtn');
  if(editBtn)editBtn.textContent='✏️ 编辑';
  const saveBtn=clone.getElementById('saveBtn');
  if(saveBtn)saveBtn.style.display='none';
  const html='<!DOCTYPE html>\n'+clone.outerHTML;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=(document.title||'presentation')+'-saved.html';
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── INIT ──
buildAmbient();
updateUI();
validateSlides();
initEditableImages();
initEditableCounters();
initEditableProgressBars();
initUnsplashImages(); // async — loads Unsplash images after page is interactive
document.fonts.ready.then(()=>setTimeout(()=>triggerAnim(slides[0]),100));
