(() => {
  const applyCorrectRentalPhotos = () => {
    const map = {
      'Hispeed 單人床墊': 'assets/images/rental_cheese_single.webp?v=20261004-0025',
      'Hispeed 雙人床墊': 'assets/images/rental_cheese_double.webp?v=20261004-0025',
      '單人奶酪床墊': 'assets/images/rental_hispeed_single.webp?v=20261004-0025',
      '雙人奶酪床墊': 'assets/images/rental_hispeed_double.webp?v=20261004-0025',
      '充氣帳篷': 'assets/images/rental_inflatable_tent.webp?v=20261004-0025'
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
  const run = () => setTimeout(applyCorrectRentalPhotos, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
