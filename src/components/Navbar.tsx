import React from 'react';
import { User } from '../types';
import { Building2, Search, PlusCircle, Sparkles, Bell, Shield, Wrench, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewComplaint: () => void;
  onOpenAIAssistant: () => void;
  emergencyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onOpenNewComplaint,
  onOpenAIAssistant,
  emergencyCount
}) => {
  const getRoleIcon = () => {
    switch (currentUser.role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-indigo-600" />;
      case 'resolver':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <header id="main-navbar" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  SmartCampus<span className="text-indigo-600 font-extrabold">Care</span>
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase tracking-wider">
                  Facility Ops
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Complaint Management & Automated Routing System
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-complaints-input"
                type="text"
                placeholder="Search ticket ID, building, room, issue description..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Button */}
            <button
              id="open-ai-assistant-btn"
              onClick={onOpenAIAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 hover:from-purple-100 hover:to-indigo-100 border border-indigo-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
              <span className="hidden sm:inline">AI Smart Helper</span>
            </button>

            {/* Submit Complaint Button */}
            {currentUser.role === 'complainant' && (
              <button
                id="submit-complaint-nav-btn"
                onClick={onOpenNewComplaint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint</span>
              </button>
            )}

            {/* Emergency Indicator Badge */}
            {emergencyCount > 0 && (
              <div
                id="emergency-counter-badge"
                title={`${emergencyCount} active emergency tickets`}
                className="relative p-2 rounded-lg bg-red-50 text-red-700 border border-red-200"
              >
                <Bell className="w-4 h-4 text-red-600 animate-bounce" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {emergencyCount}
                </span>
              </div>
            )}

            {/* User Profile Card */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  {currentUser.name}
                  {getRoleIcon()}
                </div>
                <div className="text-[10px] text-slate-500 font-medium capitalize">
                  {currentUser.role} {currentUser.department ? `• ${currentUser.department}` : ''}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
