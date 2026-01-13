// src/components/Dashboard/Calendar/Calendar.tsx

import { useState } from 'react';
import './Calendar.css';
import DayModal from './DayModal';

interface CalendarDay {
  date: number;
  status: 'free' | 'occupied' | 'maintenance' | 'cleaning' | 'empty';
  notes: string;
  isSelected: boolean;
}

interface CalendarProps {
  year?: number;
  month?: number;
  onDateSelect?: (startDate: Date, endDate: Date) => void;
}

export default function Calendar({ year = 2026, month = 1, onDateSelect }: CalendarProps) {
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);
  const [dayStates, setDayStates] = useState<{
    [key: string]: { status: 'free' | 'occupied' | 'maintenance' | 'cleaning'; notes: string };
  }>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDayKey = (day: number) => `${currentYear}-${currentMonth}-${day}`;

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleDayClick = (day: number) => {
    console.log('Clicked day:', day);
    setSelectedDay(day);
    setShowModal(true);
  };

  const handleSaveDay = (status: 'free' | 'occupied' | 'maintenance' | 'cleaning', notes: string) => {
    console.log('Saving day:', selectedDay, status, notes);
    if (selectedDay !== null) {
      const key = getDayKey(selectedDay);
      setDayStates({
        ...dayStates,
        [key]: { status, notes },
      });
    }
    setShowModal(false);
    setSelectedDay(null);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
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
    setStartDate(null);
    setEndDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setStartDate(null);
    setEndDate(null);
  };

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const days: CalendarDay[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push({
      date: 0,
      status: 'empty',
      notes: '',
      isSelected: false,
    });
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const key = getDayKey(day);
    const dayState = dayStates[key] || { status: 'free', notes: '' };
    days.push({
      date: day,
      status: dayState.status,
      notes: dayState.notes,
      isSelected: day === startDate || day === endDate,
    });
  }

  // Add empty cells for days after month ends
  const totalCells = days.length;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    days.push({
      date: i + 1,
      status: 'empty',
      notes: '',
      isSelected: false,
    });
  }

  return (
    <>
      <div className="calendar-new-container">
        <h2 className="calendar-new-title">Airbnb Calendar</h2>

        <div className="calendar-new-header">
          <button onClick={previousMonth} className="calendar-new-nav-btn">
            Previous
          </button>
          <h3>{monthName}</h3>
          <button onClick={nextMonth} className="calendar-new-nav-btn">
            Next
          </button>
        </div>

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
                onClick={() => day.date > 0 && day.status !== 'empty' && handleDayClick(day.date)}
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
      </div>

      {/* Modal for day details */}
      {showModal && selectedDay !== null && (
        <DayModal
          day={selectedDay}
          month={monthName.split(' ')[0]}
          currentState={dayStates[getDayKey(selectedDay)] || { status: 'free', notes: '' }}
          onSave={handleSaveDay}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
