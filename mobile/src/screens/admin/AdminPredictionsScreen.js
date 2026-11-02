import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

function PredRow({ item, onDelete }) {
  return (
    <View style={[styles.row, SHADOW.SM]}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name="leaf" size={16} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowCrop}>{item.recommended_crop || '—'}</Text>
          <View style={styles.rowMeta}>
            <View style={styles.soilTag}>
              <Text style={styles.soilTagText}>{item.predicted_soil_type}</Text>
            </View>
            {item.full_name && <Text style={styles.rowUser}>by {item.full_name}</Text>}
          </View>
          <Text style={styles.rowDate}>{item.timestamp}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} />
      </TouchableOpacity>
    </View>
  );
}

export default function AdminPredictionsScreen() {
  const nav = useNavigation();
  const { showToast } = useApp();
  const [records, setRecords]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [refresh, setRefresh]  = useState(false);
  const [search,  setSearch]   = useState('');
  const [total,   setTotal]    = useState(0);

  const load = async (s = search) => {
    try {
      const d = await adminAPI.getPredictions({ page: 1, search: s });
      setRecords(d.records || []);
      setTotal(d.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Prediction', 'Permanently delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await adminAPI.deletePrediction(id);
            setRecords((r) => r.filter((x) => x.id !== id));
            setTotal((t) => t - 1);
            showToast('Prediction deleted');
          } catch { showToast('Delete failed', 'error'); }
        },
      },
    ]);
  };

  const onSearch = (text) => {
    setSearch(text);
    load(text);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Predictions</Text>
        <Text style={styles.headerSub}>{total} records total</Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput} value={search} onChangeText={onSearch}
            placeholder="Search crop or soil..." placeholderTextColor="rgba(255,255,255,0.4)" />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>
      ) : (
        <FlatList data={records} keyExtractor={(r) => String(r.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refresh}
            onRefresh={async () => { setRefresh(true); await load(); setRefresh(false); }}
            tintColor={COLORS.PRIMARY} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="analytics-outline" size={48} color={COLORS.TEXT_MUTED} />
              <Text style={styles.emptyText}>No predictions found.</Text>
            </View>
          }
          renderItem={({ item }) => <PredRow item={item} onDelete={() => handleDelete(item.id)} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { paddingTop: 52, paddingBottom: SPACING.LG, paddingHorizontal: SPACING.LG, gap: SPACING.XS },
  backBtn: { marginBottom: SPACING.XS },
  headerTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  headerSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.7)' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.LG,
    paddingHorizontal: SPACING.MD, height: 40, marginTop: SPACING.SM,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: FONTS.SIZE.MD },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: SPACING.MD },
  emptyText: { color: COLORS.TEXT_MUTED, fontSize: FONTS.SIZE.MD },
  list: { padding: SPACING.LG, gap: SPACING.SM },
  row: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    padding: SPACING.MD, flexDirection: 'row', alignItems: 'center', gap: SPACING.MD,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, flex: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.PRIMARY, justifyContent: 'center', alignItems: 'center' },
  rowCrop: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, marginTop: 4 },
  soilTag: { backgroundColor: COLORS.PRIMARY + '18', paddingHorizontal: SPACING.SM, paddingVertical: 2, borderRadius: RADIUS.FULL },
  soilTagText: { fontSize: FONTS.SIZE.XS, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  rowUser: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
  rowDate: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, marginTop: 2 },
  deleteBtn: { padding: SPACING.SM },
});
