const PredictionHistory = ({ records = [], loading = false, onRefresh }) => {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Records</p>
          <h2>Prediction History</h2>
        </div>
        <p className="panel-subtitle">
          All saved soil analysis and crop recommendation results.
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button className="btn secondary" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {records.length === 0 && !loading && (
        <div className="empty-state">
          <p>No predictions saved yet. Analyze a soil profile to create the first record.</p>
        </div>
      )}

      {records.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                {['#', 'Timestamp', 'Soil Type', 'Top Crop', 'N', 'P', 'K', 'Temp', 'Humidity', 'Moisture', 'Fertilizer', 'Pests'].map(h => (
                  <th key={h} style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={td}>{r.id}</td>
                  <td style={td}>{r.timestamp}</td>
                  <td style={{ ...td, fontWeight: 700, color: '#2d6a4f' }}>{r.predicted_soil_type}</td>
                  <td style={td}>{r.recommended_crop}</td>
                  <td style={td}>{r.nitrogen}</td>
                  <td style={td}>{r.phosphorous}</td>
                  <td style={td}>{r.potassium}</td>
                  <td style={td}>{r.temperature}°C</td>
                  <td style={td}>{r.humidity}%</td>
                  <td style={td}>{r.moisture}%</td>
                  <td style={td}>
                    {r.recommended_fertilizer?.['Recommended Fertilizer'] || '—'}
                  </td>
                  <td style={td}>
                    {Array.isArray(r.possible_pests) ? r.possible_pests.join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const td = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap',
};

export default PredictionHistory;
