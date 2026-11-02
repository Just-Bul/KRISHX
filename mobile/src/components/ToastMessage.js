import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';

const TOAST_CONFIG = {
  success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d', icon: 'checkmark-circle' },
  error:   { bg: '#fee2e2', border: '#dc2626', text: '#dc2626', icon: 'close-circle' },
  warning: { bg: '#fef9c3', border: '#ca8a04', text: '#a16207', icon: 'warning' },
  info:    { bg: '#dbeafe', border: '#2563eb', text: '#1e40af', icon: 'information-circle' },
};

export default function ToastMessage() {
  const { toast } = useApp();
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateY= useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast]);

  if (!toast) return null;

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.success;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.toast, { backgroundColor: config.bg, borderColor: config.border }]}>
        <Ionicons name={config.icon} size={20} color={config.text} />
        <Text style={[styles.message, { color: config.text }]}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 56, left: SPACING.LG, right: SPACING.LG, zIndex: 9999,
  },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    padding: SPACING.MD, borderRadius: RADIUS.LG,
    borderWidth: 1, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  message: { fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.MEDIUM, flex: 1 },
});
