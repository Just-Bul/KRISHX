import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { predictionAPI } from '../../services/api';
import { validatePredictionForm, hasErrors } from '../../utils/validators';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

const FIELDS = [
  { key: 'temperature',  label: 'Temperature',   unit: '°C',  icon: 'thermometer-outline',  placeholder: '28',   min: -10, max: 60,  tip: 'Current field air temperature' },
  { key: 'humidity',     label: 'Humidity',       unit: '%',   icon: 'water-outline',         placeholder: '60',  min: 0,   max: 100, tip: 'Relative air humidity' },
  { key: 'moisture',     label: 'Soil Moisture',  unit: '%',   icon: 'rainy-outline',         placeholder: '45',  min: 0,   max: 100, tip: 'Moisture content of soil' },
  { key: 'nitrogen',     label: 'Nitrogen (N)',    unit: 'ppm', icon: 'flask-outline',         placeholder: '20',  min: 0,   max: 200, tip: 'Soil nitrogen level' },
  { key: 'phosphorous',  label: 'Phosphorous (P)', unit: 'ppm', icon: 'flask-outline',         placeholder: '18',  min: 0,   max: 200, tip: 'Soil phosphorous level' },
  { key: 'potassium',    label: 'Potassium (K)',   unit: 'ppm', icon: 'flask-outline',         placeholder: '5',   min: 0,   max: 200, tip: 'Soil potassium level' },
];

