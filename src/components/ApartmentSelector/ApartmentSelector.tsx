import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Plus, Home, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';

interface Apartment {
  id: string;
  name: string;
  address?: string;
  ownerId: string;
}

export default function ApartmentSelector() {
  const navigate = useNavigate();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApartmentName, setNewApartmentName] = useState('');
  const [newApartmentAddress, setNewApartmentAddress] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadApartments();
  }, []);

  async function loadApartments() {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'apartments'),
        where('ownerId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const apts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Apartment[];
      setApartments(apts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading apartments:', error);
      setLoading(false);
    }
  }

  async function handleAddApartment(e: React.FormEvent) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !newApartmentName.trim()) return;

    setAdding(true);
    try {
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'apartments'), {
        name: newApartmentName,
        address: newApartmentAddress,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Add to local state
      const newApt: Apartment = {
        id: docRef.id,
        name: newApartmentName,
        address: newApartmentAddress,
        ownerId: user.uid,
      };
      setApartments([...apartments, newApt]);
      setNewApartmentName('');
      setNewApartmentAddress('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding apartment:', error);
      alert('Failed to add apartment');
    } finally {
      setAdding(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading apartments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-400">AirBnB Control</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Select Your Apartment</h2>
          <p className="text-slate-400">
            {apartments.length > 0
              ? `You have ${apartments.length} apartment${apartments.length !== 1 ? 's' : ''} assigned`
              : 'No apartments assigned yet. Create one to get started.'}
          </p>
        </div>

        {/* Apartments Grid */}
        {apartments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {apartments.map((apt) => (
              <button
                key={apt.id}
                onClick={() => navigate(`/dashboard/${apt.id}`)}
                className="group bg-slate-900 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 hover:bg-slate-800 transition text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <Home size={32} className="text-emerald-400 group-hover:text-emerald-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition mb-2">
                  {apt.name}
                </h3>
                {apt.address && (
                  <p className="text-sm text-slate-400">{apt.address}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Add New Apartment Section */}
        <div className="mt-8">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              <Plus size={20} />
              Add New Apartment
            </button>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold text-slate-100 mb-4">Add New Apartment</h3>
              <form onSubmit={handleAddApartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Apartment Name *
                  </label>
                  <input
                    type="text"
                    value={newApartmentName}
                    onChange={(e) => setNewApartmentName(e.target.value)}
                    placeholder="e.g., Downtown Studio"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Address (optional)
                  </label>
                  <input
                    type="text"
                    value={newApartmentAddress}
                    onChange={(e) => setNewApartmentAddress(e.target.value)}
                    placeholder="e.g., 123 Main St, City"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                  >
                    {adding ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
