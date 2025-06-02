// routes/available-items.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'
);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('available_items')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Błąd pobierania available_items:', err);
    res.status(500).json({ error: 'Błąd serwera przy pobieraniu dostępnych skinów' });
  }
});

module.exports = router;
