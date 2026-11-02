import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, LayoutAnimation, UIManager, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';
import { APP_NAME, DEVELOPER_NAME, DEVELOPER_EMAIL } from '../../config';
import { contentAPI } from '../../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_ABOUT_US =
  'We are a team of final-year students—Rakibul Islam, Simran Mitra, and Farhin Khanam—' +
  'from the Regional Institute of Science and Technology (RIST). This application has been ' +
  'developed as our Major Project with the objective of supporting and empowering farmers ' +
  'through modern technology. Our aim is to provide farmers with accessible tools and ' +
  'intelligent solutions that can assist them in making informed agricultural decisions and ' +
  'improving productivity. This project has been carried out under the valuable guidance and ' +
  'supervision of Dr. Manashee Kalita, Assistant Professor, whose expertise and encouragement ' +
  'have been instrumental throughout the development process. We are committed to continuously ' +
  'enhancing the system by incorporating new features, improving accuracy, and expanding its ' +
  'capabilities in the future to better serve the farming community.';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: [
      `By downloading, installing, or using ${APP_NAME}, you agree to be bound by these Terms of Service.`,
      'If you do not agree to these terms, do not use the application.',
      'These terms may be updated periodically. Continued use constitutes acceptance of any changes.',
    ],
  },
  {
    title: '2. Description of Service',
    body: [
      `${APP_NAME} is an AI-powered mobile application that provides soil analysis, crop recommendations, fertilizer suggestions, and pest detection for agricultural use.`,
      'The service is provided "as is" and is intended as a decision-support tool, not a substitute for professional agricultural advice.',
      'Features require an active internet connection to communicate with our backend API.',
    ],
  },
  {
    title: '3. User Accounts',
    body: [
      'You must provide accurate information when creating an account.',
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You must notify us immediately of any unauthorised use of your account.',
      'One person may not maintain more than one account.',
      'Guest access is available with limited features and no data persistence.',
    ],
  },
  {
    title: '4. Acceptable Use',
    body: [
      'You agree not to misuse the service, including but not limited to: attempting to reverse-engineer the AI models, automated bulk requests, or probing for vulnerabilities.',
      'You agree not to submit false or misleading agricultural data.',
      'You agree not to use the service for any unlawful purpose.',
      'You agree not to impersonate any person or entity.',
    ],
  },
  {
    title: '5. AI Recommendations Disclaimer',
    body: [
      'All AI-generated recommendations (crop, fertilizer, pest treatment) are informational only.',
      'Recommendations should be verified with a qualified agricultural professional before application.',
      'Actual results may vary depending on local soil conditions, climate, and other factors.',
      'We disclaim all liability for losses arising from reliance on AI recommendations without professional consultation.',
    ],
  },
  {
    title: '6. Intellectual Property',
    body: [
      `${APP_NAME}, its AI models, designs, and content are the intellectual property of the developer.`,
      'You may not copy, modify, distribute, or create derivative works without express written permission.',
      'User-submitted data remains the property of the user; you grant us a limited licence to process it for service delivery.',
    ],
  },
  {
    title: '7. Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages.',
      'Our total liability shall not exceed the amount you paid for the service (if any) in the preceding 12 months.',
      'We are not responsible for crop losses, financial losses, or any other damages resulting from use of or inability to use the service.',
    ],
  },
  {
    title: '8. Termination',
    body: [
      'We reserve the right to suspend or terminate accounts that violate these terms.',
      'You may terminate your account by contacting us.',
      'Upon termination, your data will be handled in accordance with our Privacy Policy.',
    ],
  },
  {
    title: '9. Governing Law',
    body: [
      'These Terms are governed by and construed in accordance with applicable local laws.',
      'Any disputes shall be resolved through good-faith negotiation before legal action.',
    ],
  },
  {
    title: '10. Contact',
    body: [
      `Developer: ${DEVELOPER_NAME}`,
      `Email: ${DEVELOPER_EMAIL}`,
    ],
  },
];

export default function TermsScreen() {
  const nav = useNavigation();
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [aboutText, setAboutText]         = useState(DEFAULT_ABOUT_US);
  const [loadingAbout, setLoadingAbout]   = useState(true);

  useEffect(() => {
    contentAPI.getAboutUs()
      .then((d) => { if (d?.text) setAboutText(d.text); })
      .catch(() => {})
      .finally(() => setLoadingAbout(false));
  }, []);

  const toggleAbout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAboutExpanded((v) => !v);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.iconWrap}>
          <Ionicons name="document-text-outline" size={32} color={COLORS.ACCENT} />
        </View>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <Text style={styles.headerSub}>Last updated: January 2025</Text>
      </LinearGradient>

      <View style={[styles.card, SHADOW.MD]}>
        <Text style={styles.intro}>
          Please read these Terms of Service carefully before using {APP_NAME}.
          These terms govern your access to and use of the application and its features.
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

        {/* Contact info block */}
        <View style={styles.contactBlock}>
          <View style={styles.contactRow}>
            <Ionicons name="person-circle-outline" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.contactText}>Developer: <Text style={styles.contactBold}>{DEVELOPER_NAME}</Text></Text>
          </View>
          <TouchableOpacity style={styles.contactRow}
            onPress={() => Linking.openURL(`mailto:${DEVELOPER_EMAIL}?subject=Terms%20Enquiry`)}>
            <Ionicons name="mail-outline" size={18} color={COLORS.PRIMARY} />
            <Text style={[styles.contactText, styles.contactLink]}>{DEVELOPER_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        {/* About Us expandable section */}
        <TouchableOpacity style={styles.aboutHeader} onPress={toggleAbout} activeOpacity={0.8}>
          <View style={styles.aboutHeaderLeft}>
            <Ionicons name="people-outline" size={20} color={COLORS.ACCENT} />
            <Text style={styles.aboutHeaderText}>About Us</Text>
          </View>
          <Ionicons
            name={aboutExpanded ? 'chevron-up' : 'chevron-down'}
            size={20} color={COLORS.TEXT_SECONDARY}
          />
        </TouchableOpacity>

        {aboutExpanded && (
          <View style={styles.aboutBody}>
            {loadingAbout ? (
              <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{ marginVertical: 12 }} />
            ) : (
              <Text style={styles.aboutText}>{aboutText}</Text>
            )}
          </View>
        )}
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
    fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY,
  },
  bulletRow: { flexDirection: 'row', gap: SPACING.SM, alignItems: 'flex-start' },
  bullet: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: COLORS.PRIMARY, marginTop: 7, flexShrink: 0,
  },
  bulletText: { flex: 1, fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },
  contactBlock: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD,
    padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.SM,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  contactText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY },
  contactBold: { color: COLORS.TEXT_PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  contactLink: { color: COLORS.PRIMARY },
  aboutHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(139,92,246,0.10)', borderRadius: RADIUS.MD,
    padding: SPACING.MD, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
  },
  aboutHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  aboutHeaderText: {
    fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY,
  },
  aboutBody: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD,
    padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER,
    marginTop: -SPACING.SM,
  },
  aboutText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, lineHeight: 22 },
});
