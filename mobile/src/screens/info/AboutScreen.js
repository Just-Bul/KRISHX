import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';
import { APP_VERSION, APP_NAME, COPYRIGHT_YEAR, DEVELOPER_NAME, DEVELOPER_EMAIL, PLAY_STORE_URL } from '../../config';

const FEATURES = [
  { icon: 'analytics-outline',       label: 'AI Soil Analysis',             desc: 'RandomForest classifier — 97%+ accuracy' },
  { icon: 'leaf-outline',            label: 'Crop Recommendation',          desc: 'Context-aware top-5 crop suggestions' },
  { icon: 'bug-outline',             label: 'Pest Detection',               desc: 'EfficientNet-B4 — 92%+ accuracy' },
  { icon: 'flask-outline',           label: 'Fertilizer Recommendation',    desc: 'NPK-based smart fertilizer mapping' },
  { icon: 'time-outline',            label: 'Prediction History',           desc: 'Full audit trail with PDF export' },
  { icon: 'shield-checkmark-outline','label': 'Secure Authentication',      desc: 'JWT + OTP email verification' },
];

const TECH_STACK = [
  { label: 'EfficientNet-B4',  desc: 'Pest detection CNN' },
  { label: 'RandomForest',     desc: 'Soil & crop model' },
  { label: 'Flask + Python',   desc: 'REST API backend' },
  { label: 'React Native',     desc: 'Cross-platform mobile' },
  { label: 'SQLite / PostgreSQL', desc: 'Data persistence' },
  { label: 'JWT + bcrypt',     desc: 'Authentication' },
];

export default function AboutScreen() {
  const nav = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <Ionicons name="leaf" size={36} color={COLORS.ACCENT} />
        </View>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </LinearGradient>

      {/* Tagline */}
      <View style={[styles.card, SHADOW.MD, styles.taglineCard]}>
        <Text style={styles.tagline}>Smart Agriculture Powered by Artificial Intelligence</Text>
        <Text style={styles.taglineSub}>
          KrishX helps farmers make data-driven decisions with machine-learning-based soil analysis,
          crop recommendations, and pest detection — all from a mobile device.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={[styles.card, SHADOW.SM]}>
          {FEATURES.map((f, i) => (
            <React.Fragment key={f.label}>
              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={20} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
              {i < FEATURES.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Technology */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technology Stack</Text>
        <View style={[styles.card, SHADOW.SM, styles.techGrid]}>
          {TECH_STACK.map((t) => (
            <View key={t.label} style={styles.techItem}>
              <Text style={styles.techLabel}>{t.label}</Text>
              <Text style={styles.techDesc}>{t.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Developer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <View style={[styles.card, SHADOW.SM]}>
          <View style={styles.devRow}>
            <View style={styles.devAvatar}>
              <Ionicons name="person" size={24} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.devInfo}>
              <Text style={styles.devName}>{DEVELOPER_NAME}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${DEVELOPER_EMAIL}`)}>
                <Text style={styles.devEmail}>{DEVELOPER_EMAIL}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.rateRow}
            onPress={() => Linking.openURL(PLAY_STORE_URL)}>
            <Ionicons name="star-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.rateText}>Rate on Google Play Store</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_MUTED} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Copyright */}
      <Text style={styles.copyright}>
        © {COPYRIGHT_YEAR} {APP_NAME}{'\n'}
        All rights reserved.{'\n'}
        AI recommendations are for informational purposes only.
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content:   { paddingBottom: 40 },

  header: {
    paddingTop: 52, paddingBottom: 36,
    paddingHorizontal: SPACING.LG, alignItems: 'center', gap: SPACING.SM,
  },
  backBtn: { position: 'absolute', top: 52, left: SPACING.LG },
  logoWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  appName: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.EXTRABOLD, color: '#fff', letterSpacing: 2 },
  version: { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.7)' },

  card: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL,
    borderWidth: 1, borderColor: COLORS.BORDER,
    marginHorizontal: SPACING.LG,
  },
  taglineCard: { padding: SPACING.XL, marginTop: -20, gap: SPACING.SM },
  tagline:    { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.PRIMARY, textAlign: 'center' },
  taglineSub: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },

  section:      { paddingHorizontal: 0, marginTop: SPACING.LG },
  sectionTitle: {
    fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.BOLD,
    color: COLORS.TEXT_MUTED, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: SPACING.SM,
    marginHorizontal: SPACING.LG,
  },

  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, padding: SPACING.MD },
  featureIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.BORDER_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  featureText:  { flex: 1 },
  featureLabel: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
  featureDesc:  { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, marginTop: 2 },

  techGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.MD, gap: SPACING.SM },
  techItem: {
    width: '47%', backgroundColor: COLORS.BACKGROUND,
    borderRadius: RADIUS.MD, padding: SPACING.MD,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  techLabel: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.PRIMARY },
  techDesc:  { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, marginTop: 2 },

  devRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, padding: SPACING.MD },
  devAvatar: {
    width: 48, height: 48, borderRadius: RADIUS.LG,
    backgroundColor: COLORS.BORDER_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  devInfo:  { flex: 1 },
  devName:  { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  devEmail: { fontSize: FONTS.SIZE.SM, color: COLORS.PRIMARY, marginTop: 2 },

  rateRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.SM, padding: SPACING.MD,
  },
  rateText: { flex: 1, fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY, fontWeight: FONTS.WEIGHT.MEDIUM },

  divider:   { height: 1, backgroundColor: COLORS.BORDER, marginLeft: 68 },
  copyright: {
    textAlign: 'center', marginTop: SPACING.XXL,
    fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, lineHeight: 20,
  },
});
