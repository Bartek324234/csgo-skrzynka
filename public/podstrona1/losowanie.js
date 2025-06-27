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

const imageNameMap = {
  "/images/deserteagleblue.jpg": "Desert Eagle - Niebieski",
  "/images/glock18moda.jpg": "Glock 18 - Moda",
  "/images/mac10bronz.jpg": "MAC-10 - Brązowy",
  "/images/p18dzielnia.jpg": "P18 - Dzielnia",
  "/images/p2000oceaniczny.jpg": "P2000 - Oceaniczny"
};

const availableImages = Object.keys(imageBackgroundMap);

let drawCount = 1; // domyślnie 1 pasek
let isAnimating = false; // flaga blokująca przycisk podczas animacji

document.addEventListener('DOMContentLoaded', () => {
  initQuantityButtons();
  updateUI();
});
function initQuantityButtons() {
  const btnX1 = document.getElementById('modeX1');
  const btnX2 = document.getElementById('modeX2');
  const draw2 = document.getElementById('draw2');

  btnX1.classList.add('active');
  
  btnX1.addEventListener('click', () => {
    btnX1.classList.add('active');
    btnX2.classList.remove('active');
    drawCount = 1;
    if(draw2) draw2.style.display = 'none';
    showStaticSkins(drawCount);
  });

  btnX2.addEventListener('click', () => {
    btnX2.classList.add('active');
    btnX1.classList.remove('active');
    drawCount = 2;
    if(draw2) draw2.style.display = 'block';
    showStaticSkins(drawCount);
  });

  window.getActiveCount = () => drawCount;

  showStaticSkins(drawCount);  // pokaże 1 pasek od razu po załadowaniu
}






function showStaticSkins(count) {
  for (let i = 1; i <= 5; i++) {
    const staticStrip = document.getElementById(`imageStripStatic${i}`);
    const animatedStrip = document.getElementById(`imageStrip${i}`);
    const resultImg = document.getElementById(`resultImage${i}`);
    const resultName = document.getElementById(`resultImageName${i}`);
    const actions = document.getElementById(`actionButtons${i}`);

    if (staticStrip) {
      staticStrip.innerHTML = '';
      staticStrip.style.display = 'none';
    }

    if (animatedStrip) {
      animatedStrip.innerHTML = '';
      animatedStrip.style.display = 'none';
    }

    if (resultImg) {
      resultImg.src = '';
      resultImg.style.display = 'none';
    }

    if (resultName) resultName.textContent = '';

    if (actions) actions.style.display = 'none';
  }

  for (let i = 1; i <= count; i++) {
    const staticStrip = document.getElementById(`imageStripStatic${i}`);
    if (!staticStrip) continue;

    staticStrip.innerHTML = '';
    staticStrip.style.display = 'flex';
    staticStrip.style.overflow = 'hidden';
    staticStrip.style.width = `${7 * 120}px`;
    staticStrip.style.whiteSpace = 'nowrap';

    for (let j = 0; j < 7; j++) {
      const src = availableImages[Math.floor(Math.random() * availableImages.length)];
      const img = document.createElement('img');
      img.src = src;
      img.classList.add('skin-img', imageBackgroundMap[src] || '');
      staticStrip.appendChild(img);
    }
  }
}

const animationStates = {};










