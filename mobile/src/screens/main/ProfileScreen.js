import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { userAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

function MenuItem({ icon, label, value, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? 'rgba(239,68,68,0.12)' : COLORS.BORDER_LIGHT }]}>
        <Ionicons name={icon} size={20} color={danger ? COLORS.ERROR : COLORS.PRIMARY} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && { color: COLORS.ERROR }]}>{label}</Text>
        {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_MUTED} />
    </TouchableOpacity>
  );
}

function GuestProfile() {
  const nav = useNavigation();
  const { logout } = useApp();

  const handleLogout = () => {
    Alert.alert('Leave Guest Mode', 'Sign in with your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>
        <Text style={styles.userName}>Guest User</Text>
        <Text style={styles.userEmail}>Not signed in</Text>
      </LinearGradient>

      <View style={[styles.card, { marginTop: SPACING.LG }]}>
        <View style={styles.guestInfoBox}>
          <Ionicons name="information-circle-outline" size={28} color={COLORS.PRIMARY} />
          <Text style={styles.guestInfoTitle}>You're browsing as a guest</Text>
          <Text style={styles.guestInfoText}>
            Create a free account to save your predictions, view history, and access your personal dashboard.
          </Text>
        </View>
        <TouchableOpacity style={styles.signInBtn} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-in-outline" size={20} color="#fff" />
          <Text style={styles.signInBtnText}>Sign In / Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { marginTop: 0 }]}>
        <MenuItem icon="log-out-outline" label="Leave Guest Mode" onPress={handleLogout} danger />
      </View>
    </ScrollView>
  );
}

