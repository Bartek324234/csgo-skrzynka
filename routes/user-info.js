const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');


const SUPABASE_URL = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'; // Twój prawdziwy klucz (przenieś go potem do .env)

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user_id}&select=name,avatar`, {
      headers,
    });

    if (!response.ok) throw new Error('Błąd pobierania danych użytkownika');

    const data = await response.json();
    if (data.length === 0) return res.status(404).json({ message: 'Użytkownik nie znaleziony' });

    res.json({
      name: data[0].name,
      avatar: data[0].avatar
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
