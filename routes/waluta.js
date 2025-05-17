const express = require('express');
const router = express.Router();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co'; // podmień na swój URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'; // podmień na swój anon/publiczny klucz

const supabase = createClient(supabaseUrl, supabaseKey);

const items = [
  { name: "AK-47 | Ice Coaled", rarity: "Rare", value: 2, image: "/images/AK-47ICECOALED.jpg" },
  { name: "M4A4 | Asiimov", rarity: "Epic", value: 5, image: "/images/M4A4ASIIMOV.jpg" },
  { name: "UMP", rarity: "Common", value: 1, image: "/images/ump.jpg" },
  { name: "USP-S | Forest Leaves", rarity: "Legendary", value: 10, image: "/images/USP-S_FOREST_LEAVES.jpg" }
];

// Pobierz saldo użytkownika
router.get('/balance', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Brakuje identyfikatora użytkownika.' });

  const { data: user, error } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  if (error) return res.status(400).json({ error: 'Nie znaleziono użytkownika.' });

  res.json({ balance: user?.balance || 0 });
});

// Losowanie (odejmuje 5 zł, dodaje wartość nagrody)
router.post('/losuj', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Brakuje identyfikatora użytkownika.' });

  const { data: user, error } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  if (error) return res.status(400).json({ error: 'Nie znaleziono użytkownika.' });
  if (user.balance < 5) return res.status(400).json({ error: 'Za mało środków.' });

  const item = items[Math.floor(Math.random() * items.length)];
  const newBalance = user.balance - 5 + item.value;

  const { error: updateError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', userId);

  if (updateError) return res.status(500).json({ error: 'Błąd aktualizacji salda.' });

  res.json({ balance: newBalance, item });
});

// Obsługa kodów promocyjnych z Supabase
router.post('/kod', async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: 'Brak danych.' });

  // Pobierz kod promocyjny
  const { data: promoCode, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !promoCode) return res.status(400).json({ error: 'Nieprawidłowy kod.' });

  const usedBy = promoCode.used_by || [];

  if (usedBy.includes(userId)) {
    return res.status(400).json({ error: 'Kod już został użyty przez tego użytkownika.' });
  }

  if (usedBy.length >= promoCode.max_uses) {
    return res.status(400).json({ error: 'Kod został wykorzystany maksymalną liczbę razy.' });
  }

  // Pobierz użytkownika
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  if (userError || !user) return res.status(400).json({ error: 'Nie znaleziono użytkownika.' });

  const newBalance = user.balance + promoCode.value;

  // Aktualizuj saldo użytkownika
  const { error: updateUserError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', userId);

  if (updateUserError) return res.status(500).json({ error: 'Błąd aktualizacji salda.' });

  // Dodaj użytkownika do listy używających kodu
  usedBy.push(userId);

  const { error: updateCodeError } = await supabase
    .from('promo_codes')
    .update({ used_by: usedBy })
    .eq('code', code);

  if (updateCodeError) return res.status(500).json({ error: 'Błąd aktualizacji kodu promocyjnego.' });

  res.json({ balance: newBalance, message: 'Kod aktywowany.' });
});

module.exports = router;
