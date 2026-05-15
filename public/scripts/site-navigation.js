const menuButton = document.getElementById('menu-button');
const siteNav = document.getElementById('site-nav');

if (menuButton instanceof HTMLButtonElement && siteNav instanceof HTMLElement) {
  const closedClasses = ['opacity-0', 'pointer-events-none', '-translate-y-2', 'scale-95'];

  const openMenu = () => {
    siteNav.classList.remove(...closedClasses);
    menuButton.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    siteNav.classList.add(...closedClasses);
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      requestAnimationFrame(openMenu);
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('header') && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  closeMenu();
}
