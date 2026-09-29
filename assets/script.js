// Keep the same logo/header on every page.
(() => {
  const applyBrand = () => {
    document.querySelectorAll('a.brand').forEach((brand) => {
      brand.innerHTML = '<img class="brand-logo" src="assets/logo.webp" alt="哈雷露亞民宿 Logo"><span class="brand-title">哈雷露亞民宿</span>';
    });
    if (!document.getElementById('brandLogoStyle')) {
      const style = document.createElement('style');
      style.id = 'brandLogoStyle';
      style.textContent = `
        .site-header .nav{height:82px}
        .header-space{height:82px}
        .brand{display:flex;align-items:center;gap:12px;min-width:max-content}
        .brand-logo{width:60px;height:60px;object-fit:contain;display:block;flex:0 0 auto;filter:drop-shadow(0 2px 5px rgba(0,0,0,.18))}
        .brand-title{display:block;white-space:nowrap;font-weight:900;letter-spacing:.08em}
        @media(max-width:620px){
          .site-header .nav{height:70px}
          .header-space{height:70px}
          .brand{gap:8px}
          .brand-logo{width:52px;height:52px}
          .brand-title{font-size:15px;letter-spacing:.04em}
        }
      `;
      document.head.appendChild(style);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyBrand);
  else applyBrand();
})();

const homeHero = document.getElementById('homeHero');
if(homeHero){
  const bgs = Array.from(homeHero.querySelectorAll('.hero-bg'));
  const dotsWrap = homeHero.querySelector('.hero-dots');
  let heroIndex = 0;
  const dots = bgs.map((_,i)=>{
    const b=document.createElement('button');
    b.setAttribute('aria-label',`首頁照片 ${i+1}`);
    if(i===0) b.classList.add('active');
    b.addEventListener('click',()=>showHero(i));
    dotsWrap.appendChild(b);
    return b;
  });
  function showHero(i){
    heroIndex=(i+bgs.length)%bgs.length;
    bgs.forEach((bg,j)=>bg.classList.toggle('active',j===heroIndex));
    dots.forEach((d,j)=>d.classList.toggle('active',j===heroIndex));
  }
  setInterval(()=>showHero(heroIndex+1),5200);
}

function toggleMenu(){
  document.querySelector('.mobile-menu')?.classList.toggle('show');
}

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  const prev = carousel.querySelector('.carousel-btn.prev');
  const next = carousel.querySelector('.carousel-btn.next');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  let index = 0;
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `go to slide ${i+1}`);
    if(i===0) b.classList.add('active');
    b.addEventListener('click', ()=>go(i));
    dotsWrap.appendChild(b);
    return b;
  });
  function render(){
    track.style.transform = `translateX(-${index*100}%)`;
    dots.forEach((d, i)=>d.classList.toggle('active', i===index));
  }
  function go(i){ index = (i+slides.length)%slides.length; render(); }
  prev?.addEventListener('click', ()=>go(index-1));
  next?.addEventListener('click', ()=>go(index+1));
  let timer = setInterval(()=>go(index+1), 4500);
  carousel.addEventListener('mouseenter', ()=>clearInterval(timer));
  carousel.addEventListener('mouseleave', ()=>timer = setInterval(()=>go(index+1), 4500));
  render();
});

const inquiryForm = document.getElementById('inquiryForm');
if(inquiryForm){
  const output = document.getElementById('inquiryOutput');
  function buildMessage(){
    const fd = new FormData(inquiryForm);
    const lines = [
      '您好，我想詢問哈雷露亞民宿空房 / 訂房資訊：',
      `姓名：${fd.get('name')||''}`,
      `電話：${fd.get('phone')||''}`,
      `入住日期：${fd.get('checkin')||''}`,
      `退房日期：${fd.get('checkout')||''}`,
      `入住人數：${fd.get('guests')||''}`,
      `房間需求：${fd.get('rooms')||''}`,
      `其他需求：${fd.get('message')||''}`,
    ];
    return lines.join('\n');
  }
  function render(){ output.textContent = buildMessage(); }
  inquiryForm.addEventListener('input', render);
  inquiryForm.addEventListener('submit', (e)=>{ e.preventDefault(); render(); output.scrollIntoView({behavior:'smooth', block:'nearest'}); });
  render();
  document.getElementById('copyInquiry')?.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(buildMessage()); alert('已複製詢問內容，可直接貼到 LINE。'); }catch(e){ alert('複製失敗，請手動選取文字。'); }
  });
  document.getElementById('openLineText')?.addEventListener('click', ()=>{
    const text = encodeURIComponent(buildMessage());
    window.open(`https://line.me/R/msg/text/?${text}`, '_blank');
  });
}

document.querySelectorAll('.faq-q').forEach((btn)=>{
  btn.addEventListener('click', ()=>{
    const item=btn.closest('.faq-item');
    item.classList.toggle('open');
  });
});
