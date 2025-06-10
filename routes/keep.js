const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'
);

router.post('/', async (req, res) => {
  const { user_id, item_id } = req.body;

  if (!user_id || !item_id) {
    return res.status(400).json({ success: false, error: 'Brak user_id lub item_id' });
  }

  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .insert([{ user_id, item_id }]);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Błąd dodawania do ekwipunku:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
