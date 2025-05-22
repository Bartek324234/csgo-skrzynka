const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'YOUR_SERVICE_ROLE_KEY'
);

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select('item_name, image_url')
      .eq('user_id', userId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Błąd pobierania ekwipunku:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
