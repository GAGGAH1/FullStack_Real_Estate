import React, { useState } from 'react';
import axios from 'axios';
import { Shield, User, ArrowUp, ArrowDown, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';

export default function UserManagement({ users, currentUser, onRoleChange, onUserDelete }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleRoleToggle = async (userId, currentRole) => {
    setError('');
    let nextRole = 'buyer';
    if (currentRole === 'buyer') nextRole = 'agent';
    else if (currentRole === 'agent') nextRole = 'admin';
    else if (currentRole === 'admin') nextRole = 'buyer';

    if (userId === currentUser.id) {
      setError('Lockout Protection: You cannot change your own admin role.');
      return;
    }

    setUpdatingId(userId);

    try {
      const res = await axios.put(`/api/users/${userId}/role`, 
        { role: nextRole },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (onRoleChange) onRoleChange(userId, nextRole);
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Failed to connect.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      setError('Lockout Protection: You cannot delete your own admin account.');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this user? All their credentials will be revoked.')) {
      return;
    }

    setDeletingId(userId);
    setError('');

    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (onUserDelete) onUserDelete(userId);
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div id="user_management_panel" className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-50 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-1.5 leading-none">
            <Shield size={16} className="text-slate-900" />
            Registered Platform Users
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Review user registry and assign platform credentials (RBAC controls)
          </p>
        </div>
      </div>

      {error && (
        <div id="user_error_banner" className="m-5 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-1.5">
          <ShieldAlert size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="py-3 px-5">User ID</th>
              <th className="py-3 px-5">Name / Email</th>
              <th className="py-3 px-5">Role Badge</th>
              <th className="py-3 px-5">Joined Date</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {users.map(u => {
              const isMe = u.id === currentUser.id;

              return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[10px] text-gray-400">
                    {u.id}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {u.name}
                      {isMe && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border ${
                      u.role === 'admin' 
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : u.role === 'agent'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-green-50 text-green-700 border-green-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-5 text-right flex justify-end gap-1.5">
                    {/* Rotate Role Button */}
                    <button
                      id={`btn_toggle_role_${u.id}`}
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      disabled={updatingId === u.id || isMe}
                      className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-gray-200 hover:border-slate-300 font-bold text-[10px] uppercase py-1.5 px-2.5 rounded-lg text-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                      title="Promote / Cycle role credentials"
                    >
                      Cycle Role
                    </button>

                    {/* Delete Button */}
                    <button
                      id={`btn_delete_user_${u.id}`}
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={deletingId === u.id || isMe}
                      className="p-1.5 border border-gray-200 hover:border-rose-100 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50 cursor-pointer"
                      title="Revoke and delete user credentials"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
