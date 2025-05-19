const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const SUPABASE_URL = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const SUPABASE_KEY = 'ey...'; // Twój service_role key

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

router.post('/', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ message: 'Brak ID użytkownika' });

  try {
    const balanceRes = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}&select=balance`, { headers });
    const balanceData = await balanceRes.json();
    const balance = balanceData?.[0]?.balance ?? 0;

    if (balance < 10) {
      return res.json({ message: "Za mało środków na losowanie.", newBalance: balance });
    }

    const outcomes = [
      { item: "Nic 😢", value: 0 },
      { item: "5 zł", value: 5 },
      { item: "10 zł", value: 10 },
      { item: "50 zł", value: 50 },
      { item: "Strata 😬", value: -10 },
    ];

    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    const newBalance = balance - 10 + result.value;

    await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ balance: newBalance })
    });

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
