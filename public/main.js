document.addEventListener('DOMContentLoaded', () => {
  const balanceDiv = document.getElementById('balance');
  const messagesDiv = document.getElementById('messages');
  const wynikP = document.getElementById('wynik');
  const itemImage = document.getElementById('itemImage');
  const promoInput = document.getElementById('promoCode');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const losujBtn = document.getElementById('losujBtn');

  let userId = null;
  let balance = 0;

  // Sprawdź localStorage
  const saved = localStorage.getItem('loggedUser');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      userId = parsed.sub;
    } catch (e) {
      console.warn('Nie można odczytać użytkownika.');
    }
  }

  if (!userId) {
    messagesDiv.textContent = 'Musisz być zalogowany, aby losować przedmioty.';
    losujBtn.disabled = true;
    applyPromoBtn.disabled = true;
    return;
  }

  function updateBalanceUI() {
    balanceDiv.textContent = `Saldo: ${balance} zł`;
  }

  async function fetchBalance() {
    try {
      const res = await fetch(`/api/waluta/balance?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        balance = data.balance;
        updateBalanceUI();
      }
    } catch (e) {
      console.error('Błąd ładowania salda:', e);
    }
  }

  applyPromoBtn.addEventListener('click', async () => {
    const code = promoInput.value.trim();
    if (!code) return;

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
        messagesDiv.textContent = data.message;
      } else {
        messagesDiv.style.color = 'red';
        messagesDiv.textContent = data.error || 'Błąd';
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

    try {
      const res = await fetch('/api/waluta/losuj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (!res.ok) {
        messagesDiv.style.color = 'red';
        messagesDiv.textContent = data.error || 'Błąd';
        return;
      }

      balance = data.balance;
      updateBalanceUI();

      wynikP.textContent = `Wylosowałeś: ${data.item.name} (${data.item.rarity})`;
      itemImage.src = data.item.image;
      itemImage.alt = data.item.name;
      itemImage.style.display = 'block';

      messagesDiv.style.color = 'green';
      messagesDiv.textContent = `Koszt: 5 zł. Przedmiot dodany: ${data.item.value} zł.`;
    } catch (e) {
      console.error(e);
      messagesDiv.textContent = 'Błąd sieci';
    }
  });

  fetchBalance();
});
