// login.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // skrócone dla czytelności

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');

loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) alert('Błąd logowania: ' + error.message);
});

logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) alert('Błąd wylogowania: ' + error.message);
  showUser(null);
});

async function showUser(user) {
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    const balance = data?.balance ?? 0;

    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userInfoDiv.innerHTML = `
      <p>Imię: ${user.user_metadata?.full_name || 'brak'}</p>
      <img src="${user.user_metadata?.avatar_url || ''}" alt="avatar" width="80" />
      <p>Twój balans: ${balance.toFixed(2)} zł</p>
      <input type="text" id="promoInput" placeholder="Wpisz kod promocyjny" />
      <button id="redeemBtn">Użyj kod</button>
      <p id="promoMsg"></p>
    `;

    document.getElementById('redeemBtn').addEventListener('click', async () => {
      const code = document.getElementById('promoInput').value.trim();
      const msg = document.getElementById('promoMsg');

      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (!promo || promoError) {
        msg.textContent = 'Nieprawidłowy kod!';
        return;
      }

      if (promo.used_by.includes(user.id)) {
        msg.textContent = 'Ten kod został już przez Ciebie użyty!';
        return;
      }

      if (promo.used_by.length >= promo.max_uses) {
        msg.textContent = 'Limit użyć tego kodu został wyczerpany!';
        return;
      }

      // Dodaj saldo
      const newBalance = balance + promo.amount;
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);

      // Zaktualizuj użycie kodu
      await supabase
        .from('promo_codes')
        .update({ used_by: [...promo.used_by, user.id] })
        .eq('code', code);

      msg.textContent = `Kod wykorzystany! Otrzymałeś ${promo.amount} zł`;
      showUser(user); // Odśwież dane
    });
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userInfoDiv.innerHTML = '';
  }
}

supabase.auth.getSession().then(({ data: { session } }) => {
  showUser(session?.user || null);
});

supabase.auth.onAuthStateChange((_event, session) => {
  showUser(session?.user || null);
});
