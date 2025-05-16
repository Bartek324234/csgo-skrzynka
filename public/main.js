document.addEventListener('DOMContentLoaded', () => {
  const losujBtn = document.getElementById('losujBtn');
  if (!losujBtn) return;

  losujBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/losowanie/losuj');
      const item = await response.json();

      document.getElementById('wynik').innerText = `Wylosowałeś: ${item.name} (${item.rarity})`;

      const img = document.getElementById('itemImage');
      img.src = item.image;
      img.alt = item.name;
      img.style.display = 'block';
    } catch (error) {
      console.error('Błąd podczas losowania:', error);
    }
  });
});
