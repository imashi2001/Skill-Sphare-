import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Crown, UserPlus, UserMinus } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../config/axios';
import { Link } from 'react-router-dom';

const GroupView = () => {
  const [adminGroups, setAdminGroups] = useState([]);
  const [memberGroups, setMemberGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [memberError, setMemberError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        const [adminResponse, memberResponse] = await Promise.all([
          api.get('/api/groups/admin'),
          api.get('/api/groups/member')
        ]);
        
        // Ensure we're setting arrays
        setAdminGroups(Array.isArray(adminResponse.data) ? adminResponse.data : []);
        setMemberGroups(Array.isArray(memberResponse.data) ? memberResponse.data : []);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setAdminGroups([]); // Set empty array on error
        setMemberGroups([]); // Set empty array on error
        Swal.fire('Error', 'Failed to fetch groups', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    if (showMemberModal && selectedGroup) {
      fetchMembers();
      fetchUsers();
    }
  }, [showMemberModal, selectedGroup]);

  const fetchMembers = async () => {
    if (!selectedGroup) return;
    
    setIsLoadingMembers(true);
    try {
      const response = await api.get(`/api/groups/${selectedGroup.id}/members`);
      setGroupMembers(response.data);
      setMemberError(null);
    } catch (error) {
      console.error('Error fetching group members:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch group members';
      setMemberError(errorMessage);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        setMemberError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load users';
      setMemberError(errorMessage);
      setUsers([]); // Clear users on error
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newGroup.name || newGroup.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters long';
    } else if (newGroup.name.length > 100) {
      newErrors.name = 'Group name must be less than 100 characters';
    }
    if (newGroup.description && newGroup.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await api.post('/api/groups', newGroup);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '' });
      setErrors({});
      fetchGroups();
      Swal.fire('Success', 'Group created successfully', 'success');
    } catch (error) {
      console.error('Error creating group:', error);
      if (error.response?.data) {
        // Handle validation errors
        const errorMessage = Object.entries(error.response.data)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        Swal.fire('Validation Error', errorMessage, 'error');
      } else {
        Swal.fire('Error', 'Failed to create group', 'error');
      }
    }
  };

  const handleManageMembers = async (group) => {
    setSelectedGroup(group);
    setMemberError(null);
    setShowMemberModal(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setMemberError('Please select a user');
      return;
    }

    setMemberError(null);
    setIsLoadingMembers(true);

    try {
      await api.post(`/api/groups/${selectedGroup.id}/members`, {
        email: selectedUser
      });
      setSelectedUser('');
      await fetchMembers();
      Swal.fire('Success', 'Member added successfully', 'success');
    } catch (error) {
      console.error('Error adding member:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add member';
      setMemberError(errorMessage);
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const result = await Swal.fire({
        title: 'Remove Member',
        text: 'Are you sure you want to remove this member?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, remove member'
      });

      if (result.isConfirmed) {
        setIsLoadingMembers(true);
        await api.delete(`/api/groups/${selectedGroup.id}/members/${memberId}`);
        await fetchMembers();
        Swal.fire('Success', 'Member removed successfully', 'success');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      const errorMessage = error.response?.data?.error || 'Failed to remove member';
      setMemberError(errorMessage);
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Groups</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow hover:bg-indigo-700 transition font-semibold text-lg"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </motion.button>
        </div>

        {/* Admin Groups */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Groups I Admin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(adminGroups) && adminGroups.map((group) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-7 border border-gray-200 hover:shadow-xl transition"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-4 min-h-[40px]">{group.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-base text-gray-500">
                    <Users className="w-5 h-5" />
                    <span>{group.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleManageMembers(group)}
                      className="flex items-center gap-1 text-indigo-700 hover:text-indigo-900 text-base font-medium px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      <UserPlus className="w-5 h-5" />
                      Manage
                    </button>
                    <Link to={`/groups/${group.id}/chat`}>
                      <button className="flex items-center gap-1 text-green-700 hover:text-green-900 text-base font-medium px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition">
                        Chat
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
            {Array.isArray(adminGroups) && adminGroups.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                You haven't created any groups yet
              </div>
            )}
          </div>
        </div>

        {/* Member Groups */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Groups I'm In
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(memberGroups) && memberGroups.map((group) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-7 border border-gray-200 hover:shadow-xl transition"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-4 min-h-[40px]">{group.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-base text-gray-500">
                    <Users className="w-5 h-5" />
                    <span>{group.memberCount} members</span>
                  </div>
                  <Link to={`/groups/${group.id}/chat`}>
                    <button className="flex items-center gap-1 text-green-700 hover:text-green-900 text-base font-medium px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition">
                      Chat
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
            {Array.isArray(memberGroups) && memberGroups.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                You haven't joined any groups yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Management Modal */}
      {showMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Members - {selectedGroup.name}
              </h2>
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setSelectedGroup(null);
                  setGroupMembers([]);
                  setNewMemberEmail('');
                  setMemberError(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                title="Close"
              >
                ✕
              </button>
            </div>

            {memberError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {memberError}
              </div>
            )}

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-base font-semibold mb-2">
                  Add Member
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className={`px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-base ${isLoadingMembers ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoadingMembers}
              >
                {isLoadingMembers ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Add Member'
                )}
              </button>
            </form>

            {/* Members List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoadingMembers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                          <span className="text-indigo-700 font-bold text-lg">
                            {member.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                        title="Remove member"
                        disabled={isLoadingMembers}
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {groupMembers.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No members in this group yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-gray-700 text-base font-semibold mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => {
                    setNewGroup({ ...newGroup, name: e.target.value });
                    if (errors.name) {
                      setErrors({ ...errors, name: null });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base ${errors.name ? 'border-red-500' : ''}`}
                  required
                  minLength={3}
                  maxLength={100}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-base font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => {
                    setNewGroup({ ...newGroup, description: e.target.value });
                    if (errors.description) {
                      setErrors({ ...errors, description: null });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base ${errors.description ? 'border-red-500' : ''}`}
                  rows="3"
                  maxLength={1000}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  {newGroup.description.length}/1000 characters
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setErrors({});
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-base"
                >
                  Create Group
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GroupView;