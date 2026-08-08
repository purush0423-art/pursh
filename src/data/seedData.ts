import { ComplaintTicket, User, RoutingRule, AuditLog, TicketActivity } from '../types';

export const SEED_USERS: User[] = [
  // Students & Staff (Complainants)
  {
    id: 'usr-s1',
    name: 'Alex Rivera',
    email: 'arivera@campus.edu',
    role: 'complainant',
    userType: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    phone: '+1 (555) 012-3456'
  },
  {
    id: 'usr-s2',
    name: 'Dr. Sarah Chen',
    email: 'schen@campus.edu',
    role: 'complainant',
    userType: 'faculty',
    department: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    phone: '+1 (555) 019-8822'
  },
  {
    id: 'usr-s3',
    name: 'Marcus Vance',
    email: 'mvance@campus.edu',
    role: 'complainant',
    userType: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },

  // Maintenance & Resolvers
  {
    id: 'usr-r1',
    name: 'John Miller',
    email: 'jmiller.maint@campus.edu',
    role: 'resolver',
    department: 'Electrical & Power Services',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    phone: '+1 (555) 441-2090'
  },
  {
    id: 'usr-r2',
    name: 'Priya Sharma',
    email: 'psharma.it@campus.edu',
    role: 'resolver',
    department: 'Campus IT & Wi-Fi Network',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    phone: '+1 (555) 882-1011'
  },
  {
    id: 'usr-r3',
    name: 'David Kowalski',
    email: 'dkowalski.plumb@campus.edu',
    role: 'resolver',
    department: 'Plumbing & Sanitation Maintenance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr-r4',
    name: 'Elena Rostova',
    email: 'erostova.sec@campus.edu',
    role: 'resolver',
    department: 'Campus Security & Access',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  },

  // System Admin
  {
    id: 'usr-a1',
    name: 'Chief Admin Robert Taylor',
    email: 'admin.facilities@campus.edu',
    role: 'admin',
    department: 'Estate & Campus Operations',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    phone: '+1 (555) 000-1111'
  }
];

export const SEED_ROUTING_RULES: RoutingRule[] = [
  {
    id: 'rule-1',
    category: 'IT & Wi-Fi',
    location: 'All Buildings',
    department: 'Campus IT & Wi-Fi Network',
    defaultResolverId: 'usr-r2',
    isActive: true
  },
  {
    id: 'rule-2',
    category: 'Electrical',
    location: 'All Buildings',
    department: 'Electrical & Power Services',
    defaultResolverId: 'usr-r1',
    isActive: true
  },
  {
    id: 'rule-3',
    category: 'Plumbing',
    location: 'All Buildings',
    department: 'Plumbing & Sanitation Maintenance',
    defaultResolverId: 'usr-r3',
    isActive: true
  },
  {
    id: 'rule-4',
    category: 'Sanitation & Hygiene',
    location: 'All Buildings',
    department: 'Plumbing & Sanitation Maintenance',
    defaultResolverId: 'usr-r3',
    isActive: true
  },
  {
    id: 'rule-5',
    category: 'Security & Safety',
    location: 'All Buildings',
    department: 'Campus Security & Access',
    defaultResolverId: 'usr-r4',
    isActive: true
  },
  {
    id: 'rule-6',
    category: 'Hostel & Housing',
    location: 'Hostel Block A',
    department: 'Hostel Facilities Team A',
    defaultResolverId: 'usr-r1',
    isActive: true
  }
];

