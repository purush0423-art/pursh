import React from 'react';
import { ComplaintTicket, User } from '../types';
import { TicketCard } from './TicketCard';
import { Wrench, Flame, ShieldAlert, CheckCircle2, Clock, Filter, AlertTriangle } from 'lucide-react';

interface ResolverViewProps {
  tickets: ComplaintTicket[];
  currentUser: User;
  onSelectTicket: (ticketId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (st: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
}

export const ResolverView: React.FC<ResolverViewProps> = ({
  tickets,
  currentUser,
  onSelectTicket,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange
}) => {
  const assignedToMe = tickets.filter(t => t.assignedResolverId === currentUser.id);
  const emergencies = tickets.filter(t => t.priority === 'emergency' && t.status !== 'resolved' && t.status !== 'closed');
  const inProgress = tickets.filter(t => t.status === 'in_progress');
  const resolvedByMe = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <div className="space-y-6">
      
      {/* Resolver Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={currentUser.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/40" />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-amber-400/30">
                Maintenance Resolver Hub
              </span>
              <span className="text-slate-400 text-xs">{currentUser.department}</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              Welcome back, {currentUser.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
          <div className="text-center px-3 border-r border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">My Tasks</div>
            <div className="text-lg font-bold text-amber-400">{assignedToMe.length}</div>
          </div>
          <div className="text-center px-3 border-r border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">In Progress</div>
            <div className="text-lg font-bold text-blue-400">{inProgress.length}</div>
          </div>
          <div className="text-center px-3">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Emergencies</div>
            <div className="text-lg font-bold text-red-400">{emergencies.length}</div>
          </div>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      {emergencies.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 animate-bounce shrink-0" />
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider">
                Emergency Tickets Requiring Immediate Dispatch ({emergencies.length})
              </h3>
              <p className="text-xs text-red-100">
                {emergencies[0].title} — Location: <strong>{emergencies[0].location} ({emergencies[0].roomNumber})</strong>
              </p>
            </div>
          </div>

          <button
            id="view-emergency-btn"
            onClick={() => onSelectTicket(emergencies[0].id)}
            className="px-3.5 py-1.5 bg-white text-red-900 font-bold text-xs rounded-xl hover:bg-red-50 transition-all shrink-0 cursor-pointer"
          >
            Open Ticket #{emergencies[0].id}
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-800">Task Queue Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            id="resolver-status-filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            id="resolver-priority-filter"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="emergency">🚨 Emergency Only</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Queue Grid */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Pending Tasks</h3>
          <p className="text-xs text-slate-500">All tickets in your assigned department queue are currently up to date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              currentRole="resolver"
              onClick={() => onSelectTicket(ticket.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
