import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'
const supabase = createClient(supabaseUrl, supabaseKey)

const dropContainer = document.getElementById('live-drops')
const maxDrops = 10
const drops = []
let currentShift = 0

function createDropElement(drop) {
  const el = document.createElement('div')
  el.classList.add('drop')
  el.innerHTML = `
    <img src="${drop.item_image ?? 'https://via.placeholder.com/40?text=?'}" alt="${drop.item_name ?? 'Przedmiot'}" />
    <div>🎯 <b>${drop.item_name ?? 'Unknown'}</b> za <b>${drop.value.toFixed(2)} zł</b></div>
  `
  return el
}

function updatePosition(shift) {
  dropContainer.style.transition = 'transform 0.5s ease'
  dropContainer.style.transform = `translateX(${shift}px)`
}

function addDrop(drop) {
  const el = createDropElement(drop)

  // Wstawiamy na początek taśmy
  dropContainer.insertBefore(el, dropContainer.firstChild)

  // Po renderze elementu zmierz szerokość i wykonaj przesunięcie
  requestAnimationFrame(() => {
    const elWidth = el.offsetWidth + 15

    drops.unshift({ el, width: elWidth })

    // Przesuwamy taśmę w prawo (zmniejszamy transformX)
    currentShift -= elWidth
    updatePosition(currentShift)

    if (drops.length > maxDrops) {
      const removed = drops.pop()
      dropContainer.removeChild(removed.el)

      currentShift += removed.width

      // Reset bez animacji by nie było skoków
      dropContainer.style.transition = 'none'
      dropContainer.style.transform = `translateX(${currentShift}px)`

      // Przywróć animacje na kolejny ruch
      requestAnimationFrame(() => {
        dropContainer.style.transition = 'transform 0.5s ease'
      })
    }
  })
}

async function fetchInitialDrops() {
  const { data, error } = await supabase
    .from('user_inventory')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(maxDrops)

  if (error) {
    console.error('Błąd pobierania dropów:', error)
    return
  }

  dropContainer.innerHTML = ''
  drops.length = 0
  currentShift = 0
  dropContainer.style.transition = 'none'
  dropContainer.style.transform = 'translateX(0)'

  // Dodaj od najstarszego do najnowszego (prawa strona do lewej)
  for (const drop of data.reverse()) {
    const el = createDropElement(drop)
    dropContainer.appendChild(el)
    drops.push({ el, width: el.offsetWidth + 15 })
  }
}

function subscribeToDrops() {
  const subscription = supabase
    .channel('public:user_inventory')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'user_inventory' },
      (payload) => {
        console.log('Nowy drop:', payload.new)
        addDrop(payload.new)
      }
    )
    .subscribe()

  subscription.on('subscription_error', (error) => {
    console.error('Błąd subskrypcji:', error)
  })

  subscription.on('subscription_succeeded', () => {
    console.log('Subskrypcja aktywna')
  })
}

;(async () => {
  await fetchInitialDrops()
  subscribeToDrops()
})()
