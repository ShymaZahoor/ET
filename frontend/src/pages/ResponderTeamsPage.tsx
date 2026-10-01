import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Radio,
  Navigation,
  Shield,
  Clock,
  Phone,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { ResponderTeam } from '../types';
import { mockResponderTeams } from '../data/mockData';
import { StatusBadge } from '../components/common/StatusBadge';
import { DispatchModal } from '../components/common/DispatchModal';

export const ResponderTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<ResponderTeam[]>(mockResponderTeams);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dispatchModalTeam, setDispatchModalTeam] = useState<ResponderTeam | null>(null);
  const [selectedTeamDossier, setSelectedTeamDossier] = useState<ResponderTeam | null>(null);

  useEffect(() => {
    ecoTwinApi.getResponderTeams().then(setTeams);
  }, []);

  const filteredTeams = teams.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.leader.toLowerCase().includes(search.toLowerCase()) ||
      t.region.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === 'All' || t.region.includes(regionFilter);
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchRegion && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#20D58A]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Responder Teams & Dispatch Control</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Desktop management console for ranger tactical squads, radio channel coordination, and rapid mobilization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#20D58A] bg-[#20D58A]/10 border border-[#20D58A]/30 px-3 py-1.5 rounded-lg font-bold">
            {teams.filter((t) => t.status === 'Available').length} Ready Units
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team name, commander, or range..."
            className="w-full bg-[#07141F] border border-[#193348] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#20D58A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            aria-label="Filter teams by Sector"
            className="bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#20D58A]"
          >
            <option value="All">All Ranges</option>
            <option value="Northern">Northern Range</option>
            <option value="Central">Central Range</option>
            <option value="Eastern">Eastern Range</option>
            <option value="Southern">Southern Range</option>
            <option value="Western">Western Range</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter teams by Status"
            className="bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#20D58A]"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Mission">On Mission</option>
            <option value="En Route">En Route</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Responder Teams Cards Grid */}
      <div className="space-y-3">
        {filteredTeams.map((team) => {
          const isAvailable = team.status === 'Available';
          return (
            <div
              key={team.id}
              className="bg-[#0B1B28] border border-[#193348] hover:border-slate-500 rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              {/* Team info */}
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                    isAvailable
                      ? 'bg-[#20D58A]/10 text-[#20D58A] border-[#20D58A]/30'
                      : 'bg-[#102433] text-amber-400 border-amber-500/30'
                  }`}
                >
                  <Shield className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-white text-base">{team.name}</h3>
                    <StatusBadge status={team.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-300">{team.region}</span>
                    <span>·</span>
                    <span>Leader: {team.leader}</span>
                    <span>·</span>
                    <span>{team.membersCount} Certified Rangers</span>
                  </div>
                  {team.currentAssignment && (
                    <div className="text-xs text-amber-400 mt-1 font-medium">
                      Assignment: {team.currentAssignment}
                    </div>
                  )}
                </div>
              </div>

              {/* Telemetry values */}
              <div className="grid grid-cols-3 gap-4 text-xs bg-[#07141F] p-3 rounded-xl border border-[#193348] max-w-sm">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Distance
                  </span>
                  <span className="font-mono font-bold text-white text-sm tabular-nums">
                    {team.distance}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    ETA to Perimeter
                  </span>
                  <span className="font-mono font-bold text-[#20D58A] text-sm tabular-nums">
                    {team.eta}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    VHF Radio
                  </span>
                  <span className="font-mono text-[#19B7C9] text-xs flex items-center gap-1 mt-0.5">
                    <Radio className="w-3 h-3" />
                    <span>{team.contactChannel.split(' ')[0]}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTeamDossier(team)}
                  className="px-3 py-2 bg-[#07141F] hover:bg-[#102433] text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-[#193348] transition-colors"
                >
                  View Dossier
                </button>
                <button
                  onClick={() => setDispatchModalTeam(team)}
                  className={`px-4 py-2 font-bold text-xs rounded-lg transition-colors shadow flex items-center gap-1.5 cursor-pointer ${
                    isAvailable
                      ? 'bg-[#20D58A] text-[#07141F] hover:bg-[#20D58A]/90'
                      : 'bg-[#102433] text-slate-400 hover:text-white border border-[#193348]'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isAvailable ? 'Dispatch Unit' : 'Reassign'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Details Drawer/Modal */}
      {selectedTeamDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0B1B28] border border-[#193348] rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#20D58A]" />
                <h3 className="font-bold text-white text-base">{selectedTeamDossier.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTeamDossier(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#193348]">
                <span className="text-slate-400">Tactical Sector:</span>
                <span className="text-white font-medium">{selectedTeamDossier.region}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#193348]">
                <span className="text-slate-400">Unit Commander:</span>
                <span className="text-white font-medium">{selectedTeamDossier.leader}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#193348]">
                <span className="text-slate-400">Operational Readiness:</span>
                <StatusBadge status={selectedTeamDossier.status} size="sm" />
              </div>
              <div className="flex justify-between py-1 border-b border-[#193348]">
                <span className="text-slate-400">Current Assignment:</span>
                <span className="text-amber-400 font-medium">
                  {selectedTeamDossier.currentAssignment || 'None (Buffer Patrol)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#193348]">
                <span className="text-slate-400">Equipment Loadout:</span>
                <span className="text-slate-200">Acoustic sirens, night thermals, GPS trackers</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">VHF Communications:</span>
                <span className="text-[#19B7C9] font-mono">{selectedTeamDossier.contactChannel}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#193348] flex justify-end gap-2">
              <button
                onClick={() => setSelectedTeamDossier(null)}
                className="px-4 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchModalTeam && (
        <DispatchModal
          isOpen={!!dispatchModalTeam}
          onClose={() => setDispatchModalTeam(null)}
          targetId={dispatchModalTeam.id}
          targetTitle={dispatchModalTeam.name}
          targetLocation={dispatchModalTeam.region}
          onSuccess={() => {
            ecoTwinApi.getResponderTeams().then(setTeams);
          }}
        />
      )}
    </div>
  );
};
