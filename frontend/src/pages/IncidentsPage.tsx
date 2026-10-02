import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  PlusCircle,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { Incident } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { DispatchModal } from '../components/common/DispatchModal';

export const IncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [dispatchTarget, setDispatchTarget] = useState<{
    id: string;
    title: string;
    location: string;
  } | null>(null);

  useEffect(() => {
    ecoTwinApi.getIncidents().then(setIncidents);
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    const matchSearch =
      inc.id.toLowerCase().includes(search.toLowerCase()) ||
      inc.species.toLowerCase().includes(search.toLowerCase()) ||
      inc.location.toLowerCase().includes(search.toLowerCase()) ||
      inc.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inc.status === statusFilter;
    const matchSeverity = severityFilter === 'All' || inc.severity === severityFilter;
    return matchSearch && matchStatus && matchSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FF5148]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Incident Management & Dispatch</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active conflict escalation logs, assigned ranger response units, and evidentiary computer vision records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/incidents/INC-001')}
            className="px-4 py-2 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            <span>Primary Critical Dossier (INC-001)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
            placeholder="Search Incident ID, species, village, or unit..."
            className="w-full bg-[#07141F] border border-[#193348] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#20D58A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter incidents by Status"
            className="bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#20D58A]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Assigned">Assigned</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            aria-label="Filter incidents by Severity"
            className="bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#20D58A]"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Warning">Warning</option>
            <option value="Watch">Watch</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102433] text-slate-400 font-semibold border-b border-[#193348] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Category & Subject</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#193348] text-slate-300">
              {filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-[#102433]/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/app/incidents/${inc.id}`)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#19B7C9] whitespace-nowrap">
                    {inc.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{inc.type}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {inc.species} ({inc.trackId})
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                    {inc.location}
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge level={inc.severity} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {inc.created}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {inc.assignedTeamName && inc.assignedTeamName !== 'Unassigned' ? (
                      <span className="text-[#20D58A] font-medium flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        {inc.assignedTeamName}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">None assigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inc.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setDispatchTarget({
                            id: inc.id,
                            title: `${inc.type} · ${inc.species}`,
                            location: inc.location,
                          })
                        }
                        className="px-2.5 py-1 bg-[#102433] hover:bg-[#20D58A] hover:text-[#07141F] text-[#20D58A] border border-[#20D58A]/30 rounded font-semibold text-[11px] transition-colors"
                      >
                        Assign Unit
                      </button>
                      <Link
                        to={`/app/incidents/${inc.id}`}
                        className="px-2.5 py-1 bg-[#07141F] hover:bg-[#193348] text-slate-300 hover:text-white rounded border border-[#193348] font-medium text-[11px] transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dispatchTarget && (
        <DispatchModal
          isOpen={!!dispatchTarget}
          onClose={() => setDispatchTarget(null)}
          targetId={dispatchTarget.id}
          targetTitle={dispatchTarget.title}
          targetLocation={dispatchTarget.location}
          onSuccess={() => {
            ecoTwinApi.getIncidents().then(setIncidents);
          }}
        />
      )}
    </div>
  );
};
