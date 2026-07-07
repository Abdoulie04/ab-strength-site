// =========================================
// MAPPING DES CATÉGORIES (slug -> libellé + description courte)
// =========================================
const CATEGORIES = {
  prise_masse:  { label: "Prise de masse",              desc: "Surplus calorique contrôlé, volume progressif, priorité aux mouvements poly-articulaires.", video: "prise-masse.mp4" },
  seche:        { label: "Sèche sans perte musculaire",  desc: "Déficit modéré, apport protéique élevé, maintien des charges pour préserver le muscle.", video: "seche.mp4" },
  perte_gras:   { label: "Perte de gras",                desc: "Musculation combinée au travail métabolique pour faire fondre la masse grasse.", video: "perte-gras.mp4" },
  maintien:     { label: "Maintien de forme",            desc: "Volume d'entretien, fréquence modérée, pour rester solide sans progression agressive.", video: "maintien.mp4" },
  cardio:       { label: "Cardio",                       desc: "Endurance, capacité respiratoire et santé cardiovasculaire, du seuil au fractionné.", video: "cardio.mp4" },
  perte_poids:  { label: "Perte de poids",                desc: "Approche globale : déficit calorique, activité régulière, résultats durables.", video: "perte-poids.mp4" }
};

// Applique la bonne vidéo de fond selon la catégorie (avec repli sur hero-bg.mp4)
function setHeroVideo(videoEl, sourceEl, categorySlug) {
  if (!videoEl || !sourceEl) return;
  const catInfo = CATEGORIES[categorySlug];
  const filename = catInfo && catInfo.video ? catInfo.video : 'hero-bg.mp4';
  sourceEl.src = `assets/${filename}`;
  videoEl.load();
  videoEl.play().catch(() => {});
}

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