export const SEED_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'CMP-2026-001',
    title: 'Wi-Fi Signal Dropping Repeatedly in CS Lab 3',
    description: 'High packet loss and disconnections on Eduroam AP-Lab3B during peak class hours (10 AM - 2 PM). Impairing practical coding exams.',
    category: 'IT & Wi-Fi',
    location: 'Engineering Block 1',
    roomNumber: 'Lab 3B',
    priority: 'high',
    status: 'in_progress',
    complainantId: 'usr-s2',
    complainantName: 'Dr. Sarah Chen',
    complainantEmail: 'schen@campus.edu',
    complainantType: 'faculty',
    assignedDepartment: 'Campus IT & Wi-Fi Network',
    assignedResolverId: 'usr-r2',
    assignedResolverName: 'Priya Sharma',
    mediaAttachments: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600'
    ],
    createdAt: '2026-08-06T09:15:00Z',
    updatedAt: '2026-08-07T14:20:00Z',
    autoRouted: true
  },
  {
    id: 'CMP-2026-002',
    title: 'Major Water Leakage in 2nd Floor Men Bathroom',
    description: 'Burst pipe underneath sink #2 causing flooding into the hallway near Room 204. Poses slipping hazard for residents.',
    category: 'Plumbing',
    location: 'Hostel Block A',
    roomNumber: 'Floor 2 Washroom',
    priority: 'emergency',
    status: 'in_progress',
    complainantId: 'usr-s1',
    complainantName: 'Alex Rivera',
    complainantEmail: 'arivera@campus.edu',
    complainantType: 'student',
    assignedDepartment: 'Plumbing & Sanitation Maintenance',
    assignedResolverId: 'usr-r3',
    assignedResolverName: 'David Kowalski',
    mediaAttachments: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600'
    ],
    createdAt: '2026-08-07T07:30:00Z',
    updatedAt: '2026-08-07T08:15:00Z',
    autoRouted: true
  },
  {
    id: 'CMP-2026-003',
    title: 'Flickering Overhead LED Panels and Electrical Buzz',
    description: 'The main overhead lighting panel above row 4 flickers intermittently and emits a loud high-pitched hum during study hours.',
    category: 'Electrical',
    location: 'Central Library',
    roomNumber: 'Reading Hall 2A',
    priority: 'medium',
    status: 'submitted',
    complainantId: 'usr-s3',
    complainantName: 'Marcus Vance',
    complainantEmail: 'mvance@campus.edu',
    complainantType: 'student',
    assignedDepartment: 'Electrical & Power Services',
    mediaAttachments: [],
    createdAt: '2026-08-07T11:45:00Z',
    updatedAt: '2026-08-07T11:45:00Z',
    autoRouted: true
  },
  {
    id: 'CMP-2026-004',
    title: 'Main Entrance Automatic Door Sensor Malfunctioning',
    description: 'The sliding glass doors at the main entrance fail to open smoothly, locking students inside during exit peak times.',
    category: 'Security & Safety',
    location: 'Main Student Canteen',
    roomNumber: 'Main Entrance',
    priority: 'high',
    status: 'resolved',
    complainantId: 'usr-s1',
    complainantName: 'Alex Rivera',
    complainantEmail: 'arivera@campus.edu',
    complainantType: 'student',
    assignedDepartment: 'Campus Security & Access',
    assignedResolverId: 'usr-r4',
    assignedResolverName: 'Elena Rostova',
    mediaAttachments: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600'
    ],
    proofOfFixUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
    resolutionNotes: 'Replaced faulty infrared motion sensor circuit board and recalibrated optical delay timer.',
    createdAt: '2026-08-05T14:00:00Z',
    updatedAt: '2026-08-06T16:30:00Z',
    resolvedAt: '2026-08-06T16:30:00Z',
    feedback: {
      rating: 5,
      comment: 'Super fast turnaround! Repaired before lunch rush.',
      submittedAt: '2026-08-06T17:10:00Z'
    },
    autoRouted: true
  },
  {
    id: 'CMP-2026-005',
    title: 'Air Conditioning Failure in Server Rack Room',
    description: 'HVAC Unit 2 in the basement server room is blowing warm air. Temperature reached 31°C; equipment at risk of thermal throttling.',
    category: 'Infrastructure & Civil',
    location: 'Science & Tech Complex',
    roomNumber: 'Basement B-09',
    priority: 'emergency',
    status: 'escalated',
    complainantId: 'usr-s2',
    complainantName: 'Dr. Sarah Chen',
    complainantEmail: 'schen@campus.edu',
    complainantType: 'faculty',
    assignedDepartment: 'Electrical & Power Services',
    assignedResolverId: 'usr-r1',
    assignedResolverName: 'John Miller',
    mediaAttachments: [],
    escalatedAt: '2026-08-07T12:00:00Z',
    escalationReason: 'Requires external specialized industrial HVAC technician and compressor replacement budget approval.',
    createdAt: '2026-08-06T18:00:00Z',
    updatedAt: '2026-08-07T12:00:00Z',
    autoRouted: true,
    isStalled: true
  },
  {
    id: 'CMP-2026-006',
    title: 'Garbage Overflow near Girls Hostel Waste Bay',
    description: 'Bins outside Block C are uncleaned for 2 days causing foul odor and stray animal gathering near exit pathway.',
    category: 'Sanitation & Hygiene',
    location: 'Hostel Block C (Girls)',
    roomNumber: 'Outer Courtyard',
    priority: 'medium',
    status: 'assigned',
    complainantId: 'usr-s1',
    complainantName: 'Alex Rivera',
    complainantEmail: 'arivera@campus.edu',
    complainantType: 'student',
    assignedDepartment: 'Plumbing & Sanitation Maintenance',
    assignedResolverId: 'usr-r3',
    assignedResolverName: 'David Kowalski',
    mediaAttachments: [],
    createdAt: '2026-08-07T10:00:00Z',
    updatedAt: '2026-08-07T10:15:00Z',
    autoRouted: true
  }
];

