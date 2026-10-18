import { useState } from 'react';
import { uploadHistoryFile } from '../api.js';

export default function UploadHistory({ onLoaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await uploadHistoryFile(file);
      onLoaded(result.visitsLoaded);
    } catch (err) {
      setError('Could not parse that file. Make sure it is a copy of the browser\'s SQLite "History" file.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="upload-box">
        <p><strong>Load your browsing history</strong></p>
        <p style={{ fontSize: '0.85rem' }}>
          Copy your browser's <code>History</code> file (Chrome/Edge, close the browser
          first) and upload it below. Everything is parsed locally by your own backend —
          nothing is sent anywhere else.
        </p>
        <input type="file" onChange={handleFile} disabled={loading} />
        {loading && <p>Parsing…</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
      </div>
    </div>
  );
}
