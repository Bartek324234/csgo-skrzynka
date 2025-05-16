const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Serwowanie plików frontendowych (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

// Endpoint na główną stronę
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 🎲 Endpoint do losowania
const items = [
  { name: "AK-47 | Ice Coaled", rarity: "Rare", image: "/images/AK-47ICECOALED.jpg" },
  { name: "M4A4 | Asiimov", rarity: "Epic", image: "/images/M4A4ASIIMOV.jpg" },
  { name: "UMP", rarity: "Common", image: "/images/ump.jpg" },
  { name: "USP-S | Forest Leaves", rarity: "Legendary", image: "/images/USP-S_FOREST_LEAVES.jpg" }
];

app.get('/api/losuj', (req, res) => {
  const randomItem = items[Math.floor(Math.random() * items.length)];
  res.json(randomItem);
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
