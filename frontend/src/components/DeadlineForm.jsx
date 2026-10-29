import { useState } from 'react';
import { api } from '../services/api';

const EMPTY = { title: '', subject: '', description: '', dueDateTime: '', priority: 'Medium', studentEmail: '' };

function parseEmails(value) {
  return value.split(',').map((e) => e.trim()).filter(Boolean);
}

function validateEmails(value) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = parseEmails(value);
  if (emails.length === 0) return 'At least one email is required.';
  const invalid = emails.find((e) => !regex.test(e));
  if (invalid) return `Invalid email: ${invalid}`;
  return '';
}

export default function DeadlineForm({ onSaved, onCancel, existing }) {
  const [form, setForm] = useState(
    existing
      ? {
          title: existing.Title,
          subject: existing.Subject,
          description: existing.Description,
          dueDateTime: existing.DueDateTimeUtc.slice(0, 16),
          priority: existing.Priority,
          studentEmail: existing.StudentEmail,
        }
      : EMPTY
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (new Date(form.dueDateTime) < new Date()) {
      setError('Due date must be in the future.');
      return;
    }
    const emailError = validateEmails(form.studentEmail);
    if (emailError) { setError(emailError); return; }
    setSaving(true);
    try {
      if (existing) {
        await api.updateDeadline(existing.rowKey, form);
      } else {
        await api.createDeadline(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">{existing ? 'Edit Deadline' : 'Add Deadline'}</h2>
      {error && <p className="error">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <label>Title *</label>
        <input className="input" value={form.title} onChange={set('title')} required />

        <label>Subject *</label>
        <input className="input" value={form.subject} onChange={set('subject')} required />

        <label>Description</label>
        <textarea className="input" rows={3} value={form.description} onChange={set('description')} />

        <label>Due Date & Time *</label>
        <input className="input" type="datetime-local" value={form.dueDateTime} onChange={set('dueDateTime')} required />

        <label>Priority *</label>
        <select className="input" value={form.priority} onChange={set('priority')}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <label>Student Emails * <span style={{fontWeight:400,color:'#94a3b8'}}>(separate multiple with commas)</span></label>
        <input className="input" placeholder="e.g. a@gmail.com, b@gmail.com" value={form.studentEmail} onChange={set('studentEmail')} required />

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : existing ? 'Update' : 'Add Deadline'}
          </button>
          {onCancel && <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
