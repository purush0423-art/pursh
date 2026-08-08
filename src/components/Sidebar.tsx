import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  BarChart3,
  GitMerge,
  Users,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    total: number;
    active: number;
    assignedToMe: number;
    emergencies: number;
    resolved: number;
    stalled: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeTab, onTabChange, counts }) => {
  return (
    <aside id="main-sidebar" className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between shrink-0 rounded-2xl md:min-h-[calc(100vh-6rem)] border border-slate-800 shadow-xl">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {currentRole === 'complainant' && 'Student / Faculty Portal'}
          {currentRole === 'resolver' && 'Resolver Operations Hub'}
          {currentRole === 'admin' && 'System Management'}
        </div>

        <nav className="space-[#1e293b] space-y-1">
          {/* Complainant Nav Links */}
          {currentRole === 'complainant' && (
            <>
              <button
                id="sidebar-tab-my-complaints"
                onClick={() => onTabChange('my_complaints')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'my_complaints'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-indigo-400" />
                  <span>My Complaints</span>
                </div>
                <span className="bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-300">
                  {counts.active}
                </span>
              </button>

              <button
                id="sidebar-tab-all-tickets"
                onClick={() => onTabChange('all_tickets')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'all_tickets'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>Public Feed</span>
                </div>
                <span className="bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-300">
                  {counts.total}
                </span>
              </button>
            </>
          )}

          {/* Resolver Nav Links */}
          {currentRole === 'resolver' && (
            <>
              <button
                id="sidebar-tab-resolver-queue"
                onClick={() => onTabChange('resolver_queue')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'resolver_queue'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Assigned Task Queue</span>
                </div>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
                  {counts.assignedToMe}
                </span>
              </button>

              <button
                id="sidebar-tab-resolver-emergency"
                onClick={() => onTabChange('resolver_emergencies')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'resolver_emergencies'
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>Emergencies</span>
                </div>
                {counts.emergencies > 0 && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold animate-bounce">
                    {counts.emergencies}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Admin Nav Links */}
          {currentRole === 'admin' && (
            <>
              <button
                id="sidebar-tab-admin-analytics"
                onClick={() => onTabChange('admin_analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin_analytics'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Analytics & Insights</span>
                </div>
              </button>

              <button
                id="sidebar-tab-admin-all-tickets"
                onClick={() => onTabChange('admin_all_tickets')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin_all_tickets'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                  <span>Ticket Escalations</span>
                </div>
                {counts.stalled > 0 && (
                  <span className="bg-purple-500/30 text-purple-300 border border-purple-400/40 px-2 py-0.5 rounded-md text-[10px] font-bold">
                    {counts.stalled} Flagged
                  </span>
                )}
              </button>

              <button
                id="sidebar-tab-admin-routing-rules"
                onClick={() => onTabChange('admin_routing')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin_routing'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GitMerge className="w-4 h-4 text-emerald-400" />
                  <span>Automated Routing Rules</span>
                </div>
              </button>

              <button
                id="sidebar-tab-admin-staff"
                onClick={() => onTabChange('admin_staff')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin_staff'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Staff & Departments</span>
                </div>
              </button>

              <button
                id="sidebar-tab-admin-audit-logs"
                onClick={() => onTabChange('admin_audit')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin_audit'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>System Audit Trail</span>
                </div>
              </button>
            </>
          )}
        </nav>

        {/* Quick System Health Box */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-1.5 font-medium">
              <span>Campus Ops Status</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Auto-Router:</span>
                <span className="text-slate-200 font-mono">ACTIVE (6 rules)</span>
              </div>
              <div className="flex justify-between">
                <span>Avg SLA Time:</span>
                <span className="text-slate-200 font-mono">4.2 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Smart Campus Care v2.4 • Educational Edition
      </div>
    </aside>
  );
};
