import { useEffect, useState } from 'react';
import { api } from '../services/api';
import DeadlineCard from './DeadlineCard';
import DeadlineForm from './DeadlineForm';

export default function DeadlineList() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState('');
  const [remindingId, setRemindingId] = useState(null);

  const load = () => {
    setLoading(true);
    api.getDeadlines()
      .then(setDeadlines)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleComplete = async (id) => {
    await api.completeDeadline(id);
    showToast('Marked as completed!');
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this deadline?')) return;
    await api.deleteDeadline(id);
    showToast('Deleted.');
    load();
  };

  const handleRemind = async (deadline) => {
    setRemindingId(deadline.rowKey);
    try {
      const result = await api.sendDeadlineReminder(deadline.rowKey);
      showToast(result.message);
    } catch (e) {
      showToast(`Reminder failed: ${e.message}`);
    } finally {
      setRemindingId(null);
    }
  };

  const filtered = deadlines.filter((d) => {
    const matchSearch = !search || (d.Title || '').toLowerCase().includes(search.toLowerCase()) || (d.Subject || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.Status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (editTarget) {
    return <DeadlineForm existing={editTarget} onSaved={() => { setEditTarget(null); load(); }} onCancel={() => setEditTarget(null)} />;
  }

  return (
    <div>
      <h2 className="section-title">Deadlines</h2>
      {toast && <div className="toast">{toast}</div>}
      <div className="filters">
        <input className="input" placeholder="Search title or subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && filtered.length === 0 && <p className="empty">No deadlines found.</p>}
      <div className="cards-grid">
        {filtered.map((d) => (
          <DeadlineCard
            key={d.rowKey}
            deadline={d}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={setEditTarget}
            onRemind={handleRemind}
            isReminding={remindingId === d.rowKey}
            isReminderPending={remindingId !== null}
          />
        ))}
      </div>
    </div>
  );
}
