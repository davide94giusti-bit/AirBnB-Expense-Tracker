import { useEffect, useState } from 'react';
import './MonthlyExportModal.css';

interface DayState {
  status: 'free' | 'occupied' | 'maintenance' | 'cleaning';
  notes: string;
}

interface MonthlyExportModalProps {
  month: string;
  dayStates: { [key: string]: DayState };
  daysInMonth: number;
  onClose: () => void;
}

export default function MonthlyExportModal({
  month,
  dayStates,
  daysInMonth,
  onClose,
}: MonthlyExportModalProps) {
  const [stats, setStats] = useState({
    free: 0,
    occupied: 0,
    maintenance: 0,
    cleaning: 0,
  });

  useEffect(() => {
    // Calculate statistics
    const newStats = {
      free: 0,
      occupied: 0,
      maintenance: 0,
      cleaning: 0,
    };

    Object.values(dayStates).forEach((day) => {
      newStats[day.status]++;
    });

    // Count unset days as free
    const totalSet = Object.values(newStats).reduce((a, b) => a + b, 0);
    newStats.free += Math.max(0, daysInMonth - totalSet);

    setStats(newStats);
  }, [dayStates, daysInMonth]);

  const handleExportCSV = () => {
    let csv = 'Day,Status,Notes\n';

    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = Object.keys(dayStates).find((k) => k.endsWith(`-${day}`));
      const dayState = dayKey ? dayStates[dayKey] : { status: 'free', notes: '' };

      const status = dayState.status.toUpperCase();
      const notes = `"${dayState.notes.replace(/"/g, '""')}"`;

      csv += `${day},${status},${notes}\n`;
    }

    downloadFile(csv, `calendar-${month.replace(/\s/g, '-')}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const data = {
      month,
      daysInMonth,
      stats,
      days: dayStates,
      exportedAt: new Date().toISOString(),
    };

    downloadFile(
      JSON.stringify(data, null, 2),
      `calendar-${month.replace(/\s/g, '-')}.json`,
      'application/json'
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      const statsHtml = `
        <table border="1" style="margin-bottom: 20px; border-collapse: collapse;">
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 10px;">Status</th>
            <th style="padding: 10px;">Count</th>
            <th style="padding: 10px;">Percentage</th>
          </tr>
          <tr>
            <td style="padding: 10px; color: #2ecc71;"><strong>FREE</strong></td>
            <td style="padding: 10px;">${stats.free}</td>
            <td style="padding: 10px;">${((stats.free / daysInMonth) * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #e74c3c;"><strong>OCCUPIED</strong></td>
            <td style="padding: 10px;">${stats.occupied}</td>
            <td style="padding: 10px;">${((stats.occupied / daysInMonth) * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #9b59b6;"><strong>MAINTENANCE</strong></td>
            <td style="padding: 10px;">${stats.maintenance}</td>
            <td style="padding: 10px;">${((stats.maintenance / daysInMonth) * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #f39c12;"><strong>CLEANING</strong></td>
            <td style="padding: 10px;">${stats.cleaning}</td>
            <td style="padding: 10px;">${((stats.cleaning / daysInMonth) * 100).toFixed(1)}%</td>
          </tr>
        </table>
      `;

      printWindow.document.write(`
        <html>
          <head>
            <title>${month} Calendar Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <h1>${month} - Availability Report</h1>
            ${statsHtml}
            <p style="margin-top: 40px; font-size: 12px; color: #666;">
              Generated on ${new Date().toLocaleString()}
            </p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const occupancyRate = ((stats.occupied / daysInMonth) * 100).toFixed(1);

  return (
    <div className="export-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <h2>Monthly Report: {month}</h2>
          <button className="export-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="export-modal-body">
          {/* Summary Cards */}
          <div className="export-modal-stats">
            <div className="export-modal-stat-card export-stat-free">
              <div className="export-stat-label">Free</div>
              <div className="export-stat-value">{stats.free}</div>
              <div className="export-stat-percent">{((stats.free / daysInMonth) * 100).toFixed(1)}%</div>
            </div>

            <div className="export-modal-stat-card export-stat-occupied">
              <div className="export-stat-label">Occupied</div>
              <div className="export-stat-value">{stats.occupied}</div>
              <div className="export-stat-percent">{((stats.occupied / daysInMonth) * 100).toFixed(1)}%</div>
            </div>

            <div className="export-modal-stat-card export-stat-maintenance">
              <div className="export-stat-label">Maintenance</div>
              <div className="export-stat-value">{stats.maintenance}</div>
              <div className="export-stat-percent">{((stats.maintenance / daysInMonth) * 100).toFixed(1)}%</div>
            </div>

            <div className="export-modal-stat-card export-stat-cleaning">
              <div className="export-stat-label">Cleaning</div>
              <div className="export-stat-value">{stats.cleaning}</div>
              <div className="export-stat-percent">{((stats.cleaning / daysInMonth) * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Occupancy Rate Highlight */}
          <div className="export-modal-occupancy">
            <p className="export-occupancy-label">Occupancy Rate</p>
            <p className="export-occupancy-value">{occupancyRate}%</p>
            <div className="export-occupancy-bar">
              <div
                className="export-occupancy-bar-fill"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>

          {/* Export Options */}
          <div className="export-modal-section">
            <p className="export-modal-section-title">Export Options</p>
            <div className="export-modal-buttons">
              <button className="export-modal-btn export-btn-csv" onClick={handleExportCSV}>
                📥 Export as CSV
              </button>
              <button className="export-modal-btn export-btn-json" onClick={handleExportJSON}>
                📄 Export as JSON
              </button>
              <button className="export-modal-btn export-btn-print" onClick={handlePrint}>
                🖨️ Print Report
              </button>
            </div>
          </div>
        </div>

        <div className="export-modal-footer">
          <button className="export-modal-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
