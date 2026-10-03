(() => {
  const applyCorrectRentalPhotos = () => {
    const map = {
      // Hispeed：使用 76×200（單人）與 132×200（雙人）高清來源
      'Hispeed 單人床墊': 'https://surplus-militaires.fr/cdn/shop/files/matelas-autogonflant-simple-5-cm-beige-697.webp?v=1763044690&width=1600',
      'Hispeed 雙人床墊': 'https://qsales.qa/cdn/shop/files/Qsales_Size_Self-Inflating_Camping_Mattress_1024x.jpg?v=1764586477',
      // 奶酪床墊：使用 190×65×5（單人）與 190×130×5（雙人）高清來源
      '單人奶酪床墊': 'https://www.naturehike.com/cdn/shop/files/1_676af73d-97ca-49ab-a8a1-e10a5ed66f56.jpg?v=1775115183&width=1600',
      '雙人奶酪床墊': 'https://img.myshopline.com/image/store/1660207760542/3-82.jpeg?h=1600&w=1600',
      '充氣帳篷': 'https://hupa.gr/images/stories/virtuemart/product/51-2020-75.webp'
    };

    document.querySelectorAll('.rental-photo-window img').forEach((img) => {
      const src = map[img.alt];
      if (!src) return;
      img.onerror = null;
      img.src = src;
      img.loading = 'eager';
      img.decoding = 'async';
      img.style.imageRendering = 'auto';
    });
  };

  const run = () => setTimeout(applyCorrectRentalPhotos, 50);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
