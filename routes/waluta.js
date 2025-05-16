const express = require('express');
const router = express.Router();

const userData = {}; // Pamięć tymczasowa (RAM)

const items = [
  { name: "AK-47 | Ice Coaled", rarity: "Rare", value: 2, image: "/images/AK-47ICECOALED.jpg" },
  { name: "M4A4 | Asiimov", rarity: "Epic", value: 5, image: "/images/M4A4ASIIMOV.jpg" },
  { name: "UMP", rarity: "Common", value: 1, image: "/images/ump.jpg" },
  { name: "USP-S | Forest Leaves", rarity: "Legendary", value: 10, image: "/images/USP-S_FOREST_LEAVES.jpg" }
];

// 1. Pobranie salda
router.get('/balance', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Brakuje userId' });

  const user = userData[userId] || { balance: 0, usedCodes: [] };
  res.json({ balance: user.balance });
});

// 2. Losowanie z opłatą
router.post('/losuj', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Brakuje userId' });

  if (!userData[userId]) {
    userData[userId] = { balance: 0, usedCodes: [] };
  }

  const user = userData[userId];

  if (user.balance < 5) {
    return res.status(400).json({ error: 'Za mało środków (potrzeba 5 zł)' });
  }

  user.balance -= 5;
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
  if (!userId || !code) return res.status(400).json({ error: 'Brak danych' });

  if (!userData[userId]) {
    userData[userId] = { balance: 0, usedCodes: [] };
  }

  const user = userData[userId];

  if (code === 'new2025') {
    if (user.usedCodes.includes(code)) {
      return res.status(400).json({ error: 'Kod już użyty' });
    }

    user.balance += 5;
    user.usedCodes.push(code);
    return res.json({ balance: user.balance, message: 'Kod aktywowany (5 zł dodane)' });
  }

  return res.status(400).json({ error: 'Nieprawidłowy kod' });
});

module.exports = router;
