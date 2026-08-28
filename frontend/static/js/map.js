// Leaflet GIS Mapping for EcoTwin Wildlife Habitat

document.addEventListener('DOMContentLoaded', () => {
    initHabitatMap();
});

async function initHabitatMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Ranthambore Forest Habitat Coordinates Baseline
    const centerCoords = [26.0173, 76.5026];
    const map = L.map('map').setView(centerCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Forest Reserve Boundary Polygon
    const forestBounds = [
        [26.0400, 76.4700],
        [26.0500, 76.5300],
        [25.9900, 76.5500],
        [25.9800, 76.4800]
    ];
    L.polygon(forestBounds, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 2
    }).addTo(map).bindPopup('Protected Wildlife Habitat Zone A');

    // IoT Sensor Node Markers
    const sensorNodes = [
        { name: 'ESP32 Node 01 (Core Zone)', coords: [26.0200, 76.5000], status: 'Active' },
        { name: 'ESP32 Node 02 (Waterhole East)', coords: [26.0300, 76.5200], status: 'Active' },
        { name: 'ESP32 Node 03 (Buffer North)', coords: [26.0050, 76.4850], status: 'Active' }
    ];

    sensorNodes.forEach(node => {
        L.marker(node.coords).addTo(map)
            .bindPopup(`<b>${node.name}</b><br>Telemetry: Synchronized<br>Status: ${node.status}`);
    });

    // Animal Presence Hotspot Circles
    const hotspots = [
        { coords: [26.0180, 76.5050], radius: 400, density: 'High Mammal Activity' },
        { coords: [26.0280, 76.5180], radius: 600, density: 'Tiger Sighting Hotspot' }
    ];

    hotspots.forEach(hs => {
        L.circle(hs.coords, {
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 0.25,
            radius: hs.radius
        }).addTo(map).bindPopup(`<b>Animal Hotspot Zone</b><br>${hs.density}`);
    });

    // Part D: Wildlife Camera-Trap Sighting Layer
    try {
        const trapData = await fetch('/camera-traps').then(r => r.json());
        if (trapData && trapData.sightings) {
            trapData.sightings.forEach(s => {
                L.circleMarker([s.lat, s.lng], {
                    radius: 7,
                    color: '#a855f7',
                    fillColor: '#a855f7',
                    fillOpacity: 0.8
                }).addTo(map).bindPopup(`
                    <b>📷 Camera Sighting: ${s.species.toUpperCase()}</b><br>
                    Confidence: ${s.confidence}%<br>
                    Node: ${s.camera_node} (${s.zone})<br>
                    Time: ${new Date(s.timestamp).toLocaleTimeString()}
                `);
            });
        }
    } catch (e) {
        console.warn('Map camera-trap layer warning:', e);
    }
}
