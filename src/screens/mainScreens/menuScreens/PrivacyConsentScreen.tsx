import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface PrivacyConsentScreenProps {
  onBack?: () => void;
  onConsentLedger?: () => void;
  onPrivacyNotice?: () => void;
  onDataRequests?: () => void;
  onWhoCanSeeWhat?: () => void;
  onPermissionPress?: (permission: string) => void;
}

export const PrivacyConsentScreen: React.FC<PrivacyConsentScreenProps> = ({
  onBack,
  onConsentLedger,
  onPrivacyNotice,
  onDataRequests,
  onWhoCanSeeWhat,
  onPermissionPress,
}) => {
  const insets = useSafeAreaInsets();

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

        <Text style={styles.topBarTitle}>Privacy and consent</Text>

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
        {/* Main Options Card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.navRow}
            onPress={onConsentLedger}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Consent ledger"
          >
            <View style={[styles.iconBox, { borderColor: '#6FD9A6' }]}>
              <Feather name="shield" size={18} color="#6FD9A6" />
            </View>
            <View style={styles.navInfo}>
              <Text style={styles.navTitle}>Consent ledger</Text>
              <Text style={styles.navSubtitle}>
                Every permission given, with dates
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={onPrivacyNotice}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Privacy notice"
          >
            <View style={[styles.iconBox, { borderColor: '#5B9BF1' }]}>
              <Feather name="file-text" size={18} color="#5B9BF1" />
            </View>
            <View style={styles.navInfo}>
              <Text style={styles.navTitle}>Privacy notice</Text>
              <Text style={styles.navSubtitle}>
                Version 1.2 · Updated 1 Oct 2026
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={onDataRequests}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Data requests"
          >
            <View style={[styles.iconBox, { borderColor: '#4ECDC4' }]}>
              <Feather name="download" size={18} color="#4ECDC4" />
            </View>
            <View style={styles.navInfo}>
              <Text style={styles.navTitle}>Data requests</Text>
              <Text style={styles.navSubtitle}>
                Export, correct or erase your data
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={onWhoCanSeeWhat}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Who can see what"
          >
            <View style={[styles.iconBox, { borderColor: '#A78BFA' }]}>
              <Feather name="eye" size={18} color="#A78BFA" />
            </View>
            <View style={styles.navInfo}>
              <Text style={styles.navTitle}>Who can see what</Text>
              <Text style={styles.navSubtitle}>
                Life Profile and Vault access
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>
        </View>

        {/* Section: PERMISSIONS ON THIS PHONE */}
        <Text style={styles.sectionHeading}>PERMISSIONS ON THIS PHONE</Text>
        <View style={styles.card}>
          <PermissionRow
            icon="map-pin"
            title="Location"
            badge="Always"
            badgeType="allowed"
            onPress={() => onPermissionPress?.('location')}
          />
          <View style={styles.divider} />

          <PermissionRow
            icon="camera"
            title="Camera"
            badge="Allowed"
            badgeType="allowed"
            onPress={() => onPermissionPress?.('camera')}
          />
          <View style={styles.divider} />

          <PermissionRow
            icon="image"
            title="Photos"
            badge="Selected photos"
            badgeType="muted"
            onPress={() => onPermissionPress?.('photos')}
          />
          <View style={styles.divider} />

          <PermissionRow
            icon="bell"
            title="Notifications"
            badge="Allowed"
            badgeType="allowed"
            onPress={() => onPermissionPress?.('notifications')}
          />
          <View style={styles.divider} />

          <PermissionRow
            icon="mic"
            title="Microphone"
            badge="Not asked"
            badgeType="muted"
            onPress={() => onPermissionPress?.('microphone')}
          />
        </View>

        {/* Withdrawal Info Banner */}
        <View style={styles.infoBanner}>
          <Feather name="info" size={18} color="#8A97AB" style={{ marginRight: 12, marginTop: 2 }} />
          <Text style={styles.infoBannerText}>
            You can withdraw any consent at any time. Withdrawing stops future use.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

interface PermissionRowProps {
  icon: string;
  title: string;
  badge: string;
  badgeType?: 'allowed' | 'muted';
  onPress?: () => void;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  icon,
  title,
  badge,
  badgeType = 'allowed',
  onPress,
}) => (
  <TouchableOpacity
    style={styles.permRow}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`${title}, ${badge}`}
  >
    <View style={styles.permIconBox}>
      <Feather name={icon as any} size={18} color="#8A97AB" />
    </View>
    <Text style={styles.permTitle}>{title}</Text>
    <View
      style={[
        styles.badge,
        badgeType === 'allowed' ? styles.badgeAllowed : styles.badgeMuted,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          badgeType === 'allowed' ? styles.badgeAllowedText : styles.badgeMutedText,
        ]}
      >
        {badge}
      </Text>
    </View>
    <Feather name="chevron-right" size={18} color="#5D6C83" style={{ marginLeft: 8 }} />
  </TouchableOpacity>
);

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
    paddingTop: 12,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  navInfo: {
    flex: 1,
    marginLeft: 14,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  navSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 72,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  permIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#354154',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  permTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  badgeAllowed: {
    borderColor: '#6FDAA6',
    backgroundColor: 'transparent',
  },
  badgeAllowedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6FDAA6',
  },
  badgeMuted: {
    borderColor: '#38485C',
    backgroundColor: 'transparent',
  },
  badgeMutedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CCD7E6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
});
