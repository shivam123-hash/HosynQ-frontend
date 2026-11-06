import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../../units/Colors';

export interface BriefHeaderProps {
  onBackPress?: () => void;
  onSharePress?: () => void;
  onStateTogglePress?: () => void;
}

const BriefHeader: React.FC<BriefHeaderProps> = ({
  onBackPress,
  onSharePress,
  onStateTogglePress,
}) => {
  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onBackPress}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Feather name="chevron-left" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Screen Title */}
      <TouchableOpacity
        style={styles.titleContainer}
        onLongPress={onStateTogglePress}
        activeOpacity={0.9}
        accessibilityRole="header"
      >
        <Text style={styles.sparkleIcon}>✦</Text>
        <Text style={styles.titleText}>Your brief</Text>
      </TouchableOpacity>

      {/* Share / Action Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onSharePress}
        activeOpacity={0.7}
        accessibilityLabel="Share brief"
        accessibilityRole="button"
      >
        <Feather name="upload" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 4,
    height: 52,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleIcon: {
    fontSize: 18,
    color: Colors.primary, // #F0913A
    fontWeight: '700',
  },
  titleText: {
    fontFamily: 'Roboto',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: '#B6B8B8',
  },
});

export default memo(BriefHeader);

