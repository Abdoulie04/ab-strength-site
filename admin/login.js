redirectIfLoggedIn();

const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginSubmit = document.getElementById('loginSubmit');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nom_utilisateur = document.getElementById('nom_utilisateur').value.trim();
  const mot_de_passe = document.getElementById('mot_de_passe').value;

  loginError.textContent = '';
  loginSubmit.disabled = true;
  loginSubmit.textContent = 'Connexion...';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom_utilisateur, mot_de_passe })
    });

    const data = await response.json();

    if (!response.ok) {
      loginError.textContent = data.message || 'Identifiants incorrects';
      return;
    }

    setSession(data.token, data.nom_utilisateur);
    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error(err);
    loginError.textContent = 'Impossible de se connecter au serveur. Réessaie.';
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = 'Se connecter';
  }
});