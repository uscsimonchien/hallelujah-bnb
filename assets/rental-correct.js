(() => {
  const applyCorrectRentalPhotos = () => {
    const map = {
      // 依使用者提供的五張原圖順序固定對應：Hispeed = 帶枕 190cm 系列；奶酪 = 76/132 x 200 系列
      'Hispeed 單人床墊': 'assets/images/rental_hispeed_single_hd.webp?v=20261004-0125',
      'Hispeed 雙人床墊': 'assets/images/rental_hispeed_double_hd.webp?v=20261004-0125',
      '單人奶酪床墊': 'assets/images/rental_cheese_single_hd.webp?v=20261004-0125',
      '雙人奶酪床墊': 'assets/images/rental_cheese_double_hd.webp?v=20261004-0125',
      '充氣帳篷': 'assets/images/rental_inflatable_tent.webp?v=20261004-0125'
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
