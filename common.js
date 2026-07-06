// =========================================
// MAPPING DES CATÉGORIES (slug -> libellé + description courte)
// =========================================
const CATEGORIES = {
  prise_masse:  { label: "Prise de masse",              desc: "Surplus calorique contrôlé, volume progressif, priorité aux mouvements poly-articulaires." },
  seche:        { label: "Sèche sans perte musculaire",  desc: "Déficit modéré, apport protéique élevé, maintien des charges pour préserver le muscle." },
  perte_gras:   { label: "Perte de gras",                desc: "Musculation combinée au travail métabolique pour faire fondre la masse grasse." },
  maintien:     { label: "Maintien de forme",            desc: "Volume d'entretien, fréquence modérée, pour rester solide sans progression agressive." },
  cardio:       { label: "Cardio",                       desc: "Endurance, capacité respiratoire et santé cardiovasculaire, du seuil au fractionné." },
  perte_poids:  { label: "Perte de poids",                desc: "Approche globale : déficit calorique, activité régulière, résultats durables." }
};

const NIVEAUX = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé"
};

// =========================================
// AOS
// =========================================
if (window.AOS) {
  AOS.init({ duration: 700, once: true, offset: 50, easing: 'ease-out-cubic' });
}

// =========================================
// MENU BURGER (mobile)
// =========================================
const burgerBtn = document.getElementById('burgerBtn');
const mainNav = document.getElementById('mainNav');

if (burgerBtn && mainNav) {
  burgerBtn.addEventListener('click', () => mainNav.classList.toggle('open'));
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });
}

// =========================================
// HEADER : fond plus opaque au scroll
// =========================================
const siteHeader = document.getElementById('siteHeader');
if (siteHeader) {
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// =========================================
// BOUTON RETOUR (page précédente, ou accueil en fallback)
// =========================================
const backBtn = document.getElementById('backBtn');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });
}
const backToTop = document.getElementById('backToTop');
const bttProgress = document.getElementById('bttProgress');
const RING_CIRCUMFERENCE = 163.36;

function updateBackToTop() {
  if (!backToTop || !bttProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;

  bttProgress.style.strokeDashoffset = RING_CIRCUMFERENCE - (progress * RING_CIRCUMFERENCE);

  if (scrollTop > 400) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');
}

if (backToTop) {
  window.addEventListener('scroll', updateBackToTop);
  updateBackToTop();
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}