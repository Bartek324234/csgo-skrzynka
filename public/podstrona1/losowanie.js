import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jotdnbkfgqtznjwbfjno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM"
);

async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    alert("Musisz się zalogować.");
    window.location.href = "/index.html";
    return;
  }

  let drawCount = 1;
  let currentDrawnItems = [];

  const balanceEl = document.getElementById('balance');
  const resultEl = document.getElementById('result');
  const imageEl = document.getElementById('resultImage');
  const drawBtn = document.getElementById('drawBtn');
  const actionButtons = document.getElementById('actionButtons');
  const sellBtn = document.getElementById('sellBtn');
  const keepBtn = document.getElementById('keepBtn');

  const updateBalance = async () => {
    const balance = await loadBalance(user.id);
    if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;
  };

  await updateBalance();

  // Obsługa wyboru x1-x5
  document.querySelectorAll('.multiDraw').forEach(btn => {
    btn.addEventListener('click', () => {
      drawCount = parseInt(btn.getAttribute('data-count'));
      document.querySelectorAll('.multiDraw').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  drawBtn.addEventListener('click', async () => {
    try {
      drawBtn.disabled = true;
      resultEl.innerHTML = '';
      imageEl.style.display = 'none';
      actionButtons.style.display = 'none';

      const response = await fetch('/api/losuj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, count: drawCount })
      });

      const result = await response.json();

      if (result.error) {
        resultEl.textContent = result.error;
        return;
      }

      currentDrawnItems = result.items;

      resultEl.innerHTML = '';
      result.items.forEach(item => {
        const img = document.createElement('img');
        img.src = item.image;
        img.style.maxWidth = '100px';
        img.style.margin = '10px';
        resultEl.appendChild(img);
      });

      actionButtons.style.display = 'block';
      await updateBalance();

      sellBtn.onclick = async () => {
        const totalValue = currentDrawnItems.reduce((sum, item) => sum + item.value, 0);
        const item_ids = currentDrawnItems.map(i => i.item_id);

        const sellResponse = await fetch('/api/sell-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, item_ids, total_value: totalValue })
        });

        const sellResult = await sellResponse.json();

        resultEl.textContent = 'Sprzedano przedmioty!';
        actionButtons.style.display = 'none';
        await updateBalance();
      };

      keepBtn.onclick = async () => {
        resultEl.textContent = 'Przedmioty dodane do ekwipunku.';
        actionButtons.style.display = 'none';
      };

    } catch (err) {
      console.error("Błąd losowania:", err);
      resultEl.textContent = 'Błąd podczas losowania.';
    } finally {
      drawBtn.disabled = false;
    }
  });
}
