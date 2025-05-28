document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'; // wpisz swój klucz
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  const dropContainer = document.getElementById('live-drops');
  const maxDrops = 10;

  let currentShift = 0; // ile px przesunięto taśmę
  const drops = [];

  // Dodaje drop z lewej strony
  function addDrop(drop) {
    const el = document.createElement('div');
    el.classList.add('drop');
    el.innerHTML = `
      <img src="${drop.item_image || 'https://via.placeholder.com/32?text=?'}" alt="${drop.item_name || 'Item'}" />
      <span><b>${drop.value.toFixed(2)} zł</b></span>
    `;

    // Dodajemy element **na początek** kontenera (czyli z lewej)
    dropContainer.insertBefore(el, dropContainer.firstChild);

    // Obliczamy szerokość nowego elementu
    const elWidth = el.offsetWidth + 15; // 15px gap

    // Dodajemy do tablicy na początek
    drops.unshift({ el, width: elWidth });

    // Przesuwamy całą taśmę w prawo o szerokość nowego elementu
    currentShift -= elWidth; // przesuwamy ujemnie, bo przesuwamy w prawo (transformX ujemne = przesunięcie w lewo, więc tutaj ujemne przesunięcie to ruch w prawo)

    // Ustawiamy transform i animację
    dropContainer.style.transition = 'transform 0.5s ease';
    dropContainer.style.transform = `translateX(${currentShift}px)`;

    // Jeśli mamy więcej niż maxDrops, usuwamy najstarszy z prawej strony (koniec listy)
    if (drops.length > maxDrops) {
      const last = drops.pop();
      dropContainer.removeChild(last.el);
      
      // Teraz przesunięcie trzeba "przywrócić" bo element usunięty
      currentShift += last.width;
      
      // Wyłączamy animację, ustawiamy nową pozycję (przycięcie taśmy)
      dropContainer.style.transition = 'none';
      dropContainer.style.transform = `translateX(${currentShift}px)`;

      // Przywracamy animację na następny ruch
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dropContainer.style.transition = 'transform 0.5s ease';
        });
      });
    }
  }

  // Pobieranie ostatnich dropów - pokazujemy w stanie startowym (bez przesunięć)
  async function fetchInitialDrops() {
    const { data, error } = await supabaseClient
      .from('user_inventory')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(maxDrops);

    if (error) {
      console.error('Błąd podczas pobierania dropów:', error);
      return;
    }

    if (data) {
      // Resetujemy stan
      dropContainer.innerHTML = '';
      drops.length = 0;
      currentShift = 0;
      dropContainer.style.transition = 'none';
      dropContainer.style.transform = 'translateX(0)';

      // Dodajemy dane od najstarszego (po prawej stronie)
      data.reverse().forEach((drop) => {
        const el = document.createElement('div');
        el.classList.add('drop');
        el.innerHTML = `
          <img src="${drop.item_image || 'https://via.placeholder.com/32?text=?'}" alt="${drop.item_name || 'Item'}" />
          <span><b>${drop.value.toFixed(2)} zł</b></span>
        `;
        dropContainer.appendChild(el);
        drops.push({ el, width: el.offsetWidth + 15 });
      });
    }
  }

  // Subskrypcja nowych dropów
  function subscribeToDrops() {
    supabaseClient
      .channel('user_inventory')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_inventory',
      }, (payload) => {
        console.log('Nowy drop:', payload);
        addDrop(payload.new);
      })
      .subscribe()
      .then(() => console.log('Subskrypcja aktywna'))
      .catch(console.error);
  }

  await fetchInitialDrops();
  subscribeToDrops();
});
