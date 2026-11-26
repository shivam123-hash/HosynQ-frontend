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
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 650,
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
          <SkeletonBox width={48} height={48} borderRadius={24} />
          <View style={styles.vacationBannerTextCol}>
            <SkeletonBox width={100} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBox width={160} height={16} borderRadius={4} style={{ marginBottom: 5 }} />
            <SkeletonBox width={130} height={12} borderRadius={4} />
          </View>
        </View>
        <SkeletonBox width={20} height={20} borderRadius={10} />
      </View>

      {/* Plan new trip Skeleton */}
      <View style={styles.vacationBannerSkeleton}>
        <View style={styles.vacationBannerLeft}>
          <SkeletonBox width={48} height={48} borderRadius={24} />
          <View style={styles.vacationBannerTextCol}>
            <SkeletonBox width={115} height={16} borderRadius={4} />
          </View>
        </View>
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

/** Skeleton representation of Calendar Screen (CAL-01) */
export const CalendarSkeleton: React.FC = () => {
  return (
    <View style={styles.calendarContainer}>
      {/* Segmented Tabs (Day / Week / Month) Skeleton */}
      <View style={styles.calendarTabsSkeleton}>
        <SkeletonBox width="31%" height={40} borderRadius={20} />
        <SkeletonBox width="31%" height={40} borderRadius={20} />
        <SkeletonBox width="31%" height={40} borderRadius={20} />
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

      {/* Date Header Skeleton */}
      <View style={styles.calendarDateHeaderSkeleton}>
        <SkeletonBox width={160} height={20} borderRadius={6} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkeletonBox width={32} height={32} borderRadius={16} />
          <SkeletonBox width={32} height={32} borderRadius={16} />
        </View>
      </View>

      {/* Week Strip Skeleton (7 days) */}
      <View style={styles.calendarWeekStripSkeleton}>
        {[1, 2, 3, 4, 5, 6, 7].map((idx) => (
          <View key={idx} style={styles.calendarDayCellSkeleton}>
            <SkeletonBox width={24} height={10} borderRadius={3} style={{ marginBottom: 6 }} />
            <SkeletonBox width={26} height={26} borderRadius={13} />
          </View>
        ))}
      </View>

      {/* All-Day Events Section Skeleton */}
      <View style={styles.calendarAllDayHeaderSkeleton}>
        <SkeletonBox width={110} height={11} borderRadius={3} />
      </View>
      <View style={styles.calendarAllDayCardSkeleton}>
        <SkeletonBox width="60%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonBox width="35%" height={12} borderRadius={4} />
      </View>

      {/* Timeline Schedule Slots Skeleton */}
      {[1, 2, 3].map((slot) => (
        <View key={slot} style={styles.calendarTimelineRowSkeleton}>
          <View style={styles.calendarTimeColSkeleton}>
            <SkeletonBox width={48} height={12} borderRadius={4} />
          </View>
          <View style={styles.calendarTimelineCardSkeleton}>
            <SkeletonBox width="70%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBox width="40%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <SkeletonBox width={65} height={18} borderRadius={9} />
              <SkeletonBox width={20} height={20} borderRadius={10} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

/** Skeleton for Upcoming/Past Trips List */
export const TripsListSkeleton: React.FC = () => {
  return (
    <View style={styles.tripSectionContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.tripCardSkeleton}>
          <View style={styles.vacationBannerLeft}>
            <SkeletonBox width={48} height={48} borderRadius={24} />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <SkeletonBox width={100} height={11} borderRadius={4} style={{ marginBottom: 8 }} />
              <SkeletonBox width="72%" height={17} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width="52%" height={12} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

/** Skeleton for Trip Plan Overview (hero card + 4 steps) */
export const TripOverviewSkeleton: React.FC = () => {
  return (
    <View style={styles.tripSectionContainer}>
      <View style={styles.tripHeroSkeleton}>
        <SkeletonBox width={120} height={12} borderRadius={4} style={{ marginBottom: 10 }} />
        <SkeletonBox width="68%" height={24} borderRadius={6} style={{ marginBottom: 10 }} />
        <SkeletonBox width="55%" height={14} borderRadius={4} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <SkeletonBox width={30} height={30} borderRadius={15} style={{ marginRight: -6 }} />
          <SkeletonBox width={30} height={30} borderRadius={15} style={{ marginRight: -6 }} />
          <SkeletonBox width={30} height={30} borderRadius={15} style={{ marginRight: 12 }} />
          <SkeletonBox width={80} height={13} borderRadius={4} />
        </View>
        <SkeletonBox width="100%" height={6} borderRadius={3} />
      </View>

      <SkeletonBox width={60} height={11} borderRadius={4} style={{ marginBottom: 12, marginTop: 8 }} />
      <View style={styles.tripGroupSkeleton}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.tripRowSkeleton}>
            <SkeletonBox width={32} height={32} borderRadius={16} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="60%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width="80%" height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={54} height={24} borderRadius={12} />
          </View>
        ))}
      </View>
    </View>
  );
};

/** Skeleton for Find Common Dates Heatmap & Options */
export const FindCommonDatesSkeleton: React.FC = () => {
  return (
    <View style={styles.tripSectionContainer}>
      <SkeletonBox width="78%" height={14} borderRadius={4} style={{ marginBottom: 18 }} />
      <View style={styles.tripGroupSkeleton}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <SkeletonBox width={28} height={12} borderRadius={4} />
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <SkeletonBox key={d} width={22} height={12} borderRadius={4} />
            ))}
          </View>
          {[1, 2, 3].map((m) => (
            <View key={m} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <SkeletonBox width={28} height={28} borderRadius={14} style={{ marginRight: 10 }} />
              <SkeletonBox width="84%" height={20} borderRadius={6} />
            </View>
          ))}
        </View>
      </View>

      <SkeletonBox width={95} height={11} borderRadius={4} style={{ marginTop: 18, marginBottom: 12 }} />
      {[1, 2].map((opt) => (
        <View key={opt} style={styles.tripCardSkeleton}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonBox width={24} height={24} borderRadius={12} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="62%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width="45%" height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={22} height={22} borderRadius={11} />
          </View>
        </View>
      ))}
    </View>
  );
};

