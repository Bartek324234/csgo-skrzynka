document.getElementById('losujBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/losuj');
    const item = await response.json();
    document.getElementById('wynik').innerText = `Wylosowałeś: ${item.name} (${item.rarity})`;
  } catch (error) {
    console.error('Błąd podczas losowania:', error);
  }
});
