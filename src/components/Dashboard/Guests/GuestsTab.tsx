import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  notes: string;
}

export default function GuestsTab({ apartmentId }: { apartmentId: string }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    notes: '',
  });

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.checkIn) return;

    const newGuest: Guest = {
      id: Date.now().toString(),
      ...formData,
    };

    setGuests([...guests, newGuest]);
    setFormData({
      name: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      notes: '',
    });
    setShowForm(false);
  };

  const handleDeleteGuest = (id: string) => {
    if (confirm('Delete this guest?')) {
      setGuests(guests.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Guests</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Guest
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddGuest}
          className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Guest name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Check-in Date</label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Check-out Date</label>
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              placeholder="Any notes about the guest..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 h-20"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Add Guest
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guests.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-slate-400">No guests added yet</div>
        ) : (
          guests.map((guest) => (
            <div
              key={guest.id}
              className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-100">{guest.name}</p>
                  <p className="text-sm text-slate-400">{guest.email}</p>
                </div>
                <button
                  onClick={() => handleDeleteGuest(guest.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                {guest.phone && (
                  <p className="text-slate-300">
                    <span className="text-slate-400">Phone:</span> {guest.phone}
                  </p>
                )}
                {guest.checkIn && (
                  <p className="text-slate-300">
                    <span className="text-slate-400">Check-in:</span> {guest.checkIn}
                  </p>
                )}
                {guest.checkOut && (
                  <p className="text-slate-300">
                    <span className="text-slate-400">Check-out:</span> {guest.checkOut}
                  </p>
                )}
                {guest.notes && (
                  <p className="text-slate-300 mt-3">
                    <span className="text-slate-400">Notes:</span> {guest.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
