import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { TripData } from './types';
import FindCommonDatesModal from './FindCommonDatesModal';
import TripDetailsModal from './TripDetailsModal';
import TripBookingsModal from './TripBookingsModal';
import TripPackingModal from './TripPackingModal';

export type TripScreenName = 'overview' | 'dates' | 'details' | 'bookings' | 'packing';

export interface TripPlannerModalProps {
  visible: boolean;
  tripData: TripData;
  initialScreen?: TripScreenName;
  onClose: () => void;
  onUpdateTripData?: (updated: TripData) => void;
  onOpenDates?: () => void;
  onOpenDetails?: () => void;
  onOpenBookings?: () => void;
  onOpenPacking?: () => void;
}

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  visible,
  tripData,
  initialScreen,
  onClose,
  onUpdateTripData,
  onOpenDates,
  onOpenDetails,
  onOpenBookings,
  onOpenPacking,
}) => {
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<TripScreenName>(
    initialScreen || (tripData.step1Done ? 'overview' : 'dates')
  );

  useEffect(() => {
    if (visible) {
      if (initialScreen) {
        setCurrentScreen(initialScreen);
      } else {
        setCurrentScreen(tripData.step1Done ? 'overview' : 'dates');
      }
    }
  }, [visible, initialScreen, tripData.step1Done]);

  const handleOpenDates = () => {
    if (onOpenDates) onOpenDates();
    setCurrentScreen('dates');
  };

  const handleOpenDetails = () => {
    if (onOpenDetails) onOpenDetails();
    setCurrentScreen('details');
  };

  const handleOpenBookings = () => {
    if (onOpenBookings) onOpenBookings();
    setCurrentScreen('bookings');
  };

  const handleOpenPacking = () => {
    if (onOpenPacking) onOpenPacking();
    setCurrentScreen('packing');
  };

  // Sub-screens rendered seamlessly inside the single root modal
  if (currentScreen === 'dates') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <FindCommonDatesModal
          asModal={false}
          visible={true}
          onClose={() => setCurrentScreen('overview')}
          onSelectDates={(chosenDates) => {
            const updated: TripData = {
              ...tripData,
              datesText: chosenDates,
              step1Done: true,
            };
            if (onUpdateTripData) onUpdateTripData(updated);
            setCurrentScreen('details');
          }}
        />
      </Modal>
    );
  }

  if (currentScreen === 'details') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TripDetailsModal
          asModal={false}
          visible={true}
          tripData={tripData}
          onClose={() => setCurrentScreen('overview')}
          onSaveTrip={(updatedFields) => {
            const updated: TripData = {
              ...tripData,
              ...updatedFields,
              step2Done: true,
            };
            if (onUpdateTripData) onUpdateTripData(updated);
            setCurrentScreen('overview');
          }}
        />
      </Modal>
    );
  }

  if (currentScreen === 'bookings') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TripBookingsModal
          asModal={false}
          visible={true}
          bookings={tripData.bookings}
          documents={tripData.documents}
          onClose={() => setCurrentScreen('overview')}
          onUpdateBookings={(updatedBookings) => {
            const updated: TripData = {
              ...tripData,
              bookings: updatedBookings,
            };
            if (onUpdateTripData) onUpdateTripData(updated);
          }}
        />
      </Modal>
    );
  }

  if (currentScreen === 'packing') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TripPackingModal
          asModal={false}
          visible={true}
          destination={tripData.destination}
          packingItems={tripData.packingItems}
          onClose={() => setCurrentScreen('overview')}
          onUpdatePackingItems={(updatedItems) => {
            const updated: TripData = {
              ...tripData,
              packingItems: updatedItems,
            };
            if (onUpdateTripData) onUpdateTripData(updated);
          }}
        />
      </Modal>
    );
  }

  const selectedMembers = tripData.members.filter((m) => m.selected);
  const isStep1Done = Boolean(tripData.step1Done);
  const isStep2Done = Boolean(tripData.step2Done);
  const bookedCount = tripData.bookings.filter((b) => b.isBooked).length;
  const totalBookings = tripData.bookings.length;
  const isStep3Done = bookedCount === totalBookings && totalBookings > 0;
  const packedCount = tripData.packingItems.filter((p) => p.isPacked).length;
  const totalPacking = tripData.packingItems.length;
  const isStep4Done = packedCount === totalPacking && totalPacking > 0;

  let completedStepsCount = 0;
  if (isStep1Done) completedStepsCount += 1;
  if (isStep2Done) completedStepsCount += 1;
  if (isStep3Done) completedStepsCount += 1;
  if (isStep4Done) completedStepsCount += 1;

  const getFillStyle = (count: number) => {
    switch (count) {
      case 1:
        return styles.progressFillQuarter;
      case 2:
        return styles.progressFillHalf;
      case 3:
        return styles.progressFillThreeQuarters;
      case 4:
        return styles.progressFillFull;
      default:
        return styles.progressFill0;
    }
  };

  const getBottomButtonConfig = () => {
    if (!isStep1Done) {
      return {
        label: 'Find common dates',
        icon: <Ionicons name="calendar-outline" size={20} color="#FFFFFF" style={styles.trainIcon} />,
        action: handleOpenDates,
      };
    }
    if (!isStep2Done) {
      return {
        label: 'Set trip details',
        icon: <Ionicons name="location-outline" size={20} color="#FFFFFF" style={styles.trainIcon} />,
        action: handleOpenDetails,
      };
    }
    return {
      label: 'Book train tickets',
      icon: <Ionicons name="train-outline" size={20} color="#FFFFFF" style={styles.trainIcon} />,
      action: handleOpenBookings,
    };
  };

  const bottomBtn = getBottomButtonConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom || 16 },
        ]}
      >
        <StatusBar barStyle="light-content" />

        {/* Top Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Trip plan</Text>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => {}}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Trip options"
          >
            <Feather name="more-horizontal" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Vacation Planner Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroTag}>VACATION PLANNER</Text>
            <Text style={styles.destinationTitle}>{tripData.destination}</Text>

            {/* Date row */}
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color="#2DD4BF" style={styles.calIcon} />
              <Text style={styles.dateText}>
                {`${tripData.datesText} · ${tripData.durationText}`}
              </Text>
            </View>

            {/* Avatar Stack Row */}
            <View style={styles.avatarRow}>
              <View style={styles.avatarStack}>
                {tripData.members.map((member, index) => (
                  <View
                    key={member.id}
                    style={[
                      styles.avatarCircle,
                      index > 0 && styles.avatarCircleOverlap,
                      {
                        backgroundColor: member.color,
                        zIndex: 10 - index,
                      },
                    ]}
                  >
                    <Text style={styles.avatarInitial}>{member.initial}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.membersGoingText}>
                {selectedMembers.length === tripData.members.length
                  ? `All ${selectedMembers.length} going`
                  : `${selectedMembers.length} going`}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, getFillStyle(completedStepsCount)]} />
              </View>
              <Text style={styles.progressLabel}>{`${completedStepsCount} of 4 done`}</Text>
            </View>
          </View>

          {/* Steps section */}
          <Text style={styles.sectionHeader}>STEPS</Text>

          <View style={styles.stepsCard}>
            {/* Step 1: Find common dates */}
            <TouchableOpacity
              style={styles.stepRow}
              onPress={handleOpenDates}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Find common dates"
            >
              {isStep1Done ? (
                <View style={styles.stepCheckCircle}>
                  <Feather name="check" size={16} color="#0B1A2F" />
                </View>
              ) : (
                <View style={styles.stepNumberCircleOrange}>
                  <Text style={styles.stepNumberTextOrange}>1</Text>
                </View>
              )}
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Find common dates</Text>
                <Text style={styles.stepSubtitle}>
                  {isStep1Done ? 'Everyone is free 13–16 Nov' : 'Check everyone’s calendar for free dates'}
                </Text>
              </View>
              {isStep1Done ? (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneBadgeText}>Done</Text>
                </View>
              ) : (
                <View style={styles.orangeBadge}>
                  <Text style={styles.orangeBadgeText}>Start</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.stepDivider} />

            {/* Step 2: Destination and trip event */}
            <TouchableOpacity
              style={styles.stepRow}
              onPress={handleOpenDetails}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Destination and trip event"
            >
              {isStep2Done ? (
                <View style={styles.stepCheckCircle}>
                  <Feather name="check" size={16} color="#0B1A2F" />
                </View>
              ) : (
                <View style={styles.stepNumberCircleMuted}>
                  <Text style={styles.stepNumberTextMuted}>2</Text>
                </View>
              )}
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Destination and trip event</Text>
                <Text style={styles.stepSubtitle}>
                  {isStep2Done ? 'Added to the family calendar' : 'Set destination & calendar event'}
                </Text>
              </View>
              {isStep2Done ? (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneBadgeText}>Done</Text>
                </View>
              ) : (
                <View style={styles.startedBadge}>
                  <Text style={styles.startedBadgeText}>Pending</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.stepDivider} />

            {/* Step 3: Bookings and reminders */}
            <TouchableOpacity
              style={styles.stepRow}
              onPress={handleOpenBookings}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Bookings and reminders"
            >
              {isStep1Done && isStep2Done ? (
                <View style={styles.stepNumberCircleOrange}>
                  <Text style={styles.stepNumberTextOrange}>3</Text>
                </View>
              ) : (
                <View style={styles.stepNumberCircleMuted}>
                  <Text style={styles.stepNumberTextMuted}>3</Text>
                </View>
              )}
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Bookings and reminders</Text>
                <Text
                  style={
                    isStep1Done && isStep2Done
                      ? styles.stepSubtitleOrange
                      : styles.stepSubtitle
                  }
                >
                  {isStep1Done && isStep2Done
                    ? bookedCount < totalBookings
                      ? 'Train tickets not booked yet'
                      : 'All bookings done'
                    : 'Train tickets, stays & reminders'}
                </Text>
              </View>
              {isStep1Done && isStep2Done ? (
                <View style={styles.orangeBadge}>
                  <Text style={styles.orangeBadgeText}>
                    {`${bookedCount} of ${totalBookings}`}
                  </Text>
                </View>
              ) : (
                <View style={styles.startedBadge}>
                  <Text style={styles.startedBadgeText}>Pending</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.stepDivider} />

            {/* Step 4: Packing list */}
            <TouchableOpacity
              style={styles.stepRow}
              onPress={handleOpenPacking}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Packing list"
            >
              <View style={styles.stepNumberCircleMuted}>
                <Text style={styles.stepNumberTextMuted}>4</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Packing list</Text>
                <Text style={styles.stepSubtitle}>
                  {packedCount > 0
                    ? `${packedCount} of ${totalPacking} items packed`
                    : 'Shared & kids essentials'}
                </Text>
              </View>
              <View style={styles.startedBadge}>
                <Text style={styles.startedBadgeText}>
                  {packedCount > 0 ? 'Started' : 'Pending'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Dashed Reminder Note */}
          <View style={styles.dashedCard}>
            <Ionicons name="sparkles" size={18} color="#F0913A" style={styles.sparkleIcon} />
            <Text style={styles.dashedCardText}>
              Diwali week trains fill fast. Book tickets by Monday so the family can travel together.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom CTA Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={bottomBtn.action}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={bottomBtn.label}
          >
            {bottomBtn.icon}
            <Text style={styles.ctaButtonText}>{bottomBtn.label}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#0E2338',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    padding: 18,
    marginTop: 6,
  },
  heroTag: {
    color: '#2DD4BF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  destinationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  calIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CAD4DF',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0E2338',
  },
  avatarCircleOverlap: {
    marginLeft: -8,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  membersGoingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A97AB',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1F3352',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2DD4BF',
  },
  progressFill0: {
    width: '0%',
  },
  progressFillQuarter: {
    width: '25%',
  },
  progressFillHalf: {
    width: '50%',
  },
  progressFillThreeQuarters: {
    width: '75%',
  },
  progressFillFull: {
    width: '100%',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2DD4BF',
    marginLeft: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  stepsCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  stepCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberCircleOrange: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberTextOrange: {
    color: '#F0913A',
    fontSize: 14,
    fontWeight: '700',
  },
  stepNumberCircleMuted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#192841',
    borderWidth: 1,
    borderColor: '#2C3E55',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberTextMuted: {
    color: '#8A97AB',
    fontSize: 14,
    fontWeight: '700',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A97AB',
    marginTop: 2,
  },
  stepSubtitleOrange: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F0913A',
    marginTop: 2,
  },
  doneBadge: {
    borderWidth: 1,
    borderColor: '#2DD4BF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  doneBadgeText: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '600',
  },
  orangeBadge: {
    borderWidth: 1,
    borderColor: '#F0913A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orangeBadgeText: {
    color: '#F0913A',
    fontSize: 12,
    fontWeight: '600',
  },
  startedBadge: {
    backgroundColor: '#1A2C46',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  startedBadgeText: {
    color: '#8A97AB',
    fontSize: 12,
    fontWeight: '600',
  },
  stepDivider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginHorizontal: 16,
  },
  dashedCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    backgroundColor: 'rgba(240, 145, 58, 0.05)',
  },
  sparkleIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  dashedCardText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#CAD4DF',
    fontWeight: '400',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0913A',
    height: 56,
    borderRadius: 28,
  },
  trainIcon: {
    marginRight: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
export default TripPlannerModal;
