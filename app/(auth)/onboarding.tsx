import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
  return (
    <View style={styles.container}>
      
      <Image
        source={require('../../assets/on-boarding.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      
      <View style={styles.overlay} />

      
      <View style={styles.content}>
        
        <Image
          source={require('../../assets/LOGO 1.png')}
          style={styles.logo}
          resizeMode="contain"
        />

      
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome To{'\n'}Fitnex</Text>
          <Text style={styles.subtitle}>Your personal fitness AI Assistant</Text>
        </View>

       <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 80,
    paddingHorizontal: 32,
    gap: 20,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 36,
    color: Colors.white,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    fontWeight: '400',
  },
  button: {
    backgroundColor: Colors.darkPink,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 12,
    width: '75%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
   
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});