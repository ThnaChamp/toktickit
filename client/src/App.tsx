import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const checkSystem = async () => {
    try {
      setStatus('Loading...');
      setError('');
      
      const res = await fetch('http://localhost:3000/api/health');
      if (!res.ok) throw new Error('Unable to connect to TokTickIT API');
      
      const data = await res.json();
      setStatus(`System Status: Online (${data.service})`);
    } catch (err) {
      setStatus('');
      setError('System Status: Offline - Unable to connect to TokTickIT API');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Tok TickIT IT Service Desk</h2>
      <button className="btn btn-primary my-3" onClick={checkSystem}>
        [Check System]
      </button>
      
      {status && <div className="alert alert-success">{status}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}

export default App;