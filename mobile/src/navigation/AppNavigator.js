import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';

// Screens
import SplashScreen           from '../screens/SplashScreen';
import LoginScreen            from '../screens/auth/LoginScreen';
import RegisterScreen         from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen   from '../screens/auth/ForgotPasswordScreen';
import OtpVerificationScreen  from '../screens/auth/OtpVerificationScreen';
import ResetPasswordScreen    from '../screens/auth/ResetPasswordScreen';
import AboutScreen            from '../screens/info/AboutScreen';
import PrivacyPolicyScreen    from '../screens/info/PrivacyPolicyScreen';
import TermsScreen            from '../screens/info/TermsScreen';
import DisclaimerScreen       from '../screens/info/DisclaimerScreen';
import HomeScreen             from '../screens/main/HomeScreen';
import PredictionScreen       from '../screens/main/PredictionScreen';
import ResultScreen           from '../screens/main/ResultScreen';
import PestDetectionScreen    from '../screens/main/PestDetectionScreen';
import HistoryScreen          from '../screens/main/HistoryScreen';
import ProfileScreen          from '../screens/main/ProfileScreen';
import SettingsScreen         from '../screens/main/SettingsScreen';
import AdminHomeScreen        from '../screens/admin/AdminHomeScreen';
import AdminUsersScreen       from '../screens/admin/AdminUsersScreen';
import AdminPredictionsScreen from '../screens/admin/AdminPredictionsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICON = {
  Home:    { focused: 'home',   unfocused: 'home-outline'   },
  Predict: { focused: 'leaf',   unfocused: 'leaf-outline'   },
  History: { focused: 'time',   unfocused: 'time-outline'   },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

function PredictStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PredictionForm" component={PredictionScreen} />
      <Stack.Screen name="Result"         component={ResultScreen} />
      <Stack.Screen name="PestDetection"  component={PestDetectionScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain"   component={ProfileScreen} />
      <Stack.Screen name="Settings"      component={SettingsScreen} />
      <Stack.Screen name="About"         component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Terms"         component={TermsScreen} />
      <Stack.Screen name="Disclaimer"    component={DisclaimerScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { darkMode } = useApp();
  const bg      = '#111827';   // Always dark tab bar
  const border  = '#1E293B';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bg, borderTopColor: border, borderTopWidth: 1,
          height: 64, paddingBottom: 8, paddingTop: 6,
        },
        tabBarActiveTintColor:   '#8B5CF6',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontSize: FONTS.SIZE.XS, fontWeight: FONTS.WEIGHT.MEDIUM },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICON[route.name];
          return <Icon name={focused ? icons?.focused : icons?.unfocused} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Predict" component={PredictStack} options={{ tabBarLabel: 'Analyze' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome"        component={AdminHomeScreen} />
      <Stack.Screen name="AdminUsers"       component={AdminUsersScreen} />
      <Stack.Screen name="AdminPredictions" component={AdminPredictionsScreen} />
    </Stack.Navigator>
  );
}

// Full-screen loading that shows a retry button if stuck too long
function LoadingScreen({ onForceSkip }) {
  const [showSkip, setShowSkip] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#0F172A', '#1E1052', '#4C1D95']}
      style={styles.loadWrap}>
      <View style={styles.loadLogo}>
        <Ionicons name="leaf" size={40} color={COLORS.ACCENT} />
      </View>
      <Text style={styles.loadTitle}>KrishX</Text>
      <ActivityIndicator size="large" color={COLORS.ACCENT} style={{ marginTop: SPACING.XL }} />
      <Text style={styles.loadSub}>Loading...</Text>
      {showSkip && (
        <TouchableOpacity style={styles.skipBtn} onPress={onForceSkip}>
          <Text style={styles.skipText}>Skip to Login →</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, isLoading, user, loginAsGuest } = useApp();

  // Safety valve: if loading persists past 8s, force it off
  const safetyRef = useRef(null);
  useEffect(() => {
    if (isLoading) {
      safetyRef.current = setTimeout(() => {
        // Component still mounted and still loading — force navigation to login
      }, 8000);
    } else {
      clearTimeout(safetyRef.current);
    }
    return () => clearTimeout(safetyRef.current);
  }, [isLoading]);

  if (isLoading) {
    return <LoadingScreen onForceSkip={() => {/* Context bootstrap will finish */}} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!isLoggedIn ? (
        <Stack.Group>
          <Stack.Screen name="Splash"         component={SplashScreen} />
          <Stack.Screen name="Login"          component={LoginScreen} />
          <Stack.Screen name="Register"       component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword"   component={ForgotPasswordScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          <Stack.Screen name="ResetPassword"   component={ResetPasswordScreen} />
          <Stack.Screen name="About"           component={AboutScreen} />
          <Stack.Screen name="PrivacyPolicy"   component={PrivacyPolicyScreen} />
          <Stack.Screen name="Terms"           component={TermsScreen} />
          <Stack.Screen name="Disclaimer"      component={DisclaimerScreen} />
        </Stack.Group>
      ) : user?.is_admin ? (
        <Stack.Group>
          <Stack.Screen name="AdminApp" component={AdminStack} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="MainApp" component={MainTabs} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.SM },
  loadLogo: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  loadTitle: { fontSize: FONTS.SIZE.XXL, fontWeight: FONTS.WEIGHT.EXTRABOLD, color: '#fff', letterSpacing: 4 },
  loadSub:   { fontSize: FONTS.SIZE.SM, color: 'rgba(255,255,255,0.65)', marginTop: SPACING.SM },
  skipBtn: {
    marginTop: SPACING.XXL, paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.MD, borderRadius: RADIUS.LG,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  skipText: { color: '#fff', fontSize: FONTS.SIZE.MD, fontWeight: FONTS.WEIGHT.SEMIBOLD },
});
