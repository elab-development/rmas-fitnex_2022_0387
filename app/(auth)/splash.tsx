import { View, StyleSheet, Image, Dimensions, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function Splash() {
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => router.replace('/(auth)/onboarding')}
    >
    <LinearGradient
      colors={['#FFB3D9', '#FF5DA3', '#C42B76']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Logo slika */}
      <Image
        source={require('../../assets/LOGO 1.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* FITNEX naziv kao slika */}
      <Image
        source={require('../../assets/FITNEX.png')}
        style={styles.fitnexText}
        resizeMode="contain"
      />

    </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    width: width * 0.55,
    height: width * 0.55,
  },
  fitnexText: {
    width: width * 0.6,
    height: 80,
  },
  button: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: Colors.darkPink,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});