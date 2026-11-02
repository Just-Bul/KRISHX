import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { authAPI } from '../../services/api';
import { validateRegisterForm, hasErrors } from '../../utils/validators';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../../theme';

const FIELDS = [
  { key: 'full_name',       label: 'Full Name',        icon: 'person-outline',         keyboard: 'default',         placeholder: 'John Smith',           secure: false },
  { key: 'email',           label: 'Email Address',    icon: 'mail-outline',            keyboard: 'email-address',   placeholder: 'john@example.com',     secure: false },
  { key: 'phone',           label: 'Phone Number',     icon: 'call-outline',            keyboard: 'phone-pad',       placeholder: '+1 234 567 8900',      secure: false },
  { key: 'password',        label: 'Password',         icon: 'lock-closed-outline',     keyboard: 'default',         placeholder: 'Min 6 characters',     secure: true  },
  { key: 'confirm_password',label: 'Confirm Password', icon: 'shield-checkmark-outline',keyboard: 'default',         placeholder: 'Repeat your password', secure: true  },
];

export default function RegisterScreen() {
  const nav = useNavigation();
  const { showToast } = useApp();

  const [values,  setValues]  = useState({ full_name:'', email:'', phone:'', password:'', confirm_password:'' });
  const [showPw,  setShowPw]  = useState({ password: false, confirm_password: false });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const setValue = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, [key]: null, form: null }));
  };

  const handleRegister = async () => {
    const errs = validateRegisterForm(values);
    setErrors(errs);
    if (hasErrors(errs)) return;

    setLoading(true);
    try {
      const res = await authAPI.register({
        full_name: values.full_name.trim(),
        email:     values.email.trim().toLowerCase(),
        phone:     values.phone.trim(),
        password:  values.password,
      });
      // Show OTP in alert when email is not configured (dev/testing mode)
      if (res?.dev_otp) {
        Alert.alert(
          'OTP Code (Testing Mode)',
          `Email sending is not configured yet.\n\nYour OTP is:\n\n${res.dev_otp}\n\nCopy this code and enter it on the next screen.`,
          [{ text: 'OK' }]
        );
      } else {
        showToast('OTP sent! Check your email to verify your account.');
      }
      nav.navigate('OtpVerification', {
        email:   values.email.trim().toLowerCase(),
        purpose: 'register',
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      const fields = err.response?.data?.fields;
      setErrors(fields ? { ...fields, form: msg } : { form: msg });
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
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>Join KrishX</Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={[styles.card, SHADOW.MD]}>
          {errors.form && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.ERROR} />
              <Text style={styles.errorBannerText}>{errors.form}</Text>
            </View>
          )}

          {FIELDS.map((f) => (
            <View key={f.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={[styles.inputWrap, errors[f.key] && styles.inputError]}>
                <Ionicons name={f.icon} size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, f.secure && { flex: 1 }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  value={values[f.key]}
                  onChangeText={(v) => setValue(f.key, v)}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.keyboard === 'default' && !f.secure ? 'words' : 'none'}
                  autoCorrect={false}
                  secureTextEntry={f.secure && !showPw[f.key]}
                />
                {f.secure && (
                  <TouchableOpacity onPress={() => setShowPw((s) => ({ ...s, [f.key]: !s[f.key] }))} style={styles.eyeBtn}>
                    <Ionicons name={showPw[f.key] ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.TEXT_SECONDARY} />
                  </TouchableOpacity>
                )}
              </View>
              {errors[f.key] && <Text style={styles.fieldError}>{errors[f.key]}</Text>}
            </View>
          ))}

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]} style={styles.btnGradient}>
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="person-add-outline" size={20} color="#fff" />
                    <Text style={styles.btnText}>Create Account</Text>
                  </>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => nav.goBack()}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 40, paddingHorizontal: SPACING.LG },
  backBtn: { marginBottom: SPACING.MD },
  headerTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  headerSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  body: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  bodyContent: { padding: SPACING.LG, paddingTop: 0, marginTop: -20, paddingBottom: SPACING.XXL },
  card: { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL, padding: SPACING.XXL, gap: SPACING.LG },
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
    backgroundColor: COLORS.INPUT_BG, borderRadius: RADIUS.MD,
    borderWidth: 1.5, borderColor: COLORS.INPUT_BORDER, paddingHorizontal: SPACING.MD,
  },
  inputError: { borderColor: COLORS.ERROR },
  inputIcon: { marginRight: SPACING.SM },
  input: { height: 50, fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_PRIMARY, flex: 1 },
  eyeBtn: { padding: SPACING.SM },
  fieldError: { fontSize: FONTS.SIZE.XS, color: COLORS.ERROR, marginTop: 2 },
  btn: { borderRadius: RADIUS.LG, overflow: 'hidden' },
  btnDisabled: { opacity: 0.7 },
  btnGradient: { height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.SM },
  btnText: { fontSize: FONTS.SIZE.LG, fontWeight: FONTS.WEIGHT.BOLD, color: '#fff' },
  loginLink: { alignItems: 'center' },
  loginText: { fontSize: FONTS.SIZE.MD, color: COLORS.TEXT_SECONDARY },
  loginBold: { color: COLORS.PRIMARY, fontWeight: FONTS.WEIGHT.BOLD },
});
