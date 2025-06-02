const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Podstawowe dane Supabase — podmień na swoje
const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ';  // Użyj SERVICE_ROLE KEY (nie anon)

// Inicjalizacja klienta Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/', async (req, res) => {
  const { userId, inventorySkins, availableSkins } = req.body;

  if (!userId || !inventorySkins?.length || !availableSkins?.length) {
    return res.status(400).json({ error: 'Brak wymaganych danych' });
  }

  try {
    // Pobierz skiny z inventory użytkownika
    const { data: inventoryData, error: invErr } = await supabase
      .from('inventory')
      .select('id, value')
      .in('id', inventorySkins)
      .eq('user_id', userId);

    if (invErr || !inventoryData) throw invErr || new Error('Błąd pobierania inventory');

    // Pobierz skiny z katalogu available_items
    const { data: availableData, error: availErr } = await supabase
      .from('available_items')
      .select('id, value, name, image')
      .in('id', availableSkins);

    if (availErr || !availableData) throw availErr || new Error('Błąd pobierania available items');

    // Sumuj wartości skinów
    const invSum = inventoryData.reduce((sum, item) => sum + parseFloat(item.value), 0);
    const availSum = availableData.reduce((sum, item) => sum + parseFloat(item.value), 0);

    if (availSum <= invSum) {
      return res.status(400).json({ error: 'Wartość available musi być większa niż inventory' });
    }

    // Losowanie sukcesu
    const chance = invSum / availSum;
    const success = Math.random() < chance;

    if (success) {
      // Usuń ulepszane skiny z inventory
      await supabase
        .from('inventory')
        .delete()
        .in('id', inventorySkins)
        .eq('user_id', userId);

      // Dodaj do inventory nowe skiny (ulepszone)
      const newItems = availableData.map(item => ({
        user_id: userId,
        item_id: item.id,
        name: item.name,
        value: item.value,
        image: item.image,
      }));

      await supabase.from('inventory').insert(newItems);
    } else {
      // Ulepszenie nieudane — usuwamy skiny z inventory (te próbujące ulepszyć)
      await supabase
        .from('inventory')
        .delete()
        .in('id', inventorySkins)
        .eq('user_id', userId);
    }

    return res.json({
      success,
      chance: Math.round(chance * 100),
      removedSkins: inventorySkins,
      addedSkins: success ? availableData : [],
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
