import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, Alert, Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { predictionAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

function HistoryItem({ item, onView, onDelete }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(slideAnim, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const pests = Array.isArray(item.possible_pests) ? item.possible_pests : [];

  return (
    <View style={[styles.histCard, SHADOW.SM]}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8}>
        <View style={styles.histTop}>
          <View style={styles.histLeft}>
            <View style={styles.histIcon}>
              <Ionicons name="leaf" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.histCrop}>{item.recommended_crop || 'Unknown Crop'}</Text>
              <View style={styles.histMeta}>
                <View style={styles.soilTag}>
                  <Text style={styles.soilTagText}>{item.predicted_soil_type}</Text>
                </View>
                <Text style={styles.histDate}>{(item.timestamp || '').split(' ')[0]}</Text>
              </View>
            </View>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.TEXT_MUTED} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.histExpanded}>
          <View style={styles.histGrid}>
            {[
              { label: 'Temperature', value: `${item.temperature}°C` },
              { label: 'Humidity',    value: `${item.humidity}%` },
              { label: 'Moisture',    value: `${item.moisture}%` },
              { label: 'Nitrogen',    value: `${item.nitrogen} ppm` },
              { label: 'Phosphorous', value: `${item.phosphorous} ppm` },
              { label: 'Potassium',   value: `${item.potassium} ppm` },
            ].map((r) => (
              <View key={r.label} style={styles.histGridItem}>
                <Text style={styles.gridLabel}>{r.label}</Text>
                <Text style={styles.gridValue}>{r.value}</Text>
              </View>
            ))}
          </View>

          {pests.length > 0 && (
            <View style={styles.histPests}>
              <Text style={styles.histPestTitle}>Pests Detected</Text>
              <View style={styles.pestTagRow}>
                {pests.map((p) => (
                  <View key={p} style={styles.pestTag}>
                    <Text style={styles.pestTagText}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.histActions}>
            <TouchableOpacity style={styles.viewBtn} onPress={onView}>
              <Ionicons name="eye-outline" size={16} color={COLORS.PRIMARY} />
              <Text style={styles.viewBtnText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color={COLORS.ERROR} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function GuestGate() {
  const { logout } = useApp();
  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <Text style={styles.headerTitle}>Prediction History</Text>
        <Text style={styles.headerSub}>Sign in to save and view your predictions</Text>
      </LinearGradient>
      <View style={styles.centerWrap}>
        <Ionicons name="lock-closed-outline" size={64} color={COLORS.TEXT_MUTED} />
        <Text style={styles.emptyTitle}>History Unavailable</Text>
        <Text style={styles.emptyText}>
          Create a free account to save your soil analyses and access them anytime.
        </Text>
        <TouchableOpacity style={styles.startBtn} onPress={logout}>
          <Text style={styles.startBtnText}>Sign In / Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HistoryContent() {
  const nav = useNavigation();
  const { showToast } = useApp();
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refresh,  setRefresh]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [fetching, setFetching] = useState(false);

  const load = async (reset = false) => {
    try {
      const p = reset ? 1 : page;
      const data = await predictionAPI.getHistory({ page: p, search });
      if (reset) {
        setRecords(data.records || []);
        setPage(2);
      } else {
        setRecords((r) => [...r, ...(data.records || [])]);
        setPage((p) => p + 1);
      }
      setTotal(data.total || 0);
    } catch {}
  };

  useFocusEffect(useCallback(() => {
    setPage(1);
    setLoading(true);
    load(true).finally(() => setLoading(false));
  }, []));

  const onRefresh = async () => {
    setRefresh(true);
    setSearch('');
    await load(true);
    setRefresh(false);
  };

  const onSearch = async (text) => {
    setSearch(text);
    setLoading(true);
    try {
      const data = await predictionAPI.getHistory({ page: 1, search: text });
      setRecords(data.records || []);
      setTotal(data.total || 0);
      setPage(2);
    } catch {}
    setLoading(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this prediction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await predictionAPI.deleteItem(id);
            setRecords((r) => r.filter((x) => x.id !== id));
            setTotal((t) => t - 1);
            showToast('Record deleted');
          } catch { showToast('Failed to delete', 'error'); }
        },
      },
    ]);
  };

  const loadMore = async () => {
    if (fetching || records.length >= total) return;
    setFetching(true);
    await load();
    setFetching(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <Text style={styles.headerTitle}>Prediction History</Text>
        <Text style={styles.headerSub}>{total} records saved</Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by crop or soil type..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={onSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearch('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={COLORS.PRIMARY} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="time-outline" size={64} color={COLORS.TEXT_MUTED} />
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptyText}>
                {search ? 'No predictions match your search.' : 'Your prediction history will appear here.'}
              </Text>
              {!search && (
                <TouchableOpacity style={styles.startBtn}
                  onPress={() => nav.navigate('Predict', { screen: 'PredictionForm' })}>
                  <Text style={styles.startBtnText}>Start First Analysis</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={fetching ? <ActivityIndicator color={COLORS.PRIMARY} style={{ margin: SPACING.LG }} /> : null}
          renderItem={({ item }) => (
            <HistoryItem
              item={item}
              onView={() => {
                const pestNames = Array.isArray(item.possible_pests) ? item.possible_pests : [];
                nav.navigate('Predict', { screen: 'Result', params: { prediction: {
                  ...item,
                  'Soil Type':          item.predicted_soil_type,
                  'Recommended Crops':  item.all_crops || [item.recommended_crop],
                  'Crop Confidence':    item.crop_confidence,
                  'Recommended Fertilizer': item.recommended_fertilizer,
                  Pests: pestNames.map((n) => ({ name: n })),
                } } });
              }}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const { isGuest } = useApp();
  return isGuest ? <GuestGate /> : <HistoryContent />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { paddingTop: 52, paddingBottom: SPACING.LG, paddingHorizontal: SPACING.LG, gap: SPACING.SM },
  headerTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  headerSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.7)' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.LG,
    paddingHorizontal: SPACING.MD, marginTop: SPACING.SM, height: 44,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: FONTS.SIZE.MD },
  centerWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.MD },
  loadingText: { color: COLORS.TEXT_SECONDARY, fontSize: FONTS.SIZE.MD },
  listContent: { padding: SPACING.LG, gap: SPACING.MD, paddingBottom: 32 },
  histCard: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  histTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.MD },
  histLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, flex: 1 },
  histIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.PRIMARY, justifyContent: 'center', alignItems: 'center' },
  histCrop: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  histMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, marginTop: 4 },
  soilTag:  { backgroundColor: COLORS.PRIMARY + '15', paddingHorizontal: SPACING.SM, paddingVertical: 2, borderRadius: RADIUS.FULL },
  soilTagText: { fontSize: FONTS.SIZE.XS, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  histDate: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
  histExpanded: { borderTopWidth: 1, borderTopColor: COLORS.BORDER, padding: SPACING.MD, gap: SPACING.MD },
  histGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.SM },
  histGridItem: {
    flex: 1, minWidth: '30%', backgroundColor: COLORS.BACKGROUND,
    borderRadius: RADIUS.MD, padding: SPACING.SM,
  },
  gridLabel: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
  gridValue: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY, marginTop: 2 },
  histPests: { gap: SPACING.XS },
  histPestTitle: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_SECONDARY },
  pestTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.XS },
  pestTag: { backgroundColor: COLORS.PEST_BG, paddingHorizontal: SPACING.SM, paddingVertical: 2, borderRadius: RADIUS.FULL, borderWidth: 1, borderColor: COLORS.PEST_BORDER },
  pestTagText: { fontSize: FONTS.SIZE.XS, color: COLORS.ACCENT_DARK },
  histActions: { flexDirection: 'row', gap: SPACING.MD },
  viewBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.SM, height: 40, borderRadius: RADIUS.MD,
    backgroundColor: COLORS.PRIMARY + '10', borderWidth: 1, borderColor: COLORS.PRIMARY,
  },
  viewBtnText: { fontSize: FONTS.SIZE.SM, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.SM, height: 40, paddingHorizontal: SPACING.LG,
    borderRadius: RADIUS.MD, backgroundColor: COLORS.ERROR + '10', borderWidth: 1, borderColor: COLORS.ERROR,
  },
  deleteBtnText: { fontSize: FONTS.SIZE.SM, color: COLORS.ERROR, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.MD, paddingTop: 80 },
  emptyTitle: { fontSize: FONTS.SIZE.XL, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_SECONDARY },
  emptyText:  { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_MUTED, textAlign: 'center', paddingHorizontal: SPACING.XXL },
  startBtn: {
    backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.LG,
    paddingVertical: SPACING.MD, paddingHorizontal: SPACING.XXXL,
    marginTop: SPACING.SM,
  },
  startBtnText: { color: '#fff', fontWeight: FONTS.WEIGHT.BOLD, fontSize: FONTS.SIZE.MD },
});
