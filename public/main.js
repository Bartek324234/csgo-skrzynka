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

  async function fetchBalance() {
    try {
      const res = await fetch(`/api/waluta/balance?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        balance = data.balance;
        updateBalanceUI();
      }
    } catch (e) {
      console.error('Błąd pobierania salda:', e);
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
      // POST z userId
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

  fetchBalance();
});
