import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jotdnbkfgqtznjwbfjno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM"
);

// Pobierz saldo użytkownika
async function loadBalance(userId) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Błąd ładowania salda:', error);
    return 0;
  }

  return data?.balance ?? 0;
}

// Główna logika UI
async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    alert("Musisz się zalogować.");
    window.location.href = "/index.html";
    return;
  }

  const balanceEl = document.getElementById('balance');
  const resultEl = document.getElementById('result');
  const imageEl = document.getElementById('resultImage');
  const drawBtn = document.getElementById('drawBtn');
  const actionButtons = document.getElementById('actionButtons');
  const sellBtn = document.getElementById('sellBtn');
  const keepBtn = document.getElementById('keepBtn');

  const balance = await loadBalance(user.id);
  if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;
  if (resultEl) resultEl.textContent = '';
  if (imageEl) imageEl.style.display = 'none';
  if (actionButtons) actionButtons.style.display = 'none';

  if (drawBtn) {
    drawBtn.addEventListener('click', async () => {
      try {
        drawBtn.disabled = true;

        const response = await fetch('/api/losuj', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Błąd serwera:', text);
          if (resultEl) resultEl.textContent = 'Błąd serwera podczas losowania.';
          return;
        }

        const result = await response.json();

        // Wyświetl wynik losowania
        if (result.message) {
          if (resultEl) resultEl.textContent = result.message;
          if (result.image && imageEl) {
            imageEl.src = result.image;
            imageEl.style.display = 'block';
          }

          // Pokaż przyciski Sprzedaj i Dodaj do ekwipunku
          if (actionButtons) actionButtons.style.display = 'block';

          // Obsługa sprzedaży
          if (sellBtn) {
            sellBtn.onclick = async () => {
              try {
                const sellResponse = await fetch('/api/sell-item', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user.id,
                    value: result.value // zakładamy, że losowanie zwraca cenę przedmiotu
                  })
                });

                const sellData = await sellResponse.json();

                if (sellData.newBalance && balanceEl) {
                  balanceEl.textContent = `${sellData.newBalance.toFixed(2)} zł`;
                }

                resultEl.textContent = 'Przedmiot sprzedany!';
                imageEl.style.display = 'none';
                actionButtons.style.display = 'none';
              } catch (err) {
                console.error("Błąd sprzedaży:", err);
                resultEl.textContent = "Błąd sprzedaży przedmiotu.";
              }
            };
          }

          // Obsługa dodania do ekwipunku
          if (keepBtn) {
            keepBtn.onclick = async () => {
              try {
                await supabase.from('user_inventory').insert([{
                  user_id: user.id,
                  item_name: result.message,
                  image_url: result.image
                }]);

                resultEl.textContent = 'Dodano do ekwipunku!';
                actionButtons.style.display = 'none';
              } catch (err) {
                console.error("Błąd dodania do ekwipunku:", err);
                resultEl.textContent = "Błąd dodania do ekwipunku.";
              }
            };
          }
        }

        // Aktualizuj saldo jeśli przyszło z losowania
        if (typeof result.newBalance === 'number' && balanceEl) {
          balanceEl.textContent = `${result.newBalance.toFixed(2)} zł`;
        }

      } catch (error) {
        console.error('Błąd losowania:', error);
        if (resultEl) resultEl.textContent = 'Coś poszło nie tak podczas losowania.';
      } finally {
        drawBtn.disabled = false;
      }
    });
  }
}

updateUI();
