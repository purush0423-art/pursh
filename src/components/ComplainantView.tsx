import React from 'react';
import { ComplaintTicket, UserRole } from '../types';
import { TicketCard } from './TicketCard';
import { PlusCircle, AlertCircle, CheckCircle2, Clock, Filter, Sparkles, Building2 } from 'lucide-react';

interface ComplainantViewProps {
  tickets: ComplaintTicket[];
  currentTab: string;
  onOpenNewComplaint: () => void;
  onSelectTicket: (ticketId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (st: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
}

export const ComplainantView: React.FC<ComplainantViewProps> = ({
  tickets,
  currentTab,
  onOpenNewComplaint,
  onSelectTicket,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange
}) => {
  const activeCount = tickets.filter(t => t.status === 'submitted' || t.status === 'assigned' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const emergencyCount = tickets.filter(t => t.priority === 'emergency' && t.status !== 'closed' && t.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner & Quick Action Cards */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
            Student & Campus Staff Helpdesk
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2 tracking-tight">
            Report Issues & Track Campus Resolution Status
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
            Our automated routing system immediately dispatches your requests directly to on-call maintenance teams in real-time.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              id="file-complaint-hero-btn"
              onClick={onOpenNewComplaint}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Submit New Ticket</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-indigo-600/20 blur-2xl pointer-events-none" />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Active Complaints</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{activeCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">In queue or in progress</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Resolved Complaints</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{resolvedCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Closed & verified</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Emergency Issues</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{emergencyCount}</div>
            <div className="text-[11px] text-red-600 font-medium mt-0.5">High SLA priority</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-800">Filter Tickets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            id="category-filter-select"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="Hostel & Housing">Hostel & Housing</option>
            <option value="IT & Wi-Fi">IT & Wi-Fi</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Sanitation & Hygiene">Sanitation & Hygiene</option>
            <option value="Security & Safety">Security & Safety</option>
            <option value="Mess & Canteen">Mess & Canteen</option>
            <option value="Library & Labs">Library & Labs</option>
          </select>
        </div>
      </div>

      {/* Ticket Grid */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Tickets Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any complaints matching your current filters. Click below to register a new campus issue.
          </p>
          <button
            onClick={onOpenNewComplaint}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs shadow-sm hover:bg-indigo-700 transition-all inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Submit Complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              currentRole="complainant"
              onClick={() => onSelectTicket(ticket.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
