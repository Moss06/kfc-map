let stores = [];
let map;
let markers = [];
let userLocation = null;
let currentFilteredStores = [];

function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    if (show) overlay.classList.remove('hidden');
    else overlay.classList.add('hidden');
}

// Initialize map
function initMap() {
    map = L.map('map').setView([13.7460, 100.5352], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // เพิ่ม: สร้าง markers array ใหม่ทุกครั้งที่ initMap เพื่อป้องกันซ้ำ
    markers = [];

    // Add store markers
    stores.forEach(store => {
        const marker = L.marker([store.lat, store.lng], {
            icon: L.divIcon({
                className: 'store-marker',
                html: '🍗',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);

        marker.bindPopup(`
            <div class="p-2">
                <h4 class="font-bold text-red-600">${store.name}</h4>
                <p class="text-sm text-gray-600 mt-1">${store.address}</p>
                <button onclick="showStoreDetail(${store.id})" 
                        class="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                    ดูรายละเอียด
                </button>
            </div>
        `);

        markers.push({ marker, store });
    });
}

// Show/hide markers by filtered stores
function updateMarkers(filteredStores) {
    // ซ่อน marker ทั้งหมดก่อน
    markers.forEach(({ marker }) => {
        map.removeLayer(marker);
    });
    // แสดงเฉพาะ marker ที่อยู่ใน filteredStores
    filteredStores.forEach(store => {
        const found = markers.find(m => m.store.id === store.id);
        if (found) {
            found.marker.addTo(map);
        }
    });
}

// Populate store list
function populateStoreList(storesToShow = stores) {
    currentFilteredStores = storesToShow;
    const storeList = document.getElementById('storeList');
    storeList.innerHTML = '';

    if (storesToShow.length === 0) {
        storeList.innerHTML = '<div class="text-center text-gray-400 py-8">ไม่พบสาขาตามคำค้นหา</div>';
        updateMarkers([]);
        return;
    }

    updateMarkers(storesToShow);

    storesToShow.forEach(store => {
        const distance = userLocation ? 
            calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng) : null;

        const storeCard = document.createElement('div');
        storeCard.className = 'store-card bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer';
        storeCard.onclick = () => showStoreDetail(store.id);

        // เพิ่มชื่อสาขาภาษาไทยและอังกฤษ
        let displayName = store.thaiName
            ? store.thaiName + (store.name && store.name !== store.thaiName ? ` (${store.name})` : '')
            : store.name;

        storeCard.innerHTML = `
            <h4 class="font-semibold text-gray-800 mb-2">${displayName}</h4>
            <p class="text-sm text-gray-600 mb-2">${store.address}</p>
            <div class="flex justify-between items-center text-xs">
                <span class="text-green-600 font-medium">${store.hours}</span>
                ${distance ? `<span class="text-blue-600">${distance.toFixed(1)} กม.</span>` : ''}
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
                ${store.services.map(service => 
                    `<span class="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">${service}</span>`
                ).join('')}
            </div>
        `;

        storeList.appendChild(storeCard);
    });
}

// Show store detail modal
window.showStoreDetail = function(storeId) {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    if (map && map.closePopup) map.closePopup();

    const modal = document.getElementById('storeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');

    // เพิ่มชื่อสาขาภาษาไทยและอังกฤษ
    let displayName = store.thaiName
        ? store.thaiName + (store.name && store.name !== store.thaiName ? ` (${store.name})` : '')
        : store.name;
    modalTitle.textContent = displayName;

    const distance = userLocation ? 
        calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng) : null;

    modalContent.innerHTML = `
        <div class="space-y-4">
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">📍 ที่อยู่</h4>
                <p class="text-gray-600">${store.address}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">📞 เบอร์โทร</h4>
                <p class="text-gray-600">${store.phone}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">🕒 เวลาทำการ</h4>
                <p class="text-gray-600">${store.hours}</p>
            </div>
            ${distance ? `
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">📏 ระยะทาง</h4>
                <p class="text-blue-600 font-medium">${distance.toFixed(1)} กิโลเมตร</p>
            </div>
            ` : ''}
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">👨‍🍳 บริการ</h4>
                <div class="flex flex-wrap gap-2">
                    ${store.services.map(service => 
                        `<span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">${service}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;

    // เพิ่มปุ่ม Google Maps และปุ่มดูบนแผนที่
    modalActions.innerHTML = `
        <button onclick="focusOnStore(${store.id})" 
            class="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
            📍 ดูบนแผนที่
        </button>
        <a href="https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}" target="_blank"
            class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors text-center block mt-2">
            🚗 Google Maps
        </a>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Focus on store on map
window.focusOnStore = function(storeId) {
    const store = stores.find(s => s.id === storeId);
    if (store) {
        map.setView([store.lat, store.lng], 16);
        document.getElementById('storeModal').classList.add('hidden');
        document.getElementById('storeModal').classList.remove('flex');
    }
}

// Calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Find nearest stores
function findNearMe() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                L.marker([userLocation.lat, userLocation.lng], {
                    icon: L.divIcon({
                        className: 'bg-blue-500 rounded-full w-4 h-4 border-2 border-white shadow-lg',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    })
                }).addTo(map).bindPopup('📍 ตำแหน่งของคุณ');

                map.setView([userLocation.lat, userLocation.lng], 14);

                const sortedStores = stores.map(store => ({
                    ...store,
                    distance: calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng)
                })).sort((a, b) => a.distance - b.distance);

                populateStoreList(sortedStores);
                showLoading(false);
            },
            (error) => {
                alert('ไม่สามารถหาตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
                showLoading(false);
            }
        );
    } else {
        alert('เบราว์เซอร์ของคุณไม่รองรับการหาตำแหน่ง');
    }
}

// Filter by service
function getSelectedServices() {
    const checkboxes = document.querySelectorAll('.service-filter:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    if (searchInput) {
        // ลบ autocomplete และ spellcheck เพื่อไม่ให้ browser เก็บประวัติ
        searchInput.setAttribute('autocomplete', 'off');
        searchInput.setAttribute('autocorrect', 'off');
        searchInput.setAttribute('autocapitalize', 'off');
        searchInput.setAttribute('spellcheck', 'false');
        searchInput.addEventListener('input', filterAndShow);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterAndShow();
            searchInput.focus();
        });
    }

    // Filter by service
    document.getElementById('serviceFilters')?.addEventListener('change', filterAndShow);

    function filterAndShow() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedServices = getSelectedServices();
        let filtered = stores.filter(store => {
            const matchText = (
                (store.thaiName && store.thaiName.toLowerCase().includes(searchTerm)) ||
                (store.name && store.name.toLowerCase().includes(searchTerm)) ||
                store.address.toLowerCase().includes(searchTerm) ||
                store.services.some(s => s.toLowerCase().includes(searchTerm))
            );
            const matchService = selectedServices.length === 0 ||
                selectedServices.every(sv => store.services.includes(sv));
            return matchText && matchService;
        });
        populateStoreList(filtered);
    }
}

// Event listeners
document.getElementById('findNearMe').addEventListener('click', findNearMe);
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('storeModal').classList.add('hidden');
    document.getElementById('storeModal').classList.remove('flex');
});
document.getElementById('storeModal').addEventListener('click', (e) => {
    if (e.target.id === 'storeModal') {
        document.getElementById('storeModal').classList.add('hidden');
        document.getElementById('storeModal').classList.remove('flex');
    }
});

// เพิ่ม filter ด้วยบริการ
function renderServiceFilters() {
    const container = document.createElement('div');
    container.id = 'serviceFilters';
    container.className = 'flex flex-wrap gap-2 mt-2 mb-2';
    const services = ['Dine In', 'Take Away', 'Drive Thru', 'Delivery'];
    services.forEach(service => {
        const id = 'filter-' + service.replace(/\s/g, '');
        container.innerHTML += `
            <label class="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                <input type="checkbox" class="service-filter" value="${service}" id="${id}">
                ${service}
            </label>
        `;
    });
    const storeListSection = document.getElementById('storeList').parentElement;
    storeListSection.insertBefore(container, storeListSection.firstChild);
}

// Fetch store data from JSON file
async function fetchStoreData() {
  try {
    const response = await fetch('stores.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    stores = data.map((item, idx) => ({
        id: item.ID || idx + 1,
        name: item.Display_Name || item.Storename_Eng || '', // อังกฤษ
        thaiName: item.Storename_Thai || '', // เพิ่มเก็บชื่อไทย
        address: item.Address || '',
        phone: item.Cellphone || '',
        hours: item.Weekday_Mon_Fri || item.Weekend_Sat_Sun || '',
        lat: item.Latitude,
        lng: item.Longitude,
        services: [
            item.Dine_In === 'Yes' ? 'Dine In' : null,
            item.Take_Away === 'Yes' ? 'Take Away' : null,
            item.Drive_Thru === 'Yes' ? 'Drive Thru' : null,
            item.Home_Service === 'Yes' ? 'Delivery' : null
        ].filter(Boolean)
    }));
    initMap();
    renderServiceFilters();
    populateStoreList();
  } catch (error) {
    showStoreLoadError();
    console.error('Error fetching store data:', error);
  } finally {
    showLoading(false);
  }
}

function showStoreLoadError() {
  // ซ่อน loading overlay ถ้ามี
  document.getElementById('loadingOverlay').classList.add('hidden');
  // แสดงข้อความ error ใน storeList
  const storeList = document.getElementById('storeList');
  storeList.innerHTML = `
    <div class="bg-red-100 text-red-700 p-4 rounded-lg text-center">
      กดปุ่ม "หาสาขาใกล้ฉัน" เพื่อดูรายชื่อสาขาที่ใกล้ฉัน
    </div>
  `;
  document.getElementById('retryLoad').onclick = () => {
    storeList.innerHTML = '';
    fetchStoreData();
  };
}

// Load store data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    showLoading(true);
    fetchStoreData();
    setupSearch();
});
