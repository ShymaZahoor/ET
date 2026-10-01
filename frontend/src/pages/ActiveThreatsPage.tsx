import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  Shield,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  Crosshair,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { Threat } from '../types';
import { mockThreats } from '../data/mockData';
import { RiskBadge } from '../components/common/RiskBadge';
import { DispatchModal } from '../components/common/DispatchModal';

export const ActiveThreatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [threats, setThreats] = useState<Threat[]>(mockThreats);
  const [activeTab, setActiveTab] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Watch'>('All');
  const [dispatchTarget, setDispatchTarget] = useState<{
    id: string;
    title: string;
    location: string;
  } | null>(null);

  useEffect(() => {
    ecoTwinApi.getThreats().then(setThreats);
  }, []);

  const filteredThreats = threats.filter((t) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Critical') return t.status === 'Critical';
    if (activeTab === 'High') return t.status === 'High' || t.status === 'Critical';
    if (activeTab === 'Medium') return t.status === 'Warning';
    if (activeTab === 'Watch') return t.status === 'Watch';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF5148]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Active Conflict Threats</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Settlement geofence proximity evaluation, entry probability forecasting, and immediate tactical intervention
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#FF5148] bg-[#FF5148]/10 border border-[#FF5148]/30 px-3 py-1.5 rounded-lg font-bold">
            {threats.filter((t) => t.status === 'Critical').length} Critical Escalation
          </span>
        </div>
      </div>

      {/* Tabs Filter Bar (Directly from reference design) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0B1B28] border border-[#193348] rounded-xl w-fit">
        {(['All', 'Critical', 'High', 'Medium', 'Watch'] as const).map((tab) => {
          const count =
            tab === 'All'
              ? threats.length
              : tab === 'Critical'
              ? threats.filter((t) => t.status === 'Critical').length
              : tab === 'High'
              ? threats.filter((t) => t.status === 'High' || t.status === 'Critical').length
              : tab === 'Medium'
              ? threats.filter((t) => t.status === 'Warning').length
              : threats.filter((t) => t.status === 'Watch').length;

          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#20D58A] text-[#07141F] shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#102433]'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-[#07141F] text-[#20D58A]' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Threat Cards List */}
      <div className="space-y-4">
        {filteredThreats.map((threat) => (
          <div
            key={threat.id}
            className={`bg-[#0B1B28] border rounded-xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all ${
              threat.status === 'Critical'
                ? 'border-[#FF5148]/60 hover:border-[#FF5148]'
                : threat.status === 'Warning'
                ? 'border-[#F4B740]/40 hover:border-[#F4B740]'
                : 'border-[#193348] hover:border-slate-500'
            }`}
          >
            {/* Left: Animal Profile */}
            <div className="flex items-start sm:items-center gap-4 min-w-[280px]">
              <img
                src={threat.image}
                alt={threat.species}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#193348] shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#19B7C9] font-bold">{threat.trackId}</span>
                  <RiskBadge level={threat.status} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-white leading-tight mt-1">{threat.species}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{threat.location}</p>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Speed: {threat.speed} · Vector: {threat.direction}
                </div>
              </div>
            </div>

            {/* Center: Metrics Cluster */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 max-w-2xl bg-[#07141F] p-3.5 rounded-xl border border-[#193348]">
              {/* Risk Score */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Risk Score
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-[#FF5148] tabular-nums">
                    {threat.riskScore}
                  </span>
                  <span className="text-slate-500 text-xs">/ 100</span>
                </div>
                <div className="w-full bg-[#102433] h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-[#FF5148] h-full rounded-full"
                    style={{ width: `${threat.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Entry Probability */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Entry Probability
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                    {threat.entryProbability}%
                  </span>
                </div>
                <div className="w-full bg-[#102433] h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${threat.entryProbability}%` }}
                  />
                </div>
              </div>

              {/* Settlement ETA */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  ETA to Zone
                </span>
                <div className="mt-1">
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    {threat.eta}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Continuous Calc</span>
              </div>

              {/* Target Settlement */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Target Zone
                </span>
                <div className="mt-1">
                  <span className="text-xs font-semibold text-[#19B7C9] truncate block">
                    {threat.zoneName}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {threat.distanceToZone} away
                </span>
              </div>
            </div>

            {/* Right: Operational Actions */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <button
                onClick={() =>
                  setDispatchTarget({
                    id: threat.trackId,
                    title: `Threat Intervention: ${threat.species} (${threat.trackId})`,
                    location: threat.location,
                  })
                }
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#FF5148] hover:bg-[#FF5148]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Assign Team</span>
              </button>

              <button
                onClick={() => navigate('/app/predictive')}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#102433] hover:bg-[#193348] text-[#20D58A] border border-[#20D58A]/30 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Track Path</span>
              </button>

              <button
                onClick={() => navigate('/app/incidents/INC-001')}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#07141F] hover:bg-[#102433] text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-[#193348] text-center"
              >
                View Dossier
              </button>
            </div>
          </div>
        ))}
      </div>

      {dispatchTarget && (
        <DispatchModal
          isOpen={!!dispatchTarget}
          onClose={() => setDispatchTarget(null)}
          targetId={dispatchTarget.id}
          targetTitle={dispatchTarget.title}
          targetLocation={dispatchTarget.location}
          onSuccess={() => {
            ecoTwinApi.getThreats().then(setThreats);
          }}
        />
      )}
    </div>
  );
};
