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

document.addEventListener('DOMContentLoaded', () => {
  initQuantityButtons();
  showStaticSkins();
  updateUI();
});

function initQuantityButtons() {
  const btnX1 = document.getElementById('modeX1');
  const btnX2 = document.getElementById('modeX2');

  btnX1.classList.add('active');

  btnX1.addEventListener('click', () => {
    btnX1.classList.add('active');
    btnX2.classList.remove('active');
    document.getElementById('draw2').style.display = 'none';
    showStaticSkins();
  });

  btnX2.addEventListener('click', () => {
    btnX2.classList.add('active');
    btnX1.classList.remove('active');
    document.getElementById('draw2').style.display = 'block';
    showStaticSkins();
  });

  window.getActiveCount = () => btnX2.classList.contains('active') ? 2 : 1;
}

function showStaticSkins() {
  for (let i = 1; i <= 2; i++) {
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

function startAnimation(finalImage, containerId, onEnd) {
  const imageStrip = document.getElementById(`imageStrip${containerId}`);
  const staticStrip = document.getElementById(`imageStripStatic${containerId}`);
  const animationContainer = document.getElementById(`animationContainer${containerId}`);

  staticStrip.style.display = 'none';
  imageStrip.style.display = 'flex';
  animationContainer.style.width = `${7 * 120}px`;

  imageStrip.innerHTML = '';

  const images = [];
  for (let i = 0; i < 40; i++) {
    images.push(availableImages[Math.floor(Math.random() * availableImages.length)]);
  }

  images.splice(20, 0, finalImage);

  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('skin-img', imageBackgroundMap[src] || '');
    imageStrip.appendChild(img);
  });

  const distance = (20 * 120);
  imageStrip.style.transform = `translateX(0px)`;

  let start = null;
  const duration = 5000;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(time) {
    if (!start) start = time;
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOut(progress);
    imageStrip.style.transform = `translateX(-${distance * eased}px)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (onEnd) onEnd();
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
    const count = getActiveCount();
    if (balance < count * 3.5) {
      alert('Za mało środków');
      return;
    }

    for (let i = 1; i <= count; i++) {
      const resultImg = document.getElementById(`resultImage${i}`);
      const resultName = document.getElementById(`resultImageName${i}`);
      const actions = document.getElementById(`actionButtons${i}`);

      const response = await fetch('/api/losuj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      const result = await response.json();
      const image = result.image;
      const name = imageNameMap[image] || 'Nieznany skin';

      startAnimation(image, i, () => {
        resultImg.src = image;
        resultImg.style.display = 'block';
        resultName.textContent = name;
        actions.style.display = 'block';
      });

      document.getElementById(`sellBtn${i}`).onclick = async () => {
        const res = await fetch('/api/sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, image })
        });
        const data = await res.json();
        if (data.success) {
          alert("Sprzedano przedmiot!");
          resultImg.style.display = 'none';
          resultName.textContent = '';
          actions.style.display = 'none';
          balance += data.amount || 0;
          if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;
        } else {
          alert("Błąd przy sprzedaży.");
        }
      };

      document.getElementById(`keepBtn${i}`).onclick = async () => {
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
    }

    balance -= count * 3.5;
    if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} zł`;
  };
}
