import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  PanResponder,
  PanResponderInstance,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const minCalories = 1200;
  const maxCalories = 4000;
  const [currentCalories, setCurrentCalories] = useState(2000);
  const [sliderProgress, setSliderProgress] = useState(0.3); // Početna pozicija (30%)
  const [trackWidth, setTrackWidth] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  // Pamtimo progres na kom je klizač bio PRE nego što je počelo novo prevlačenje
  const startProgress = useRef<number>(0.3);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      if (data.avatar_url) setProfileImage(data.avatar_url);

      const initialCalories = data.daily_calorie_goal || 2000;
      setCurrentCalories(initialCalories);
      
      const initialProgress = (initialCalories - minCalories) / (maxCalories - minCalories);
      setSliderProgress(initialProgress);
      startProgress.current = initialProgress;
      sliderProgressRef.current = initialProgress;

    } catch (error: any) {
      console.log('Profile error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const sliderProgressRef = useRef(0.3);
const trackWidthRef = useRef(0);

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: () => {
    scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
    startProgress.current = sliderProgressRef.current;
  },

  onPanResponderMove: (event, gestureState) => {
    if (trackWidthRef.current === 0) return;

    const deltaProgress = gestureState.dx / trackWidthRef.current;
    let newProgress = startProgress.current + deltaProgress;
    if (newProgress < 0) newProgress = 0;
    if (newProgress > 1) newProgress = 1;

    sliderProgressRef.current = newProgress;
    setSliderProgress(newProgress);

    const calculatedCalories = 1200 + newProgress * (4000 - 1200);
    setCurrentCalories(Math.round(calculatedCalories / 10) * 10);
  },

    onPanResponderRelease: () => {
      scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
    },

    onPanResponderTerminate: () => {
      scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
    },
  })
).current;

  const pickImageFromGallery = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    Alert.alert('Permission Denied', 'You need to allow gallery access.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (!result.canceled) {
    await uploadAvatar(result.assets[0].uri);
  }
};

const takePhotoWithCamera = async () => {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissionResult.granted) {
    Alert.alert('Permission Denied', 'You need to allow camera access.');
    return;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (!result.canceled) {
    await uploadAvatar(result.assets[0].uri);
  }
};

