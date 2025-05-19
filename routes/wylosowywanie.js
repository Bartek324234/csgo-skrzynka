const express = require('express');
const router = express.Router();

// Jeśli masz Node 18+ możesz użyć globalnego fetch,
// jeśli nie, odkomentuj poniższą linię i zainstaluj 'node-fetch':
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// Funkcja do losowania z wagami (procentami)
function weightedRandom(items) {
  const r = Math.random();
  let sum = 0;
  for (const item of items) {
    sum += item.chance;
    if (r <= sum) return item;
  }
  // Na wypadek gdyby suma chance < 1, zwróć ostatni element
  return items[items.length - 1];
}

router.post('/', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ message: 'Brak ID użytkownika' });

  try {
    // Pobierz aktualny balans użytkownika z Supabase
    const balanceRes = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}&select=balance`, { headers });
    if (!balanceRes.ok) throw new Error(`Błąd pobierania balansu: ${balanceRes.statusText}`);
    const balanceData = await balanceRes.json();
    const balance = balanceData?.[0]?.balance ?? 0;

    if (balance < 10) {
      return res.json({ message: "Za mało środków na losowanie.", newBalance: balance });
    }

    // Wyniki losowania z prawdopodobieństwami (suma chance powinna wynosić 1)
   const outcomes = [
  { item: "Nic 😢", value: 10, chance: 0.5, image: "/images/nothing.png" },
  { item: "5 zł", value: 5.5, chance: 0.3, image: "/images/5zl.png" },
  { item: "10 zł", value: 10, chance: 0.15, image: "/images/10zl.png" },
  { item: "50 zł", value: 50, chance: 0.04, image: "/images/50zl.png" },
  { item: "Strata 😬", value: -10, chance: 0.01, image: "/images/loss.png" }
];

    // Wylosuj wynik z wagami
    const result = weightedRandom(outcomes);

    // Oblicz nowy balans
    const newBalance = balance - 10 + result.value;

    // Aktualizuj balans w Supabase
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ balance: newBalance }),
    });

    if (!updateRes.ok) throw new Error(`Błąd aktualizacji balansu: ${updateRes.statusText}`);

    // Odpowiedź do frontendu
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
