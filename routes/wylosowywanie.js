const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'
);

function weightedRandom(items) {
  const r = Math.random();
  let sum = 0;
  for (const item of items) {
    sum += item.chance;
    if (r <= sum) return item;
  }
  return items[items.length - 1];
}

router.post('/', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Brak ID użytkownika' });
  }

  const drawCost = 3.5;

  try {
    // Pobierz aktualne saldo
    const { data: current, error: errGet } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', user_id)
      .single();

    if (errGet) throw errGet;

    const balance = current?.balance || 0;

    if (balance < drawCost) {
      return res.json({ error: 'Za mało środków na losowanie.', currentBalance: balance });
    }

    // Odejmij koszt losowania
    const newBalance = balance - drawCost;

    const { error: errUpdate } = await supabase
      .from('user_balances')
      .update({ balance: newBalance })
      .eq('user_id', user_id);

    if (errUpdate) throw errUpdate;

    // Definicja możliwych wyników
    const outcomes = [
      { id: 1, item: "2zł", value: 2, chance: 0.7, image: "/images/deserteagleblue.jpg" },
      { id: 2, item: "20 zł", value: 20, chance: 0.1, image: "/images/glock18moda.jpg" },
      { id: 3, item: "2.2 zł", value: 2.2, chance: 0.15, image: "/images/mac10bronz.jpg" },
      { id: 4, item: "2.4 zł", value: 2.4, chance: 0.04, image: "/images/p18dzielnia.jpg" },
      { id: 5, item: "2.1zł", value: 2.1, chance: 0.01, image: "/images/p2000oceaniczny.jpg" }
    ];

    // Losowanie przedmiotu
    const result = weightedRandom(outcomes);

  // ✅ ZAPIS DO live_drops (to dodajesz!)
    await supabase.from('live_drops').insert({
      user_id: user_id,
      image_url: result.image,
      item_name: result.item,
      value: result.value,
    });

    // Zwrot wyniku losowania do frontu
    res.json({
      message: `Wylosowano: ${result.item}`,
      image: result.image,
      value: result.value,
      newBalance
    });
  } catch (err) {
    console.error('Błąd w losowaniu:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Endpoint do zapisywania przedmiotu do ekwipunku po kliknięciu "Keep"
router.post('/keep', async (req, res) => {
  const { user_id, item_name, image_url, value } = req.body;

  if (!user_id || !item_name || !image_url || !value) {
    return res.status(400).json({ error: 'Brak wymaganych danych do dodania do ekwipunku.' });
  }

  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .insert({
        user_id,
        item_name,
        image_url,
        value
      });

    if (error) throw error;

    res.json({ success: true, message: 'Przedmiot dodany do ekwipunku.' });
  } catch (err) {
    console.error('Błąd dodawania do ekwipunku:', err);
    res.status(500).json({ error: 'Błąd serwera podczas dodawania do ekwipunku.' });
  }
});

module.exports = router;
