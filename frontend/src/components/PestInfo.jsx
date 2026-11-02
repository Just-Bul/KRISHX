const PestInfo = ({ pests = [], soilNote = '', disclaimer = '' }) => {
  if (pests.length === 0) return null;

  return (
    <div className="panel" style={{ marginTop: '1.5rem' }}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Pest Alert</p>
          <h2>Possible Pests & Insects</h2>
        </div>
        <p className="panel-subtitle">
          Common pests for this crop and soil combination, with recommended treatments.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {pests.map((pest) => (
          <div key={pest.name} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '1rem 1.2rem',
            background: '#fafafa',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#111' }}>{pest.name}</h3>
              <span style={{ fontSize: '0.78rem', color: '#888', fontStyle: 'italic' }}>
                {pest.scientific_name}
              </span>
            </div>

            <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#444' }}>
              <strong>Symptoms:</strong> {pest.symptoms}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.5rem',
            }}>
              <div style={tagBox('#fff3cd', '#92400e')}>
                <strong>Chemical:</strong> {pest.pesticide}
              </div>
              <div style={tagBox('#dcfce7', '#166534')}>
                <strong>Organic:</strong> {pest.organic}
              </div>
              <div style={tagBox('#eff6ff', '#1e40af')}>
                <strong>Fertilizer tip:</strong> {pest.fertilizer_note}
              </div>
            </div>
          </div>
        ))}
      </div>

      {soilNote && (
        <div style={{
          marginTop: '1.2rem',
          padding: '0.85rem 1rem',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontSize: '0.88rem',
          color: '#166534',
        }}>
          <strong>Soil-specific fertilizer guidance:</strong> {soilNote}
        </div>
      )}

      {disclaimer && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          background: '#fef9c3',
          border: '1px solid #fde047',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: '#713f12',
          lineHeight: 1.5,
        }}>
          ⚠ <strong>Disclaimer:</strong> {disclaimer}
        </div>
      )}
    </div>
  );
};

const tagBox = (bg, color) => ({
  background: bg,
  color: color,
  borderRadius: '6px',
  padding: '0.45rem 0.65rem',
  fontSize: '0.82rem',
  lineHeight: 1.5,
});

export default PestInfo;
