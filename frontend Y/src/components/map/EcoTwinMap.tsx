import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  Radio,
  Eye,
  Camera,
  Shield,
  Home,
} from 'lucide-react';
import { mockAnimals, mockThreats, mockResponderTeams, mockCameras } from '../../data/mockData';

interface EcoTwinMapProps {
  height?: string;
  selectedTrackId?: string;
  onSelectAnimal?: (trackId: string) => void;
  showControls?: boolean;
}

export const EcoTwinMap: React.FC<EcoTwinMapProps> = ({
  height = '500px',
  selectedTrackId,
  onSelectAnimal,
  showControls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});

  const [layersOpen, setLayersOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    animalTracks: true,
    riskZones: true,
    humanSettlements: true,
    responderTeams: true,
    habitatAreas: true,
    cameraLocations: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeAnimalInfo, setActiveAnimalInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Village X & Wildlife Sanctuary buffer: [26.02, 76.51]
    const map = L.map(mapContainerRef.current, {
      center: [26.0195, 76.505],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // High quality dark basemap (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Initialize Layer Groups
    const lgTracks = L.layerGroup().addTo(map);
    const lgRisk = L.layerGroup().addTo(map);
    const lgSettlements = L.layerGroup().addTo(map);
    const lgTeams = L.layerGroup().addTo(map);
    const lgHabitat = L.layerGroup().addTo(map);
    const lgCameras = L.layerGroup().addTo(map);

    layerGroupsRef.current = {
      animalTracks: lgTracks,
      riskZones: lgRisk,
      humanSettlements: lgSettlements,
      responderTeams: lgTeams,
      habitatAreas: lgHabitat,
      cameraLocations: lgCameras,
    };

    // 1. Habitat Sanctuary Boundary & Corridor
    const sanctuaryPolygon = L.polygon(
      [
        [26.045, 76.47],
        [26.05, 76.53],
        [26.02, 76.55],
        [25.99, 76.52],
        [25.99, 76.46],
      ],
      {
        color: '#20D58A',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#20D58A',
        fillOpacity: 0.05,
      }
    ).addTo(lgHabitat);

    sanctuaryPolygon.bindTooltip('Core Forest Reserve - Zone B', {
      permanent: false,
      direction: 'top',
      className: 'bg-[#0B1B28] text-[#20D58A] border border-[#20D58A]/30 text-xs px-2 py-1',
    });

    // 2. Human Settlements: Village X
    const villageCoords: [number, number] = [26.021, 76.514];
    const settlementCircle = L.circle(villageCoords, {
      radius: 650,
      color: '#39A9FF',
      weight: 1.5,
      fillColor: '#39A9FF',
      fillOpacity: 0.12,
    }).addTo(lgSettlements);

    settlementCircle.bindTooltip('Village X Settlement (Pop: 1,420)', {
      permanent: true,
      direction: 'center',
      className: 'bg-[#0B1B28]/90 text-white border border-[#39A9FF]/40 text-xs font-semibold px-2 py-1 rounded shadow-lg',
    });

    // 3. Red Risk Zone around Village X
    const riskZoneCircle = L.circle(villageCoords, {
      radius: 1400,
      color: '#FF5148',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#FF5148',
      fillOpacity: 0.15,
    }).addTo(lgRisk);

    riskZoneCircle.bindTooltip('Village X High Risk Zone (Entry Risk 82%)', {
      permanent: false,
      direction: 'top',
      className: 'bg-[#0B1B28] text-[#FF5148] border border-[#FF5148]/40 text-xs font-semibold px-2 py-1',
    });

    // 4. Animal Markers and Predicted Trajectory
    // TRACK-001 Leopard
    const leopardIcon = L.divIcon({
      className: 'custom-animal-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #FF5148; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(255,81,72,0.8); cursor: pointer;">
            <span style="font-size: 14px;">🐆</span>
          </div>
          <div style="background: #0B1B28; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; border: 1px solid #FF5148; margin-top: 2px; white-space: nowrap;">
            TRACK-001 · 4.2 km/h
          </div>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 25],
    });

    const leopardMarker = L.marker([26.0195, 76.505], { icon: leopardIcon }).addTo(lgTracks);
    leopardMarker.bindPopup(`
      <div style="padding: 4px;">
        <div style="color: #FF5148; font-weight: 700; font-size: 12px; margin-bottom: 2px;">TRACK-001 · Leopard (CRITICAL)</div>
        <div style="color: #E2E8F0; font-size: 11px;">Speed: <b>4.2 km/h</b> · Heading: <b>Northeast</b></div>
        <div style="color: #F4B740; font-size: 11px; margin-top: 2px;">ETA to Village X: <b>32 min</b> (Risk: 78.8/100)</div>
        <div style="color: #94A3B8; font-size: 10px; margin-top: 4px;">Last detection at CAM-07 (96.2% Confidence)</div>
      </div>
    `);

    leopardMarker.on('click', () => {
      setActiveAnimalInfo('TRACK-001');
      if (onSelectAnimal) onSelectAnimal('TRACK-001');
    });

    // Trajectory dashed line for TRACK-001 towards Village X
    const trajectoryPath = L.polyline(
      [
        [26.016, 76.501],
        [26.0175, 76.5025],
        [26.0195, 76.505],
        [26.0205, 76.5085],
        [26.021, 76.514],
      ],
      {
        color: '#FF5148',
        weight: 2.5,
        dashArray: '5, 5',
      }
    ).addTo(lgTracks);

    // TRACK-002 Elephant
    const elephantIcon = L.divIcon({
      className: 'custom-animal-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 30px; height: 30px; border-radius: 50%; background: #F4B740; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(244,183,64,0.6); cursor: pointer;">
            <span style="font-size: 13px;">🐘</span>
          </div>
          <div style="background: #0B1B28; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 4px; border: 1px solid #F4B740; margin-top: 2px; white-space: nowrap;">
            TRACK-002 · 3.1 km/h
          </div>
        </div>
      `,
      iconSize: [36, 46],
      iconAnchor: [18, 23],
    });

    const elephantMarker = L.marker([26.026, 76.523], { icon: elephantIcon }).addTo(lgTracks);
    elephantMarker.bindPopup(`
      <div style="padding: 4px;">
        <div style="color: #F4B740; font-weight: 700; font-size: 12px; margin-bottom: 2px;">TRACK-002 · Elephant (WARNING)</div>
        <div style="color: #E2E8F0; font-size: 11px;">Approaching Highway 12 Corridor</div>
        <div style="color: #39A9FF; font-size: 11px; margin-top: 2px;">Speed: <b>3.1 km/h</b> · ETA: <b>1 hr 10 min</b></div>
      </div>
    `);

    // 5. Responder Teams
    mockResponderTeams.slice(0, 3).forEach((team) => {
      const isTactical = team.status === 'On Mission';
      const teamIcon = L.divIcon({
        className: 'custom-team-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 26px; height: 26px; border-radius: 6px; background: ${
              isTactical ? '#F4B740' : '#20D58A'
            }; border: 1.5px solid #07141F; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(32,213,138,0.5); cursor: pointer;">
              <span style="font-size: 11px; font-weight: 800; color: #07141F;">R</span>
            </div>
            <div style="background: #0B1B28; color: #E2E8F0; font-size: 9px; padding: 1px 4px; border-radius: 3px; border: 1px solid #193348; margin-top: 2px; white-space: nowrap;">
              ${team.name}
            </div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 21],
      });

      const tm = L.marker(team.coordinates, { icon: teamIcon }).addTo(lgTeams);
      tm.bindPopup(`
        <div style="padding: 4px;">
          <div style="color: #20D58A; font-weight: 700; font-size: 12px;">${team.name}</div>
          <div style="color: #CBD5E1; font-size: 11px; margin-top: 2px;">Status: <b>${team.status}</b></div>
          <div style="color: #94A3B8; font-size: 10px;">Leader: ${team.leader} (${team.contactChannel})</div>
          <div style="color: #19B7C9; font-size: 10px; margin-top: 2px;">Distance: ${team.distance} · ${team.eta}</div>
        </div>
      `);
    });

    // 6. Camera Traps
    mockCameras.forEach((cam) => {
      const isLiveCam7 = cam.id === 'CAM-07';
      const camIcon = L.divIcon({
        className: 'custom-cam-marker',
        html: `
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #07141F; border: 2px solid ${
            isLiveCam7 ? '#20D58A' : '#19B7C9'
          }; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px ${
          isLiveCam7 ? 'rgba(32,213,138,0.7)' : 'rgba(25,183,201,0.5)'
        }; cursor: pointer;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: ${
              isLiveCam7 ? '#20D58A' : '#19B7C9'
            };"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const cm = L.marker(cam.coordinates, { icon: camIcon }).addTo(lgCameras);
      cm.bindPopup(`
        <div style="padding: 4px;">
          <div style="color: #19B7C9; font-weight: 700; font-size: 12px;">${cam.name} · ${cam.zone}</div>
          <div style="color: #CBD5E1; font-size: 11px; margin-top: 2px;">Status: <span style="color:#20D58A;">${cam.status}</span></div>
          <div style="color: #94A3B8; font-size: 10px;">Animals detected: <b>${cam.animalsDetected}</b></div>
          <div style="color: #F4B740; font-size: 10px;">Confidence: <b>${cam.lastConfidence}%</b></div>
        </div>
      `);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layer visibility dynamically
  useEffect(() => {
    const lgs = layerGroupsRef.current;
    const map = mapInstanceRef.current;
    if (!map || !lgs.animalTracks) return;

    Object.entries(activeLayers).forEach(([layerKey, isVisible]) => {
      const lg = lgs[layerKey];
      if (lg) {
        if (isVisible && !map.hasLayer(lg)) {
          lg.addTo(map);
        } else if (!isVisible && map.hasLayer(lg)) {
          lg.remove();
        }
      }
    });
  }, [activeLayers]);

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapInstanceRef.current || !searchQuery) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('village') || q.includes('x')) {
      mapInstanceRef.current.flyTo([26.021, 76.514], 14);
    } else if (q.includes('cam-07') || q.includes('leopard') || q.includes('track-001')) {
      mapInstanceRef.current.flyTo([26.0195, 76.505], 15);
    } else if (q.includes('elephant') || q.includes('highway') || q.includes('track-002')) {
      mapInstanceRef.current.flyTo([26.026, 76.523], 15);
    } else {
      mapInstanceRef.current.flyTo([26.0195, 76.505], 13);
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-[#193348] bg-[#07141F] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls Bar */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          {/* Search bar inside map */}
          <form
            onSubmit={handleSearch}
            className="pointer-events-auto flex items-center bg-[#0B1B28]/90 border border-[#193348] rounded-lg px-3 py-1.5 shadow-lg backdrop-blur-xs w-72"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, animal, coordinate..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </form>

          {/* Map Top-Right Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0B1B28]/90 border border-[#193348] rounded-lg text-xs text-[#20D58A] shadow-lg backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#20D58A] animate-ping" />
              <span className="font-semibold">Live GPS / Telemetry</span>
            </div>

            {/* Layer Control Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setLayersOpen(!layersOpen)}
                className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors shadow-lg backdrop-blur-xs ${
                  layersOpen
                    ? 'bg-[#20D58A] text-[#07141F] border-[#20D58A] font-semibold'
                    : 'bg-[#0B1B28]/90 text-slate-200 border-[#193348] hover:text-white'
                }`}
                title="Toggle Layers"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Layers</span>
              </button>

              {/* Layer Selection Menu */}
              {layersOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0B1B28] border border-[#193348] rounded-xl shadow-2xl p-3 z-30 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Map Layers
                  </div>
                  <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white py-1">
                    <span className="flex items-center gap-2">
                      <span className="text-base">🐆</span> Animal Tracks
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.animalTracks}
                      onChange={() => toggleLayer('animalTracks')}
                      className="accent-[#20D58A]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white py-1">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF5148]" /> Risk Zones
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.riskZones}
                      onChange={() => toggleLayer('riskZones')}
                      className="accent-[#FF5148]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white py-1">
                    <span className="flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-[#39A9FF]" /> Settlements
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.humanSettlements}
                      onChange={() => toggleLayer('humanSettlements')}
                      className="accent-[#39A9FF]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white py-1">
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-[#20D58A]" /> Responder Teams
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.responderTeams}
                      onChange={() => toggleLayer('responderTeams')}
                      className="accent-[#20D58A]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white py-1">
                    <span className="flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-[#19B7C9]" /> Camera Traps
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.cameraLocations}
                      onChange={() => toggleLayer('cameraLocations')}
                      className="accent-[#19B7C9]"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-[#0B1B28]/90 border border-[#193348] text-slate-300 hover:text-white transition-colors shadow-lg backdrop-blur-xs"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Floating Tactical Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#0B1B28]/90 border border-[#193348] rounded-lg p-2.5 shadow-lg backdrop-blur-xs text-[11px] text-slate-300 space-y-1.5 hidden md:block">
        <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
          Tactical Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5148]" />
          <span>High Risk Animal Fix</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-[#FF5148]" />
          <span>Predicted Trajectory Path</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#20D58A]" />
          <span>Available Ranger Unit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39A9FF]" />
          <span>Village X Settlement</span>
        </div>
      </div>

      {/* Scale & Coordinate Indicator (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 bg-[#0B1B28]/90 border border-[#193348] rounded-lg px-2.5 py-1 text-[11px] font-mono tabular-nums text-slate-400 shadow-lg backdrop-blur-xs flex items-center gap-3">
        <span>26°01'10" N · 76°30'18" E</span>
        <span className="text-slate-600">|</span>
        <span className="text-[#20D58A]">Zone B Active</span>
      </div>
    </div>
  );
};
