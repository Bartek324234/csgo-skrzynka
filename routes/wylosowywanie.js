const express = require('express');
const router = express.Router();

const SUPABASE_URL = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'; // Twój service_role key z Supabase

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

router.post('/', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ message: 'Brak ID użytkownika' });

  try {
    // Pobierz aktualny balans użytkownika z Supabase
    const balanceRes = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}&select=balance`, { headers });
    const balanceData = await balanceRes.json();
    const balance = balanceData?.[0]?.balance ?? 0;

    if (balance < 10) {
      return res.json({ message: "Za mało środków na losowanie.", newBalance: balance });
    }

    // Losowanie wyników
    const outcomes = [
      { item: "Nic 😢", value: 0 },
      { item: "5 zł", value: 5 },
      { item: "10 zł", value: 10 },
      { item: "50 zł", value: 50 },
      { item: "Strata 😬", value: -10 },
    ];

    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    const newBalance = balance - 10 + result.value;

    // Aktualizuj balans w Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ balance: newBalance })
    });

    // Odpowiedź do frontendu
    res.json({
      message: `Wylosowano: ${result.item}`,
      newBalance
    });
  } catch (err) {
    console.error('❌ Błąd w losowaniu:', err);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

module.exports = router;
