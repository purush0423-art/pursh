import React, { useState, useEffect } from 'react';
import { User, ComplaintTicket } from './types';
import { fetchUsers, fetchComplaints } from './services/api';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ComplainantView } from './components/ComplainantView';
import { ResolverView } from './components/ResolverView';
import { AdminView } from './components/AdminView';
import { SubmitComplaintModal } from './components/SubmitComplaintModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('my_complaints');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Load Users & Complaints
  const loadData = async () => {
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      
      // Default to first student if currentUser not set
      if (!currentUser && fetchedUsers.length > 0) {
        setCurrentUser(fetchedUsers[0]);
      }

      const activeUser = currentUser || fetchedUsers[0];
      const fetchedComplaints = await fetchComplaints({
        role: activeUser?.role,
        userId: activeUser?.id,
        search: searchQuery || undefined
      });
      setComplaints(fetchedComplaints);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id, searchQuery]);

  // Handle switching user persona
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    // Auto-adjust default active tab based on new role
    if (user.role === 'complainant') {
      setActiveTab('my_complaints');
    } else if (user.role === 'resolver') {
      setActiveTab('resolver_queue');
    } else if (user.role === 'admin') {
      setActiveTab('admin_analytics');
    }
  };

  if (loading || !currentUser) {
    return (
      <div id="app-loading-screen" className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3 font-semibold text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span>Initializing Smart Campus Complaint Management System...</span>
        </div>
      </div>
    );
  }

  // Count metrics for sidebar badges
  const counts = {
    total: complaints.length,
    active: complaints.filter(c => c.complainantId === currentUser.id && (c.status === 'submitted' || c.status === 'assigned' || c.status === 'in_progress')).length,
    assignedToMe: complaints.filter(c => c.assignedResolverId === currentUser.id && c.status !== 'resolved' && c.status !== 'closed').length,
    emergencies: complaints.filter(c => c.priority === 'emergency' && c.status !== 'resolved' && c.status !== 'closed').length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
    stalled: complaints.filter(c => c.isStalled || c.status === 'escalated').length
  };

  // Filter complaints based on active filters
  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;

    if (activeTab === 'my_complaints' && currentUser.role === 'complainant') {
      return c.complainantId === currentUser.id;
    }
    if (activeTab === 'resolver_queue' && currentUser.role === 'resolver') {
      return c.assignedResolverId === currentUser.id || c.assignedDepartment === currentUser.department;
    }
    if (activeTab === 'resolver_emergencies' && currentUser.role === 'resolver') {
      return c.priority === 'emergency';
    }

    return true;
  });

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased flex flex-col">
      
      {/* Role Switcher Demo Bar */}
      <RoleSwitcher
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
      />

      {/* Primary Top Navbar */}
      <Navbar
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewComplaint={() => setIsSubmitModalOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        emergencyCount={counts.emergencies}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Responsive Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* View Router */}
        <section className="flex-1 min-w-0">
          
          {/* Student / Faculty View */}
          {currentUser.role === 'complainant' && (
            <ComplainantView
              tickets={filteredComplaints}
              currentTab={activeTab}
              onOpenNewComplaint={() => setIsSubmitModalOpen(true)}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
          )}

          {/* Maintenance Staff Resolver View */}
          {currentUser.role === 'resolver' && (
            <ResolverView
              tickets={filteredComplaints}
              currentUser={currentUser}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
            />
          )}

          {/* System Admin View */}
          {currentUser.role === 'admin' && (
            <AdminView
              tickets={filteredComplaints}
              users={users}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              onRefreshData={loadData}
              activeSubTab={activeTab}
            />
          )}

        </section>

      </main>

      {/* Submit Complaint Modal */}
      {isSubmitModalOpen && (
        <SubmitComplaintModal
          currentUser={currentUser}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmitSuccess={() => {
            setIsSubmitModalOpen(false);
            loadData();
          }}
        />
      )}

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          currentUser={currentUser}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={loadData}
        />
      )}

      {/* AI Smart Assistant Modal */}
      {isAIAssistantOpen && (
        <AIAssistantModal
          onClose={() => setIsAIAssistantOpen(false)}
        />
      )}

    </div>
  );
}
