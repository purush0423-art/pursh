import React from 'react';
import { ComplaintTicket, UserRole } from '../types';
import { TicketStatusBadge } from './TicketStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, Calendar, User, Wrench, Image as ImageIcon, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';

interface TicketCardProps {
  ticket: ComplaintTicket;
  currentRole: UserRole;
  onClick: () => void;
  onQuickStatusUpdate?: (status: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, currentRole, onClick, onQuickStatusUpdate }) => {
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      id={`ticket-card-${ticket.id}`}
      onClick={onClick}
      className={`group bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-indigo-300 relative ${
        ticket.priority === 'emergency'
          ? 'border-red-300 bg-red-50/10'
          : ticket.isStalled
          ? 'border-purple-300 bg-purple-50/10'
          : 'border-slate-200'
      }`}
    >
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
            #{ticket.id}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
            {ticket.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Ticket Title */}
      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
        {ticket.title}
      </h3>

      {/* Description excerpt */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
        {ticket.description}
      </p>

      {/* Media Indicator if attached */}
      {ticket.mediaAttachments && ticket.mediaAttachments.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-xs text-indigo-600 font-medium bg-indigo-50/60 px-2.5 py-1 rounded-lg w-fit">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{ticket.mediaAttachments.length} Photo Attached</span>
        </div>
      )}

      {/* Proof of fix badge if resolved */}
      {ticket.proofOfFixUrl && (
        <div className="mb-3 flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg w-fit border border-emerald-200">
          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
          <span>Proof of Fix Uploaded</span>
        </div>
      )}

      {/* Location & Metadata Row */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-y-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[180px]">{ticket.location} • {ticket.roomNumber}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(ticket.createdAt)}</span>
          </div>

          <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-xs font-semibold">
            Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Assignee / Complainant Footer Info */}
      <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 -mx-5 -mb-5 px-5 py-2.5 rounded-b-2xl border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>By: <strong className="text-slate-700 font-semibold">{ticket.complainantName}</strong> ({ticket.complainantType})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {ticket.assignedResolverName ? (
              <span className="text-slate-700 font-semibold">{ticket.assignedResolverName}</span>
            ) : (
              <span className="text-amber-700 font-medium italic">{ticket.assignedDepartment}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
