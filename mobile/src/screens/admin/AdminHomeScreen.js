import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI, contentAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

function StatBox({ icon, label, value, color }) {
  return (
    <View style={[styles.statBox, SHADOW.SM, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statNum}>{value ?? '—'}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

function CropBar({ item, max }) {
  const pct = max > 0 ? item.count / max : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={1}>{item.crop || item.soil}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.barCount}>{item.count}</Text>
    </View>
  );
}

export default function AdminHomeScreen() {
  const nav = useNavigation();
  const { logout } = useApp();
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [refresh,      setRefresh]      = useState(false);
  const [aboutModal,   setAboutModal]   = useState(false);
  const [aboutDraft,   setAboutDraft]   = useState('');
  const [aboutSaving,  setAboutSaving]  = useState(false);

  const openAboutEditor = async () => {
    try {
      const d = await contentAPI.getAboutUs();
      setAboutDraft(d?.text || '');
    } catch {
      setAboutDraft('');
    }
    setAboutModal(true);
  };

  const saveAbout = async () => {
    if (!aboutDraft.trim()) { Alert.alert('Error', 'Text cannot be empty.'); return; }
    setAboutSaving(true);
    try {
      await contentAPI.updateAboutUs(aboutDraft.trim());
      setAboutModal(false);
      Alert.alert('Saved', 'About Us text updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setAboutSaving(false);
    }
  };

  const load = async () => {
    try {
      const d = await adminAPI.getDashboard();
      setData(d);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  const maxCrop = Math.max(...(data?.top_crops || []).map((c) => c.count), 1);
  const maxSoil = Math.max(...(data?.top_soils || []).map((s) => s.count), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={COLORS.PRIMARY} />}
      showsVerticalScrollIndicator={false}>

      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID, COLORS.GRADIENT_END]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.adminLabel}>ADMIN PANEL</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={14} color={COLORS.ACCENT} />
          <Text style={styles.adminBadgeText}>Admin Rakibul</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatBox icon="people-outline" label="Total Users"       value={data?.total_users}         color={COLORS.INFO} />
            <StatBox icon="analytics-outline" label="Predictions"    value={data?.total_predictions}   color={COLORS.PRIMARY} />
            <StatBox icon="today-outline" label="Today"              value={data?.predictions_today}   color={COLORS.SUCCESS} />
            <StatBox icon="leaf-outline" label="Unique Crops"        value={data?.top_crops?.length}   color={COLORS.ACCENT_DARK} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Controls</Text>
            <View style={styles.menuGrid}>
              {[
                { icon: 'people',       label: 'Manage Users',       screen: 'AdminUsers',       color: '#3b82f6' },
                { icon: 'analytics',    label: 'All Predictions',    screen: 'AdminPredictions', color: '#10b981' },
                { icon: 'leaf',         label: 'Crop Analytics',     screen: 'AdminPredictions', color: '#f59e0b' },
                { icon: 'bug',          label: 'Pest Reports',       screen: 'AdminPredictions', color: '#ef4444' },
              ].map((m) => (
                <TouchableOpacity key={m.label} style={[styles.menuCard, { backgroundColor: m.color + '12' }]}
                  onPress={() => nav.navigate(m.screen)} activeOpacity={0.8}>
                  <View style={[styles.menuIcon, { backgroundColor: m.color + '20' }]}>
                    <Ionicons name={m.icon} size={24} color={m.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: m.color }]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.menuCard, { backgroundColor: '#8b5cf620' }]}
                onPress={openAboutEditor} activeOpacity={0.8}>
                <View style={[styles.menuIcon, { backgroundColor: '#8b5cf630' }]}>
                  <Ionicons name="information-circle" size={24} color="#8b5cf6" />
                </View>
                <Text style={[styles.menuLabel, { color: '#8b5cf6' }]}>Edit About Us</Text>
              </TouchableOpacity>
            </View>
          </View>

          {data?.top_crops?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Recommended Crops</Text>
              <View style={[styles.card, SHADOW.SM]}>
                {data.top_crops.map((c) => <CropBar key={c.crop} item={c} max={maxCrop} />)}
              </View>
            </View>
          )}

          {data?.top_soils?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Soil Type Distribution</Text>
              <View style={[styles.card, SHADOW.SM]}>
                {data.top_soils.map((s) => <CropBar key={s.soil} item={{ crop: s.soil, count: s.count }} max={maxSoil} />)}
              </View>
            </View>
          )}
        </>
      )}
      {/* Edit About Us Modal */}
      <Modal visible={aboutModal} transparent animationType="slide" onRequestClose={() => setAboutModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit About Us</Text>
              <TouchableOpacity onPress={() => setAboutModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHint}>This text appears in the Terms of Service screen under "About Us".</Text>
            <TextInput
              style={styles.modalInput}
              value={aboutDraft}
              onChangeText={setAboutDraft}
              multiline
              textAlignVertical="top"
              placeholder="Enter About Us paragraph..."
              placeholderTextColor={COLORS.TEXT_MUTED}
            />
            <TouchableOpacity style={[styles.saveBtn, aboutSaving && { opacity: 0.6 }]}
              onPress={saveAbout} disabled={aboutSaving} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.saveBtnGrad}>
                {aboutSaving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content:   { paddingBottom: 40 },
  header:    { paddingTop: 52, paddingBottom: SPACING.LG, paddingHorizontal: SPACING.LG, gap: SPACING.SM },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  adminLabel: { fontSize: FONTS.SIZE.XS, color: COLORS.ACCENT, fontWeight: FONTS.WEIGHT.BOLD, letterSpacing: 2 },
  headerTitle:{ fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  logoutBtn:  { padding: SPACING.SM },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS, alignSelf: 'flex-start' },
  adminBadgeText: { fontSize: FONTS.SIZE.XS, color: COLORS.ACCENT },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.MD, padding: SPACING.LG },
  statBox: {
    flex: 1, minWidth: '44%', backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS.LG, padding: SPACING.MD, alignItems: 'center', gap: SPACING.SM,
  },
  statNum:  { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.EXTRABOLD, color: COLORS.TEXT_PRIMARY },
  statLbl:  { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, textAlign: 'center' },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  section:  { paddingHorizontal: SPACING.LG, marginBottom: SPACING.LG },
  sectionTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginBottom: SPACING.MD },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.MD },
  menuCard: { width: '47%', borderRadius: RADIUS.LG, padding: SPACING.LG, alignItems: 'center', gap: SPACING.SM },
  menuIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuLabel:{ fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, textAlign: 'center' },
  card:  { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.LG, gap: SPACING.MD },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  barLabel: { width: 80, fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY },
  barBg:   { flex: 1, height: 8, backgroundColor: COLORS.BORDER, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.PRIMARY, borderRadius: 4 },
  barCount:{ fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, width: 30, textAlign: 'right' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalCard: {
    backgroundColor: COLORS.SURFACE, borderTopLeftRadius: RADIUS.XL, borderTopRightRadius: RADIUS.XL,
    padding: SPACING.XL, gap: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  modalHint: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED, lineHeight: 18 },
  modalInput: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD, borderWidth: 1.5,
    borderColor: COLORS.BORDER, padding: SPACING.MD, color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZE.SM, minHeight: 180, lineHeight: 20,
  },
  saveBtn: { borderRadius: RADIUS.LG, overflow: 'hidden' },
  saveBtnGrad: { height: 50, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
});
