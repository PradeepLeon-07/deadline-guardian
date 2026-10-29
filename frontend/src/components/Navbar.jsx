export default function Navbar({ page, setPage }) {
  const links = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'deadlines', label: '📋 Deadlines' },
    { key: 'add', label: '➕ Add Deadline' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">⏰ Deadline Guardian</div>
      <div className="navbar-links">
        {links.map((l) => (
          <button
            key={l.key}
            className={`nav-btn${page === l.key ? ' active' : ''}`}
            onClick={() => setPage(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
