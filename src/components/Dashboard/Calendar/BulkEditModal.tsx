import { useState } from 'react';
import './BulkEditModal.css';

interface BulkEditModalProps {
  daysInMonth: number;
  onSave: (
    startDay: number,
    endDay: number,
    status: 'free' | 'occupied' | 'maintenance' | 'cleaning',
    notes: string
  ) => void;
  onClose: () => void;
}

export default function BulkEditModal({ daysInMonth, onSave, onClose }: BulkEditModalProps) {
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(daysInMonth);
  const [status, setStatus] = useState<'free' | 'occupied' | 'maintenance' | 'cleaning'>('free');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (startDay > endDay) {
      alert('Start day must be before or equal to end day');
      return;
    }
    onSave(startDay, endDay, status, notes);
  };

  const handleSetAllDays = () => {
    setStartDay(1);
    setEndDay(daysInMonth);
  };

  return (
    <div className="bulk-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="bulk-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="bulk-modal-header">
          <h2>Bulk Edit Days</h2>
          <button className="bulk-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="bulk-modal-body">
          <div className="bulk-modal-section">
            <label>Date Range</label>
            <div className="bulk-modal-range">
              <div className="bulk-modal-range-input">
                <label htmlFor="start-day">From Day:</label>
                <input
                  id="start-day"
                  type="number"
                  min="1"
                  max={daysInMonth}
                  value={startDay}
                  onChange={(e) => setStartDay(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bulk-modal-input"
                />
              </div>
              <div className="bulk-modal-range-input">
                <label htmlFor="end-day">To Day:</label>
                <input
                  id="end-day"
                  type="number"
                  min="1"
                  max={daysInMonth}
                  value={endDay}
                  onChange={(e) => setEndDay(Math.min(daysInMonth, parseInt(e.target.value) || daysInMonth))}
                  className="bulk-modal-input"
                />
              </div>
            </div>
            <button className="bulk-modal-quick-btn" onClick={handleSetAllDays}>
              Set All Days ({daysInMonth})
            </button>
          </div>

          <div className="bulk-modal-section">
            <label>Status</label>
            <div className="bulk-modal-status-grid">
              <button
                className={`bulk-modal-status-btn bulk-modal-status-free ${status === 'free' ? 'active' : ''}`}
                onClick={() => setStatus('free')}
              >
                FREE
              </button>
              <button
                className={`bulk-modal-status-btn bulk-modal-status-occupied ${status === 'occupied' ? 'active' : ''}`}
                onClick={() => setStatus('occupied')}
              >
                OCCUPIED
              </button>
              <button
                className={`bulk-modal-status-btn bulk-modal-status-maintenance ${status === 'maintenance' ? 'active' : ''}`}
                onClick={() => setStatus('maintenance')}
              >
                MAINTENANCE
              </button>
              <button
                className={`bulk-modal-status-btn bulk-modal-status-cleaning ${status === 'cleaning' ? 'active' : ''}`}
                onClick={() => setStatus('cleaning')}
              >
                CLEANING
              </button>
            </div>
          </div>

          <div className="bulk-modal-section">
            <label>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for all selected days..."
              className="bulk-modal-textarea"
              rows={3}
            />
          </div>

          <div className="bulk-modal-preview">
            <p className="bulk-modal-preview-text">
              Will update <strong>{Math.max(0, endDay - startDay + 1)}</strong> days ({startDay} - {endDay})
            </p>
          </div>
        </div>

        <div className="bulk-modal-footer">
          <button className="bulk-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="bulk-modal-btn-apply" onClick={handleSave}>
            Apply to {Math.max(0, endDay - startDay + 1)} Days
          </button>
        </div>
      </div>
    </div>
  );
}
