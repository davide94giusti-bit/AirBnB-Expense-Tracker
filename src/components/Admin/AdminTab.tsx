import { useState } from 'react';
import { registerUser, updateUserApartments } from '../../services/authService';
import { getUserApartments } from '../../services/apartmentService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User, Apartment } from '../../types';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'manager' as const,
    apartments: [] as string[],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const loadedUsers = usersSnap.docs.map((d) => ({
          uid: d.id,
          ...d.data(),
        } as User));
        setUsers(loadedUsers);

        const apartmentsSnap = await getDocs(collection(db, 'apartments'));
        const loadedApts = apartmentsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as Apartment));
        setApartments(loadedApts);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }

    loadData();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('Email and password required');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(formData.email, formData.password, {
        displayName: formData.displayName,
        role: formData.role,
      });

      // Assign apartments
      if (formData.apartments.length > 0) {
        await updateUserApartments(user.uid, formData.apartments);
      }

      // Reload users
      const usersSnap = await getDocs(collection(db, 'users'));
      const loadedUsers = usersSnap.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      } as User));
      setUsers(loadedUsers);

      setFormData({
        email: '',
        password: '',
        displayName: '',
        role: 'manager',
        apartments: [],
      });
      setShowForm(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Create User
        </button>
      </div>

      {/* Create user form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'manager' | 'viewer',
                  })
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
              >
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Apartments</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {apartments.map((apt) => (
                  <label key={apt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.apartments.includes(apt.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            apartments: [...formData.apartments, apt.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            apartments: formData.apartments.filter(
                              (id) => id !== apt.id
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span>{apt.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold py-2 rounded-lg transition"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-3">Users</h3>
        {users.map((user) => (
          <div
            key={user.uid}
            className="bg-slate-900 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-slate-200">
                  {user.displayName}
                </div>
                <div className="text-sm text-slate-400">{user.email}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Role: {user.role}
                </div>
                {user.apartments.length > 0 && (
                  <div className="text-xs text-slate-500 mt-1">
                    Apartments: {user.apartments.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
