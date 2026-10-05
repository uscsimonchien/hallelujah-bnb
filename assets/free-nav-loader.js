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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addFreeActivitiesNav);
})();