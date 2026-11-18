import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface LogoutConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirmLogout,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Circular Emblem */}
          <View style={styles.iconCircle}>
            <Feather name="log-out" size={24} color="#F0913A" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Log out of HosynQ?</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            You’ll need your mobile number and an OTP to log back in. Your family’s
            data stays safe.
          </Text>

          {/* Action Button: Log out */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onConfirmLogout}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>

          {/* Secondary Action: Cancel */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#142238',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#2A3A52',
    backgroundColor: '#0F1A2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  logoutButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F0913A',
  },
});
