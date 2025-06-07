let selectedCount = 1; // Domyślnie x1
let drawnItems = [];  // Przechowuje wylosowane itemy

document.querySelectorAll('.draw-option').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedCount = parseInt(btn.dataset.count);
    document.querySelectorAll('.draw-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

drawBtn.addEventListener('click', async () => {
  const user_id = localStorage.getItem("user_id");
  const cost = 3.5 * selectedCount;

  const response = await fetch('/api/losuj', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, count: selectedCount })
  });

  const result = await response.json();
  if (result.error) return alert(result.error);

  drawnItems = result.items; // zapisz itemy

  const wrapper = document.getElementById('animationsWrapper');
  wrapper.innerHTML = ''; // wyczyść poprzednie animacje

  for (let item of drawnItems) {
    const container = document.createElement('div');
    container.classList.add('animationContainer');
    container.style.overflow = 'hidden';
    container.style.border = '1px solid #db4848';

    const imageStrip = document.createElement('div');
    imageStrip.classList.add('imageStrip');
    imageStrip.style.display = 'flex';
    container.appendChild(imageStrip);

    wrapper.appendChild(container);

    startAnimation(item.image, imageStrip); // zakładam że funkcja startAnimation przyjmuje element kontenera i src
  }

  document.getElementById('actionButtons').style.display = 'block';
});

sellBtn.addEventListener('click', async () => {
  for (const item of drawnItems) {
    await fetch('/api/sell-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.item_id })
    });
  }
  alert("Sprzedano wszystko!");
  location.reload(); // lub odśwież balans tylko
});

keepBtn.addEventListener('click', () => {
  alert("Dodano wszystkie przedmioty do ekwipunku!");
  location.reload();
});
