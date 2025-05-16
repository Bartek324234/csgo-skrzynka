document.addEventListener('DOMContentLoaded', () => {
  const balanceDiv = document.getElementById('balance');
  const messagesDiv = document.getElementById('messages');
  const promoInput = document.getElementById('promoCode');
  const applyPromoBtn = document.getElementById('applyPromoBtn');

  const userId = 'user123'; // Tymczasowy identyfikator użytkownika
  let balance = 0;

  async function fetchBalance() {
    try {
      const res = await fetch(`/api/waluta/balance?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        balance = data.balance;
        updateBalanceUI();
      } else {
        messagesDiv.textContent = data.error || 'Błąd ładowania salda';
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
        messagesDiv.textContent = `Kod aktywowany! Nowe saldo: ${balance} zł`;
      } else {
        messagesDiv.style.color = 'red';
        messagesDiv.textContent = data.error || 'Niepoprawny kod';
      }
    } catch (e) {
      messagesDiv.style.color = 'red';
      messagesDiv.textContent = 'Błąd sieci';
    }
  });

  fetchBalance();
});