export const SEED_ACTIVITIES: Record<string, TicketActivity[]> = {
  'CMP-2026-001': [
    {
      id: 'act-1',
      ticketId: 'CMP-2026-001',
      authorName: 'Dr. Sarah Chen',
      authorRole: 'complainant',
      action: 'Submitted Complaint',
      timestamp: '2026-08-06T09:15:00Z',
      comment: 'Exam week is approaching; need quick resolution.'
    },
    {
      id: 'act-2',
      ticketId: 'CMP-2026-001',
      authorName: 'System Router',
      authorRole: 'admin',
      action: 'Auto-Routed to Campus IT',
      timestamp: '2026-08-06T09:15:05Z',
      comment: 'Matched Rule: Category IT & Wi-Fi -> Campus IT & Wi-Fi Network'
    },
    {
      id: 'act-3',
      ticketId: 'CMP-2026-001',
      authorName: 'Priya Sharma',
      authorRole: 'resolver',
      action: 'Status Updated: In Progress',
      timestamp: '2026-08-07T14:20:00Z',
      comment: 'Inspected AP-Lab3B on floor 3. Firmware upgrade and channel conflict reboot scheduled today at 5 PM.'
    }
  ],
  'CMP-2026-002': [
    {
      id: 'act-4',
      ticketId: 'CMP-2026-002',
      authorName: 'Alex Rivera',
      authorRole: 'complainant',
      action: 'Submitted Emergency Complaint',
      timestamp: '2026-08-07T07:30:00Z',
      comment: 'Water is accumulating quickly!'
    },
    {
      id: 'act-5',
      ticketId: 'CMP-2026-002',
      authorName: 'David Kowalski',
      authorRole: 'resolver',
      action: 'Dispatched to Location',
      timestamp: '2026-08-07T08:15:00Z',
      comment: 'Shut off main riser valve #B2. Replacing section of copper pipe now.'
    }
  ]
};

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-08-07T12:00:00Z',
    actor: 'John Miller',
    actorRole: 'resolver',
    action: 'FLAGGED_ESCALATION',
    details: 'Ticket CMP-2026-005 escalated due to missing industrial HVAC parts.',
    ticketId: 'CMP-2026-005'
  },
  {
    id: 'log-100',
    timestamp: '2026-08-07T10:15:00Z',
    actor: 'System Auto-Router',
    actorRole: 'admin',
    action: 'AUTO_ROUTED_TICKET',
    details: 'Routed CMP-2026-006 to Sanitation Dept based on active category rule.',
    ticketId: 'CMP-2026-006'
  },
  {
    id: 'log-099',
    timestamp: '2026-08-06T16:30:00Z',
    actor: 'Elena Rostova',
    actorRole: 'resolver',
    action: 'RESOLVED_TICKET',
    details: 'Resolved CMP-2026-004 with proof attachment.',
    ticketId: 'CMP-2026-004'
  }
];
