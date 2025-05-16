document.addEventListener('DOMContentLoaded', () => {
  const balanceDiv = document.getElementById('balance');
  const messagesDiv = document.getElementById('messages');
  const wynikP = document.getElementById('wynik');
  const itemImage = document.getElementById('itemImage');
  const promoInput = document.getElementById('promoCode');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const losujBtn = document.getElementById('losujBtn');

  const userId = 'user123'; // Przykładowy identyfikator użytkownika

  let balance = 0;

  async function fetchBalance() {
    try {
      const res = await fetch(`/api/waluta/balance?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        balance = data.balance;
        updateBalanceUI();
      } else {
        balanceDiv.textContent = 'Błąd ładowania salda';
      }
    } catch (e) {
      console.error('Błąd pobierania salda:', e);
      balanceDiv.textContent = 'Błąd sieci';
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
      const data = await res.json();
      if (res.ok) {
        balance = data.balance;
        updateBalanceUI();
        wynikP.textContent = `Wylosowałeś: ${data.item.name} (${data.item.rarity})`;
        itemImage.src = data.item.image;
        itemImage.alt = data.item.name;
        itemImage.style.display = 'block';
        messagesDiv.style.color = 'green';
        messagesDiv.textContent = `Koszt losowania 5 zł został pobrany. Do salda dodano wartość przedmiotu: ${data.item.value} zł.`;
      } else {
        messagesDiv.style.color = 'red';
        messagesDiv.textContent = data.error || 'Błąd podczas losowania';
      }
    } catch (e) {
      messagesDiv.style.color = 'red';
      messagesDiv.textContent = 'Błąd sieci podczas losowania';
      console.error(e);
    }
  });

  fetchBalance();
});
