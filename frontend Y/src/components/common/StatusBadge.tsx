import React from 'react';
import { IncidentStatus, TeamStatus } from '../../types';

interface StatusBadgeProps {
  status: IncidentStatus | TeamStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch ((status || '').toLowerCase()) {
      case 'active':
        return 'text-[#FF5148] bg-[#FF5148]/10 border-[#FF5148]/20';
      case 'on mission':
      case 'en route':
        return 'text-[#F4B740] bg-[#F4B740]/10 border-[#F4B740]/20';
      case 'monitoring':
      case 'assigned':
        return 'text-[#39A9FF] bg-[#39A9FF]/10 border-[#39A9FF]/20';
      case 'available':
      case 'resolved':
      case 'live':
        return 'text-[#20D58A] bg-[#20D58A]/10 border-[#20D58A]/20';
      case 'offline':
      case 'standby':
      default:
        return 'text-slate-400 bg-slate-800/40 border-slate-700/50';
    }
  };

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded border ${getStyle()} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status || 'Unknown'}
    </span>
  );
};
