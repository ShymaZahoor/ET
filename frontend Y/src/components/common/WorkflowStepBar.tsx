import React, { useState } from 'react';
import {
  Camera,
  Scan,
  Tag,
  Crosshair,
  Compass,
  TrendingUp,
  AlertTriangle,
  Flame,
  Radio,
  Users,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';

export const workflowSteps = [
  { id: 'camera', label: 'Camera / Video', icon: Camera, desc: 'Real-time trap cams & drone feeds' },
  { id: 'detection', label: 'Animal Detection', icon: Scan, desc: 'Computer vision bounding boxes' },
  { id: 'species', label: 'Species Identification', icon: Tag, desc: 'Multi-class wildlife classifiers' },
  { id: 'confidence', label: 'Detection Confidence', icon: Crosshair, desc: 'CV model probability (e.g. 96.2%)' },
  { id: 'tracking', label: 'Animal Tracking', icon: Compass, desc: 'ByteTrack trajectory IDs' },
  { id: 'movement', label: 'Movement Analysis', icon: TrendingUp, desc: 'Speed & directional heading vectors' },
  { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle, desc: 'Geofence proximity scoring' },
  { id: 'threat', label: 'Threat Prediction', icon: Flame, desc: 'LSTM settlement entry probability' },
  { id: 'incident', label: 'Alert / Incident', icon: Radio, desc: 'Automated emergency dispatch ticket' },
  { id: 'team', label: 'Team Assignment', icon: Users, desc: 'Ranger tactical deployment' },
  { id: 'resolution', label: 'Resolution', icon: CheckCircle2, desc: 'Conflict averted & safe return' },
];

interface WorkflowStepBarProps {
  activeStepIndex?: number;
  interactive?: boolean;
}

export const WorkflowStepBar: React.FC<WorkflowStepBarProps> = ({
  activeStepIndex = 7,
  interactive = true,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(activeStepIndex);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-3 shadow-md mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#20D58A] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            VanDristi End-to-End Operational Pipeline
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#20D58A] hover:text-[#20D58A]/80 font-medium flex items-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          {isExpanded ? 'Collapse Guide' : 'Explain Workflow'}
        </button>
      </div>

      {/* Pipeline stepper */}
      <div className="overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex items-center min-w-[980px] justify-between relative">
          {/* Connector line */}
          <div className="absolute left-4 right-4 top-4 h-[2px] bg-slate-800 -z-0" />
          <div
            className="absolute left-4 top-4 h-[2px] bg-gradient-to-r from-[#20D58A] via-[#19B7C9] to-[#FF5148] -z-0 transition-all duration-500"
            style={{ width: `${(selectedStep / (workflowSteps.length - 1)) * 96}%` }}
          />

          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < selectedStep;
            const isCurrent = idx === selectedStep;

            return (
              <button
                key={step.id}
                disabled={!interactive}
                onClick={() => interactive && setSelectedStep(idx)}
                className={`relative z-10 flex flex-col items-center group text-center focus:outline-none transition-transform ${
                  interactive ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-[#20D58A] text-[#07141F] shadow-[0_0_12px_rgba(32,213,138,0.5)] ring-2 ring-[#20D58A]/40'
                      : isCompleted
                      ? 'bg-[#102433] text-[#20D58A] border border-[#20D58A]/60'
                      : 'bg-[#0B1B28] text-slate-500 border border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
                    isCurrent ? 'text-white font-semibold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded detail box */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#193348] flex items-start gap-3 bg-[#07141F]/60 p-3 rounded-lg text-xs">
          <div className="w-7 h-7 rounded-lg bg-[#20D58A]/10 text-[#20D58A] flex items-center justify-center shrink-0">
            {React.createElement(workflowSteps[selectedStep].icon, { className: 'w-4 h-4' })}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                Step {selectedStep + 1}: {workflowSteps[selectedStep].label}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-[#19B7C9]">{workflowSteps[selectedStep].desc}</span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Every wildlife movement event is processed through this autonomous pipeline: from edge camera traps
              running YOLOv8 models to spatial Kalman-filter tracking, LSTM conflict forecasting, and instant VHF/SMS
              ranger team mobilization.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
