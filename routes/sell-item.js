const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ' // użyj klucza serwisowego
);

router.post('/', async (req, res) => {
  const { user_id, value } = req.body;

  try {
    const { data: current } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', user_id)
      .single();

    const newBalance = (current?.balance || 0) + value;

    await supabase
      .from('user_balances')
      .update({ balance: newBalance })
      .eq('user_id', user_id);

    res.json({ success: true, newBalance });
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd aktualizacji balansu');
  }
});

module.exports = router;
