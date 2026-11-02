import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import { pestAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

const RISK_CONFIG = {
  High:   { color: COLORS.ERROR,   bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   icon: 'warning' },
  Medium: { color: COLORS.WARNING, bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  icon: 'alert-circle' },
  Low:    { color: COLORS.SUCCESS, bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  icon: 'checkmark-circle' },
};

function SectionCard({ icon, title, iconColor, children }) {
  return (
    <View style={[styles.sectionCard, SHADOW.SM]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: iconColor + '18' }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ResultView({ result, onReset }) {
  const risk = RISK_CONFIG[result.risk_level] || RISK_CONFIG.Low;
  const [expanded, setExpanded] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const toggle = (key) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const date = new Date().toLocaleString();
      const riskColor = risk.color;
      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>KrishX Pest Detection Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #1e293b; padding: 24px; font-size: 13px; }
  .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 22px 24px; border-radius: 12px; margin-bottom: 20px; }
  .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
  .header p { opacity: 0.8; font-size: 12px; }
  .identity { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
  .insect-name { font-size: 22px; font-weight: bold; color: #1e293b; margin-bottom: 4px; }
  .scientific { font-style: italic; color: #64748b; font-size: 13px; margin-bottom: 12px; }
  .badge-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
  .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; border: 1px solid; }
  .alt-section { border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 10px; }
  .alt-title { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .alt-row { display: flex; justify-content: space-between; font-size: 12px; color: #475569; padding: 2px 0; }
  .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
  .section h2 { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
  .section p { font-size: 12px; color: #475569; line-height: 1.6; }
  .safety { background: #eff6ff; border-radius: 6px; padding: 8px; margin-top: 8px; font-size: 11px; color: #1e40af; line-height: 1.5; }
  .disclaimer { background: #fff7ed; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; font-size: 11px; color: #92400e; line-height: 1.6; margin-top: 8px; }
  .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
</style>
</head><body>
<div class="header">
  <h1>KrishX Smart Agriculture</h1>
  <p>Pest Detection &amp; Treatment Report</p>
  <p style="margin-top:6px">Generated: ${date}</p>
</div>

<div class="identity">
  <div class="insect-name">${result.insect_name || 'Unknown Pest'}</div>
  ${result.scientific_name ? `<div class="scientific">${result.scientific_name}</div>` : ''}
  <div class="badge-row">
    <span class="badge" style="color:#6D28D9;border-color:#ddd6fe;background:#f5f3ff">${result.confidence}% Confidence</span>
    <span class="badge" style="color:${riskColor};border-color:${riskColor}40;background:${riskColor}15">${result.risk_level} Risk</span>
  </div>
  ${result.all_predictions?.length > 1 ? `
  <div class="alt-section">
    <div class="alt-title">Other Possibilities</div>
    ${result.all_predictions.slice(1).map((p) =>
      `<div class="alt-row"><span>${p.name}</span><span>${p.confidence}%</span></div>`
    ).join('')}
  </div>` : ''}
</div>

${result.symptoms ? `
<div class="section">
  <h2 style="color:#f59e0b">Symptoms to Watch</h2>
  <p>${result.symptoms}</p>
</div>` : ''}

${result.treatment?.pesticide ? `
<div class="section">
  <h2 style="color:#6D28D9">Recommended Pesticide</h2>
  <p>${result.treatment.pesticide}</p>
  <div class="safety">Wear protective gear. Follow label dosage. Keep away from water sources.</div>
</div>` : ''}

${result.treatment?.organic_control ? `
<div class="section">
  <h2 style="color:#10b981">Organic / IPM Control</h2>
  <p>${result.treatment.organic_control}</p>
</div>` : ''}

${result.treatment?.prevention ? `
<div class="section">
  <h2 style="color:#3b82f6">Prevention &amp; Nutrition</h2>
  <p>${result.treatment.prevention}</p>
</div>` : ''}

<div class="disclaimer">
  <b>Important Disclaimer:</b> ${result.disclaimer || 'Please consult a qualified agricultural professional before applying any pesticide, fertilizer, or chemical medicine to crops.'}
</div>

<div class="footer">Generated by KrishX Smart Agriculture AI &bull; ${date}</div>
</body></html>`;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch {
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Insect Identity Card */}
      <View style={[styles.identityCard, SHADOW.MD]}>
        <View style={styles.identityTop}>
          <View style={styles.bugIconWrap}>
            <Ionicons name="bug" size={38} color={COLORS.ACCENT_DARK} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insectName}>{result.insect_name}</Text>
            {result.scientific_name ? (
              <Text style={styles.scientificName}>{result.scientific_name}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.confidenceBadge}>
            <Ionicons name="analytics-outline" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.confidenceText}>{result.confidence}% Confidence</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: risk.bg, borderColor: risk.border }]}>
            <Ionicons name={risk.icon} size={14} color={risk.color} />
            <Text style={[styles.riskText, { color: risk.color }]}>{result.risk_level} Risk</Text>
          </View>
        </View>

        {/* Alternate predictions */}
        {result.all_predictions?.length > 1 && (
          <View style={styles.altPreds}>
            <Text style={styles.altTitle}>Other possibilities:</Text>
            {result.all_predictions.slice(1).map((p) => (
              <View key={p.name} style={styles.altRow}>
                <Text style={styles.altName}>{p.name}</Text>
                <Text style={styles.altConf}>{p.confidence}%</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Symptoms */}
      {result.symptoms ? (
        <SectionCard icon="eye-outline" title="Symptoms to Watch" iconColor={COLORS.WARNING}>
          <Text style={styles.bodyText}>{result.symptoms}</Text>
        </SectionCard>
      ) : null}

      {/* Chemical Treatment */}
      {result.treatment?.pesticide ? (
        <SectionCard icon="flask" title="Recommended Pesticide" iconColor={COLORS.PRIMARY_LIGHT}>
          <Text style={styles.bodyText}>{result.treatment.pesticide}</Text>
          <View style={styles.safetyNote}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.INFO} />
            <Text style={styles.safetyText}>
              Wear protective gear. Follow label dosage. Keep away from water sources.
            </Text>
          </View>
        </SectionCard>
      ) : null}

      {/* Organic / IPM Control */}
      {result.treatment?.organic_control ? (
        <SectionCard icon="leaf" title="Organic / IPM Control" iconColor={COLORS.SUCCESS}>
          <Text style={styles.bodyText}>{result.treatment.organic_control}</Text>
        </SectionCard>
      ) : null}

      {/* Prevention */}
      {result.treatment?.prevention ? (
        <SectionCard icon="shield-outline" title="Prevention & Nutrition" iconColor={COLORS.INFO}>
          <Text style={styles.bodyText}>{result.treatment.prevention}</Text>
        </SectionCard>
      ) : null}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={18} color={COLORS.WARNING} />
        <Text style={styles.disclaimerText}>
          <Text style={{ fontWeight: FONTS.WEIGHT.BOLD }}>Disclaimer: </Text>
          {result.disclaimer || 'Please consult a qualified agricultural professional before applying any pesticide, fertilizer, or chemical medicine to crops.'}
        </Text>
      </View>

      <View style={styles.resultActions}>
        <TouchableOpacity style={[styles.resetBtn, { flex: 1 }]} onPress={onReset} activeOpacity={0.85}>
          <Ionicons name="camera-outline" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.resetBtnText}>New Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pdfBtn, { flex: 1 }, pdfLoading && { opacity: 0.65 }]}
          onPress={handleDownloadPDF}
          disabled={pdfLoading}
          activeOpacity={0.85}
        >
          {pdfLoading
            ? <ActivityIndicator size="small" color={COLORS.SUCCESS} />
            : <Ionicons name="document-text-outline" size={20} color={COLORS.SUCCESS} />}
          <Text style={styles.pdfBtnText}>{pdfLoading ? 'Generating…' : 'PDF Report'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const CROP_MODES = [
  { key: 'free',      label: 'Free',        aspect: null },
  { key: 'square',    label: 'Square 1:1',  aspect: [1, 1] },
  { key: 'rectangle', label: 'Wide 4:3',    aspect: [4, 3] },
];

export default function PestDetectionScreen() {
  const nav = useNavigation();
  const { showToast, isGuest } = useApp();

  const [imageUri,  setImageUri]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);
  const [cropMode,  setCropMode]  = useState('free');

  const getPickerOptions = () => {
    const mode = CROP_MODES.find((m) => m.key === cropMode);
    const opts = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true };
    if (mode?.aspect) opts.aspect = mode.aspect;
    return opts;
  };

  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const pickFromCamera = async () => {
    const ok = await requestPermission('camera');
    if (!ok) { Alert.alert('Permission needed', 'Camera access is required to capture images.'); return; }
    const res = await ImagePicker.launchCameraAsync(getPickerOptions());
    if (!res.canceled) { setImageUri(res.assets[0].uri); setResult(null); setError(null); }
  };

  const pickFromGallery = async () => {
    const ok = await requestPermission('gallery');
    if (!ok) { Alert.alert('Permission needed', 'Gallery access is required to select images.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync(getPickerOptions());
    if (!res.canceled) { setImageUri(res.assets[0].uri); setResult(null); setError(null); }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    setLoading(true);
    setError(null);
    try {
      const data = await pestAPI.detect(imageUri);
      setResult(data);
      if (!isGuest) showToast(`Detected: ${data.insect_name}`, 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Detection failed. Ensure the backend is running.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.navigate('Home')}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="bug" size={22} color={COLORS.ACCENT} />
          <Text style={styles.headerTitle}>Pest Detection</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>

        {result ? (
          <ResultView result={result} onReset={handleReset} />
        ) : (
          <>
            {/* Upload Zone */}
            <View style={[styles.uploadCard, SHADOW.SM]}>
              <Text style={styles.uploadTitle}>Upload Insect Image</Text>
              <Text style={styles.uploadSub}>Take a clear photo of the pest or select from gallery</Text>

              {/* Crop mode selector */}
              <View style={styles.cropRow}>
                <Text style={styles.cropLabel}>Crop:</Text>
                {CROP_MODES.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.cropChip, cropMode === m.key && styles.cropChipActive]}
                    onPress={() => setCropMode(m.key)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.cropChipText, cropMode === m.key && styles.cropChipTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {imageUri ? (
                <View style={styles.previewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.preview} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)}>
                    <Ionicons name="close-circle" size={28} color={COLORS.ERROR} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderBox}>
                  <Ionicons name="bug-outline" size={56} color={COLORS.TEXT_MUTED} />
                  <Text style={styles.placeholderText}>No image selected</Text>
                </View>
              )}

              <View style={styles.pickRow}>
                <TouchableOpacity style={styles.pickBtn} onPress={pickFromCamera} activeOpacity={0.8}>
                  <Ionicons name="camera-outline" size={20} color={COLORS.PRIMARY} />
                  <Text style={styles.pickBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickBtn} onPress={pickFromGallery} activeOpacity={0.8}>
                  <Ionicons name="images-outline" size={20} color={COLORS.PRIMARY} />
                  <Text style={styles.pickBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={COLORS.ERROR} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Tips */}
            {!imageUri && (
              <View style={[styles.tipsCard, SHADOW.SM]}>
                <Text style={styles.tipsTitle}>Tips for best results</Text>
                {[
                  'Capture the pest clearly and in focus',
                  'Use natural daylight for better color accuracy',
                  'Include the affected plant part in the frame',
                  'Avoid blurry or dark images',
                ].map((t) => (
                  <View key={t} style={styles.tipRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
                    <Text style={styles.tipText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Analyze Button */}
            <TouchableOpacity
              style={[styles.analyzeBtn, (!imageUri || loading) && styles.analyzeBtnDisabled]}
              onPress={handleAnalyze}
              disabled={!imageUri || loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={(!imageUri || loading) ? [COLORS.TEXT_MUTED, COLORS.TEXT_MUTED] : [COLORS.PRIMARY_DARK, COLORS.PRIMARY]}
                style={styles.analyzeBtnGradient}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.analyzeBtnText}>Analyzing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="search" size={20} color="#fff" />
                    <Text style={styles.analyzeBtnText}>Identify Pest</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {isGuest && (
              <Text style={styles.guestNote}>
                Sign in to save detection history to your account
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },

  // Header
  header: { paddingTop: 52, paddingBottom: SPACING.LG, paddingHorizontal: SPACING.LG, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  headerTitle:  { fontSize: FONTS.SIZE.XL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },

  body:        { flex: 1 },
  bodyContent: { padding: SPACING.LG, gap: SPACING.MD },

  // Upload card
  uploadCard: { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL, padding: SPACING.LG, gap: SPACING.MD },
  uploadTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  uploadSub:   { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, marginTop: -SPACING.SM },

  placeholderBox: { height: 180, borderRadius: RADIUS.LG, borderWidth: 2, borderColor: COLORS.BORDER, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: SPACING.SM, backgroundColor: COLORS.BACKGROUND },
  placeholderText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED },

  previewWrap: { position: 'relative', alignSelf: 'center' },
  preview:     { width: 220, height: 220, borderRadius: RADIUS.LG, resizeMode: 'cover' },
  removeBtn:   { position: 'absolute', top: -10, right: -10, backgroundColor: COLORS.SURFACE, borderRadius: 14 },

  cropRow:          { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, flexWrap: 'wrap' },
  cropLabel:        { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, fontWeight: FONTS.WEIGHT.SEMIBOLD, textTransform: 'uppercase', letterSpacing: 0.5 },
  cropChip:         { paddingHorizontal: SPACING.MD, paddingVertical: SPACING.XS, borderRadius: RADIUS.FULL, borderWidth: 1.5, borderColor: COLORS.BORDER, backgroundColor: COLORS.BACKGROUND },
  cropChipActive:   { borderColor: COLORS.PRIMARY, backgroundColor: COLORS.PRIMARY + '18' },
  cropChipText:     { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_SECONDARY, fontWeight: FONTS.WEIGHT.MEDIUM },
  cropChipTextActive: { color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.BOLD },

  pickRow: { flexDirection: 'row', gap: SPACING.MD },
  pickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.SM, height: 48, borderRadius: RADIUS.LG, borderWidth: 1.5, borderColor: COLORS.PRIMARY, backgroundColor: COLORS.PRIMARY + '0d' },
  pickBtnText: { fontSize: FONTS.SIZE.MD, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },

  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, backgroundColor: 'rgba(239,68,68,0.12)', padding: SPACING.MD, borderRadius: RADIUS.MD, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText:   { color: COLORS.ERROR, fontSize: FONTS.SIZE.SM, flex: 1 },

  tipsCard:  { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL, padding: SPACING.LG, gap: SPACING.SM },
  tipsTitle: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginBottom: SPACING.XS },
  tipRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  tipText:   { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, flex: 1 },

  analyzeBtn:         { borderRadius: RADIUS.LG, overflow: 'hidden' },
  analyzeBtnDisabled: { opacity: 0.55 },
  analyzeBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.SM, height: 56 },
  analyzeBtnText:     { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },

  guestNote: { textAlign: 'center', fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, marginTop: -SPACING.XS },

  // Result view
  identityCard: { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL, padding: SPACING.LG, gap: SPACING.MD, marginBottom: SPACING.SM },
  identityTop:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
  bugIconWrap:  { width: 64, height: 64, borderRadius: 18, backgroundColor: COLORS.ACCENT_DARK + '15', justifyContent: 'center', alignItems: 'center' },
  insectName:   { fontSize: FONTS.SIZE.XL, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  scientificName: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED, fontStyle: 'italic', marginTop: 2 },

  badgeRow:         { flexDirection: 'row', gap: SPACING.MD },
  confidenceBadge:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS, backgroundColor: COLORS.PRIMARY + '15', paddingHorizontal: SPACING.MD, paddingVertical: SPACING.XS, borderRadius: RADIUS.FULL, borderWidth: 1, borderColor: COLORS.PRIMARY + '30' },
  confidenceText:   { fontSize: FONTS.SIZE.SM, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  riskBadge:        { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS, paddingHorizontal: SPACING.MD, paddingVertical: SPACING.XS, borderRadius: RADIUS.FULL, borderWidth: 1 },
  riskText:         { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD },

  altPreds: { borderTopWidth: 1, borderTopColor: COLORS.BORDER, paddingTop: SPACING.SM, gap: SPACING.XS },
  altTitle: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, fontWeight: FONTS.WEIGHT.SEMIBOLD, textTransform: 'uppercase', letterSpacing: 0.5 },
  altRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  altName:  { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY },
  altConf:  { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED },

  sectionCard:   { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.MD, marginBottom: SPACING.SM },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, marginBottom: SPACING.MD },
  sectionIcon:   { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle:  { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  sectionBody:   { gap: SPACING.SM },
  bodyText:      { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },

  safetyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.XS, backgroundColor: 'rgba(59,130,246,0.1)', padding: SPACING.SM, borderRadius: RADIUS.MD, marginTop: SPACING.XS },
  safetyText: { fontSize: FONTS.SIZE.XS, color: '#93C5FD', flex: 1, lineHeight: 18 },

  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.SM, backgroundColor: 'rgba(245,158,11,0.1)', padding: SPACING.MD, borderRadius: RADIUS.LG, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', marginVertical: SPACING.SM },
  disclaimerText: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_SECONDARY, flex: 1, lineHeight: 18 },

  resultActions: { flexDirection: 'row', gap: SPACING.MD, marginTop: SPACING.SM },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.SM, height: 52, borderRadius: RADIUS.LG, borderWidth: 1.5, borderColor: COLORS.PRIMARY, backgroundColor: COLORS.PRIMARY + '0d' },
  resetBtnText: { fontSize: FONTS.SIZE.SM, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.SM, height: 52, borderRadius: RADIUS.LG, borderWidth: 1.5, borderColor: COLORS.SUCCESS, backgroundColor: COLORS.SUCCESS + '10' },
  pdfBtnText: { fontSize: FONTS.SIZE.SM, color: COLORS.SUCCESS, fontWeight: FONTS.WEIGHT.SEMIBOLD },
});
