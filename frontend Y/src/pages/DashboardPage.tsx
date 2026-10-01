import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Shield,
  Users,
  CloudSun,
  CheckCircle,
  Eye,
  Radio,
  ArrowRight,
  TrendingUp,
  Maximize2,
  Clock,
  Compass,
} from 'lucide-react';
import { WorkflowStepBar } from '../components/common/WorkflowStepBar';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EcoTwinMap } from '../components/map/EcoTwinMap';
import { DispatchModal } from '../components/common/DispatchModal';
import { ecoTwinApi } from '../services/api';
import { Animal, Threat, Incident, ResponderTeam, Detection, Camera } from '../types';
import {
  mockThreats,
  mockAnimals,
  mockIncidents,
  mockResponderTeams,
  mockDetections,
  mockCameras,
} from '../data/mockData';
import leopardImg from '../assets/images/wildlife_leopard_cam_1790851270060.jpg';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>(mockAnimals);
  const [threats, setThreats] = useState<Threat[]>(mockThreats);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [teams, setTeams] = useState<ResponderTeam[]>(mockResponderTeams);
  const [detections, setDetections] = useState<Detection[]>(mockDetections);
  const [activeCam, setActiveCam] = useState<Camera | null>(mockCameras[0]);

  // Dispatch modal state
  const [dispatchTarget, setDispatchTarget] = useState<{
    id: string;
    title: string;
    location: string;
  } | null>(null);

  useEffect(() => {
    ecoTwinApi.getAnimals().then(setAnimals);
    ecoTwinApi.getThreats().then(setThreats);
    ecoTwinApi.getIncidents().then(setIncidents);
    ecoTwinApi.getResponderTeams().then(setTeams);
    ecoTwinApi.getDetections().then(setDetections);
    ecoTwinApi.getCameras().then((cams) => setActiveCam(cams[0]));
  }, []);

  const criticalThreat = threats.find((t) => t.status === 'Critical') || threats[0] || mockThreats[0];

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Row (Directly from reference design) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1: Animals Detected */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#20D58A]/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Animals Detected</span>
            <Eye className="w-4 h-4 text-[#20D58A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">12</span>
            <span className="text-xs text-[#20D58A] flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +20%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Today in Sector B</span>
        </div>

        {/* KPI 2: Active Threats */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#FF5148]/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Threats</span>
            <AlertTriangle className="w-4 h-4 text-[#FF5148]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#FF5148] font-mono tabular-nums">3</span>
            <span className="text-[11px] text-[#FF5148] font-medium">1 Critical</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Settlement Buffer Zone</span>
        </div>

        {/* KPI 3: Incidents in Response */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#19B7C9]/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Incidents in Response</span>
            <Shield className="w-4 h-4 text-[#19B7C9]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">2</span>
            <span className="text-xs text-[#19B7C9] font-medium">Active</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Ranger Units Deployed</span>
        </div>

        {/* KPI 4: Responder Teams */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#20D58A]/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Responder Teams</span>
            <Users className="w-4 h-4 text-[#20D58A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">5</span>
            <span className="text-xs text-[#20D58A] font-medium">3 Ready</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Northern & Central Ranges</span>
        </div>

        {/* KPI 5: Environmental Conditions */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-600 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Environmental</span>
            <CloudSun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white font-mono tabular-nums">26°C</span>
            <span className="text-[11px] text-slate-400 truncate">Partly Cloudy</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Humidity 68% · 12mm Rain</span>
        </div>

        {/* KPI 6: System Status */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#20D58A]/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">System Status</span>
            <CheckCircle className="w-4 h-4 text-[#20D58A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#20D58A] animate-pulse" />
            <span className="text-sm font-semibold text-white truncate">Operational</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">YOLOv8 + ByteTrack 28 FPS</span>
        </div>
      </div>

      {/* 2. Visual Operational Pipeline Workflow */}
      <WorkflowStepBar activeStepIndex={7} />

      {/* 3. Main Dashboard Layout (LEFT: Live Camera | CENTER: Tactical Map | RIGHT: Critical Threat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Live Camera Feed Preview (3 cols on lg) */}
        <div className="lg:col-span-3 bg-[#0B1B28] border border-[#193348] rounded-xl p-4 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5148] animate-ping" />
                <span className="font-semibold text-white text-xs">CAM-07 · Forest Zone B</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#FF5148]/20 text-[#FF5148] font-bold">
                LIVE
              </span>
            </div>

            {/* Video container with CV Bounding Box overlay */}
            <div className="relative mt-3 rounded-lg overflow-hidden border border-[#193348] bg-[#07141F] aspect-video group">
              <img
                src={leopardImg}
                alt="Live Camera Detection Feed"
                className="w-full h-full object-cover"
              />

              {/* Bounding Box for Leopard 96.2% */}
              <div
                className="absolute border-2 border-[#20D58A] bg-[#20D58A]/10 shadow-[0_0_15px_rgba(32,213,138,0.4)] pointer-events-none"
                style={{ top: '24%', left: '32%', width: '38%', height: '52%' }}
              >
                <div className="absolute -top-6 left-0 bg-[#20D58A] text-[#07141F] font-bold text-[10px] px-1.5 py-0.5 rounded-xs flex items-center gap-1 shadow">
                  <span>Leopard</span>
                  <span className="font-mono">96.2%</span>
                </div>
              </div>

              {/* Camera OSD Overlays */}
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/60 px-1.5 py-0.5 rounded">
                14:32:08 · IR SENSOR
              </div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-[#20D58A] bg-black/60 px-1.5 py-0.5 rounded">
                28 FPS
              </div>
            </div>

            {/* Telemetry info */}
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#193348]/50">
                <span className="text-slate-400">Species</span>
                <span className="text-white font-medium">Panthera pardus (Leopard)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#193348]/50">
                <span className="text-slate-400">CV Confidence</span>
                <span className="text-[#20D58A] font-mono font-bold">96.2%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#193348]/50">
                <span className="text-slate-400">Vector Heading</span>
                <span className="text-slate-200">Moving NE (4.2 km/h)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Track ID</span>
                <span className="text-[#19B7C9] font-mono font-medium">TRACK-001</span>
              </div>
            </div>
          </div>

          <Link
            to="/app/live-detection"
            className="mt-4 w-full py-2 px-3 bg-[#102433] hover:bg-[#193348] text-[#20D58A] hover:text-white rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-2 border border-[#193348]"
          >
            <span>Open Multi-Camera Wall</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CENTER: Tactical Map (6 cols on lg) */}
        <div className="lg:col-span-6 bg-[#0B1B28] border border-[#193348] rounded-xl p-3 flex flex-col justify-between shadow-md relative">
          <div className="flex items-center justify-between pb-2 px-2 border-b border-[#193348] mb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#20D58A]" />
              <span className="font-semibold text-white text-xs">Tactical Geofence & Threat Map</span>
            </div>
            <Link
              to="/app/map"
              className="text-xs text-[#19B7C9] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Full Screen View</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[360px] relative">
            <EcoTwinMap
              height="380px"
              onSelectAnimal={(id) => navigate(`/app/incidents/INC-001`)}
              showControls={true}
            />

            {/* Overlaid Recent Activity ticker inside the map container */}
            <div className="absolute top-14 right-3 z-10 w-64 bg-[#0B1B28]/95 border border-[#193348] rounded-lg p-2.5 shadow-xl backdrop-blur-xs hidden md:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Recent Activity</span>
                <span className="w-2 h-2 rounded-full bg-[#20D58A] animate-pulse" />
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-[#FF5148] shrink-0 font-bold">●</span>
                  <span className="flex-1 truncate">Leopard detected near Village X</span>
                  <span className="text-[10px] text-slate-500 font-mono">2m</span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-[#20D58A] shrink-0 font-bold">●</span>
                  <span className="flex-1 truncate">Ranger Team 3 assigned</span>
                  <span className="text-[10px] text-slate-500 font-mono">5m</span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-[#F4B740] shrink-0 font-bold">●</span>
                  <span className="flex-1 truncate">Elephant movement registered</span>
                  <span className="text-[10px] text-slate-500 font-mono">12m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Critical Threat Card (3 cols on lg) */}
        <div className="lg:col-span-3 bg-[#0B1B28] border border-[#FF5148]/40 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF5148]/10 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF5148]" />
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Critical Threat
                </span>
              </div>
              <RiskBadge level={criticalThreat?.status || 'Critical'} size="sm" />
            </div>

            {/* Animal info header */}
            <div className="mt-3 flex items-center gap-3">
              <img
                src={criticalThreat?.image || leopardImg}
                alt={criticalThreat?.species || 'Animal'}
                className="w-14 h-14 rounded-lg object-cover border border-[#FF5148]/40 shadow"
              />
              <div>
                <span className="text-[11px] text-[#19B7C9] font-mono font-medium">
                  {criticalThreat?.trackId || 'TRACK-001'}
                </span>
                <h4 className="text-base font-bold text-white leading-tight">
                  {criticalThreat?.species || 'Leopard'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{criticalThreat?.location || 'Near Village X'}</p>
              </div>
            </div>

            {/* Metric Bars */}
            <div className="mt-4 space-y-3">
              {/* Risk Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Risk Score</span>
                  <span className="text-[#FF5148] font-bold font-mono tabular-nums">
                    {criticalThreat?.riskScore ?? 78.8} / 100
                  </span>
                </div>
                <div className="w-full bg-[#07141F] h-2 rounded-full overflow-hidden border border-[#193348]">
                  <div
                    className="bg-[#FF5148] h-full rounded-full transition-all"
                    style={{ width: `${criticalThreat?.riskScore ?? 78.8}%` }}
                  />
                </div>
              </div>

              {/* Entry Probability */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Entry Probability</span>
                  <span className="text-[#FF5148] font-bold font-mono tabular-nums">
                    {criticalThreat?.entryProbability ?? 82}%
                  </span>
                </div>
                <div className="w-full bg-[#07141F] h-2 rounded-full overflow-hidden border border-[#193348]">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-[#FF5148] h-full rounded-full transition-all"
                    style={{ width: `${criticalThreat?.entryProbability ?? 82}%` }}
                  />
                </div>
              </div>

              {/* Settlement ETA */}
              <div className="bg-[#07141F] p-3 rounded-lg border border-[#193348] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                    ETA to Settlement
                  </span>
                  <span className="text-lg font-bold text-white font-mono tabular-nums">
                    {criticalThreat?.eta || '32 min'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Distance
                  </span>
                  <span className="text-sm font-semibold text-slate-300 font-mono">
                    {criticalThreat?.distanceToZone || '2.1 km'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            <button
              onClick={() =>
                setDispatchTarget({
                  id: 'INC-001',
                  title: `${criticalThreat?.species || 'Threat'} Breach (${criticalThreat?.trackId || 'TRACK-001'})`,
                  location: criticalThreat?.location || 'Village X',
                })
              }
              className="w-full py-2.5 px-4 bg-[#FF5148] hover:bg-[#FF5148]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Assign Responder Team</span>
            </button>

            <Link
              to="/app/incidents/INC-001"
              className="w-full py-2 px-3 bg-[#102433] hover:bg-[#193348] text-slate-200 hover:text-white rounded-lg text-xs font-semibold text-center transition-colors block border border-[#193348]"
            >
              View Full Incident Dossier
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Middle Section: Recent Detections + Responder Teams Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Detections */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#20D58A]" />
              <h3 className="font-semibold text-white text-sm">Recent Computer Vision Detections</h3>
            </div>
            <Link
              to="/app/wildlife"
              className="text-xs text-[#20D58A] hover:underline flex items-center gap-1 font-medium"
            >
              <span>All Tracks</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#193348]">
            {animals.map((animal) => (
              <div
                key={animal.id}
                onClick={() => navigate('/app/wildlife')}
                className="py-3 flex items-center justify-between hover:bg-[#102433]/40 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={animal.image}
                    alt={animal.species}
                    className="w-11 h-11 rounded-lg object-cover border border-[#193348]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{animal.species}</span>
                      <span className="text-[10px] text-[#19B7C9] font-mono">{animal.trackId}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{animal.location}</p>
                  </div>
                </div>

                <div className="text-right">
                  <RiskBadge level={animal.riskLevel} size="sm" />
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    {animal.speed} · {animal.direction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Responder Teams Deployment */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#19B7C9]" />
              <h3 className="font-semibold text-white text-sm">Field Responder Teams</h3>
            </div>
            <Link
              to="/app/teams"
              className="text-xs text-[#19B7C9] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Manage Units</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {teams.slice(0, 4).map((team) => (
              <div
                key={team.id}
                className="p-3 bg-[#07141F] border border-[#193348] rounded-lg flex items-center justify-between hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">{team.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({team.region})</span>
                    <StatusBadge status={team.status} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Leader: {team.leader}</span>
                    <span>·</span>
                    <span className="text-[#20D58A] font-mono tabular-nums">{team.distance}</span>
                    <span>·</span>
                    <span className="text-slate-300 font-mono tabular-nums">{team.eta}</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() =>
                      setDispatchTarget({
                        id: team.id,
                        title: team.name,
                        location: 'Northern Range Buffer',
                      })
                    }
                    className="px-2.5 py-1 bg-[#102433] hover:bg-[#20D58A] hover:text-[#07141F] text-[#20D58A] border border-[#20D58A]/30 text-xs font-semibold rounded transition-colors"
                  >
                    Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Dispatch Modal if triggered */}
      {dispatchTarget && (
        <DispatchModal
          isOpen={!!dispatchTarget}
          onClose={() => setDispatchTarget(null)}
          targetId={dispatchTarget.id}
          targetTitle={dispatchTarget.title}
          targetLocation={dispatchTarget.location}
          onSuccess={() => {
            ecoTwinApi.getIncidents().then(setIncidents);
            ecoTwinApi.getResponderTeams().then(setTeams);
          }}
        />
      )}
    </div>
  );
};
