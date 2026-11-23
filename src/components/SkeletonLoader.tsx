import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
  DimensionValue,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.boxBase,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

/** Skeleton representation of Lists Overview screen (LST-01) */
export const ListsSkeleton: React.FC = () => {
  return (
    <View style={styles.listsContainer}>
      {/* Vacation Planner Banner Skeleton */}
      <View style={styles.vacationBannerSkeleton}>
        <View style={styles.vacationBannerLeft}>
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <View style={styles.vacationBannerTextCol}>
            <SkeletonBox width={100} height={12} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBox width={160} height={16} borderRadius={4} />
          </View>
        </View>
        <SkeletonBox width={20} height={20} borderRadius={10} />
      </View>

      {/* 2x2 List Cards Grid Skeleton */}
      <View style={styles.listGrid}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.listCardSkeleton}>
            {/* Header: Icon + Avatars */}
            <View style={styles.listCardHeaderRow}>
              <SkeletonBox width={36} height={36} borderRadius={18} />
              <View style={styles.avatarClusterSkeleton}>
                <SkeletonBox width={20} height={20} borderRadius={10} style={{ marginRight: -6 }} />
                <SkeletonBox width={20} height={20} borderRadius={10} />
              </View>
            </View>

            {/* Title Skeleton */}
            <SkeletonBox width="85%" height={16} borderRadius={4} style={{ marginTop: 14 }} />

            {/* Subtitle count skeleton ("x of y left") */}
            <SkeletonBox width="50%" height={12} borderRadius={4} style={{ marginTop: 8 }} />

            {/* Progress bar skeleton */}
            <SkeletonBox width="100%" height={5} borderRadius={3} style={{ marginTop: 16 }} />
          </View>
        ))}
      </View>
    </View>
  );
};

/** Skeleton representation of Tasks screen (TSK-01) */
export const TasksSkeleton: React.FC = () => {
  return (
    <View style={styles.tasksContainer}>
      {/* Status Tabs Skeleton (Pending / Completed) */}
      <View style={styles.tabsRowSkeleton}>
        <SkeletonBox width="48%" height={40} borderRadius={20} />
        <SkeletonBox width="48%" height={40} borderRadius={20} />
      </View>

      {/* Member Avatar Filter Row Skeleton */}
      <View style={styles.memberFilterRowSkeleton}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <View key={idx} style={styles.memberItemSkeleton}>
            <SkeletonBox width={46} height={46} borderRadius={23} />
            <SkeletonBox width={36} height={10} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>

      {/* Overdue & Due This Week Alert Cards */}
      <View style={styles.alertsRowSkeleton}>
        <View style={styles.alertCardSkeleton}>
          <SkeletonBox width={60} height={10} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width={90} height={16} borderRadius={4} />
        </View>
        <View style={styles.alertCardSkeleton}>
          <SkeletonBox width={80} height={10} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width={100} height={16} borderRadius={4} />
        </View>
      </View>

      {/* Accordion Category Header Skeleton */}
      <View style={styles.categoryHeaderSkeleton}>
        <SkeletonBox width={110} height={16} borderRadius={4} />
        <SkeletonBox width={24} height={16} borderRadius={8} />
      </View>

      {/* Task Item Cards Skeleton */}
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.taskCardSkeleton}>
          <View style={styles.taskCardLeft}>
            <SkeletonBox width={20} height={20} borderRadius={10} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="75%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width="40%" height={12} borderRadius={4} />
            </View>
          </View>
          <SkeletonBox width={26} height={26} borderRadius={13} />
        </View>
      ))}
    </View>
  );
};

