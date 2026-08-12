const sharedMenuButton = document.querySelector('.menu-toggle');
const sharedNav = document.querySelector('.main-nav');

if (sharedMenuButton && sharedNav) {
  sharedMenuButton.addEventListener('click', () => {
    const isOpen = sharedMenuButton.getAttribute('aria-expanded') === 'true';
    sharedMenuButton.setAttribute('aria-expanded', String(!isOpen));
    sharedNav.classList.toggle('open');
  });

  sharedNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    sharedNav.classList.remove('open');
    sharedMenuButton.setAttribute('aria-expanded', 'false');
  }));
}