/** Skeleton for Trip Bookings & Documents */
export const TripBookingsSkeleton: React.FC = () => {
  return (
    <View style={styles.tripSectionContainer}>
      <SkeletonBox width="75%" height={14} borderRadius={4} style={{ marginBottom: 18 }} />
      <View style={styles.tripGroupSkeleton}>
        {[1, 2, 3].map((b) => (
          <View key={b} style={styles.tripRowSkeleton}>
            <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="58%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width="74%" height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={70} height={24} borderRadius={12} />
          </View>
        ))}
      </View>
      <SkeletonBox width={88} height={11} borderRadius={4} style={{ marginTop: 18, marginBottom: 12 }} />
      <View style={styles.tripGroupSkeleton}>
        {[1, 2].map((doc) => (
          <View key={doc} style={styles.tripRowSkeleton}>
            <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="52%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width="68%" height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={58} height={24} borderRadius={12} />
          </View>
        ))}
      </View>
    </View>
  );
};

/** Skeleton for Trip Packing List */
export const TripPackingSkeleton: React.FC = () => {
  return (
    <View style={styles.tripSectionContainer}>
      <SkeletonBox width={90} height={28} borderRadius={8} style={{ marginBottom: 12 }} />
      <SkeletonBox width="65%" height={24} borderRadius={6} style={{ marginBottom: 14 }} />
      <SkeletonBox width="100%" height={6} borderRadius={3} style={{ marginBottom: 18 }} />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        {[1, 2, 3, 4].map((c) => (
          <SkeletonBox key={c} width={76} height={34} borderRadius={17} />
        ))}
      </View>
      <View style={styles.tripGroupSkeleton}>
        {[1, 2, 3, 4].map((row) => (
          <View key={row} style={styles.tripRowSkeleton}>
            <SkeletonBox width={24} height={24} borderRadius={12} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="60%" height={15} borderRadius={4} style={{ marginBottom: 5 }} />
              <SkeletonBox width="35%" height={11} borderRadius={4} />
            </View>
            <SkeletonBox width={24} height={24} borderRadius={12} />
          </View>
        ))}
      </View>
    </View>
  );
};

