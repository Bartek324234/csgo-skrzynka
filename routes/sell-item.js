const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'twój_anon_key'
);

router.post('/', async (req, res) => {
  const { user_id, item_id, value } = req.body;

  if (!user_id || !item_id || value === undefined) {
    return res.status(400).json({ error: 'Brak danych do sprzedaży' });
  }

  try {
    // Usuń przedmiot z ekwipunku
    const { error: errDelete } = await supabase
      .from('user_inventory')
      .delete()
      .eq('id', item_id)
      .eq('user_id', user_id);

    if (errDelete) throw errDelete;

    // Pobierz saldo
    const { data: current, error: errGet } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', user_id)
      .single();

    if (errGet) throw errGet;

    const balance = current?.balance || 0;
    const newBalance = balance + parseFloat(value);

    // Zaktualizuj saldo
    const { error: errUpdate } = await supabase
      .from('user_balances')
      .update({ balance: newBalance })
      .eq('user_id', user_id);

    if (errUpdate) throw errUpdate;

    res.json({ success: true, newBalance });
  } catch (err) {
    console.error('Błąd podczas sprzedaży:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera podczas sprzedaży' });
  }
});

module.exports = router;
