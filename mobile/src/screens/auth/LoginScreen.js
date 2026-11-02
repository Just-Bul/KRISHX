import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { authAPI } from '../../services/api';
import { healthAPI } from '../../services/api';
import { validateLoginForm, hasErrors } from '../../utils/validators';
import { getRememberEmail, setRememberEmail, clearRememberEmail } from '../../utils/storage';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';
import { useEffect } from 'react';

export default function LoginScreen() {
  const nav = useNavigation();
  const { login, loginAsGuest, showToast } = useApp();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const [backendOk, setBackendOk] = useState(null); // null=checking, true=ok, false=offline
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getRememberEmail().then((e) => { if (e) { setEmail(e); setRemember(true); } });

    // Retry up to 3 times — HF Space cold-start takes 30-60s
    let cancelled = false;
    const checkBackend = async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await healthAPI.check();
          if (!cancelled) setBackendOk(true);
          return;
        } catch {
          if (attempt < 2 && !cancelled) {
            await new Promise((r) => setTimeout(r, 10000));
          }
        }
      }
      if (!cancelled) setBackendOk(false);
    };
    checkBackend();
    return () => { cancelled = true; };
  }, []);

  const handleGuestLogin = () => {
    loginAsGuest();
    showToast('Signed in as Guest — limited features available', 'info');
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    const errs = validateLoginForm({ email, password });
    setErrors(errs);
    if (hasErrors(errs)) { shake(); return; }

    setLoading(true);
    try {
      const data = await authAPI.login({ email: email.trim().toLowerCase(), password });
      if (remember) await setRememberEmail(email.trim().toLowerCase());
      else await clearRememberEmail();
      await login(data.user, data.access_token, data.refresh_token);
      showToast(`Welcome back, ${data.user.full_name.split(' ')[0]}!`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Check your credentials.';
      setErrors({ form: msg });
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_MID]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoMini}>
            <Ionicons name="leaf" size={28} color={COLORS.ACCENT} />
          </View>
          <Text style={styles.brand}>KrishX</Text>
          <Text style={styles.headerSub}>Smart Agriculture AI</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Animated.View style={[styles.card, SHADOW.MD, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {errors.form && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.ERROR} />
              <Text style={styles.errorBannerText}>{errors.form}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrap, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.TEXT_MUTED}
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: null, form: null })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrap, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.TEXT_MUTED}
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: null, form: null })); }}
                secureTextEntry={!showPw}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.checkRow} onPress={() => setRemember(!remember)}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                {remember && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => nav.navigate('ForgotPassword')}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.btnGradient}>
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.btnText}>Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.registerLink} onPress={() => nav.navigate('Register')}>
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerBold}>Create Account</Text>
            </Text>
          </TouchableOpacity>

          {/* ── Guest Login ─────────────────────────────────── */}
          <View style={styles.guestSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity style={styles.guestBtn} onPress={handleGuestLogin} activeOpacity={0.8}>
              <Ionicons name="person-outline" size={18} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
            <Text style={styles.guestNote}>No account needed — explore without signing in</Text>
          </View>
        </Animated.View>

        {/* Backend status indicator */}
        {backendOk === false && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={14} color={COLORS.WARNING} />
            <Text style={styles.offlineText}>Backend offline — predictions unavailable</Text>
          </View>
        )}

        {/* Legal links footer */}
        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => nav.navigate('PrivacyPolicy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSep}>·</Text>
          <TouchableOpacity onPress={() => nav.navigate('Terms')}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 50, alignItems: 'center' },
  headerContent: { alignItems: 'center', gap: SPACING.SM },
  logoMini: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  brand: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.EXTRABOLD, color: '#fff', letterSpacing: 4 },
  headerSub: { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 },
  body: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  bodyContent: { padding: SPACING.LG, paddingTop: 0, marginTop: -24 },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS.XL,
    padding: SPACING.XXL,
    gap: SPACING.LG,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
  subtitle: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY, marginTop: -SPACING.MD },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
    backgroundColor: 'rgba(239,68,68,0.12)', padding: SPACING.MD,
    borderRadius: RADIUS.MD, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  errorBannerText: { color: COLORS.ERROR, fontSize: FONTS.SIZE.SM, flex: 1 },
  fieldGroup: { gap: SPACING.XS },
  label: { fontSize: FONTS.SIZE.SM, fontWeight: FONTS.WEIGHT.SEMIBOLD, color: COLORS.TEXT_SECONDARY },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.INPUT_BG,
    borderRadius: RADIUS.MD, borderWidth: 1.5, borderColor: COLORS.INPUT_BORDER,
    paddingHorizontal: SPACING.MD,
  },
  inputError: { borderColor: COLORS.ERROR },
  inputIcon: { marginRight: SPACING.SM },
  input: { flex: 1, height: 50, fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY },
  eyeBtn: { padding: SPACING.SM },
  fieldError: { fontSize: FONTS.SIZE.XS, color: COLORS.ERROR, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 2,
    borderColor: COLORS.PRIMARY, justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
  rememberText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_SECONDARY },
  linkText: { fontSize: FONTS.SIZE.SM, color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.SEMIBOLD },
  loginBtn: { borderRadius: RADIUS.LG, overflow: 'hidden' },
  btnDisabled: { opacity: 0.7 },
  btnGradient: { height: 52, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.BORDER },
  dividerText: { fontSize: FONTS.SIZE.SM, color: COLORS.TEXT_MUTED },
  registerLink: { alignItems: 'center' },
  registerText: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY },
  registerBold: { color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.BOLD },
  guestSection: { gap: SPACING.SM },
  guestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.SM, height: 48, borderRadius: RADIUS.LG,
    borderWidth: 1.5, borderColor: COLORS.BORDER, backgroundColor: COLORS.SURFACE_ALT,
  },
  guestText: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY, fontWeight: FONTS.WEIGHT.MEDIUM },
  guestNote: { textAlign: 'center', fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.XS, marginTop: SPACING.SM, padding: SPACING.SM,
    backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: RADIUS.MD,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  offlineText: { fontSize: FONTS.SIZE.XS, color: COLORS.WARNING },
  legalRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: SPACING.SM, marginTop: SPACING.LG, marginBottom: SPACING.SM,
  },
  legalLink: { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED, textDecorationLine: 'underline' },
  legalSep:  { fontSize: FONTS.SIZE.XS, color: COLORS.TEXT_MUTED },
});
