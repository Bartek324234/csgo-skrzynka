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

loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) alert('Błąd logowania: ' + error.message);
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  updateUI(null);
});

async function updateUI(user) {
  if (user) {
    // Pobierz balans z tabeli "profiles"
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    const balance = profile?.balance ?? 0;

    userInfoDiv.innerHTML = `
      <p>Witaj, ${user.user_metadata.full_name}</p>
      <img src="${user.user_metadata.avatar_url}" width="80" />
      <p>Twój balans: ${balance.toFixed(2)} zł</p>
    `;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    promoSection.style.display = 'block';
  } else {
    userInfoDiv.innerHTML = '';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    promoSection.style.display = 'none';
  }
}

applyPromoBtn.addEventListener('click', async () => {
  const code = promoInput.value.trim();
  if (!code) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Sprawdź kod promocyjny
  const { data: promo, error: promoErr } = await supabase
    .from('promo_codes')
    .select('value')
    .eq('code', code)
    .single();

  if (promoErr || !promo) {
    promoMsg.textContent = 'Nieprawidłowy kod.';
    return;
  }

  // Czy kod już był użyty?
  const { data: used } = await supabase
    .from('used_codes')
    .select('*')
    .eq('user_id', user.id)
    .eq('code', code)
    .maybeSingle();

  if (used) {
    promoMsg.textContent = 'Już użyto tego kodu.';
    return;
  }

  // Zwiększ balans
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', user.id)
    .single();

  const newBalance = (currentProfile?.balance || 0) + promo.value;

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', user.id);

  if (updateErr) {
    promoMsg.textContent = 'Błąd aktualizacji salda.';
    return;
  }

  // Zapisz użycie kodu
  await supabase
    .from('used_codes')
    .insert({ user_id: user.id, code });

  promoMsg.textContent = `Kod zastosowany! Dodano ${promo.value} zł`;
  promoInput.value = '';
  updateUI(user);
});

async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  updateUI(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    updateUI(session?.user ?? null);
  });
}

init();
