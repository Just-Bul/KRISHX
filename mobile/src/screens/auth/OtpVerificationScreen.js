import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { authAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

const OTP_LENGTH   = 6;
const OTP_DURATION = 300; // 5 minutes in seconds
const RESEND_COOLDOWN = 60; // 1 minute between resend taps

// ── Individual OTP box row ────────────────────────────────────────────────────
function OtpBoxes({ value, onPress, hasError }) {
  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.otpRow}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => {
        const filled  = i < value.length;
        const current = i === value.length;
        return (
          <View
            key={i}
            style={[
              styles.otpBox,
              filled  && styles.otpBoxFilled,
              current && styles.otpBoxActive,
              hasError && styles.otpBoxError,
            ]}
          >
            <Text style={[styles.otpDigit, hasError && { color: COLORS.ERROR }]}>
              {value[i] || ''}
            </Text>
          </View>
        );
      })}
    </TouchableOpacity>
  );
}

// ── Countdown display ─────────────────────────────────────────────────────────
function Countdown({ seconds }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const urgent = seconds <= 60;
  return (
    <View style={styles.timerRow}>
      <Ionicons name="time-outline" size={14}
        color={urgent ? COLORS.ERROR : COLORS.TEXT_MUTED} />
      <Text style={[styles.timerText, urgent && { color: COLORS.ERROR }]}>
        {mins}:{secs}
      </Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function OtpVerificationScreen() {
  const nav    = useNavigation();
  const route  = useRoute();
  const { login, showToast } = useApp();

  const { email = '', purpose = 'register' } = route.params || {};
  const isRegister = purpose === 'register';

  const [otp,        setOtp]        = useState('');
  const [loading,    setLoading]    = useState(false);
  const [resending,  setResending]  = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(OTP_DURATION);
  const [cooldown,   setCooldown]   = useState(0);      // resend button cooldown

  const inputRef  = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── OTP expiry timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  // ── Resend cooldown ticker ──────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const focusInput = () => inputRef.current?.focus();

  const handleOtpChange = (val) => {
    if (!/^\d*$/.test(val)) return;   // digits only
    setOtp(val);
    setError('');
    if (val.length === OTP_LENGTH) {
      handleVerify(val);
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerify = async (code = otp) => {
    if (code.length !== OTP_LENGTH) {
      setError('Enter all 6 digits');
      shake();
      return;
    }
    if (timeLeft <= 0) {
      setError('OTP has expired. Please request a new one.');
      shake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        const data = await authAPI.verifyOtp({ email, otp_code: code });
        await login(data.user, data.access_token, data.refresh_token);
        showToast(`Welcome, ${data.user.full_name.split(' ')[0]}! Account activated.`);
      } else {
        const data = await authAPI.verifyResetOtp({ email, otp_code: code });
        setSuccess(true);
        nav.navigate('ResetPassword', { email, reset_token: data.reset_token });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed. Try again.';
      const code_ = err.response?.data?.code;
      setOtp('');
      setError(msg);
      shake();
      if (code_ === 'OTP_EXPIRED' || code_ === 'OTP_MAX_ATTEMPTS') {
        setTimeLeft(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await authAPI.resendOtp({ email, otp_type: isRegister ? 'register' : 'reset' });
      setOtp('');
      setTimeLeft(OTP_DURATION);
      setCooldown(RESEND_COOLDOWN);
      showToast('New OTP sent to your email.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not resend OTP. Try again.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const expired = timeLeft === 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={36} color={COLORS.ACCENT} />
        </View>
        <Text style={styles.headerTitle}>
          {isRegister ? 'Verify Email' : 'Enter Reset Code'}
        </Text>
        <Text style={styles.headerSub}>
          {isRegister ? 'Complete your registration' : 'Reset your password'}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={[styles.card, SHADOW.MD]}>

          {/* Email label */}
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={16} color={COLORS.TEXT_MUTED} />
            <Text style={styles.emailText} numberOfLines={1}>{email}</Text>
          </View>

          <Text style={styles.instruction}>
            We sent a 6-digit verification code to the email above.
            {'\n'}Enter it below to {isRegister ? 'activate your account' : 'reset your password'}.
          </Text>

          {/* OTP boxes + hidden input */}
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <OtpBoxes value={otp} onPress={focusInput} hasError={!!error} />
          </Animated.View>

          {/* Hidden actual TextInput */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            caretHidden
            autoFocus
            editable={!loading && !expired}
          />

          {/* Error message */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={15} color={COLORS.ERROR} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Timer */}
          {!expired ? (
            <View style={styles.timerWrap}>
              <Text style={styles.timerLabel}>Code expires in</Text>
              <Countdown seconds={timeLeft} />
            </View>
          ) : (
            <View style={styles.expiredBanner}>
              <Ionicons name="time-outline" size={14} color={COLORS.WARNING} />
              <Text style={styles.expiredText}>OTP expired — request a new one below</Text>
            </View>
          )}

          {/* Verify button */}
          <TouchableOpacity
            style={[styles.verifyBtn, (loading || expired || otp.length < OTP_LENGTH) && styles.btnDisabled]}
            onPress={() => handleVerify()}
            disabled={loading || expired || otp.length < OTP_LENGTH}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]}
              style={styles.btnGradient}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.btnText}>Verify Code</Text>
                  </>}
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive it?</Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resending || cooldown > 0}
              activeOpacity={0.7}
            >
              {resending ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              ) : cooldown > 0 ? (
                <Text style={styles.resendCooldown}>Resend in {cooldown}s</Text>
              ) : (
                <Text style={[styles.resendLink, expired && { color: COLORS.WARNING }]}>
                  Resend OTP
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Dev mode notice */}
          <View style={styles.devNote}>
            <Ionicons name="information-circle-outline" size={13} color={COLORS.TEXT_MUTED} />
            <Text style={styles.devNoteText}>
              If SMTP is not configured, check the Flask console for your OTP.
            </Text>
          </View>

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
    backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS.XL,
    padding: SPACING.XXL,
    gap: SPACING.LG,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },

  emailRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD,
    padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  emailText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY, flex: 1 },

  instruction: {
    fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY,
    lineHeight: 22, textAlign: 'center',
  },

  // OTP Boxes
  otpRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: SPACING.SM,
  },
  otpBox: {
    width: 46, height: 58, borderRadius: RADIUS.MD,
    borderWidth: 2, borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center', alignItems: 'center',
  },
  otpBoxActive: { borderColor: COLORS.PRIMARY, backgroundColor: COLORS.PRIMARY + '10' },
  otpBoxFilled: { borderColor: COLORS.PRIMARY_LIGHT, backgroundColor: COLORS.PRIMARY + '08' },
  otpBoxError:  { borderColor: COLORS.ERROR, backgroundColor: COLORS.ERROR + '10' },
  otpDigit:     { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },

  hiddenInput: {
    position: 'absolute', width: 1, height: 1,
    opacity: 0, top: -100,
  },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: 'rgba(239,68,68,0.12)', padding: SPACING.MD,
    borderRadius: RADIUS.MD, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: COLORS.ERROR, fontSize: FONTS.SIZE.SM, flex: 1 },

  timerWrap:  { alignItems: 'center', gap: SPACING.XS },
  timerLabel: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
  timerRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS },
  timerText:  { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_MUTED, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  expiredBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.XS,
    backgroundColor: 'rgba(245,158,11,0.12)', padding: SPACING.MD,
    borderRadius: RADIUS.MD, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  expiredText: { fontSize: FONTS.SIZE.SM, color: COLORS.WARNING },

  verifyBtn:    { borderRadius: RADIUS.LG, overflow: 'hidden' },
  btnDisabled:  { opacity: 0.55 },
  btnGradient:  {
    height: 52, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: SPACING.SM,
  },
  btnText: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },

  resendRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: SPACING.SM,
  },
  resendLabel:    { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED },
  resendLink:     { fontSize: FONTS.SIZE.SM, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.BOLD },
  resendCooldown: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED },

  devNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.XS,
    backgroundColor: 'rgba(59,130,246,0.07)', padding: SPACING.SM,
    borderRadius: RADIUS.MD, borderWidth: 1, borderColor: 'rgba(59,130,246,0.18)',
  },
  devNoteText: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, flex: 1, lineHeight: 16 },
});
