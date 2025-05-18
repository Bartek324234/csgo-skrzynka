const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware do obsługi JSON (opcjonalnie)
app.use(express.json());

// Prosta strona testowa
app.get('/', (req, res) => {
  res.send('Serwer działa! 🎉');
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`✅ Serwer działa na porcie ${PORT}`);
});
