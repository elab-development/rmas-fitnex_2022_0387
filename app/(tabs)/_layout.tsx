import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const isMiddle = index === 2;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isMiddle) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={styles.middleButtonInner}>
                <Ionicons name="add" size={32} color={Colors.white} />
              </View>
            </TouchableOpacity>
          );
        }

        const getIcon = (name: string, focused: boolean) => {
          const color = focused ? Colors.pink : '#666';
          const size = 24;
          switch (name) {
            case 'index':
              return <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />;
            case 'workout':
              return <MaterialCommunityIcons name="dumbbell" size={size} color={color} />;
            case 'nutrition':
              return <Ionicons name="nutrition-outline" size={size} color={color} />;
            case 'progress':
              return <Ionicons name="stats-chart-outline" size={size} color={color} />;
            case 'profile':
              return <Ionicons name="person-outline" size={size} color={color} />;
            default:
              return <Ionicons name="ellipse-outline" size={size} color={color} />;
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {getIcon(route.name, isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="workout" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111214',
    height: 86,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    borderTopWidth: 0,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginBottom: 12,
  },
  middleButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 28,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
});