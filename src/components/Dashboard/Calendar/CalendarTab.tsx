import Calendar from './Calendar';
import './CalendarTab.css';

interface CalendarTabProps {
  apartmentId: string;
}

export default function CalendarTab({ apartmentId }: CalendarTabProps) {
  const handleDateSelect = (startDate: Date, endDate: Date) => {
    console.log('Selected dates:', startDate, endDate);
    console.log('Apartment ID:', apartmentId);
    // Add your booking logic here
  };

  return (
    <div className="calendar-tab-wrapper">
      <Calendar 
        year={2025} 
        month={11} 
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}
