import { useState } from 'react';
import { Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
// import { httpsCallable } from 'firebase/functions';
// import { functions } from '../../services/firebase';

interface User {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'active';
  tempPassword: string;
  createdAt: string;
}

export default function UsersTab({ apartmentId }: { apartmentId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'manager',
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const tempPassword = generateTempPassword();
      
      // Call Firebase Cloud Function
      const createUser = httpsCallable(functions, 'createUserForApartment');
      const response = await createUser({
        email: formData.email,
        role: formData.role,
        apartmentId: apartmentId,
        tempPassword: tempPassword,
      });

      const result = response.data as any;

      // Add to local state
      const newUser: User = {
        id: result.uid,
        email: formData.email,
        role: formData.role,
        status: 'pending',
        tempPassword,
        createdAt: new Date().toLocaleDateString(),
      };

      setUsers([...users, newUser]);
      setSuccess(`User ${formData.email} created successfully!`);
      
      setFormData({
        email: '',
        role: 'manager',
      });
      setShowForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Error creating user. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (confirm(`Delete user ${email}? They will lose access to this apartment.`)) {
      setSubmitting(true);
      setError(null);

      try {
        const deleteUser = httpsCallable(functions, 'deleteUserFromApartment');
        await deleteUser({
          uid: id,
          apartmentId: apartmentId,
        });

        setUsers(users.filter((u) => u.id !== id));
        setSuccess(`User ${email} deleted successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        console.error('Error deleting user:', err);
        setError(err.message || 'Error deleting user');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleCopyPassword = (password: string, userId: string) => {
    navigator.clipboard.writeText(password);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActivateUser = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: 'active' } : u
      )
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Error</p>
            <p className="text-red-100 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-100">{success}</p>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAddUser}
          className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6"
        >
          <p className="text-sm text-slate-400 mb-4">
            A temporary password will be generated. The user will be required to change it on first login.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              required
              disabled={submitting}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              disabled={submitting}
            >
              <option value="manager">Manager (Full Access)</option>
              <option value="staff">Staff (Limited Access)</option>
              <option value="viewer">Viewer (Read-only)</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {submitting ? 'Creating User...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={submitting}
              className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No users yet. Create one to get started!
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-100">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Pending First Login'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-900 text-blue-200 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Created: {user.createdAt}</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  disabled={submitting}
                  className="text-red-400 hover:text-red-300 transition disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {user.status === 'pending' && (
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 mt-3">
                  <p className="text-xs text-slate-400 mb-2">Temporary Password (share securely):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm font-mono text-emerald-400 break-all">
                      {user.tempPassword}
                    </code>
                    <button
                      onClick={() => handleCopyPassword(user.tempPassword, user.id)}
                      className="flex-shrink-0 p-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                    >
                      {copiedId === user.id ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-slate-300" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => handleActivateUser(user.id)}
                    className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Mark as Activated â†’
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-200 mb-2">â„¹ï¸ User Management Flow</h3>
        <ul className="text-sm text-blue-100 space-y-1">
          <li>âœ“ Create user with email and temporary password</li>
          <li>âœ“ User receives email + temp password securely</li>
          <li>âœ“ User logs in with email + temp password</li>
          <li>âœ“ On first login, user must change their password</li>
          <li>âœ“ After that, they can access the dashboard normally</li>
        </ul>
      </div>
    </div>
  );
}

