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

  // Dodaj tutaj na końcu:
  showStaticSkins(drawCount);  // pokaże 1 pasek od razu po załadowaniu
}


function resetAnimationStates() {
  for (let i = 1; i <= 5; i++) {
    if (animationStates[i]) {
      animationStates[i].isFirstSpin = true;
      animationStates[i].currentSkinList = [];
      animationStates[i].lastOffsetX = 0;
    }
  }
}
function showStaticSkins(count) {
  // Najpierw ukryj/wyczyść WSZYSTKO od 1 do 5 (niezależnie od count)
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

  // Teraz narysuj odpowiednią liczbę pasków statycznych
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


const animationStates = {};  // stan animacji na kontenerId











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

  // Reset stanu na nową animację - ważne przy zmianie trybu (x1, x2)
  imageStrip.innerHTML = '';
  state.currentSkinList = [];
  state.lastOffsetX = 0;
  state.isFirstSpin = false;

  imageStrip.style.transform = `translateX(0px)`; // startowa pozycja

  const visibleItems = 7;
  const itemWidth = 120;
  animationContainer.style.width = `${visibleItems * itemWidth}px`;

  const itemsBeforeWinner = Math.floor(visibleItems / 2);
  const extraBefore = 40;
  const extraAfter = 10;

  const winnerIndex = extraBefore + itemsBeforeWinner;
  const totalItems = winnerIndex + 1 + extraAfter;

  const newSkins = [];

  // Dodajemy losowe obrazki przed zwycięzcą
  for (let i = 0; i < totalItems - 1; i++) {
    const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    newSkins.push(randomImage);
  }

  // Wstawiamy finalImage na właściwe miejsce (zwycięzca)
  newSkins.splice(winnerIndex, 0, finalImage);

  // Dodajemy obrazki do paska animacji
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
    .from("user_balances")   // tutaj nazwa tabeli
    .select("balance")
    .eq("user_id", userId)   // kolumna user_id
    .single();

  if (error || !data) {
    console.error("Błąd podczas pobierania balansu:", error);
    return 0;
  }
  return data.balance || 0;
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
  const count = drawCount;
  if (balance < count * 3.5) {
    alert('Za mało środków');
    return;
  }

  const results = await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const response = await fetch('/api/losuj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const result = await response.json();
      return { ...result, index: i + 1 };
    })
  );









  results.forEach(({ image, index, id: itemId, value }) => {
    const name = imageNameMap[image] || 'Nieznany skin';
    const resultImg = document.getElementById(`resultImage${index}`);
    const resultName = document.getElementById(`resultImageName${index}`);
    const actions = document.getElementById(`actionButtons${index}`);

    startAnimation(image, index, () => {
      resultImg.src = image;
      resultImg.style.display = 'block';
      resultName.textContent = name;
      actions.style.display = 'block';
    });










document.getElementById(`sellBtn${index}`).onclick = async () => {
  const res = await fetch('/api/sell', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.id,
      item_id: itemId,
      value: value
    })
  });

  const data = await res.json();

  if (data.success) {
    alert("Sprzedano przedmiot!");
    resultImg.style.display = 'none';
    resultName.textContent = '';
    actions.style.display = 'none';
    balance += value;
    if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;
  } else {
    alert("Błąd przy sprzedaży.");
  }
};




    document.getElementById(`keepBtn${index}`).onclick = async () => {
      const res = await fetch('/api/keep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, image })
      });
      const data = await res.json();
      if (data.success) {
        alert("Dodano do ekwipunku!");
        resultImg.style.display = 'none';
        resultName.textContent = '';
        actions.style.display = 'none';
      } else {
        alert("Błąd przy dodawaniu.");
      }
    };
  });

  balance -= count * 3.5;
  if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;
};

}
updateUI();