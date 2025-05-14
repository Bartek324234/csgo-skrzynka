const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
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
  { name: "AK-47 | Redline", rarity: "Rare" },
  { name: "AWP | Asiimov", rarity: "Epic" },
  { name: "Desert Eagle | Blaze", rarity: "Legendary" },
  { name: "P250 | Sand Dune", rarity: "Common" }
];

app.get('/api/losuj', (req, res) => {
  const randomItem = items[Math.floor(Math.random() * items.length)];
  res.json(randomItem);
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
