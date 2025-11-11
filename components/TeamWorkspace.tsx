'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Settings,
  Crown,
  Shield,
  User,
  Mail,
  Calendar,
  BarChart3,
  FileText,
  Zap,
  Lock,
  CheckCircle,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  permissions: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  members: TeamMember[];
}

/**
 * TeamWorkspace Component
 * 
 * Professional team collaboration features:
 * - Team management
 * - Role-based permissions
 * - Member invitations
 * - Activity tracking
 * - Shared content plans
 * - Team analytics
 */
export default function TeamWorkspace() {
  const [team, setTeam] = useState<Team | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');

  // Mock team data
  const mockTeam: Team = {
    id: 'team-1',
    name: 'Content Creators Pro',
    description: 'Professional content creation team',
    ownerId: 'user-1',
    memberCount: 5,
    createdAt: new Date().toISOString(),
    members: [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'owner',
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date().toISOString(),
        permissions: ['all'],
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        permissions: ['create', 'edit', 'delete', 'view'],
      },
      {
        id: 'user-3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'member',
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['create', 'edit', 'view'],
      },
    ],
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'member':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      // In production, send invitation email
      console.log('Inviting:', inviteEmail, 'as', inviteRole);
      setShowInviteModal(false);
      setInviteEmail('');
      // Show success message
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="w-10 h-10" />
                Team Workspace
              </h1>
              <p className="text-blue-200">Collaborate with your team on content creation</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Invite Member
            </button>
          </div>
        </motion.div>

        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-white/60 text-sm mb-2">Team Members</div>
            <div className="text-3xl font-bold text-white">{mockTeam.memberCount}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-white/60 text-sm mb-2">Active Projects</div>
            <div className="text-3xl font-bold text-white">12</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-white/60 text-sm mb-2">Content Plans</div>
            <div className="text-3xl font-bold text-white">48</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-white/60 text-sm mb-2">This Month</div>
            <div className="text-3xl font-bold text-white">156</div>
          </div>
        </div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team Members
          </h2>
          <div className="space-y-4">
            {mockTeam.members.map((member) => (
              <div
                key={member.id}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{member.name}</span>
                        {getRoleIcon(member.role)}
                        <span className={`px-2 py-1 rounded-lg text-xs border ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="text-sm text-white/60">{member.email}</div>
                      <div className="text-xs text-white/40 mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()} • Last active{' '}
                        {new Date(member.lastActive).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                      <Settings className="w-5 h-5 text-white/60" />
                    </button>
                    {member.role !== 'owner' && (
                      <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all">
                        <Lock className="w-5 h-5 text-red-300" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Permissions Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Role Permissions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-white/80 p-4">Permission</th>
                  <th className="text-center text-white/80 p-4">Owner</th>
                  <th className="text-center text-white/80 p-4">Admin</th>
                  <th className="text-center text-white/80 p-4">Member</th>
                  <th className="text-center text-white/80 p-4">Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  'Create Content Plans',
                  'Edit Content Plans',
                  'Delete Content Plans',
                  'Schedule Posts',
                  'Manage Team',
                  'View Analytics',
                  'Export Data',
                ].map((permission) => (
                  <tr key={permission} className="border-b border-white/10">
                    <td className="text-white p-4">{permission}</td>
                    <td className="text-center p-4">
                      <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      {permission !== 'Manage Team' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {['Create Content Plans', 'Edit Content Plans', 'Schedule Posts'].includes(permission) ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {permission === 'View Analytics' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Invite Team Member</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-6 py-3 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all"
                  >
                    Send Invitation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

