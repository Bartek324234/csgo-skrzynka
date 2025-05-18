import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'
);

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');

loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) alert(error.message);
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  showUser(null);
});

function showUser(user) {
  if (user) {
    userInfo.innerHTML = `
      <p>Zalogowano jako: ${user.email}</p>
      <img src="${user.user_metadata.avatar_url}" width="80" />
    `;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    userInfo.textContent = 'Nie zalogowano';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
}

async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  showUser(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    showUser(session?.user ?? null);
  });
}

init();
