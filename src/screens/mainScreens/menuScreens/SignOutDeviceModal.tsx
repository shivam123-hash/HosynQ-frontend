import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface SignOutDeviceModalProps {
  visible: boolean;
  deviceName?: string;
  onClose: () => void;
  onConfirmSignOut: () => void;
}

export const SignOutDeviceModal: React.FC<SignOutDeviceModalProps> = ({
  visible,
  deviceName = 'iPad Air',
  onClose,
  onConfirmSignOut,
}) => {
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

        <View style={styles.dialogCard}>
          <View style={styles.iconCircle}>
            <Feather
              name="log-out"
              size={24}
              color="#F06A6A"
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          <Text style={styles.dialogTitle}>Sign out of {deviceName}?</Text>
          <Text style={styles.dialogMessage}>
            Anyone using that {deviceName.split(' ')[0] || 'device'} will need your mobile number and an OTP to sign back in.
          </Text>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={onConfirmSignOut}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Confirm sign out of ${deviceName}`}
          >
            <Text style={styles.signOutBtnText}>Sign out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0E1F38',
    borderWidth: 1.5,
    borderColor: '#6B3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  dialogMessage: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  signOutBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F06A6A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  signOutBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F0923A',
  },
});
