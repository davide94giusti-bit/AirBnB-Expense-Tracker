import { useState, useEffect } from 'react';
import './Calendar.css';
import DayModal from './DayModal';
import BulkEditModal from './BulkEditModal';
import MonthlyExportModal from './MonthlyExportModal';
import { db } from '../../../services/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';

interface CalendarDay {
  date: number;
  status: 'free' | 'occupied' | 'maintenance' | 'cleaning' | 'empty';
  notes: string;
}

interface CalendarProps {
  year?: number;
  month?: number;
  apartmentId?: string;
}

export default function Calendar({ year = 2026, month = 1, apartmentId = 'default' }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);
  const [dayStates, setDayStates] = useState<{
    [key: string]: { status: 'free' | 'occupied' | 'maintenance' | 'cleaning'; notes: string };
  }>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Load from Firestore on mount and when month changes
  useEffect(() => {
    loadMonthData();
  }, [currentMonth, currentYear, apartmentId]);

  // Set up real-time listener
  useEffect(() => {
    if (!apartmentId) return;

    console.log('🔔 Setting up real-time listener for calendar changes...');
    setIsListening(true);

    const calendarCollectionRef = collection(
      db,
      `apartments/${apartmentId}/calendar`
    );

    // Listen to ALL calendar days for this apartment
    const unsubscribe = onSnapshot(
      calendarCollectionRef,
      (snapshot) => {
        console.log('🔄 Real-time update received!');
        
        const newDayStates: any = {};
        
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          newDayStates[doc.id] = {
            status: data.status || 'free',
            notes: data.notes || '',
          };
        });

        // Update state with real-time changes
        setDayStates((prev) => ({
          ...prev,
          ...newDayStates,
        }));

        // Update last sync time
        const now = new Date();
        setLastUpdate(now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }));

        console.log('✅ Real-time data updated:', newDayStates);
      },
      (error) => {
        console.error('❌ Real-time listener error:', error);
        setError('Real-time sync error. Falling back to manual refresh.');
        setIsListening(false);
      }
    );

    return () => {
      console.log('🔕 Unsubscribing from real-time listener');
      unsubscribe();
      setIsListening(false);
    };
  }, [apartmentId]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDayKey = (day: number) => `${currentYear}-${currentMonth}-${day}`;

  const getDocPath = (day: number) =>
    `apartments/${apartmentId}/calendar/${currentYear}-${currentMonth}-${day}`;

  // Load data from Firestore (for initial load)
  const loadMonthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const daysInMonth = getDaysInMonth(currentYear, currentMonth);
      const newDayStates: any = {};

      console.log(`📅 Loading calendar for ${currentYear}-${currentMonth}...`);

      for (let day = 1; day <= daysInMonth; day++) {
        try {
          const docRef = doc(db, getDocPath(day));
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            newDayStates[getDayKey(day)] = {
              status: data.status || 'free',
              notes: data.notes || '',
            };
          }
        } catch (error) {
          console.error(`Error loading day ${day}:`, error);
        }
      }

      setDayStates(newDayStates);
      console.log('✅ Month data loaded successfully:', newDayStates);
    } catch (error) {
      console.error('❌ Error loading month data:', error);
      setError('Failed to load calendar data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Save single day to Firestore
  const saveDay = async (
    day: number,
    status: 'free' | 'occupied' | 'maintenance' | 'cleaning',
    notes: string
  ) => {
    try {
      const docRef = doc(db, getDocPath(day));
      
      const payload = {
        status,
        notes,
        date: day,
        month: currentMonth,
        year: currentYear,
        updatedAt: new Date().toISOString(),
        apartmentId,
      };

      console.log('💾 Saving to Firestore:', getDocPath(day), payload);
      
      await setDoc(docRef, payload);

      const key = getDayKey(day);
      setDayStates((prev) => ({
        ...prev,
        [key]: { status, notes },
      }));

      console.log('✅ Day saved to Firestore:', key);
      setError(null);
    } catch (error) {
      console.error('❌ Error saving day:', error);
      setError('Failed to save day. Please try again.');
      const key = getDayKey(day);
      setDayStates((prev) => ({
        ...prev,
        [key]: { status, notes },
      }));
    }
  };

  // Save bulk edit
  const saveBulkEdit = async (
    startDay: number,
    endDay: number,
    status: 'free' | 'occupied' | 'maintenance' | 'cleaning',
    notes: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const daysInMonth = getDaysInMonth(currentYear, currentMonth);
      const start = Math.max(1, startDay);
      const end = Math.min(daysInMonth, endDay);

      console.log(`⚡ Bulk saving days ${start}-${end}...`);

      const savePromises = [];
      for (let day = start; day <= end; day++) {
        const docRef = doc(db, getDocPath(day));
        const payload = {
          status,
          notes,
          date: day,
          month: currentMonth,
          year: currentYear,
          updatedAt: new Date().toISOString(),
          apartmentId,
        };
        savePromises.push(setDoc(docRef, payload));
      }

      await Promise.all(savePromises);

      // Update local state
      const newDayStates = { ...dayStates };
      for (let day = start; day <= end; day++) {
        newDayStates[getDayKey(day)] = { status, notes };
      }
      setDayStates(newDayStates);

      console.log(`✅ Bulk edit applied to days ${start}-${end}`);
      setShowBulkModal(false);
    } catch (error) {
      console.error('❌ Error in bulk edit:', error);
      setError('Failed to save bulk edit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (day: number, status: string) => {
    if (status === 'empty') return;

    console.log('Clicked day:', day);
    setSelectedDay(day);
    setShowModal(true);
  };

  const handleSaveDay = (status: 'free' | 'occupied' | 'maintenance' | 'cleaning', notes: string) => {
    console.log('Saving day:', selectedDay, status, notes);
    if (selectedDay !== null) {
      saveDay(selectedDay, status, notes);
    }
    setShowModal(false);
    setSelectedDay(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDay(null);
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Build calendar grid
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days: CalendarDay[] = [];

  // Add empty cells before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: 0, status: 'empty', notes: '' });
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const key = getDayKey(day);
    const dayState = dayStates[key] || { status: 'free', notes: '' };
    days.push({
      date: day,
      status: dayState.status,
      notes: dayState.notes,
    });
  }

  // Add empty cells after month ends
  const totalCells = days.length;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    days.push({ date: 0, status: 'empty', notes: '' });
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sync-indicator {
          animation: fadeIn 0.3s ease-in-out;
        }

        .sync-dot {
          animation: ${isListening ? 'pulse 2s infinite' : 'none'};
        }
      `}</style>

      <div className="calendar-new-container">
        <h2 className="calendar-new-title">Airbnb Calendar</h2>

        {/* Real-time sync indicator */}
        <div className="sync-indicator" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '10px 14px',
          background: isListening 
            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.04) 100%)' 
            : 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 152, 0, 0.04) 100%)',
          border: `1.5px solid ${isListening ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '12px',
          fontWeight: '500',
          color: isListening ? '#2e7d32' : '#f57c00',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sync-dot" style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isListening ? '#4CAF50' : '#FF9800',
              boxShadow: isListening 
                ? '0 0 8px rgba(76, 175, 80, 0.6)' 
                : '0 0 8px rgba(255, 152, 0, 0.3)',
            }} />
            <span>
              {isListening 
                ? '🔴 Real-time sync active' 
                : '🟡 Connecting...'}
            </span>
          </div>
          {lastUpdate && isListening && (
            <span style={{ fontSize: '11px', opacity: 0.7 }}>
              Last sync: {lastUpdate}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.08) 0%, rgba(231, 76, 60, 0.04) 100%)',
            border: '1.5px solid rgba(231, 76, 60, 0.3)',
            color: '#c62828',
            padding: '12px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Calendar header with navigation */}
        <div className="calendar-new-header">
          <button onClick={previousMonth} className="calendar-new-nav-btn">
            ← Previous
          </button>
          <h3>{monthName}</h3>
          <button onClick={nextMonth} className="calendar-new-nav-btn">
            Next →
          </button>
        </div>

        {/* Toolbar with bulk edit and export */}
        <div className="calendar-new-toolbar">
          <button onClick={() => setShowBulkModal(true)} className="calendar-new-toolbar-btn">
            ⚡ Bulk Edit
          </button>
          <button onClick={() => setShowExportModal(true)} className="calendar-new-toolbar-btn">
            📊 Export Month
          </button>
        </div>

        {/* Calendar grid */}
        <div className="calendar-new-grid">
          {/* Week day headers */}
          <div className="calendar-new-weekdays">
            {weekDays.map((day) => (
              <div key={day} className="calendar-new-weekday">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="calendar-new-days">
            {days.map((day, index) => (
              <div
                key={index}
                className={`calendar-new-day calendar-new-${day.status}`}
                onClick={() => handleDayClick(day.date, day.status)}
                style={{
                  cursor: day.status === 'empty' ? 'default' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {day.date > 0 && (
                  <>
                    <div className="calendar-new-date">{day.date}</div>
                    <div className="calendar-new-status">
                      {day.status === 'free' && 'FREE'}
                      {day.status === 'occupied' && 'OCCUPIED'}
                      {day.status === 'maintenance' && 'MAINTENANCE'}
                      {day.status === 'cleaning' && 'CLEANING'}
                    </div>
                    {day.notes && <div className="calendar-new-note-indicator">📝</div>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="calendar-new-loading">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4CAF50',
                animation: 'pulse 1s infinite',
              }} />
              <span>Loading calendar...</span>
            </div>
          </div>
        )}
      </div>

      {/* Day detail modal */}
      {showModal && selectedDay !== null && (
        <DayModal
          day={selectedDay}
          month={monthName.split(' ')[0]}
          currentState={dayStates[getDayKey(selectedDay)] || { status: 'free', notes: '' }}
          onSave={handleSaveDay}
          onClose={handleCloseModal}
        />
      )}

      {/* Bulk edit modal */}
      {showBulkModal && (
        <BulkEditModal
          daysInMonth={daysInMonth}
          onSave={saveBulkEdit}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {/* Export modal */}
      {showExportModal && (
        <MonthlyExportModal
          month={monthName}
          dayStates={dayStates}
          daysInMonth={daysInMonth}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
}
