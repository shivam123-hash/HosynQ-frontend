import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface WhatChangesOnFreeModalProps {
  visible: boolean;
  onClose: () => void;
  onKeepPremium: () => void;
  onConfirmSwitchToFree: () => void;
  effectiveDate?: string;
}

export const WhatChangesOnFreeModal: React.FC<WhatChangesOnFreeModalProps> = ({
  visible,
  onClose,
  onKeepPremium,
  onConfirmSwitchToFree,
  effectiveDate = 'Thu, 12 Nov',
}) => {
  const insets = useSafeAreaInsets();

  const lostFeatures = [
    'AI brief and suggestions',
    'Scanning bills and circulars',
    'Vault renewal reminders',
    'Place reminders in Compass',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.dialogCard,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          {/* Hero Alert Circle Badge */}
          <View style={styles.heroBadgeContainer}>
            <View style={styles.heroCircle}>
              <View style={styles.alertCircleOutline}>
                <View style={styles.exclamationBar} />
                <View style={styles.exclamationDot} />
              </View>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.dialogTitle}>What changes on Free</Text>
          <Text style={styles.dialogSubtitle}>
            From {effectiveDate}, your family won’t have:
          </Text>

          {/* Loss list */}
          <View style={styles.lossList}>
            {lostFeatures.map((feat, i) => (
              <View key={i} style={styles.lossItem}>
                <Feather
                  name="x"
                  size={15}
                  color="#F06A6A"
                  style={styles.lossCrossIcon}
                />
                <Text style={styles.lossText}>{feat}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.reassuranceText}>
            Your data stays. Nothing is deleted.
          </Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.keepBtn}
            onPress={onKeepPremium}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Keep Premium"
          >
            <Text style={styles.keepBtnText}>Keep Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchFreeBtn}
            onPress={onConfirmSwitchToFree}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Switch to Free"
          >
            <Text style={styles.switchFreeBtnText}>Switch to Free</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 13, 24, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#122440',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  heroBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#0E1F38',
    borderWidth: 1.5,
    borderColor: '#3A4555',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCircleOutline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.2,
    borderColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
  },
  exclamationBar: {
    width: 2.5,
    height: 9.5,
    borderRadius: 1.25,
    backgroundColor: '#F0923A',
    marginBottom: 2.5,
  },
  exclamationDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#F0923A',
  },
  dialogTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    marginBottom: 20,
  },
  lossList: {
    gap: 12,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  lossItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lossCrossIcon: {
    marginRight: 12,
  },
  lossText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#FFFFFF',
    flex: 1,
  },
  reassuranceText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: '#6FD9A6',
    textAlign: 'center',
    marginBottom: 22,
  },
  keepBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  keepBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  switchFreeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  switchFreeBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F06A6A',
  },
});
