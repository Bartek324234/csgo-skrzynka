import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jotdnbkfgqtznjwbfjno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM"
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
    window.location.href = "/index.html"; // zmień jeśli inna strona główna
    return;
  }

  const balance = await loadBalance(user.id);
  const balanceEl = document.getElementById('balance');
  const resultEl = document.getElementById('result');
  const drawBtn = document.getElementById('drawBtn');

  if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;
  if (resultEl) resultEl.textContent = '';

  if (drawBtn) {
    drawBtn.addEventListener('click', async () => {
      try {
        drawBtn.disabled = true; // blokada wielokrotnego kliku
        const response = await fetch('/api/losuj', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });

        const result = await response.json();

        if (result.message) {
          if (resultEl) resultEl.textContent = result.message;
        }

        if (typeof result.newBalance === 'number') {
          if (balanceEl) balanceEl.textContent = `${result.newBalance.toFixed(2)} zł`;
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
