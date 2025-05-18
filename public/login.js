// Ten plik musi być załączony jako <script type="module"> w HTML!
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // skrócony dla czytelności

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// DOM
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');
const promoSection = document.getElementById('promoSection');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMsg = document.getElementById('promoMsg');

// Login
loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) {
    alert('Błąd logowania: ' + error.message);
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('Błąd wylogowania: ' + error.message);
  }
  showUser(null);
});

// Pokaż użytkownika
async function showUser(user) {
  if (user) {
    let { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      const { error: insertErr } = await supabase
        .from('profiles')
        .insert({ id: user.id, balance: 0 });

      if (insertErr) {
        console.error('Błąd tworzenia profilu:', insertErr);
        return;
      }

      ({ data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single());
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

// Obsługa kodu promocyjnego
applyPromoBtn.addEventListener('click', async () => {
  const code = promoInput.value.trim();
  if (!code) return;

  const user = (await supabase.auth.getUser()).data.user;
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

  const { error: rpcErr } = await supabase.rpc('increment_balance', {
    user_id: user.id,
    amount: promo.value
  });

  if (rpcErr) {
    promoMsg.textContent = 'Błąd dodawania środków.';
    return;
  }

  // Zapisz użycie kodu
  await supabase.from('used_codes').insert({
    user_id: user.id,
    code: code
  });

  promoMsg.textContent = `Dodano ${promo.value.toFixed(2)} zł do salda!`;
  showUser(user); // odśwież
});

// Inicjalizacja
async function init() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) console.error('Błąd sesji:', error);
  showUser(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    showUser(session?.user ?? null);
  });
}

init();
