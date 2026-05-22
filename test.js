
// Preloader
window.addEventListener('load',()=>{setTimeout(()=>document.getElementById('preloader').classList.add('done'),2000)});

// Cursor
const dot=document.getElementById('cursorDot'),ring=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
(function ac(){if(dot&&ring){dot.style.left=mx+'px';dot.style.top=my+'px';rx+=(mx-rx)*.15;ry+=(my-ry)*.15;ring.style.left=rx+'px';ring.style.top=ry+'px'}requestAnimationFrame(ac)})();
document.querySelectorAll('a,button,.feature-card,.repo-card,.tech-card,.privacy-item').forEach(el=>{
  el.addEventListener('mouseenter',()=>{if(ring){ring.style.width='52px';ring.style.height='52px';ring.style.borderColor='rgba(255,255,255,.9)'}if(dot){dot.style.background='#FFF'}});
  el.addEventListener('mouseleave',()=>{if(ring){ring.style.width='36px';ring.style.height='36px';ring.style.borderColor='rgba(14,165,233,.5)'}if(dot){dot.style.background='#0EA5E9'}});
});

// Scroll Progress
const pb=document.getElementById('scroll-progress');
window.addEventListener('scroll',()=>{pb.style.width=(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100)+'%'});

// Nav
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',window.scrollY>50)});

// Mobile
const hb=document.getElementById('hamburger'),mm=document.getElementById('mobileMenu');
hb.addEventListener('click',()=>mm.classList.toggle('open'));
function closeMobile(){mm.classList.remove('open')}


// Reveal
const ro=new IntersectionObserver(es=>{es.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*100);ro.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal, [class*="reveal-"]').forEach(el=>ro.observe(el));

// Premium Hero Parallax Scroll
const heroContent = document.querySelector('.hero-content');
const heroVisuals = document.querySelectorAll('.hero-orb, .float-card');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if(y < window.innerHeight) {
    if(heroContent) {
      heroContent.style.transform = `translateY(${y * 0.3}px) scale(${1 - y*0.0003})`;
      heroContent.style.opacity = 1 - (y * 0.0015);
    }
    heroVisuals.forEach((el, i) => {
      let speed = i % 2 === 0 ? 0.2 : -0.15;
      el.style.transform = `translateY(${y * speed}px)`;
    });
  }
});

// Counter
const co=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const el=e.target,t=parseInt(el.dataset.target),sfx=el.dataset.suffix!==undefined?el.dataset.suffix:'+';if(t===0){el.textContent='0';co.unobserve(el);return}let c=0;const s=Math.max(1,Math.ceil(t/60)),tm=setInterval(()=>{c+=s;if(c>=t){c=t;clearInterval(tm)}el.textContent=c+sfx},25);co.unobserve(el)}})},{threshold:.5});
document.querySelectorAll('.stat-num').forEach(el=>co.observe(el));

// Canvas Particles
const cv=document.getElementById('hero-canvas'),cx=cv.getContext('2d');let pts=[];
function rz(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight}rz();window.addEventListener('resize',rz);
class P{constructor(){this.x=Math.random()*cv.width;this.y=Math.random()*cv.height;this.s=Math.random()*2+.5;this.sx=(Math.random()-.5)*.4;this.sy=(Math.random()-.5)*.4;this.o=Math.random()*.5+.1}update(){this.x+=this.sx;this.y+=this.sy;if(this.x>cv.width)this.x=0;if(this.x<0)this.x=cv.width;if(this.y>cv.height)this.y=0;if(this.y<0)this.y=cv.height}draw(){cx.beginPath();cx.arc(this.x,this.y,this.s,0,Math.PI*2);cx.fillStyle=`rgba(14,165,233,${this.o})`;cx.fill()}}
function ip(){const n=Math.min(80,Math.floor(cv.width*cv.height/12000));pts=[];for(let i=0;i<n;i++)pts.push(new P)}ip();
function dl(){for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<140){cx.beginPath();cx.moveTo(pts[i].x,pts[i].y);cx.lineTo(pts[j].x,pts[j].y);cx.strokeStyle=`rgba(14,165,233,${.06*(1-d/140)})`;cx.lineWidth=.5;cx.stroke()}}}
function ap(){cx.clearRect(0,0,cv.width,cv.height);pts.forEach(p=>{p.update();p.draw()});dl();requestAnimationFrame(ap)}ap();

// Load Dynamic Data
async function loadDynamicData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Failed to load API data');
    const data = await res.json();
    
    // Update text
    document.getElementById('dynamic-hero-tag').innerHTML = '<span class="pulse-dot"></span>' + data.hero.tag;
    document.getElementById('dynamic-hero-h1-white').textContent = data.hero.h1_white;
    document.getElementById('dynamic-hero-h1-grad').textContent = data.hero.h1_gradient;
    document.getElementById('dynamic-hero-p').textContent = data.hero.p;
    
    document.getElementById('dynamic-about-p1').textContent = data.about.p1;
    document.getElementById('dynamic-about-p2').textContent = data.about.p2;

    // Load Projects
    const grid = document.getElementById('reposGrid');
    if (data.projects && data.projects.length > 0) {
      grid.innerHTML = data.projects.map(r => `
        <div class="repo-card reveal visible">
          <h3>📁 ${r.name}</h3>
          <p>${r.description}</p>
          <div class="repo-meta">
            <span><span class="repo-lang" style="background:${r.color || '#0EA5E9'}"></span> ${r.lang}</span>
          </div>
          <a href="${r.url}" target="_blank" rel="noopener" class="repo-link">View Source →</a>
        </div>
      `).join('');
    } else {
      grid.innerHTML = '<p>No projects found.</p>';
    }
  } catch(e) {
    console.error(e);
  }
}
loadDynamicData();

// Contact
function handleReviewSubmit(e){
  e.preventDefault();
  const btn=e.target.querySelector('button[type="submit"]');
  const og=btn.innerHTML;
  btn.innerHTML='✓ Review Submitted!';btn.style.background='linear-gradient(135deg,#10B981,#10B981)';
  setTimeout(()=>{btn.innerHTML=og;btn.style.background='';e.target.reset()},3000);
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'});closeMobile()}
  });
});

