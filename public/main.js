// Pobierz ekwipunek
const inventoryEl = document.getElementById('inventory');
const { data: inventory } = await supabase
  .from('user_inventory')
  .select('*')
  .eq('user_id', user.id);

if (inventoryEl && inventory) {
  inventoryEl.innerHTML = inventory.map(item => `
    <div>
      <img src="${item.image_url}" style="width:100px" />
      <p>${item.item_name}</p>
    </div>
  `).join('');
}
