import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { BriefTimeframe } from '../types';

export interface BriefCardProps {
  initialTimeframe?: BriefTimeframe;
  todayBriefText?: string;
  taskCount?: number;
  eventCount?: number;
  onReadFullBrief?: () => void;
  onTimeframeChange?: (timeframe: BriefTimeframe) => void;
}

const DEFAULT_BRIEF_TEXT =
  'Aarav’s PTM is at 3:00 PM and Rohan is picking him up. The electricity bill of ₹2,840 is due tomorrow, and Dadi’s BP tablets run out on Sunday.';

const BriefCard: React.FC<BriefCardProps> = ({
  initialTimeframe = 'today',
  todayBriefText = DEFAULT_BRIEF_TEXT,
  taskCount = 7,
  eventCount = 3,
  onReadFullBrief,
  onTimeframeChange,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<BriefTimeframe>(initialTimeframe);

  const handleSelect = (timeframe: BriefTimeframe) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange?.(timeframe);
  };

  const renderHighlightedContent = (text: string) => {
    const highlightRegex = /(3:00 PM|₹2,840|\b\d{1,2}:\d{2}\s?(?:AM|PM)\b|₹[\d,]+)/g;
    const parts = text.split(highlightRegex);

    if (parts.length === 1) {
      return <Text style={styles.briefContent}>{text}</Text>;
    }

    return (
      <Text style={styles.briefContent}>
        {parts.map((part, index) => {
          if (part.match(highlightRegex)) {
            return (
              <Text key={index} style={styles.boldHighlight}>
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
    <View style={styles.card}>
      {/* Top Header & Timeframe Chips */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTag}>YOUR BRIEF</Text>

        <View style={styles.periodRow}>
          {(['today', 'week', 'month'] as BriefTimeframe[]).map((tab) => {
            const isActive = selectedTimeframe === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => handleSelect(tab)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  isActive ? styles.activeChip : styles.inactiveChip,
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    isActive ? styles.activeChipLabel : styles.inactiveChipLabel,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Brief Summary Content */}
      {renderHighlightedContent(todayBriefText)}

      {/* Explicit Divider Rule */}
      <View style={styles.divider} />

      {/* Footer Meta & Action */}
      <View style={styles.footerRow}>
        <Text style={styles.metaText} numberOfLines={1}>
          From {taskCount} tasks and {eventCount} events
        </Text>

        <TouchableOpacity
          onPress={onReadFullBrief}
          activeOpacity={0.7}
          style={styles.readBriefBtn}
        >
          <Text style={styles.readBriefText}>Read full brief</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(BriefCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTag: {
    fontFamily: 'Roboto',
    fontSize: RFValue(11),
    lineHeight: RFValue(15),
    fontWeight: '700',
    color: '#F0913A',
    letterSpacing: 0.8,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: '#F0913A',
    borderWidth: 1,
    borderColor: '#F0913A',
  },
  inactiveChip: {
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: '#3A4556',
  },
  chipLabel: {
    fontFamily: 'Roboto',
    fontSize: RFValue(11),
    lineHeight: RFValue(15),
  },
  activeChipLabel: {
    color: '#0B1A2F',
    fontWeight: '600',
  },
  inactiveChipLabel: {
    color: '#C9D1DC',
    fontWeight: '400',
  },
  briefContent: {
    fontFamily: 'Roboto',
    fontSize: RFValue(13.5),
    lineHeight: RFValue(22),
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#E6EBF2',
  },
  boldHighlight: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginTop: 16,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaText: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: RFValue(11.5),
    lineHeight: RFValue(16),
    fontWeight: '400',
    color: '#8A97AB',
  },
  readBriefBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(240, 144, 52, 0.16)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readBriefText: {
    fontFamily: 'Roboto',
    fontSize: RFValue(11),
    lineHeight: RFValue(15),
    fontWeight: '500',
    color: '#F0913A',
  },
});
