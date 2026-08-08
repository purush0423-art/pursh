import React, { useState, useEffect } from 'react';
import { ComplaintTicket, TicketActivity, User, UserRole } from '../types';
import { fetchTicketDetail, updateTicketStatus, addTicketActivity, submitTicketFeedback } from '../services/api';
import { TicketStatusBadge } from './TicketStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  X,
  MapPin,
  Calendar,
  User as UserIcon,
  Wrench,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Star,
  Image as ImageIcon,
  Clock,
  ShieldAlert,
  Loader2,
  FileCheck
} from 'lucide-react';

interface TicketDetailModalProps {
  ticketId: string;
  currentUser: User;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticketId, currentUser, onClose, onTicketUpdated }) => {
  const [ticket, setTicket] = useState<ComplaintTicket | null>(null);
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Resolver
  const [newStatus, setNewStatus] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [showEscalationForm, setShowEscalationForm] = useState(false);

  // Form state for Feedback
  const [starRating, setStarRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Comment thread
  const [commentInput, setCommentInput] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchTicketDetail(ticketId);
      setTicket(data.ticket);
      setActivities(data.activities || []);
      setNewStatus(data.ticket.status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [ticketId]);

  if (loading || !ticket) {
    return (
      <div id="ticket-detail-loading" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 flex items-center gap-3 text-slate-700 font-semibold shadow-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Loading ticket details...</span>
        </div>
      </div>
    );
  }

  // Handle Resolver Status Update
  const handleUpdateStatus = async (statusToSet: string) => {
    setSubmittingAction(true);
    try {
      await updateTicketStatus(ticket.id, {
        status: statusToSet,
        resolutionNotes: resolutionNotes || undefined,
        proofOfFixUrl: proofUrl || undefined,
        updaterName: currentUser.name,
        updaterRole: currentUser.role
      });
      await loadDetail();
      onTicketUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Escalation Flag
  const handleEscalate = async () => {
    if (!escalationReason.trim()) return;
    setSubmittingAction(true);
    try {
      await updateTicketStatus(ticket.id, {
        status: 'escalated',
        escalationReason,
        isStalled: true,
        updaterName: currentUser.name,
        updaterRole: currentUser.role
      });
      setShowEscalationForm(false);
      await loadDetail();
      onTicketUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setSubmittingAction(true);
    try {
      await addTicketActivity(ticket.id, {
        authorName: currentUser.name,
        authorRole: currentUser.role,
        action: 'Comment Added',
        comment: commentInput
      });
      setCommentInput('');
      await loadDetail();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Student Feedback
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await submitTicketFeedback(ticket.id, {
        rating: starRating,
        comment: feedbackComment
      });
      await loadDetail();
      onTicketUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingAction(false);
    }
  };

  const steps = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === ticket.status);

  return (
    <div id="ticket-detail-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div id="ticket-detail-modal-card" className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Top Banner Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-400/30">
                #{ticket.id}
              </span>
              <PriorityBadge priority={ticket.priority} />
              <TicketStatusBadge status={ticket.status} />
              {ticket.isStalled && (
                <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Flagged Stalled
                </span>
              )}
            </div>

            <button
              id="close-ticket-detail-btn"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-white mt-3">
            {ticket.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {ticket.location} ({ticket.roomNumber})
            </span>
            <span>Category: <strong className="text-white">{ticket.category}</strong></span>
            <span>Reported: {new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Live Step Progress Timeline Bar */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Ticket Workflow Lifecycle
          </div>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-0 -translate-y-1/2" />
            
            {steps.map((step, idx) => {
              const isPassed = currentStepIndex >= idx || ticket.status === 'closed';
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 ${
                      isCurrent ? 'text-indigo-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Issue Details & Attachments */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Issue Description
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>

            {ticket.mediaAttachments && ticket.mediaAttachments.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Complaint Attachments:
                </div>
                <div className="flex flex-wrap gap-2">
                  {ticket.mediaAttachments.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-slate-300 w-32 h-24 hover:opacity-90">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Proof of Fix & Resolution Notes if present */}
          {ticket.proofOfFixUrl && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2">
              <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-800">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Proof of Fix & Maintenance Report
              </div>
              <p className="text-xs">{ticket.resolutionNotes}</p>
              <div className="mt-2">
                <a href={ticket.proofOfFixUrl} target="_blank" rel="noreferrer" className="inline-block rounded-xl overflow-hidden border border-emerald-300 w-36 h-28">
                  <img src={ticket.proofOfFixUrl} alt="Proof of fix" className="w-full h-full object-cover" />
                </a>
              </div>
            </div>
          )}

          {/* Escalation Warning Banner */}
          {ticket.escalationReason && (
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-purple-900 space-y-1">
              <div className="font-bold text-xs flex items-center gap-1 text-purple-800">
                <AlertTriangle className="w-4 h-4 text-purple-600" /> Escalation Reason:
              </div>
              <p className="text-xs">{ticket.escalationReason}</p>
            </div>
          )}

          {/* Complainant & Assignee Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Complainant</div>
                <div className="font-semibold text-slate-800">{ticket.complainantName}</div>
                <div className="text-[10px] text-slate-500">{ticket.complainantEmail}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Assigned Resolver</div>
                <div className="font-semibold text-slate-800">{ticket.assignedResolverName || 'Unassigned'}</div>
                <div className="text-[10px] text-slate-500">{ticket.assignedDepartment}</div>
              </div>
            </div>
          </div>

          {/* RESOLVER ACTIONS SECTION (Visible for Resolver & Admin) */}
          {(currentUser.role === 'resolver' || currentUser.role === 'admin') && ticket.status !== 'closed' && (
            <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-3">
              <div className="font-bold text-xs text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-600" /> Resolver Management Tools
                </span>
                <button
                  type="button"
                  id="toggle-escalation-btn"
                  onClick={() => setShowEscalationForm(!showEscalationForm)}
                  className="text-[11px] text-purple-700 font-bold hover:underline flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Flag / Request Escalation
                </button>
              </div>

              {/* Status Change Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  id="status-btn-in-progress"
                  onClick={() => handleUpdateStatus('in_progress')}
                  disabled={submittingAction}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Mark "In Progress"
                </button>

                <button
                  type="button"
                  id="status-btn-resolved"
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={submittingAction}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Mark "Resolved"
                </button>
              </div>

              {/* Resolution Notes & Proof Upload Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Internal Resolution Notes
                  </label>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g., Replaced circuit breaker in Substation B..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Proof of Fix Photo URL
                  </label>
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Escalation Sub-Form */}
              {showEscalationForm && (
                <div className="mt-3 p-3 bg-purple-100/80 border border-purple-300 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-purple-900 block">
                    Escalation Details / Resource Request
                  </label>
                  <textarea
                    rows={2}
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    placeholder="Explain why this ticket is stalled or requires admin/budget escalation..."
                    className="w-full px-3 py-2 text-xs bg-white border border-purple-200 rounded-lg"
                  />
                  <button
                    type="button"
                    id="submit-escalation-btn"
                    onClick={handleEscalate}
                    disabled={submittingAction}
                    className="px-3 py-1 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800"
                  >
                    Confirm Escalation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* COMPLAINANT FEEDBACK & RATING SECTION (If Resolved & Complainant) */}
          {ticket.status === 'resolved' && currentUser.role === 'complainant' && !ticket.feedback && (
            <form onSubmit={handleSubmitRating} className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <div className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Rate Resolution Quality
              </div>
              <p className="text-xs text-slate-600">
                This complaint was marked resolved by maintenance. Please rate your satisfaction to close the ticket.
              </p>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    id={`rate-star-${star}`}
                    onClick={() => setStarRating(star)}
                    className="p-1 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= starRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">{starRating} / 5 Stars</span>
              </div>

              <input
                type="text"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Leave feedback comment for maintenance team (optional)..."
                className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-xl"
              />

              <button
                type="submit"
                id="submit-rating-btn"
                disabled={submittingAction}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs cursor-pointer"
              >
                Submit Feedback & Close Ticket
              </button>
            </form>
          )}

          {/* Submitted Feedback display if present */}
          {ticket.feedback && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-1">
              <div className="font-bold text-xs text-emerald-900 flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: ticket.feedback.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <span>Feedback Provided ({ticket.feedback.rating}/5 Stars)</span>
              </div>
              {ticket.feedback.comment && <p className="text-xs text-slate-700 italic">"{ticket.feedback.comment}"</p>}
            </div>
          )}

          {/* Activity / Comment Stream */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Activity History & Discussions
            </div>

            <div className="space-y-3 mb-4">
              {activities.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      {act.authorName} <span className="text-[10px] text-slate-400 capitalize">({act.authorRole})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-indigo-700">{act.action}</div>
                  {act.comment && <p className="text-slate-600">{act.comment}</p>}
                </div>
              ))}
            </div>

            {/* Comment Box */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                id="comment-input"
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Post an update or question about this ticket..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                id="send-comment-btn"
                disabled={submittingAction || !commentInput.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs flex items-center gap-1 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
