import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MonthStatItem } from '../types';

export interface BriefMonthStatCardsProps {
  stats: MonthStatItem[];
}

const BriefMonthStatCards: React.FC<BriefMonthStatCardsProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {stats.map((stat) => {
          const isPositive = stat.badgeType === 'positive';
          return (
            <View key={stat.id} style={styles.card}>
              {/* Stat Big Number */}
              <Text style={styles.valueText}>{stat.value}</Text>

              {/* Stat Label */}
              <Text style={styles.labelText}>{stat.label}</Text>

              {/* Subtitle / Comparison */}
              {stat.badgeText && (
                <Text
                  style={[
                    styles.metaText,
                    isPositive ? styles.positiveText : styles.neutralText,
                  ]}
                  numberOfLines={1}
                >
                  {stat.badgeText}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#2A3E5E',
    padding: 14,
    gap: 2,
    height: 105,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  valueText: {
    fontFamily: 'Roboto',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#B6B8B8',
  },
  labelText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#B6B8B8',
  },
  metaText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  positiveText: {
    color: '#6FD9A6',
  },
  neutralText: {
    color: '#8A97AB',
  },
});

export default memo(BriefMonthStatCards);

