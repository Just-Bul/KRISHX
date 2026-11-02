import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Share, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

const DISCLAIMER = 'Please consult a qualified agricultural professional or expert before applying any fertilizer, pesticide, or chemical medicine to crops.';

const NUTRIENT_COLOR = { Low: COLORS.ERROR, Medium: COLORS.WARNING, High: COLORS.SUCCESS };

function SoilBadge({ soilType }) {
  return (
    <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.soilBadge}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Ionicons name="earth" size={28} color={COLORS.ACCENT} />
      <View>
        <Text style={styles.soilLabel}>Detected Soil Type</Text>
        <Text style={styles.soilType}>{soilType}</Text>
      </View>
    </LinearGradient>
  );
}

function NutrientRow({ label, level }) {
  return (
    <View style={styles.nutrientRow}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <View style={[styles.nutrientBadge, { backgroundColor: NUTRIENT_COLOR[level] + '20' }]}>
        <View style={[styles.nutrientDot, { backgroundColor: NUTRIENT_COLOR[level] }]} />
        <Text style={[styles.nutrientLevel, { color: NUTRIENT_COLOR[level] }]}>{level}</Text>
      </View>
    </View>
  );
}

function CropCard({ crop, pct, rank, onSelect }) {
  return (
    <TouchableOpacity style={[styles.cropCard, SHADOW.SM, rank === 0 && styles.cropCardTop]}
      onPress={() => onSelect(crop)} activeOpacity={0.8}>
      {rank === 0 && (
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>⭐ Best Match</Text>
        </View>
      )}
      <View style={styles.cropRank}>
        <Text style={styles.cropRankText}>#{rank + 1}</Text>
      </View>
      <Text style={styles.cropName}>{crop}</Text>
    </TouchableOpacity>
  );
}

