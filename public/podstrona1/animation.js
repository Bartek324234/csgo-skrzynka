const animationContainer = document.getElementById('animationContainer');
const imageStrip = document.getElementById('imageStrip');
const resultImageName = document.getElementById('resultImageName');

const images = [
  { id: 1, src: "/images/deserteagleblue.jpg", name: "2zł" },
  { id: 2, src: "/images/glock18moda.jpg", name: "20 zł" },
  { id: 3, src: "/images/mac10bronz.jpg", name: "2.2 zł" },
  { id: 4, src: "/images/p18dzielnia.jpg", name: "2.4 zł" },
  { id: 5, src: "/images/p2000oceaniczny.jpg", name: "2.1zł" }
];

// Funkcja tworzy pasek obrazków (powtarzamy je np. 3 razy żeby animacja była płynna)
function createImageStrip() {
  imageStrip.innerHTML = '';
  // Powtórz 3 razy dla efektu "loop"
  for (let i = 0; i < 3; i++) {
    for (const img of images) {
      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.name;
      imgEl.style.width = '100px';
      imgEl.style.height = '100px';
      imgEl.style.objectFit = 'cover';
      imgEl.style.marginRight = '5px';
      imageStrip.appendChild(imgEl);
    }
  }
}

createImageStrip();

// Funkcja animująca przesuwanie i zatrzymanie na wylosowanym elemencie
async function animateRoll(selectedId) {
  const itemWidth = 105; // szerokość obrazka + margines
  const totalImages = images.length * 3; // bo 3 powtórzenia

  // Indeks wybranego elementu w powtarzanym pasku (wybieramy środkowe powtórzenie)
  const baseIndex = images.findIndex(img => img.id === selectedId);
  const targetIndex = baseIndex + images.length; // środkowe powtórzenie

  // Obliczamy przesunięcie, żeby wybrany element był na środku (lub gdzie chcesz)
  // Załóżmy, że chcesz go wycentrować względem container:
  const containerWidth = animationContainer.clientWidth;
  const offset = (containerWidth / 2) - (itemWidth / 2) - (targetIndex * itemWidth);

  // Zacznij animację (szybkie przesuwanie)
  let currentPos = 0;
  const speedStart = 30; // pikseli na krok (szybko)
  const speedEnd = 2; // pikseli na krok (wolno)
  let speed = speedStart;

  return new Promise(resolve => {
    function step() {
      currentPos -= speed;
      if (currentPos < offset) {
        // zwolnij i zatrzymaj
        speed -= 0.5;
        if (speed < speedEnd) speed = speedEnd;
        if (Math.abs(currentPos - offset) < speed) {
          currentPos = offset;
          imageStrip.style.transform = `translateX(${currentPos}px)`;
          resolve(); // koniec animacji
          return;
        }
      }
      imageStrip.style.transform = `translateX(${currentPos}px)`;
      requestAnimationFrame(step);
    }
    step();
  });
}

drawBtn.addEventListener('click', async () => {
  drawBtn.disabled = true;
  resultEl.textContent = 'Losowanie...';
  resultImageName.textContent = '';
  
  // Resetuj pozycję paska
  imageStrip.style.transition = 'none';
  imageStrip.style.transform = 'translateX(0px)';

  // Wywołaj backend żeby pobrać wynik (od razu)
  const response = await fetch('/api/losuj', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.id })
  });
  const result = await response.json();

  if (result.error) {
    resultEl.textContent = result.error;
    drawBtn.disabled = false;
    return;
  }

  // Animuj zatrzymanie się na wynikowym elemencie
  await animateRoll(images.find(img => img.src === result.image).id);

  // Pokaż wynik
  resultEl.textContent = result.message;
  resultImageName.textContent = images.find(img => img.src === result.image).name;
  imageEl.src = result.image;
  imageEl.style.display = 'block';
  actionButtons.style.display = 'block';

  // Tutaj aktualizuj balance itd.

  drawBtn.disabled = false;
});
