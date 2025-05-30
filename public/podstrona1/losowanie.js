import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jotdnbkfgqtznjwbfjno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4k"
);

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
  const countInput = document.getElementById('drawCount');  // pole na liczbę losowań (np. x2, x3)

  let balance = await loadBalance(user.id);
  if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;

  if (resultEl) resultEl.textContent = '';
  if (imageEl) imageEl.style.display = 'none';
  if (actionButtons) actionButtons.style.display = 'none';

  if (drawBtn) {
    drawBtn.addEventListener('click', async () => {
      try {
        drawBtn.disabled = true;
        resultEl.textContent = '';
        imageEl.style.display = 'none';
        actionButtons.style.display = 'none';

        // Pobierz ile losowań użytkownik chce wykonać (domyślnie 1)
        const count = countInput ? parseInt(countInput.value) || 1 : 1;

        const response = await fetch('/api/losuj', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, count })  // wysyłamy count na backend
        });

        const result = await response.json();

        if (result.error) {
          resultEl.textContent = result.error;
          return;
        }

        // Jeśli mamy wiele wyników, wyświetlamy je wszystkie
        if (Array.isArray(result.results)) {
          resultEl.textContent = `Wylosowano ${result.results.length} przedmiotów:`;
          imageEl.style.display = 'none';
          actionButtons.style.display = 'none';

          // Stwórz kontener na miniaturki
          let container = document.getElementById('resultItemsContainer');
          if (!container) {
            container = document.createElement('div');
            container.id = 'resultItemsContainer';
            resultEl.parentNode.insertBefore(container, actionButtons);
          }
          container.innerHTML = '';

          // Dla każdego przedmiotu stwórz miniaturkę i przyciski akcji
          for (const item of result.results) {
            const itemDiv = document.createElement('div');
            itemDiv.style.border = '1px solid #ccc';
            itemDiv.style.margin = '5px';
            itemDiv.style.padding = '5px';

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.item;
            img.style.maxWidth = '100px';
            img.style.display = 'block';

            const nameP = document.createElement('p');
            nameP.textContent = `${item.item} (Wartość: ${item.value.toFixed(2)} zł)`;

            const sellBtnItem = document.createElement('button');
            sellBtnItem.textContent = 'Sprzedaj';
            sellBtnItem.style.marginRight = '5px';

            const keepBtnItem = document.createElement('button');
            keepBtnItem.textContent = 'Zachowaj';

            itemDiv.appendChild(img);
            itemDiv.appendChild(nameP);
            itemDiv.appendChild(sellBtnItem);
            itemDiv.appendChild(keepBtnItem);

            container.appendChild(itemDiv);

            // Obsługa sprzedaży dla pojedynczego przedmiotu
            sellBtnItem.onclick = async () => {
              try {
                const sellResponse = await fetch('/api/sell-item', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user.id,
                    item_id: item.item_id,
                    value: item.value
                  })
                });

                const sellData = await sellResponse.json();

                if (sellData.newBalance !== undefined && balanceEl) {
                  balance = sellData.newBalance;
                  balanceEl.textContent = `${balance.toFixed(2)} zł`;
                }

                resultEl.textContent = 'Przedmiot sprzedany!';
                itemDiv.remove();
                if (container.childElementCount === 0) {
                  container.remove();
                  actionButtons.style.display = 'none';
                }
              } catch (err) {
                console.error("Błąd sprzedaży:", err);
                resultEl.textContent = 'Błąd sprzedaży przedmiotu.';
              }
            };

            // Obsługa zachowania przedmiotu
            keepBtnItem.onclick = () => {
              try {
                resultEl.textContent = 'Przedmiot zachowany w ekwipunku.';
                itemDiv.remove();
                if (container.childElementCount === 0) {
                  container.remove();
                  actionButtons.style.display = 'none';
                }
              } catch (err) {
                console.error("Błąd dodania do ekwipunku:", err);
                resultEl.textContent = 'Błąd dodania do ekwipunku.';
              }
            };
          }

          actionButtons.style.display = 'block';
        } else {
          // W przypadku pojedynczego losowania (starsza wersja) — zostawiamy działanie
          resultEl.textContent = result.message;
          imageEl.src = result.image;
          imageEl.style.display = 'block';
          actionButtons.style.display = 'block';

          if (typeof result.newBalance === 'number' && balanceEl) {
            balance = result.newBalance;
            balanceEl.textContent = `${balance.toFixed(2)} zł`;
          }

          const itemId = result.item_id;

          sellBtn.onclick = async () => {
            try {
              const sellResponse = await fetch('/api/sell-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: user.id,
                  item_id: itemId,
                  value: result.value
                })
              });

              const sellData = await sellResponse.json();

              if (sellData.newBalance !== undefined && balanceEl) {
                balance = sellData.newBalance;
                balanceEl.textContent = `${balance.toFixed(2)} zł`;
              }

              resultEl.textContent = 'Przedmiot sprzedany!';
              imageEl.style.display = 'none';
              actionButtons.style.display = 'none';
            } catch (err) {
              console.error("Błąd sprzedaży:", err);
              resultEl.textContent = 'Błąd sprzedaży przedmiotu.';
            }
          };

          keepBtn.onclick = async () => {
            try {
              resultEl.textContent = 'Przedmiot jest już w ekwipunku.';
              actionButtons.style.display = 'none';
            } catch (err) {
              console.error("Błąd dodania do ekwipunku:", err);
              resultEl.textContent = 'Błąd dodania do ekwipunku.';
            }
          };
        }

      } catch (error) {
        console.error('Błąd losowania:', error);
        resultEl.textContent = 'Coś poszło nie tak podczas losowania.';
      } finally {
        drawBtn.disabled = false;
      }
    });
  }
}

updateUI();
