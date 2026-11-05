import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface FamilyHeaderProps {
  onBack?: () => void;
  stepText?: string;
  progressPercent?: number; // e.g. 90 or 100
}

const FamilyHeader: React.FC<FamilyHeaderProps> = ({
  onBack,
  stepText = 'Step 4 of 4',
  progressPercent = 90,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Bar: Back Button & Step Text */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.stepText}>{stepText}</Text>
      </View>

      {/* Progress Bar Row */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(Math.max(progressPercent, 0), 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>
    </View>
  );
};

export default FamilyHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#1E324A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12),
    marginLeft: 12,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
});

