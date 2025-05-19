const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware do parsowania JSON w ciele requestów
app.use(express.json());

// Statyczne pliki z folderu public
app.use(express.static(path.join(__dirname, 'public')));

// Podłącz trasę losowania (wylosowywanie.js) pod /api/losuj
const wylosowywanieRouter = require('./routes/wylosowywanie');
app.use('/api/losuj', wylosowywanieRouter);

// Domyślna strona
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na porcie ${PORT}`);
});
