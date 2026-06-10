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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { authService } from '../../services/auth';

const { width } = Dimensions.get('window');

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const handleRegister = async () => {
    // Reset grešaka
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    // Validacija
    let valid = true;
    if (!fullName) { setNameError('Ime je obavezno'); valid = false; }
    if (!email) { setEmailError('Email je obavezan'); valid = false; }
    if (!password) { setPasswordError('Lozinka je obavezna'); valid = false; }
    if (password.length < 6) { setPasswordError('Lozinka mora imati najmanje 6 karaktera'); valid = false; }
    if (password !== confirmPassword) { setConfirmError("ERROR: Password Don't Match!"); valid = false; }
    if (!valid) return;

    setLoading(true);
    try {
      await authService.register(email, password, fullName);
      Alert.alert(
        'Uspešno!',
        'Nalog je kreiran. Možeš se prijaviti.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Greška', error.message || 'Registracija nije uspela');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Gornja slika sa logom */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/background.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
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
      <Text style={styles.title}>Sign Up For Free</Text>
      <Text style={styles.subtitle}>Quickly make your account in 1 minute</Text>

      {/* Forma */}
      <View style={styles.form}>
        <Input
          label="Full Name"
          placeholder="Ime i prezime"
          value={fullName}
          onChangeText={setFullName}
          icon="person-outline"
          error={nameError}
          autoCapitalize="words"
        />

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

        <Input
          label="Confirm Password"
          placeholder="••••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          icon="lock-closed-outline"
          error={confirmError}
        />

        {/* Sign Up dugme */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Sign Up   →'}
          </Text>
          
        </TouchableOpacity>

        {/* Link ka loginu */}
        <View style={styles.linksContainer}>
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text
              style={styles.link}
              onPress={() => router.replace('/(auth)/login')}
            >
              Sign In.
            </Text>
          </Text>
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
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    
    letterSpacing: 0.5,
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
});