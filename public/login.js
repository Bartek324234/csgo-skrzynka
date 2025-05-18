import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');

loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) {
    alert('Błąd logowania: ' + error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('Błąd wylogowania: ' + error.message);
  }
  showUser(null);
});

async function showUser(user) {
  if (user) {
    // Pobieranie profilu i balansu
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Błąd pobierania profilu:', error);
    }

    const balance = data?.balance ?? 0;

    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userInfoDiv.innerHTML = `
      <p>Imię: ${user.user_metadata?.full_name || 'brak'}</p>
      <img src="${user.user_metadata?.avatar_url || ''}" alt="avatar" width="80" />
      <p>Twój balans: ${balance.toFixed(2)} zł</p>
    `;
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userInfoDiv.innerHTML = '';
  }
}

async function init() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Błąd pobierania sesji:', error);
  }
  showUser(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    showUser(session?.user ?? null);
  });
}

init();




















 const promoSection = document.getElementById('promoSection');
 const promoInput = document.getElementById('promoInput');
 const applyPromoBtn = document.getElementById('applyPromoBtn');
 const promoMsg = document.getElementById('promoMsg');

applyPromoBtn.addEventListener('click', async () => {
  const code = promoInput.value.trim();
  if (!code) return;

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  // Sprawdź czy kod istnieje
  const { data: promo, error: promoErr } = await supabase
    .from('promo_codes')
    .select('value')
    .eq('code', code)
    .single();

  if (promoErr || !promo) {
    promoMsg.textContent = 'Nieprawidłowy kod.';
    return;
  }

  // Sprawdź czy już użyty
  const { data: used, error: usedErr } = await supabase
    .from('used_codes')
    .select('*')
    .eq('user_id', user.id)
    .eq('code', code)
    .single();

  if (used) {
    promoMsg.textContent = 'Już użyłeś tego kodu.';
    return;
  }

  // Dodaj balans
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ balance: supabase.rpc('increment_balance', { user_id: user.id, amount: promo.value }) })
    .eq('id', user.id);

  if (updateErr) {
    promoMsg.textContent = 'Błąd dodawania środków.';
    return;
  }




  
 // Zapisz użycie kodu
  await supabase.from('used_codes').insert({
    user_id: user.id,
    code: code
  });

  promoMsg.textContent = `Dodano ${promo.value.toFixed(2)} zł do salda!`;
  showUser(user); // odśwież balans
});