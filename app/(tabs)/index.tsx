import React, { useState } from 'react'; // Dodaj useState
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert, // Dodaj Alert za meni
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker'; // Uvezi ImagePicker

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  // Stanje za sliku profila - na početku je null (nema slike)
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Funkcija za biranje slike iz galerije
  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'You need to allow gallery access to choose a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Pravi kvadratno isecanje
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Funkcija za slikanje kamerom
  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'You need to allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Otvaranje menija na klik kvadratnog/okruglog avatara
  const handleAvatarPress = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option to set your profile picture:',
      [
        { text: 'Take Photo', onPress: takePhotoWithCamera },
        { text: 'Choose from Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111214" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* GORNJI CRNI DEO */}
        <View style={styles.headerContainer}>
          <View style={styles.topRow}>
            <View style={styles.userInfo}>
              
              {/* KLIKABILNI AVATAR CONTAINER */}
              <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={styles.avatarContainer}>
                {profileImage ? (
                  // Ako slika postoji, prikaži je
                  <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                  // Ako slika ne postoji (prvi put napravljen nalog), prikaži prazan sivi prostor sa ikonicom
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.userTextContainer}>
                <Text style={styles.dateText}>March 26th, 2026</Text>
                <Text style={styles.welcomeText}>Hello, Sofia</Text>
                <View style={styles.statsMiniRow}>
                  <Text style={styles.miniStatText}>251 kcal</Text>
                  <View style={styles.dotSeparator} />
                  <Text style={styles.miniStatText}>Serbia</Text>
                </View>
              </View>
            </View>

            {/* Ikonica zvonca */}
            <TouchableOpacity style={styles.notificationButton}>
              <MaterialCommunityIcons name="bell-badge" size={26} color="#FFFFFF" />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>8+</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pretraga */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search our food database..."
              placeholderTextColor="#9CA3AF"
            />
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          </View>
        </View>

       

        {/* DONJI BELI DEO */}
        <View style={styles.bodyContainer}>
          
          {/* BROWSE CATEGORY */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Category</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity style={[styles.categoryTab, styles.categoryTabActive]}>
              <Ionicons name="thumbs-up" size={16} color="#FFFFFF" />
              <Text style={styles.categoryTabTextActive}>Vegetable</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryTab}>
              <Ionicons name="heart" size={16} color="#9CA3AF" />
              <Text style={styles.categoryTabText}>Meat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryTab}>
              <MaterialCommunityIcons name="food-apple" size={16} color="#9CA3AF" />
              <Text style={styles.categoryTabText}>Fruit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryTabText}>Carbs</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* MORNING ROUTINE */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Morning Routine</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routineScroll}>
            {/* Prva kartica - Runner's Diet */}
            <View style={[styles.routineCard, { backgroundColor: '#E2F4C5' }]}>
              <View style={styles.routineBadge}>
                <Text style={styles.routineBadgeText}>Balanced Diet</Text>
              </View>
              <Text style={styles.routineCardTitle}>Runner's{"\n"}Diet</Text>
              <Text style={styles.routineCardSubtitle}>Feel your run</Text>
              <TouchableOpacity style={styles.routineArrowButton}>
                <Ionicons name="chevron-forward" size={16} color="#111214" />
              </TouchableOpacity>
            </View>

            {/* Druga kartica - Balanced Diet */}
            <View style={[styles.routineCard, { backgroundColor: '#FFEF96' }]}>
              <View style={styles.routineBadge}>
                <Text style={styles.routineBadgeText}>Balanced Diet</Text>
              </View>
              <Text style={styles.routineCardTitle}>Runner's{"\n"}Diet</Text>
              <Text style={styles.routineCardSubtitle}>Fuel your fun</Text>
              <TouchableOpacity style={styles.routineArrowButton}>
                <Ionicons name="chevron-forward" size={16} color="#111214" />
              </TouchableOpacity>
            </View>

            {/* Treća kartica - "MORE" dugme */}
            <TouchableOpacity style={styles.moreCard}>
              <Text style={styles.moreCardText}>MORE</Text>
              <View style={styles.moreArrowCircle}>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* CALORIE GOAL */}
          <Text style={styles.calorieSectionTitle}>Calorie Goal</Text>
          
          <View style={styles.calorieCard}>
            <View style={styles.calorieInfoRow}>
              <Text style={styles.calorieNumber}>2500</Text>
              <Text style={styles.calorieUnit}>Kilo{"\n"}calories</Text>
            </View>
            
            {/* Slider / Progress Bar sa slike */}
            <LinearGradient
              colors={['#FFDDD2', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sliderTrack}
            >
              <View style={styles.sliderThumbContainer}>
                <View style={styles.sliderThumbOuter}>
                  <View style={styles.sliderThumbInner} />
                </View>
              </View>
            </LinearGradient>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111214',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  /* GORNJI DEO STILOVI */
  headerContainer: {
    backgroundColor: '#111214',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28, // Možeš staviti 14 ako želiš kvadrat sa blago zaobljenim ivicama
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2D2F33', // Tamno siva boja koja se slaže sa pretragom
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  userTextContainer: {
    marginLeft: 14,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  statsMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  miniStatText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 8,
  },
  notificationButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#222326',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D2F33',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF2A7A', // Jarka pink nijansa
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  searchContainer: {
    backgroundColor: '#2D2F33',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  searchIcon: {
    marginLeft: 8,
  },
  /* DONJI DEO STILOVI */
  bodyContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111214',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF7EA5',
    fontWeight: '600',
  },
  categoriesScroll: {
    marginBottom: 24,
    flexDirection: 'row',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    gap: 6,
  },
  categoryTabActive: {
    backgroundColor: '#2F66F6', // Plavo aktivno dugme sa slike
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  categoryTabText: {
    color: '#555555',
    fontWeight: '600',
    fontSize: 14,
  },
  routineScroll: {
    marginBottom: 28,
  },
  routineCard: {
    width: 150,
    height: 140,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    justifyContent: 'space-between',
    position: 'relative',
  },
  routineBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  routineBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563',
  },
  routineCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111214',
    marginTop: 8,
    lineHeight: 18,
  },
  routineCardSubtitle: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  routineArrowButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreCard: {
    width: 50,
    height: 140,
    backgroundColor: '#111214',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  moreCardText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    transform: [{ rotate: '90deg' }],
    marginVertical: 20,
    letterSpacing: 1,
  },
  moreArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  calorieSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111214',
    marginBottom: 16,
  },
  calorieCard: {
    backgroundColor: '#FF5290', // Karakteristična roze/pink boja sa ekrana
    borderRadius: 24,
    padding: 24,
    width: '100%',
    marginBottom: 40,
  },
  calorieInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieNumber: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
  },
  calorieUnit: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 16,
    lineHeight: 16,
    opacity: 0.9,
  },
  sliderTrack: {
    height: 36,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  sliderThumbContainer: {
    alignSelf: 'flex-end',
    marginRight: '15%', // Pozicionira slider kontroler kao na slici
  },
  sliderThumbOuter: {
    width: 54,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sliderThumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFA07A',
  },
});