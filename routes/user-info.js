const express = require('express');
const router = express.Router();

const SUPABASE_URL = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'; // <-- Twój klucz, najlepiej .env

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

router.get('/', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ message: 'Brak user_id' });

  try {
    const [userRes, balanceRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user_id}&select=name,avatar_url`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${user_id}&select=balance`, { headers })
    ]);

    if (!userRes.ok || !balanceRes.ok) throw new Error("Błąd pobierania danych");

    const userData = await userRes.json();
    const balanceData = await balanceRes.json();

    const name = userData?.[0]?.name ?? 'Użytkownik';
    const avatar_url = userData?.[0]?.avatar_url ?? null;
    const balance = balanceData?.[0]?.balance ?? 0;

    res.json({ name, avatar_url, balance });
  } catch (err) {
    console.error("❌ Błąd pobierania danych użytkownika:", err);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

module.exports = router;
