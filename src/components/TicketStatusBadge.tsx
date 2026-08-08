import React from 'react';
import { TicketStatus } from '../types';
import { Clock, CheckCircle2, AlertTriangle, ArrowUpRight, CheckCheck, FileText } from 'lucide-react';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  showIcon?: boolean;
  className?: string;
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status, showIcon = true, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: FileText
        };
      case 'assigned':
        return {
          label: 'Assigned',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
          dot: 'bg-indigo-500',
          icon: Clock
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
          dot: 'bg-blue-500 animate-pulse',
          icon: Clock
        };
      case 'escalated':
        return {
          label: 'Escalated',
          bg: 'bg-purple-50 text-purple-800 border-purple-200/80',
          dot: 'bg-purple-600',
          icon: ArrowUpRight
        };
      case 'resolved':
        return {
          label: 'Resolved',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
          icon: CheckCircle2
        };
      case 'closed':
        return {
          label: 'Closed',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: CheckCheck
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: AlertTriangle
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <span
      id={`status-badge-${status}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
};
