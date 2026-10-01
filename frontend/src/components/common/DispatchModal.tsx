import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, Navigation, Radio } from 'lucide-react';
import { ResponderTeam } from '../../types';
import { ecoTwinApi } from '../../services/api';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string; // incidentId or threatId
  targetTitle: string;
  targetLocation: string;
  onSuccess?: (team: ResponderTeam) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetTitle,
  targetLocation,
  onSuccess,
}) => {
  const [teams, setTeams] = useState<ResponderTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [tacticalNote, setTacticalNote] = useState<string>('Priority response: Deploy acoustic deterrents and establish village perimeter cordon.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      ecoTwinApi.getResponderTeams().then((data) => {
        setTeams(data);
        const available = data.find((t) => t.status === 'Available');
        if (available) {
          setSelectedTeamId(available.id);
        } else if (data.length > 0) {
          setSelectedTeamId(data[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDispatch = async () => {
    if (!selectedTeamId) return;
    setIsSubmitting(true);
    try {
      const selectedTeam = teams.find((t) => t.id === selectedTeamId);
      if (targetId.startsWith('INC-')) {
        await ecoTwinApi.assignTeamToIncident(targetId, selectedTeamId);
      } else {
        await ecoTwinApi.dispatchTeam(selectedTeamId, targetLocation);
      }
      setToastMessage(`Dispatched ${selectedTeam?.name || 'Team'} to ${targetLocation}`);
      setTimeout(() => {
        setIsSubmitting(false);
        if (selectedTeam && onSuccess) onSuccess(selectedTeam);
        onClose();
      }, 1000);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#193348] flex items-center justify-between bg-[#102433]/70">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FF5148]" />
            <h3 className="font-semibold text-white">Tactical Team Dispatch</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="bg-[#07141F] p-3 rounded-lg border border-[#193348]/60 text-xs">
            <div className="text-slate-400">Target Operational Objective:</div>
            <div className="text-white font-medium text-sm mt-0.5">{targetTitle}</div>
            <div className="text-[#19B7C9] mt-0.5 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" />
              <span>Location: {targetLocation}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Responder Unit
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {teams.map((team) => {
                const isSelected = team.id === selectedTeamId;
                const isAvailable = team.status === 'Available';
                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#20D58A] bg-[#20D58A]/10 text-white'
                        : 'border-[#193348] bg-[#07141F]/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{team.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            isAvailable
                              ? 'bg-[#20D58A]/20 text-[#20D58A]'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {team.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span>{team.region}</span>
                        <span>·</span>
                        <span className="tabular-nums">{team.distance}</span>
                        <span>·</span>
                        <span className="text-[#20D58A] tabular-nums">{team.eta}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-[#19B7C9]" />
                        <span>{team.contactChannel}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{team.membersCount} Rangers</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Tactical Dispatch Directives
            </label>
            <textarea
              value={tacticalNote}
              onChange={(e) => setTacticalNote(e.target.value)}
              rows={2}
              className="w-full bg-[#07141F] border border-[#193348] rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#20D58A]"
            />
          </div>

          {toastMessage && (
            <div className="p-2.5 bg-[#20D58A]/20 border border-[#20D58A]/50 rounded-lg flex items-center gap-2 text-xs text-[#20D58A]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#193348] flex items-center justify-end gap-3 bg-[#102433]/70">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            disabled={!selectedTeamId || isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-[#07141F] bg-[#20D58A] hover:bg-[#20D58A]/90 rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Transmitting Dispatch...' : 'Confirm Dispatch'}
          </button>
        </div>
      </div>
    </div>
  );
};
