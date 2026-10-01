import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  Flame,
  Crosshair,
  AlertTriangle,
  Play,
  RotateCw,
  Compass,
  CheckCircle2,
  Info,
  Calendar,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { Prediction } from '../types';
import { EcoTwinMap } from '../components/map/EcoTwinMap';

export const PredictiveIntelligencePage: React.FC = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [activeTab, setActiveTab] = useState<'forecast' | 'heatmap' | 'conflict' | 'trends'>('forecast');
  const [isRunning, setIsRunning] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    ecoTwinApi.getPredictions().then(setPrediction);
  }, []);

  const handleRunNewPrediction = async () => {
    if (!prediction) return;
    setIsRunning(true);
    setToastMsg('Synthesizing Markov spatial vectors & LSTM conflict probabilities...');
    try {
      const updated = await ecoTwinApi.runNewPrediction(prediction.trackId);
      setPrediction(updated);
      setToastMsg('LSTM Model update complete: New confidence parameters estimated.');
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsRunning(false);
    }
  };

  if (!prediction) {
    return <div className="p-8 text-center text-slate-400">Loading AI Predictive Intelligence...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#20D58A]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Predictive AI Intelligence</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recurrent spatial models predicting human-settlement boundary entry, trajectory pathways, and conflict mitigation windows
          </p>
        </div>

        <div>
          <button
            onClick={handleRunNewPrediction}
            disabled={isRunning}
            className="px-4 py-2 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Inferring...' : 'Run New Prediction'}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-[#20D58A]/10 border border-[#20D58A]/30 rounded-xl text-xs text-[#20D58A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Metric Clarification Banner (Ensuring Section 25 & 13 requirements) */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Detection Confidence */}
        <div className="p-3 bg-[#07141F] rounded-lg border border-[#193348]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Detection Confidence</span>
            <Crosshair className="w-4 h-4 text-[#20D58A]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">96.2%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            YOLOv8 Computer Vision confidence that subject is a Leopard
          </p>
        </div>

        {/* Metric 2: Prediction Confidence */}
        <div className="p-3 bg-[#07141F] rounded-lg border border-[#193348]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Prediction Confidence</span>
            <BrainCircuit className="w-4 h-4 text-[#19B7C9]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#19B7C9] tabular-nums">
              {prediction.predictionConfidence}%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            LSTM trajectory forecast certainty based on historical terrain paths
          </p>
        </div>

        {/* Metric 3: Entry Probability */}
        <div className="p-3 bg-[#07141F] rounded-lg border border-[#193348]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Entry Probability</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {prediction.entryProbability}%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Likelihood animal will breach the Village X settlement boundary
          </p>
        </div>

        {/* Metric 4: Risk Score */}
        <div className="p-3 bg-[#07141F] rounded-lg border border-[#FF5148]/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Calculated Risk Score</span>
            <Flame className="w-4 h-4 text-[#FF5148]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#FF5148] tabular-nums">
              {prediction.riskScore}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Weighted composite: proximity + velocity + settlement density
          </p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1 p-1 bg-[#0B1B28] border border-[#193348] rounded-xl w-fit">
        {(['forecast', 'heatmap', 'conflict', 'trends'] as const).map((tab) => {
          const labels: Record<string, string> = {
            forecast: 'Movement Forecast',
            heatmap: 'Risk Heatmap',
            conflict: 'Conflict Prediction',
            trends: 'Historical Trends',
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

      {/* Main Content Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Map / Spatial Projection (8 cols on lg) */}
        <div className="lg:col-span-8 bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#20D58A]" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                Predicted Movement Path: {prediction.trackId} ({prediction.species})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ETA to Zone: <b className="text-white">{prediction.etaToZone}</b>
            </span>
          </div>

          <div className="min-h-[380px] rounded-lg overflow-hidden border border-[#193348]">
            <EcoTwinMap height="380px" showControls={true} />
          </div>

          {/* Stepper Waypoint Path */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {prediction.movementPath.map((pt) => (
              <div
                key={pt.step}
                className="bg-[#07141F] p-2 rounded-lg border border-[#193348] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Step {pt.step}</span>
                  <span className="text-[#20D58A]">{pt.time}</span>
                </div>
                <div className="text-white font-medium text-[11px] truncate mt-1">{pt.name}</div>
                <div className="text-[10px] text-amber-400 mt-1">Risk: {pt.risk}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Prediction Breakdown & Summary (4 cols on lg) */}
        <div className="lg:col-span-4 bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
              <span className="font-mono text-xs font-bold text-[#19B7C9]">
                {prediction.trackId}
              </span>
              <span className="text-xs font-bold text-white">{prediction.species}</span>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-[#07141F] p-3 rounded-lg border border-[#193348] text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Current Location Fix
                  </span>
                  <span className="text-white font-medium">{prediction.currentLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Predicted Destination
                  </span>
                  <span className="text-[#FF5148] font-medium">
                    {prediction.predictedDestination}
                  </span>
                </div>
              </div>

              {/* ETA Highlight Box */}
              <div className="p-4 bg-gradient-to-br from-[#102433] to-[#07141F] rounded-xl border border-[#193348] text-center">
                <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                  ETA to Zone
                </span>
                <span className="text-3xl font-black font-mono text-white tabular-nums mt-1 block">
                  {prediction.etaToZone}
                </span>
                <span className="text-xs text-[#20D58A] font-semibold mt-1 inline-block">
                  Entry Probability: {prediction.entryProbability}%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Prediction Confidence:</span>
                  <span className="font-mono font-bold text-[#19B7C9]">
                    {prediction.predictionConfidence}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>CV Detection Confidence:</span>
                  <span className="font-mono font-bold text-[#20D58A]">96.2%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Terrain Friction Index:</span>
                  <span className="font-mono text-slate-400">0.42 (Dry Riverbed)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#193348]">
            <button
              onClick={handleRunNewPrediction}
              className="w-full py-2.5 px-4 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-xs rounded-lg transition-colors shadow text-center cursor-pointer"
            >
              Re-Calculate Conflict Corridor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
