(() => {
  const addFreeActivitiesNav = () => {
    document.querySelectorAll('.nav-links, .mobile-menu').forEach((nav) => {
      if (nav.querySelector('a[href="free-activities.html"]')) return;
      const activityLink = [...nav.querySelectorAll('a')].find((a) => {
        const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
        return href === 'activities.html';
      });
      if (!activityLink) return;
      const link = document.createElement('a');
      link.href = 'free-activities.html';
      link.textContent = '免費活動項目';
      activityLink.before(link);
    });
  };
  addFreeActivitiesNav();
  const legacy = document.createElement('script');
  legacy.src = 'assets/script-legacy.js?v=20261005-2125';
  legacy.async = false;
  document.head.appendChild(legacy);
})();