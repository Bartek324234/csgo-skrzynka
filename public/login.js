import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'
);

// Elementy z HTML
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');
const promoSection = document.getElementById('promoSection');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMsg = document.getElementById('promoMsg');
const balanceSection = document.getElementById('balanceSection');
const userBalanceSpan = document.getElementById('userBalance');

// Logowanie
loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) alert('Błąd logowania: ' + error.message);
});

// Wylogowanie
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  updateUI(null);
});

// Aktualizacja interfejsu i tworzenie profilu
async function updateUI(user) {
  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userInfoDiv.innerHTML = `
      <p>Witaj, ${user.user_metadata.full_name}</p>
      <img src="${user.user_metadata.avatar_url}" width="80" />
    `;
    promoSection.style.display = 'block';
    balanceSection.style.display = 'block';

    // Sprawdź czy profil istnieje
    let { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      const { error: insertErr } = await supabase
        .from('profiles')
        .insert({ id: user.id, balance: 0 });

      if (insertErr) {
        console.error('Błąd tworzenia profilu:', insertErr);
        return;
      }

      profile = { balance: 0 };
    }

    userBalanceSpan.textContent = profile.balance.toFixed(2);
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userInfoDiv.innerHTML = '';
    promoSection.style.display = 'none';
    balanceSection.style.display = 'none';
  }
}

// Obsługa kodu promocyjnego
applyPromoBtn.addEventListener('click', async () => {
  const code = promoInput.value.trim();
  if (!code) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

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
    .single();

  if (used) {
    promoMsg.textContent = 'Już użyłeś tego kodu.';
    return;
  }

  // Pobierz aktualny balans
  let { data: profile } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', user.id)
    .single();

  const newBalance = (profile?.balance || 0) + promo.value;

  // Zaktualizuj balans
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', user.id);

  if (updateErr) {
    promoMsg.textContent = 'Błąd przy aktualizacji balansu.';
    return;
  }

  // Zapisz użycie kodu
  await supabase
    .from('used_codes')
    .insert({ user_id: user.id, code });

  promoMsg.textContent = `Kod "${code}" został zastosowany!`;
  userBalanceSpan.textContent = newBalance.toFixed(2);
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
