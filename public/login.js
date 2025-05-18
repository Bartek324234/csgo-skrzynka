// Podstawowa inicjalizacja Supabase - wstaw swoje wartości!
const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co'; // Twój URL Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'; // Twój publiczny anon key z Supabase → Settings → API

const supabase = Supabase.createClient(supabaseUrl, supabaseAnonKey);


const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');

// Logowanie przez Google (OAuth)
loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) {
    alert('Błąd logowania: ' + error.message);
  }
});

// Wylogowanie
logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('Błąd wylogowania: ' + error.message);
  }
  showUser(null);
});

// Funkcja pokazująca informacje o zalogowanym użytkowniku
function showUser(user) {
  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userInfoDiv.innerHTML = `
      <p>Zalogowany użytkownik:</p>
      <p>Id: ${user.id}</p>
      <p>Email: ${user.email}</p>
      <p>Imię: ${user.user_metadata?.full_name || 'brak'}</p>
      <img src="${user.user_metadata?.avatar_url || ''}" alt="avatar" width="80" />
    `;
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userInfoDiv.innerHTML = '';
  }
}

// Sprawdzamy, czy użytkownik jest zalogowany podczas ładowania strony
supabase.auth.getSession().then(({ data: { session } }) => {
  showUser(session?.user || null);
});

// Nasłuchujemy zmian w sesji (np. po powrocie z Google OAuth)
supabase.auth.onAuthStateChange((_event, session) => {
  showUser(session?.user || null);
});
