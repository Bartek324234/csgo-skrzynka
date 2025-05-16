const express = require('express');
const router = express.Router();

const userData = {}; // Przechowywanie danych użytkowników w pamięci

// Lista przedmiotów z wartością nagrody
const items = [
  { name: "AK-47 | Ice Coaled", rarity: "Rare", value: 2, image: "/images/AK-47ICECOALED.jpg" },
  { name: "M4A4 | Asiimov", rarity: "Epic", value: 5, image: "/images/M4A4ASIIMOV.jpg" },
  { name: "UMP", rarity: "Common", value: 1, image: "/images/ump.jpg" },
  { name: "USP-S | Forest Leaves", rarity: "Legendary", value: 10, image: "/images/USP-S_FOREST_LEAVES.jpg" }
];

// 1. Pobranie balansu
router.get('/balance', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Brakuje identyfikatora użytkownika.' });

  const balance = userData[userId]?.balance || 0;
  res.json({ balance });
});

// 2. Losowanie (odejmuje 5 zł, dodaje wartość nagrody)
router.post('/losuj', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Brakuje identyfikatora użytkownika.' });

  // Inicjalizacja konta
  if (!userData[userId]) {
    userData[userId] = { balance: 0, usedCodes: [] };
  }

  const user = userData[userId];

  if (user.balance < 5) {
    return res.status(400).json({ error: 'Za mało środków.' });
  }

  // Odejmuje koszt losowania
  user.balance -= 5;

  // Losuj przedmiot
  const item = items[Math.floor(Math.random() * items.length)];
  user.balance += item.value;

  res.json({
    balance: user.balance,
    item
  });
});

// 3. Kod promocyjny
router.post('/kod', (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: 'Brak danych.' });

  // Inicjalizacja konta
  if (!userData[userId]) {
    userData[userId] = { balance: 0, usedCodes: [] };
  }

  const user = userData[userId];

  // Obsługa kodu 'new2025'
  if (code === 'new2025') {
    if (user.usedCodes.includes(code)) {
      return res.status(400).json({ error: 'Kod już został użyty.' });
    }

    user.balance += 5;
    user.usedCodes.push(code);
    return res.json({ balance: user.balance, message: 'Kod aktywowany.' });
  } else {
    return res.status(400).json({ error: 'Nieprawidłowy kod.' });
  }
});

module.exports = router;
