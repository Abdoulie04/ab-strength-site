requireAuth();

const params = new URLSearchParams(window.location.search);
const programmeId = params.get('id');

if (!programmeId) window.location.href = 'dashboard.html';

// =========================================
// ONGLETS
// =========================================
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

function formatRepos(seconds) {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${min} min` : `${min} min ${rest}s`;
}

// =========================================
// CHARGEMENT COMPLET DU PROGRAMME
// =========================================
async function loadProgramme() {
  try {
    const response = await authFetch(`${API_BASE_URL}/programmes/${programmeId}`);
    if (!response.ok) throw new Error('Programme introuvable');
    const programme = await response.json();

    document.getElementById('programmeTitreHead').textContent = programme.titre;

    renderEtapes(programme.etapes || []);
    fillNutritionForm(programme.nutrition);
    renderRepas(programme.repas || []);

  } catch (err) {
    console.error(err);
    document.getElementById('programmeTitreHead').textContent = 'Programme introuvable';
  }
}

// =========================================
// ÉTAPES + EXERCICES
// =========================================
const etapeForm = document.getElementById('etapeForm');
const etapesContainer = document.getElementById('etapesContainer');

etapeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titre = document.getElementById('ef_titre').value.trim();
  const description = document.getElementById('ef_description').value.trim();

  try {
    await authFetch(`${API_BASE_URL}/programmes/etapes`, {
      method: 'POST',
      body: JSON.stringify({ programme_id: programmeId, titre, description, ordre: document.querySelectorAll('.admin-etape-block').length + 1 })
    });
    showToast('Étape ajoutée');
    etapeForm.reset();
    loadProgramme();
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de l\'ajout', 'error');
  }
});

function renderEtapes(etapes) {
  if (etapes.length === 0) {
    etapesContainer.innerHTML = `<div class="admin-empty">Aucune étape pour l'instant. Ajoute la première ci-dessus.</div>`;
    return;
  }

  etapesContainer.innerHTML = etapes.map((etape, i) => `
    <div class="admin-etape-block" data-etape-id="${etape.id}">
      <div class="admin-etape-head">
        <h3>Jour ${i + 1} — ${escapeHtml(etape.titre)}</h3>
        <button class="btn-icon danger" data-delete-etape="${etape.id}">Supprimer l'étape</button>
      </div>

      <div class="admin-exercice-row head-row">
        <span>Exercice</span><span>Séries</span><span>Répétitions</span><span>Repos (s)</span><span></span>
      </div>

      ${(etape.exercices || []).map(ex => `
        <div class="admin-exercice-row" data-exercice-id="${ex.id}">
          <span>${escapeHtml(ex.nom)}</span>
          <span>${ex.nb_series ?? '—'}</span>
          <span>${ex.nb_repetitions ?? '—'}</span>
          <span>${formatRepos(ex.temps_repos)}</span>
          <button class="btn-icon danger" data-delete-exercice="${ex.id}">✕</button>
        </div>
      `).join('')}

      <div class="admin-add-line" data-etape-target="${etape.id}">
        <input type="text" placeholder="Nom de l'exercice" class="ex-nom" style="flex:2;">
        <input type="number" placeholder="Séries" class="ex-series" style="width:80px;">
        <input type="text" placeholder="Reps (ex: 8-10)" class="ex-reps" style="width:110px;">
        <input type="number" placeholder="Repos (s)" class="ex-repos" style="width:100px;">
        <button class="btn-icon" data-add-exercice="${etape.id}">+ Ajouter</button>
      </div>
    </div>
  `).join('');

  etapesContainer.querySelectorAll('[data-delete-etape]').forEach(btn => {
    btn.addEventListener('click', () => deleteEtape(btn.dataset.deleteEtape));
  });
  etapesContainer.querySelectorAll('[data-delete-exercice]').forEach(btn => {
    btn.addEventListener('click', () => deleteExercice(btn.dataset.deleteExercice));
  });
  etapesContainer.querySelectorAll('[data-add-exercice]').forEach(btn => {
    btn.addEventListener('click', () => addExercice(btn.dataset.addExercice, btn.closest('.admin-add-line')));
  });
}

async function deleteEtape(id) {
  if (!confirm('Supprimer cette étape et tous ses exercices ?')) return;
  try {
    await authFetch(`${API_BASE_URL}/programmes/etapes/${id}`, { method: 'DELETE' });
    showToast('Étape supprimée');
    loadProgramme();
  } catch (err) {
    console.error(err);
    showToast('Erreur', 'error');
  }
}

