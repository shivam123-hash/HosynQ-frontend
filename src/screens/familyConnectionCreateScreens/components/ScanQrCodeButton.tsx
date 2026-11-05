import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface ScanQrCodeButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const ScanQrCodeButton: React.FC<ScanQrCodeButtonProps> = ({
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Ionicons
        name="qr-code-outline"
        size={19}
        color={Colors.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>Scan QR code</Text>
    </TouchableOpacity>
  );
};

export default ScanQrCodeButton;

const styles = StyleSheet.create({
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginVertical: 14,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
});

