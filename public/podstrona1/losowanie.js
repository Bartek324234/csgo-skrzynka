import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jotdnbkfgqtznjwbfjno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM"
);

const imageBackgroundMap = {
  "/images/deserteagleblue.jpg": "bg-blue",
  "/images/glock18moda.jpg": "bg-purple",
  "/images/mac10bronz.jpg": "bg-bronze",
  "/images/p18dzielnia.jpg": "bg-red",
  "/images/p2000oceaniczny.jpg": "bg-gold"
};

const availableImages = [
  '/images/deserteagleblue.jpg',
  '/images/glock18moda.jpg',
  '/images/mac10bronz.jpg',
  '/images/p18dzielnia.jpg',
  '/images/p2000oceaniczny.jpg'
];

const imageNameMap = {
  "/images/deserteagleblue.jpg": "Desert Eagle - Niebieski",
  "/images/glock18moda.jpg": "Glock 18 - Moda",
  "/images/mac10bronz.jpg": "MAC-10 - Brązowy",
  "/images/p18dzielnia.jpg": "P18 - Dzielnia",
  "/images/p2000oceaniczny.jpg": "P2000 - Oceaniczny"
};

document.addEventListener('DOMContentLoaded', () => {
  initQuantityButtons();
  updateUI();
  showStaticSkinsOnce();
});

// Podświetlenie aktywnego przycisku x1/x2 i obsługa wyboru
function initQuantityButtons() {
  const btnX1 = document.getElementById('modeX1');
  const btnX2 = document.getElementById('modeX2');
  
  // Domyślnie x1 jest aktywne
  let activeCount = 1;
  btnX1.classList.add('active');

  btnX1.addEventListener('click', () => {
    if (activeCount === 1) return;
    activeCount = 1;
    btnX1.classList.add('active');
    btnX2.classList.remove('active');
  });

  btnX2.addEventListener('click', () => {
    if (activeCount === 2) return;
    activeCount = 2;
    btnX2.classList.add('active');
    btnX1.classList.remove('active');
  });

  // Udostępniamy getter
  window.getActiveCount = () => activeCount;
}

let lastOffsetX = 0;
let currentSkinList = [];
let isFirstSpin = true;
let staticShown = false;

function showStaticSkinsOnce() {
  if (staticShown) return;
  staticShown = true;

  const strip = document.getElementById('imageStripStatic');
  strip.innerHTML = '';
  strip.style.display = 'flex';
  strip.style.overflow = 'hidden';
  strip.style.width = `${7 * 120}px`;
  strip.style.whiteSpace = 'nowrap';

  for (let i = 0; i < 7; i++) {
    const src = availableImages[Math.floor(Math.random() * availableImages.length)];
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('skin-img');
    const bgClass = imageBackgroundMap[src] || '';
    if (bgClass) img.classList.add(bgClass);
    img.style.display = 'inline-block';
    strip.appendChild(img);
  }
}

