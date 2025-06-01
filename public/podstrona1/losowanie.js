import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jotdnbkfgqtznjwbfjno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM"
);

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







// Funkcja animacji paska obrazków
function startAnimation(finalImage, onAnimationEnd) {
  const animationContainer = document.getElementById('animationContainer');
  const imageStrip = document.getElementById('imageStrip');

  animationContainer.style.display = 'block';
  imageStrip.innerHTML = '';
  imageStrip.style.transform = 'translateX(0px)';

  const availableImages = [
    '/images/deserteagleblue.jpg',
    '/images/glock18moda.jpg',
    '/images/mac10bronz.jpg',
    '/images/p18dzielnia.jpg',
    '/images/p2000oceaniczny.jpg'
  ];

  const visibleItems = 7;
  const itemWidth = 120;
  animationContainer.style.width = `${visibleItems * itemWidth}px`;

  const itemsBeforeWinner = Math.floor(visibleItems / 2);
  const extraBefore = 25;
  const extraAfter = 10;

  const winnerIndex = extraBefore + itemsBeforeWinner;
  const totalItems = winnerIndex + 1 + extraAfter;

  const skinList = [];

  for (let i = 0; i < totalItems - 1; i++) {
    const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    skinList.push(randomImage);
  }

  skinList.splice(winnerIndex, 0, finalImage);

  skinList.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '100px';
    img.style.marginRight = '20px';
    imageStrip.appendChild(img);
  });

  const stopAt = (winnerIndex - itemsBeforeWinner) * itemWidth;

  // 🔽 Easing: bardzo płynne zwalnianie
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  const duration = 4000; // ms (4 sekundy)
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const t = Math.min(elapsed / duration, 1); // normalizujemy od 0 do 1
    const eased = easeOutExpo(t);

    const position = eased * stopAt;
    imageStrip.style.transform = `translateX(-${position}px)`;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      imageStrip.style.transform = `translateX(-${stopAt}px)`;
      if (onAnimationEnd) onAnimationEnd();
    }
  }

  requestAnimationFrame(animate);
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
  const resultEl = document.getElementById('result');
  const imageEl = document.getElementById('resultImage');
  const imageNameEl = document.getElementById('resultImageName');
  const drawBtn = document.getElementById('drawBtn');
  const actionButtons = document.getElementById('actionButtons');
  const sellBtn = document.getElementById('sellBtn');
  const keepBtn = document.getElementById('keepBtn');

  let balance = await loadBalance(user.id);
  if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;

  if (resultEl) resultEl.textContent = '';
  if (imageEl) imageEl.style.display = 'none';
  if (imageNameEl) imageNameEl.style.display = 'none';
  if (actionButtons) actionButtons.style.display = 'none';

  // Mapa ścieżek do nazw obrazków:
  const imageNameMap = {
    "/images/deserteagleblue.jpg": "Desert Eagle - Niebieski",
    "/images/glock18moda.jpg": "Glock 18 - Moda",
    "/images/mac10bronz.jpg": "MAC-10 - Brązowy",
    "/images/p18dzielnia.jpg": "P18 - Dzielnia",
    "/images/p2000oceaniczny.jpg": "P2000 - Oceaniczny"
  };

  if (drawBtn) {
    drawBtn.addEventListener('click', async () => {
      try {
        drawBtn.disabled = true;
        resultEl.textContent = '';
        imageEl.style.display = 'none';
        imageNameEl.style.display = 'none';
        actionButtons.style.display = 'none';

        // Wywołaj backend losowania
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

        // Uruchom animację i po niej pokaż wynik
        startAnimation(result.image, () => {
          resultEl.textContent = result.message;
          imageEl.src = result.image;
          imageEl.style.display = 'block';
          imageNameEl.textContent = imageNameMap[result.image] || 'Nieznana nazwa';
          imageNameEl.style.display = 'block';
          actionButtons.style.display = 'block';

          if (typeof result.newBalance === 'number' && balanceEl) {
            balance = result.newBalance;
            balanceEl.textContent = `${balance.toFixed(2)} zł`;
          }

          const itemId = result.item_id;

          sellBtn.onclick = async () => {
            try {
              const sellResponse = await fetch('/api/sell-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: user.id,
                  item_id: itemId,
                  value: result.value
                })
              });

              const sellData = await sellResponse.json();

              if (sellData.newBalance !== undefined && balanceEl) {
                balance = sellData.newBalance;
                balanceEl.textContent = `${balance.toFixed(2)} zł`;
              }

              resultEl.textContent = 'Przedmiot sprzedany!';
              imageEl.style.display = 'none';
              imageNameEl.style.display = 'none';
              actionButtons.style.display = 'none';
            } catch (err) {
              console.error("Błąd sprzedaży:", err);
              resultEl.textContent = 'Błąd sprzedaży przedmiotu.';
            }
          };

          keepBtn.onclick = async () => {
            try {
              resultEl.textContent = 'Przedmiot jest już w ekwipunku.';
              actionButtons.style.display = 'none';
            } catch (err) {
              console.error("Błąd dodania do ekwipunku:", err);
              resultEl.textContent = 'Błąd dodania do ekwipunku.';
            }
          };
          
          drawBtn.disabled = false; // Odblokuj przycisk po animacji
        });

      } catch (error) {
        console.error('Błąd losowania:', error);
        resultEl.textContent = 'Coś poszło nie tak podczas losowania.';
        drawBtn.disabled = false;
      }
    });
  }
}

updateUI();