/** Skeleton representation of Members Modal / Screen (MEM-01) */
export const MembersSkeleton: React.FC = () => {
  return (
    <View style={styles.membersContainer}>
      {/* Family Info Header Skeleton */}
      <View style={styles.membersHeaderSkeleton}>
        <SkeletonBox width={160} height={20} borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox width={100} height={13} borderRadius={4} />
      </View>

      {/* Action Buttons Top Bar */}
      <View style={styles.membersTopActionsSkeleton}>
        <SkeletonBox width="48%" height={44} borderRadius={22} />
        <SkeletonBox width="48%" height={44} borderRadius={22} />
      </View>

      {/* Member Rows Skeleton */}
      {[1, 2, 3, 4, 5].map((idx) => (
        <View key={idx} style={styles.memberRowSkeleton}>
          <View style={styles.memberRowLeft}>
            <SkeletonBox width={44} height={44} borderRadius={22} style={{ marginRight: 14 }} />
            <View>
              <SkeletonBox width={130} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width={85} height={12} borderRadius={4} />
            </View>
          </View>
          <View style={styles.memberRowRight}>
            <SkeletonBox width={65} height={24} borderRadius={12} style={{ marginRight: 10 }} />
            <SkeletonBox width={16} height={16} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );
};

/** Skeleton representation of Join Requests Modal / Screen (MEM-02) */
export const JoinRequestsSkeleton: React.FC = () => {
  return (
    <View style={styles.requestsContainer}>
      {[1, 2].map((idx) => (
        <View key={idx} style={styles.requestCardSkeleton}>
          {/* Header row with avatar and details */}
          <View style={styles.requestHeaderRow}>
            <SkeletonBox width={44} height={44} borderRadius={22} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width={140} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width={95} height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={60} height={12} borderRadius={4} />
          </View>

          {/* Message box skeleton */}
          <SkeletonBox width="100%" height={38} borderRadius={10} style={{ marginVertical: 14 }} />

          {/* Role selector skeleton */}
          <View style={styles.requestRoleSelectorSkeleton}>
            <SkeletonBox width="48%" height={36} borderRadius={18} />
            <SkeletonBox width="48%" height={36} borderRadius={18} />
          </View>

          {/* Action buttons (Decline & Approve) */}
          <View style={styles.requestActionButtonsSkeleton}>
            <SkeletonBox width="48%" height={44} borderRadius={22} />
            <SkeletonBox width="48%" height={44} borderRadius={22} />
          </View>
        </View>
      ))}
    </View>
  );
};

/** Skeleton representation of Family Hub Modal / Screen (FAM-01) */
export const FamilyHubSkeleton: React.FC = () => {
  return (
    <View style={styles.hubContainer}>
      {/* Top Family Card Skeleton */}
      <View style={styles.hubFamilyCardSkeleton}>
        <View style={styles.hubFamilyCardLeft}>
          <SkeletonBox width={44} height={44} borderRadius={22} />
          <View style={{ marginLeft: 14 }}>
            <SkeletonBox width={140} height={18} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBox width={100} height={13} borderRadius={4} />
          </View>
        </View>
        <SkeletonBox width={85} height={32} borderRadius={10} />
      </View>

      {/* Avatars Row Skeleton */}
      <View style={styles.hubMembersRowSkeleton}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <View key={idx} style={styles.hubMemberItemSkeleton}>
            <SkeletonBox width={48} height={48} borderRadius={24} style={{ marginBottom: 6 }} />
            <SkeletonBox width={42} height={12} borderRadius={3} style={{ marginBottom: 4 }} />
            <SkeletonBox width={34} height={10} borderRadius={3} />
          </View>
        ))}
      </View>

      {/* 2x2 Feature Grid Skeleton */}
      <View style={styles.hubGridSkeleton}>
        {[1, 2, 3, 4].map((idx) => (
          <View key={idx} style={styles.hubGridCardSkeleton}>
            <SkeletonBox width={44} height={44} borderRadius={22} style={{ marginBottom: 16 }} />
            <SkeletonBox width={90} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBox width={120} height={12} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Vault Card Skeleton */}
      <View style={styles.hubVaultCardSkeleton}>
        <SkeletonBox width={44} height={44} borderRadius={14} style={{ marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <SkeletonBox width={110} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width={180} height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

export default {
  SkeletonBox,
  ListsSkeleton,
  TasksSkeleton,
  MembersSkeleton,
  JoinRequestsSkeleton,
  FamilyHubSkeleton,
};

const styles = StyleSheet.create({
  boxBase: {
    backgroundColor: '#1E2D44',
  },
  listsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  vacationBannerSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  vacationBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vacationBannerTextCol: {
    marginLeft: 12,
  },
  listGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listCardSkeleton: {
    width: (SCREEN_WIDTH - 54) / 2,
    backgroundColor: '#112238',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 16,
    marginBottom: 14,
  },
  listCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarClusterSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tasksContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tabsRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  memberFilterRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  memberItemSkeleton: {
    alignItems: 'center',
  },
  alertsRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  alertCardSkeleton: {
    width: '48%',
    backgroundColor: '#112238',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 14,
  },
  categoryHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2A3F',
    marginBottom: 12,
  },
  taskCardSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  membersContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  membersHeaderSkeleton: {
    marginBottom: 20,
  },
  membersTopActionsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  memberRowSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  memberRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  requestCardSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 16,
    marginBottom: 16,
  },
  requestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestRoleSelectorSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  requestActionButtonsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hubContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  hubFamilyCardSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D324F',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hubFamilyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hubMembersRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  hubMemberItemSkeleton: {
    alignItems: 'center',
    width: 52,
  },
  hubGridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  hubGridCardSkeleton: {
    width: '48.2%',
    backgroundColor: '#112238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 16,
    minHeight: 136,
    marginBottom: 12,
  },
  hubVaultCardSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D324F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
});
