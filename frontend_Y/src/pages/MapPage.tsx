import React from 'react';
import { MapPin, Navigation, Info } from 'lucide-react';
import { EcoTwinMap } from '../components/map/EcoTwinMap';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#193348] shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#20D58A]" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Geospatial Intelligence Map</h1>
            <p className="text-xs text-slate-400">
              Integrated real-time cartography: camera traps, geofence risk buffer zones, and tactical responder units
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#FF5148]" />
            <span>High Risk Zone</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#20D58A]" />
            <span>Ranger Units</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#39A9FF]" />
            <span>Village X</span>
          </span>
        </div>
      </div>

      {/* Main Full-Size Map Viewport */}
      <div className="flex-1 w-full relative rounded-xl overflow-hidden shadow-2xl border border-[#193348]">
        <EcoTwinMap height="100%" showControls={true} />
      </div>
    </div>
  );
};
