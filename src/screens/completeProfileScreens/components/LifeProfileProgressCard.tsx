import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface LifeProfileProgressCardProps {
  completionPercentage?: number;
  completedSectionsCount?: number;
  totalSectionsCount?: number;
  nextStepHint?: string;
}

const LifeProfileProgressCard: React.FC<LifeProfileProgressCardProps> = ({
  completionPercentage = 70,
  completedSectionsCount = 3,
  totalSectionsCount = 5,
  nextStepHint = 'Add your interests next',
}) => {
  const clampedPercent = Math.min(Math.max(completionPercentage, 0), 100);

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <Text style={styles.percentageText}>
          Profile {clampedPercent}% complete
        </Text>
        <Text style={styles.sectionsCountText}>
          {completedSectionsCount} of {totalSectionsCount} sections
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${clampedPercent}%` }]} />
      </View>

      {/* Bottom Hint */}
      <Text style={styles.hintText}>{nextStepHint}</Text>
    </View>
  );
};

export default LifeProfileProgressCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0F2238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  sectionsCountText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  hintText: {
    color: '#94A3B8',
    fontSize: RFValue(12.5),
    fontWeight: '400',
  },
});

