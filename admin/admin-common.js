// =========================================
// GESTION DU TOKEN / AUTH
// =========================================
function getToken() {
  return localStorage.getItem('ab-strength-admin-token');
}

function getAdminName() {
  return localStorage.getItem('ab-strength-admin-name') || 'Admin';
}

function setSession(token, nom) {
  localStorage.setItem('ab-strength-admin-token', token);
  localStorage.setItem('ab-strength-admin-name', nom);
}

function clearSession() {
  localStorage.removeItem('ab-strength-admin-token');
  localStorage.removeItem('ab-strength-admin-name');
}

// À appeler en haut de chaque page protégée (dashboard, programme-edit)
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

// Si on est sur login.html et déjà connecté, direction dashboard
function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.href = 'dashboard.html';
  }
}

// =========================================
// FETCH AUTHENTIFIÉ (ajoute le token, gère les 401)
// =========================================
async function authFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    throw new Error('Session expirée');
  }

  return response;
}

// =========================================
// TOASTS (notifications courtes)
// =========================================
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// =========================================
// DÉCONNEXION
// =========================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });
}

// Affiche le nom de l'admin connecté si l'élément existe
const adminNameEl = document.getElementById('adminName');
if (adminNameEl) {
  adminNameEl.textContent = getAdminName();
}

// =========================================
// UTILITAIRE
// =========================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

const CATEGORIES_LABELS = {
  prise_masse: "Prise de masse",
  seche: "Sèche sans perte musculaire",
  perte_gras: "Perte de gras",
  maintien: "Maintien de forme",
  cardio: "Cardio",
  perte_poids: "Perte de poids"
};

const NIVEAUX_LABELS = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé"
};