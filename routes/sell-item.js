const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'
);

// Sprzedaż jednego przedmiotu
router.post('/', async (req, res) => {
  const { user_id, item_id, value } = req.body;

  if (!user_id || !item_id || value === undefined) {
    return res.status(400).json({ error: 'Brak danych do sprzedaży' });
  }

  try {
    const { error: errDelete } = await supabase
      .from('user_inventory')
      .delete()
      .eq('id', item_id)
      .eq('user_id', user_id);

    if (errDelete) throw errDelete;

    const { data: current, error: errGet } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', user_id)
      .single();

    if (errGet) throw errGet;

    const balance = current?.balance || 0;
    const newBalance = balance + parseFloat(value);

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

// Sprzedaż wszystkich przedmiotów użytkownika
router.post('/sell-all', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Brak ID użytkownika' });
  }

  try {
    const { data: items, error: fetchError } = await supabase
      .from('user_inventory')
      .select('id, value')
      .eq('user_id', user_id);

    if (fetchError) throw fetchError;

    if (!items || items.length === 0) {
      return res.json({ success: true, totalValue: 0, newBalance: null });
    }

    const totalValue = items.reduce((sum, item) => sum + parseFloat(item.value), 0);
    const itemIds = items.map(item => item.id);

    const { error: deleteError } = await supabase
      .from('user_inventory')
      .delete()
      .in('id', itemIds);

    if (deleteError) throw deleteError;

    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', user_id)
      .single();

    if (balanceError) throw balanceError;

    const currentBalance = balanceData?.balance || 0;
    const newBalance = currentBalance + totalValue;

    const { error: updateError } = await supabase
      .from('user_balances')
      .update({ balance: newBalance })
      .eq('user_id', user_id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      totalValue,
      newBalance
    });
  } catch (err) {
    console.error('Błąd przy sprzedaży wszystkich przedmiotów:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera przy sprzedaży wszystkich' });
  }
});

module.exports = router;
