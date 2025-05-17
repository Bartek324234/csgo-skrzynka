import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedUser'));
  if (!user || !user.sub) {
    alert('Musisz być zalogowany');
    return;
  }

  const userId = user.sub;
  const balanceDiv = document.getElementById('balance');
  const messagesDiv = document.getElementById('messages');
  const wynikP = document.getElementById('wynik');
  const itemImage = document.getElementById('itemImage');
  const promoInput = document.getElementById('promoCode');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const losujBtn = document.getElementById('losujBtn');

  let balance = 0;

  // Sprawdź i dodaj użytkownika do Supabase, jeśli nie istnieje
  async function ensureUserExists() {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const { email } = user;
        const username = email?.split('@')[0] || 'anon';
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ id: userId, email, username, balance: 0 }]);
        if (insertError) {
          console.error('Błąd dodawania użytkownika:', insertError.message);
        } else {
          console.log('Użytkownik dodany do Supabase');
        }
      } else {
        console.error('Błąd sprawdzania użytkownika:', error.message);
      }
    }
  }

  // Pobierz saldo bezpośrednio z Supabase
  async function fetchBalance() {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Błąd pobierania salda:', error.message);
    } else {
      balance = data.balance;
      updateBalanceUI();
    }
  }

  function updateBalanceUI() {
    balanceDiv.textContent = `Saldo: ${balance} zł`;
  }

  applyPromoBtn.addEventListener('click', async () => {
    const code = promoInput.value.trim();
    if (!code) {
      messagesDiv.textContent = 'Wpisz kod promocyjny!';
      return;
    }

    try {
      const res = await fetch('/api/waluta/kod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      const data = await res.json();
      if (res.ok) {
        balance = data.balance;
        updateBalanceUI();
        messagesDiv.style.color = 'green';
        messagesDiv.textContent = `Kod aktywowany! Masz teraz ${balance} zł`;
      } else {
        messagesDiv.style.color = 'red';
        messagesDiv.textContent = data.error || 'Błąd aktywacji kodu';
      }
    } catch (e) {
      messagesDiv.style.color = 'red';
      messagesDiv.textContent = 'Błąd sieci';
    }
  });

  losujBtn.addEventListener('click', async () => {
    messagesDiv.textContent = '';
    wynikP.textContent = '';
    itemImage.style.display = 'none';

    if (balance < 5) {
      messagesDiv.style.color = 'red';
      messagesDiv.textContent = 'Nie masz wystarczająco środków (koszt losowania: 5 zł)';
      return;
    }

    try {
      const res = await fetch('/api/waluta/losuj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        const err = await res.json();
        messagesDiv.style.color = 'red';
        messagesDiv.textContent = err.error || 'Błąd podczas losowania';
        return;
      }

      const data = await res.json();
      balance = data.balance;
      updateBalanceUI();

      const item = data.item;
      wynikP.textContent = `Wylosowałeś: ${item.name} (${item.rarity})`;
      itemImage.src = item.image;
      itemImage.alt = item.name;
      itemImage.style.display = 'block';

      messagesDiv.style.color = 'green';
      messagesDiv.textContent = `Koszt losowania 5 zł został pobrany. Do salda dodano wartość przedmiotu: ${item.value} zł.`;
    } catch (e) {
      messagesDiv.style.color = 'red';
      messagesDiv.textContent = 'Błąd sieci podczas losowania';
      console.error(e);
    }
  });

  // Start
  ensureUserExists().then(fetchBalance);
});
