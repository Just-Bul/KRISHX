import { useState } from 'react';
import { detectPest, detectPestDetailed } from '../api';

const PestDetection = ({ pestClasses, modelInfo, onRefreshMeta }) => {
  const [file, setFile] = useState(null);
  const [detailed, setDetailed] = useState(true);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setStatus(null);

    try {
      const response = detailed ? await detectPestDetailed(file) : await detectPest(file);
      setResult(response);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Pest detection failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (detailed && Array.isArray(result.all_predictions)) {
      return (
        <div className="pest-results">
          {result.all_predictions.map((prediction, index) => (
            <div key={`${prediction.name}-${index}`} className={`prediction ${index === 0 ? 'primary' : ''}`}>
              <div>
                <p className="prediction-rank">#{index + 1}</p>
                <h4>{prediction.name}</h4>
                <p className="confidence">{prediction.confidence.toFixed(1)}% confidence</p>
              </div>
              <div className="confidence-bar">
                <div style={{ width: `${prediction.confidence}%` }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (result.insect_name) {
      return (
        <div className="pest-results">
          <div className="prediction primary">
            <h4>{result.insect_name}</h4>
            <p className="confidence">{result.confidence.toFixed(1)}% confidence</p>
          </div>
        </div>
      );
    }

    return <p className="panel-subtitle">No predictions available.</p>;
  };

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Computer Vision Lab</p>
          <h2>Pest Detection</h2>
        </div>
        <p className="panel-subtitle">
          Upload a field photo, and the EfficientNet-B4 model will classify the pest with top-k probabilities.
        </p>
      </div>

      <div className="model-meta">
        <div>
          <p className="meta-label">Classes</p>
          <p className="meta-value">{modelInfo?.num_classes ?? 0}</p>
        </div>
        <div>
          <p className="meta-label">Status</p>
          <p className={`meta-value ${modelInfo?.model_loaded ? 'ok' : 'warn'}`}>
            {modelInfo?.model_loaded ? 'Healthy' : 'Unavailable'}
          </p>
        </div>
        <button className="btn ghost small" onClick={onRefreshMeta}>
          Refresh
        </button>
      </div>

      <form className="upload-card" onSubmit={handleSubmit}>
        <label className="upload-input">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <p>{file ? file.name : 'Drag & drop or click to select an image (JPG/PNG).'}</p>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={detailed}
            onChange={(event) => setDetailed(event.target.checked)}
          />
          Show detailed (Top-5) predictions
        </label>

        <button className="btn primary" type="submit" disabled={!file || loading}>
          {loading ? 'Detecting...' : 'Detect Pest'}
        </button>

        {status && <p className={`status ${status.type}`}>{status.message}</p>}
      </form>

      {renderResult()}

      {pestClasses.length > 0 && (
        <div className="chip-grid">
          {pestClasses.map((name) => (
            <span key={name} className="chip">
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PestDetection;