function FieldInput({ field, value, error, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldLabelRow}>
          <Ionicons name={field.icon} size={15} color={COLORS.PRIMARY} />
          <Text style={styles.fieldLabel}>{field.label}</Text>
        </View>
        <Text style={styles.fieldTip}>{field.tip}</Text>
      </View>
      <View style={[
        styles.inputWrap,
        focused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        <TextInput
          style={styles.input}
          placeholder={field.placeholder}
          placeholderTextColor={COLORS.TEXT_MUTED}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <View style={styles.unitBadge}>
          <Text style={styles.unitText}>{field.unit}</Text>
        </View>
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={12} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

export default function PredictionScreen() {
  const nav = useNavigation();
  const [values,  setValues]  = useState({ temperature:'', humidity:'', moisture:'', nitrogen:'', phosphorous:'', potassium:'' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.96, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  const setValue = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, [key]: null }));
  };

  const handleAnalyze = async () => {
    const errs = validatePredictionForm(values);
    setErrors(errs);
    if (hasErrors(errs)) return;

    setLoading(true);
    startPulse();
    try {
      const payload = {
        Temparature:  parseFloat(values.temperature),
        Humidity:     parseFloat(values.humidity),
        Moisture:     parseFloat(values.moisture),
        Nitrogen:     parseFloat(values.nitrogen),
        Phosphorous:  parseFloat(values.phosphorous),
        Potassium:    parseFloat(values.potassium),
      };
      const result = await predictionAPI.predict(payload);
      pulseAnim.stopAnimation();
      nav.navigate('Result', { prediction: result, inputs: values });
    } catch (err) {
      pulseAnim.stopAnimation();
      setErrors({ form: err.response?.data?.error || 'Analysis failed. Check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="flask" size={26} color={COLORS.ACCENT} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Soil Analysis</Text>
            <Text style={styles.headerSub}>Enter sensor readings or lab values</Text>
          </View>
        </View>

        <View style={styles.stepsRow}>
          {['Enter Values', 'AI Analysis', 'Get Results'].map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
                <Text style={[styles.stepNum, i === 0 && styles.stepNumActive]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>{s}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {errors.form && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={COLORS.ERROR} />
            <Text style={styles.errorBannerText}>{errors.form}</Text>
          </View>
        )}

        <View style={[styles.card, SHADOW.MD]}>
          <View style={styles.cardHeader}>
            <Ionicons name="thermometer" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.cardTitle}>Environmental Readings</Text>
          </View>
          {FIELDS.slice(0, 3).map((f) => (
            <FieldInput key={f.key} field={f} value={values[f.key]}
              error={errors[f.key]} onChange={(v) => setValue(f.key, v)} />
          ))}
        </View>

        <View style={[styles.card, SHADOW.MD]}>
          <View style={styles.cardHeader}>
            <Ionicons name="flask" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.cardTitle}>Soil Nutrient Levels</Text>
          </View>
          <View style={styles.npkRow}>
            {FIELDS.slice(3).map((f, i) => (
              <View key={f.key} style={[styles.npkBadge, { backgroundColor: [COLORS.SUCCESS + '20', COLORS.INFO + '20', COLORS.WARNING + '20'][i] }]}>
                <Text style={[styles.npkLetter, { color: [COLORS.SUCCESS, COLORS.INFO, COLORS.WARNING][i] }]}>
                  {f.label[0]}
                </Text>
              </View>
            ))}
          </View>
          {FIELDS.slice(3).map((f) => (
            <FieldInput key={f.key} field={f} value={values[f.key]}
              error={errors[f.key]} onChange={(v) => setValue(f.key, v)} />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.INFO} />
          <Text style={styles.infoText}>
            Soil type is automatically detected by our AI model — no manual selection needed.
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY, COLORS.PRIMARY_LIGHT]}
              style={styles.analyzeBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.analyzeBtnText}>Analyzing with AI...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.analyzeBtnText}>Analyze Soil Profile</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: SPACING.XXL, paddingHorizontal: SPACING.LG, gap: SPACING.LG },
  backBtn: { marginBottom: SPACING.SM },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
  headerIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: FONTS.SIZE.XL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  headerSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  step: { alignItems: 'center', gap: SPACING.XS },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.ACCENT },
  stepNum:       { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.6)', fontWeight: FONTS.WEIGHT.BOLD },
  stepNumActive: { color: '#fff' },
  stepLabel:     { fontSize: FONTS.SIZE.XS, color: 'rgba(255,255,255,0.55)' },
  stepLabelActive: { color: '#fff', fontWeight: FONTS.WEIGHT.SEMIBOLD },
  body:        { flex: 1, backgroundColor: COLORS.BACKGROUND },
  bodyContent: { padding: SPACING.LG, paddingTop: SPACING.LG, gap: SPACING.LG, paddingBottom: SPACING.XXXL },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: 'rgba(239,68,68,0.12)', padding: SPACING.MD, borderRadius: RADIUS.MD,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  errorBannerText: { color: COLORS.ERROR, fontSize: FONTS.SIZE.SM, flex: 1 },
  card: { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL, padding: SPACING.LG, gap: SPACING.MD },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, marginBottom: SPACING.XS },
  cardTitle:  { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  npkRow:   { flexDirection: 'row', gap: SPACING.SM },
  npkBadge: { paddingHorizontal: SPACING.MD, paddingVertical: SPACING.XS, borderRadius: RADIUS.FULL },
  npkLetter:{ fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.BOLD },
  fieldWrap: { gap: SPACING.XS },
  fieldHeader: { gap: 2 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS },
  fieldLabel: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_SECONDARY },
  fieldTip:   { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, marginLeft: 19 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.INPUT_BG, borderRadius: RADIUS.MD,
    borderWidth: 1.5, borderColor: COLORS.INPUT_BORDER, overflow: 'hidden',
  },
  inputFocused: { borderColor: COLORS.PRIMARY },
  inputError:   { borderColor: COLORS.ERROR },
  input: { flex: 1, height: 48, paddingHorizontal: SPACING.MD, fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY },
  unitBadge: { backgroundColor: COLORS.BORDER_LIGHT, paddingHorizontal: SPACING.MD, height: 48, justifyContent: 'center' },
  unitText:  { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS },
  errorText: { fontSize: FONTS.SIZE.XS, color: COLORS.ERROR },
  infoBox: {
    flexDirection: 'row', gap: SPACING.SM, alignItems: 'flex-start',
    backgroundColor: 'rgba(59,130,246,0.1)', padding: SPACING.MD,
    borderRadius: RADIUS.MD, borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
  },
  infoText: { flex: 1, fontSize: FONTS.SIZE.SM, color: '#93C5FD', lineHeight: 18 },
  analyzeBtn:         { borderRadius: RADIUS.LG, overflow: 'hidden' },
  analyzeBtnDisabled: { opacity: 0.75 },
  analyzeBtnGrad:     { height: 56, justifyContent: 'center', alignItems: 'center' },
  loadingRow:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  analyzeBtnText: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
});
