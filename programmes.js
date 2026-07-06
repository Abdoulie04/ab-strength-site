const params = new URLSearchParams(window.location.search);
const catSlug = params.get('cat');
const catInfo = CATEGORIES[catSlug];

const catEyebrow = document.getElementById('catEyebrow');
const catTitle = document.getElementById('catTitle');
const catSub = document.getElementById('catSub');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const catalogueGrid = document.getElementById('catalogueGrid');

// =========================================
// VIDÉO DE FOND SELON LA CATÉGORIE
// =========================================
const VIDEOS_PAR_CATEGORIE = {
  prise_masse: 'assets/prise-masse.mp4',
  seche: 'assets/seche.mp4',
  perte_gras: 'assets/perte-gras.mp4',
  maintien: 'assets/maintien.mp4',
  cardio: 'assets/cardio.mp4',
  perte_poids: 'assets/perte-poids.mp4'
};

function setPageHeroVideo(categorie) {
  const video = document.getElementById('pageHeroVideo');
  const source = document.getElementById('pageHeroSource');
  const src = VIDEOS_PAR_CATEGORIE[categorie] || 'assets/hero-bg.mp4';

  if (video && source) {
    source.src = src;
    video.load();
    video.play().catch(() => {});
  }
}

setPageHeroVideo(catSlug);

// En-tête de la page selon la catégorie
if (catInfo) {
  catEyebrow.textContent = "Catégorie";
  catTitle.textContent = catInfo.label;
  catSub.textContent = catInfo.desc;
} else {
  catEyebrow.textContent = "Tous les programmes";
  catTitle.textContent = "Nos programmes";
  catSub.textContent = "Retrouve tous les programmes disponibles, tous objectifs confondus.";
}

async function loadProgrammes() {
  try {
    const response = await fetch(`${API_BASE_URL}/programmes`);
    if (!response.ok) throw new Error('Erreur réseau');

    const programmes = await response.json();
    const filtered = catSlug ? programmes.filter(p => p.categorie === catSlug) : programmes;

    loadingState.style.display = 'none';

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    catalogueGrid.innerHTML = filtered.map((p, i) => `
      <article class="prog-card tilt-card" data-aos="fade-up" data-aos-delay="${i * 80}">
        <span class="prog-index">${String(i + 1).padStart(2, '0')}</span>
        <h3>${escapeHtml(p.titre)}</h3>
        <p>${escapeHtml(p.description || 'Aucune description disponible.')}</p>
        <div class="prog-card-tags">
          ${p.niveau ? `<span class="tag">${NIVEAUX[p.niveau] || p.niveau}</span>` : ''}
          ${p.duree_semaines ? `<span class="tag">${p.duree_semaines} semaines</span>` : ''}
          ${p.nb_seances_semaine ? `<span class="tag">${p.nb_seances_semaine}x / semaine</span>` : ''}
        </div>
        <a href="programme.html?id=${p.id}" class="prog-link">Voir le détail →</a>
      </article>
    `).join('');

    if (window.AOS) AOS.refresh();
    attachTiltEffect();

  } catch (err) {
    console.error(err);
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function attachTiltEffect() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / rect.height) * -6;
      const rotateY = ((x - rect.width / 2) / rect.width) * 6;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      if (window.gsap) {
        gsap.to(card, { rotateX, rotateY, duration: 0.4, ease: 'power2.out', transformPerspective: 600 });
      }
    });
    card.addEventListener('mouseleave', () => {
      if (window.gsap) gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    });
  });
}

loadProgrammes();