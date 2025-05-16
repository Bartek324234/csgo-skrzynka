const express = require('express');
const router = express.Router();

const items = [
  { name: "AK-47 | Ice Coaled", rarity: "Rare", image: "/images/AK-47ICECOALED.jpg" },
  { name: "M4A4 | Asiimov", rarity: "Epic", image: "/images/M4A4ASIIMOV.jpg" },
  { name: "UMP", rarity: "Common", image: "/images/ump.jpg" },
  { name: "USP-S | Forest Leaves", rarity: "Legendary", image: "/images/USP-S_FOREST_LEAVES.jpg" }
];

router.get('/losuj', (req, res) => {
  const randomItem = items[Math.floor(Math.random() * items.length)];
  res.json(randomItem);
});

module.exports = router;
