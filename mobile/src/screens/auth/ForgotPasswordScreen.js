import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../../services/api';
import { isValidEmail } from '../../utils/validators';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

export default function ForgotPasswordScreen() {
  const nav = useNavigation();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSend = async () => {
    if (!isValidEmail(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      // Always navigate to OTP screen (backend returns same message regardless of account existence)
      nav.navigate('OtpVerification', {
        email:   email.trim().toLowerCase(),
        purpose: 'reset',
      });
    } catch (err) {
      // Even on error, navigate to OTP screen to prevent email enumeration
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.');
      } else {
        nav.navigate('OtpVerification', {
          email:   email.trim().toLowerCase(),
          purpose: 'reset',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.iconWrap}>
          <Ionicons name="key-outline" size={36} color={COLORS.ACCENT} />
        </View>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <Text style={styles.headerSub}>We'll send a reset code to your email</Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={[styles.card, SHADOW.MD]}>

          <Text style={styles.description}>
            Enter the email address linked to your account and we'll send you a 6-digit
            verification code to reset your password.
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.ERROR} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrap, !!error && styles.inputError]}>
              <Ionicons name="mail-outline" size={20}
                color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.TEXT_MUTED}
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.btnGradient}>
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="send-outline" size={18} color="#fff" />
                    <Text style={styles.btnText}>Send Reset Code</Text>
                  </>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => nav.goBack()}>
            <Text style={styles.loginText}>
              Remember your password?{' '}
              <Text style={styles.loginBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          {/* Security note */}
          <View style={styles.secNote}>
            <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.TEXT_MUTED} />
            <Text style={styles.secNoteText}>
              For your security, we'll send a code even if this email isn't registered.
              The code expires in 5 minutes.
            </Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56, paddingBottom: 50,
    paddingHorizontal: SPACING.LG, alignItems: 'center',
  },
  backBtn: { position: 'absolute', top: 56, left: SPACING.LG },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  headerTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  headerSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  body:        { flex: 1, backgroundColor: COLORS.BACKGROUND },
  bodyContent: { padding: SPACING.LG, paddingTop: 0, marginTop: -24 },

  card: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL,
    padding: SPACING.XXL, gap: SPACING.LG,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  description: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY, lineHeight: 22 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: 'rgba(239,68,68,0.12)', padding: SPACING.MD,
    borderRadius: RADIUS.MD, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: COLORS.ERROR, fontSize: FONTS.SIZE.SM, flex: 1 },

  fieldGroup: { gap: SPACING.XS },
  label: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_SECONDARY },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.INPUT_BG, borderRadius: RADIUS.MD,
    borderWidth: 1.5, borderColor: COLORS.INPUT_BORDER, paddingHorizontal: SPACING.MD,
  },
  inputError: { borderColor: COLORS.ERROR },
  inputIcon:  { marginRight: SPACING.SM },
  input:      { flex: 1, height: 50, fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY },

  btn:         { borderRadius: RADIUS.LG, overflow: 'hidden' },
  btnDisabled: { opacity: 0.7 },
  btnGradient: { height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.SM },
  btnText:     { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },

  loginLink:  { alignItems: 'center' },
  loginText:  { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY },
  loginBold:  { color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.BOLD },

  secNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.XS,
    backgroundColor: 'rgba(59,130,246,0.07)', padding: SPACING.SM,
    borderRadius: RADIUS.MD, borderWidth: 1, borderColor: 'rgba(59,130,246,0.18)',
  },
  secNoteText: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, flex: 1, lineHeight: 16 },
});
