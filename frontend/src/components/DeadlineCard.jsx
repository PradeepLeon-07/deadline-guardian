export default function DeadlineCard({
  deadline,
  onComplete,
  onDelete,
  onEdit,
  onRemind,
  isReminding,
  isReminderPending,
}) {
  const due = new Date(deadline.DueDateTimeUtc);
  const now = new Date();
  const diffMs = due - now;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const isOverdue = diffMs < 0 && deadline.Status !== 'Completed';
  const isDueSoon = diffMs > 0 && diffH < 24 && deadline.Status === 'Pending';

  const priorityColor = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

  let countdownText = '';
  if (deadline.Status === 'Completed') countdownText = '✅ Completed';
  else if (isOverdue) countdownText = '🔴 Overdue';
  else if (diffH < 1) countdownText = `⚡ ${diffM}m left`;
  else if (diffH < 24) countdownText = `⏳ ${diffH}h ${diffM}m left`;
  else countdownText = `📅 ${Math.floor(diffH / 24)}d ${diffH % 24}h left`;

  return (
    <div className={`deadline-card${isOverdue ? ' overdue' : ''}${isDueSoon ? ' due-soon' : ''}`}>
      <div className="card-header">
        <span className="card-title">{deadline.Title}</span>
        <span className="priority-badge" style={{ background: priorityColor[deadline.Priority] }}>
          {deadline.Priority}
        </span>
      </div>
      <div className="card-subject">{deadline.Subject}</div>
      {deadline.Description && <div className="card-desc">{deadline.Description}</div>}
      <div className="card-meta">
        <span>{due.toLocaleString()}</span>
        <span className="countdown">{countdownText}</span>
      </div>
      <div className="card-email">📧 {(deadline.StudentEmail || '').split(',').map(e => e.trim()).join(' • ')}</div>
      <div className="card-actions">
        <button
          className="btn btn-primary"
          onClick={() => onRemind(deadline)}
          disabled={isReminderPending}
        >
          {isReminding ? 'Sending...' : 'Send Reminder'}
        </button>
        {deadline.Status !== 'Completed' && (
          <button className="btn btn-success" onClick={() => onComplete(deadline.rowKey)}>Complete</button>
        )}
        <button className="btn btn-secondary" onClick={() => onEdit(deadline)}>Edit</button>
        <button className="btn btn-danger" onClick={() => onDelete(deadline.rowKey)}>Delete</button>
      </div>
    </div>
  );
}
