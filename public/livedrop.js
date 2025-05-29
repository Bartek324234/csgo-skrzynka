// livedrop.js
// Upewnij się, że <script type="module" src="livedrop.js"> jest używane w HTML

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Konfiguracja Supabase
const supabaseUrl = 'https://jotdnbkfgqtznjwbfjno.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const supabase = createClient(supabaseUrl, supabaseKey)

// Ustawienia i zmienne
const dropContainer = document.getElementById('live-drops')
const maxDrops = 10
const drops = []
let currentShift = 0

// 🔧 Zamienia ścieżkę z tabeli (np. images/file.jpg) na pełny publiczny URL Supabase Storage
function getImageUrl(path) {
  if (!path || typeof path !== 'string') return 'https://via.placeholder.com/40?text=?'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`
}

// Tworzy element DOM pojedynczego dropa
function createDropElement(drop) {
  const el = document.createElement('div')
  el.classList.add('drop')

  const name = drop.item_name ?? 'Nieznany przedmiot'
  const image = getImageUrl(drop.item_image)
  const value = typeof drop.value === 'number' ? drop.value.toFixed(2) : '0.00'

  el.innerHTML = `
    <img src="${image}" alt="${name}" height="40" style="margin-right: 8px;"/>
    <div>🎯 <b>${name}</b> za <b>${value} zł</b></div>
  `
  return el
}

// Przesuwa kontener w lewo
function updatePosition(shift) {
  dropContainer.style.transition = 'transform 0.5s ease'
  dropContainer.style.transform = `translateX(${shift}px)`
}

// Dodaje nowy drop do listy
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

// Pobiera początkowe dropy
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

// Subskrypcja na nowe wpisy
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

// ⬇️ Inicjalizacja — działa poprawnie tylko, jeśli plik jest załadowany jako <script type="module">
await fetchInitialDrops()
await subscribeToDrops()
