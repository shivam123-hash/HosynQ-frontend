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
import CommonBtn from './CommonBtn';

export interface AppErrorModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
}

const AppErrorModal: React.FC<AppErrorModalProps> = ({
  visible,
  title = 'Validation Error',
  message = 'Please check the information entered and try again.',
  buttonText = 'Got it',
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.dialogCard}>
          {/* Top Warning Icon Circle */}
          <View style={styles.iconCircle}>
            <Feather name="alert-circle" size={28} color="#EF4444" />
          </View>

          {/* Title */}
          <Text style={styles.titleText}>{title}</Text>

          {/* Message */}
          <Text style={styles.messageText}>{message}</Text>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <CommonBtn
              title={buttonText}
              onPress={onClose}
              backgroundColor="#EF4444"
              textColor="#FFFFFF"
              height={48}
              borderRadius={24}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AppErrorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F2238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    color: '#CBD5E1',
    fontSize: RFValue(13),
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 4,
  },
});