async function addExercice(etapeId, lineEl) {
  const nom = lineEl.querySelector('.ex-nom').value.trim();
  if (!nom) { showToast('Le nom de l\'exercice est requis', 'error'); return; }

  const nb_series = lineEl.querySelector('.ex-series').value || null;
  const nb_repetitions = lineEl.querySelector('.ex-reps').value.trim() || null;
  const temps_repos = lineEl.querySelector('.ex-repos').value || null;

  try {
    await authFetch(`${API_BASE_URL}/programmes/exercices`, {
      method: 'POST',
      body: JSON.stringify({ etape_id: etapeId, nom, nb_series, nb_repetitions, temps_repos, ordre: 0 })
    });
    showToast('Exercice ajouté');
    loadProgramme();
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de l\'ajout', 'error');
  }
}

async function deleteExercice(id) {
  if (!confirm('Supprimer cet exercice ?')) return;
  try {
    await authFetch(`${API_BASE_URL}/programmes/exercices/${id}`, { method: 'DELETE' });
    showToast('Exercice supprimé');
    loadProgramme();
  } catch (err) {
    console.error(err);
    showToast('Erreur', 'error');
  }
}

// =========================================
// NUTRITION (macros + notes)
// =========================================
const nutritionForm = document.getElementById('nutritionForm');

function fillNutritionForm(nutrition) {
  document.getElementById('nf_calories').value = nutrition?.calories_jour ?? '';
  document.getElementById('nf_proteines').value = nutrition?.proteines_g ?? '';
  document.getElementById('nf_glucides').value = nutrition?.glucides_g ?? '';
  document.getElementById('nf_lipides').value = nutrition?.lipides_g ?? '';
  document.getElementById('nf_notes').value = nutrition?.notes ?? '';
}

nutritionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    calories_jour: document.getElementById('nf_calories').value || null,
    proteines_g: document.getElementById('nf_proteines').value || null,
    glucides_g: document.getElementById('nf_glucides').value || null,
    lipides_g: document.getElementById('nf_lipides').value || null,
    notes: document.getElementById('nf_notes').value.trim() || null
  };

  try {
    await authFetch(`${API_BASE_URL}/programmes/${programmeId}/nutrition`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    showToast('Fiche nutrition enregistrée');
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de l\'enregistrement', 'error');
  }
});

// =========================================
// REPAS
// =========================================
const repasForm = document.getElementById('repasForm');
const repasContainer = document.getElementById('repasContainer');

repasForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const titre = document.getElementById('rf_titre').value.trim();
  const description = document.getElementById('rf_description').value.trim();

  const payload = {
    programme_id: programmeId,
    titre,
    description,
    calories: document.getElementById('rf_calories').value || null,
    proteines_g: document.getElementById('rf_proteines').value || null,
    glucides_g: document.getElementById('rf_glucides').value || null,
    lipides_g: document.getElementById('rf_lipides').value || null,
    ordre: document.querySelectorAll('.admin-repas-card').length + 1
  };

  try {
    await authFetch(`${API_BASE_URL}/programmes/repas`, { method: 'POST', body: JSON.stringify(payload) });
    showToast('Repas ajouté');
    repasForm.reset();
    loadProgramme();
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de l\'ajout', 'error');
  }
});

function renderRepas(repas) {
  if (repas.length === 0) {
    repasContainer.innerHTML = `<div class="admin-empty">Aucun repas type pour l'instant.</div>`;
    return;
  }

  repasContainer.innerHTML = repas.map(r => `
    <div class="admin-repas-card">
      <h4>${escapeHtml(r.titre)} ${r.calories ? `— ${r.calories} kcal` : ''}</h4>
      <p>${escapeHtml(r.description)}</p>
      <button class="btn-icon danger" data-delete-repas="${r.id}">Supprimer</button>
    </div>
  `).join('');

  repasContainer.querySelectorAll('[data-delete-repas]').forEach(btn => {
    btn.addEventListener('click', () => deleteRepas(btn.dataset.deleteRepas));
  });
}

async function deleteRepas(id) {
  if (!confirm('Supprimer ce repas ?')) return;
  try {
    await authFetch(`${API_BASE_URL}/programmes/repas/${id}`, { method: 'DELETE' });
    showToast('Repas supprimé');
    loadProgramme();
  } catch (err) {
    console.error(err);
    showToast('Erreur', 'error');
  }
}

loadProgramme();