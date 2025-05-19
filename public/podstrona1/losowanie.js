import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient("https://jotdnbkfgqtznjwbfjno.supabase.co", "ey..."); // ← podaj swój anon key

async function loadBalance(userId) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('balance')
    .eq('user_id', userId)
    .single();

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

  const balance = await loadBalance(user.id);
  document.getElementById('balance').textContent = `${balance.toFixed(2)} zł`;

  document.getElementById('drawBtn').addEventListener('click', async () => {
    const response = await fetch('/api/losuj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });

    const result = await response.json();
    document.getElementById('result').textContent = result.message;
    document.getElementById('balance').textContent = `${result.newBalance.toFixed(2)} zł`;
  });
}

updateUI();
