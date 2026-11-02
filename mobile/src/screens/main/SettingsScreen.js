import React, { useState, useEffect } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Modal, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';
import { contentAPI } from '../../services/api';

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

const HIGHLIGHTS = [
  { word: 'Rakibul Islam',         style: { color: '#A78BFA', fontWeight: 'bold' } },
  { word: 'Simran Mitra',          style: { color: '#A78BFA', fontWeight: 'bold' } },
  { word: 'Farhin Khanam',         style: { color: '#A78BFA', fontWeight: 'bold' } },
  { word: 'Dr. Manashee Kalita',   style: { color: '#FBBF24', fontWeight: 'bold' } },
  { word: 'Regional Institute of Science and Technology (RIST)', style: { color: '#34D399', fontWeight: 'bold' } },
];

function HighlightedText({ text, highlights, style }) {
  let parts = [{ text, hl: false, s: null }];
  for (const { word, style: hs } of highlights) {
    const next = [];
    for (const part of parts) {
      if (part.hl) { next.push(part); continue; }
      const idx = part.text.toLowerCase().indexOf(word.toLowerCase());
      if (idx === -1) { next.push(part); continue; }
      if (idx > 0) next.push({ text: part.text.slice(0, idx), hl: false, s: null });
      next.push({ text: part.text.slice(idx, idx + word.length), hl: true, s: hs });
      const rest = part.text.slice(idx + word.length);
      if (rest) next.push({ text: rest, hl: false, s: null });
    }
    parts = next;
  }
  return (
    <Text style={style}>
      {parts.map((p, i) => (
        <Text key={i} style={p.hl ? p.s : undefined}>{p.text}</Text>
      ))}
    </Text>
  );
}

function SettingRow({ icon, label, value, onPress, toggle, toggleValue, onToggle, desc, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={toggle ? undefined : onPress} activeOpacity={toggle ? 1 : 0.7}>
      <View style={[styles.rowIcon, { backgroundColor: danger ? 'rgba(239,68,68,0.12)' : COLORS.BORDER_LIGHT }]}>
        <Ionicons name={icon} size={20} color={danger ? COLORS.ERROR : COLORS.PRIMARY} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && { color: COLORS.ERROR }]}>{label}</Text>
        {desc ? <Text style={styles.rowDesc}>{desc}</Text> : null}
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {toggle ? (
        <Switch value={toggleValue} onValueChange={onToggle}
          trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY_LIGHT }}
          thumbColor={toggleValue ? COLORS.PRIMARY : '#fff'} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_MUTED} />
      )}
    </TouchableOpacity>
  );
}

function AboutUsModal({ visible, onClose }) {
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT_US);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    contentAPI.getAboutUs()
      .then((d) => { if (d?.text) setAboutText(d.text); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.modalHeader}>
            <View style={styles.modalLogoBox}>
              <Ionicons name="people" size={26} color={COLORS.ACCENT} />
            </View>
            <Text style={styles.modalTitle}>About Us</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="phone-portrait-outline" size={13} color={COLORS.PRIMARY} />
                <Text style={styles.badgeText}>KrishX App</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="calendar-outline" size={13} color={COLORS.PRIMARY} />
                <Text style={styles.badgeText}>2026</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="school-outline" size={13} color={COLORS.PRIMARY} />
                <Text style={styles.badgeText}>RIST, Assam</Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{ marginVertical: SPACING.LG }} />
            ) : (
              <View style={styles.paraBox}>
                <HighlightedText
                  text={aboutText}
                  highlights={HIGHLIGHTS}
                  style={styles.paraText}
                />
              </View>
            )}

            <TouchableOpacity style={styles.closePill} onPress={onClose}>
              <Text style={styles.closePillText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const nav = useNavigation();
  const { darkMode, toggleDarkMode, logout } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [aboutUsVisible, setAboutUsVisible] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Customize your experience</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={[styles.card, SHADOW.SM]}>
          <SettingRow icon="moon-outline" label="Dark Mode"
            desc="Use dark theme across the app"
            toggle toggleValue={darkMode} onToggle={toggleDarkMode} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={[styles.card, SHADOW.SM]}>
          <SettingRow icon="notifications-outline" label="Push Notifications"
            desc="Receive analysis and tip alerts"
            toggle toggleValue={notifications} onToggle={setNotifications} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <View style={[styles.card, SHADOW.SM]}>
          <SettingRow icon="shield-outline" label="Privacy Policy"
            onPress={() => nav.navigate('PrivacyPolicy')} />
          <View style={styles.divider} />
          <SettingRow icon="document-text-outline" label="Terms of Service"
            onPress={() => nav.navigate('Terms')} />
          <View style={styles.divider} />
          <SettingRow icon="warning-outline" label="AI Disclaimer"
            desc="Important — read before acting on recommendations"
            onPress={() => nav.navigate('Disclaimer')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={[styles.card, SHADOW.SM]}>
          <SettingRow icon="people-outline" label="About Us"
            desc="Team, Institute & Project Guide"
            onPress={() => setAboutUsVisible(true)} />
          <View style={styles.divider} />
          <SettingRow icon="leaf-outline" label="App Version" value="1.0.0" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.card, SHADOW.SM]}>
          <SettingRow icon="log-out-outline" label="Sign Out"
            onPress={() =>
              Alert.alert('Sign Out', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logout },
              ])
            } danger />
        </View>
      </View>

      <Text style={styles.footer}>KrishX Agriculture{'\n'}Developed in 2026</Text>

      <AboutUsModal visible={aboutUsVisible} onClose={() => setAboutUsVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content:   { paddingBottom: 40 },
  header: { paddingTop: 52, paddingBottom: SPACING.LG, paddingHorizontal: SPACING.LG, gap: SPACING.XS },
  backBtn: { marginBottom: SPACING.SM },
  headerTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  headerSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.7)' },
  section: { paddingHorizontal: SPACING.LG, marginTop: SPACING.LG },
  sectionTitle: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.SM },
  card: { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, padding: SPACING.MD },
  rowIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY, fontWeight: FONTS.WEIGHT.MEDIUM },
  rowDesc:  { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, marginTop: 2 },
  rowValue: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.BORDER, marginLeft: 68 },
  footer: { textAlign: 'center', marginTop: SPACING.XXL, fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden', maxHeight: '85%',
  },
  modalHeader: {
    paddingTop: SPACING.XL, paddingBottom: SPACING.LG,
    paddingHorizontal: SPACING.LG, alignItems: 'center', gap: SPACING.SM,
  },
  modalLogoBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalTitle: { fontSize: FONTS.SIZE.XL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  modalCloseBtn: {
    position: 'absolute', top: SPACING.LG, right: SPACING.LG,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: { padding: SPACING.LG, gap: SPACING.LG, paddingBottom: 40 },

  badgeRow: { flexDirection: 'row', gap: SPACING.SM, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.PRIMARY + '18', borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.PRIMARY + '30',
  },
  badgeText: { fontSize: FONTS.SIZE.XS, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },

  paraBox: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  paraText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, lineHeight: 24 },

  closePill: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.XXL, paddingVertical: SPACING.MD,
    backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.FULL,
  },
  closePillText: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: '#fff' },
});
