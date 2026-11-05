import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';

export interface EncryptedNoticeCardProps {
  message?: string;
}

const EncryptedNoticeCard: React.FC<EncryptedNoticeCardProps> = ({
  message = 'Your documents are encrypted and stored securely. Only you can access this information.',
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.iconWrapper}>
        <Feather name="lock" size={20} color="#E5A024" />
      </View>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

export default EncryptedNoticeCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrapper: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    flex: 1,
    fontSize: RFValue(12),
    color: '#0A1B31',
    fontWeight: '500',
    lineHeight: RFValue(17),
  },
});

