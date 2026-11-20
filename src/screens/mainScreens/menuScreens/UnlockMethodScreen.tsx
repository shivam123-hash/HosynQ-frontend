import React, { useState } from 'react';
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

export type UnlockMethodType = 'fingerprint' | 'face' | 'passkey' | 'pattern';

export interface UnlockMethodScreenProps {
  onBack?: () => void;
  onSave?: (method: UnlockMethodType) => void;
  initialMethod?: UnlockMethodType;
}

export const UnlockMethodScreen: React.FC<UnlockMethodScreenProps> = ({
  onBack,
  onSave,
  initialMethod = 'fingerprint',
}) => {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<UnlockMethodType>(initialMethod);

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

        <Text style={styles.topBarTitle}>Unlock method</Text>

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
        <Text style={styles.headerSubtitle}>
          Choose how you unlock HosynQ on this phone.
        </Text>

        {/* Options Card */}
        <View style={styles.card}>
          {/* Fingerprint */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedMethod('fingerprint')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedMethod === 'fingerprint' }}
          >
            <View
              style={[
                styles.iconBox,
                selectedMethod === 'fingerprint'
                  ? styles.iconBoxActive
                  : styles.iconBoxInactive,
              ]}
            >
              <Feather
                name="eye"
                size={20}
                color={selectedMethod === 'fingerprint' ? '#F0923A' : '#8A97AB'}
              />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Fingerprint</Text>
              <Text style={styles.optionSubtitle}>
                Uses the fingerprints saved on this phone
              </Text>
            </View>
            <RadioButton selected={selectedMethod === 'fingerprint'} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Face unlock */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedMethod('face')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedMethod === 'face' }}
          >
            <View
              style={[
                styles.iconBox,
                selectedMethod === 'face'
                  ? styles.iconBoxActive
                  : styles.iconBoxInactive,
              ]}
            >
              <Feather
                name="smile"
                size={20}
                color={selectedMethod === 'face' ? '#F0923A' : '#8A97AB'}
              />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Face unlock</Text>
              <Text style={styles.optionSubtitle}>If your phone supports it</Text>
            </View>
            <RadioButton selected={selectedMethod === 'face'} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Passkey */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedMethod('passkey')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedMethod === 'passkey' }}
          >
            <View
              style={[
                styles.iconBox,
                selectedMethod === 'passkey'
                  ? styles.iconBoxActive
                  : styles.iconBoxInactive,
              ]}
            >
              <Feather
                name="key"
                size={20}
                color={selectedMethod === 'passkey' ? '#F0923A' : '#8A97AB'}
              />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Passkey</Text>
              <Text style={styles.optionSubtitle}>
                Sign in without an OTP on this phone
              </Text>
            </View>
            <RadioButton selected={selectedMethod === 'passkey'} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Pattern or PIN */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedMethod('pattern')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedMethod === 'pattern' }}
          >
            <View
              style={[
                styles.iconBox,
                selectedMethod === 'pattern'
                  ? styles.iconBoxActive
                  : styles.iconBoxInactive,
              ]}
            >
              <Feather
                name="activity"
                size={20}
                color={selectedMethod === 'pattern' ? '#F0923A' : '#8A97AB'}
              />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Pattern or PIN</Text>
              <Text style={styles.optionSubtitle}>A pattern just for HosynQ</Text>
            </View>
            <RadioButton selected={selectedMethod === 'pattern'} />
          </TouchableOpacity>
        </View>

        {/* Security Note Banner */}
        <View style={styles.securityNote}>
          <Feather name="shield" size={18} color="#8A97AB" style={{ marginRight: 12, marginTop: 2 }} />
          <Text style={styles.securityNoteText}>
            HosynQ never sees your fingerprint or face. Your phone checks it.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Save Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSave?.(selectedMethod)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Save unlock method"
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RadioButton: React.FC<{ selected: boolean }> = ({ selected }) => (
  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
    {selected && <View style={styles.radioInner} />}
  </View>
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
    paddingTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconBoxActive: {
    borderColor: '#F0923A',
  },
  iconBoxInactive: {
    borderColor: '#354154',
  },
  optionInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#354154',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#F0923A',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F0923A',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 74,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
  },
  securityNoteText: {
    flex: 1,
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
  saveBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
