window.handleCredentialResponse = function(response) {
  const jwt = response.credential;
  const data = parseJwt(jwt);

  // Zapisz dane użytkownika w localStorage
  localStorage.setItem('loggedUser', JSON.stringify(data));

  // Pokaż dane użytkownika
  showUser(data);

  // Pokaż przycisk wylogowania
  document.getElementById("logout-btn").style.display = 'inline-block';
};

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));

  return JSON.parse(jsonPayload);
}

function showUser(data) {
  document.getElementById("profile-pic").src = data.picture;
  document.getElementById("username").textContent = data.name;
  document.getElementById("user-info").style.display = 'block';
  document.getElementById("logout-btn").style.display = 'inline-block';

  const loginBtn = document.querySelector('.g_id_signin');
  if (loginBtn) loginBtn.style.display = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
  // Sprawdź przy załadowaniu strony, czy użytkownik jest zalogowany (localStorage)
  const savedUser = localStorage.getItem('loggedUser');
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    showUser(userData);
  }

  // Obsługa wylogowania
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      // Usuń dane z localStorage
      localStorage.removeItem('loggedUser');

      // Ukryj dane użytkownika
      document.getElementById("user-info").style.display = 'none';
      document.getElementById("logout-btn").style.display = 'none';

      // Ukryj obrazek i nazwę
      document.getElementById("profile-pic").src = '';
      document.getElementById("username").textContent = '';

      // Pokaż przycisk logowania Google
      const loginBtn = document.querySelector('.g_id_signin');
      if (loginBtn) loginBtn.style.display = 'inline-block';

      // Wymuś nowe logowanie
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
      }
    });
  }
});
