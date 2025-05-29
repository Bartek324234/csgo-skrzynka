import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGRuYmtmZ3F0em5qd2Jmam5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTMwODAsImV4cCI6MjA2MzA4OTA4MH0.mQrwJS9exVIMoSl_XwRT2WhE8DMTbdUM996kJIVA4kM'

const supabase = createClient(supabaseUrl, supabaseKey)

const dropContainer = document.getElementById('live-drops')
const maxDrops = 10
const drops = []
let currentShift = 0

// ✅ Pobieranie lokalnej ścieżki do obrazka
function getImageUrl(path) {
  if (!path || typeof path !== 'string') {
    console.warn('⚠️ Brak ścieżki do obrazka:', path)
    return 'https://via.placeholder.com/40?text=?'
  }

  // Zakładamy, że path wygląda tak: "/images/deserteagleblue.jpg"
  return path
}

function createDropElement(drop) {
  const el = document.createElement('div')
  el.classList.add('drop')

  const name = drop.item_name ?? 'Nieznany przedmiot'
  const image = getImageUrl(drop.item_image)
  const value = typeof drop.value === 'number' ? drop.value.toFixed(2) : '0.00'

  el.innerHTML = `
    <img src="${image}" alt="${name}" width="40" height="40" />
    <div>🎯 <b>${name}</b> za <b>${value} zł</b></div>
  `
  return el
}

function updatePosition(shift) {
  dropContainer.style.transition = 'transform 0.5s ease'
  dropContainer.style.transform = `translateX(${shift}px)`
}

function addDrop(drop) {
  const el = createDropElement(drop)

  dropContainer.insertBefore(el, dropContainer.firstChild)

  requestAnimationFrame(() => {
    const elWidth = el.offsetWidth + 15

    drops.unshift({ el, width: elWidth })

    currentShift -= elWidth
    updatePosition(currentShift)

    if (drops.length > maxDrops) {
      const removed = drops.pop()
      dropContainer.removeChild(removed.el)

      currentShift += removed.width

      dropContainer.style.transition = 'none'
      dropContainer.style.transform = `translateX(${currentShift}px)`

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

  for (const drop of data.reverse()) {
    const el = createDropElement(drop)
    dropContainer.appendChild(el)
    drops.push({ el, width: el.offsetWidth + 15 })
  }
}

async function subscribeToDrops() {
  const channel = supabase.channel('drops')

  channel
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'user_inventory' },
      (payload) => {
        console.log('Nowy drop:', payload.new)
        addDrop(payload.new)
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subskrypcja aktywna')
      } else {
        console.error('❌ Błąd subskrypcji:', status)
      }
    })
}

// 🚀 Start
;(async () => {
  await fetchInitialDrops()
  await subscribeToDrops()
})()
