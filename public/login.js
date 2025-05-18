import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase config
const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'
);

// DOM
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');
const promoSection = document.getElementById('promoSection');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMsg = document.getElementById('promoMsg');

// Logowanie
loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) alert('Błąd logowania: ' + error.message);
});

// Wylogowanie
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  updateUI(null);
});

// Główna funkcja interfejsu
async function updateUI(user) {
  if (user) {
    await ensureUserBalance(user.id);

    const { data, error } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const balance = data?.balance ?? 0;

    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    promoSection.style.display = 'block';
    userInfoDiv.innerHTML = `
      <p>Witaj, ${user.user_metadata.full_name}</p>
      <img src="${user.user_metadata.avatar_url}" width="80" />
      <p>Twój balans: <strong id="balance">${balance.toFixed(2)} zł</strong></p>
    `;
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    promoSection.style.display = 'none';
    userInfoDiv.innerHTML = '';
  }
}

// Upewnij się, że użytkownik ma wpis w `user_balances`
async function ensureUserBalance(userId) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Brak wpisu – tworzymy
    await supabase.from('user_balances').insert({ user_id: userId, balance: 0 });
  }
}

// Obsługa kodów promocyjnych
applyPromoBtn.addEventListener('click', async () => {
  const code = promoInput.value.trim();
  if (!code) return;

  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;
  if (!user) {
    promoMsg.textContent = 'Musisz się zalogować, aby użyć kodu.';
    return;
  }

  const userId = user.id;

  // Sprawdź, czy kod promocyjny istnieje
  const { data: promo, error: promoErr } = await supabase
    .from('promo_codes')
    .select('value')
    .eq('code', code)
    .single();

  if (promoErr || !promo) {
    promoMsg.textContent = 'Nieprawidłowy kod.';
    return;
  }

  // Sprawdź, czy użytkownik już użył tego kodu
  const { data: used, error: usedError } = await supabase
    .from('used_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .single();

  if (used) {
    promoMsg.textContent = 'Już użyłeś tego kodu.';
    return;
  } else if (usedError && usedError.code !== 'PGRST116') {
    // Inny błąd niż "record not found"
    console.error('Błąd przy sprawdzaniu użycia kodu:', usedError.message);
    promoMsg.textContent = 'Błąd serwera, spróbuj później.';
    return;
  }

  // Dodaj wpis do used_codes (zapamiętaj użycie kodu)
  const { error: insertErr } = await supabase
    .from('used_codes')
    .insert([{ user_id: userId, code }]);

  if (insertErr) {
    promoMsg.textContent = 'Błąd zapisu użycia kodu.';
    return;
  }

  // Pobierz aktualny balans użytkownika
  const { data: balanceData, error: balanceErr } = await supabase
    .from('user_balances')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (balanceErr) {
    promoMsg.textContent = 'Błąd pobierania balansu.';
    return;
  }

  const currentBalance = balanceData?.balance ?? 0;
  const newBalance = currentBalance + promo.value;

  // Zaktualizuj balans
  const { error: updateErr } = await supabase
    .from('user_balances')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  if (updateErr) {
    promoMsg.textContent = 'Błąd aktualizacji balansu.';
    return;
  }

  promoMsg.textContent = `Kod zastosowany! Dodano ${promo.value} zł.`;
  document.getElementById('balance').textContent = `${newBalance.toFixed(2)} zł`;
  promoInput.value = '';
});

// Inicjalizacja
async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  updateUI(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    updateUI(session?.user ?? null);
  });
}

init();
