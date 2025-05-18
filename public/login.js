import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');
const promoSection = document.getElementById('promoSection');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMsg = document.getElementById('promoMsg');

// Logowanie Google z przekierowaniem na aktualną stronę
loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) alert('Błąd logowania: ' + error.message);
});

// Wylogowanie
logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) alert('Błąd wylogowania: ' + error.message);
  showUser(null);
});

// Funkcja pokazująca UI użytkownika lub ukrywająca promo jeśli brak użytkownika
function showUser(user) {
  if (user) {
    promoSection.style.display = 'block'; // pokaż promo po zalogowaniu
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userInfoDiv.innerHTML = `
      <p>Witaj, ${user.user_metadata?.full_name || 'User'}</p>
      <img src="${user.user_metadata?.avatar_url || ''}" alt="avatar" width="80" />
    `;
  } else {
    promoSection.style.display = 'none'; // ukryj promo bez zalogowania
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userInfoDiv.innerHTML = '';
  }
}

// Obsługa kodu promocyjnego - prosta wiadomość, rozbuduj według potrzeb
applyPromoBtn.addEventListener('click', async () => {
  const code = promoInput.value.trim();
  if (!code) {
    promoMsg.textContent = 'Wpisz kod promocyjny!';
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    promoMsg.textContent = 'Musisz się zalogować, aby użyć kodu.';
    return;
  }

  // Tu dodaj swoją logikę sprawdzania kodu w bazie i aktualizacji balansu

  promoMsg.textContent = `Kod "${code}" zastosowany!`;
});

// Inicjalizacja - pobierz sesfghję i reaguj na zmiany statusu
async function init() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) console.error('Błąd pobierania sesji:', error);
  showUser(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    showUser(session?.user ?? null);
  });
}

init();