const uploadAvatar = async (uri: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('NO USER!');
      return;
    }

    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${user.id}/avatar.${fileExt}`;

    console.log('Uploading to:', fileName);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (uploadError) {
      console.log('Upload error:', uploadError);
      Alert.alert('Upload Error', uploadError.message);
      return;
    }

const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(fileName);

console.log('Public URL:', data.publicUrl);

const { error: updateError } = await supabase
  .from('profiles')
  .update({ avatar_url: data.publicUrl })
  .eq('id', user.id);

if (updateError) {
  console.log('Update error:', updateError);
  return;
}

const publicUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;
setProfileImage(publicUrlWithTimestamp);
Alert.alert('Success', 'Profile photo updated!');
    Alert.alert('Success', 'Profile photo updated!');

  } catch (error: any) {
    console.log('Upload catch error:', error.message);
    Alert.alert('Error', 'Failed to upload photo: ' + error.message);
  }
};
  const handleAvatarPress = () => {
    Alert.alert('Profile Photo', 'Choose an option:', [
      { text: 'Take Photo', onPress: takePhotoWithCamera },
      { text: 'Choose from Gallery', onPress: pickImageFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading..." />;

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111214" />
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >

        {/* GORNJI CRNI DEO */}
        <View style={styles.headerContainer}>
          <View style={styles.topRow}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={styles.avatarContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.userTextContainer}>
                <Text style={styles.dateText}>{today}</Text>
                <Text style={styles.welcomeText}>Hello, {firstName} 👋</Text>
                <View style={styles.statsMiniRow}>
                  <Text style={styles.miniStatText}>{currentCalories} kcal</Text>
                  <View style={styles.dotSeparator} />
                  <Text style={styles.miniStatText}>{profile?.city || 'Serbia'}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.notificationButton}>
              <MaterialCommunityIcons name="bell-badge" size={26} color="#FFFFFF" />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>8+</Text>
              </View>
            </TouchableOpacity>
          </View>

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
              <Ionicons name="flame" size={16} color="#FFFFFF" />
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
            <View style={[styles.routineCard, { backgroundColor: '#E2F4C5' }]}>
              <View style={styles.routineBadge}>
                <Text style={styles.routineBadgeText}>Balanced Diet</Text>
              </View>
              <Text style={styles.routineCardTitle}>Runner's{"\n"}Diet</Text>
              <Text style={styles.routineCardSubtitle}>Feel your run</Text>
              <Image
                source={require('../../assets/running-icon.png')}
                style={styles.routineCardImage}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.routineArrowButton}>
                <Ionicons name="chevron-forward" size={16} color="#111214" />
              </TouchableOpacity>
            </View>

            <View style={[styles.routineCard, { backgroundColor: '#FFEF96' }]}>
              <View style={styles.routineBadge}>
                <Text style={styles.routineBadgeText}>Balanced Diet</Text>
              </View>
              <Text style={styles.routineCardTitle}>Cooking{"\n"}Tips</Text>
              <Text style={styles.routineCardSubtitle}>Fuel your fun</Text>
              <Image
                source={require('../../assets/cooking-icon.png')}
                style={styles.routineCardImage}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.routineArrowButton}>
                <Ionicons name="chevron-forward" size={16} color="#111214" />
              </TouchableOpacity>
            </View>

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
              <Text style={styles.calorieNumber}>{currentCalories}</Text>
              <Text style={styles.calorieUnit}>Kilo{"\n"}calories</Text>
            </View>
            
            {/* TRAKA SLIDERA: Ovde samo merimo širinu komponente preko onLayout-a */}
           <View
              style={styles.sliderTrackContainer}
              onLayout={(event) => {
                trackWidthRef.current = event.nativeEvent.layout.width;
                setTrackWidth(event.nativeEvent.layout.width);
              }}
            >
              <LinearGradient
                colors={['#FFDDD2', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sliderTrack}
              >
                {/* DUGME / THUMB: Sada panHandlers stoje direktno na elementu koji se pomera! */}
                <View 
                  {...panResponder.panHandlers}
                  style={[
                    styles.sliderThumbOuter, 
                    { left: `${sliderProgress * 100}%`, transform: [{ translateX: -27 }] }
                  ]}
                >
                  <View style={styles.sliderThumbInner} />
                </View>
              </LinearGradient>
            </View>
          </View>

         

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: { flex: 1, backgroundColor: '#111214' },
  container: { flex: 1, backgroundColor: '#F9F9F9' },
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
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2D2F33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  userTextContainer: { marginLeft: 14 },
  dateText: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  welcomeText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 2 },
  statsMiniRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  miniStatText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#9CA3AF', marginHorizontal: 8 },
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
    backgroundColor: '#FF2A7A',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800' },
  searchContainer: {
    backgroundColor: '#2D2F33',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  searchIcon: { marginLeft: 8 },
  bodyContainer: { paddingHorizontal: 24, paddingTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111214' },
  seeAllText: { fontSize: 14, color: '#FF7EA5', fontWeight: '600' },
  categoriesScroll: { marginBottom: 24 },
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
  categoryTabActive: { backgroundColor: '#2F66F6' },
  categoryTabTextActive: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  categoryTabText: { color: '#555555', fontWeight: '600', fontSize: 14 },
  routineScroll: { marginBottom: 28 },
  routineCard: {
    width: 150,
    height: 160,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  routineCardImage: {
    position: 'absolute',
    right: -10,
    bottom: 20,
    width: 80,
    height: 80,
    opacity: 0.85,
  },
  routineBadge: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  routineBadgeText: { fontSize: 9, fontWeight: '700', color: '#4B5563' },
  routineCardTitle: { fontSize: 16, fontWeight: '800', color: '#111214', lineHeight: 18 },
  routineCardSubtitle: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
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
    height: 160,
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
  calorieSectionTitle: { fontSize: 20, fontWeight: '700', color: '#111214', marginBottom: 16 },
  calorieCard: {
    backgroundColor: '#FF5290',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    marginBottom: 40,
  },
  calorieInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  calorieNumber: { color: '#FFFFFF', fontSize: 44, fontWeight: '800' },
  calorieUnit: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 16, lineHeight: 16, opacity: 0.9 },
  sliderTrackContainer: {
    width: '100%',
    height: 36,
    justifyContent: 'center',
  },
  sliderTrack: { 
    height: 36, 
    borderRadius: 14, 
    width: '100%', 
    justifyContent: 'center', 
    position: 'relative' 
  },
  sliderThumbOuter: {
    position: 'absolute',
    width: 54,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sliderThumbInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFA07A' },
});