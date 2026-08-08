export type UserRole = 'complainant' | 'resolver' | 'admin';

export type ComplainantType = 'student' | 'faculty' | 'staff';

export type Priority = 'low' | 'medium' | 'high' | 'emergency';

export type TicketStatus = 'submitted' | 'assigned' | 'in_progress' | 'resolved' | 'escalated' | 'closed';

export type ComplaintCategory =
  | 'Hostel & Housing'
  | 'IT & Wi-Fi'
  | 'Infrastructure & Civil'
  | 'Sanitation & Hygiene'
  | 'Security & Safety'
  | 'Mess & Canteen'
  | 'Electrical'
  | 'Plumbing'
  | 'Library & Labs';

export type CampusBuilding =
  | 'Hostel Block A'
  | 'Hostel Block B'
  | 'Hostel Block C (Girls)'
  | 'Engineering Block 1'
  | 'Science & Tech Complex'
  | 'Central Library'
  | 'Main Student Canteen'
  | 'Sports Complex & Gym'
  | 'Administrative Hub'
  | 'Research Park';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  userType?: ComplainantType;
  department?: string;
  avatar: string;
  phone?: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  authorName: string;
  authorRole: UserRole;
  action: string;
  timestamp: string;
  comment?: string;
  attachmentUrl?: string;
}

export interface TicketFeedback {
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface ComplaintTicket {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: CampusBuilding;
  roomNumber: string;
  priority: Priority;
  status: TicketStatus;
  complainantId: string;
  complainantName: string;
  complainantEmail: string;
  complainantType: ComplainantType;
  assignedDepartment: string;
  assignedResolverId?: string;
  assignedResolverName?: string;
  mediaAttachments: string[];
  proofOfFixUrl?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  escalatedAt?: string;
  escalationReason?: string;
  feedback?: TicketFeedback;
  autoRouted: boolean;
  isStalled?: boolean;
}

export interface RoutingRule {
  id: string;
  category: ComplaintCategory;
  location: CampusBuilding | 'All Buildings';
  department: string;
  defaultResolverId?: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details: string;
  ticketId?: string;
}

export interface DepartmentStats {
  department: string;
  totalTickets: number;
  resolvedTickets: number;
  avgResolutionHours: number;
  resolversCount: number;
}

export interface ProblemZoneStats {
  location: CampusBuilding;
  count: number;
  highPriorityCount: number;
}
