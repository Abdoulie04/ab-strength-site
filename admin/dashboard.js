requireAuth();

// =========================================
// ONGLETS
// =========================================
const tabBtns = document.querySelectorAll('.admin-tab-btn');
const panels = document.querySelectorAll('.admin-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

// =========================================
// PROGRAMMES — liste + formulaire créer/modifier
// =========================================
const programmesList = document.getElementById('programmesList');
const programmeForm = document.getElementById('programmeForm');
const newProgrammeBtn = document.getElementById('newProgrammeBtn');
const cancelProgrammeForm = document.getElementById('cancelProgrammeForm');
const programmeFormSubmit = document.getElementById('programmeFormSubmit');
const programmeFormId = document.getElementById('programmeFormId');

function resetProgrammeForm() {
  programmeForm.reset();
  programmeFormId.value = '';
  programmeFormSubmit.textContent = 'Créer le programme';
}

newProgrammeBtn.addEventListener('click', () => {
  resetProgrammeForm();
  programmeForm.style.display = programmeForm.style.display === 'none' ? 'grid' : 'none';
});

cancelProgrammeForm.addEventListener('click', () => {
  programmeForm.style.display = 'none';
  resetProgrammeForm();
});

function fillProgrammeForm(p) {
  programmeFormId.value = p.id;
  document.getElementById('pf_titre').value = p.titre || '';
  document.getElementById('pf_categorie').value = p.categorie || 'prise_masse';
  document.getElementById('pf_description').value = p.description || '';
  document.getElementById('pf_duree').value = p.duree_semaines || '';
  document.getElementById('pf_niveau').value = p.niveau || 'debutant';
  document.getElementById('pf_seances').value = p.nb_seances_semaine || '';
  document.getElementById('pf_image').value = p.image_couverture || '';
  programmeFormSubmit.textContent = 'Enregistrer les modifications';
  programmeForm.style.display = 'grid';
  programmeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

programmeForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    titre: document.getElementById('pf_titre').value.trim(),
    categorie: document.getElementById('pf_categorie').value,
    description: document.getElementById('pf_description').value.trim(),
    duree_semaines: document.getElementById('pf_duree').value || null,
    niveau: document.getElementById('pf_niveau').value,
    nb_seances_semaine: document.getElementById('pf_seances').value || null,
    image_couverture: document.getElementById('pf_image').value.trim() || null
  };

  const id = programmeFormId.value;

  try {
    const response = await authFetch(
      id ? `${API_BASE_URL}/programmes/${id}` : `${API_BASE_URL}/programmes`,
      { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }
    );

    if (!response.ok) throw new Error('Erreur');

    showToast(id ? 'Programme modifié' : 'Programme créé');
    programmeForm.style.display = 'none';
    resetProgrammeForm();
    loadProgrammes();

  } catch (err) {
    console.error(err);
    showToast('Une erreur est survenue', 'error');
  }
});

async function loadProgrammes() {
  try {
    const response = await authFetch(`${API_BASE_URL}/programmes`);
    const programmes = await response.json();

    if (programmes.length === 0) {
      programmesList.innerHTML = `<div class="admin-empty">Aucun programme pour le moment. Crée le premier avec le bouton ci-dessus.</div>`;
      return;
    }

    programmesList.innerHTML = programmes.map(p => `
      <div class="admin-card">
        <div class="admin-card-info">
          <h3>${escapeHtml(p.titre)}</h3>
          <div class="admin-card-meta">
            <span>${CATEGORIES_LABELS[p.categorie] || p.categorie}</span>
            ${p.niveau ? `<span>${NIVEAUX_LABELS[p.niveau] || p.niveau}</span>` : ''}
            ${p.duree_semaines ? `<span>${p.duree_semaines} sem.</span>` : ''}
          </div>
        </div>
        <div class="admin-card-actions">
          <a href="programme-edit.html?id=${p.id}" class="btn-icon">Gérer le contenu</a>
          <button class="btn-icon" data-edit="${p.id}">Modifier</button>
          <button class="btn-icon danger" data-delete="${p.id}">Supprimer</button>
        </div>
      </div>
    `).join('');

    programmesList.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = programmes.find(x => x.id === parseInt(btn.dataset.edit));
        if (p) fillProgrammeForm(p);
      });
    });

    programmesList.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteProgramme(btn.dataset.delete));
    });

  } catch (err) {
    console.error(err);
    programmesList.innerHTML = `<div class="admin-empty">Impossible de charger les programmes.</div>`;
  }
}

