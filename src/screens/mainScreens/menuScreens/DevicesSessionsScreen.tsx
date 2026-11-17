import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { SignOutDeviceModal } from './SignOutDeviceModal';

export interface DeviceSession {
  id: string;
  name: string;
  os: string;
  location: string;
  lastActive: string;
  isCurrent?: boolean;
  type: 'phone' | 'tablet' | 'desktop';
}

const INITIAL_DEVICES: DeviceSession[] = [
  {
    id: 'current',
    name: 'Pixel 8',
    os: 'Android 15',
    location: 'Gurugram',
    lastActive: 'Active now',
    isCurrent: true,
    type: 'phone',
  },
  {
    id: '2',
    name: 'iPad Air',
    os: 'iPadOS 18',
    location: 'Gurugram',
    lastActive: '2 hours ago',
    isCurrent: false,
    type: 'tablet',
  },
  {
    id: '3',
    name: 'Chrome on Windows',
    os: '',
    location: 'New Delhi',
    lastActive: 'Wed, 28 Oct',
    isCurrent: false,
    type: 'desktop',
  },
];

export interface DevicesSessionsScreenProps {
  onBack?: () => void;
  onSignOutDevice?: (device: DeviceSession) => void;
  onSignOutAllOthers?: () => void;
}

export const DevicesSessionsScreen: React.FC<DevicesSessionsScreenProps> = ({
  onBack,
  onSignOutDevice,
  onSignOutAllOthers,
}) => {
  const insets = useSafeAreaInsets();
  const [devices, setDevices] = useState<DeviceSession[]>(INITIAL_DEVICES);
  const [selectedDeviceToSignOut, setSelectedDeviceToSignOut] = useState<DeviceSession | null>(null);

  const currentDevice = devices.find((d) => d.isCurrent);
  const otherDevices = devices.filter((d) => !d.isCurrent);

  const handleConfirmSignOut = () => {
    if (selectedDeviceToSignOut) {
      setDevices((prev) => prev.filter((d) => d.id !== selectedDeviceToSignOut.id));
      onSignOutDevice?.(selectedDeviceToSignOut);
      setSelectedDeviceToSignOut(null);
    }
  };

  const handleSignOutAllOthers = () => {
    Alert.alert(
      'Sign out all other devices?',
      'You will be signed out on all devices except this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out all',
          style: 'destructive',
          onPress: () => {
            setDevices((prev) => prev.filter((d) => d.isCurrent));
            onSignOutAllOthers?.();
          },
        },
      ]
    );
  };

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

        <Text style={styles.topBarTitle}>Devices and sessions</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: THIS DEVICE */}
        <Text style={styles.sectionHeading}>THIS DEVICE</Text>
        {currentDevice && (
          <View style={styles.card}>
            <View style={styles.deviceRow}>
              <View style={[styles.iconBox, { borderColor: '#6FD9A6' }]}>
                <Feather name="phone" size={18} color="#6FD9A6" />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceTitle}>
                  {currentDevice.name} · {currentDevice.os}
                </Text>
                <Text style={styles.deviceSubtitle}>
                  {currentDevice.location} · {currentDevice.lastActive}
                </Text>
              </View>
              <View style={styles.badgeThisPhone}>
                <Text style={styles.badgeThisPhoneText}>This phone</Text>
              </View>
            </View>
          </View>
        )}

        {/* Section: OTHER DEVICES */}
        {otherDevices.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>OTHER DEVICES</Text>
            <View style={styles.card}>
              {otherDevices.map((device, idx) => {
                const iconName =
                  device.type === 'desktop'
                    ? 'globe'
                    : device.type === 'tablet'
                    ? 'tablet'
                    : 'phone';

                return (
                  <React.Fragment key={device.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <View style={styles.deviceRow}>
                      <View style={[styles.iconBox, { borderColor: '#354154' }]}>
                        <Feather name={iconName as any} size={18} color="#8A97AB" />
                      </View>
                      <View style={styles.deviceInfo}>
                        <Text style={styles.deviceTitle}>
                          {device.os ? `${device.name} · ${device.os}` : device.name}
                        </Text>
                        <Text style={styles.deviceSubtitle}>
                          {device.location} · {device.lastActive}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setSelectedDeviceToSignOut(device)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Sign out ${device.name}`}
                      >
                        <Text style={styles.signOutLinkText}>Sign out</Text>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.captionText}>
          Don’t recognise a device? Sign it out, then turn on App lock.
        </Text>
      </ScrollView>

      {/* Floating Bottom Button */}
      {otherDevices.length > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
          <TouchableOpacity
            style={styles.signOutAllBtn}
            onPress={handleSignOutAllOthers}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign out of all other devices"
          >
            <Feather
              name="log-out"
              size={18}
              color="#F0923A"
              style={{ marginRight: 10, transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.signOutAllBtnText}>Sign out of all other devices</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation Modal */}
      <SignOutDeviceModal
        visible={!!selectedDeviceToSignOut}
        deviceName={selectedDeviceToSignOut ? `${selectedDeviceToSignOut.name}` : undefined}
        onClose={() => setSelectedDeviceToSignOut(null)}
        onConfirmSignOut={handleConfirmSignOut}
      />
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
    fontWeight: '700',
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
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  deviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deviceSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  badgeThisPhone: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#6FD9A6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeThisPhoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6FD9A6',
  },
  signOutLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0923A',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 72,
  },
  captionText: {
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
  },
  signOutAllBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3A4555',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutAllBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
