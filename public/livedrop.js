// livedrop.js
document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  const dropContainer = document.getElementById('live-drops');
  const maxDrops = 20; // maksymalna ilość dropów na pasku

  // Usuwa drop z DOM po zakończeniu animacji (czyli jak zniknie po lewej)
  function setupRemoveOnEnd(el) {
    el.addEventListener('animationend', () => {
      el.remove();
    });
  }

  function renderDrop(drop) {
    const el = document.createElement('div');
    el.classList.add('drop');
    el.innerHTML = `
      <img src="${drop.item_image || 'https://via.placeholder.com/32?text=?'}" alt="${drop.item_name}" />
      <span><b>${drop.value.toFixed(2)} zł</b></span>
    `;

    setupRemoveOnEnd(el);
    dropContainer.appendChild(el);

    // Jeśli jest za dużo dropów, usuwamy najstarsze (najbardziej po lewej)
    while (dropContainer.children.length > maxDrops) {
      dropContainer.removeChild(dropContainer.children[0]);
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
      data.reverse().forEach(renderDrop);
    }
  }

  function subscribeToDrops() {
    const subscription = supabaseClient
      .channel('user_inventory')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_inventory',
      }, (payload) => {
        console.log('Nowy drop:', payload);
        renderDrop(payload.new);
      })
      .subscribe();

    subscription.on('error', (error) => {
      console.error('Błąd subskrypcji:', error);
    });

    console.log('Subskrypcja aktywna');
  }

  await fetchInitialDrops();
  subscribeToDrops();
});
