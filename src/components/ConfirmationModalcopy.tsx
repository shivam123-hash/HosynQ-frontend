import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  cancelColor?: string;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Yes',
  cancelText = 'No',
  confirmColor = '#1E88E5',
  cancelColor = '#6B7280',
  loading = false,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModalContent}>
          <Text style={styles.confirmModalTitle}>{title}</Text>
          <Text style={styles.confirmModalMessage}>{message}</Text>

          <View style={styles.confirmButtonRow}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: cancelColor }]}
              onPress={onClose}
            >
              <Text style={styles.confirmButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    width: width * 0.82,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  confirmModalMessage: {
    fontSize: RFValue(16),
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    margin: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});

export default memo(ConfirmationModal);
