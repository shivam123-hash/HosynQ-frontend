import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '../../../../units/Colors';

export interface BriefLoadingStateProps {
  dateRangeText?: string;
}

const BriefLoadingState: React.FC<BriefLoadingStateProps> = ({
  dateRangeText = 'Friday, 30 October',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Meta Row */}
      <View style={styles.metaRow}>
        <Text style={styles.dateText}>{dateRangeText}</Text>
        <Text style={styles.writingStatus}>Writing...</Text>
      </View>

      {/* Main AI Writing Skeleton Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sparkleIcon}>✦</Text>
          <Text style={styles.cardTitle}>Writing today’s brief...</Text>
        </View>

        {/* Skeleton Lines */}
        <Animated.View style={[styles.skeletonLine, styles.lineWidth100, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonLine, styles.lineWidth92, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonLine, styles.lineWidth78, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonLine, styles.lineWidth45, { opacity: pulseAnim }]} />
      </View>

      {/* Section Skeleton Header */}
      <Animated.View
        style={[
          styles.skeletonSectionTitle,
          { opacity: pulseAnim },
        ]}
      />

      {/* 4 Skeleton List Item Cards */}
      {[1, 2, 3, 4].map((index) => (
        <View key={index} style={styles.skeletonItemCard}>
          <Animated.View
            style={[styles.skeletonCircle, { opacity: pulseAnim }]}
          />
          <View style={styles.skeletonItemDetails}>
            <Animated.View
              style={[styles.skeletonTitleBar, { opacity: pulseAnim }]}
            />
            <Animated.View
              style={[styles.skeletonSubtitleBar, { opacity: pulseAnim }]}
            />
          </View>
        </View>
      ))}

      {/* Explanatory Footer Text */}
      <Text style={styles.footerNotice}>
        This takes a few seconds. You can leave this screen. We’ll keep writing.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  dateText: {
    fontSize: 13,
    color: '#8A97AB',
    fontWeight: '500',
  },
  writingStatus: {
    fontSize: 13,
    color: Colors.primary, // #F0913A
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 20,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sparkleIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E314D',
    marginBottom: 12,
  },
  lineWidth100: {
    width: '100%',
  },
  lineWidth92: {
    width: '92%',
  },
  lineWidth78: {
    width: '78%',
  },
  lineWidth45: {
    width: '45%',
  },
  skeletonSectionTitle: {
    width: 130,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1E314D',
    marginBottom: 14,
  },
  skeletonItemCard: {
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E314D',
    marginRight: 14,
  },
  skeletonItemDetails: {
    flex: 1,
  },
  skeletonTitleBar: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E314D',
    marginBottom: 8,
  },
  skeletonSubtitleBar: {
    width: '38%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#182840',
  },
  footerNotice: {
    fontSize: 13,
    lineHeight: 20,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
});

export default memo(BriefLoadingState);
