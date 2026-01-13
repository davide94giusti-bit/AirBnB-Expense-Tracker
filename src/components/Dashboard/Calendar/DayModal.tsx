import { useState } from 'react';
import './DayModal.css';

interface DayModalProps {
  day: number;
  month: string;
  currentState: { status: 'free' | 'occupied' | 'maintenance' | 'cleaning'; notes: string };
  onSave: (status: 'free' | 'occupied' | 'maintenance' | 'cleaning', notes: string) => void;
  onClose: () => void;
}

export default function DayModal({ day, month, currentState, onSave, onClose }: DayModalProps) {
  const [status, setStatus] = useState<'free' | 'occupied' | 'maintenance' | 'cleaning'>(
    currentState.status || 'free'
  );
  const [notes, setNotes] = useState(currentState.notes || '');

  console.log('DayModal rendered for day:', day, month);

  const handleSave = () => {
    console.log('Save button clicked:', status, notes);
    onSave(status, notes);
  };

  return (
    <div className="day-modal-overlay" onClick={(e) => {
      console.log('Overlay clicked');
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="day-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="day-modal-header">
          <h2>{month} {day}</h2>
          <button className="day-modal-close" onClick={() => {
            console.log('Close button clicked');
            onClose();
          }}>
            ✕
          </button>
        </div>

        <div className="day-modal-body">
          <div className="day-modal-section">
            <label>Status</label>
            <div className="day-modal-status-options">
              <button
                className={`day-modal-status-btn day-modal-status-free ${status === 'free' ? 'active' : ''}`}
                onClick={() => setStatus('free')}
              >
                FREE
              </button>
              <button
                className={`day-modal-status-btn day-modal-status-occupied ${status === 'occupied' ? 'active' : ''}`}
                onClick={() => setStatus('occupied')}
              >
                OCCUPIED
              </button>
              <button
                className={`day-modal-status-btn day-modal-status-maintenance ${status === 'maintenance' ? 'active' : ''}`}
                onClick={() => setStatus('maintenance')}
              >
                MAINTENANCE
              </button>
              <button
                className={`day-modal-status-btn day-modal-status-cleaning ${status === 'cleaning' ? 'active' : ''}`}
                onClick={() => setStatus('cleaning')}
              >
                CLEANING
              </button>
            </div>
          </div>

          <div className="day-modal-section">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this day..."
              className="day-modal-textarea"
              rows={4}
            />
          </div>
        </div>

        <div className="day-modal-footer">
          <button className="day-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="day-modal-btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
