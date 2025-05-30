const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ'
);

router.post('/', async (req, res) => {
  const { user_id, count = 1 } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Brak ID użytkownika' });
  }

  const drawCost = 3.5;
  const totalCost = drawCost * count;

  try {
    const { data: current, error: errGet } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', user_id)
      .single();

    if (errGet) throw errGet;

    const balance = current?.balance || 0;

    if (balance < totalCost) {
      return res.json({ error: 'Za mało środków na losowanie.', currentBalance: balance });
    }

    const newBalance = balance - totalCost;

    const { error: errUpdate } = await supabase
      .from('user_balances')
      .update({ balance: newBalance })
      .eq('user_id', user_id);

    if (errUpdate) throw errUpdate;

    const outcomes = [
      { id: 1, item: "2zł", value: 2, chance: 0.7, image: "/images/deserteagleblue.jpg" },
      { id: 2, item: "20 zł", value: 20, chance: 0.1, image: "/images/glock18moda.jpg" },
      { id: 3, item: "2.2 zł", value: 2.2, chance: 0.15, image: "/images/mac10bronz.jpg" },
      { id: 4, item: "2.4 zł", value: 2.4, chance: 0.04, image: "/images/p18dzielnia.jpg" },
      { id: 5, item: "2.1zł", value: 2.1, chance: 0.01, image: "/images/p2000oceaniczny.jpg" }
    ];

    const items = [];

    for (let i = 0; i < count; i++) {
      const result = weightedRandom(outcomes);

      const { data: inserted, error: errInsert } = await supabase
        .from('user_inventory')
        .insert({
          user_id,
          item_name: result.item,
          image_url: result.image,
          value: result.value
        })
        .select('id')
        .single();

      if (errInsert) {
        console.error('Błąd dodawania przedmiotu:', errInsert);
        continue;
      }

      items.push({
        item_id: inserted.id,
        image: result.image,
        value: result.value,
        item: result.item
      });
    }

    res.json({
      items,
      newBalance
    });

  } catch (err) {
    console.error('Błąd w losowaniu:', err);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

