import React from 'react';
import { User, UserRole } from '../types';
import { UserCheck, Wrench, Shield, Check } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentUser, allUsers, onSelectUser }) => {
  const complainants = allUsers.filter(u => u.role === 'complainant');
  const resolvers = allUsers.filter(u => u.role === 'resolver');
  const admins = allUsers.filter(u => u.role === 'admin');

  return (
    <div id="role-switcher-banner" className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            <UserCheck className="w-3.5 h-3.5" /> Demo Switcher
          </span>
          <span className="text-slate-400 hidden sm:inline">Active Persona:</span>
          <span className="font-semibold text-white flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            <img src={currentUser.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
            {currentUser.name} ({currentUser.role.toUpperCase()} {currentUser.userType ? `- ${currentUser.userType}` : ''})
          </span>
        </div>

        {/* Role Quick Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-[11px] font-medium hidden lg:inline">Switch Role:</span>

          {/* Complainants group */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700/80">
            <span className="text-slate-400 px-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" /> User
            </span>
            {complainants.map(u => (
              <button
                key={u.id}
                id={`switch-user-${u.id}`}
                onClick={() => onSelectUser(u)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  currentUser.id === u.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {u.name.split(' ')[0]}
                {currentUser.id === u.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>

          {/* Resolvers group */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700/80">
            <span className="text-slate-400 px-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Wrench className="w-3 h-3 text-amber-400" /> Resolver
            </span>
            {resolvers.slice(0, 3).map(u => (
              <button
                key={u.id}
                id={`switch-user-${u.id}`}
                onClick={() => onSelectUser(u)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  currentUser.id === u.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {u.name.split(' ')[0]}
                {currentUser.id === u.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>

          {/* Admin group */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700/80">
            <span className="text-slate-400 px-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-indigo-400" /> Admin
            </span>
            {admins.map(u => (
              <button
                key={u.id}
                id={`switch-user-${u.id}`}
                onClick={() => onSelectUser(u)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  currentUser.id === u.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Admin
                {currentUser.id === u.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
