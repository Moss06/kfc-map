// Sample KFC store data (ข้อมูลตัวอย่าง)
const stores = [
    {
        id: 1,
        name: "KFC สยามพารากอน",
        address: "ชั้น B1 สยามพารากอน 991 ถ.พระราม 1 ปทุมวัน กรุงเทพฯ 10330",
        phone: "02-129-4545",
        hours: "10:00 - 22:00",
        lat: 13.7460,
        lng: 100.5352,
        services: ["Drive Thru", "Delivery", "Dine In"]
    },
    {
        id: 2,
        name: "KFC เซ็นทรัลเวิลด์",
        address: "ชั้น 7 เซ็นทรัลเวิลด์ 4,4/1-4/2,4/4 ถ.ราชดำริ ปทุมวัน กรุงเทพฯ 10330",
        phone: "02-255-9500",
        hours: "10:00 - 22:00",
        lat: 13.7472,
        lng: 100.5398,
        services: ["Delivery", "Dine In"]
    },
    {
        id: 3,
        name: "KFC MBK เซ็นเตอร์",
        address: "ชั้น 6 MBK เซ็นเตอร์ 444 ถ.พญาไท ปทุมวัน กรุงเทพฯ 10330",
        phone: "02-217-9000",
        hours: "10:00 - 22:00",
        lat: 13.7441,
        lng: 100.5300,
        services: ["Delivery", "Dine In"]
    },
    {
        id: 4,
        name: "KFC สีลม คอมเพล็กซ์",
        address: "191 ถ.สีลม บางรัก กรุงเทพฯ 10500",
        phone: "02-231-2345",
        hours: "07:00 - 23:00",
        lat: 13.7307,
        lng: 100.5418,
        services: ["Drive Thru", "Delivery", "Dine In"]
    },
    {
        id: 5,
        name: "KFC เทอร์มินอล 21",
        address: "ชั้น 5 เทอร์มินอล 21 88 ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110",
        phone: "02-108-0888",
        hours: "10:00 - 22:00",
        lat: 13.7375,
        lng: 100.5607,
        services: ["Delivery", "Dine In"]
    }
];

let map;
let markers = [];
let userLocation = null;

// Initialize map
function initMap() {
    map = L.map('map').setView([13.7460, 100.5352], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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

// Populate store list
function populateStoreList(storesToShow = stores) {
    const storeList = document.getElementById('storeList');
    storeList.innerHTML = '';

    storesToShow.forEach(store => {
        const distance = userLocation ? 
            calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng) : null;

        const storeCard = document.createElement('div');
        storeCard.className = 'store-card bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer';
        storeCard.onclick = () => showStoreDetail(store.id);

        storeCard.innerHTML = `
            <h4 class="font-semibold text-gray-800 mb-2">${store.name}</h4>
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

    const modal = document.getElementById('storeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modalTitle.textContent = store.name;
    
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
                <h4 class="font-semibold text-gray-700 mb-2">🛎️ บริการ</h4>
                <div class="flex flex-wrap gap-2">
                    ${store.services.map(service => 
                        `<span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">${service}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="pt-4 border-t">
                <button onclick="focusOnStore(${store.id})" 
                        class="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                    📍 ดูบนแผนที่
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Focus on store on map
window.focusOnStore = function(storeId) {
    const store = stores.find(s => s.id === storeId);
    if (store) {
        map.setView([store.lat, store.lng], 16);
        // Close modal
        document.getElementById('storeModal').classList.add('hidden');
        document.getElementById('storeModal').classList.remove('flex');
    }
}

// Calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
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
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Add user location marker
                L.marker([userLocation.lat, userLocation.lng], {
                    icon: L.divIcon({
                        className: 'bg-blue-500 rounded-full w-4 h-4 border-2 border-white shadow-lg',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    })
                }).addTo(map).bindPopup('📍 ตำแหน่งของคุณ');

                // Center map on user location
                map.setView([userLocation.lat, userLocation.lng], 14);

                // Sort stores by distance and update list
                const sortedStores = stores.map(store => ({
                    ...store,
                    distance: calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng)
                })).sort((a, b) => a.distance - b.distance);

                populateStoreList(sortedStores);
            },
            (error) => {
                alert('ไม่สามารถหาตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
            }
        );
    } else {
        alert('เบราว์เซอร์ของคุณไม่รองรับการหาตำแหน่ง');
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredStores = stores.filter(store => 
            store.name.toLowerCase().includes(searchTerm) ||
            store.address.toLowerCase().includes(searchTerm)
        );
        populateStoreList(filteredStores);
    });
}

// Event listeners
document.getElementById('findNearMe').addEventListener('click', findNearMe);
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('storeModal').classList.add('hidden');
    document.getElementById('storeModal').classList.remove('flex');
});

// Close modal when clicking outside
document.getElementById('storeModal').addEventListener('click', (e) => {
    if (e.target.id === 'storeModal') {
        document.getElementById('storeModal').classList.add('hidden');
        document.getElementById('storeModal').classList.remove('flex');
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    populateStoreList();
    setupSearch();
});
