import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../../units/Colors';
import CommonBtn from '../../../../components/CommonBtn';

const { width } = Dimensions.get('window');

export interface AccountAlreadyExistsModalProps {
  visible: boolean;
  phoneNumber?: string;
  onClose: () => void;
  onContinueWithGoogle?: () => void;
  onUseDifferentNumber?: () => void;
}

const AccountAlreadyExistsModal: React.FC<AccountAlreadyExistsModalProps> = ({
  visible,
  phoneNumber = '+91 98765 43210',
  onClose,
  onContinueWithGoogle,
  onUseDifferentNumber,
}) => {
  const handleUseDifferentNumber = () => {
    if (onUseDifferentNumber) {
      onUseDifferentNumber();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        {/* Modal Card Content (stops tap propagation to overlay) */}
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Circular User Avatar Icon */}
          <View style={styles.iconCircle}>
            <Feather name="user" size={28} color={Colors.primary} />
          </View>

          {/* Headline */}
          <Text style={styles.title}>This number already has an account</Text>

          {/* Description */}
          <Text style={styles.description}>
            {phoneNumber} signs in with Google. Continue with Google to open the same account and family.
          </Text>

          {/* Continue with Google Button */}
          <CommonBtn
            title="Continue with Google"
            onPress={onContinueWithGoogle}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={52}
            borderRadius={26}
            fontSize={RFValue(14.5)}
            width="100%"
          />

          {/* Use a different number Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleUseDifferentNumber}
            style={styles.differentNumberButton}
          >
            <Text style={styles.differentNumberText}>Use a different number</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AccountAlreadyExistsModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: Math.min(width - 48, 345),
    backgroundColor: '#101E31',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1C2F46',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 22,
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#0C1827',
    borderWidth: 1.5,
    borderColor: '#1D3550',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: RFValue(17.5),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  description: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18.5),
    paddingHorizontal: 6,
    marginBottom: 24,
  },
  differentNumberButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  differentNumberText: {
    color: '#8E9AA8',
    fontSize: RFValue(13.5),
    fontWeight: '500',
    textAlign: 'center',
  },
});