function PestCard({ pest }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = pest.symptoms || pest.pesticide || pest.organic || pest.fertilizer_note;
  return (
    <View style={[styles.pestCard, SHADOW.SM]}>
      <TouchableOpacity style={styles.pestHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={styles.pestLeft}>
          <View style={styles.pestIcon}>
            <Ionicons name="bug" size={18} color={COLORS.ACCENT_DARK} />
          </View>
          <View>
            <Text style={styles.pestName}>{pest.name}</Text>
            {pest.scientific_name ? <Text style={styles.pestSci}>{pest.scientific_name}</Text> : null}
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.TEXT_MUTED} />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.pestDetail}>
          {hasDetail ? (
            <>
              {pest.symptoms ? (
                <View style={styles.pestInfoRow}>
                  <Ionicons name="eye-outline" size={14} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.pestInfoText}><Text style={{ fontWeight: 'bold' }}>Symptoms: </Text>{pest.symptoms}</Text>
                </View>
              ) : null}
              {pest.pesticide ? (
                <View style={[styles.pestTreatBox, { backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }]}>
                  <Text style={styles.pestTreatTitle}>Chemical Control</Text>
                  <Text style={styles.pestTreatText}>{pest.pesticide}</Text>
                </View>
              ) : null}
              {pest.organic ? (
                <View style={[styles.pestTreatBox, { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' }]}>
                  <Text style={styles.pestTreatTitle}>Organic Control</Text>
                  <Text style={styles.pestTreatText}>{pest.organic}</Text>
                </View>
              ) : null}
              {pest.fertilizer_note ? (
                <View style={[styles.pestTreatBox, { backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' }]}>
                  <Text style={styles.pestTreatTitle}>Fertilizer Tip</Text>
                  <Text style={styles.pestTreatText}>{pest.fertilizer_note}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={[styles.pestInfoText, { color: COLORS.TEXT_MUTED, fontStyle: 'italic' }]}>
              Run a new analysis for full treatment details.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function ResultScreen() {
  const nav    = useNavigation();
  const route  = useRoute();
  const { showToast } = useApp();
  const { prediction } = route.params || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  if (!prediction) {
    return (
      <View style={styles.errWrap}>
        <Text style={styles.errText}>No prediction data found.</Text>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={{ color: COLORS.PRIMARY }}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  const { 'Soil Type': soilType, 'Nutrient Levels': nutrients,
          'Recommended Crops': crops, 'Crop Confidence': conf,
          'Recommended Fertilizer': fertilizer, Pests: pests = [],
          'Soil Fertilizer Note': soilNote, Disclaimer: disclaimer } = prediction;

  const [pdfLoading, setPdfLoading] = useState(false);

  const handleShare = async () => {
    const text = [
      'KrishX Agriculture Report',
      `Soil Type: ${soilType}`,
      `Top Crop: ${crops?.[0] || '—'}`,
      `Possible Pests: ${pests?.map((p) => p.name).join(', ') || 'None'}`,
      `Fertilizer: ${fertilizer?.['Recommended Fertilizer'] || '—'}`,
      `\n${DISCLAIMER}`,
    ].join('\n');
    await Share.share({ message: text, title: 'KrishX Soil Analysis' });
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const date = new Date().toLocaleString();
      const nutrientRows = nutrients
        ? Object.entries(nutrients).map(([k, v]) => {
            const color = v === 'Low' ? '#ef4444' : v === 'Medium' ? '#f59e0b' : '#10b981';
            return `<tr><td>${k}</td><td style="color:${color};font-weight:bold">${v}</td></tr>`;
          }).join('')
        : '';
      const cropRows = crops?.map((c, i) => `<tr><td>${i + 1}. ${c}</td></tr>`).join('') ?? '';
      const pestSection = pests?.length > 0
        ? pests.map((p) => `
            <div class="pest-box">
              <div class="pest-name">${p.name} <span class="pest-sci">${p.scientific_name || ''}</span></div>
              ${p.symptoms ? `<p><b>Symptoms:</b> ${p.symptoms}</p>` : ''}
              ${p.pesticide ? `<p><b>Chemical Control:</b> ${p.pesticide}</p>` : ''}
              ${p.organic ? `<p><b>Organic Control:</b> ${p.organic}</p>` : ''}
            </div>`).join('')
        : '<p style="color:#64748b">No pests detected for this crop/soil combination.</p>';

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>KrishX Soil Analysis Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #1e293b; padding: 24px; font-size: 13px; }
  .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 22px 24px; border-radius: 12px; margin-bottom: 20px; }
  .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
  .header p { opacity: 0.8; font-size: 12px; }
  .soil-card { background: linear-gradient(135deg, #3B0764 0%, #6D28D9 100%); color: white; padding: 18px 22px; border-radius: 12px; margin-bottom: 16px; }
  .soil-type { font-size: 26px; font-weight: bold; margin: 4px 0; }
  .soil-conf { font-size: 12px; opacity: 0.75; }
  .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 14px; }
  .section h2 { font-size: 15px; font-weight: bold; color: #4F46E5; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  td:last-child { text-align: right; font-weight: 600; }
  .fert-box { background: white; border: 1px solid #ddd6fe; border-radius: 8px; padding: 12px; }
  .fert-label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .fert-val { font-size: 14px; color: #1e293b; line-height: 1.5; }
  .pest-box { background: #fff1f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
  .pest-name { font-weight: bold; color: #b91c1c; margin-bottom: 6px; }
  .pest-sci { font-style: italic; font-weight: normal; color: #64748b; font-size: 12px; }
  .pest-box p { font-size: 12px; color: #374151; margin-top: 4px; line-height: 1.5; }
  .disclaimer { background: #fff7ed; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; font-size: 11px; color: #92400e; line-height: 1.6; margin-top: 8px; }
  .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
  .soil-note { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px; font-size: 12px; color: #166534; margin-top: 8px; }
</style>
</head><body>
<div class="header">
  <h1>KrishX Smart Agriculture</h1>
  <p>Soil Analysis &amp; Crop Recommendation Report</p>
  <p style="margin-top:6px">Generated: ${date}</p>
</div>

<div class="soil-card">
  <div style="font-size:11px;opacity:0.75;margin-bottom:2px">Detected Soil Type</div>
  <div class="soil-type">${soilType || '—'}</div>
</div>

<div class="section">
  <h2>Nutrient Status</h2>
  <table>${nutrientRows}</table>
</div>

<div class="section">
  <h2>Recommended Crops</h2>
  <table>${cropRows}</table>
</div>

<div class="section">
  <h2>Fertilizer Recommendation</h2>
  <div class="fert-box">
    <div class="fert-label">Recommended Product</div>
    <div class="fert-val">${fertilizer?.['Recommended Fertilizer'] || fertilizer?.error || '—'}</div>
  </div>
  ${soilNote ? `<div class="soil-note"><b>Soil-specific Guidance:</b> ${soilNote}</div>` : ''}
</div>

<div class="section">
  <h2>Pest Alerts</h2>
  ${pestSection}
</div>

<div class="disclaimer">
  <b>Important Disclaimer:</b> ${DISCLAIMER}
</div>

<div class="footer">Generated by KrishX Smart Agriculture AI &bull; ${date}</div>
</body></html>`;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Results</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.successRow}>
          <Ionicons name="checkmark-circle" size={22} color={COLORS.ACCENT} />
          <Text style={styles.successText}>AI Analysis Complete</Text>
        </View>
      </LinearGradient>

      <Animated.View style={{ opacity: fadeAnim }}>

        {/* Soil Type */}
        <View style={styles.section}>
          <SoilBadge soilType={soilType} />
        </View>

        {/* Nutrients */}
        {nutrients && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrient Status</Text>
            <View style={[styles.card, SHADOW.SM]}>
              {Object.entries(nutrients).map(([k, v]) => <NutrientRow key={k} label={k} level={v} />)}
            </View>
          </View>
        )}

        {/* Crop Recommendations */}
        {crops?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Crops</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.MD }}>
              {crops.map((c, i) => (
                <CropCard key={c} crop={c} pct={conf?.[c]} rank={i}
                  onSelect={() => showToast(`${c} selected as your crop!`)} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Fertilizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fertilizer Recommendation</Text>
          <View style={[styles.card, SHADOW.SM, styles.fertCard]}>
            <Ionicons name="flask" size={24} color={COLORS.PRIMARY} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fertLabel}>Recommended Product</Text>
              <Text style={styles.fertValue}>{fertilizer?.['Recommended Fertilizer'] || fertilizer?.error || '—'}</Text>
            </View>
          </View>
          {soilNote ? (
            <View style={[styles.soilNoteBox, SHADOW.SM]}>
              <Text style={styles.soilNoteTitle}>Soil-specific Guidance</Text>
              <Text style={styles.soilNoteText}>{soilNote}</Text>
            </View>
          ) : null}
        </View>

        {/* Pests */}
        {pests?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.pestSectionHeader}>
              <Ionicons name="bug-outline" size={20} color={COLORS.ACCENT_DARK} />
              <Text style={styles.sectionTitle}>Pest Alert</Text>
              <View style={styles.pestCount}>
                <Text style={styles.pestCountText}>{pests.length} risks</Text>
              </View>
            </View>
            <Text style={styles.pestSubtitle}>
              Tap each pest to view symptoms and treatment methods.
            </Text>
            {pests.map((p) => <PestCard key={p.name} pest={p} />)}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.section}>
          <View style={styles.disclaimerBox}>
            <Ionicons name="warning-outline" size={20} color={COLORS.WARNING} />
            <View style={{ flex: 1 }}>
              <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
              <Text style={styles.disclaimerText}>{disclaimer || DISCLAIMER}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.newBtn} onPress={() => nav.navigate('PredictionForm')}>
            <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.newBtnGrad}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.newBtnText}>New Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.histBtn, { flex: 1 }]} onPress={() => nav.navigate('History')}>
              <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.histBtnText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pdfBtn, { flex: 1 }, pdfLoading && { opacity: 0.65 }]}
              onPress={handleDownloadPDF}
              disabled={pdfLoading}
            >
              {pdfLoading
                ? <ActivityIndicator size="small" color={COLORS.SUCCESS} />
                : <Ionicons name="document-text-outline" size={20} color={COLORS.SUCCESS} />}
              <Text style={styles.pdfBtnText}>{pdfLoading ? 'Generating…' : 'Download PDF'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content:   { paddingBottom: 40 },
  errWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.MD },
  errText:   { fontSize: FONTS.SIZE.LG, color: COLORS.TEXT_SECONDARY },
  header: { paddingTop: 52, paddingBottom: SPACING.XL, paddingHorizontal: SPACING.LG, gap: SPACING.MD },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: {}, shareBtn: {},
  headerTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  successText: { color: 'rgba(255,255,255,0.9)', fontSize: FONTS.SIZE.MD },
  section: { paddingHorizontal: SPACING.LG, marginTop: SPACING.LG },
  sectionTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginBottom: SPACING.MD },
  soilBadge: {
    borderRadius: RADIUS.XL, padding: SPACING.LG,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.LG,
  },
  soilLabel: { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.75)' },
  soilType:  { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.EXTRABOLD, color: '#fff' },
  card: { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.LG, gap: SPACING.MD },
  nutrientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nutrientLabel: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY, fontWeight: FONTS.WEIGHT.MEDIUM },
  nutrientBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS, paddingHorizontal: SPACING.MD, paddingVertical: SPACING.XS, borderRadius: RADIUS.FULL },
  nutrientDot: { width: 8, height: 8, borderRadius: 4 },
  nutrientLevel: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  cropCard: {
    width: 160, backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    padding: SPACING.MD, gap: SPACING.SM, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  cropCardTop: { borderColor: COLORS.PRIMARY, borderWidth: 2 },
  topBadge: { backgroundColor: COLORS.PRIMARY + '15', borderRadius: RADIUS.FULL, paddingHorizontal: SPACING.SM, paddingVertical: 2, alignSelf: 'flex-start' },
  topBadgeText: { fontSize: FONTS.SIZE.XS, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  cropRank: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.PRIMARY + '18', justifyContent: 'center', alignItems: 'center' },
  cropRankText: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.PRIMARY },
  cropName: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  progressWrap: { gap: SPACING.XS },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
  progressPct:   { fontSize: FONTS.SIZE.XS, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.BOLD },
  progressBg:   { height: 6, backgroundColor: COLORS.BORDER, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  fertCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
  fertLabel: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY },
  fertValue: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY, fontWeight: FONTS.WEIGHT.MEDIUM, lineHeight: 22 },
  soilNoteBox: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    padding: SPACING.MD, marginTop: SPACING.MD,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  soilNoteTitle: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.SUCCESS, marginBottom: SPACING.XS },
  soilNoteText:  { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },
  pestSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, marginBottom: SPACING.SM },
  pestCount: { backgroundColor: COLORS.ACCENT_DARK + '18', paddingHorizontal: SPACING.SM, paddingVertical: 2, borderRadius: RADIUS.FULL },
  pestCountText: { fontSize: FONTS.SIZE.XS, color: COLORS.ACCENT_DARK, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  pestSubtitle: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, marginBottom: SPACING.MD },
  pestCard: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    overflow: 'hidden', marginBottom: SPACING.SM,
    borderWidth: 1, borderColor: COLORS.PEST_BORDER,
  },
  pestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.MD },
  pestLeft:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, flex: 1 },
  pestIcon:   { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.PEST_BG, justifyContent: 'center', alignItems: 'center' },
  pestName:   { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
  pestSci:    { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, fontStyle: 'italic' },
  pestDetail: { padding: SPACING.MD, paddingTop: 0, gap: SPACING.SM },
  pestInfoRow: { flexDirection: 'row', gap: SPACING.SM, alignItems: 'flex-start' },
  pestInfoText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, flex: 1, lineHeight: 20 },
  pestTreatBox: { borderRadius: RADIUS.MD, padding: SPACING.MD },
  pestTreatTitle: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  pestTreatText:  { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },
  disclaimerBox: {
    flexDirection: 'row', gap: SPACING.MD, alignItems: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.1)', padding: SPACING.MD,
    borderRadius: RADIUS.LG, borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.3)',
  },
  disclaimerTitle: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.WARNING, marginBottom: 4 },
  disclaimerText:  { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },
  actions: { padding: SPACING.LG, gap: SPACING.MD, marginTop: SPACING.MD },
  newBtn: { borderRadius: RADIUS.LG, overflow: 'hidden' },
  newBtnGrad: { height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.SM },
  newBtnText: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  actionRow: { flexDirection: 'row', gap: SPACING.MD },
  histBtn: {
    height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: SPACING.SM, borderRadius: RADIUS.LG, borderWidth: 1.5, borderColor: COLORS.PRIMARY,
  },
  histBtnText: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.PRIMARY },
  pdfBtn: {
    height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: SPACING.SM, borderRadius: RADIUS.LG, borderWidth: 1.5, borderColor: COLORS.SUCCESS,
    backgroundColor: COLORS.SUCCESS + '10',
  },
  pdfBtnText: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.SUCCESS },
});
