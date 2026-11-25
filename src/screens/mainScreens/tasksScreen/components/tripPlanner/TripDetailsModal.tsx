import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { TripData } from './types';

import { Colors, Fonts, Typography } from '../../../../../units';

export interface TripDetailsModalProps {
  visible?: boolean;
  asModal?: boolean;
  tripData: TripData;
  onClose: () => void;
  onSaveTrip: (updated: Partial<TripData>) => void;
}

export const TripDetailsModal: React.FC<TripDetailsModalProps> = ({
  visible = true,
  asModal = true,
  tripData,
  onClose,
  onSaveTrip,
}) => {
  const insets = useSafeAreaInsets();

  const [destination, setDestination] = useState(tripData.destination);
  const [leaveDate, _setLeaveDate] = useState(tripData.leaveDate);
  const [returnDate, _setReturnDate] = useState(tripData.returnDate);
  const [members, setMembers] = useState(tripData.members);
  const [addToCalendar, setAddToCalendar] = useState(tripData.addToCalendar);

  const toggleMember = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, selected: !m.selected } : m
      )
    );
  };

  const selectedCount = members.filter((m) => m.selected).length;

  const handleSave = () => {
    onSaveTrip({
      destination,
      leaveDate,
      returnDate,
      members,
      addToCalendar,
    });
    onClose();
  };

  const cityShortName = destination.split(',')[0].trim() || 'Trip';

  const content = (
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
          <Feather name="chevron-left" size={24} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Trip details</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Where are you going? */}
        <Text style={styles.fieldLabel}>Where are you going?</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={Colors.primary} style={styles.pinIcon} />
          <TextInput
            style={styles.textInput}
            value={destination}
            onChangeText={setDestination}
            placeholder="Destination city, state"
            placeholderTextColor={Colors.textSecondaryMuted}
            accessibilityLabel="Destination"
          />
        </View>

        {/* Dates */}
        <Text style={[styles.fieldLabel, styles.sectionTopSpace]}>Dates</Text>
        <View style={styles.datesRow}>
          {/* Leave card */}
          <TouchableOpacity
            style={styles.dateCard}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Text style={styles.dateCardTag}>LEAVE</Text>
            <Text style={styles.dateCardValue}>{leaveDate}</Text>
          </TouchableOpacity>

          {/* Return card */}
          <TouchableOpacity
            style={styles.dateCard}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Text style={styles.dateCardTag}>RETURN</Text>
            <Text style={styles.dateCardValue}>{returnDate}</Text>
          </TouchableOpacity>
        </View>

        {/* Who's going? */}
        <Text style={[styles.fieldLabel, styles.sectionTopSpace]}>Who’s going?</Text>
        <View style={styles.membersRow}>
          {members.map((member) => {
            const isSelected = member.selected !== false;
            return (
              <TouchableOpacity
                key={member.id}
                style={styles.memberCol}
                onPress={() => toggleMember(member.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Select ${member.name}`}
              >
                <View
                  style={[
                    styles.memberAvatarCircle,
                    { backgroundColor: member.color },
                    isSelected ? styles.memberAvatarSelected : styles.memberAvatarUnselected,
                  ]}
                >
                  <Text style={styles.memberInitial}>{member.initial}</Text>
                </View>
                <Text
                  style={[
                    styles.memberName,
                    !isSelected && styles.memberNameUnselected,
                  ]}
                >
                  {member.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add to family calendar switch */}
        <View style={styles.switchRow}>
          <View style={styles.switchTextCol}>
            <Text style={styles.switchTitle}>Add to the family calendar</Text>
            <Text style={styles.switchSubtitle}>Everyone going gets the event</Text>
          </View>
          <Switch
            value={addToCalendar}
            onValueChange={setAddToCalendar}
            trackColor={{ false: Colors.borderBold, true: Colors.primary }}
            thumbColor={Colors.white}
            accessibilityRole="switch"
            accessibilityLabel="Add to family calendar"
          />
        </View>

        {/* PREVIEW */}
        <Text style={styles.previewSectionHeader}>PREVIEW</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewDateCol}>
            <Text style={styles.previewDateDay}>13</Text>
            <Text style={styles.previewDateMonth}>NOV</Text>
          </View>

          <View style={styles.previewDivider} />

          <View style={styles.previewDetailsCol}>
            <Text style={styles.previewTitle}>{cityShortName} trip</Text>
            <Text style={styles.previewSubtitle}>
              4 days · {selectedCount === members.length ? 'Everyone' : `${selectedCount} members`}
            </Text>
          </View>

          <View style={styles.travelBadge}>
            <Text style={styles.travelBadgeText}>Travel</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleSave}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Save trip"
        >
          <Text style={styles.bottomButtonText}>Save trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  headerPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  fieldLabel: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textLightMutedAlt,
    marginBottom: 8,
  },
  sectionTopSpace: {
    marginTop: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 18,
  },
  pinIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.medium,
    color: Colors.white,
    paddingVertical: 0,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: Colors.transparent,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    padding: 14,
  },
  dateCardTag: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 0.6,
  },
  dateCardValue: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginTop: 4,
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCol: {
    alignItems: 'center',
  },
  memberAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  memberAvatarUnselected: {
    borderWidth: 2,
    borderColor: Colors.borderBold,
    opacity: 0.45,
  },
  memberInitial: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  memberName: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.white,
    marginTop: 6,
  },
  memberNameUnselected: {
    color: Colors.textSecondaryMuted,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    paddingVertical: 4,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  switchTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  switchSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textSecondaryMuted,
    marginTop: 4,
  },
  previewSectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDateCol: {
    alignItems: 'center',
    minWidth: 32,
  },
  previewDateDay: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  previewDateMonth: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.textSecondaryMuted,
    marginTop: 2,
  },
  previewDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderBold,
    marginHorizontal: 16,
  },
  previewDetailsCol: {
    flex: 1,
  },
  previewTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  previewSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
    marginTop: 3,
  },
  travelBadge: {
    borderWidth: 1.5,
    borderColor: Colors.accentTealMint,
    borderRadius: 14,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  travelBadgeText: {
    color: Colors.accentTealMint,
    fontSize: Typography.size.caption,
    fontFamily: Fonts.semiBold,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bottomButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonText: {
    color: Colors.white,
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
  },
});
export default TripDetailsModal;
