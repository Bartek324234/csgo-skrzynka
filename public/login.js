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
const balanceSection = document.getElementById('balanceSection');
const userBalanceSpan = document.getElementById('userBalance');

loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) alert('Błąd logowania: ' + error.message);
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  updateUI(null);
  promoMsg.textContent = '';
});

async function getBalance(userId) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('balance')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.error('Błąd pobierania balansu:', error);
    return null;
  }
  return data?.balance ?? 0;
}

async function createBalanceRecord(userId) {
  const { error } = await supabase
    .from('user_balances')
    .insert([{ user_id: userId, balance: 0 }]);
  if (error) {
    console.error('Błąd tworzenia rekordu balansu:', error);
  }
}

async function updateBalance(userId, newBalance) {
  const { error } = await supabase
    .from('user_balances')
    .update({ balance: newBalance })
    .eq('user_id', userId);
  if (error) {
    console.error('Błąd aktualizacji balansu:', error);
  }
}

async function updateUI(user) {
  if (!user) {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userInfoDiv.innerHTML = '';
    promoSection.style.display = 'none';
    balanceSection.style.display = 'none';
    return;
  }

  loginBtn.style.display = 'none';
  logoutBtn.style.display = 'inline-block';
  promoSection.style.display = 'block';
  balanceSection.style.display = 'block';

  userInfoDiv.innerHTML = `
    <p>Witaj, ${user.user_metadata.full_name}</p>
    <img src="${user.user_metadata.avatar_url}" width="80" />
  `;

  let balance = await getBalance(user.id);
  if (balance === null) {
    await createBalanceRecord(user.id);
    balance = 0;
  }
  userBalanceSpan.textContent = balance.toFixed(2);
}

applyPromoBtn.addEventListener('click', async () => {
  promoMsg.textContent = '';
  const code = promoInput.value.trim();
  if (!code) {
    promoMsg.textContent = 'Proszę wpisać kod promocyjny.';
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    promoMsg.textContent = 'Musisz być zalogowany, aby użyć kodu.';
    return;
  }

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

  let balance = await getBalance(user.id);
  if (balance === null) {
    await createBalanceRecord(user.id);
    balance = 0;
  }

  const newBalance = balance + promo.value;

  await updateBalance(user.id, newBalance);

  const { error: insertErr } = await supabase
    .from('used_codes')
    .insert([{ user_id: user.id, code: code }]);

  if (insertErr) {
    promoMsg.textContent = 'Błąd zapisywania użycia kodu.';
    console.error(insertErr);
    return;
  }

  userBalanceSpan.textContent = newBalance.toFixed(2);
  promoMsg.textContent = `Kod "${code}" zastosowany! Dodano ${promo.value} zł.`;
  promoInput.value = '';
});

async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  updateUI(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    updateUI(session?.user ?? null);
    promoMsg.textContent = '';
    promoInput.value = '';
  });
}

init();
