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
















// Backend: API zwracające dane użytkownika
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxMzA4MCwiZXhwIjoyMDYzMDg5MDgwfQ.9rguruM_HtjfZuwlFW7ZcA_ePOikprKiU3VCUdaxhAQ' // NIE ten z frontu! Musi być z panelu Supabase → Project → API → service_role
);

app.get('/api/user-info/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('users')
    .select('name, avatar')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Błąd pobierania użytkownika:', error.message);
    return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
  }

  res.json({
    name: data.name,
    avatar: data.avatar
  });
});
