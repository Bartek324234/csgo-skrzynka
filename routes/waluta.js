// routes/waluta.js
const express = require('express');
const router = express.Router();

let saldo = 1000;

router.get('/', (req, res) => {
  res.json({ saldo });
});

router.post('/dodaj', (req, res) => {
  const { kwota } = req.body;
  saldo += Number(kwota);
  res.json({ saldo });
});

module.exports = router;
