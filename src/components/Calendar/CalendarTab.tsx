import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { CalendarEvent } from '../../types';
import { setCalendarEvent } from '../../services/calendarService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarTab({ apartmentId }: { apartmentId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    status: 'free' as const,
    notes: '',
  });

  const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');
  const { events } = useCalendarEvents(apartmentId, monthStart, monthEnd);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }, [currentDate]);

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent>();
    events.forEach((evt) => {
      map.set(evt.date, evt);
    });
    return map;
  }, [events]);

  async function handleSaveEvent() {
    if (!selectedDate) return;
    try {
      await setCalendarEvent(
        apartmentId,
        selectedDate,
        formData.status,
        formData.notes
      );
      setShowModal(false);
      setFormData({ status: 'free', notes: '' });
    } catch (error) {
      alert('Error saving event');
    }
  }

  function onDateClick(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = eventMap.get(dateStr);
    setSelectedDate(dateStr);
    setFormData({
      status: existing?.status ?? 'free',
      notes: existing?.notes ?? '',
    });
    setShowModal(true);
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
            }
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
            }
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Status legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span>Cleaning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500"></div>
          <span>Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Free</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        {/* Weekdays header */}
        <div className="grid grid-cols-7 border-b border-slate-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-slate-400 text-sm bg-slate-800">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {daysInMonth.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const event = eventMap.get(dateStr);
            const statusColors = {
              occupied: 'bg-red-500/20 border-red-500',
              cleaning: 'bg-blue-500/20 border-blue-500',
              maintenance: 'bg-orange-500/20 border-orange-500',
              free: 'bg-green-500/20 border-green-500',
            };

            return (
              <button
                key={dateStr}
                onClick={() => onDateClick(date)}
                className={`p-3 min-h-[100px] border border-slate-700 text-left text-sm hover:bg-slate-800 transition ${
                  event ? `${statusColors[event.status]} border-2` : ''
                }`}
              >
                <div className="font-semibold text-slate-300 mb-1">
                  {format(date, 'd')}
                </div>
                {event && (
                  <div className="text-xs">
                    <div className="font-medium capitalize text-slate-200">{event.status}</div>
                    {event.notes && <div className="text-slate-400 line-clamp-2">{event.notes}</div>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{selectedDate}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="free">Free</option>
                  <option value="occupied">Occupied</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20"
                  placeholder="Add notes..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEvent}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 rounded-lg transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
