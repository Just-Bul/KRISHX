const CropRecommendations = ({ soilType, soilConfidence = {}, crops, confidence = {}, onSelect, onBack }) => {
  const topSoilPct = soilConfidence[soilType];

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2>Select a Crop</h2>
        </div>
        <p className="panel-subtitle">
          Recommendations for{' '}
          <strong style={{ color: '#2d6a4f', fontSize: '1.05em' }}>
            {soilType || 'your soil'}
          </strong>{' '}
          soil
          {topSoilPct !== undefined && (
            <span style={{ color: '#555', fontWeight: 400 }}> ({topSoilPct}% confidence)</span>
          )}
          , ranked by compatibility with your temperature, humidity, moisture, and nutrient levels.
        </p>
      </div>

      <div style={{
        display: 'inline-block',
        background: '#ecfdf5',
        border: '1px solid #6ee7b7',
        borderRadius: '8px',
        padding: '0.45rem 1rem',
        marginBottom: '1.2rem',
        fontSize: '0.9rem',
        color: '#065f46',
      }}>
        Predicted Soil Type: <strong>{soilType || '—'}</strong>
      </div>

      <div className="card-grid">
        {crops.map((crop, index) => {
          const pct = confidence[crop];
          return (
            <article key={crop} className="crop-card">
              <div className="crop-rank">#{index + 1}</div>
              <h3>{crop}</h3>

              {pct !== undefined && (
                <div style={{ margin: '0.4rem 0 0.6rem' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.8rem', color: '#555', marginBottom: '4px'
                  }}>
                    <span>Match score</span>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{
                    height: '6px', borderRadius: '3px',
                    background: '#e5e7eb', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: index === 0 ? '#2d6a4f' : '#74c69d',
                      borderRadius: '3px', transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              )}

              <button className="btn ghost" onClick={() => onSelect(crop)}>
                Use {crop}
              </button>
            </article>
          );
        })}

        {crops.length === 0 && (
          <div className="empty-state">
            <p>No matching crops found. Try adjusting your soil inputs.</p>
          </div>
        )}
      </div>

      <div className="panel-actions">
        <button className="btn secondary" onClick={onBack}>
          Adjust Soil Metrics
        </button>
      </div>
    </div>
  );
};

export default CropRecommendations;
