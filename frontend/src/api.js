import axios from 'axios';

const API_URL = 'http://localhost:5000';

// All-in-one prediction endpoint (soil auto-predict + crops + fertilizer + pests + saves to DB)
export const predictAll = (payload) =>
  axios.post(`${API_URL}/predict`, payload).then(res => res.data);

// Individual endpoints (still available for direct use)
export const recommendCrops = (payload) =>
  axios.post(`${API_URL}/recommend_crops`, payload).then(res => res.data);

export const recommendFertilizer = (payload) =>
  axios.post(`${API_URL}/recommend_fertilizer`, payload).then(res => res.data);

// History
export const getHistory = () =>
  axios.get(`${API_URL}/history`).then(res => res.data);

// Pest detection APIs
export const detectPest = (file) => {
  const form = new FormData();
  form.append('image', file);
  return axios.post(`${API_URL}/pest-detect`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export const detectPestDetailed = (file) => {
  const form = new FormData();
  form.append('image', file);
  return axios.post(`${API_URL}/pest-detect`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export const getPestClasses = () =>
  axios.get(`${API_URL}/pest_classes`).then(res => res.data);

export const getModelInfo = () =>
  axios.get(`${API_URL}/model_info`).then(res => res.data);

export const getSoilTypes = () =>
  axios.get(`${API_URL}/soil_types`).then(res => res.data);

export const getHealthStatus = () =>
  axios.get(`${API_URL}/health`).then(res => res.data);

export const getTrainingVisualization = (filename) =>
  `${API_URL}/training_visualizations/${filename}`;
