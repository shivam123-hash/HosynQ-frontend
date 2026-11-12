import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';

export interface DocumentReminderBannerProps {
  message?: string;
}

const DocumentReminderBanner: React.FC<DocumentReminderBannerProps> = ({
  message = 'HosynQ reminds you before anything here expires.',
}) => {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.iconWrapper}>
        <Feather name="star" size={15} color="#F59E0B" />
      </View>
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
};

export default DocumentReminderBanner;

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2238',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    marginTop: 8,
  },
  iconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: RFValue(12),
    lineHeight: 17,
    fontWeight: '400',
  },
});

