import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  SEED_USERS,
  SEED_COMPLAINTS,
  SEED_ROUTING_RULES,
  SEED_ACTIVITIES,
  SEED_AUDIT_LOGS
} from './src/data/seedData.js';
import {
  ComplaintTicket,
  RoutingRule,
  AuditLog,
  TicketActivity,
  User,
  ComplaintCategory,
  CampusBuilding
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data stores initialized with seed data
let users: User[] = [...SEED_USERS];
let complaints: ComplaintTicket[] = [...SEED_COMPLAINTS];
let routingRules: RoutingRule[] = [...SEED_ROUTING_RULES];
let activitiesStore: Record<string, TicketActivity[]> = { ...SEED_ACTIVITIES };
let auditLogs: AuditLog[] = [...SEED_AUDIT_LOGS];

// Helper: Auto-route ticket based on category and location
function applyAutoRouting(category: ComplaintCategory, location: CampusBuilding): { department: string; resolverId?: string; resolverName?: string } {
  // Find matching rule
  const rule = routingRules.find(r => r.isActive && r.category === category && (r.location === 'All Buildings' || r.location === location));
  
  if (rule) {
    const resolver = users.find(u => u.id === rule.defaultResolverId);
    return {
      department: rule.department,
      resolverId: resolver?.id,
      resolverName: resolver?.name
    };
  }

  // Default fallback department based on category
  const defaultDepartmentMap: Record<ComplaintCategory, string> = {
    'IT & Wi-Fi': 'Campus IT & Wi-Fi Network',
    'Electrical': 'Electrical & Power Services',
    'Plumbing': 'Plumbing & Sanitation Maintenance',
    'Sanitation & Hygiene': 'Plumbing & Sanitation Maintenance',
    'Security & Safety': 'Campus Security & Access',
    'Hostel & Housing': 'Estate & Campus Operations',
    'Infrastructure & Civil': 'Estate & Campus Operations',
    'Mess & Canteen': 'Student Affairs & Dining Services',
    'Library & Labs': 'Campus Academic Resources'
  };

  const dept = defaultDepartmentMap[category] || 'Estate & Campus Operations';
  const defaultResolver = users.find(u => u.role === 'resolver' && u.department === dept);

  return {
    department: dept,
    resolverId: defaultResolver?.id,
    resolverName: defaultResolver?.name
  };
}

// Add system audit log entry
function addAuditLog(actor: string, actorRole: string, action: string, details: string, ticketId?: string) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actor,
    actorRole,
    action,
    details,
    ticketId
  };
  auditLogs.unshift(log);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get Users
  app.get('/api/users', (req, res) => {
    res.json({ users });
  });

  // Get Complaints
  app.get('/api/complaints', (req, res) => {
    const { role, userId, status, category, search, priority } = req.query;

    let result = [...complaints];

    if (role === 'complainant' && userId) {
      result = result.filter(c => c.complainantId === userId);
    } else if (role === 'resolver' && userId) {
      const resolver = users.find(u => u.id === userId);
      if (resolver) {
        result = result.filter(c => c.assignedResolverId === userId || c.assignedDepartment === resolver.department);
      }
    }

    if (status && status !== 'all') {
      result = result.filter(c => c.status === status);
    }

    if (category && category !== 'all') {
      result = result.filter(c => c.category === category);
    }

    if (priority && priority !== 'all') {
      result = result.filter(c => c.priority === priority);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.roomNumber.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ complaints: result });
  });

  // Get Single Complaint & Activities
  app.get('/api/complaints/:id', (req, res) => {
    const ticket = complaints.find(c => c.id === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const activities = activitiesStore[ticket.id] || [];
    res.json({ ticket, activities });
  });

  // Create Complaint
  app.post('/api/complaints', (req, res) => {
    const { title, description, category, location, roomNumber, priority, complainantId, mediaAttachments } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Missing required ticket fields' });
    }

    const complainant = users.find(u => u.id === complainantId) || users[0];

    // Execute automated routing rules
    const routing = applyAutoRouting(category, location);

    const ticketId = `CMP-${new Date().getFullYear()}-${String(complaints.length + 101).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newTicket: ComplaintTicket = {
      id: ticketId,
      title,
      description,
      category,
      location,
      roomNumber: roomNumber || 'General Area',
      priority: priority || 'medium',
      status: routing.resolverId ? 'assigned' : 'submitted',
      complainantId: complainant.id,
      complainantName: complainant.name,
      complainantEmail: complainant.email,
      complainantType: complainant.userType || 'student',
      assignedDepartment: routing.department,
      assignedResolverId: routing.resolverId,
      assignedResolverName: routing.resolverName,
      mediaAttachments: mediaAttachments || [],
      createdAt: now,
      updatedAt: now,
      autoRouted: true
    };

    complaints.unshift(newTicket);

    // Initial activity log
    activitiesStore[ticketId] = [
      {
        id: `act-${Date.now()}-1`,
        ticketId,
        authorName: complainant.name,
        authorRole: complainant.role,
        action: priority === 'emergency' ? 'Submitted Emergency Complaint' : 'Submitted Complaint',
        timestamp: now,
        comment: 'Complaint registered in Smart Campus portal.'
      },
      {
        id: `act-${Date.now()}-2`,
        ticketId,
        authorName: 'System Auto-Router',
        authorRole: 'admin',
        action: `Auto-Routed to ${routing.department}`,
        timestamp: now,
        comment: routing.resolverName ? `Assigned directly to ${routing.resolverName}` : `Queued for ${routing.department} triage`
      }
    ];

    addAuditLog(complainant.name, complainant.role, 'CREATE_TICKET', `Created ${priority.toUpperCase()} priority ticket #${ticketId} at ${location}`, ticketId);

    res.status(201).json({ ticket: newTicket });
  });

  // Update Complaint Status / Assignee / Proof of Fix / Escalation
  app.patch('/api/complaints/:id', (req, res) => {
    const ticketIndex = complaints.findIndex(c => c.id === req.params.id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = complaints[ticketIndex];
    const {
      status,
      priority,
      assignedResolverId,
      assignedDepartment,
      proofOfFixUrl,
      resolutionNotes,
      escalationReason,
      isStalled,
      updaterName,
      updaterRole
    } = req.body;

    const now = new Date().toISOString();
    let updatedTicket = { ...ticket, updatedAt: now };

    const actor = updaterName || 'Staff Resolver';
    const role = updaterRole || 'resolver';

    if (status && status !== ticket.status) {
      updatedTicket.status = status;
      if (status === 'resolved' || status === 'closed') {
        updatedTicket.resolvedAt = now;
      }
      if (status === 'escalated') {
        updatedTicket.escalatedAt = now;
        if (escalationReason) updatedTicket.escalationReason = escalationReason;
      }

      // Record Activity
      if (!activitiesStore[ticket.id]) activitiesStore[ticket.id] = [];
      activitiesStore[ticket.id].push({
        id: `act-${Date.now()}`,
        ticketId: ticket.id,
        authorName: actor,
        authorRole: role,
        action: `Changed Status to ${status.replace('_', ' ').toUpperCase()}`,
        timestamp: now,
        comment: resolutionNotes || escalationReason || `Status updated to ${status}`
      });

      addAuditLog(actor, role, 'UPDATE_STATUS', `Updated #${ticket.id} status to ${status}`, ticket.id);
    }

    if (assignedResolverId && assignedResolverId !== ticket.assignedResolverId) {
      const resolver = users.find(u => u.id === assignedResolverId);
      if (resolver) {
        updatedTicket.assignedResolverId = resolver.id;
        updatedTicket.assignedResolverName = resolver.name;
        if (resolver.department) updatedTicket.assignedDepartment = resolver.department;
        if (updatedTicket.status === 'submitted') updatedTicket.status = 'assigned';

        addAuditLog(actor, role, 'REASSIGN_TICKET', `Assigned #${ticket.id} to ${resolver.name}`, ticket.id);
      }
    }

    if (assignedDepartment && assignedDepartment !== ticket.assignedDepartment) {
      updatedTicket.assignedDepartment = assignedDepartment;
    }

    if (priority) {
      updatedTicket.priority = priority;
    }

    if (proofOfFixUrl) {
      updatedTicket.proofOfFixUrl = proofOfFixUrl;
    }

    if (resolutionNotes) {
      updatedTicket.resolutionNotes = resolutionNotes;
    }

    if (typeof isStalled === 'boolean') {
      updatedTicket.isStalled = isStalled;
    }

    complaints[ticketIndex] = updatedTicket;

    res.json({ ticket: updatedTicket });
  });

  // Post Activity / Comment
  app.post('/api/complaints/:id/activity', (req, res) => {
    const ticket = complaints.find(c => c.id === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { authorName, authorRole, action, comment, attachmentUrl } = req.body;

    const activity: TicketActivity = {
      id: `act-${Date.now()}`,
      ticketId: ticket.id,
      authorName: authorName || 'User',
      authorRole: authorRole || 'complainant',
      action: action || 'Added Comment',
      timestamp: new Date().toISOString(),
      comment,
      attachmentUrl
    };

    if (!activitiesStore[ticket.id]) activitiesStore[ticket.id] = [];
    activitiesStore[ticket.id].push(activity);

    res.status(201).json({ activity });
  });

  // Submit Feedback & Rating
  app.post('/api/complaints/:id/feedback', (req, res) => {
    const ticketIndex = complaints.findIndex(c => c.id === req.params.id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ error: 'Rating (1-5) is required' });
    }

    const ticket = complaints[ticketIndex];
    ticket.feedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date().toISOString()
    };
    ticket.status = 'closed';
    ticket.updatedAt = new Date().toISOString();

    complaints[ticketIndex] = ticket;

    addAuditLog(ticket.complainantName, 'complainant', 'SUBMIT_FEEDBACK', `Rated #${ticket.id} resolution ${rating}/5 stars`, ticket.id);

    res.json({ ticket });
  });

  // Analytics Metrics API
  app.get('/api/analytics', (req, res) => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
    const active = complaints.filter(c => c.status === 'submitted' || c.status === 'assigned' || c.status === 'in_progress').length;
    const escalated = complaints.filter(c => c.status === 'escalated' || c.isStalled).length;
    const emergencies = complaints.filter(c => c.priority === 'emergency').length;

    // Average resolution time in hours
    const resolvedTickets = complaints.filter(c => c.resolvedAt && c.createdAt);
    let avgHours = 4.2; // default benchmark
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((acc, t) => {
        const start = new Date(t.createdAt).getTime();
        const end = new Date(t.resolvedAt!).getTime();
        return acc + Math.max(0, (end - start) / (1000 * 60 * 60));
      }, 0);
      avgHours = parseFloat((totalHours / resolvedTickets.length).toFixed(1));
    }

    // Feedback rating average
    const ratings = complaints.filter(c => c.feedback?.rating).map(c => c.feedback!.rating);
    const avgRating = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 4.8;

    // Problem Zones breakdown
    const problemZonesMap: Record<string, { total: number; high: number }> = {};
    complaints.forEach(c => {
      if (!problemZonesMap[c.location]) {
        problemZonesMap[c.location] = { total: 0, high: 0 };
      }
      problemZonesMap[c.location].total += 1;
      if (c.priority === 'high' || c.priority === 'emergency') {
        problemZonesMap[c.location].high += 1;
      }
    });

    const problemZones = Object.entries(problemZonesMap).map(([location, data]) => ({
      location,
      count: data.total,
      highPriorityCount: data.high
    })).sort((a, b) => b.count - a.count);

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    complaints.forEach(c => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count
    }));

    // Department Stats
    const departmentsList = [
      'Campus IT & Wi-Fi Network',
      'Electrical & Power Services',
      'Plumbing & Sanitation Maintenance',
      'Campus Security & Access',
      'Estate & Campus Operations'
    ];

    const departmentStats = departmentsList.map(dept => {
      const deptTickets = complaints.filter(c => c.assignedDepartment === dept);
      const deptResolved = deptTickets.filter(c => c.status === 'resolved' || c.status === 'closed');
      const resolvers = users.filter(u => u.department === dept && u.role === 'resolver').length;

      return {
        department: dept.replace(' & ', '/').replace(' Maintenance', '').replace(' Network', ''),
        totalTickets: deptTickets.length,
        resolvedTickets: deptResolved.length,
        avgResolutionHours: Math.floor(Math.random() * 5) + 2,
        resolversCount: resolvers || 1
      };
    });

    res.json({
      summary: {
        total,
        active,
        resolved,
        escalated,
        emergencies,
        avgResolutionHours: avgHours,
        avgRating,
        escalationRate: total > 0 ? Math.round((escalated / total) * 100) : 0
      },
      problemZones,
      categoryData,
      departmentStats
    });
  });

  // Routing Rules Management
  app.get('/api/routing-rules', (req, res) => {
    res.json({ rules: routingRules });
  });

  app.post('/api/routing-rules', (req, res) => {
    const { category, location, department, defaultResolverId } = req.body;
    const newRule: RoutingRule = {
      id: `rule-${Date.now()}`,
      category,
      location: location || 'All Buildings',
      department,
      defaultResolverId,
      isActive: true
    };
    routingRules.unshift(newRule);
    addAuditLog('Admin', 'admin', 'CREATE_ROUTING_RULE', `Created automated routing rule for ${category} -> ${department}`);
    res.status(201).json({ rule: newRule });
  });

  app.put('/api/routing-rules/:id', (req, res) => {
    const index = routingRules.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Rule not found' });

    routingRules[index] = { ...routingRules[index], ...req.body };
    res.json({ rule: routingRules[index] });
  });

  // Audit Logs
  app.get('/api/logs', (req, res) => {
    res.json({ logs: auditLogs });
  });

  // Server-Side Gemini AI Triage Helper
  app.post('/api/ai-triage', async (req, res) => {
    const { description, location } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required for AI triage' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an AI Triage Assistant for a Smart University Campus Complaint System.
Analyze the following user complaint and issue location.
Complaint text: "${description}"
Location: "${location || 'Campus'}"

Return JSON ONLY with this structure:
{
  "suggestedCategory": "IT & Wi-Fi" | "Electrical" | "Plumbing" | "Sanitation & Hygiene" | "Security & Safety" | "Hostel & Housing" | "Infrastructure & Civil" | "Mess & Canteen" | "Library & Labs",
  "suggestedPriority": "low" | "medium" | "high" | "emergency",
  "summary": "1-sentence concise title summary",
  "recommendedAction": "Immediate action recommendation for campus maintenance staff",
  "estimatedResolutionHours": number
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      }
    } catch (e) {
      console.error('Gemini AI Triage fallback triggered:', e);
    }

    // Heuristic Fallback if Gemini key is not set or fails
    const descLower = description.toLowerCase();
    let suggestedCategory = 'Infrastructure & Civil';
    let suggestedPriority = 'medium';

    if (descLower.includes('wi-fi') || descLower.includes('wifi') || descLower.includes('internet') || descLower.includes('network') || descLower.includes('router')) {
      suggestedCategory = 'IT & Wi-Fi';
    } else if (descLower.includes('leak') || descLower.includes('water') || descLower.includes('pipe') || descLower.includes('sink') || descLower.includes('toilet')) {
      suggestedCategory = 'Plumbing';
      if (descLower.includes('flood') || descLower.includes('burst')) suggestedPriority = 'emergency';
    } else if (descLower.includes('power') || descLower.includes('light') || descLower.includes('flicker') || descLower.includes('spark') || descLower.includes('short')) {
      suggestedCategory = 'Electrical';
      if (descLower.includes('spark') || descLower.includes('fire')) suggestedPriority = 'emergency';
    } else if (descLower.includes('clean') || descLower.includes('trash') || descLower.includes('smell') || descLower.includes('sanitat')) {
      suggestedCategory = 'Sanitation & Hygiene';
    } else if (descLower.includes('door') || descLower.includes('lock') || descLower.includes('camera') || descLower.includes('guard') || descLower.includes('keycard')) {
      suggestedCategory = 'Security & Safety';
    }

    res.json({
      suggestedCategory,
      suggestedPriority,
      summary: description.slice(0, 60) + (description.length > 60 ? '...' : ''),
      recommendedAction: `Dispatch assigned ${suggestedCategory} technician to ${location || 'site'} for physical diagnostic inspection.`,
      estimatedResolutionHours: suggestedPriority === 'emergency' ? 2 : 12
    });
  });


  // --- VITE / STATIC MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Campus Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
