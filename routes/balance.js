const express = require('express');
const router = express.Router();

const SUPABASE_URL = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'; // <-- skrócony tu

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}&select=balance`, {
      headers,
    });

    const data = await response.json();
    if (!response.ok || !data || data.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono balansu użytkownika.' });
    }

    res.json({ balance: data[0].balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera przy pobieraniu balansu.' });
  }
});

module.exports = router;
