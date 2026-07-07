const params = new URLSearchParams(window.location.search);
const programmeId = params.get('id');

const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const programmeContent = document.getElementById('programmeContent');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatRepos(seconds) {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${min} min` : `${min} min ${rest}s`;
}

async function loadProgramme() {
  if (!programmeId) {
    showError();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/programmes/${programmeId}`);
    if (!response.ok) throw new Error('Programme introuvable');

    const programme = await response.json();
    renderProgramme(programme);

  } catch (err) {
    console.error(err);
    showError();
  }
}

function showError() {
  loadingState.style.display = 'none';
  errorState.style.display = 'block';
}

function renderProgramme(p) {
  const catInfo = CATEGORIES[p.categorie];

  document.title = `${p.titre} — AB STRENGTH`;
  document.getElementById('progCategorie').textContent = catInfo ? catInfo.label : p.categorie;

  setHeroVideo(document.getElementById('progHeroVideo'), document.getElementById('progHeroSource'), p.categorie);
  document.getElementById('progTitre').textContent = p.titre;
  document.getElementById('progDescription').textContent = p.description || '';

  const metaEl = document.getElementById('progMeta');
  const metaItems = [];
  if (p.niveau) metaItems.push(`<span class="tag">${NIVEAUX[p.niveau] || p.niveau}</span>`);
  if (p.duree_semaines) metaItems.push(`<span class="tag">${p.duree_semaines} semaines</span>`);
  if (p.nb_seances_semaine) metaItems.push(`<span class="tag">${p.nb_seances_semaine}x / semaine</span>`);
  metaEl.innerHTML = metaItems.join('');

  renderEtapes(p.etapes || []);
  renderNutrition(p.nutrition, p.repas || []);

  loadingState.style.display = 'none';
  programmeContent.style.display = 'block';
  if (window.AOS) AOS.refresh();

  initTabs();
}

// =========================================
// ENTRAÎNEMENT — étapes et exercices
// =========================================
function renderEtapes(etapes) {
  const container = document.getElementById('etapesContainer');

  if (etapes.length === 0) {
    container.innerHTML = `<p class="empty-note">Le détail des séances sera bientôt disponible.</p>`;
    return;
  }

  container.innerHTML = etapes.map((etape, i) => `
    <div class="etape-block" data-aos="fade-up" data-aos-delay="${i * 60}">
      <div class="etape-header">
        <span class="etape-num">Jour ${i + 1}</span>
        <h3>${escapeHtml(etape.titre)}</h3>
      </div>
      ${etape.description ? `<p class="etape-desc">${escapeHtml(etape.description)}</p>` : ''}

      <div class="exercices-table">
        <div class="exercices-row exercices-head">
          <span>Exercice</span>
          <span>Séries</span>
          <span>Répétitions</span>
          <span>Récupération</span>
        </div>
        ${(etape.exercices || []).map(ex => `
          <div class="exercices-row">
            <span class="ex-name">
              ${escapeHtml(ex.nom)}
              ${ex.notes ? `<span class="ex-note">${escapeHtml(ex.notes)}</span>` : ''}
            </span>
            <span class="ex-data" data-label="Séries">${ex.nb_series ?? '—'}</span>
            <span class="ex-data" data-label="Répétitions">${ex.nb_repetitions ?? '—'}</span>
            <span class="ex-data" data-label="Récupération">${formatRepos(ex.temps_repos)}</span>
          </div>
        `).join('') || '<p class="empty-note">Aucun exercice renseigné pour cette étape.</p>'}
      </div>
    </div>
  `).join('');
}

// =========================================
// ALIMENTATION — macros et repas
// =========================================
function renderNutrition(nutrition, repas) {
  const macrosGrid = document.getElementById('macrosGrid');
  const notesEl = document.getElementById('nutritionNotes');
  const repasContainer = document.getElementById('repasContainer');

  if (!nutrition) {
    macrosGrid.innerHTML = `<p class="empty-note">Les recommandations alimentaires seront bientôt disponibles pour ce programme.</p>`;
    notesEl.textContent = '';
    repasContainer.innerHTML = '';
    return;
  }

  const macros = [
    { label: 'Calories / jour', value: nutrition.calories_jour, unit: 'kcal' },
    { label: 'Protéines', value: nutrition.proteines_g, unit: 'g' },
    { label: 'Glucides', value: nutrition.glucides_g, unit: 'g' },
    { label: 'Lipides', value: nutrition.lipides_g, unit: 'g' }
  ];

  macrosGrid.innerHTML = macros.map((m, i) => `
    <div class="macro-card" data-aos="fade-up" data-aos-delay="${i * 60}">
      <span class="macro-value">${m.value ?? '—'}<span class="macro-unit">${m.value ? m.unit : ''}</span></span>
      <span class="macro-label">${m.label}</span>
    </div>
  `).join('');

  notesEl.textContent = nutrition.notes || '';

  if (repas.length === 0) {
    repasContainer.innerHTML = `<p class="empty-note">Aucun repas type renseigné pour ce programme.</p>`;
    return;
  }

  repasContainer.innerHTML = repas.map((r, i) => `
    <div class="repas-card" data-aos="fade-up" data-aos-delay="${i * 60}">
      <div class="repas-card-head">
        <h4>${escapeHtml(r.titre)}</h4>
        ${r.calories ? `<span class="repas-cal">${r.calories} kcal</span>` : ''}
      </div>
      <p>${escapeHtml(r.description)}</p>
      <div class="repas-macros">
        ${r.proteines_g ? `<span>P ${r.proteines_g}g</span>` : ''}
        ${r.glucides_g ? `<span>G ${r.glucides_g}g</span>` : ''}
        ${r.lipides_g ? `<span>L ${r.lipides_g}g</span>` : ''}
      </div>
    </div>
  `).join('');
}

// =========================================
// ONGLETS — Entraînement / Alimentation
// =========================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

loadProgramme();