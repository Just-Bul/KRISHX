import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../theme';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const nav        = useNavigation();
  const logoScale  = useRef(new Animated.Value(0)).current;
  const logoOpacity= useRef(new Animated.Value(0)).current;
  const textOpacity= useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const leafAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(leafAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => nav.replace('Login'), 1000);
    });
  }, []);

  const leafTranslate = leafAnim.interpolate({ inputRange: [0,1], outputRange: [20, 0] });

  return (
    <LinearGradient
      colors={['#0F172A', '#1E1052', '#4C1D95']}
      style={styles.container}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    >
      {/* Background decoration circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoBox}>
          <Ionicons name="leaf" size={52} color={COLORS.ACCENT} />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        KrishX
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Smart Agriculture AI
      </Animated.Text>

      <Animated.View style={[styles.features, { opacity: tagOpacity, transform: [{ translateY: leafTranslate }] }]}>
        {['Soil Prediction', 'Crop Recommendation', 'Pest Detection'].map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.ACCENT} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle1: { top: -80, right: -80, width: 220, height: 220, borderRadius: 110 },
  circle2: { bottom: 120, left: -60, width: 160, height: 160, borderRadius: 80 },
  circle3: { top: height * 0.35, right: -40, width: 100, height: 100, borderRadius: 50 },
  circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.06)' },
  logoWrap: { marginBottom: SPACING.XL },
  logoBox: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontSize: FONTS.SIZE.DISPLAY,
    fontWeight: FONTS.WEIGHT.EXTRABOLD,
    color: COLORS.TEXT_ON_DARK,
    letterSpacing: 6,
    marginBottom: SPACING.SM,
  },
  tagline: {
    fontSize: FONTS.SIZE.LG,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONTS.WEIGHT.MEDIUM,
    letterSpacing: 2,
    marginBottom: SPACING.XXXL,
  },
  features: { gap: SPACING.SM },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  featureText: { color: 'rgba(255,255,255,0.85)', fontSize: FONTS.SIZE.MD },
  footer: { position: 'absolute', bottom: 48, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: FONTS.SIZE.SM },
  versionText: { color: 'rgba(255,255,255,0.4)', fontSize: FONTS.SIZE.XS, marginTop: 4 },
});
