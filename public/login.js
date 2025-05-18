import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'
);

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');
const promoSection = document.getElementById('promoSection');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMsg = document.getElementById('promoMsg');

// LOGOWANIE
loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });
  if (error) alert('Błąd logowania: ' + error.message);
});

// WYLOGOWANIE
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  updateUI(null);
});

// FUNKCJA: Tworzy nowy wpis w user_balances
async function createBalanceRecord(userId) {
  const { error } = await supabase
    .from('user_balances')
    .insert({ user_id: userId, balance: 0 });
  if (error) console.error('Błąd tworzenia balansu:', error.message);
}

// FUNKCJA: Pobiera aktualny balans użytkownika
async function getUserBalance(userId) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('balance')
    .eq('user_id', userId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      await createBalanceRecord(userId);
      return 0;
    } else {
      console.error('Błąd pobierania balansu:', error.message);
      return null;
    }
  }
  return data.balance;
}

// FUNKCJA: Aktualizacja UI
async function updateUI(user) {
  if (user) {
    const balance = await getUserBalance(user.id);
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    promoSection.style.display = 'block';
    userInfoDiv.innerHTML = `
      <p>Witaj, ${user.user_metadata.full_name}</p>
      <img src="${user.user_metadata.avatar_url}" width="80" />
      <p><strong>Twój balans:</strong> ${balance.toFixed(2)} zł</p>
    `;
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    promoSection.style.display = 'none';
    userInfoDiv.innerHTML = '';
  }
}

// FUNKCJA: Obsługa kodów promocyjnych
applyPromoBtn.addEventListener('click', async () => {
  const code = promoInput.value.trim();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user || !code) return;

  const { data: promo, error: promoErr } = await supabase
    .from('promo_codes')
    .select('value')
    .eq('code', code)
    .single();

  if (promoErr || !promo) {
    promoMsg.textContent = 'Nieprawidłowy kod.';
    return;
  }

  const { data: used } = await supabase
    .from('used_codes')
    .select('*')
    .eq('user_id', user.id)
    .eq('code', code)
    .maybeSingle();

  if (used) {
    promoMsg.textContent = 'Już użyłeś tego kodu.';
    return;
  }

  const { error: updateErr } = await supabase
    .from('user_balances')
    .update({ balance: promo.value })
    .eq('user_id', user.id);

  if (updateErr) {
    promoMsg.textContent = 'Błąd dodawania środków.';
    return;
  }

  await supabase
    .from('used_codes')
    .insert({ user_id: user.id, code });

  promoMsg.textContent = 'Kod został zastosowany!';
  updateUI(user);
});

// INICJALIZACJA
async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  updateUI(session?.user ?? null);
  supabase.auth.onAuthStateChange((_event, session) => {
    updateUI(session?.user ?? null);
  });
}

init();
