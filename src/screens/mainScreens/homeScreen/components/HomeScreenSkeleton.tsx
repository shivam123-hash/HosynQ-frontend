import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const HomeScreenSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.headerRow}>
        <View style={styles.greetingCol}>
          <Animated.View style={[styles.box, { width: 140, height: 16, opacity: pulseAnim }]} />
          <Animated.View
            style={[styles.box, { width: 190, height: 26, marginTop: 8, opacity: pulseAnim }]}
          />
        </View>
        <Animated.View style={[styles.avatarCircle, { opacity: pulseAnim }]} />
      </View>

      {/* Brief Card Skeleton */}
      <View style={styles.briefCard}>
        <View style={styles.briefHeader}>
          <Animated.View style={[styles.box, { width: 90, height: 14, opacity: pulseAnim }]} />
          <View style={styles.chipRow}>
            <Animated.View style={[styles.chip, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.chip, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.chip, { opacity: pulseAnim }]} />
          </View>
        </View>
        <Animated.View
          style={[styles.box, { width: '100%', height: 16, marginTop: 12, opacity: pulseAnim }]}
        />
        <Animated.View
          style={[styles.box, { width: '85%', height: 16, marginTop: 8, opacity: pulseAnim }]}
        />
        <Animated.View
          style={[styles.box, { width: '60%', height: 16, marginTop: 8, opacity: pulseAnim }]}
        />
        <View style={styles.briefFooter}>
          <Animated.View style={[styles.box, { width: 120, height: 14, opacity: pulseAnim }]} />
          <Animated.View style={[styles.box, { width: 80, height: 14, opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Quick Actions Row */}
      <View style={styles.quickActionsRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.quickActionItem}>
            <Animated.View style={[styles.actionCircle, { opacity: pulseAnim }]} />
            <Animated.View
              style={[styles.box, { width: 44, height: 10, marginTop: 6, opacity: pulseAnim }]}
            />
          </View>
        ))}
      </View>

      {/* Needs Attention Header & Cards */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.box, { width: 130, height: 18, opacity: pulseAnim }]} />
          <Animated.View style={[styles.box, { width: 50, height: 14, opacity: pulseAnim }]} />
        </View>
        <View style={styles.cardRow}>
          <Animated.View style={[styles.attentionCard, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.attentionCard, { opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Upcoming Events Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.box, { width: 140, height: 18, opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.eventCard, { opacity: pulseAnim }]} />
      </View>

      {/* Pending Tasks Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.box, { width: 120, height: 18, opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.taskCard, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.taskCard, { marginTop: 10, opacity: pulseAnim }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  box: {
    backgroundColor: '#1E3352',
    borderRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greetingCol: {
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3352',
  },
  briefCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 24,
  },
  briefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E3352',
  },
  briefFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A2C46',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#162842',
    borderWidth: 1,
    borderColor: '#1E3352',
  },
  sectionContainer: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  attentionCard: {
    flex: 1,
    height: 104,
    borderRadius: 16,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  eventCard: {
    height: 72,
    borderRadius: 16,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  taskCard: {
    height: 64,
    borderRadius: 14,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
  },
});

export default HomeScreenSkeleton;
