const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware do parsowania JSON w ciele requestów
app.use(express.json());

// Statyczne pliki z folderu publicc
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Trasa losowania (wylosowywanie.js)
const wylosowywanieRouter = require('./routes/wylosowywanie');
app.use('/api/losuj', wylosowywanieRouter);

const inventoryRoute = require('./routes/inventory');
app.use('/api/inventory', inventoryRoute);

const sellItemRouter = require('./routes/sell-item');
app.use('/api/sell-item', sellItemRouter);





// 🔹 Trasa z danymi użytkownika (user-info.js)
const userInfoRouter = require('./routes/user-info');
app.use('/api/user-info', userInfoRouter);

const upgradeRouter = require('./routes/upgrade');
app.use('/api/upgrade', upgradeRouter);


const availableItemsRoute = require('./routes/available-items');
app.use('/api/available-items', availableItemsRoute);



// 🔹 🔥 NOWOŚĆ: Trasa do balansu użytkownika (balance.js)
const balanceRouter = require('./routes/balance');
app.use('/api/balance', balanceRouter);

// Domyślna strona
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na porcie ${PORT}`);
});
