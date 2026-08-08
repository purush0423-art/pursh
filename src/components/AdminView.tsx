import React, { useState, useEffect } from 'react';
import { ComplaintTicket, RoutingRule, AuditLog, User } from '../types';
import { fetchAnalyticsData, fetchRoutingRules, createRoutingRule, fetchAuditLogs, updateTicketStatus } from '../services/api';
import { TicketCard } from './TicketCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  GitMerge,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Star,
  Plus,
  RefreshCw,
  Search,
  Building,
  UserCheck
} from 'lucide-react';

interface AdminViewProps {
  tickets: ComplaintTicket[];
  users: User[];
  onSelectTicket: (ticketId: string) => void;
  onRefreshData: () => void;
  activeSubTab: string;
}

const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AdminView: React.FC<AdminViewProps> = ({
  tickets,
  users,
  onSelectTicket,
  onRefreshData,
  activeSubTab
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New Routing Rule Form State
  const [newCategory, setNewCategory] = useState('IT & Wi-Fi');
  const [newLocation, setNewLocation] = useState('All Buildings');
  const [newDepartment, setNewDepartment] = useState('Campus IT & Wi-Fi Network');
  const [newResolverId, setNewResolverId] = useState('');

  // Reassignment Modal State
  const [selectedTicketToReassign, setSelectedTicketToReassign] = useState<ComplaintTicket | null>(null);
  const [reassignResolverId, setReassignResolverId] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, rulesRes, logsRes] = await Promise.all([
        fetchAnalyticsData(),
        fetchRoutingRules(),
        fetchAuditLogs()
      ]);
      setAnalytics(analyticsRes);
      setRules(rulesRes);
      setLogs(logsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeSubTab]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoutingRule({
        category: newCategory as any,
        location: newLocation as any,
        department: newDepartment,
        defaultResolverId: newResolverId || undefined,
        isActive: true
      });
      await loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReassignTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketToReassign || !reassignResolverId) return;

    try {
      await updateTicketStatus(selectedTicketToReassign.id, {
        assignedResolverId: reassignResolverId,
        updaterName: 'Chief Admin',
        updaterRole: 'admin'
      });
      setSelectedTicketToReassign(null);
      onRefreshData();
      await loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const resolvers = users.filter(u => u.role === 'resolver');

  return (
    <div className="space-y-6">
      
      {/* TAB 1: ANALYTICS & INSIGHTS DASHBOARD */}
      {(activeSubTab === 'admin_analytics' || !activeSubTab) && (
        <div className="space-y-6">
          {/* Executive Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Total Campus Complaints</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{analytics?.summary?.total || tickets.length}</div>
              <div className="text-[11px] text-indigo-600 font-medium mt-1">Logged across all zones</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Avg Resolution SLA Time</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{analytics?.summary?.avgResolutionHours || 4.2} Hours</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">18% faster than benchmark</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Escalation Rate</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{analytics?.summary?.escalationRate || 8}%</div>
              <div className="text-[11px] text-purple-600 font-medium mt-1">Stalled or parts-pending</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Student Satisfaction</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-1">
                {analytics?.summary?.avgRating || 4.8} <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-[11px] text-amber-600 font-medium mt-1">Based on verified feedback</div>
            </div>
          </div>

          {/* Recharts Data Visualization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: High-Volume Problem Zones */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">High-Volume Campus Problem Zones</h3>
                  <p className="text-xs text-slate-500">Breakdown of complaints logged by building/complex</p>
                </div>
                <Building className="w-5 h-5 text-indigo-600" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.problemZones || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="location" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Total Complaints" />
                    <Bar dataKey="highPriorityCount" fill="#ef4444" radius={[6, 6, 0, 0]} name="High/Emergency Priority" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Category Distribution</h3>
                  <p className="text-xs text-slate-500">Proportion of facility issues by category</p>
                </div>
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.categoryData || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="category"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {(analytics?.categoryData || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: TICKET MANAGEMENT & REASSIGNMENT */}
      {activeSubTab === 'admin_all_tickets' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campus Complaints & Escalations</h3>
              <p className="text-xs text-slate-500">Reassign stalled tickets or force status override</p>
            </div>
            <button
              onClick={onRefreshData}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="relative">
                <TicketCard
                  ticket={ticket}
                  currentRole="admin"
                  onClick={() => onSelectTicket(ticket.id)}
                />
                <button
                  id={`reassign-btn-${ticket.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTicketToReassign(ticket);
                  }}
                  className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-600 shadow-xs"
                >
                  Reassign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED ROUTING RULES */}
      {activeSubTab === 'admin_routing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Rules List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Automated Routing Rules</h3>
              <p className="text-xs text-slate-500">Newly submitted complaints auto-route to designated departments immediately</p>
            </div>

            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-xs">
                        {rule.category}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">📍 {rule.location}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-1.5">
                      Routes To: <span className="text-indigo-600">{rule.department}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Create New Rule Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" /> Add Routing Rule
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="IT & Wi-Fi">IT & Wi-Fi</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Sanitation & Hygiene">Sanitation & Hygiene</option>
                  <option value="Security & Safety">Security & Safety</option>
                  <option value="Hostel & Housing">Hostel & Housing</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Default Resolver Staff</label>
                <select
                  value={newResolverId}
                  onChange={(e) => setNewResolverId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Auto-Assign Department Pool</option>
                  {resolvers.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.department})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                id="create-routing-rule-btn"
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-xs hover:bg-indigo-700"
              >
                Create Rule
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 4: STAFF & DEPARTMENTS */}
      {activeSubTab === 'admin_staff' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resolvers.map(resolver => {
            const resolverTickets = tickets.filter(t => t.assignedResolverId === resolver.id);
            const activeTasks = resolverTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');

            return (
              <div key={resolver.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <img src={resolver.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{resolver.name}</h4>
                    <p className="text-[10px] text-slate-500">{resolver.department}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Active Workload:</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {activeTasks.length} Tickets
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  📞 {resolver.phone || '+1 (555) 012-4000'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: SYSTEM AUDIT LOGS */}
      {activeSubTab === 'admin_audit' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">System Security Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable chronological log of ticket routing, status changes, and staff actions</p>
          </div>

          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800">{log.actor}</span> ({log.actorRole}) • <span className="font-mono text-indigo-600 font-semibold">{log.action}</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                </div>
                <div className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reassignment Modal */}
      {selectedTicketToReassign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Reassign Ticket #{selectedTicketToReassign.id}</h3>
            <p className="text-xs text-slate-600">{selectedTicketToReassign.title}</p>

            <form onSubmit={handleReassignTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select New Maintenance Staff</label>
                <select
                  value={reassignResolverId}
                  onChange={(e) => setReassignResolverId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">Select Staff Member...</option>
                  {resolvers.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicketToReassign(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
