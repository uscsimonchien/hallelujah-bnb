(() => {
  const applyCorrectRentalPhotos = () => {
    const map = {
      'Hispeed 單人床墊': 'assets/images/rental_hispeed_single_hd.png?v=20261004-1015',
      'Hispeed 雙人床墊': 'assets/images/rental_hispeed_double_hd.png?v=20261004-1015',
      '單人奶酪床墊': 'assets/images/rental_cheese_single_hd.png?v=20261004-1015',
      '雙人奶酪床墊': 'assets/images/rental_cheese_double_hd.png?v=20261004-1015',
      '充氣帳篷': 'assets/images/rental_inflatable_tent_hd.png?v=20261004-1015'
    };

    document.querySelectorAll('.rental-photo-window img').forEach((img) => {
      const src = map[img.alt];
      if (!src) return;
      img.src = src;
      img.loading = 'eager';
      img.decoding = 'async';
      img.style.imageRendering = 'auto';
    });
  };

  const run = () => setTimeout(applyCorrectRentalPhotos, 50);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
