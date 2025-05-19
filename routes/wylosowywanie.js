const express = require('express');
const router = express.Router();

// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// Funkcja do losowania z wagami
function weightedRandom(items) {
  const r = Math.random();
  let sum = 0;
  for (const item of items) {
    sum += item.chance;
    if (r <= sum) return item;
  }
  return items[items.length - 1];
}

router.post('/', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ message: 'Brak ID użytkownika' });

  const drawCost = 3.5; // 💰 Zmienna kosztu losowania

  try {
    const balanceRes = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}&select=balance`, { headers });
    if (!balanceRes.ok) throw new Error(`Błąd pobierania balansu: ${balanceRes.statusText}`);
    const balanceData = await balanceRes.json();
    const balance = balanceData?.[0]?.balance ?? 0;

    if (balance < drawCost) {
      return res.json({ message: "Za mało środków na losowanie.", newBalance: balance });
    }

    const outcomes = [
      { item: "2zł", value: 2, chance: 0.7, image: "/images/deserteagleblue.jpg" },
      { item: "20 zł", value: 20, chance: 0.1, image: "/images/glock18moda.jpg" },
      { item: "2.2 zł", value: 2.2, chance: 0.15, image: "/images/mac10bronz.jpg" },
      { item: "2.4 zł", value: 2.4, chance: 0.04, image: "/images/p18dzielnia.jpg" },
      { item: "2.1zł", value: 2.1, chance: 0.01, image: "/images/p2000oceaniczny.jpg" }
    ];

    const result = weightedRandom(outcomes);
    const newBalance = balance - drawCost + result.value;

    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ balance: newBalance }),
    });

    if (!updateRes.ok) throw new Error(`Błąd aktualizacji balansu: ${updateRes.statusText}`);

    res.json({
      message: `Wylosowano: ${result.item}`,
      image: result.image,
      newBalance,
    });
  } catch (err) {
    console.error('❌ Błąd w losowaniu:', err);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

module.exports = router;
