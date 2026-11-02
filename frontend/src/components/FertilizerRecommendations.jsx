import PestInfo from './PestInfo';

const FertilizerRecommendations = ({
  recommendation,
  selectedCrop,
  soilType,
  pests = [],
  soilNote = '',
  disclaimer = '',
  onBack,
  onReset,
}) => {
  const message = recommendation?.['Recommended Fertilizer'] || recommendation?.error || 'No recommendation available';
  const hasError = Boolean(recommendation?.error);

  return (
    <>
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Step 3</p>
            <h2>Fertilizer Strategy</h2>
          </div>
          <p className="panel-subtitle">
            Tailored guidance for <strong>{selectedCrop}</strong>
            {soilType && (
              <> on <strong style={{ color: '#2d6a4f' }}>{soilType}</strong> soil</>
            )}
            . Apply the recommended mix to balance soil nutrients.
          </p>
        </div>

        <div className="fertilizer-card" style={hasError ? { borderColor: '#fca5a5', background: '#fff5f5' } : {}}>
          <h3>Recommendation</h3>
          <p style={{ color: hasError ? '#b91c1c' : undefined }}>{message}</p>
        </div>

        <div className="panel-actions">
          <button className="btn secondary" onClick={onBack}>
            Back to Crop List
          </button>
          <button className="btn ghost" onClick={onReset}>
            Start Over
          </button>
        </div>
      </div>

      <PestInfo pests={pests} soilNote={soilNote} disclaimer={disclaimer} />
    </>
  );
};

export default FertilizerRecommendations;
