(() => {
  const VERSION = '20261004-1635';

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
      <div class="rental-photo-window">
        <img src="${image}" alt="${alt}" loading="eager" decoding="async">
      </div>
      <div class="body">
        <div class="kicker">${kicker}</div>
        <h3>${title}</h3>
        <p class="desc">${desc}</p>
        <div class="rental-product-meta">
          <span class="rental-chip">數量：1</span>
          <span class="rental-chip">單日／每晚</span>
        </div>
        <div class="rental-price-row">
          <div><small>固定租金</small><strong>NT$${rent}</strong></div>
          <div class="rental-deposit">押金<br>NT$${deposit}</div>
        </div>
      </div>
    </article>`;

  const ensureG40Cards = () => {
    const grid = document.querySelector('#rentalCardGridV2 .rental-product-grid');
    if (!grid) return;

    const items = [
      {
        title: 'G40 LED 氣氛燈串',
        image: `assets/images/g40_string_lights.png.png?v=${VERSION}`,
        alt: 'G40 LED 氣氛燈串',
        kicker: 'G40 LED STRING LIGHTS',
        desc: '總長約 7.6 米、25 顆暖黃光 LED 燈泡，附防撞收納袋。適合露營、車宿與戶外聚會營造溫暖氣氛。',
        rent: '50',
        deposit: '200'
      },
      {
        title: '燈串加購動力延長線組',
        image: `assets/images/g40_extension_cable.png.png?v=${VERSION}`,
        alt: '燈串加購動力延長線組',
        kicker: 'G40 POWER EXTENSION SET',
        desc: 'G40 7.6 米燈串 ×1＋5米／10米動力延長線 ×1，依現場使用需求提供規格。',
        rent: '100',
        deposit: '300'
      }
    ];

    items.forEach((item) => {
      const existing = [...grid.querySelectorAll('.rental-product-card')]
        .find((card) => card.querySelector('h3')?.textContent.trim() === item.title);

      if (!existing) {
        grid.insertAdjacentHTML('beforeend', cardHtml(item));
        return;
      }

      const img = existing.querySelector('.rental-photo-window img');
      if (img) {
        img.src = item.image;
        img.alt = item.alt;
        img.loading = 'eager';
        img.decoding = 'async';
      }
      const desc = existing.querySelector('.desc');
      if (desc) desc.textContent = item.desc;
      const price = existing.querySelector('.rental-price-row strong');
      if (price) price.textContent = `NT$${item.rent}`;
      const deposit = existing.querySelector('.rental-deposit');
      if (deposit) deposit.innerHTML = `押金<br>NT$${item.deposit}`;
    });
  };

  const ensureG40DamageRules = () => {
    if (document.getElementById('g40DamageRules')) return;
    const damageBox = document.querySelector('.damage-box');
    if (!damageBox) return;

    const html = `
      <div id="g40DamageRules">
        <div class="fee-title">
          <div>
            <div class="kicker">STRING LIGHT DAMAGE & ORGANIZING</div>
            <h2 class="title" style="font-size:34px">燈串類「損耗與未整理解結扣抵」固定收費標準</h2>
          </div>
          <span class="fee-alert">自押金扣抵</span>
        </div>
        <div class="rental-table-wrap">
          <table class="rental-table">
            <thead>
              <tr><th>狀況項目</th><th>說明與處理工序</th><th>固定扣抵費用（NT$）</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>單顆燈泡破裂／缺損</td>
                <td>人為拉扯撞擊破裂或燈泡遺失</td>
                <td><strong>NT$30／顆</strong></td>
              </tr>
              <tr>
                <td>嚴重打結未依序收整</td>
                <td>歸還時揉成一團嚴重打結，需工作人員花時間拆解理線</td>
                <td><strong>NT$50／條</strong></td>
              </tr>
              <tr>
                <td>電線拉扯斷裂／插頭損壞</td>
                <td>燈串導線扯斷、銅線外露或插頭進水變形無法通電（整條報廢）</td>
                <td><strong>NT$200／條（全額扣抵押金）</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;

    damageBox.insertAdjacentHTML('beforebegin', html);
  };

  const applyAll = () => {
    applyCorrectRentalPhotos();
    ensureG40Cards();
    ensureG40DamageRules();
  };

  const run = () => {
    applyAll();
    setTimeout(applyAll, 200);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
