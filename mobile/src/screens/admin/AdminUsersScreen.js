import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

function UserRow({ user, onToggle }) {
  const isActive = user.is_active !== 0;
  return (
    <View style={[styles.row, SHADOW.SM]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(user.full_name || 'U')[0].toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.meta}>Joined: {(user.created_at || '').split('T')[0]}</Text>
      </View>
      <View style={styles.actions}>
        <View style={[styles.statusBadge, { backgroundColor: isActive ? COLORS.SUCCESS + '20' : COLORS.ERROR + '20' }]}>
          <Text style={[styles.statusText, { color: isActive ? COLORS.SUCCESS : COLORS.ERROR }]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: isActive ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }]}
          onPress={() => onToggle(user.id, !isActive)}>
          <Ionicons name={isActive ? 'ban-outline' : 'checkmark-circle-outline'}
            size={16} color={isActive ? COLORS.ERROR : COLORS.SUCCESS} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminUsersScreen() {
  const nav = useNavigation();
  const { showToast } = useApp();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [total,   setTotal]   = useState(0);

  const load = async () => {
    try {
      const d = await adminAPI.getUsers(1);
      setUsers(d.users || []);
      setTotal(d.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = (id, active) => {
    Alert.alert(
      active ? 'Activate User' : 'Deactivate User',
      `Are you sure you want to ${active ? 'activate' : 'deactivate'} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: active ? 'Activate' : 'Deactivate',
          style: active ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await adminAPI.toggleUser(id, active);
              setUsers((u) => u.map((x) => x.id === id ? { ...x, is_active: active ? 1 : 0 } : x));
              showToast(`User ${active ? 'activated' : 'deactivated'}`);
            } catch { showToast('Action failed', 'error'); }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <Text style={styles.headerSub}>{total} registered accounts</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>
      ) : (
        <FlatList data={users} keyExtractor={(u) => String(u.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={async () => { setRefresh(true); await load(); setRefresh(false); }} tintColor={COLORS.PRIMARY} />}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No users found.</Text></View>}
          renderItem={({ item }) => <UserRow user={item} onToggle={handleToggle} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { paddingTop: 52, paddingBottom: SPACING.LG, paddingHorizontal: SPACING.LG, gap: SPACING.XS },
  backBtn: { marginBottom: SPACING.SM },
  headerTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  headerSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.7)' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:   { padding: SPACING.LG, gap: SPACING.MD },
  emptyText: { color: COLORS.TEXT_MUTED, fontSize: FONTS.SIZE.MD },
  row: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    padding: SPACING.MD, flexDirection: 'row', alignItems: 'center', gap: SPACING.MD,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.PRIMARY, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD },
  info: { flex: 1 },
  name:  { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
  email: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  meta:  { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, marginTop: 2 },
  actions: { alignItems: 'flex-end', gap: SPACING.XS },
  statusBadge: { paddingHorizontal: SPACING.SM, paddingVertical: 2, borderRadius: RADIUS.FULL },
  statusText:  { fontSize: FONTS.SIZE.XS, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  toggleBtn:   { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
