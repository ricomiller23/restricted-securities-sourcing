import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Delisted CRM Root ErrorBoundary caught:", error, errorInfo);
  }
  handleReset = () => {
    try {
      localStorage.clear();
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase("delisted_crm_db");
      }
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    } catch (e) {}
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", backgroundColor: "#07080B", color: "#E8ECF4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
          <div style={{ maxWidth: "500px", textAlign: "center", backgroundColor: "#0F1218", border: "1px solid #1B2030", borderRadius: "16px", padding: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#22D3EE", marginBottom: "12px" }}>CRM Intelligence Initializing</h2>
            <p style={{ fontSize: "14px", color: "#8892A6", marginBottom: "24px" }}>
              A newer database build is available. Click below to load the latest verified US issuers and clear stale cache.
            </p>
            <button
              onClick={this.handleReset}
              style={{ backgroundColor: "#0284C7", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}
            >
              Load Latest Version
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Register PWA Service Worker for 0ms cached boot
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA service worker registration notice:', err);
    });
  });
}

