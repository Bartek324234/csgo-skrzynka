const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware do parsowania JSON w ciele requestów
app.use(express.json());

// Statyczne pliki z folderu public
app.use(express.static(path.join(__dirname, 'public')));

// Trasa losowania (wylosowywanie.js)
const wylosowywanieRouter = require('./routes/wylosowywanie');
app.use('/api/losuj', wylosowywanieRouter);

// 🔥 NOWOŚĆ: Trasa z danymi użytkownika (user-info.js)
const userInfoRouter = require('./routes/user-info');
app.use('/api/user-info', userInfoRouter);

// Domyślna strona
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na porcie ${PORT}`);
});
