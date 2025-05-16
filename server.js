const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Import tras API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/waluta', require('./routes/waluta'));
app.use('/api/losowanie', require('./routes/losowanie'));

// Endpoint strony głównej
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