/** Skeleton for Family Pulse Home (PUL-01) */
export const PulseHomeSkeleton: React.FC = () => {
  return (
    <View style={styles.pulseSectionContainer}>
      {/* Today's Mood Card Skeleton */}
      <View style={[styles.tripCardSkeleton, { padding: 18 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <SkeletonBox width={100} height={12} borderRadius={4} />
          <SkeletonBox width={90} height={12} borderRadius={4} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[1, 2, 3, 4].map((idx) => (
            <View key={idx} style={{ alignItems: 'center' }}>
              <SkeletonBox width={46} height={46} borderRadius={23} style={{ marginBottom: 8 }} />
              <SkeletonBox width={42} height={12} borderRadius={4} style={{ marginBottom: 5 }} />
              <SkeletonBox width={36} height={10} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions Row Skeleton */}
      <View style={{ flexDirection: 'row', gap: 9, marginBottom: 24 }}>
        {[1, 2, 3, 4].map((idx) => (
          <View key={idx} style={[styles.tripCardSkeleton, { flex: 1, alignItems: 'center', marginBottom: 0, paddingVertical: 18 }]}>
            <SkeletonBox width={22} height={22} borderRadius={11} style={{ marginBottom: 8 }} />
            <SkeletonBox width="70%" height={12} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Section Preview Cards Skeleton */}
      {[1, 2, 3].map((sec) => (
        <View key={sec} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <SkeletonBox width={135} height={19} borderRadius={5} />
            <SkeletonBox width={46} height={14} borderRadius={4} />
          </View>
          <View style={styles.tripCardSkeleton}>
            <SkeletonBox width="62%" height={15} borderRadius={4} style={{ marginBottom: 10 }} />
            <SkeletonBox width="92%" height={13} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonBox width="45%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

/** Skeleton for Appreciation Wall (PUL-03) */
export const AppreciationWallSkeleton: React.FC = () => {
  return (
    <View style={styles.pulseSectionContainer}>
      {[1, 2, 3].map((card) => (
        <View key={card} style={styles.tripCardSkeleton}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SkeletonBox width={30} height={30} borderRadius={15} />
              <SkeletonBox width={30} height={30} borderRadius={15} style={{ marginLeft: 10, marginRight: 10 }} />
              <SkeletonBox width={130} height={14} borderRadius={4} />
            </View>
            <SkeletonBox width={54} height={12} borderRadius={4} />
          </View>
          <SkeletonBox width="95%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width="70%" height={14} borderRadius={4} style={{ marginBottom: 14 }} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SkeletonBox width={68} height={28} borderRadius={14} />
            <SkeletonBox width={52} height={28} borderRadius={14} />
            <SkeletonBox width={30} height={28} borderRadius={14} />
          </View>
        </View>
      ))}
    </View>
  );
};

/** Skeleton for Family Polls List (PUL-05) */
export const FamilyPollsSkeleton: React.FC = () => {
  return (
    <View style={styles.pulseSectionContainer}>
      {[1, 2].map((card) => (
        <View key={card} style={styles.tripCardSkeleton}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SkeletonBox width={28} height={28} borderRadius={14} style={{ marginRight: 8 }} />
              <SkeletonBox width={120} height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={68} height={22} borderRadius={11} />
          </View>
          <SkeletonBox width="85%" height={18} borderRadius={5} style={{ marginBottom: 14 }} />
          {[1, 2, 3].map((opt) => (
            <View key={opt} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <SkeletonBox width="60%" height={13} borderRadius={4} />
                <SkeletonBox width={34} height={13} borderRadius={4} />
              </View>
              <SkeletonBox width="100%" height={6} borderRadius={3} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

/** Skeleton for Poll Results (PUL-07) */
export const PollResultsSkeleton: React.FC = () => {
  return (
    <View style={styles.pulseSectionContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <SkeletonBox width={70} height={24} borderRadius={12} style={{ marginRight: 10 }} />
        <SkeletonBox width={150} height={13} borderRadius={4} />
      </View>
      <SkeletonBox width="88%" height={24} borderRadius={6} style={{ marginBottom: 18 }} />
      <View style={[styles.tripHeroSkeleton, { marginBottom: 14 }]}>
        <SkeletonBox width={90} height={12} borderRadius={4} style={{ marginBottom: 12 }} />
        <SkeletonBox width="65%" height={18} borderRadius={5} style={{ marginBottom: 10 }} />
        <SkeletonBox width="100%" height={8} borderRadius={4} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row' }}>
          <SkeletonBox width={28} height={28} borderRadius={14} style={{ marginRight: -6 }} />
          <SkeletonBox width={28} height={28} borderRadius={14} style={{ marginRight: -6 }} />
          <SkeletonBox width={28} height={28} borderRadius={14} />
        </View>
      </View>
      <View style={styles.tripCardSkeleton}>
        <SkeletonBox width="55%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonBox width="100%" height={6} borderRadius={3} style={{ marginBottom: 14 }} />
        <SkeletonBox width="45%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonBox width="100%" height={6} borderRadius={3} />
      </View>
    </View>
  );
};

/** Skeleton for Milestones Timeline (PUL-08) */
export const MilestonesSkeleton: React.FC = () => {
  return (
    <View style={styles.pulseSectionContainer}>
      <SkeletonBox width={110} height={12} borderRadius={4} style={{ marginBottom: 12 }} />
      <View style={[styles.tripCardSkeleton, { padding: 0, overflow: 'hidden' }]}>
        <SkeletonBox width="100%" height={140} borderRadius={0} />
        <View style={{ padding: 16 }}>
          <SkeletonBox width={65} height={12} borderRadius={4} style={{ marginBottom: 8 }} />
          <SkeletonBox width="78%" height={18} borderRadius={5} style={{ marginBottom: 8 }} />
          <SkeletonBox width="60%" height={12} borderRadius={4} />
        </View>
      </View>
      {[1, 2].map((row) => (
        <View key={row} style={styles.tripCardSkeleton}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonBox width={40} height={40} borderRadius={12} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="68%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonBox width="48%" height={12} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

/** Skeleton for Milestone Detail / Life Profile Sync (PUL-12) */
export const MilestoneDetailSkeleton: React.FC = () => {
  return (
    <View style={{ gap: 10, marginTop: 12 }}>
      <SkeletonBox width={140} height={11} borderRadius={4} />
      <SkeletonBox width="85%" height={14} borderRadius={4} />
      <SkeletonBox width="65%" height={14} borderRadius={4} />
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
  CalendarSkeleton,
  TripsListSkeleton,
  TripOverviewSkeleton,
  FindCommonDatesSkeleton,
  TripBookingsSkeleton,
  TripPackingSkeleton,
  PulseHomeSkeleton,
  AppreciationWallSkeleton,
  FamilyPollsSkeleton,
  PollResultsSkeleton,
  MilestonesSkeleton,
  MilestoneDetailSkeleton,
};

const styles = StyleSheet.create({
  boxBase: {
    backgroundColor: '#263C5B',
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
  calendarContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  calendarTabsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#112238',
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
  },
  calendarDateHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calendarWeekStripSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#112238',
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  calendarDayCellSkeleton: {
    alignItems: 'center',
    width: 38,
  },
  calendarAllDayHeaderSkeleton: {
    marginBottom: 8,
  },
  calendarAllDayCardSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1D324F',
    marginBottom: 18,
  },
  calendarTimelineRowSkeleton: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  calendarTimeColSkeleton: {
    width: 56,
    paddingTop: 6,
  },
  calendarTimelineCardSkeleton: {
    flex: 1,
    backgroundColor: '#112238',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1D324F',
  },
  tripSectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  pulseSectionContainer: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  tripHeroSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1D324F',
    padding: 20,
    marginBottom: 16,
  },
  tripCardSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1D324F',
    padding: 16,
    marginBottom: 12,
  },
  tripGroupSkeleton: {
    backgroundColor: '#112238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D324F',
    overflow: 'hidden',
  },
  tripRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D324F',
  },
});
