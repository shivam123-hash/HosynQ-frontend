import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface DashedActionButtonProps {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const DashedActionButton: React.FC<DashedActionButtonProps> = ({
  title,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Feather
        name="plus"
        size={14}
        color={Colors.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default DashedActionButton;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 23,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: 'rgba(240, 145, 58, 0.45)',
    backgroundColor: 'rgba(240, 145, 58, 0.03)',
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#E2E8F0',
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
});

