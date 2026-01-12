import { useState } from 'react';
import { useGuests } from '../../hooks/useGuests';
import { addGuest, deleteGuest } from '../../services/guestService';
import { occupyDatesForGuest, setCalendarEvent } from '../../services/calendarService';
import { compressImage } from '../../services/storageService';
import { addExpense } from '../../services/expenseService';
import { calculateTouristTax, diffInDays } from '../../services/balanceService';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

export default function GuestsTab({ apartmentId }: { apartmentId: string }) {
  const { guests } = useGuests(apartmentId);
  const [showForm, setShowForm] = useState(false);
  const [showBooking, setShowBooking] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
  });
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    nightlyRate: '',
  });
  const [idFile, setIdFile] = useState<File | null>(null);

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      alert('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      let idImageUrl = '';
      if (idFile) {
        const path = generateStoragePath(apartmentId, 'guest', Date.now().toString(), idFile.name);
        idImageUrl = await uploadFile(path, idFile);
      }

      await addGuest({
        apartmentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        idImageUrl,
      });

      setFormData({ firstName: '', lastName: '', idNumber: '' });
      setIdFile(null);
      setShowForm(false);
    } catch (error) {
      alert('Error adding guest');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBooking(guestId: string) {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select dates');
      return;
    }

    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;

    setLoading(true);
    try {
      // Occupy dates
      await occupyDatesForGuest(apartmentId, [guestId], bookingData.checkIn, bookingData.checkOut);

      // Calculate and add tourist tax
      const nights = diffInDays(new Date(bookingData.checkIn), new Date(bookingData.checkOut));
      const taxAmount = calculateTouristTax(1, nights);

      if (taxAmount > 0) {
        await addExpense({
          apartmentId,
          userId: 'system',
          type: 'tax',
          description: `Tourist tax - ${guest.firstName} ${guest.lastName}`,
          amount: taxAmount,
          currency: 'EUR',
          date: bookingData.checkOut,
          notes: `${nights} nights, 1 guest, 3€/night (max 4 nights)`,
        });
      }

      setBookingData({ checkIn: '', checkOut: '', nightlyRate: '' });
      setShowBooking(null);
    } catch (error) {
      alert('Error creating booking');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteGuest(id: string) {
    if (confirm('Delete this guest?')) {
      try {
        await deleteGuest(id);
      } catch (error) {
        alert('Error deleting guest');
      }
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Guests</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Guest
        </button>
      </div>

      {/* Add guest form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <form onSubmit={handleAddGuest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ID Number</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                placeholder="Passport/ID number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ID Photo</label>
              <input
                type="file"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                accept="image/*"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold py-2 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Save Guest'}
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

      {/* Guests list */}
      <div className="space-y-3">
        {guests.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No guests added yet</div>
        ) : (
          guests.map((guest) => (
            <div
              key={guest.id}
              className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-slate-200">
                    {guest.firstName} {guest.lastName}
                  </div>
                  <div className="text-sm text-slate-400">ID: {guest.idNumber}</div>
                </div>
                <button
                  onClick={() => handleDeleteGuest(guest.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {guest.idImageUrl && (
                <div className="mb-3">
                  <img
                    src={guest.idImageUrl}
                    alt="ID"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}

              {showBooking === guest.id ? (
                <div className="bg-slate-800 rounded p-4 space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-in</label>
                      <input
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            checkIn: e.target.value,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-out</label>
                      <input
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            checkOut: e.target.value,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCreateBooking(guest.id)}
                      disabled={loading}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold py-2 rounded-lg transition text-sm"
                    >
                      {loading ? 'Creating...' : 'Create Booking'}
                    </button>
                    <button
                      onClick={() => setShowBooking(null)}
                      className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-100 font-semibold py-2 rounded-lg transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowBooking(guest.id)}
                  className="w-full mt-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 rounded-lg transition text-sm"
                >
                  Create Booking
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
