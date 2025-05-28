import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM';
const supabase = createClient(supabaseUrl, supabaseKey);

const dropContainer = document.getElementById('live-drops');
const maxDrops = 10;
const drops = [];
let currentShift = 0;

function createDropElement(drop) {
  const el = document.createElement('div');
  el.classList.add('drop');
  el.innerHTML = `
    <img src="${drop.item_image ?? 'https://via.placeholder.com/40?text=?'}" alt="${drop.item_name ?? 'Przedmiot'}" />
    <div>🎯 <b>${drop.item_name ?? 'Unknown'}</b> za <b>${drop.value.toFixed(2)} zł</b></div>
  `;
  return el;
}

function updatePosition(shift) {
  dropContainer.style.transition = 'transform 0.5s ease';
  dropContainer.style.transform = `translateX(${shift}px)`;
}

// Dodaj nowy drop z lewej i przesuwaj taśmę w prawo
function addDrop(drop) {
  const el = createDropElement(drop);
  dropContainer.insertBefore(el, dropContainer.firstChild);

  // Po odświeżeniu layoutu policz szerokość elementu + gap
  const elWidth = el.offsetWidth + 15;

  // Dodaj na początek tablicy
  drops.unshift({ el, width: elWidth });

  // Przesuwamy taśmę w prawo (czyli transformX zmniejszamy)
  currentShift -= elWidth;
  updatePosition(currentShift);

  // Jeśli mamy za dużo dropów, usuwamy najstarszy (z prawej)
  if (drops.length > maxDrops) {
    const removed = drops.pop();
    dropContainer.removeChild(removed.el);

    // Przesuwamy taśmę z powrotem w lewo o szerokość usuniętego
    currentShift += removed.width;

    // Resetujemy transform bez animacji, aby nie skakało
    dropContainer.style.transition = 'none';
    dropContainer.style.transform = `translateX(${currentShift}px)`;

    // Następnie dodajemy animację z powrotem
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dropContainer.style.transition = 'transform 0.5s ease';
      });
    });
  }
}

async function fetchInitialDrops() {
  const { data, error } = await supabase
    .from('user_inventory')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(maxDrops);

  if (error) {
    console.error('Błąd pobierania dropów:', error);
    return;
  }

  // Czyścimy wszystko
  dropContainer.innerHTML = '';
  drops.length = 0;
  currentShift = 0;
  dropContainer.style.transition = 'none';
  dropContainer.style.transform = 'translateX(0)';

  // Dodajemy od najstarszego (prawa strona) do najnowszego (lewa)
  data.reverse().forEach(drop => {
    const el = createDropElement(drop);
    dropContainer.appendChild(el);
    drops.push({ el, width: el.offsetWidth + 15 });
  });
}

function subscribeToDrops() {
  supabase.channel('public:user_inventory')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_inventory' }, payload => {
      console.log('Nowy drop:', payload.new);
      addDrop(payload.new);
    })
    .subscribe()
    .then(() => console.log('Subskrypcja aktywna'))
    .catch(console.error);
}

// Startujemy
(async () => {
  await fetchInitialDrops();
  subscribeToDrops();
})();