function startAnimation(finalImage, animationContainerId, onAnimationEnd) {
  const animationContainer = document.getElementById(animationContainerId);
  const imageStrip = animationContainer.querySelector('.imageStrip');
  const staticStrip = animationContainer.querySelector('.imageStripStatic');

  if (staticStrip && staticStrip.style.display !== 'none') {
    staticStrip.style.display = 'none';
  }

  animationContainer.style.display = 'block';
  imageStrip.style.display = 'flex';
  imageStrip.style.transform = `translateX(-${lastOffsetX}px)`;

  const visibleItems = 7;
  const itemWidth = 120;
  animationContainer.style.width = `${visibleItems * itemWidth}px`;

  const itemsBeforeWinner = Math.floor(visibleItems / 2);
  const extraBefore = 40;
  const extraAfter = 10;
  const winnerIndex = currentSkinList.length + extraBefore + itemsBeforeWinner;
  const totalItems = winnerIndex + 1 + extraAfter;

  const newSkins = [];

  for (let i = 0; i < totalItems - currentSkinList.length - 1; i++) {
    const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    newSkins.push(randomImage);
  }

  newSkins.splice(winnerIndex - currentSkinList.length, 0, finalImage);

  if (isFirstSpin) {
    imageStrip.innerHTML = '';
    currentSkinList = [];
    lastOffsetX = 0;
    isFirstSpin = false;
  }

  newSkins.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('skin-img');
    const bgClass = imageBackgroundMap[src] || '';
    if (bgClass) img.classList.add(bgClass);
    imageStrip.appendChild(img);
    currentSkinList.push(src);
  });

  const distanceToMove = (winnerIndex - itemsBeforeWinner) * itemWidth - lastOffsetX;
  const newOffsetX = lastOffsetX + distanceToMove;
  const totalDuration = 6000;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);
    const eased = easeOutCubic(progress);

    const currentOffset = lastOffsetX + eased * distanceToMove;
    imageStrip.style.transform = `translateX(-${currentOffset}px)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      imageStrip.style.transform = `translateX(-${newOffsetX}px)`;
      lastOffsetX = newOffsetX;
      if (onAnimationEnd) onAnimationEnd();
    }
  }

  requestAnimationFrame(animate);
}

async function loadBalance(userId) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Błąd ładowania salda:', error);
    return 0;
  }

  return data?.balance ?? 0;
}

async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    alert("Musisz się zalogować.");
    window.location.href = "/index.html";
    return;
  }

  const balanceEl = document.getElementById('balance');
  const drawBtn = document.getElementById('drawBtn');
  const resultContainer = document.getElementById('resultsContainer');

  let balance = await loadBalance(user.id);
  if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;

  drawBtn.addEventListener('click', async () => {
    drawBtn.disabled = true;
    resultContainer.innerHTML = ''; // Wyczyść poprzednie wyniki

    const activeCount = window.getActiveCount ? window.getActiveCount() : 1;
    const drawCost = 3.5 * activeCount;

    if (balance < drawCost) {
      alert(`Za mało środków na ${activeCount} losowanie(-ń).`);
      drawBtn.disabled = false;
      return;
    }

    let newBalance = balance;
    for (let i = 0; i < activeCount; i++) {
      // Tworzymy unikalne ID dla animacji i wyników
      const animId = `animationWrapper_${i}`;
      const resultId = `resultWrapper_${i}`;

      // Dodajemy do kontenera animacje + wynik
      resultContainer.insertAdjacentHTML('beforeend', `
        <div id="${animId}" class="animationWrapper" style="margin-bottom:30px;">
          <div id="animationContainer" style="overflow: hidden; border: 1px solid #db4848; width: 840px;">
            <div class="imageStripStatic" style="display: flex; flex-wrap: nowrap;"></div>
            <div class="imageStrip" style="display: none; flex-wrap: nowrap;"></div>
          </div>
          <img id="resultImage_${i}" style="max-width: 200px; display:none; margin-top:10px;" />
          <p id="resultImageName_${i}" style="font-weight: bold; font-size: 20px; color: #d75d11;"></p>
          <p id="resultMessage_${i}"></p>
          <div id="actionButtons_${i}" style="display:none;">
            <button id="sellBtn_${i}">Sprzedaj</button>
            <button id="keepBtn_${i}">Dodaj do ekwipunku</button>
          </div>
        </div>
      `);

      try {
        // Wysłanie requestu do backendu
        const response = await fetch('/api/losuj', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
        const result = await response.json();

        if (result.error) {
          document.getElementById(`resultMessage_${i}`).textContent = `Błąd losowania: ${result.error}`;
          continue;
        }

        const finalImage = result.image;
        const finalName = imageNameMap[finalImage] || "Nieznany skórka";

        // Uruchamiamy animację
        startAnimation(finalImage, animId, () => {
          // Po animacji pokazujemy wynik
          const imgEl = document.getElementById(`resultImage_${i}`);
          imgEl.src = finalImage;
          imgEl.style.display = 'block';

          document.getElementById(`resultImageName_${i}`).textContent = finalName;
          const actionButtons = document.getElementById(`actionButtons_${i}`);
          actionButtons.style.display = 'block';

          // Przycisk Sprzedaj
          document.getElementById(`sellBtn_${i}`).onclick = async () => {
            try {
              const sellResponse = await fetch('/api/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, image: finalImage })
              });
              const sellResult = await sellResponse.json();
              if (sellResult.error) {
                alert(`Błąd sprzedaży: ${sellResult.error}`);
                return;
              }
              alert(`Sprzedano ${finalName} za ${sellResult.amount} zł`);
              actionButtons.style.display = 'none';
              updateUI(); // Odśwież saldo i UI
            } catch (e) {
              alert('Błąd podczas sprzedaży.');
              console.error(e);
            }
          };

          // Przycisk Dodaj do ekwipunku
          document.getElementById(`keepBtn_${i}`).onclick = async () => {
            try {
              const keepResponse = await fetch('/api/keep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, image: finalImage })
              });
              const keepResult = await keepResponse.json();
              if (keepResult.error) {
                alert(`Błąd dodania do ekwipunku: ${keepResult.error}`);
                return;
              }
              alert(`Dodano ${finalName} do ekwipunku`);
              actionButtons.style.display = 'none';
              updateUI(); // Odśwież saldo i UI
            } catch (e) {
              alert('Błąd podczas dodawania do ekwipunku.');
              console.error(e);
            }
          };
        });

        // Odejmujemy koszt za każde losowanie
        newBalance -= 3.5;
      } catch (e) {
        console.error('Błąd requestu:', e);
        document.getElementById(`resultMessage_${i}`).textContent = "Błąd podczas losowania.";
      }
    }

    // Aktualizujemy saldo po wszystkich losowaniach
    // Tu możesz wprowadzić mechanizm aktualizacji salda na backendzie
    balance = newBalance;
    document.getElementById('balance').textContent = `${balance.toFixed(2)} zł`;

    drawBtn.disabled = false;
  });
}
