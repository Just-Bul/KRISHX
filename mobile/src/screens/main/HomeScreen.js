import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { predictionAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

const STATS = [
  { key: 'total_predictions',      label: 'Total',   icon: 'analytics-outline',   color: COLORS.PRIMARY },
  { key: 'predictions_this_week',  label: 'This Week',icon: 'calendar-outline',   color: COLORS.INFO },
  { key: 'top_crop',               label: 'Top Crop', icon: 'leaf-outline',       color: COLORS.SUCCESS },
  { key: 'top_soil',               label: 'Top Soil', icon: 'earth-outline',      color: COLORS.ACCENT_DARK },
];

function StatCard({ stat, value }) {
  return (
    <View style={[styles.statCard, SHADOW.SM]}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + '18' }]}>
        <Ionicons name={stat.icon} size={20} color={stat.color} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>
        {value !== null && value !== undefined ? String(value) : '—'}
      </Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );
}

function RecentCard({ item, onPress }) {
  return (
    <TouchableOpacity style={[styles.recentCard, SHADOW.SM]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.recentLeft}>
        <View style={[styles.recentDot, { backgroundColor: COLORS.PRIMARY_LIGHT }]}>
          <Ionicons name="leaf" size={14} color="#fff" />
        </View>
        <View>
          <Text style={styles.recentCrop}>{item.recommended_crop || '—'}</Text>
          <Text style={styles.recentSoil}>{item.predicted_soil_type} Soil</Text>
        </View>
      </View>
      <View style={styles.recentRight}>
        <Text style={styles.recentDate}>{(item.timestamp || '').split(' ')[0]}</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_MUTED} />
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const nav = useNavigation();
  const { user, isGuest } = useApp();
  const [stats,    setStats]    = useState({});
  const [recent,   setRecent]   = useState([]);
  const [refresh,  setRefresh]  = useState(false);
  const fadeAnim  = React.useRef(new Animated.Value(0)).current;

  const load = async () => {
    if (isGuest) return; // guests have no JWT — skip authenticated API calls
    try {
      const histData = await predictionAPI.getHistory({ page: 1 });
      const preds    = histData.records || [];
      const week     = preds.filter((p) => {
        const days = (Date.now() - new Date(p.timestamp)) / 86400000;
        return days <= 7;
      }).length;
      const crops = {}, soils = {};
      preds.forEach((p) => {
        if (p.recommended_crop)    crops[p.recommended_crop] = (crops[p.recommended_crop] || 0) + 1;
        if (p.predicted_soil_type) soils[p.predicted_soil_type] = (soils[p.predicted_soil_type] || 0) + 1;
      });
      const topCrop = Object.keys(crops).sort((a, b) => crops[b] - crops[a])[0] || null;
      const topSoil = Object.keys(soils).sort((a, b) => soils[b] - soils[a])[0] || null;
      setStats({ total_predictions: histData.total, predictions_this_week: week, top_crop: topCrop, top_soil: topSoil });
      setRecent(preds.slice(0, 3));
    } catch {}
  };

  useFocusEffect(useCallback(() => {
    load();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []));

  const onRefresh = async () => {
    setRefresh(true);
    await load();
    setRefresh(false);
  };

  const firstName = (user?.full_name || 'Farmer').split(' ')[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={COLORS.PRIMARY} />}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID, COLORS.GRADIENT_END]}
        style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}
            onPress={() => nav.navigate('Profile', { screen: 'ProfileMain' })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.analyzeBtn}
          onPress={() => nav.navigate('Predict', { screen: 'PredictionForm' })} activeOpacity={0.85}>
          <View style={styles.analyzeBtnInner}>
            <Ionicons name="flask-outline" size={22} color={COLORS.PRIMARY} />
            <View style={{ flex: 1 }}>
              <Text style={styles.analyzeBtnTitle}>Start New Analysis</Text>
              <Text style={styles.analyzeBtnSub}>Predict soil • crops • pests</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={26} color={COLORS.PRIMARY} />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <View style={styles.statsGrid}>
            {STATS.map((s) => (
              <StatCard key={s.key} stat={s} value={stats[s.key]} />
            ))}
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          {/* Combined Soil Analysis card */}
          <TouchableOpacity style={[styles.analysisCard, SHADOW.SM]}
            onPress={() => nav.navigate('Predict', { screen: 'PredictionForm' })} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.analysisGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.analysisLeft}>
                <View style={styles.analysisIconWrap}>
                  <Ionicons name="analytics" size={30} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.analysisTitle}>Soil & Crop Analysis</Text>
                  <View style={styles.analysisTags}>
                    {['Soil Prediction', 'Crop Recommendation', 'Fertilizer Guide'].map((t) => (
                      <View key={t} style={styles.analysisTag}>
                        <Text style={styles.analysisTagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary feature cards */}
          <View style={styles.featureGrid}>
            {[
              { icon: 'bug',    label: 'Pest\nDetection', color: COLORS.ACCENT_DARK + '18', iconColor: COLORS.ACCENT,  nav: () => nav.navigate('Predict', { screen: 'PestDetection' }) },
              { icon: 'time',   label: 'View\nHistory',   color: COLORS.INFO + '12',        iconColor: COLORS.INFO,    nav: () => nav.navigate('History') },
              { icon: 'person', label: 'My\nProfile',     color: COLORS.ERROR + '12',       iconColor: COLORS.ERROR,   nav: () => nav.navigate('Profile', { screen: 'ProfileMain' }) },
            ].map((f) => (
              <TouchableOpacity key={f.label} style={[styles.featureCard, { backgroundColor: f.color }]}
                onPress={f.nav} activeOpacity={0.8}>
                <Ionicons name={f.icon} size={28} color={f.iconColor} />
                <Text style={[styles.featureLabel, { color: f.iconColor }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Predictions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Predictions</Text>
            <TouchableOpacity onPress={() => nav.navigate('History')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recent.length === 0 ? (
            <View style={[styles.emptyCard, SHADOW.SM]}>
              <Ionicons name="leaf-outline" size={40} color={COLORS.TEXT_MUTED} />
              <Text style={styles.emptyTitle}>No predictions yet</Text>
              <Text style={styles.emptyText}>Start your first soil analysis to see results here.</Text>
            </View>
          ) : (
            recent.map((item) => {
              const pestNames = Array.isArray(item.possible_pests) ? item.possible_pests : [];
              return (
                <RecentCard key={item.id} item={item}
                  onPress={() => nav.navigate('Predict', { screen: 'Result', params: { prediction: {
                    ...item,
                    'Soil Type':              item.predicted_soil_type,
                    'Recommended Crops':      item.all_crops || [item.recommended_crop],
                    'Crop Confidence':        item.crop_confidence,
                    'Recommended Fertilizer': item.recommended_fertilizer,
                    Pests: pestNames.map((n) => ({ name: n })),
                  } } })} />
              );
            })
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content: { paddingBottom: 32 },
  header: { paddingTop: 56, paddingBottom: SPACING.XXXL, paddingHorizontal: SPACING.LG, gap: SPACING.LG },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: FONTS.SIZE.MD, color: 'rgba(255,255,255,0.8)' },
  name: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  avatarBtn: {},
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { color: '#fff', fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD },
  analyzeBtn: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    overflow: 'hidden', ...SHADOW.SM,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
  },
  analyzeBtnInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.LG, gap: SPACING.MD },
  analyzeBtnTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.PRIMARY_LIGHT },
  analyzeBtnSub:   { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  section: { paddingHorizontal: SPACING.LG, marginTop: SPACING.XXL },
  sectionTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginBottom: SPACING.MD },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.MD },
  seeAll: { fontSize: FONTS.SIZE.SM, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.MD },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS.LG, padding: SPACING.MD,
    alignItems: 'center', gap: SPACING.SM,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, textAlign: 'center' },
  statLabel: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, textAlign: 'center' },
  analysisCard: { borderRadius: RADIUS.XL, overflow: 'hidden', marginBottom: SPACING.MD },
  analysisGradient: { padding: SPACING.LG, flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
  analysisLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, flex: 1 },
  analysisIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  analysisTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff', marginBottom: SPACING.XS },
  analysisTags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.XS },
  analysisTag: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.FULL, paddingHorizontal: SPACING.SM, paddingVertical: 2 },
  analysisTagText: { fontSize: FONTS.SIZE.XS, color: 'rgba(255,255,255,0.9)', fontWeight: FONTS.WEIGHT.MEDIUM },
  featureGrid: { flexDirection: 'row', gap: SPACING.MD },
  featureCard: {
    flex: 1, aspectRatio: 1, borderRadius: RADIUS.LG,
    justifyContent: 'center', alignItems: 'center', gap: SPACING.SM,
  },
  featureLabel: { fontSize: FONTS.SIZE.XS, fontWeight: FONTS.WEIGHT.SEMIBOLD, textAlign: 'center' },
  recentCard: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG,
    padding: SPACING.MD, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  recentLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, flex: 1 },
  recentDot:   { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  recentCrop:  { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
  recentSoil:  { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  recentRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  recentDate:  { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
  emptyCard: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL,
    padding: SPACING.XXXL, alignItems: 'center', gap: SPACING.MD,
  },
  emptyTitle: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_SECONDARY },
  emptyText:  { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_MUTED, textAlign: 'center', lineHeight: 22 },
});
