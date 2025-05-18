import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jotdnbkfgqtznjwbfjno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'
);

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDiv = document.getElementById('userInfo');

loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) alert('Błąd logowania: ' + error.message);
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  updateUI(null);
});

function updateUI(user) {
  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userInfoDiv.innerHTML = `
      <p>Witaj, ${user.user_metadata.full_name}</p>
      <img src="${user.user_metadata.avatar_url}" width="80" />
    `;
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userInfoDiv.innerHTML = '';
  }
}

async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  updateUI(session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    updateUI(session?.user ?? null);
  });
}

init();
