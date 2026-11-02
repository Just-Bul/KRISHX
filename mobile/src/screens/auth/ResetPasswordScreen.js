import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

// Simple password strength check — returns { score 0-4, label, color }
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: COLORS.BORDER };
  let score = 0;
  if (pw.length >= 8)                 score++;
  if (/[A-Z]/.test(pw))              score++;
  if (/[0-9]/.test(pw))              score++;
  if (/[^A-Za-z0-9]/.test(pw))      score++;
  const map = [
    { label: 'Very Weak', color: COLORS.ERROR       },
    { label: 'Weak',      color: '#F97316'          },
    { label: 'Fair',      color: COLORS.WARNING     },
    { label: 'Strong',    color: '#22C55E'          },
    { label: 'Very Strong',color: COLORS.SUCCESS    },
  ];
  return { score, ...map[score] };
}

export default function ResetPasswordScreen() {
  const nav   = useNavigation();
  const route = useRoute();
  const { email = '', reset_token = '' } = route.params || {};

  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [done,        setDone]        = useState(false);

  const strength = getStrength(newPw);

  const handleReset = async () => {
    setError('');
    if (newPw.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ reset_token, new_password: newPw });
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Reset failed. The link may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        {!done && (
          <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.iconWrap}>
          <Ionicons
            name={done ? 'checkmark-circle' : 'lock-open-outline'}
            size={36}
            color={done ? COLORS.SUCCESS : COLORS.ACCENT}
          />
        </View>
        <Text style={styles.headerTitle}>{done ? 'Password Reset!' : 'New Password'}</Text>
        <Text style={styles.headerSub}>
          {done ? 'You can now sign in' : 'Create a strong password'}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={[styles.card, SHADOW.MD]}>

          {done ? (
            /* ── Success state ─────────────────────────────────────────────── */
            <View style={styles.successWrap}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={72} color={COLORS.SUCCESS} />
              </View>
              <Text style={styles.successTitle}>Password Updated</Text>
              <Text style={styles.successBody}>
                Your password has been reset successfully.
                Sign in with your new password.
              </Text>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => nav.navigate('Login')}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.btnGradient}>
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Sign In Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Reset form ────────────────────────────────────────────────── */
            <>
              {/* Email label */}
              <View style={styles.emailRow}>
                <Ionicons name="mail-outline" size={15} color={COLORS.TEXT_MUTED} />
                <Text style={styles.emailText} numberOfLines={1}>{email}</Text>
              </View>

              {/* Error banner */}
              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={15} color={COLORS.ERROR} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* New password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={[styles.inputWrap, error && newPw && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20}
                    color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Min 6 characters"
                    placeholderTextColor={COLORS.TEXT_MUTED}
                    value={newPw}
                    onChangeText={(v) => { setNewPw(v); setError(''); }}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showNew ? 'eye-off-outline' : 'eye-outline'}
                      size={20} color={COLORS.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>

                {/* Strength meter */}
                {newPw.length > 0 && (
                  <View style={styles.strengthWrap}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4].map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            { backgroundColor: i <= strength.score ? strength.color : COLORS.BORDER },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[
                  styles.inputWrap,
                  confirmPw && confirmPw !== newPw && styles.inputError,
                  confirmPw && confirmPw === newPw && styles.inputSuccess,
                ]}>
                  <Ionicons name="shield-checkmark-outline" size={20}
                    color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Repeat your password"
                    placeholderTextColor={COLORS.TEXT_MUTED}
                    value={confirmPw}
                    onChangeText={(v) => { setConfirmPw(v); setError(''); }}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={20} color={COLORS.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>
                {confirmPw.length > 0 && confirmPw !== newPw && (
                  <Text style={styles.matchError}>Passwords do not match</Text>
                )}
                {confirmPw.length > 0 && confirmPw === newPw && (
                  <View style={styles.matchOkRow}>
                    <Ionicons name="checkmark-circle" size={13} color={COLORS.SUCCESS} />
                    <Text style={styles.matchOk}>Passwords match</Text>
                  </View>
                )}
              </View>

              {/* Requirements hint */}
              <View style={styles.hintsBox}>
                <Text style={styles.hintsTitle}>Password recommendations</Text>
                {[
                  ['At least 6 characters',              newPw.length >= 6],
                  ['One uppercase letter (A-Z)',          /[A-Z]/.test(newPw)],
                  ['One number (0-9)',                    /[0-9]/.test(newPw)],
                  ['One special character (!@#$...)',     /[^A-Za-z0-9]/.test(newPw)],
                ].map(([hint, met]) => (
                  <View key={hint} style={styles.hintRow}>
                    <Ionicons
                      name={met ? 'checkmark-circle' : 'ellipse-outline'}
                      size={13}
                      color={met ? COLORS.SUCCESS : COLORS.TEXT_MUTED}
                    />
                    <Text style={[styles.hintText, met && { color: COLORS.SUCCESS }]}>{hint}</Text>
                  </View>
                ))}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.resetBtn, loading && styles.btnDisabled]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.btnGradient}>
                  {loading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <>
                        <Ionicons name="key-outline" size={20} color="#fff" />
                        <Text style={styles.btnText}>Reset Password</Text>
                      </>}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56, paddingBottom: 40,
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
  bodyContent: { padding: SPACING.LG, paddingTop: 0, marginTop: -24, paddingBottom: SPACING.XXL },

  card: {
    backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL,
    padding: SPACING.XXL, gap: SPACING.LG,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },

  emailRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD,
    padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  emailText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, flex: 1 },

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
  inputError:   { borderColor: COLORS.ERROR },
  inputSuccess: { borderColor: COLORS.SUCCESS },
  inputIcon:    { marginRight: SPACING.SM },
  input:        { height: 50, fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY },
  eyeBtn:       { padding: SPACING.SM },

  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, marginTop: 4 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar:  { height: 4, flex: 1, borderRadius: 2 },
  strengthLabel:{ fontSize: FONTS.SIZE.XS, fontWeight: FONTS.WEIGHT.SEMIBOLD },

  matchError: { fontSize: FONTS.SIZE.XS, color: COLORS.ERROR, marginTop: 2 },
  matchOkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  matchOk:    { fontSize: FONTS.SIZE.XS, color: COLORS.SUCCESS },

  hintsBox: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD,
    padding: SPACING.MD, gap: SPACING.XS,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  hintsTitle: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED,
    fontWeight: FONTS.WEIGHT.SEMIBOLD, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  hintRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS },
  hintText: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },

  resetBtn:    { borderRadius: RADIUS.LG, overflow: 'hidden' },
  loginBtn:    { borderRadius: RADIUS.LG, overflow: 'hidden' },
  btnDisabled: { opacity: 0.7 },
  btnGradient: { height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.SM },
  btnText:     { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },

  successWrap:  { alignItems: 'center', gap: SPACING.LG, paddingVertical: SPACING.MD },
  successIcon:  { marginBottom: SPACING.SM },
  successTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.SUCCESS },
  successBody:  { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY,
    textAlign: 'center', lineHeight: 22 },
});
