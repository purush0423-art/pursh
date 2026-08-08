import React, { useState } from 'react';
import { ComplaintCategory, CampusBuilding, Priority, User } from '../types';
import { runAITriage } from '../services/api';
import { X, Sparkles, Upload, AlertOctagon, CheckCircle, Image as ImageIcon, MapPin, Building, Flame, Loader2 } from 'lucide-react';

interface SubmitComplaintModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Hostel & Housing',
  'IT & Wi-Fi',
  'Infrastructure & Civil',
  'Sanitation & Hygiene',
  'Security & Safety',
  'Mess & Canteen',
  'Electrical',
  'Plumbing',
  'Library & Labs'
];

const BUILDINGS: CampusBuilding[] = [
  'Hostel Block A',
  'Hostel Block B',
  'Hostel Block C (Girls)',
  'Engineering Block 1',
  'Science & Tech Complex',
  'Central Library',
  'Main Student Canteen',
  'Sports Complex & Gym',
  'Administrative Hub',
  'Research Park'
];

const SAMPLE_MEDIA_PHOTOS = [
  { label: 'Wi-Fi / Network Issue', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600' },
  { label: 'Water Leak / Pipe', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600' },
  { label: 'Broken Fixture / Door', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600' }
];

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({ currentUser, onClose, onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Hostel & Housing');
  const [location, setLocation] = useState<CampusBuilding>('Hostel Block A');
  const [roomNumber, setRoomNumber] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRunAIAutoTriage = async () => {
    if (!description.trim()) {
      setErrorMessage('Please type a brief description first so the AI can analyze it.');
      return;
    }

    setErrorMessage('');
    setAiLoading(true);
    try {
      const res = await runAITriage(description, location);
      setAiResult(res);
      if (res.summary) setTitle(res.summary);
      if (res.suggestedCategory && CATEGORIES.includes(res.suggestedCategory as ComplaintCategory)) {
        setCategory(res.suggestedCategory as ComplaintCategory);
      }
      if (res.suggestedPriority) setPriority(res.suggestedPriority as Priority);
    } catch (e) {
      console.error(e);
      setErrorMessage('AI triage failed to run. You can fill the details manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleSamplePhoto = (url: string) => {
    if (selectedPhotos.includes(url)) {
      setSelectedPhotos(selectedPhotos.filter(p => p !== url));
    } else {
      setSelectedPhotos([...selectedPhotos, url]);
    }
  };

  const handleAddCustomPhoto = () => {
    if (customPhotoInput.trim() && !selectedPhotos.includes(customPhotoInput)) {
      setSelectedPhotos([...selectedPhotos, customPhotoInput.trim()]);
      setCustomPhotoInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Title and Issue Description are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { createComplaint } = await import('../services/api');
      await createComplaint({
        title,
        description,
        category,
        location,
        roomNumber: roomNumber.trim() || 'General Area',
        priority,
        complainantId: currentUser.id,
        mediaAttachments: selectedPhotos
      });
      onSubmitSuccess();
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to submit complaint. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div id="submit-complaint-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div id="submit-complaint-modal-card" className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-[11px] font-bold px-2 py-0.5 rounded border border-indigo-400/30 uppercase">
                New Ticket
              </span>
              <h2 className="text-lg font-bold">Register Campus Complaint</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Submitting as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>

          <button
            id="close-submit-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Description first with AI Assist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                Issue Description <span className="text-red-500">*</span>
              </label>
              
              <button
                type="button"
                id="run-ai-triage-btn"
                onClick={handleRunAIAutoTriage}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Auto-Triage</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="complaint-description-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail (e.g. Water leaking under sink in Block A floor 2 bathroom, or Wi-Fi dropping in Lab 3)..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />

            {aiResult && (
              <div className="mt-2 p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs space-y-1">
                <div className="font-bold flex items-center gap-1 text-purple-700">
                  <Sparkles className="w-3.5 h-3.5" /> AI Triage Recommendation:
                </div>
                <p><strong>Suggested Action:</strong> {aiResult.recommendedAction}</p>
                <p><strong>Estimated SLA Time:</strong> ~{aiResult.estimatedResolutionHours} Hours</p>
              </div>
            )}
          </div>

          {/* Complaint Title */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1.5">
              Ticket Title / Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="complaint-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Burst pipe under sink causing floor flooding"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                Category
              </label>
              <select
                id="complaint-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-500" /> Building / Campus Zone
              </label>
              <select
                id="complaint-building-select"
                value={location}
                onChange={(e) => setLocation(e.target.value as CampusBuilding)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {BUILDINGS.map(bldg => (
                  <option key={bldg} value={bldg}>{bldg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Number & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Room / Specific Location
              </label>
              <input
                id="complaint-room-input"
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., Room 302 / Lab 3B / Floor 2 Corridor"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                {(['low', 'medium', 'high', 'emergency'] as Priority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    id={`priority-radio-${p}`}
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg capitalize transition-all ${
                      priority === p
                        ? p === 'emergency'
                          ? 'bg-red-600 text-white shadow-xs'
                          : p === 'high'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p === 'emergency' ? '🚨' : ''} {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Media Photo Upload Attachment */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> Photo Evidence / Attachments (Optional)
            </label>

            {/* Quick Demo Photo Selectors */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {SAMPLE_MEDIA_PHOTOS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleSamplePhoto(sample.url)}
                  className={`relative rounded-xl overflow-hidden border-2 text-left text-[10px] transition-all group ${
                    selectedPhotos.includes(sample.url)
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={sample.url} alt="" className="w-full h-16 object-cover" />
                  <div className="p-1 bg-slate-900/80 text-white font-medium truncate">
                    {sample.label}
                  </div>
                  {selectedPhotos.includes(sample.url) && (
                    <span className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                      <CheckCircle className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom URL or file link input */}
            <div className="flex gap-2">
              <input
                id="custom-photo-url-input"
                type="url"
                value={customPhotoInput}
                onChange={(e) => setCustomPhotoInput(e.target.value)}
                placeholder="Or paste an image URL (e.g. https://...)"
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                Add Image
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-submit-modal-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-complaint-final-btn"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Ticket</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
