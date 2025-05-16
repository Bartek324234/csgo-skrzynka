const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serwowanie plików statycznych (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ⬇️ IMPORT ROUTES
const losowanieRoutes = require('./routes/losowanie');
app.use('/api/losowanie', losowanieRoutes);

// Domyślna strona główna
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na porcie ${PORT}`);
});
