import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';
import { APP_NAME, APP_VERSION, DEVELOPER_NAME, DEVELOPER_EMAIL } from '../../config';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: [
      'Account Information: When you register, we collect your full name, email address, and phone number.',
      'Agricultural Data: Soil parameters you enter (temperature, humidity, moisture, NPK values) and the predictions we generate.',
      'Pest Detection Images: Photos you submit for pest identification. Images are processed server-side and are not stored permanently.',
      'Usage Data: App interactions, feature usage frequency, and session duration to improve the product.',
      'Device Information: Operating system version and device model for compatibility purposes.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    body: [
      'To provide and improve the AI-powered prediction services.',
      'To send OTP verification codes and important account notifications via email.',
      'To store your prediction history so you can review past recommendations.',
      'To generate anonymised, aggregated insights that improve our models.',
      'We do NOT sell, rent, or share your personal data with third parties for marketing.',
    ],
  },
  {
    title: '3. Data Storage & Security',
    body: [
      'Your data is stored on secured cloud servers with encrypted databases.',
      'Passwords are hashed using bcrypt before storage — we never store plain-text passwords.',
      'Authentication uses short-lived JWT access tokens (24 hours) and refresh tokens (30 days).',
      'OTP codes expire after 5 minutes and are single-use only.',
      'We implement rate limiting and brute-force protection on all authentication endpoints.',
    ],
  },
  {
    title: '4. Data Retention',
    body: [
      'Your account data is retained for as long as your account is active.',
      'Prediction history is retained to provide the history feature. You may delete individual records at any time.',
      'You may request complete account deletion by contacting us. All your data will be removed within 30 days.',
      'OTP records are automatically purged after use or expiry.',
    ],
  },
  {
    title: '5. Third-Party Services',
    body: [
      'Google Play Store: Distribution of the application is subject to Google Play policies.',
      'SMTP Email Provider: We use an SMTP service to deliver OTP verification emails.',
      'Google Cloud Platform: Our backend infrastructure runs on GCP, subject to Google\'s data processing agreements.',
      'We do not use advertising networks, analytics SDKs, or social login services.',
    ],
  },
  {
    title: '6. Your Rights',
    body: [
      'Access: You can view your profile and prediction history within the app at any time.',
      'Correction: You can update your profile information from the Profile screen.',
      'Deletion: Contact us to request full account and data deletion.',
      'Portability: Contact us to request a copy of your data in JSON format.',
    ],
  },
  {
    title: '7. Children\'s Privacy',
    body: [
      'KrishX is intended for users aged 13 and above.',
      'We do not knowingly collect personal information from children under 13.',
      'If you believe a child has provided us with personal information, please contact us immediately.',
    ],
  },
  {
    title: '8. Contact Us',
    body: [`For privacy-related enquiries, contact ${DEVELOPER_NAME} at: ${DEVELOPER_EMAIL}`],
  },
];

export default function PrivacyPolicyScreen() {
  const nav = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-outline" size={32} color={COLORS.ACCENT} />
        </View>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.headerSub}>Last updated: January 2025</Text>
      </LinearGradient>

      <View style={[styles.card, SHADOW.MD]}>
        <Text style={styles.intro}>
          {APP_NAME} v{APP_VERSION} is committed to protecting your privacy. This policy
          explains what data we collect, how we use it, and the rights you have over it.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            {s.body.map((line, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.emailBtn}
          onPress={() => Linking.openURL(`mailto:${DEVELOPER_EMAIL}?subject=Privacy%20Enquiry`)}>
          <Ionicons name="mail-outline" size={16} color={COLORS.PRIMARY} />
          <View>
            <Text style={styles.emailName}>{DEVELOPER_NAME}</Text>
            <Text style={styles.emailText}>{DEVELOPER_EMAIL}</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  iconWrap: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  headerSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.7)' },
  card: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL,
    padding: SPACING.XL, marginHorizontal: SPACING.LG,
    marginTop: -20, borderWidth: 1, borderColor: COLORS.BORDER,
    gap: SPACING.LG,
  },
  intro: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY, lineHeight: 22 },
  section: { gap: SPACING.SM },
  sectionTitle: {
    fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  bulletRow: { flexDirection: 'row', gap: SPACING.SM, alignItems: 'flex-start' },
  bullet: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: COLORS.PRIMARY, marginTop: 7, flexShrink: 0,
  },
  bulletText: { flex: 1, fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },
  emailBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD,
    padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  emailName: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
  emailText: { fontSize: FONTS.SIZE.SM, color: COLORS.PRIMARY, marginTop: 1 },
});
