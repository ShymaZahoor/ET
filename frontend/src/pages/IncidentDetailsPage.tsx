import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  MapPin,
  TrendingUp,
  Camera,
  Activity,
  Layers,
  Radio,
  UserCheck,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { Incident, ResponderTeam } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { DispatchModal } from '../components/common/DispatchModal';
import { EcoTwinMap } from '../components/map/VandristiMap';

export const IncidentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'location' | 'prediction' | 'response'>('timeline');
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const incId = id || 'INC-001';
    ecoTwinApi.getIncidentById(incId).then((data) => {
      if (data) setIncident(data);
      else {
        // Fallback to first incident if not found
        ecoTwinApi.getIncidents().then((incs) => setIncident(incs[0]));
      }
    });
  }, [id]);

  if (!incident) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#20D58A] border-t-transparent rounded-full animate-spin" />
          <span>Loading tactical incident dossier...</span>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = async (status: Incident['status']) => {
    const updated = await ecoTwinApi.updateIncidentStatus(incident.id, status);
    setIncident(updated);
    setToastMsg(`Incident status successfully updated to ${status}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleResolve = async () => {
    const updated = await ecoTwinApi.updateIncidentStatus(incident.id, 'Resolved');
    setIncident(updated);
    setToastMsg('Incident resolved: Conflict averted and recorded in audit logs.');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Share/Export actions */}
      <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
        <Link
          to="/app/incidents"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incidents</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setToastMsg('Dossier link copied to clipboard');
              setTimeout(() => setToastMsg(null), 2000);
            }}
            className="px-3 py-1.5 bg-[#0B1B28] hover:bg-[#102433] text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-[#193348] transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={() => {
              setToastMsg('Exporting Incident Dossier PDF & CSV telemetry...');
              setTimeout(() => setToastMsg(null), 2500);
            }}
            className="px-3 py-1.5 bg-[#0B1B28] hover:bg-[#102433] text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-[#193348] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-[#20D58A]/10 border border-[#20D58A]/30 rounded-xl text-xs text-[#20D58A] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Dossier Header Banner (Directly matches reference design screen 8) */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Identifier & Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-[#FF5148]/10 border border-[#FF5148]/30 text-[#FF5148]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white font-mono tracking-tight">
                  {incident.id}
                </h1>
                <RiskBadge level={incident.severity} size="md" />
                <StatusBadge status={incident.status} size="md" />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">{incident.type}</p>
            </div>
          </div>

          {/* Center-Right: Vital Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#07141F] p-3 rounded-xl border border-[#193348] text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                Risk Score
              </span>
              <span className="text-xl font-bold font-mono text-[#FF5148] tabular-nums">
                {incident.riskScore} <span className="text-xs text-slate-500">/ 100</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                Entry Probability
              </span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                {incident.entryProbability}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                ETA to Zone
              </span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {incident.eta}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                Distance to Settlement
              </span>
              <span className="text-xl font-bold font-mono text-[#19B7C9] tabular-nums">
                {incident.distanceToSettlement}
              </span>
            </div>
          </div>
        </div>

        {/* Animal Profile Sub-bar */}
        <div className="mt-4 pt-4 border-t border-[#193348] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={incident.evidence[0]?.image}
              alt={incident.species}
              className="w-12 h-12 rounded-lg object-cover border border-[#193348]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{incident.species}</span>
                <span className="text-xs text-[#19B7C9] font-mono font-semibold">
                  {incident.trackId}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#19B7C9]" />
                <span>{incident.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Assigned Unit
              </span>
              <span className="text-xs font-semibold text-[#20D58A] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {incident.assignedTeamName || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-[#0B1B28] border border-[#193348] rounded-xl w-fit">
        {(['timeline', 'evidence', 'location', 'prediction', 'response'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#20D58A] text-[#07141F] shadow'
                  : 'text-slate-400 hover:text-white hover:bg-[#102433]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md">
        {/* 1. Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Incident Chronology & Event Log
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#193348]">
              {incident.timeline.map((evt, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#07141F] border-2 border-[#20D58A] ring-4 ring-[#0B1B28]" />
                  <div className="flex-1 bg-[#07141F] p-3 rounded-lg border border-[#193348] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[#20D58A] font-bold text-xs">{evt.time}</span>
                      {evt.badge && <StatusBadge status={evt.badge} size="sm" />}
                    </div>
                    <p className="text-slate-200">{evt.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Evidentiary Records & Detection Frames
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incident.evidence.map((evd) => (
                <div
                  key={evd.id}
                  className="bg-[#07141F] border border-[#193348] rounded-xl p-3 space-y-3"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-[#193348]">
                    <img src={evd.image} alt={evd.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-[#20D58A] text-[#07141F] font-bold text-[10px] px-2 py-0.5 rounded shadow">
                      YOLOv8 Conf: {evd.confidence}%
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                      {evd.cameraId} · {evd.timestamp}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs">{evd.title}</h4>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Source: Camera Trap Optical Sensor</span>
                      <span className="text-[#19B7C9] font-mono">Frame ID: {evd.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Location Tab */}
        {activeTab === 'location' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Incident Geofence & Proximity Map
            </div>
            <EcoTwinMap height="360px" showControls={true} />
          </div>
        )}

        {/* 4. Prediction Tab */}
        {activeTab === 'prediction' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              LSTM Conflict Trajectory Forecast
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#07141F] p-4 rounded-xl border border-[#193348]">
                <span className="text-slate-400 text-xs block">Predicted Breach Corridor</span>
                <span className="text-white font-bold text-base mt-1 block">
                  Western Agricultural Buffer
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Animal following dry creek depression toward village irrigation perimeter.
                </p>
              </div>

              <div className="bg-[#07141F] p-4 rounded-xl border border-[#193348]">
                <span className="text-slate-400 text-xs block">Estimated Time of Breach</span>
                <span className="text-[#FF5148] font-bold font-mono text-xl mt-1 block">
                  15:04 (in 32 min)
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Model speed vector: 4.2 km/h at steady 38° azimuth.
                </p>
              </div>

              <div className="bg-[#07141F] p-4 rounded-xl border border-[#193348]">
                <span className="text-slate-400 text-xs block">Intervention Window</span>
                <span className="text-[#20D58A] font-bold font-mono text-xl mt-1 block">
                  18 minutes remaining
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Recommended action: Acoustic deterrent activation at Sensor Post B-4.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Response Tab */}
        {activeTab === 'response' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Field Responder Deployment
            </div>

            <div className="bg-[#07141F] p-4 rounded-xl border border-[#193348] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {incident.assignedTeamName || 'Ranger Team 3'}
                  </span>
                  <StatusBadge status="On Mission" size="sm" />
                </div>
                <div className="text-xs text-slate-400 mt-1 space-y-1">
                  <div>Unit Leader: Capt. Vikram Singh (5 Field Rangers)</div>
                  <div>Tactical Comms: VHF Channel 1 (Encrypted)</div>
                  <div className="text-[#20D58A] font-mono">Distance to Target: 2.8 km (ETA 7 min)</div>
                </div>
              </div>

              <button
                onClick={() => setIsDispatchOpen(true)}
                className="px-4 py-2 bg-[#102433] hover:bg-[#193348] text-[#19B7C9] border border-[#19B7C9]/40 rounded-lg text-xs font-semibold"
              >
                Reassign or Dispatch Reinforcements
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident Bottom Command Actions (Assign Team | Update Status | Resolve) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0B1B28] border border-[#193348] rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDispatchOpen(true)}
            className="px-5 py-2.5 bg-[#FF5148] hover:bg-[#FF5148]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Assign Tactical Team</span>
          </button>

          <button
            onClick={() => handleUpdateStatus('Monitoring')}
            className="px-4 py-2.5 bg-[#102433] hover:bg-[#193348] text-slate-200 font-semibold text-xs rounded-lg border border-[#193348] transition-colors"
          >
            Set Monitoring Status
          </button>
        </div>

        <div>
          <button
            onClick={handleResolve}
            className="px-5 py-2.5 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Resolve Incident</span>
          </button>
        </div>
      </div>

      {/* Dispatch Modal */}
      {isDispatchOpen && (
        <DispatchModal
          isOpen={isDispatchOpen}
          onClose={() => setIsDispatchOpen(false)}
          targetId={incident.id}
          targetTitle={`${incident.type} (${incident.id})`}
          targetLocation={incident.location}
          onSuccess={(assignedTeam) => {
            ecoTwinApi.getIncidentById(incident.id).then((upd) => upd && setIncident(upd));
          }}
        />
      )}
    </div>
  );
};
