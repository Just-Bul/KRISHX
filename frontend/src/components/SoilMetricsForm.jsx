import { useState, useEffect } from 'react';

const NUMERIC_FIELDS = [
  { name: 'temperature',  label: 'Temperature (°C)',   placeholder: '28',  required: true },
  { name: 'humidity',     label: 'Humidity (%)',        placeholder: '60',  required: true },
  { name: 'moisture',     label: 'Soil Moisture (%)',   placeholder: '45',  required: true },
  { name: 'nitrogen',     label: 'Nitrogen (ppm)',      placeholder: '20',  required: true },
  { name: 'phosphorous',  label: 'Phosphorous (ppm)',   placeholder: '18',  required: true },
  { name: 'potassium',    label: 'Potassium (ppm)',     placeholder: '5',   required: true },
];

const SoilMetricsForm = ({ initialValues, onSubmit, loading }) => {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Step 1</p>
          <h2>Enter Soil & Environmental Metrics</h2>
        </div>
        <p className="panel-subtitle">
          Provide your field sensor readings or lab report values.
          The system will automatically determine your soil type and recommend
          the most suitable crop.
        </p>
      </div>

      <div className="form-grid">
        {NUMERIC_FIELDS.map(field => (
          <label key={field.name} className="form-field">
            <span>{field.label}</span>
            <input
              type="number"
              step="0.1"
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          </label>
        ))}
      </div>

      <button className="btn primary" type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Soil Profile'}
      </button>
    </form>
  );
};

export default SoilMetricsForm;
