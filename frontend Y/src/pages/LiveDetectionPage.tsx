import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Pause,
  Maximize2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Camera as CameraIcon,
  Shield,
  Activity,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { Camera, Detection } from '../types';
import { mockCameras, mockDetections } from '../data/mockData';
import leopardImg from '../assets/images/wildlife_leopard_cam_1790851270060.jpg';
import boarImg from '../assets/images/wildlife_boar_track_1790851295174.jpg';
import deerImg from '../assets/images/wildlife_deer_track_1790851307833.jpg';
import elephantImg from '../assets/images/wildlife_elephant_monitoring_1790851283765.jpg';

export const LiveDetectionPage: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-07');
  const [detections, setDetections] = useState<Detection[]>(mockDetections);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    ecoTwinApi.getCameras().then(setCameras);
    ecoTwinApi.getDetections().then(setDetections);
  }, []);

  const activeCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0] || mockCameras[0];

  const handleTriggerRescan = () => {
    setIsScanning(true);
    setScanMessage('Running YOLOv8 inference pass on camera buffer...');
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('Inference complete: 1 Leopard detected (Confidence: 96.2%)');
      setTimeout(() => setScanMessage(null), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#20D58A]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Live Computer Vision Detection Feed</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-camera optical & infrared stream processing with automated YOLOv8 wildlife inference
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showBoundingBoxes
                ? 'bg-[#20D58A]/10 text-[#20D58A] border-[#20D58A]/40'
                : 'bg-[#0B1B28] text-slate-400 border-[#193348]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CV Bounding Boxes</span>
          </button>
          <button
            onClick={handleTriggerRescan}
            disabled={isScanning}
            className="px-3 py-1.5 bg-[#102433] hover:bg-[#193348] text-[#19B7C9] border border-[#19B7C9]/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Re-Scan Buffer</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 bg-[#20D58A]/10 border border-[#20D58A]/30 rounded-xl text-xs text-[#20D58A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Main View: Large Live Camera Feed + Detections Now Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large Video Panel (9 cols on lg) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-[#0B1B28] border border-[#193348] rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
          {/* Feed Title bar */}
          <div className="px-4 py-3 bg-[#102433]/70 border-b border-[#193348] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5148] animate-ping" />
              <div>
                <span className="font-bold text-white text-sm">
                  {activeCamera ? `${activeCamera.id} · ${activeCamera.zone}` : 'CAM-07 · Forest Zone B'}
                </span>
                <span className="text-[11px] text-slate-400 ml-2 font-mono">1080p @ 28 FPS</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#20D58A] bg-[#20D58A]/10 border border-[#20D58A]/30 px-2 py-0.5 rounded font-bold">
                {isPaused ? 'FEED PAUSED' : 'LIVE'}
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                Jan 14, 2025 14:32:08
              </span>
            </div>
          </div>

          {/* Video Stream Frame with Computer Vision Bounding Boxes */}
          <div className="relative bg-black flex items-center justify-center aspect-[16/9] w-full overflow-hidden select-none group">
            <img
              src={
                selectedCameraId === 'CAM-01'
                  ? deerImg
                  : selectedCameraId === 'CAM-02'
                  ? boarImg
                  : selectedCameraId === 'CAM-03'
                  ? elephantImg
                  : leopardImg
              }
              alt="Active Camera Trap Video"
              className="w-full h-full object-cover"
            />

            {/* Simulated Live Scan line if scanning */}
            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#20D58A]/20 to-transparent h-16 w-full animate-bounce pointer-events-none" />
            )}

            {/* Bounding box overlay for selected camera */}
            {showBoundingBoxes && selectedCameraId === 'CAM-07' && (
              <div
                className="absolute border-2 border-[#20D58A] bg-[#20D58A]/10 shadow-[0_0_20px_rgba(32,213,138,0.4)] pointer-events-none transition-all duration-300"
                style={{ top: '24%', left: '32%', width: '38%', height: '52%' }}
              >
                {/* Species badge */}
                <div className="absolute -top-7 left-0 bg-[#20D58A] text-[#07141F] font-bold text-xs px-2 py-0.5 rounded flex items-center gap-1.5 shadow-md">
                  <span>Leopard</span>
                  <span className="font-mono text-[11px] font-black">96.2%</span>
                </div>
                {/* Corner reticles */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
              </div>
            )}

            {/* Bounding box for Wild Boar (CAM-02) */}
            {showBoundingBoxes && selectedCameraId === 'CAM-02' && (
              <div
                className="absolute border-2 border-[#F4B740] bg-[#F4B740]/10 pointer-events-none"
                style={{ top: '30%', left: '25%', width: '45%', height: '48%' }}
              >
                <div className="absolute -top-6 left-0 bg-[#F4B740] text-[#07141F] font-bold text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <span>Wild Boar</span>
                  <span className="font-mono text-[11px]">88.5%</span>
                </div>
              </div>
            )}

            {/* Camera OSD HUD elements */}
            <div className="absolute bottom-3 left-3 text-xs font-mono text-white/90 bg-[#07141F]/80 border border-[#193348] px-2.5 py-1 rounded backdrop-blur-xs flex items-center gap-3">
              <span>LAT: 26.0175° N</span>
              <span>LON: 76.5025° E</span>
              <span className="text-[#20D58A]">IR NIGHT-VISION ACTIVE</span>
            </div>

            <div className="absolute top-3 right-3 text-xs font-mono text-white/90 bg-[#07141F]/80 border border-[#193348] px-2.5 py-1 rounded backdrop-blur-xs flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#20D58A]" />
              <span>YOLOv8x · 28.4 FPS</span>
            </div>
          </div>

          {/* Camera Controls & Telemetry Footer */}
          <div className="p-4 bg-[#0B1B28] border-t border-[#193348] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Camera ID</span>
                <span className="text-white font-mono font-bold">{activeCamera?.id || 'CAM-07'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                <span className="text-slate-200">{activeCamera?.zone || 'Forest Zone B'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Animals Detected</span>
                <span className="text-[#20D58A] font-bold font-mono">
                  {activeCamera?.animalsDetected || 1} ({activeCamera?.activeSpecies || 'Leopard'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vector Direction</span>
                <span className="text-[#19B7C9] font-medium">{activeCamera?.direction || 'Moving NE'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1.5 bg-[#102433] hover:bg-[#193348] text-white rounded-lg text-xs font-medium border border-[#193348] transition-colors flex items-center gap-1.5"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume Feed' : 'Pause Feed'}</span>
              </button>
              <button
                onClick={() => alert('Fullscreen optical view toggled')}
                className="p-1.5 bg-[#102433] hover:bg-[#193348] text-slate-300 hover:text-white rounded-lg border border-[#193348] transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Detections (Now) List (3 cols on lg) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#20D58A] animate-pulse" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                  Detections (Now)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
            </div>

            <div className="space-y-2.5">
              {detections.map((det) => (
                <div
                  key={det.id}
                  onClick={() => setSelectedCameraId(det.cameraId)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedCameraId === det.cameraId
                      ? 'border-[#20D58A] bg-[#20D58A]/10'
                      : 'border-[#193348] bg-[#07141F] hover:border-slate-600'
                  }`}
                >
                  <img
                    src={det.image}
                    alt={det.species}
                    className="w-12 h-12 rounded object-cover border border-[#193348] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate">{det.species}</span>
                      <span className="text-[#20D58A] font-bold font-mono text-xs tabular-nums">
                        {det.confidence}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between font-mono">
                      <span>{det.timestamp}</span>
                      <span className="text-[#19B7C9]">{det.cameraId}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                      Track: {det.trackId} · {det.movementDirection}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#193348] bg-[#07141F] p-3 rounded-lg text-xs space-y-1">
            <div className="text-slate-400 font-medium">Model Information:</div>
            <div className="text-slate-200">YOLOv8x Wildlife Fine-Tuned v2.4</div>
            <div className="text-[#20D58A] font-mono text-[11px]">Precision: 90.1% · Recall: 88.7%</div>
          </div>
        </div>
      </div>

      {/* Bottom Camera Selector Thumbnails Strip */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CameraIcon className="w-4 h-4 text-[#19B7C9]" />
            <span>Camera Trap Network Selector</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">6 Cameras Online</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {cameras.map((cam) => {
            const isSelected = cam.id === selectedCameraId;
            return (
              <div
                key={cam.id}
                onClick={() => setSelectedCameraId(cam.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#20D58A] bg-[#20D58A]/10 shadow-[0_0_10px_rgba(32,213,138,0.2)]'
                    : 'border-[#193348] bg-[#07141F] hover:border-slate-600'
                }`}
              >
                <div className="relative aspect-video rounded overflow-hidden mb-1.5">
                  <img
                    src={cam.thumbnail}
                    alt={cam.name}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-1 left-1 text-[9px] font-bold px-1 rounded ${
                      cam.status === 'Live' ? 'bg-[#FF5148] text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {cam.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white">{cam.id}</span>
                  <span className="text-[#20D58A] font-mono">{cam.lastConfidence}%</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{cam.zone}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
