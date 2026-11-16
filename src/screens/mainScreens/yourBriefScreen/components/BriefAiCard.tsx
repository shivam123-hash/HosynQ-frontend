import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface BriefAiCardProps {
  dateRangeText: string;
  updatedText: string;
  summaryText: string;
}

const HIGHLIGHT_REGEX =
  /(\b\d{1,2}:\d{2}\s?(?:AM|PM)\b|₹[\d,]+|\b\d+\s+(?:tasks|events|more)\b|\b(?:Saturday|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday)\b|\b\d{1,2}(?:st|nd|rd|th)\b)/gi;

const BriefAiCard: React.FC<BriefAiCardProps> = ({
  dateRangeText,
  updatedText,
  summaryText,
}) => {
  const renderHighlightedText = (text: string) => {
    const parts = text.split(HIGHLIGHT_REGEX);
    return (
      <Text style={styles.summaryText}>
        {parts.map((part, index) => {
          if (part.match(HIGHLIGHT_REGEX)) {
            return (
              <Text key={index} style={styles.boldText}>
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Date & Updated Meta Row */}
      <View style={styles.metaRow}>
        <Text style={styles.dateText}>{dateRangeText}</Text>
        <Text style={styles.updatedText}>{updatedText}</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.card}>
        {renderHighlightedText(summaryText)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
    height: 18,
  },
  dateText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    color: '#C9D1DC',
    fontWeight: '500',
  },
  updatedText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    color: '#8A97AB',
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 18,
  },
  summaryText: {
    fontFamily: 'Roboto',
    fontSize: 17,
    lineHeight: 27,
    color: '#E6EBF2',
    letterSpacing: 0.34,
    fontWeight: '400',
  },
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default memo(BriefAiCard);

