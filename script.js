// สร้างแผนที่ Leaflet
var map = L.map('map').setView([13.7563, 100.5018], 12); // พิกัดเริ่มต้น กรุงเทพ

// โหลดแผนที่จาก OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ข้อมูลพิกัดสาขา KFC ตัวอย่าง
var kfcLocations = [
  {
    name: "KFC CentralWorld",
    coords: [13.7466, 100.5390]
  },
  {
    name: "KFC Siam Paragon",
    coords: [13.7460, 100.5347]
  },
  {
    name: "KFC MBK Center",
    coords: [13.7446, 100.5296]
  }
];

// ปักหมุดลงแผนที่
kfcLocations.forEach(function(loc) {
  L.marker(loc.coords).addTo(map)
    .bindPopup(`<b>${loc.name}</b>`);
});
