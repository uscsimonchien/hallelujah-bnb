(() => {
  const s = document.createElement('script');
  s.src = 'assets/bathhouse-photo.js?v=20261001-2344';
  document.head.appendChild(s);
})();

// Keep the same logo/header and booking label on every page.
(() => {
  const applyHeader = () => {
    document.querySelectorAll('a.brand').forEach((brand) => {
      brand.innerHTML = '<img class="brand-logo" src="assets/logo.webp" alt="哈雷露亞民宿 Logo"><span class="brand-title">哈雷露亞民宿</span>';
    });
    document.querySelectorAll('a[href="inquiry.html"]').forEach((link) => {
      if (link.closest('.nav-links') || link.closest('.mobile-menu')) link.textContent = '線上預訂';
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyHeader);
  else applyHeader();
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

document.querySelectorAll('[data-carousel], [data-activity-carousel]').forEach((carousel) => {
  if (carousel.dataset.carouselReady === '1') return;
  carousel.dataset.carouselReady = '1';
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  const prev = carousel.querySelector('.carousel-btn.prev');
  const next = carousel.querySelector('.carousel-btn.next');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  if (!track || !slides.length) return;
  let index = 0;
  if (dotsWrap) dotsWrap.innerHTML = '';
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `切換到第 ${i+1} 張照片`);
    if(i===0) b.classList.add('active');
    b.addEventListener('click', ()=>go(i));
    dotsWrap?.appendChild(b);
    return b;
  });
  function render(){
    track.style.transform = `translateX(-${index*100}%)`;
    dots.forEach((d, i)=>d.classList.toggle('active', i===index));
  }
  function go(i){ index = (i+slides.length)%slides.length; render(); }
  prev?.addEventListener('click', ()=>go(index-1));
  next?.addEventListener('click', ()=>go(index+1));
  let timer = slides.length > 1 ? setInterval(()=>go(index+1), 4500) : null;
  carousel.addEventListener('mouseenter', ()=>{ if(timer) clearInterval(timer); });
  carousel.addEventListener('mouseleave', ()=>{ if(slides.length > 1) timer = setInterval(()=>go(index+1), 4500); });
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

// Activities page: show every camping rental as its own photo card.
(() => {
  const mountRentalCards = () => {
    if (!location.pathname.endsWith('/activities.html') && !location.pathname.endsWith('activities.html')) return;
    if (document.getElementById('rentalCardGridV2')) return;
    const section = Array.from(document.querySelectorAll('section')).find((el) => el.textContent.includes('露營區裝備租借') || el.textContent.includes('露營區租借服務'));
    if (!section) return;
    section.querySelector('.rental-hero')?.remove();
    section.querySelectorAll('.rental-table-wrap').forEach((wrap) => { if (wrap.textContent.includes('Hispeed 單人床墊')) wrap.remove(); });
    section.querySelectorAll('.equipment-caption').forEach((el)=>el.remove());
    if (!document.getElementById('rentalCardsV2Style')) {
      const style = document.createElement('style');
      style.id = 'rentalCardsV2Style';
      style.textContent = `
        .rental-card-heading{margin:12px 0 24px}.rental-card-heading .lead{max-width:760px}
        .rental-product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin:20px 0 42px}
        .rental-product-card{overflow:hidden;background:#fff}.rental-product-photo{width:100%;aspect-ratio:1/1;background-image:url('assets/images/rental-sprite.webp?v=20261003-0840');background-repeat:no-repeat;background-size:400% 200%;background-color:#eee;display:block}
        .rental-product-photo.p1{background-position:0% 0%}.rental-product-photo.p2{background-position:33.333% 0%}.rental-product-photo.p3{background-position:66.666% 0%}.rental-product-photo.p4{background-position:100% 0%}.rental-product-photo.p5{background-position:0% 100%}.rental-product-photo.p6{background-position:33.333% 100%}.rental-product-photo.p7{background-position:66.666% 100%}
        .rental-product-card .body{min-height:0!important;display:flex;flex-direction:column;gap:10px}.rental-product-card h3{margin:0}.rental-product-card .desc{margin:0 0 2px}
        .rental-product-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto}.rental-chip{display:inline-flex;align-items:center;border-radius:999px;padding:7px 11px;background:#f3efe5;color:#65563d;font-size:12px;font-weight:800}
        .rental-price-row{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-top:4px;padding-top:13px;border-top:1px solid #ece9df}.rental-price-row small{display:block;color:#6d766f;font-size:12px;margin-bottom:4px}.rental-price-row strong{font-size:24px;color:#1d5945}.rental-deposit{font-size:13px;font-weight:900;color:#795f35;text-align:right}
        @media(max-width:900px){.rental-product-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.rental-product-grid{grid-template-columns:1fr;gap:18px}.rental-price-row strong{font-size:22px}}
      `;
      document.head.appendChild(style);
    }
    const items = [
      {p:'p1',en:'HISPEED SINGLE MATTRESS',name:'Hispeed 單人床墊',desc:'適合單人露營使用，輕便好收納。',price:'NT$100',deposit:'NT$300'},
      {p:'p2',en:'HISPEED DOUBLE MATTRESS',name:'Hispeed 雙人床墊',desc:'適合雙人使用，充氣快速、收納方便。',price:'NT$150',deposit:'NT$500'},
      {p:'p3',en:'SINGLE CHEESE MATTRESS',name:'單人奶酪床墊',desc:'厚實舒適，適合重視睡感的單人露營需求。',price:'NT$250',deposit:'NT$500'},
      {p:'p4',en:'DOUBLE CHEESE MATTRESS',name:'雙人奶酪床墊',desc:'雙人加大尺寸，適合家庭或雙人使用。',price:'NT$400',deposit:'NT$1,000'},
      {p:'p5',en:'STANDARD CAR TAIL TENT',name:'車尾帳（一般款）',desc:'適合簡易車宿搭設，提供遮蔽與延伸休憩空間。',price:'NT$500',deposit:'NT$1,000'},
      {p:'p6',en:'ALADDIN CAR TAIL TENT',name:'阿拉丁車尾帳',desc:'空間較大，適合多人休憩與車宿延伸使用。',price:'NT$1,000',deposit:'NT$2,000'},
      {p:'p7',en:'INFLATABLE TENT',name:'充氣帳篷',desc:'搭設快速、空間寬敞，適合家庭露營使用。',price:'NT$1,500',deposit:'NT$3,000'}
    ];
    const block = document.createElement('div');
    block.id = 'rentalCardGridV2';
    block.innerHTML = `<div class="rental-card-heading"><div class="kicker">CAMPING GEAR RENTAL</div><h2 class="title">露營區裝備租借</h2><p class="lead">現場單日（每晚）固定出租，租金已內含日常清潔與消毒工時。每項設備數量皆為 1，建議提前預約。</p></div><div class="rental-product-grid">${items.map((x)=>`<article class="activity-card rental-product-card"><div class="rental-product-photo ${x.p}" role="img" aria-label="${x.name}"></div><div class="body"><div class="kicker">${x.en}</div><h3>${x.name}</h3><p class="desc">${x.desc}</p><div class="rental-product-meta"><span class="rental-chip">數量：1</span><span class="rental-chip">單日／每晚</span></div><div class="rental-price-row"><div><small>固定租金</small><strong>${x.price}</strong></div><div class="rental-deposit">押金<br>${x.deposit}</div></div></div></article>`).join('')}</div>`;
    const feeTitle = section.querySelector('.fee-title');
    if (feeTitle) feeTitle.before(block); else section.querySelector('.wrap')?.appendChild(block);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountRentalCards); else mountRentalCards();
})();

// Upgrade the five non-tail-tent rental photos with much larger source images.
(() => {
  const applyRentalHdPhotos = () => {
    if (!location.pathname.endsWith('/activities.html') && !location.pathname.endsWith('activities.html')) return;
    const hd = {
      'Hispeed 單人床墊': 'https://www.naturehike.com/cdn/shop/files/1_676af73d-97ca-49ab-a8a1-e10a5ed66f56.jpg?v=1775115183&width=1600',
      'Hispeed 雙人床墊': 'https://img.myshopline.com/image/store/1660207760542/3-82.jpeg?h=1600&w=1600',
      '單人奶酪床墊': 'https://surplus-militaires.fr/cdn/shop/files/matelas-autogonflant-simple-5-cm-beige-697.webp?v=1763044690&width=1600',
      '雙人奶酪床墊': 'https://qsales.qa/cdn/shop/files/Qsales_Size_Self-Inflating_Camping_Mattress_1024x.jpg?v=1764586477',
      '充氣帳篷': 'https://hupa.gr/images/stories/virtuemart/product/51-2020-75.webp'
    };
    document.querySelectorAll('.rental-photo-window img').forEach((img) => {
      const src = hd[img.alt];
      if (!src) return;
      const original = img.getAttribute('src');
      img.loading = 'eager';
      img.decoding = 'async';
      img.style.imageRendering = 'auto';
      img.onerror = () => {
        img.onerror = null;
        img.src = original;
      };
      img.src = src;
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyRentalHdPhotos);
  else applyRentalHdPhotos();
})();

// Global navigation pills: apply the same separated oval buttons on every page.
(() => {
  const applyGlobalNavPills = () => {
    if (!document.getElementById('globalNavPillStyle')) {
      const style = document.createElement('style');
      style.id = 'globalNavPillStyle';
      style.textContent = `
        .site-header .nav-links{gap:7px!important;align-items:center}
        .site-header .nav-links a{display:inline-flex;align-items:center;justify-content:center;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.16);opacity:1!important;line-height:1.25;transition:background .2s ease,color .2s ease,border-color .2s ease,transform .2s ease}
        .site-header .nav-links a:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.32);transform:translateY(-1px)}
        .site-header .nav-links a.nav-current{background:#efe4d3!important;color:#244537!important;border-color:#efe4d3!important;box-shadow:0 4px 14px rgba(0,0,0,.16)}
        .site-header .mobile-menu{padding:8px 0 18px}
        .site-header .mobile-menu a{margin:6px 0;padding:10px 14px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(255,255,255,.07)}
        .site-header .mobile-menu a.nav-current{background:#efe4d3;color:#244537;border-color:#efe4d3}
        @media(min-width:1121px) and (max-width:1260px){.site-header .nav-links{gap:5px!important}.site-header .nav-links a{padding:6px 8px;font-size:12.5px}}
      `;
      document.head.appendChild(style);
    }

    const current = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((a) => {
      a.classList.remove('nav-current');
      const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
      if (!href || href.startsWith('http')) return;
      if (href === current || (current === '' && href === 'index.html')) a.classList.add('nav-current');
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyGlobalNavPills);
  else applyGlobalNavPills();
})();
