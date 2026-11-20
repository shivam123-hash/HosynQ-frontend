import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import ThreeDotsLoader from './ThreeDotsLoader';

export interface AppConfirmationModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  isDestructive?: boolean;
  loading?: boolean;
  iconName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AppConfirmationModal: React.FC<AppConfirmationModalProps> = ({
  visible,
  title = 'Delete item?',
  message = 'Are you sure you want to delete this? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmColor,
  isDestructive = true,
  loading = false,
  iconName = 'trash-2',
  onConfirm,
  onCancel,
}) => {
  const activeConfirmBg = confirmColor || (isDestructive ? '#EF4444' : '#F0913A');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={loading ? undefined : onCancel}
        />

        <View style={styles.dialogCard}>
          {/* Top Icon Circle */}
          <View
            style={[
              styles.iconCircle,
              isDestructive
                ? styles.iconCircleDestructive
                : styles.iconCirclePrimary,
            ]}
          >
            <Feather
              name={iconName as any}
              size={24}
              color={isDestructive ? '#EF4444' : '#F0913A'}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: activeConfirmBg }]}
            onPress={onConfirm}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ThreeDotsLoader color="#FFFFFF" size={6} spacing={4} />
            ) : (
              <Text style={styles.confirmText}>{confirmText}</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.cancelText}>{cancelText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AppConfirmationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  iconCirclePrimary: {
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(240, 145, 58, 0.3)',
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  message: {
    fontSize: RFValue(13.5),
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  confirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: RFValue(14.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#8A97AB',
  },
});

