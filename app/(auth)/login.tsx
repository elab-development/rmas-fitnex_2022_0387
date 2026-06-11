import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
  
} from 'react-native';
import { router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { authService } from '../../services/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    // Reset grešaka
    setEmailError('');
    setPasswordError('');

    // Validacija
    let valid = true;
    if (!email) {
      setEmailError('Email je obavezan');
      valid = false;
    }
    if (!password) {
      setPasswordError('Lozinka je obavezna');
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    try {
      await authService.login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Greška', error.message || 'Prijava nije uspela');
    } finally {
      setLoading(false);
    }
  };
  const handleBiometricLogin = async () => {
  try {
    // 1. Provera hardvera
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert('Error', 'Your device does not support biometric authentication');
      return;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      Alert.alert('Error', 'No biometrics enrolled. Please set up Face ID in system settings.');
      return;
    }

    // 2. Pokretanje Face ID skeniranja
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in to Fitnex with Face ID',
      fallbackLabel: 'Use passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    // 3. Ako je Face ID uspešan, proveravamo token direktno iz osvežene Supabase sesije
    if (result.success) {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session && !error) {
        // Ako sesija postoji, uspešno te prebacujemo unutra
        router.replace('/(tabs)');
      } else {
        // Ako nema sesije, znači da authService.login nije sačuvao token ili si izlogovan
        Alert.alert(
          'Authentication Required',
          'Please sign in with your email and password first to save your session on this device.'
        );
      }
    }
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
     <View style={styles.imageContainer}>
    <Image
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    />
    {/* Fade gradient na dnu */}
    <LinearGradient
      colors={['transparent', Colors.white]}
      style={styles.fadeGradient}
    />
    <Image
      source={require('../../assets/LOGO 1.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  </View>

      {/* Naslov */}
      <Text style={styles.title}>Sign In To Fitnex</Text>
      <Text style={styles.subtitle}>Let's personalize your fitness with AI</Text>

      {/* Forma */}
      <View style={styles.form}>
        <Input
          label="Email Address"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          icon="mail-outline"
          error={emailError}
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="••••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="lock-closed-outline"
          error={passwordError}
        />

        {/* Sign In dugme */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Sign In  →'}
          </Text>
        </TouchableOpacity>

        {/* Biometric dugme */}
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
          activeOpacity={0.8}
        >
          <Ionicons name="finger-print" size={28} color={Colors.pink} />
          <Text style={styles.biometricText}>Sign in with Face ID / Fingerprint</Text>
        </TouchableOpacity>
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://www.instagram.com')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/icons8-instagram-logo-50.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://www.facebook.com')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/icons8-facebook-logo-50.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://www.linkedin.com')}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/icons8-linkedin-logo-50.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Linkovi */}
        <View style={styles.linksContainer}>
          <Text style={styles.linkText}>
            Don't have an account?{' '}
            <Text
              style={styles.link}
              onPress={() => router.replace('/(auth)/register')}
            >
              Sign Up.
            </Text>
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.link}>Forgot Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  imageContainer: {
    width: width,
    height: 240,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: 240,
    top: 0,
    left: 0,
  },
  fadeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  logo: {
    width: 80,
    height: 80,
    
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 22,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    paddingHorizontal: Spacing.screenPadding,
    gap: 4,
  },
  button: {
    backgroundColor: Colors.black,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  linkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  link: {
    color: Colors.pink,
    fontWeight: '600',
    fontSize: 14,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    marginTop: 12,
    backgroundColor: '#FFF5F9',
  },
  biometricText: {
    color: Colors.pink,
    fontSize: 14,
    fontWeight: '600',
  },
  
});