async function deleteProgramme(id) {
  if (!confirm('Supprimer ce programme ? Toutes ses étapes, exercices, nutrition et repas seront supprimés aussi. Cette action est irréversible.')) return;

  try {
    const response = await authFetch(`${API_BASE_URL}/programmes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erreur');
    showToast('Programme supprimé');
    loadProgrammes();
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de la suppression', 'error');
  }
}

// =========================================
// TRANSFORMATIONS — Avant/Après
// =========================================
const transfoForm = document.getElementById('transfoForm');
const transformationsList = document.getElementById('transformationsList');

transfoForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    nom_client: document.getElementById('tf_nom').value.trim() || null,
    description: document.getElementById('tf_description').value.trim() || null,
    image_avant: document.getElementById('tf_avant').value.trim(),
    image_apres: document.getElementById('tf_apres').value.trim(),
    ordre: document.querySelectorAll('.admin-card[data-transfo-id]').length + 1
  };

  try {
    const response = await authFetch(`${API_BASE_URL}/transformations`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Erreur');

    showToast('Transformation ajoutée');
    transfoForm.reset();
    loadTransformations();

  } catch (err) {
    console.error(err);
    showToast('Une erreur est survenue', 'error');
  }
});

async function loadTransformations() {
  try {
    const response = await authFetch(`${API_BASE_URL}/transformations`);
    const transformations = await response.json();

    if (transformations.length === 0) {
      transformationsList.innerHTML = `<div class="admin-empty">Aucune transformation pour le moment.</div>`;
      return;
    }

    transformationsList.innerHTML = transformations.map(t => `
      <div class="admin-card" data-transfo-id="${t.id}">
        <div class="admin-card-info">
          <h3>${escapeHtml(t.nom_client || 'Client anonyme')}</h3>
          ${t.description ? `<p style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">${escapeHtml(t.description)}</p>` : ''}
        </div>
        <div class="admin-card-actions">
          <button class="btn-icon danger" data-delete-transfo="${t.id}">Supprimer</button>
        </div>
      </div>
    `).join('');

    transformationsList.querySelectorAll('[data-delete-transfo]').forEach(btn => {
      btn.addEventListener('click', () => deleteTransformation(btn.dataset.deleteTransfo));
    });

  } catch (err) {
    console.error(err);
    transformationsList.innerHTML = `<div class="admin-empty">Impossible de charger les transformations.</div>`;
  }
}

async function deleteTransformation(id) {
  if (!confirm('Supprimer cette transformation ?')) return;
  try {
    await authFetch(`${API_BASE_URL}/transformations/${id}`, { method: 'DELETE' });
    showToast('Transformation supprimée');
    loadTransformations();
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de la suppression', 'error');
  }
}

// =========================================
// MESSAGES
// =========================================
const messagesList = document.getElementById('messagesList');
const unreadBadge = document.getElementById('unreadBadge');

async function loadMessages() {
  try {
    const response = await authFetch(`${API_BASE_URL}/messages`);
    const messages = await response.json();

    const unreadCount = messages.filter(m => !m.lu).length;
    unreadBadge.textContent = unreadCount > 0 ? `(${unreadCount})` : '';

    if (messages.length === 0) {
      messagesList.innerHTML = `<div class="admin-empty">Aucun message pour le moment.</div>`;
      return;
    }

    messagesList.innerHTML = messages.map(m => `
      <div class="admin-card message-card ${m.lu ? '' : 'unread'}">
        <div class="admin-card-info">
          <h3>${!m.lu ? '<span class="msg-unread-dot"></span>' : ''}${escapeHtml(m.nom)} — ${escapeHtml(m.email)}</h3>
          <div class="admin-card-meta">
            ${m.sujet === 'coaching_personnalise' ? '<span style="color:var(--blue); border-color:var(--blue);">Programme personnalisé</span>' : '<span>Question générale</span>'}
            <span>${new Date(m.date_envoi).toLocaleString('fr-FR')}</span>
          </div>
          <p>${escapeHtml(m.message)}</p>
        </div>
        <div class="admin-card-actions">
          ${!m.lu ? `<button class="btn-icon" data-read="${m.id}">Marquer lu</button>` : ''}
          <button class="btn-icon danger" data-delete-msg="${m.id}">Supprimer</button>
        </div>
      </div>
    `).join('');

    messagesList.querySelectorAll('[data-read]').forEach(btn => {
      btn.addEventListener('click', () => marquerLu(btn.dataset.read));
    });
    messagesList.querySelectorAll('[data-delete-msg]').forEach(btn => {
      btn.addEventListener('click', () => deleteMessage(btn.dataset.deleteMsg));
    });

  } catch (err) {
    console.error(err);
    messagesList.innerHTML = `<div class="admin-empty">Impossible de charger les messages.</div>`;
  }
}

async function marquerLu(id) {
  try {
    await authFetch(`${API_BASE_URL}/messages/${id}/lu`, { method: 'PUT' });
    loadMessages();
  } catch (err) {
    console.error(err);
    showToast('Erreur', 'error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Supprimer ce message ?')) return;
  try {
    await authFetch(`${API_BASE_URL}/messages/${id}`, { method: 'DELETE' });
    showToast('Message supprimé');
    loadMessages();
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de la suppression', 'error');
  }
}

loadProgrammes();
loadTransformations();
loadMessages();