import {
  ComplaintTicket,
  User,
  RoutingRule,
  AuditLog,
  TicketActivity
} from '../types';

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.users;
  } catch (e) {
    console.error('API Error, using fallback users:', e);
    const { SEED_USERS } = await import('../data/seedData');
    return SEED_USERS;
  }
}

export async function fetchComplaints(params?: {
  role?: string;
  userId?: string;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}): Promise<ComplaintTicket[]> {
  try {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.userId) query.append('userId', params.userId);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`/api/complaints?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    const data = await res.json();
    return data.complaints;
  } catch (e) {
    console.error('API Error fetching complaints:', e);
    const { SEED_COMPLAINTS } = await import('../data/seedData');
    return SEED_COMPLAINTS;
  }
}

export async function fetchTicketDetail(id: string): Promise<{ ticket: ComplaintTicket; activities: TicketActivity[] }> {
  try {
    const res = await fetch(`/api/complaints/${id}`);
    if (!res.ok) throw new Error('Failed to fetch ticket detail');
    return await res.json();
  } catch (e) {
    console.error('API Error fetching ticket detail:', e);
    const { SEED_COMPLAINTS, SEED_ACTIVITIES } = await import('../data/seedData');
    const ticket = SEED_COMPLAINTS.find(c => c.id === id) || SEED_COMPLAINTS[0];
    const activities = SEED_ACTIVITIES[id] || [];
    return { ticket, activities };
  }
}

export async function createComplaint(payload: {
  title: string;
  description: string;
  category: string;
  location: string;
  roomNumber?: string;
  priority: string;
  complainantId: string;
  mediaAttachments?: string[];
}): Promise<ComplaintTicket> {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create complaint');
  const data = await res.json();
  return data.ticket;
}

export async function updateTicketStatus(id: string, payload: {
  status?: string;
  priority?: string;
  assignedResolverId?: string;
  assignedDepartment?: string;
  proofOfFixUrl?: string;
  resolutionNotes?: string;
  escalationReason?: string;
  isStalled?: boolean;
  updaterName?: string;
  updaterRole?: string;
}): Promise<ComplaintTicket> {
  const res = await fetch(`/api/complaints/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update ticket');
  const data = await res.json();
  return data.ticket;
}

export async function addTicketActivity(id: string, payload: {
  authorName: string;
  authorRole: string;
  action?: string;
  comment: string;
  attachmentUrl?: string;
}): Promise<TicketActivity> {
  const res = await fetch(`/api/complaints/${id}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add activity');
  const data = await res.json();
  return data.activity;
}

export async function submitTicketFeedback(id: string, payload: {
  rating: number;
  comment?: string;
}): Promise<ComplaintTicket> {
  const res = await fetch(`/api/complaints/${id}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  const data = await res.json();
  return data.ticket;
}

export async function fetchAnalyticsData(): Promise<any> {
  try {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (e) {
    console.error('API Error analytics:', e);
    return null;
  }
}

export async function fetchRoutingRules(): Promise<RoutingRule[]> {
  try {
    const res = await fetch('/api/routing-rules');
    if (!res.ok) throw new Error('Failed to fetch routing rules');
    const data = await res.json();
    return data.rules;
  } catch (e) {
    const { SEED_ROUTING_RULES } = await import('../data/seedData');
    return SEED_ROUTING_RULES;
  }
}

export async function createRoutingRule(payload: Partial<RoutingRule>): Promise<RoutingRule> {
  const res = await fetch('/api/routing-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.rule;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const res = await fetch('/api/logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const data = await res.json();
    return data.logs;
  } catch (e) {
    const { SEED_AUDIT_LOGS } = await import('../data/seedData');
    return SEED_AUDIT_LOGS;
  }
}

export async function runAITriage(description: string, location?: string): Promise<{
  suggestedCategory: string;
  suggestedPriority: string;
  summary: string;
  recommendedAction: string;
  estimatedResolutionHours: number;
}> {
  const res = await fetch('/api/ai-triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, location })
  });
  if (!res.ok) throw new Error('AI Triage failed');
  return await res.json();
}
