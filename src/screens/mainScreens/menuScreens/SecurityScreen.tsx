import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface SecurityScreenProps {
  onBack?: () => void;
  onUnlockMethodPress?: () => void;
  onLockAfterPress?: () => void;
  onDevicesSessionsPress?: () => void;
  onTwoStepCheckPress?: () => void;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({
  onBack,
  onUnlockMethodPress,
  onLockAfterPress,
  onDevicesSessionsPress,
  onTwoStepCheckPress,
}) => {
  const insets = useSafeAreaInsets();

  const [appLockEnabled, setAppLockEnabled] = useState(true);
  const [hideSensitiveNumbers, setHideSensitiveNumbers] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Security</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Protected Account Banner */}
        <View style={styles.protectedBanner}>
          <Feather name="shield" size={18} color="#6FD9A6" style={{ marginRight: 10 }} />
          <Text style={styles.protectedBannerText}>
            Your account is well protected.
          </Text>
        </View>

        {/* Card 1: App lock */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>App lock</Text>
              <Text style={styles.rowSubtitle}>
                Ask to unlock when HosynQ opens
              </Text>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={setAppLockEnabled}
              trackColor={{ false: '#1F3352', true: '#F0923A' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#1F3352"
            />
          </View>

          {appLockEnabled && (
            <>
              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.navRow}
                onPress={onUnlockMethodPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Unlock with Fingerprint"
              >
                <View style={styles.rowIconBox}>
                  <Feather name="eye" size={18} color="#8A97AB" />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>Unlock with</Text>
                  <Text style={styles.rowValue}>Fingerprint</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#5D6C83" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.navRow}
                onPress={onLockAfterPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Lock after Immediately"
              >
                <View style={styles.rowIconBox}>
                  <Feather name="clock" size={18} color="#8A97AB" />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>Lock after</Text>
                  <Text style={styles.rowValue}>Immediately</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#5D6C83" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Card 2: Devices and Sessions */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.navRow}
            onPress={onDevicesSessionsPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Devices and sessions, 3 devices signed in"
          >
            <View style={styles.iconBox}>
              <Feather name="smartphone" size={18} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Devices and sessions</Text>
              <Text style={styles.rowSubtitle}>3 devices signed in</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={onTwoStepCheckPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Two-step check, on"
          >
            <View style={styles.iconBox}>
              <Feather name="lock" size={18} color="#8A97AB" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Two-step check</Text>
              <Text style={styles.rowSubtitle}>OTP to +91 98••• ••123</Text>
            </View>
            <View style={styles.badgeOn}>
              <Text style={styles.badgeOnText}>On</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Card 3: Masking */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Hide sensitive numbers</Text>
              <Text style={styles.rowSubtitle}>
                Masks Aadhaar, PAN and policy numbers
              </Text>
            </View>
            <Switch
              value={hideSensitiveNumbers}
              onValueChange={setHideSensitiveNumbers}
              trackColor={{ false: '#1F3352', true: '#F0923A' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#1F3352"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0B1A2F',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topBarTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  topBarRightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  protectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F291E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#265C3E',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  protectedBannerText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIconBox: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#354154',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rowInfo: {
    flex: 1,
    marginLeft: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  rowLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 16,
  },
  badgeOn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6FD9A6',
    backgroundColor: 'transparent',
  },
  badgeOnText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#6FD9A6',
  },
});
