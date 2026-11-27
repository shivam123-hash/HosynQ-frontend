import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface NeedsAttentionHeaderProps {
  onBackPress?: () => void;
  onAddPress?: () => void;
}

const NeedsAttentionHeader: React.FC<NeedsAttentionHeaderProps> = ({
  onBackPress,
  onAddPress,
}) => {
  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.circleButton}
        onPress={onBackPress}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Feather name="chevron-left" size={20} color="#CAD4DF" />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Needs attention</Text>
      </View>

      {/* Right Add Reminder Button or Spacer */}
      {onAddPress ? (
        <TouchableOpacity
          style={styles.circleButton}
          onPress={onAddPress}
          activeOpacity={0.7}
          accessibilityLabel="Add reminder"
          accessibilityRole="button"
        >
          <Feather name="plus" size={20} color="#CAD4DF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.rightSpacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    height: 56,
  },
  circleButton: {
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Roboto-Bold',
    color: '#CAD4DF',
  },
  rightSpacer: {
    width: 44,
    height: 44,
  },
});

export default memo(NeedsAttentionHeader);
