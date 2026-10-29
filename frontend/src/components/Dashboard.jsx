import { useEffect, useState } from 'react';
import { api } from '../services/api';

async function triggerReminder() {
  const res = await fetch('/api/test/trigger-reminder', { method: 'POST' });
  return res.json();
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [reminderMsg, setReminderMsg] = useState('');

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const handleTrigger = async () => {
    setReminderMsg('Sending...');
    try {
      const result = await triggerReminder();
      setReminderMsg(result.message);
    } catch {
      setReminderMsg('Failed to trigger reminders.');
    }
    setTimeout(() => setReminderMsg(''), 5000);
  };

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="loading">Loading dashboard...</p>;

  const cards = [
    { label: 'Total Tasks', value: stats.total, color: '#6366f1' },
    { label: 'Pending', value: stats.pending, color: '#f59e0b' },
    { label: 'Completed', value: stats.completed, color: '#10b981' },
    { label: 'Overdue', value: stats.overdue, color: '#ef4444' },
    { label: 'Due in 24h', value: stats.dueSoon, color: '#3b82f6' },
  ];

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card" style={{ borderTop: `4px solid ${c.color}` }}>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '32px' }}>
        <button className="btn btn-primary" onClick={handleTrigger}>🔔 Test Reminders Now</button>
        {reminderMsg && <p style={{ marginTop: '12px', color: '#6366f1', fontWeight: 600 }}>{reminderMsg}</p>}
      </div>
    </div>
  );
}
