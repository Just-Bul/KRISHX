import { useEffect, useState } from 'react';
import { Sprout, Bug, ClipboardList } from 'lucide-react';
import SoilMetricsForm from './components/SoilMetricsForm';
import CropRecommendations from './components/CropRecommendations';
import FertilizerRecommendations from './components/FertilizerRecommendations';
import PestDetection from './components/PestDetection';
import PredictionHistory from './components/PredictionHistory';
import { predictAll, recommendFertilizer, getPestClasses, getModelInfo, getHistory } from './api';
import './App.css';

const INITIAL_METRICS = {
  temperature: '',
  humidity: '',
  moisture: '',
  nitrogen: '',
  phosphorous: '',
  potassium: '',
};

function App() {
  const [activeTab, setActiveTab] = useState('soil');
  const [currentStep, setCurrentStep] = useState('input');
  const [metrics, setMetrics] = useState(INITIAL_METRICS);

  // Results from /predict
  const [soilType, setSoilType] = useState('');
  const [soilConfidence, setSoilConfidence] = useState({});
  const [cropList, setCropList] = useState([]);
  const [cropConfidence, setCropConfidence] = useState({});
  const [pests, setPests] = useState([]);
  const [soilNote, setSoilNote] = useState('');
  const [disclaimer, setDisclaimer] = useState('');

  // Fertilizer
  const [selectedCrop, setSelectedCrop] = useState('');
  const [fertilizerRecommendation, setFertilizerRecommendation] = useState(null);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [pestClasses, setPestClasses] = useState([]);

  // History
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    refreshPestMeta();
  }, []);

  const refreshPestMeta = async () => {
    try {
      const classesResponse = await getPestClasses();
      if (classesResponse.success) setPestClasses(classesResponse.classes || []);
    } catch (error) {
      console.error('Failed to load pest classes', error);
    }
    try {
      const info = await getModelInfo();
      setModelInfo(info);
    } catch (error) {
      console.error('Failed to load model info', error);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getHistory();
      setHistoryRecords(data.records || []);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Called when user switches to History tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') loadHistory();
  };

  const handleSoilSubmit = async (values) => {
    setMetrics(values);
    setStatus(null);
    setLoading(true);

    const payload = {
      Temparature: parseFloat(values.temperature),
      Humidity: parseFloat(values.humidity),
      Moisture: parseFloat(values.moisture),
      Nitrogen: parseFloat(values.nitrogen),
      Phosphorous: parseFloat(values.phosphorous),
      Potassium: parseFloat(values.potassium),
    };

    if (Object.values(payload).some(Number.isNaN)) {
      setStatus({ type: 'error', message: 'Please fill in all required soil metrics.' });
      setLoading(false);
      return;
    }

    try {
      const response = await predictAll(payload);
      setSoilType(response?.['Soil Type'] || 'Unknown');
      setSoilConfidence(response?.['Soil Confidence'] || {});
      setCropList(response?.['Recommended Crops'] || []);
      setCropConfidence(response?.['Crop Confidence'] || {});
      setPests(response?.['Pests'] || []);
      setSoilNote(response?.['Soil Fertilizer Note'] || '');
      setDisclaimer(response?.['Disclaimer'] || '');
      setCurrentStep('crops');
      setStatus({ type: 'success', message: 'Analysis complete. Soil type auto-detected.' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Unable to fetch recommendations. Make sure the backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCropSelection = async (crop) => {
    if (!crop) return;
    setStatus(null);
    setLoading(true);

    const payload = {
      Crop: crop,
      Nitrogen: parseFloat(metrics.nitrogen),
      Phosphorous: parseFloat(metrics.phosphorous),
      Potassium: parseFloat(metrics.potassium),
      'Soil Type': soilType,
    };

    if ([payload.Nitrogen, payload.Phosphorous, payload.Potassium].some(Number.isNaN)) {
      setStatus({ type: 'error', message: 'Please provide valid nutrient values.' });
      setLoading(false);
      return;
    }

    try {
      const response = await recommendFertilizer(payload);
      setSelectedCrop(crop);
      setFertilizerRecommendation(response);
      setCurrentStep('fertilizer');
      setStatus({ type: 'success', message: 'Fertilizer guidance ready.' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Unable to fetch fertilizer recommendation.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMetrics(INITIAL_METRICS);
    setCropList([]);
    setCropConfidence({});
    setSoilType('');
    setSoilConfidence({});
    setSelectedCrop('');
    setFertilizerRecommendation(null);
    setPests([]);
    setSoilNote('');
    setDisclaimer('');
    setCurrentStep('input');
    setStatus(null);
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">KRISHX</p>
          <h1>Intelligent Farming Recommendations</h1>
          <p>Combine soil analytics, fertilizer planning, and pest detection in one streamlined assistant.</p>
        </div>
      </header>

      <div className="tab-bar">
        <button className={activeTab === 'soil' ? 'active' : ''} onClick={() => handleTabChange('soil')}>
          <Sprout size={18} />
          Crop & Fertilizer
        </button>
        <button className={activeTab === 'pest' ? 'active' : ''} onClick={() => handleTabChange('pest')}>
          <Bug size={18} />
          Pest Detection
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => handleTabChange('history')}>
          <ClipboardList size={18} />
          History
        </button>
      </div>

      {status && <div className={`status-banner ${status.type}`}>{status.message}</div>}
      {loading && <div className="status-banner loading">Processing request…</div>}

      {activeTab === 'soil' && (
        <>
          {currentStep === 'input' && (
            <SoilMetricsForm initialValues={metrics} onSubmit={handleSoilSubmit} loading={loading} />
          )}
          {currentStep === 'crops' && (
            <CropRecommendations
              soilType={soilType}
              soilConfidence={soilConfidence}
              crops={cropList}
              confidence={cropConfidence}
              onSelect={handleCropSelection}
              onBack={() => setCurrentStep('input')}
            />
          )}
          {currentStep === 'fertilizer' && fertilizerRecommendation && (
            <FertilizerRecommendations
              recommendation={fertilizerRecommendation}
              selectedCrop={selectedCrop}
              soilType={soilType}
              pests={pests}
              soilNote={soilNote}
              disclaimer={disclaimer}
              onBack={() => setCurrentStep('crops')}
              onReset={handleReset}
            />
          )}
        </>
      )}

      {activeTab === 'pest' && (
        <PestDetection pestClasses={pestClasses} modelInfo={modelInfo} onRefreshMeta={refreshPestMeta} />
      )}

      {activeTab === 'history' && (
        <PredictionHistory
          records={historyRecords}
          loading={historyLoading}
          onRefresh={loadHistory}
        />
      )}
    </div>
  );
}

export default App;
