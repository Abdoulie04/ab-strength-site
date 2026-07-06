// =========================================
// TOGGLE MODE CLAIR / SOMBRE
// (l'application immédiate du thème stocké se fait via
//  le petit script inline dans le <head> de chaque page,
//  pour éviter un flash de la mauvaise couleur au chargement)
// =========================================
const themeToggle = document.getElementById('themeToggle');

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ab-strength-theme', theme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);

    if (window.gsap) {
      gsap.fromTo(themeToggle, { scale: 0.8, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)' });
    }
  });
}