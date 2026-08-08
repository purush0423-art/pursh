import React from 'react';
import { Priority } from '../types';
import { AlertCircle, Flame, ShieldAlert, ChevronDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'emergency':
        return {
          label: 'EMERGENCY',
          bg: 'bg-red-600 text-white border-red-700 shadow-xs shadow-red-200',
          icon: Flame,
          pulse: true
        };
      case 'high':
        return {
          label: 'High Priority',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: ShieldAlert,
          pulse: false
        };
      case 'medium':
        return {
          label: 'Medium',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertCircle,
          pulse: false
        };
      case 'low':
      default:
        return {
          label: 'Low',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: ChevronDown,
          pulse: false
        };
    }
  };

  const config = getPriorityConfig();
  const IconComponent = config.icon;

  return (
    <span
      id={`priority-badge-${priority}`}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <IconComponent className={`w-3.5 h-3.5 ${config.pulse ? 'animate-bounce' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};
