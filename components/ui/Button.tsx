import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { Typography } from '../../constants/Typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'dark';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) => {

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.primaryButton, style]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Text style={[styles.textPrimary, textStyle]}>{title}</Text>
            <View style={styles.arrowCircle}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'dark') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.darkButton, style]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={[styles.textPrimary, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.outlineButton, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.pink} />
      ) : (
        <Text style={[styles.textOutline, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  
  darkButton: {
    backgroundColor: Colors.black,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: Colors.pink,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  
  textOutline: {
    ...Typography.button,
    color: Colors.pink,
  },
  primaryButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  textPrimary: {
    ...Typography.button,
    color: Colors.white,
    marginLeft: 8,
  },
});