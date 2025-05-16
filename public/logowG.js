window.handleCredentialResponse = function(response) {
  const jwt = response.credential;
  const data = parseJwt(jwt);

  // Zapisz dane użytkownika w localStorage
  localStorage.setItem('loggedUser', JSON.stringify(data));

  // Pokaż dane użytkownika
  showUser(data);

  // Pokaż przycisk wylogowania
  document.getElementById("logout-btn").style.display = 'inline-block';

  // Załaduj saldo użytkownika
  loadUserBalance(data.sub);
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

async function loadUserBalance(userId) {
  try {
    const res = await fetch(`/api/waluta/balance?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    const balanceDiv = document.getElementById('balance');
    if (res.ok) {
      balanceDiv.textContent = `Saldo: ${data.balance} zł`;
    } else {
      balanceDiv.textContent = 'Błąd ładowania salda';
    }
  } catch (e) {
    document.getElementById('balance').textContent = 'Błąd sieci';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem('loggedUser');
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    showUser(userData);
    loadUserBalance(userData.sub); // ← Załaduj saldo przy starcie
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem('loggedUser');

      document.getElementById("user-info").style.display = 'none';
      document.getElementById("logout-btn").style.display = 'none';
      document.getElementById("profile-pic").src = '';
      document.getElementById("username").textContent = '';

      const loginBtn = document.querySelector('.g_id_signin');
      if (loginBtn) loginBtn.style.display = 'inline-block';

      const balanceDiv = document.getElementById('balance');
      balanceDiv.textContent = 'Saldo: 0 zł';

      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
      }
    });
  }
});
