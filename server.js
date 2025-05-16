const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔁 Trasy
const walutaRoutes = require('./routes/waluta');
app.use('/api/waluta', walutaRoutes);

// 📁 Pliki statyczne
app.use(express.static(path.join(__dirname, 'public')));

// Domyślna strona główna
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na porcie ${PORT}`);
});
