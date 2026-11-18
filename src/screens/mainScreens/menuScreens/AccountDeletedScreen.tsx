import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface AccountDeletedScreenProps {
  onBackToWelcome?: () => void;
  gracePeriodDays?: number;
  restoreByDate?: string;
}

export const AccountDeletedScreen: React.FC<AccountDeletedScreenProps> = ({
  onBackToWelcome,
  gracePeriodDays = 30,
  restoreByDate = '4 Dec 2026',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.centerContent}>
        {/* Concentric Circular Emblem */}
        <View style={styles.outerCircle}>
          <View style={styles.middleCircle}>
            <View style={styles.innerCircle}>
              <Feather name="check" size={18} color="#F0913A" />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Your account is deleted</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          We’ve signed you out. Your data will be erased within {gracePeriodDays}{' '}
          days. Changed your mind? Sign in before {restoreByDate} to restore it.
        </Text>
      </View>

      {/* Fixed Bottom Action Container */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.welcomeButton}
          onPress={onBackToWelcome}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Back to welcome"
        >
          <Text style={styles.welcomeButtonText}>Back to welcome</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -40,
  },
  outerCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: '#1F3352',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 36,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 320,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    backgroundColor: '#0B1A2F',
  },
  welcomeButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
