const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serwowanie plików statycznych z folderu "public"
app.use(express.static(path.join(__dirname, 'public')));

// Domyślna strona — index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na porcie ${PORT}`);
});
