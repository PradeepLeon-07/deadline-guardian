import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DeadlineList from './components/DeadlineList';
import DeadlineForm from './components/DeadlineForm';
import './App.css';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} />
      <main className="main">
        {page === 'dashboard' && <Dashboard />}
        {page === 'deadlines' && <DeadlineList />}
        {page === 'add' && (
          <DeadlineForm onSaved={() => setPage('deadlines')} />
        )}
      </main>
    </div>
  );
}
