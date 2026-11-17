import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export type SensitiveDataConsentScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'SensitiveDataConsent'>
> & {
  memberName?: string;
  onClose?: () => void;
  onAgree?: () => void;
  onPrivacyNoticePress?: () => void;
  onNotNow?: () => void;
};

export const SensitiveDataConsentScreen: React.FC<SensitiveDataConsentScreenProps> = ({
  navigation,
  route,
  memberName = 'Aarav',
  onClose,
  onAgree,
  onPrivacyNoticePress,
  onNotNow,
}) => {
  const insets = useSafeAreaInsets();
  const [agreed, setAgreed] = useState(true);

  const displayName = route?.params?.memberName || memberName;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('MemberProfile');
    }
  };

  const handleAgree = () => {
    if (onAgree) {
      onAgree();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('MemberHealthProfile', { memberName: displayName });
    }
  };

  const handleNotNow = () => {
    if (onNotNow) {
      onNotNow();
    } else {
      handleClose();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header with Circular Close Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close consent"
          activeOpacity={0.7}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Concentric Shield Visual */}
        <View style={styles.visualContainer}>
          <View style={styles.outerRing}>
            <View style={styles.innerCircle}>
              <Feather name="shield" size={34} color="#F0923A" />
            </View>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>
          {'Before you add health and\nID details'}
        </Text>

        {/* Subtitle */}
        <Text style={styles.description}>
          {`${displayName}’s health records, Aadhaar and PAN are sensitive. Here’s how HosynQ handles them.`}
        </Text>

        {/* 3-Point Security Card */}
        <View style={styles.card}>
          {/* Row 1: Encryption */}
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { borderColor: '#4CC38A' }]}>
              <Feather name="lock" size={20} color="#4CC38A" />
            </View>
            <Text style={styles.rowText}>
              Encrypted. Only people you choose can see it.
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Row 2: Reminders */}
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { borderColor: '#A884F0' }]}>
              <Feather name="bell" size={20} color="#A884F0" />
            </View>
            <Text style={styles.rowText}>
              Used only for reminders, like renewals and check-ups
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Row 3: Deletion */}
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { borderColor: '#F06A6D' }]}>
              <Feather name="trash-2" size={20} color="#F06A6D" />
            </View>
            <Text style={styles.rowText}>
              Delete it any time
            </Text>
          </View>
        </View>

        {/* Checkbox Agreement */}
        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.8}
          onPress={() => setAgreed(!agreed)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel={`Agree to store ${displayName}'s details`}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Feather name="check" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            {`I’m ${displayName}’s parent and I agree to store these details.\nRead the `}
            <Text
              style={styles.linkText}
              onPress={onPrivacyNoticePress}
            >
              Privacy Notice
            </Text>
            .
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Pinned Bottom Actions Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 6,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.agreeButton, !agreed && styles.agreeButtonDisabled]}
          disabled={!agreed}
          onPress={handleAgree}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Agree and continue"
        >
          <Text style={styles.agreeButtonText}>Agree and continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notNowButton}
          onPress={handleNotNow}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Not now"
        >
          <Text style={styles.notNowButtonText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    paddingHorizontal: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 26,
  },
  outerRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 30,
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 14.5,
    color: '#8A9BAE',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 22,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: '#1A2D4B',
    width: '100%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 28,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#F0923A',
    borderColor: '#F0923A',
    borderWidth: 0,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13.5,
    color: '#8A9BAE',
    lineHeight: 19,
  },
  linkText: {
    color: '#F0923A',
    fontWeight: '600',
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    backgroundColor: '#0B1A2F',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  agreeButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  agreeButtonDisabled: {
    opacity: 0.45,
  },
  agreeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notNowButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  notNowButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0923A',
  },
});

export default SensitiveDataConsentScreen;
