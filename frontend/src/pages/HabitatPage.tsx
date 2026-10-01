import React, { useState, useEffect } from 'react';
import {
  Trees,
  Thermometer,
  Droplets,
  CloudRain,
  Leaf,
  Activity,
  Satellite,
  Radio,
  Sun,
  Wind,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { HabitatData } from '../types';

export const HabitatPage: React.FC = () => {
  const [habitat, setHabitat] = useState<HabitatData | null>(null);
  const [activeTab, setActiveTab] = useState<'health' | 'satellite' | 'sensors' | 'weather'>('health');

  useEffect(() => {
    ecoTwinApi.getHabitatData().then(setHabitat);
  }, []);

  if (!habitat) {
    return <div className="p-8 text-center text-slate-400">Loading Habitat & Environmental Telemetry...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <Trees className="w-5 h-5 text-[#20D58A]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Habitat & Environment Telemetry</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {habitat.region} · Multi-spectral satellite indices, weather telemetry, and ecological corridors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#20D58A] bg-[#20D58A]/10 border border-[#20D58A]/30 px-3 py-1.5 rounded-lg font-bold">
            Condition: {habitat.condition}
          </span>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 p-1 bg-[#0B1B28] border border-[#193348] rounded-xl w-fit">
        {(['health', 'satellite', 'sensors', 'weather'] as const).map((tab) => {
          const labels: Record<string, string> = {
            health: 'Habitat Health',
            satellite: 'Satellite Analysis',
            sensors: 'Environmental Sensors',
            weather: 'Meteorological Data',
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#20D58A] text-[#07141F] shadow'
                  : 'text-slate-400 hover:text-white hover:bg-[#102433]'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Environmental Conditions Grid (Directly from reference design) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Temperature</span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {habitat.temperature}°C
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Seasonal Avg 27°C</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#39A9FF]/10 text-[#39A9FF] border border-[#39A9FF]/30">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Humidity</span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {habitat.humidity}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Optimal Canopy Level</span>
          </div>
        </div>

        {/* Rainfall */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#19B7C9]/10 text-[#19B7C9] border border-[#19B7C9]/30">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Rainfall (24h)</span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {habitat.rainfall} mm
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Surface Pools Replenished</span>
          </div>
        </div>

        {/* NDVI */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#20D58A]/10 text-[#20D58A] border border-[#20D58A]/30">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">NDVI Vegetation</span>
            <span className="text-xl font-bold font-mono text-[#20D58A] tabular-nums">
              {habitat.ndvi}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Dense Deciduous Forest</span>
          </div>
        </div>
      </div>

      {/* Habitat Suitability Heatmap & Map Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">
              Habitat Suitability Heatmap & Ecological Corridors
            </h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#20D58A]" /> High Suitability
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#F4B740]" /> Moderate
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#FF5148]" /> Degraded / Settlement
              </span>
            </div>
          </div>

          {/* Heatmap Matrix Canvas Grid */}
          <div className="relative rounded-xl overflow-hidden border border-[#193348] bg-[#07141F] aspect-[16/9] flex items-center justify-center p-6">
            <div className="grid grid-cols-8 grid-rows-6 gap-2 w-full h-full">
              {Array.from({ length: 48 }).map((_, i) => {
                const isRed = i === 19 || i === 20 || i === 27; // Village X settlement
                const isYellow = [11, 12, 18, 21, 26, 28, 35].includes(i);
                const isGreen = !isRed && !isYellow;
                return (
                  <div
                    key={i}
                    className={`rounded transition-all duration-300 hover:scale-110 flex items-center justify-center text-[9px] font-mono cursor-pointer border ${
                      isRed
                        ? 'bg-[#FF5148]/30 border-[#FF5148]/60 text-[#FF5148]'
                        : isYellow
                        ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                        : 'bg-[#20D58A]/15 border-[#20D58A]/35 text-[#20D58A]'
                    }`}
                    title={`Sector ${i + 1}: ${isRed ? 'Settlement Risk' : isYellow ? 'Buffer' : 'Core Habitat'}`}
                  >
                    {isRed ? 'V-X' : isYellow ? 'BUF' : 'H'}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Sentinel-2 L2A Imagery · Multi-Spectral Resolution 10m</span>
            <span className="text-[#20D58A] font-semibold">Corridor Integrity: {habitat.corridorIntegrity}</span>
          </div>
        </div>

        {/* Right: Environmental Sensor Grid */}
        <div className="lg:col-span-4 bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                Ground Acoustic & IoT Sensor Nodes
              </h3>
              <span className="text-[10px] text-[#20D58A] font-mono">18 Nodes Online</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Node S-01 (Ridge Pass)', temp: '25.8°C', hum: '67%', batt: '98%', status: 'Nominal' },
                { name: 'Node S-02 (Waterhole 3)', temp: '26.2°C', hum: '74%', batt: '92%', status: 'Nominal' },
                { name: 'Node S-03 (Village X Fence)', temp: '27.1°C', hum: '61%', batt: '88%', status: 'Alert' },
                { name: 'Node S-04 (River Crossing)', temp: '24.9°C', hum: '82%', batt: '95%', status: 'Nominal' },
              ].map((node, i) => (
                <div key={i} className="p-3 bg-[#07141F] rounded-lg border border-[#193348] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{node.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        node.status === 'Alert'
                          ? 'bg-[#FF5148]/20 text-[#FF5148]'
                          : 'bg-[#20D58A]/20 text-[#20D58A]'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span>{node.temp} · {node.hum}</span>
                    <span className="text-slate-300">Battery: {node.batt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#193348] text-xs text-slate-400">
            LoRaWAN Long-Range Mesh: Active 868 MHz
          </div>
        </div>
      </div>
    </div>
  );
};
