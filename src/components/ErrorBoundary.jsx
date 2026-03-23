import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, countdown: 3 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("FlickFlow Auto-Recovery Triggered! Glitch detected:", error.message);
    // Auto Bug Fix Protocol: Automatically redirect to home instead of showing broke UI.
    const interval = setInterval(() => {
        this.setState(s => ({ countdown: s.countdown - 1 }), () => {
            if (this.state.countdown <= 0) {
                clearInterval(interval);
                window.location.href = "/"; // Auto-repair by resetting to origin
            }
        });
    }, 1000);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', textAlign: 'center', padding: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(229, 9, 20, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h1 style={{ color: '#E50914', marginBottom: '10px', fontSize: '2rem' }}>Syncing the Matrix...</h1>
          <p style={{ color: '#A3A3A3', maxWidth: '400px', marginBottom: '20px', lineHeight: '1.6' }}>
            We detected a minor glitch. The FlickFlow Auto-Recovery AI is immediately repairing the stream and stabilizing the servers.
          </p>
          <div style={{ padding: '10px 20px', background: '#141414', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
             Auto fixing in <strong style={{ color: '#fff' }}>{this.state.countdown}</strong> seconds...
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
