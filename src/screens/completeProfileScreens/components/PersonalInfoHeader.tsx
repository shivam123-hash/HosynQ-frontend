import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';

export interface PersonalInfoHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

const PersonalInfoHeader: React.FC<PersonalInfoHeaderProps> = ({
  title = 'Personal information',
  subtitle = 'Priya · Section 1 of 5',
  onBack,
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather name="chevron-left" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitleText} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Spacer to keep title centered */}
      <View style={styles.spacer} />
    </View>
  );
};

export default PersonalInfoHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    fontWeight: '400',
    marginTop: 2,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
    height: 40,
  },
});

