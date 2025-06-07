import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jotdnbkfgqtznjwbfjno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM"
);

const availableImages = [
  '/images/deserteagleblue.jpg',
  '/images/glock18moda.jpg',
  '/images/mac10bronz.jpg',
  '/images/p18dzielnia.jpg',
  '/images/p2000oceaniczny.jpg'
];

const imageBackgroundMap = {
  "/images/deserteagleblue.jpg": "bg-blue",
  "/images/glock18moda.jpg": "bg-purple",
  "/images/mac10bronz.jpg": "bg-bronze",
  "/images/p18dzielnia.jpg": "bg-red",
  "/images/p2000oceaniczny.jpg": "bg-gold"
};

const imageNameMap = {
  "/images/deserteagleblue.jpg": "Desert Eagle - Niebieski",
  "/images/glock18moda.jpg": "Glock 18 - Moda",
  "/images/mac10bronz.jpg": "MAC-10 - Brązowy",
  "/images/p18dzielnia.jpg": "P18 - Dzielnia",
  "/images/p2000oceaniczny.jpg": "P2000 - Oceaniczny"
};

let selectedCount = 1; // domyślnie x1

document.addEventListener('DOMContentLoaded', () => {
  const countButtons = document.querySelectorAll('.draw-option');
  const drawBtn = document.getElementById('drawBtn');
  const balanceEl = document.getElementById('balance');
  const animationsWrapper = document.getElementById('animationsWrapper');

  countButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCount = parseInt(btn.dataset.count);
      countButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

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

  function createAnimationContainer(index) {
    // Tworzymy kontener na animację i UI pod nią
    const container = document.createElement('div');
    container.classList.add('animation-block');
    container.style.border = '1px solid #ccc';
    container.style.marginBottom = '20px';
    container.style.padding = '10px';
    container.style.position = 'relative';

    // Pasek animacji
    const animStrip = document.createElement('div');
    animStrip.classList.add('imageStrip');
    animStrip.style.display = 'flex';
    animStrip.style.overflow = 'hidden';
    animStrip.style.width = '840px'; // 7 elementów * 120px (100+20 margin)
    animStrip.style.height = '120px';
    animStrip.style.marginBottom = '10px';
    container.appendChild(animStrip);

    // Wynik
    const resultEl = document.createElement('div');
    resultEl.classList.add('result-text');
    container.appendChild(resultEl);

    // Obrazek wyniku
    const imgResult = document.createElement('img');
    imgResult.style.display = 'none';
    imgResult.style.maxHeight = '120px';
    imgResult.style.marginRight = '10px';
    container.appendChild(imgResult);

    // Nazwa obrazka
    const imgName = document.createElement('div');
    imgName.style.fontWeight = 'bold';
    container.appendChild(imgName);

    // Przyciski akcji
    const actionButtons = document.createElement('div');
    actionButtons.style.marginTop = '10px';
    actionButtons.style.display = 'none';

    const sellBtn = document.createElement('button');
    sellBtn.textContent = 'Sprzedaj';
    sellBtn.style.marginRight = '10px';

    const keepBtn = document.createElement('button');
    keepBtn.textContent = 'Zachowaj';

    actionButtons.appendChild(sellBtn);
    actionButtons.appendChild(keepBtn);
    container.appendChild(actionButtons);

    return {
      container,
      animStrip,
      resultEl,
      imgResult,
      imgName,
      actionButtons,
      sellBtn,
      keepBtn
    };
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function startAnimation(finalImage, animStrip) {
    return new Promise((resolve) => {
      const visibleItems = 7;
      const itemWidth = 120;

      // Przygotowanie listy animowanych obrazków - random + finalImage w środku
      const itemsBeforeWinner = Math.floor(visibleItems / 2);
      const extraBefore = 40;
      const extraAfter = 10;
      const winnerIndex = extraBefore + itemsBeforeWinner;
      const totalItems = winnerIndex + 1 + extraAfter;

      const newSkins = [];
      for (let i = 0; i < totalItems; i++) {
        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        newSkins.push(randomImage);
      }
      // Wstawiamy finalImage na winnerIndex
      newSkins.splice(winnerIndex, 1, finalImage);

      animStrip.innerHTML = ''; // wyczyść poprzednie

      newSkins.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('skin-img');
        const bgClass = imageBackgroundMap[src] || '';
        if (bgClass) img.classList.add(bgClass);
        img.style.width = '100px';
        img.style.marginRight = '20px';
        animStrip.appendChild(img);
      });

      const totalDuration = 6000;
      const distanceToMove = (winnerIndex - itemsBeforeWinner) * itemWidth;

      let startTime = null;
      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        const eased = easeOutCubic(progress);

        const currentOffset = eased * distanceToMove;
        animStrip.style.transform = `translateX(-${currentOffset}px)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          animStrip.style.transform = `translateX(-${distanceToMove}px)`;
          resolve();
        }
      }
      requestAnimationFrame(animate);
    });
  }

  drawBtn.addEventListener('click', async () => {
    const user = supabase.auth.getUser();
    if (!user) {
      alert('Musisz się zalogować.');
      window.location.href = '/index.html';
      return;
    }
    drawBtn.disabled = true;
    animationsWrapper.innerHTML = ''; // wyczyść wszystkie animacje

    const balance = await loadBalance(user.id);
    if (balance < 3.5 * selectedCount) {
      alert('Masz za mało środków!');
      drawBtn.disabled = false;
      return;
    }

    for (let i = 0; i < selectedCount; i++) {
      // Tworzymy UI i kontener animacji dla każdego losowania
      const { container, animStrip, resultEl, imgResult, imgName, actionButtons, sellBtn, keepBtn } = createAnimationContainer(i);
      animationsWrapper.appendChild(container);

      try {
        // Wywołanie backendu na losowanie (pojedyncze)
        const response = await fetch('/api/losuj', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
        const result = await response.json();

        if (result.error) {
          resultEl.textContent = result.error;
          drawBtn.disabled = false;
          continue;
        }

        // Uruchom animację z otrzymanym obrazkiem
        await startAnimation(result.image, animStrip);

        // Po animacji pokaż wyniki i przyciski
        resultEl.textContent = result.message || 'Wylosowano przedmiot!';
        imgResult.src = result.image;
        imgResult.style.display = 'inline-block';
        imgName.textContent = imageNameMap[result.image] || 'Nieznana nazwa';
        actionButtons.style.display = 'block';

        sellBtn.onclick = async () => {
          try {
            const sellResponse = await fetch('/api/sell-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.id,
                item_id: result.item_id
              })
            });
            const sellResult = await sellResponse.json();
            if (sellResult.success) {
              alert('Przedmiot sprzedany!');
              container.remove();
            } else {
              alert('Błąd podczas sprzedaży.');
            }
          } catch {
            alert('Błąd podczas sprzedaży.');
          }
        };

        keepBtn.onclick = () => {
          alert('Przedmiot zachowany!');
          actionButtons.style.display = 'none';
        };

      } catch (e) {
        resultEl.textContent = 'Błąd losowania.';
        console.error(e);
      }
    }
    drawBtn.disabled = false;
  });
});
