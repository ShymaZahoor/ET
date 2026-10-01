import React from 'react';
import { RiskSeverity } from '../../types';

interface RiskBadgeProps {
  level: RiskSeverity | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showDot = true }) => {
  const safeLevel = level || 'Normal';
  const getColors = () => {
    switch (safeLevel.toLowerCase()) {
      case 'critical':
        return 'text-[#FF5148] border-[#FF5148]/30 bg-[#FF5148]/10';
      case 'high':
        return 'text-[#FF5148] border-[#FF5148]/30 bg-[#FF5148]/10';
      case 'warning':
      case 'medium':
        return 'text-[#F4B740] border-[#F4B740]/30 bg-[#F4B740]/10';
      case 'watch':
      case 'monitoring':
        return 'text-[#39A9FF] border-[#39A9FF]/30 bg-[#39A9FF]/10';
      case 'normal':
      case 'low':
      default:
        return 'text-[#20D58A] border-[#20D58A]/30 bg-[#20D58A]/10';
    }
  };

  const getDotColor = () => {
    switch (safeLevel.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-[#FF5148]';
      case 'warning':
      case 'medium':
        return 'bg-[#F4B740]';
      case 'watch':
      case 'monitoring':
        return 'bg-[#39A9FF]';
      default:
        return 'bg-[#20D58A]';
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border ${getColors()} ${sizeClasses[size]} whitespace-nowrap`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()} shrink-0`} />}
      <span>{safeLevel}</span>
    </span>
  );
};
