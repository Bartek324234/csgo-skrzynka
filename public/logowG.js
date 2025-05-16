 function handleCredentialResponse(response) {
    const jwt = response.credential;
    const data = parseJwt(jwt);

    // Pokaż dane użytkownika
    document.getElementById("profile-pic").src = data.picture;
    document.getElementById("username").textContent = data.name;
    document.getElementById("user-info").style.display = 'block';

    // Pokaż przycisk wylogowania
    document.getElementById("logout-btn").style.display = 'inline-block';
}
  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    return JSON.parse(jsonPayload);
  }
  document.getElementById("logout-btn").addEventListener("click", function () {
    // Ukryj dane użytkownika
    document.getElementById("user-info").style.display = 'none';
    document.getElementById("logout-btn").style.display = 'none';
    
    // Ukryj obrazek i nazwę
    document.getElementById("profile-pic").src = '';
    document.getElementById("username").textContent = '';

    // Opcjonalnie: odśwież przycisk logowania (po wylogowaniu)
    google.accounts.id.disableAutoSelect(); // Wymuś nowe logowanie
});