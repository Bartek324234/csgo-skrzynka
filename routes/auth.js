const express = require('express');
const router = express.Router();

// Przykład endpointu auth, dopisz własną logikę
router.post('/login', (req, res) => {
  // np. weryfikacja użytkownika itd.
  res.json({ message: 'Login endpoint działa' });
});

module.exports = router;
