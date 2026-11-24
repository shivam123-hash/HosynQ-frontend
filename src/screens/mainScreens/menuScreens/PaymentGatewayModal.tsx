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

export interface PaymentGatewayModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod?: (method: 'upi' | 'card' | 'netbanking') => void;
  planName?: string;
  priceText?: string;
  firstChargeDate?: string;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  visible,
  onClose,
  onSelectMethod,
  planName = 'HosynQ Premium',
  priceText = '₹2500 every year',
  firstChargeDate = '26 Nov 2026',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          {/* Gateway Label */}
          <View style={styles.gatewayLabelContainer}>
            <Text style={styles.gatewayLabelText}>
              PAYMENT GATEWAY · SHOWN BY THE GATEWAY
            </Text>
          </View>

          <Text style={styles.sheetTitle}>Set up AutoPay</Text>
          <Text style={styles.planInfoText}>
            {planName} · {priceText} · First charge on {firstChargeDate}
          </Text>

          {/* Payment Methods */}
          <View style={styles.methodsList}>
            <TouchableOpacity
              style={styles.methodRow}
              onPress={() => onSelectMethod?.('upi')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="UPI apps"
            >
              <Text style={styles.methodTitle}>UPI apps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodRow}
              onPress={() => onSelectMethod?.('card')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Debit or credit card"
            >
              <Text style={styles.methodTitle}>Debit or credit card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodRow}
              onPress={() => onSelectMethod?.('netbanking')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Net banking"
            >
              <Text style={styles.methodTitle}>Net banking</Text>
            </TouchableOpacity>
          </View>

          {/* Guarantee / Disclaimer Box with Orange Border */}
          <View style={styles.footerNoteContainer}>
            <Text style={styles.footerNoteBadge}>HOSYNQ WRITES THIS LINE</Text>
            <Text style={styles.footerNoteText}>
              Nothing is charged today. You can stop AutoPay any time in your UPI app or in HosynQ.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 13, 24, 0.75)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#2B2F36',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#5E6573',
    borderStyle: 'dashed',
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gatewayLabelContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  gatewayLabelText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
  },
  sheetTitle: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  planInfoText: {
    fontSize: 13,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  methodsList: {
    marginBottom: 12,
  },
  methodRow: {
    backgroundColor: '#363B43',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    justifyContent: 'center',
  },
  methodTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  footerNoteContainer: {
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#20252C',
    marginTop: 4,
  },
  footerNoteBadge: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#F0913A',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  footerNoteText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});
