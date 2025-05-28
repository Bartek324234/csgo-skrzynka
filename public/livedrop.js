document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM';

  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  const dropContainer = document.getElementById('live-drops');
  const maxDrops = 10;

  let currentShift = 0;
  const drops = [];

  function addDrop(drop) {
    const el = document.createElement('div');
    el.classList.add('drop');

    const imgSrc = drop.item_image && drop.item_image.startsWith('http')
      ? drop.item_image
      : 'https://via.placeholder.com/32?text=?';

    el.innerHTML = `
      <img src="${imgSrc}" alt="${drop.item_name || 'Item'}" />
      <span><b>${drop.value?.toFixed(2) || '0.00'} zł</b></span>
    `;

    dropContainer.insertBefore(el, dropContainer.firstChild);

    const elWidth = el.offsetWidth + 15;
    drops.unshift({ el, width: elWidth });

    currentShift -= elWidth;

    dropContainer.style.transition = 'transform 0.5s ease';
    dropContainer.style.transform = `translateX(${currentShift}px)`;

    if (drops.length > maxDrops) {
      const last = drops.pop();
      dropContainer.removeChild(last.el);

      currentShift += last.width;

      dropContainer.style.transition = 'none';
      dropContainer.style.transform = `translateX(${currentShift}px)`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dropContainer.style.transition = 'transform 0.5s ease';
        });
      });
    }
  }

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
      dropContainer.innerHTML = '';
      drops.length = 0;
      currentShift = 0;
      dropContainer.style.transition = 'none';
      dropContainer.style.transform = 'translateX(0)';

      data.reverse().forEach((drop) => {
        const el = document.createElement('div');
        el.classList.add('drop');

        const imgSrc = drop.item_image && drop.item_image.startsWith('http')
          ? drop.item_image
          : 'https://via.placeholder.com/32?text=?';

        el.innerHTML = `
          <img src="${imgSrc}" alt="${drop.item_name || 'Item'}" />
          <span><b>${drop.value?.toFixed(2) || '0.00'} zł</b></span>
        `;

        dropContainer.appendChild(el);
        drops.push({ el, width: el.offsetWidth + 15 });
      });
    }
  }

  function subscribeToDrops() {
    const channel = supabaseClient
      .channel('user_inventory')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_inventory',
      }, (payload) => {
        console.log('Nowy drop:', payload);
        addDrop(payload.new);
      })
      .subscribe();

    console.log('Subskrypcja aktywna');
  }

  await fetchInitialDrops();
  subscribeToDrops();
});
