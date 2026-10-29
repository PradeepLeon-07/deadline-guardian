import { useState, Component } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DeadlineList from './components/DeadlineList';
import DeadlineForm from './components/DeadlineForm';
import './App.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '32px' }}>
          <p className="error">Something went wrong: {this.state.error}</p>
          <button className="btn btn-primary" onClick={() => this.setState({ error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} />
      <main className="main">
        <ErrorBoundary key={page}>
          {page === 'dashboard' && <Dashboard />}
          {page === 'deadlines' && <DeadlineList />}
          {page === 'add' && <DeadlineForm onSaved={() => setPage('deadlines')} />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
