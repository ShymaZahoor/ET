import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Database,
  Layers,
  Activity,
  CheckCircle2,
  BarChart2,
  Tag,
  Clock,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { AIModelStatus } from '../types';

export const AIDataPage: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<AIModelStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'models' | 'dataset' | 'training' | 'performance' | 'classes'>('models');

  useEffect(() => {
    ecoTwinApi.getModelStatus().then(setModelStatus);
  }, []);

  if (!modelStatus) {
    return <div className="p-8 text-center text-slate-400">Loading AI & ML Infrastructure...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#20D58A]" />
            <h1 className="text-xl font-bold text-white tracking-tight">AI & Machine Learning Infrastructure</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Computer vision pipelines, Kalman tracking filters, recurrent conflict forecasting, and dataset classes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#20D58A] bg-[#20D58A]/10 border border-[#20D58A]/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#20D58A] animate-pulse" />
            <span>All ML Engines Online</span>
          </span>
        </div>
      </div>

      {/* Tabs Filter Bar (Directly from reference design) */}
      <div className="flex items-center gap-1 p-1 bg-[#0B1B28] border border-[#193348] rounded-xl w-fit">
        {(['models', 'dataset', 'training', 'performance', 'classes'] as const).map((tab) => {
          const labels: Record<string, string> = {
            models: 'Model Status',
            dataset: 'Dataset',
            training: 'Training',
            performance: 'Performance',
            classes: 'Species Classes',
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

      {/* 3 Model Cards Row (Directly from reference design) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Model 1: Detection Model (YOLOv8) */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-slate-500 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Computer Vision</span>
                <h3 className="font-bold text-white text-base">{modelStatus.detection.name}</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-[#20D58A]/20 text-[#20D58A]">
                {modelStatus.detection.status}
              </span>
            </div>

            <div className="mt-3 text-xs text-[#19B7C9] font-mono font-medium">
              Architecture: {modelStatus.detection.architecture}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 bg-[#07141F] p-3 rounded-lg border border-[#193348] text-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">mAP@50</span>
                <span className="text-base font-bold font-mono text-[#20D58A] tabular-nums">
                  {modelStatus.detection.map50}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Precision</span>
                <span className="text-base font-bold font-mono text-white tabular-nums">
                  {modelStatus.detection.precision}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Recall</span>
                <span className="text-base font-bold font-mono text-white tabular-nums">
                  {modelStatus.detection.recall}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#193348] flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Last Updated</span>
            <span>{modelStatus.detection.lastUpdated}</span>
          </div>
        </div>

        {/* Model 2: Tracking Model (ByteTrack) */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-slate-500 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Spatial Vector</span>
                <h3 className="font-bold text-white text-base">{modelStatus.tracking.name}</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-[#20D58A]/20 text-[#20D58A]">
                {modelStatus.tracking.status}
              </span>
            </div>

            <div className="mt-3 text-xs text-[#19B7C9] font-mono font-medium">
              Architecture: {modelStatus.tracking.architecture}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 bg-[#07141F] p-3 rounded-lg border border-[#193348] text-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Active Tracks</span>
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {modelStatus.tracking.activeTracks}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Tracking FPS</span>
                <span className="text-xl font-bold font-mono text-[#20D58A] tabular-nums">
                  {modelStatus.tracking.trackingFps}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#193348] flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Last Updated</span>
            <span>{modelStatus.tracking.lastUpdated}</span>
          </div>
        </div>

        {/* Model 3: Risk Prediction Model (LSTM + RF) */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-slate-500 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Predictive Risk</span>
                <h3 className="font-bold text-white text-base">{modelStatus.riskPrediction.name}</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-[#20D58A]/20 text-[#20D58A]">
                {modelStatus.riskPrediction.status}
              </span>
            </div>

            <div className="mt-3 text-xs text-[#19B7C9] font-mono font-medium">
              Architecture: {modelStatus.riskPrediction.architecture}
            </div>

            <div className="mt-4 bg-[#07141F] p-3 rounded-lg border border-[#193348] text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Conflict Accuracy</span>
              <span className="text-2xl font-bold font-mono text-[#20D58A] tabular-nums">
                {modelStatus.riskPrediction.accuracy}%
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#193348] flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Last Updated</span>
            <span>{modelStatus.riskPrediction.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Dataset Summary Section */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#19B7C9]" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">
              Dataset Summary & Partition Splits
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Auto-augmented with IR synthetic frames</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-[#07141F] p-3 rounded-xl border border-[#193348]">
            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Images</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {modelStatus.dataset.totalImages.toLocaleString()}
            </span>
          </div>
          <div className="bg-[#07141F] p-3 rounded-xl border border-[#193348]">
            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Species</span>
            <span className="text-lg font-bold font-mono text-[#20D58A] tabular-nums">
              {modelStatus.dataset.speciesCount}
            </span>
          </div>
          <div className="bg-[#07141F] p-3 rounded-xl border border-[#193348]">
            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Train Split</span>
            <span className="text-lg font-bold font-mono text-slate-300 tabular-nums">
              {modelStatus.dataset.trainingImages.toLocaleString()}
            </span>
          </div>
          <div className="bg-[#07141F] p-3 rounded-xl border border-[#193348]">
            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Validation</span>
            <span className="text-lg font-bold font-mono text-slate-300 tabular-nums">
              {modelStatus.dataset.validationImages.toLocaleString()}
            </span>
          </div>
          <div className="bg-[#07141F] p-3 rounded-xl border border-[#193348]">
            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Test Holdout</span>
            <span className="text-lg font-bold font-mono text-slate-300 tabular-nums">
              {modelStatus.dataset.testImages.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Species Classes Section */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#20D58A]" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">
              Wildlife Species Classes & Classification Metrics
            </h3>
          </div>
          <span className="text-xs text-slate-400">8 Fine-tuned Class Labels</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {modelStatus.classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-[#07141F] border border-[#193348] rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{cls.name}</span>
                <span className="text-[11px] font-mono text-[#20D58A] font-semibold">
                  F1: {cls.f1Score}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>{cls.samples.toLocaleString()} samples</span>
                <span>P: {cls.precision} · R: {cls.recall}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
