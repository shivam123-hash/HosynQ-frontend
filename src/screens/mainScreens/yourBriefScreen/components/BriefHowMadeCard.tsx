import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface BriefHowMadeCardProps {
  description: string;
  textColor?: string;
  onFeedback?: (useful: boolean) => void;
}

const BriefHowMadeCard: React.FC<BriefHowMadeCardProps> = ({
  description,
  textColor,
  onFeedback,
}) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const handlePress = (useful: boolean) => {
    setFeedback(useful ? 'yes' : 'no');
    onFeedback?.(useful);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dashedCard}>
        {/* Eyebrow Title */}
        <Text style={styles.eyebrow}>HOW THIS BRIEF WAS MADE</Text>

        {/* Explanation */}
        <Text
          style={[
            styles.description,
            textColor ? { color: textColor } : null,
          ]}
        >
          {description}
        </Text>

        {/* Feedback Section */}
        <View style={styles.feedbackRow}>
          <Text style={styles.feedbackPrompt}>Was this useful?</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.feedbackBtn,
                styles.yesBtn,
                feedback === 'yes' && styles.feedbackBtnActive,
              ]}
              onPress={() => handlePress(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.feedbackBtnText,
                  feedback === 'yes' && styles.feedbackBtnTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.feedbackBtn,
                styles.noBtn,
                feedback === 'no' && styles.feedbackBtnActive,
              ]}
              onPress={() => handlePress(false)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.feedbackBtnText,
                  feedback === 'no' && styles.feedbackBtnTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  dashedCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A3E5E',
    borderStyle: 'dashed',
    padding: 16,
    gap: 12,
  },
  eyebrow: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.44,
  },
  description: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#C9D1DC',
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 35,
  },
  feedbackPrompt: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#B6B8B8',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackBtn: {
    height: 35,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesBtn: {
    width: 58,
  },
  noBtn: {
    width: 53,
  },
  feedbackBtnActive: {
    borderColor: '#F0913A',
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
  },
  feedbackBtnText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    color: '#C9D1DC',
  },
  feedbackBtnTextActive: {
    color: '#F0913A',
    fontWeight: '600',
  },
});

export default memo(BriefHowMadeCard);