function startAnimation(finalImage, containerId, onAnimationEnd) {
  if (!animationStates[containerId]) {
    animationStates[containerId] = {
      lastOffsetX: 0,
      currentSkinList: [],
      isFirstSpin: true,
    };
  }

  const state = animationStates[containerId];

  const animationContainer = document.getElementById(`animationContainer${containerId}`);
  const imageStrip = document.getElementById(`imageStrip${containerId}`);
  const staticStrip = document.getElementById(`imageStripStatic${containerId}`);

  if (!animationContainer || !imageStrip) {
    console.error(`Brak elementów dla containerId=${containerId}`);
    return;
  }

  if (staticStrip && staticStrip.style.display !== 'none') {
    staticStrip.style.display = 'none';
  }

  animationContainer.style.display = 'block';
  imageStrip.style.display = 'flex';

  imageStrip.innerHTML = '';
  state.currentSkinList = [];
  state.lastOffsetX = 0;
  state.isFirstSpin = false;

  imageStrip.style.transform = `translateX(0px)`;

  const visibleItems = 7;
  const itemWidth = 120;
  animationContainer.style.width = `${visibleItems * itemWidth}px`;

  const itemsBeforeWinner = Math.floor(visibleItems / 2);
  const extraBefore = 40;
  const extraAfter = 10;

  const winnerIndex = extraBefore + itemsBeforeWinner;
  const totalItems = winnerIndex + 1 + extraAfter;

  const newSkins = [];

  for (let i = 0; i < totalItems - 1; i++) {
    const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    newSkins.push(randomImage);
  }

  newSkins.splice(winnerIndex, 0, finalImage);

  newSkins.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('skin-img');
    const bgClass = imageBackgroundMap[src] || '';
    if (bgClass) img.classList.add(bgClass);
    imageStrip.appendChild(img);
    state.currentSkinList.push(src);
  });

  const distanceToMove = (winnerIndex - itemsBeforeWinner) * itemWidth;
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

    const currentOffset = eased * distanceToMove;
    imageStrip.style.transform = `translateX(-${currentOffset}px)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      imageStrip.style.transform = `translateX(-${distanceToMove}px)`;
      state.lastOffsetX = distanceToMove;
      if (onAnimationEnd) onAnimationEnd();
    }
  }

  requestAnimationFrame(animate);
}







async function loadBalance(userId) {
  if (!userId) {
    console.error("Brak userId, nie można załadować balansu");
    return 0;
  }

  const { data, error } = await supabase
    .from("user_balances")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Błąd podczas pobierania balansu:", error);
    return 0;
  }
  return data.balance || 0;
}
























function attachActionHandlers(user, balanceEl) {
  document.querySelectorAll('.sell-button').forEach(button => {
    button.onclick = async (e) => {
      if (isAnimating) return;

      const container = e.target.closest('.draw-container');
      if (!container) return;

      const idx = container.dataset.index;
      if (!idx) return;

      const actionBtns = document.getElementById(`actionButtons${idx}`);
      if (!actionBtns) return;

      const skinToSell = actionBtns.dataset.skin;
      if (!skinToSell) return;

      const price = 1.00;

      const { data, error } = await supabase.rpc('add_balance', {
        user_id_in: user.id,
        amount_in: price
      });

      if (error) {
        alert("Błąd przy dodawaniu salda: " + error.message);
        return;
      }

      alert(`Sprzedano skin ${imageNameMap[skinToSell]} za ${price.toFixed(2)} zł`);

      const resultImg = document.getElementById(`resultImage${idx}`);
      const resultName = document.getElementById(`resultImageName${idx}`);

      if (resultImg) {
        resultImg.src = '';
        resultImg.style.display = 'none';
      }
      if (resultName) {
        resultName.textContent = '';
      }
      actionBtns.style.display = 'none';

      const newBalance = await loadBalance(user.id);
      if (balanceEl) balanceEl.textContent = `${newBalance.toFixed(2)} zł`;
    };
  });

  document.querySelectorAll('.keep-button').forEach(button => {
    button.onclick = async (e) => {
      if (isAnimating) return;

      const container = e.target.closest('.draw-container');
      if (!container) return;

      const idx = container.dataset.index;
      if (!idx) return;

      const actionBtns = document.getElementById(`actionButtons${idx}`);
      if (!actionBtns) return;

      const skinToKeep = actionBtns.dataset.skin;
      if (!skinToKeep) return;

      const { data, error } = await supabase
        .from('user_inventory')
        .insert([{ user_id: user.id, skin: skinToKeep }]);

      if (error) {
        alert("Błąd przy dodawaniu do ekwipunku: " + error.message);
        return;
      }

      alert(`Dodano skin ${imageNameMap[skinToKeep]} do ekwipunku.`);

      const resultImg = document.getElementById(`resultImage${idx}`);
      const resultName = document.getElementById(`resultImageName${idx}`);

      if (resultImg) {
        resultImg.src = '';
        resultImg.style.display = 'none';
      }
      if (resultName) {
        resultName.textContent = '';
      }
      actionBtns.style.display = 'none';
    };
  });
}













async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    alert("Musisz się zalogować.");
    window.location.href = "/index.html";
    return;
  }

  const drawButton = document.getElementById('drawButton');
  const balanceEl = document.getElementById('balance');

  let balance = await loadBalance(user.id);
  if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;

  drawButton.onclick = async () => {
    if (isAnimating) return;
    isAnimating = true;
    drawButton.disabled = true;
    drawButton.textContent = "Losuję...";

    const skinsCount = getActiveCount();
    const promises = [];
    const drawnSkins = [];

    // Losowanie i uruchamianie animacji
    for (let i = 1; i <= skinsCount; i++) {
      const randomSkin = availableImages[Math.floor(Math.random() * availableImages.length)];
      drawnSkins.push(randomSkin);

      const promise = new Promise(resolve => {
        startAnimation(randomSkin, i, resolve);
      });

      promises.push(promise);
    }

    await Promise.all(promises);



// Dodanie wpisów do live_drops
for (let i = 0; i < drawnSkins.length; i++) {
  const skin = drawnSkins[i];
  const { error } = await supabase.from('live_drops').insert([
    { user_id: user.id, skin: skin, created_at: new Date().toISOString() }
  ]);
  if (error) {
    console.error("Błąd zapisu live_drop:", error);
  }
}


    // Pokazywanie wyników
    for (let i = 1; i <= skinsCount; i++) {
      const randomSkin = drawnSkins[i - 1];

      const resultImg = document.getElementById(`resultImage${i}`);
      const resultName = document.getElementById(`resultImageName${i}`);
      const resultPrice = document.getElementById(`resultImagePrice${i}`);
      const actionBtns = document.getElementById(`actionButtons${i}`);

      // Sprawdzenie, czy elementy istnieją
      if (resultImg) {
        resultImg.src = randomSkin;
        resultImg.style.display = "block";
      }

      if (resultName) {
        resultName.textContent = imageNameMap[randomSkin] || "";
      }

      if (actionBtns) {
        actionBtns.style.display = "flex";
        actionBtns.dataset.skin = randomSkin;
      }
    }

    
// Podpinamy eventy po wyświetleniu wyników
attachActionHandlers(user, balanceEl);

    isAnimating = false;
    drawButton.disabled = false;
    drawButton.textContent = "Losuj";
  };
}










  // Obsługa sprzedaży skórek
  document.querySelectorAll('.sell-button').forEach(button => {
    button.onclick = async (e) => {
      if (isAnimating) return;

      const container = e.target.closest('.animation-container-wrapper');
      if (!container) return;

      const idx = container.dataset.index;
      const actionBtns = document.getElementById(`actionButtons${idx}`);
      if (!actionBtns) return;

      const skinToSell = actionBtns.dataset.skin;
      if (!skinToSell) return;

      // Dodaj saldo do użytkownika w bazie
      const price = 1.00; // przykładowa cena skóry

      const { data, error } = await supabase.rpc('add_balance', {
        user_id_in: user.id,
        amount_in: price
      });

      if (error) {
        alert("Błąd przy dodawaniu salda: " + error.message);
        return;
      }

      alert(`Sprzedano skin ${imageNameMap[skinToSell]} za ${price.toFixed(2)} zł`);
      
      // Ukryj przyciski i obrazek wyniku po sprzedaży
      const resultImg = document.getElementById(`resultImage${idx}`);
      const resultName = document.getElementById(`resultImageName${idx}`);

      if (resultImg) {
        resultImg.src = '';
        resultImg.style.display = 'none';
      }
      if (resultName) {
        resultName.textContent = '';
      }
      actionBtns.style.display = 'none';

      // Odśwież saldo
      const newBalance = await loadBalance(user.id);
      if (balanceEl) balanceEl.textContent = `${newBalance.toFixed(2)} zł`;
    };
  });

