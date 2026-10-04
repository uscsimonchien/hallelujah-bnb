(() => {
  const VERSION = '20261004-2155';

  const photoMap = {
    'Hispeed 單人床墊': `assets/images/rental_hispeed_single_hd.png?v=${VERSION}`,
    'Hispeed 雙人床墊': `assets/images/rental_hispeed_double_hd.png?v=${VERSION}`,
    '單人奶酪床墊': `assets/images/rental_cheese_single_hd.png?v=${VERSION}`,
    '雙人奶酪床墊': `assets/images/rental_cheese_double_hd.png?v=${VERSION}`,
    '充氣帳篷': `assets/images/rental_inflatable_tent_hd.png?v=${VERSION}`
  };

  const applyCorrectRentalPhotos = () => {
    document.querySelectorAll('.rental-photo-window img').forEach((img) => {
      const src = photoMap[img.alt];
      if (!src) return;
      img.src = src;
      img.loading = 'eager';
      img.decoding = 'async';
      img.style.imageRendering = 'auto';
    });
  };

  const cardHtml = ({ image, alt, kicker, title, desc, rent, deposit }) => `
    <article class="activity-card rental-product-card">
      <div class="rental-photo-window"><img src="${image}" alt="${alt}" loading="eager" decoding="async"></div>
      <div class="body">
        <div class="kicker">${kicker}</div><h3>${title}</h3><p class="desc">${desc}</p>
        <div class="rental-product-meta"><span class="rental-chip">數量：1</span><span class="rental-chip">單日／每晚</span></div>
        <div class="rental-price-row"><div><small>固定租金</small><strong>NT$${rent}</strong></div><div class="rental-deposit">押金<br>NT$${deposit}</div></div>
      </div>
    </article>`;

  const ensureG40Cards = () => {
    const grid = document.querySelector('#rentalCardGridV2 .rental-product-grid');
    if (!grid) return;
    const items = [
      { title:'G40 LED 氣氛燈串', image:`assets/images/g40_string_lights.png?v=${VERSION}`, alt:'G40 LED 氣氛燈串', kicker:'G40 LED STRING LIGHTS', desc:'總長約 7.6 米、25 顆暖黃光 LED 燈泡，附防撞收納袋。適合露營、車宿與戶外聚會營造溫暖氣氛。', rent:'50', deposit:'200' },
      { title:'燈串加購動力延長線組', image:`assets/images/g40_extension_cable.png?v=${VERSION}`, alt:'燈串加購動力延長線組', kicker:'G40 POWER EXTENSION SET', desc:'G40 7.6 米燈串 ×1＋5米／10米動力延長線 ×1，依現場使用需求提供規格。', rent:'100', deposit:'300' }
    ];
    items.forEach((item) => {
      const existing = [...grid.querySelectorAll('.rental-product-card')].find((card) => card.querySelector('h3')?.textContent.trim() === item.title);
      if (!existing) { grid.insertAdjacentHTML('beforeend', cardHtml(item)); return; }
      const img = existing.querySelector('.rental-photo-window img');
      if (img) { img.src=item.image; img.alt=item.alt; img.loading='eager'; img.decoding='async'; }
      existing.querySelector('.desc') && (existing.querySelector('.desc').textContent=item.desc);
      existing.querySelector('.rental-price-row strong') && (existing.querySelector('.rental-price-row strong').textContent=`NT$${item.rent}`);
      existing.querySelector('.rental-deposit') && (existing.querySelector('.rental-deposit').innerHTML=`押金<br>NT$${item.deposit}`);
    });
  };

  const ensureG40DamageRules = () => {
    if (document.getElementById('g40DamageRules')) return;
    const damageBox = document.querySelector('.damage-box');
    if (!damageBox) return;
    damageBox.insertAdjacentHTML('beforebegin', `
      <div id="g40DamageRules">
        <div class="fee-title"><div><div class="kicker">STRING LIGHT DAMAGE & ORGANIZING</div><h2 class="title" style="font-size:34px">燈串類「損耗與未整理解結扣抵」固定收費標準</h2></div><span class="fee-alert">自押金扣抵</span></div>
        <div class="rental-table-wrap"><table class="rental-table"><thead><tr><th>狀況項目</th><th>說明與處理工序</th><th>固定扣抵費用（NT$）</th></tr></thead><tbody>
          <tr><td>單顆燈泡破裂／缺損</td><td>人為拉扯撞擊破裂或燈泡遺失</td><td><strong>NT$30／顆</strong></td></tr>
          <tr><td>嚴重打結未依序收整</td><td>歸還時揉成一團嚴重打結，需工作人員花時間拆解理線</td><td><strong>NT$50／條</strong></td></tr>
          <tr><td>電線拉扯斷裂／插頭損壞</td><td>燈串導線扯斷、銅線外露或插頭進水變形無法通電（整條報廢）</td><td><strong>NT$200／條（全額扣抵押金）</strong></td></tr>
        </tbody></table></div>
      </div>`);
  };

  const enhanceNavigation = () => {
    if (!document.getElementById('navPillStyle')) {
      const style = document.createElement('style');
      style.id = 'navPillStyle';
      style.textContent = `
        .site-header .nav-links{gap:7px!important;align-items:center}
        .site-header .nav-links a{display:inline-flex;align-items:center;justify-content:center;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.16);opacity:1!important;line-height:1.25;transition:background .2s ease,color .2s ease,border-color .2s ease,transform .2s ease}
        .site-header .nav-links a:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.32);transform:translateY(-1px)}
        .site-header .nav-links a.nav-current{background:#efe4d3;color:#244537;border-color:#efe4d3;box-shadow:0 4px 14px rgba(0,0,0,.16)}
        @media(min-width:1121px) and (max-width:1260px){.site-header .nav-links{gap:5px!important}.site-header .nav-links a{padding:6px 8px;font-size:12.5px}}
      `;
      document.head.appendChild(style);
    }
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('http') && href.split('#')[0] === current) a.classList.add('nav-current');
    });
  };

  const applyAll = () => { applyCorrectRentalPhotos(); ensureG40Cards(); ensureG40DamageRules(); enhanceNavigation(); };
  const run = () => { applyAll(); setTimeout(applyAll, 200); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();