function ProfileContent() {
  const nav = useNavigation();
  const { user, logout, updateUser, showToast } = useApp();
  const [stats,   setStats]   = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwModal, setPwModal] = useState(false);

  // Edit fields
  const [name,  setName]  = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password fields
  const [currPw,   setCurrPw]   = useState('');
  const [newPw,    setNewPw]    = useState('');
  const [confirmPw,setConfirmPw]= useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [pwError,  setPwError]  = useState('');
  const [pwLoad,   setPwLoad]   = useState(false);

  useEffect(() => {
    userAPI.getStats().then(setStats).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setLoading(true);
    try {
      const res = await userAPI.updateProfile({ full_name: name.trim(), phone: phone.trim() });
      await updateUser(res.user);
      setEditing(false);
      showToast('Profile updated!');
    } catch { showToast('Update failed', 'error'); }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (!currPw || !newPw || !confirmPw) { setPwError('All fields are required'); return; }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    setPwLoad(true);
    try {
      await userAPI.changePassword({ current_password: currPw, new_password: newPw });
      setPwModal(false);
      setCurrPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password changed successfully!');
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    }
    setPwLoad(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => nav.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.full_name || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        {user?.is_admin ? (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.ACCENT} />
            <Text style={styles.adminBadgeText}>Admin Rakibul</Text>
          </View>
        ) : null}
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total_predictions ?? 0, icon: 'analytics-outline' },
          { label: 'This Week', value: stats.predictions_this_week ?? 0, icon: 'calendar-outline' },
          { label: 'Top Crop', value: stats.top_crop || '—', icon: 'leaf-outline' },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, SHADOW.SM]}>
            <Ionicons name={s.icon} size={18} color={COLORS.PRIMARY} />
            <Text style={styles.statVal}>{String(s.value)}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Edit Profile */}
      {editing ? (
        <View style={[styles.card, SHADOW.SM]}>
          <Text style={styles.cardTitle}>Edit Profile</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="Your full name" placeholderTextColor={COLORS.TEXT_MUTED} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone}
              placeholder="Your phone number" placeholderTextColor={COLORS.TEXT_MUTED}
              keyboardType="phone-pad" />
          </View>
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.card, SHADOW.SM]}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Full Name</Text><Text style={styles.infoValue}>{user?.full_name || '—'}</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{user?.email || '—'}</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Member Since</Text><Text style={styles.infoValue}>{(user?.created_at || '').split('T')[0]}</Text></View>
        </View>
      )}

      {/* Actions */}
      <View style={[styles.card, SHADOW.SM]}>
        <Text style={styles.cardTitle}>Account Actions</Text>
        <MenuItem icon="create-outline" label="Edit Profile" onPress={() => { setName(user?.full_name || ''); setPhone(user?.phone || ''); setEditing(true); }} />
        <View style={styles.divider} />
        <MenuItem icon="lock-closed-outline" label="Change Password" onPress={() => setPwModal(true)} />
        <View style={styles.divider} />
        <MenuItem icon="settings-outline" label="Settings" onPress={() => nav.navigate('Settings')} />
        <View style={styles.divider} />
        <MenuItem icon="time-outline" label="Prediction History" onPress={() => nav.navigate('History')} />
      </View>

      <View style={[styles.card, SHADOW.SM]}>
        <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
      </View>

      {/* Change Password Modal */}
      <Modal visible={pwModal} transparent animationType="slide" onRequestClose={() => setPwModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOW.LG]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => { setPwModal(false); setPwError(''); }}>
                <Ionicons name="close" size={24} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
            {pwError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={14} color={COLORS.ERROR} />
                <Text style={styles.errorText}>{pwError}</Text>
              </View>
            ) : null}
            {[
              { label: 'Current Password', val: currPw, set: setCurrPw },
              { label: 'New Password',     val: newPw,  set: setNewPw },
              { label: 'Confirm New',      val: confirmPw, set: setConfirmPw },
            ].map((f) => (
              <View key={f.label} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <View style={styles.pwInputWrap}>
                  <TextInput style={[styles.pwInput, { flex: 1 }]} value={f.val} onChangeText={f.set}
                    secureTextEntry={!showPw} placeholder="••••••••"
                    placeholderTextColor={COLORS.TEXT_MUTED} />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: SPACING.MD }}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.TEXT_MUTED} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={[styles.saveBtn, { marginTop: SPACING.SM }]} onPress={handleChangePassword} disabled={pwLoad}>
              {pwLoad ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

export default function ProfileScreen() {
  const { isGuest } = useApp();
  return isGuest ? <GuestProfile /> : <ProfileContent />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content:   { paddingBottom: 40 },
  header: { paddingTop: 52, paddingBottom: SPACING.XXXL, paddingHorizontal: SPACING.LG, alignItems: 'center', gap: SPACING.SM },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: SPACING.MD },
  headerTitle: { fontSize: FONTS.SIZE.XL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  settingsBtn: { padding: SPACING.XS },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  userName:   { fontSize: FONTS.SIZE.XL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  userEmail:  { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.75)' },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.XS,
    backgroundColor: 'rgba(244,162,97,0.2)', paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS, borderRadius: RADIUS.FULL,
  },
  adminBadgeText: { fontSize: FONTS.SIZE.XS, color: COLORS.ACCENT, fontWeight: FONTS.WEIGHT.BOLD },
  statsRow: { flexDirection: 'row', padding: SPACING.LG, gap: SPACING.MD },
  statCard: {
    flex: 1, backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    padding: SPACING.MD, alignItems: 'center', gap: SPACING.XS,
  },
  statVal: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, textAlign: 'center' },
  statLbl: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
  card: { marginHorizontal: SPACING.LG, marginBottom: SPACING.MD, backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL, padding: SPACING.LG },
  cardTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginBottom: SPACING.MD },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.SM },
  infoLabel: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY },
  infoValue: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_PRIMARY, fontWeight: FONTS.WEIGHT.MEDIUM, maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: COLORS.BORDER },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, paddingVertical: SPACING.MD },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY, fontWeight: FONTS.WEIGHT.MEDIUM },
  menuValue: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED, marginTop: 2 },
  fieldGroup: { gap: SPACING.XS, marginBottom: SPACING.MD },
  fieldLabel: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_SECONDARY },
  input: {
    backgroundColor: COLORS.INPUT_BG, borderRadius: RADIUS.MD, height: 48,
    paddingHorizontal: SPACING.MD, fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY,
    borderWidth: 1.5, borderColor: COLORS.INPUT_BORDER,
  },
  editActions: { flexDirection: 'row', gap: SPACING.MD },
  cancelBtn: { flex: 1, height: 44, borderRadius: RADIUS.MD, borderWidth: 1.5, borderColor: COLORS.BORDER, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY, fontWeight: FONTS.WEIGHT.MEDIUM },
  saveBtn: { flex: 1, height: 44, borderRadius: RADIUS.MD, backgroundColor: COLORS.PRIMARY, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: FONTS.SIZE.MD, color: '#fff', fontWeight: FONTS.WEIGHT.BOLD },
  modalOverlay: { flex: 1, backgroundColor: COLORS.OVERLAY, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.SURFACE, borderTopLeftRadius: RADIUS.XXL, borderTopRightRadius: RADIUS.XXL, padding: SPACING.XXL },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.LG },
  modalTitle: { fontSize: FONTS.SIZE.XL, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: 'rgba(239,68,68,0.12)', padding: SPACING.MD, borderRadius: RADIUS.MD,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', marginBottom: SPACING.MD,
  },
  errorText: { color: COLORS.ERROR, fontSize: FONTS.SIZE.SM, flex: 1 },
  pwInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.INPUT_BG, borderRadius: RADIUS.MD, borderWidth: 1.5, borderColor: COLORS.INPUT_BORDER },
  pwInput: { height: 48, paddingHorizontal: SPACING.MD, fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY },
  guestInfoBox: { alignItems: 'center', gap: SPACING.SM, paddingBottom: SPACING.LG },
  guestInfoTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, textAlign: 'center' },
  guestInfoText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },
  signInBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.SM, height: 52, borderRadius: RADIUS.LG,
    backgroundColor: COLORS.PRIMARY,
  },
  signInBtnText: { fontSize: FONTS.SIZE.MD, color: '#fff', fontWeight: FONTS.WEIGHT.BOLD },
});
