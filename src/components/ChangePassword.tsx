import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tempPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // In production: call Firebase to change password
      // await changePassword(tempPassword, newPassword);
      
      localStorage.removeItem('forceChangePassword');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to change password. Check your temporary password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Set Your Password</h1>
        <p className="text-slate-400 mb-6">
          Welcome! Please set a new password to secure your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Temporary Password</label>
            <input
              type="password"
              value={formData.tempPassword}
              onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition mt-6"
          >
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
