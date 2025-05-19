const express = require('express');
const router = express.Router();

const SUPABASE_URL = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'; // przycięty dla czytelności

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user_id}`, {
      headers,
    });

    const data = await response.json();

    const name = data.user_metadata?.name || 'Nieznany';
    const avatar = data.user_metadata?.avatar_url || '/images/default-avatar.png';

    res.json({ name, avatar });
  } catch (error) {
    console.error('❌ Błąd przy pobieraniu info o użytkowniku:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
