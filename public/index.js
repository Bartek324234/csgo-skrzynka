document.addEventListener('DOMContentLoaded', () => {
  const balanceDisplay = document.getElementById('balance-display');
  const promoInput = document.getElementById('promoCode');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const messagesDiv = document.getElementById('messages');

  const loggedUserJSON = localStorage.getItem('loggedUser');
  if (!loggedUserJSON) {
    // Jeśli nie jesteśmy zalogowani, ukryj saldo i kod
    if (balanceDisplay) balanceDisplay.style.display = 'none';
    if (promoInput) promoInput.style.display = 'none';
    if (applyPromoBtn) applyPromoBtn.style.display = 'none';
    return;
  }

  const loggedUser = JSON.parse(loggedUserJSON);
  const userId = loggedUser.sub;

  // Funkcja do aktualizacji UI
  function updateBalanceUI(balance) {
    if (balanceDisplay) {
      balanceDisplay.textContent = `Saldo: ${balance} zł`;
      balanceDisplay.style.display = 'block';
    }
  }

  // Funkcja pobierająca saldo
  async function fetchBalance() {
    try {
      const res = await fetch(`/api/waluta/balance?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (res.ok) {
        updateBalanceUI(data.balance);
      } else {
        messagesDiv.textContent = data.error || 'Błąd ładowania salda';
      }
    } catch (err) {
      messagesDiv.textContent = 'Błąd sieci przy pobieraniu salda';
    }
  }

  // Obsługa przycisku promocyjnego
  applyPromoBtn.addEventListener('click', async () => {
    const code = promoInput.value.trim();
    if (!code) {
      messagesDiv.style.color = 'red';
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
        updateBalanceUI(data.balance);
        messagesDiv.style.color = 'green';
        messagesDiv.textContent = `Kod aktywowany! Nowe saldo: ${data.balance} zł`;
      } else {
        messagesDiv.style.color = 'red';
        messagesDiv.textContent = data.error || 'Nieprawidłowy kod';
      }
    } catch (err) {
      messagesDiv.style.color = 'red';
      messagesDiv.textContent = 'Błąd sieci';
    }
  });

  // Startowo pobierz saldo
  fetchBalance();
});
