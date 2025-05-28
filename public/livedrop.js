document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  const dropContainer = document.getElementById('live-drops');
  const maxDrops = 10;
  const drops = [];

  function renderDrop(drop) {
    const el = document.createElement('div');
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.innerHTML = `
      <img src="${drop.item_image}" style="width: 24px; height: 24px; margin-right: 5px;" />
      🎯 <b>Gracz</b> trafił <b>${drop.item_name}</b> za <b>${drop.value.toFixed(2)} zł</b>
    `;
    dropContainer.appendChild(el);
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
      data.reverse().forEach((drop) => {
        drops.push(drop);
        renderDrop(drop);
      });
    }
  }

  function subscribeToDrops() {
    supabaseClient
      .channel('user_inventory')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_inventory',
      }, (payload) => {
        console.log('Nowy drop:', payload);
        const drop = payload.new;
        drops.push(drop);
        if (drops.length > maxDrops) drops.shift();
        dropContainer.innerHTML = '';
        drops.forEach(renderDrop);
      })
      .subscribe()
      .then(() => console.log('Subskrypcja aktywna'))
      .catch(console.error);
  }

  await fetchInitialDrops();
  subscribeToDrops();
});