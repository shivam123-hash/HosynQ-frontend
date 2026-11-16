import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface LifeProfilePrivacyCardProps {
  message?: string;
}

const LifeProfilePrivacyCard: React.FC<LifeProfilePrivacyCardProps> = ({
  message = 'Only your family sees your profile. Sensitive details need your consent first.',
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.iconCircle}>
        <Feather name="lock" size={15} color="#94A3B8" />
      </View>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

export default LifeProfilePrivacyCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 24,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: RFValue(11.5),
    lineHeight: RFValue(17),
    fontWeight: '400',
  },
});

