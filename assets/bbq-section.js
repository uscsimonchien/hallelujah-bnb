(() => {
  const VERSION = '20261005-2335';

  const ensureStyles = () => {
    if (document.getElementById('bbqSuppliesStyle')) return;
    const style = document.createElement('style');
    style.id = 'bbqSuppliesStyle';
    style.textContent = `
      #bbqSuppliesSection{margin:48px 0 36px;padding-top:10px;border-top:1px solid rgba(39,65,54,.12)}
      #bbqSuppliesSection .bbq-head{display:flex;align-items:end;justify-content:space-between;gap:18px;flex-wrap:wrap;margin:34px 0 18px}
      #bbqSuppliesSection .bbq-head h2{margin:4px 0 0;font-size:38px;color:#173b2f}
      #bbqSuppliesSection .bbq-lead{color:#657168;line-height:1.8;max-width:760px;margin:0 0 22px}
      #bbqSuppliesSection .rental-photo-window img{object-fit:cover}
      #bbqSuppliesSection .bbq-buy-chip{background:#8c4b18;color:#fff}
      #bbqSuppliesSection .bbq-policy{background:#fff7e9;border:1px solid #ead4b2;border-radius:22px;padding:22px 24px;margin-top:8px;line-height:1.85;color:#5f503a}
      #bbqSuppliesSection .bbq-policy strong{color:#704716}
      @media(max-width:620px){#bbqSuppliesSection .bbq-head h2{font-size:30px}}
    `;
    document.head.appendChild(style);
  };

  const card = ({image,kicker,title,desc,price,deposit,type,qty}) => `
    <article class="activity-card rental-product-card">
      <div class="rental-photo-window"><img src="${image}" alt="${title}" loading="eager" decoding="async"></div>
      <div class="body">
        <div class="kicker">${kicker}</div>
        <h3>${title}</h3>
        <p class="desc">${desc}</p>
        <div class="rental-product-meta">
          <span class="rental-chip ${type === '購買' ? 'bbq-buy-chip' : ''}">${type}</span>
          <span class="rental-chip">${qty}</span>
        </div>
        <div class="rental-price-row">
          <div><small>${type === '購買' ? '售價' : '固定租金'}</small><strong>NT$${price}</strong></div>
          ${deposit ? `<div class="rental-deposit">押金<br>NT$${deposit}</div>` : '<div class="rental-deposit">耗材商品<br>售出不退</div>'}
        </div>
      </div>
    </article>`;

  const ensureSection = () => {
    if (document.getElementById('bbqSuppliesSection')) return;
    const rentalGridWrap = document.getElementById('rentalCardGridV2');
    if (!rentalGridWrap) return;
    ensureStyles();

    const section = document.createElement('div');
    section.id = 'bbqSuppliesSection';
    section.innerHTML = `
      <div class="bbq-head">
        <div><div class="kicker">BBQ SUPPLIES</div><h2>烤肉用品專區</h2></div>
        <span class="rental-badge">烤爐租借・炭精加購</span>
      </div>
      <p class="bbq-lead">想輕鬆烤肉不用自己搬大型烤爐。現場提供美式帶蓋推車型大型烤肉爐租借，也可直接加購 2 公斤炭精。</p>
      <div class="rental-product-grid bbq-product-grid">
        ${card({
          image:`assets/images/bbq-grill-520.png?v=${VERSION}`,
          kicker:'LARGE BBQ GRILL RENTAL',
          title:'大型美式帶蓋烤肉爐',
          desc:'大型推車式帶蓋烤爐，寬約 113cm、烤面約 76cm。純烤爐租借，提供烤爐主體與固定炭槽，耗材自行準備。',
          price:'500',deposit:'1,000',type:'租借',qty:'單次／日'
        })}
        ${card({
          image:`assets/images/bbq-bundle-520.png?v=${VERSION}`,
          kicker:'BBQ EASY PACKAGE',
          title:'BBQ 懶人套裝組',
          desc:'烤爐＋炭精 1 袋（2kg）＋烤肉夾 2 支＋噴槍／火種＋全新烤網 1～2 片，一組備齊直接開烤。',
          price:'1,000',deposit:'1,000',type:'租借',qty:'單次／日'
        })}
        ${card({
          image:`assets/images/bbq-charcoal-420.png?v=${VERSION}`,
          kicker:'CHARCOAL BRIQUETTES',
          title:'炭精 2 公斤',
          desc:'現場加購炭精，每袋 2 公斤。大型烤爐若連續使用超過約 3 小時，建議準備 2 袋。',
          price:'150',deposit:'',type:'購買',qty:'2kg／袋'
        })}
      </div>
      <div class="bbq-policy">
        <strong>烤爐押金與清潔：</strong>烤爐租借押金 NT$1,000。使用後請將炭灰清空，並完成爐身與烤區的基本去油擦拭；完成基礎清潔後押金全額退還。若由民宿協助代清，固定扣抵 <strong>NT$500 清潔服務費</strong>。BBQ 懶人套裝組附全新烤網 1～2 片，使用後不回收再提供下一組客人。
      </div>`;
    rentalGridWrap.insertAdjacentElement('afterend', section);
  };

  const run = () => { ensureSection(); setTimeout(ensureSection, 300); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
