import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface InterestsActivitiesSectionScreenProps {
  memberName?: string;
  onBack?: () => void;
  onSave?: (data: any) => void;
  onAddActivity?: () => void;
  onActivityPress?: (activityId: string) => void;
  onGoodToKnowPress?: (itemKey: string) => void;
}

const DEFAULT_INTERESTS = [
  'Cricket',
  'Chess',
  'Drawing',
  'Reading',
  'Swimming',
  'Music',
  'Coding',
];

export const InterestsActivitiesSectionScreen: React.FC<
  InterestsActivitiesSectionScreenProps
> = ({
  memberName = 'Aarav',
  onBack,
  onSave,
  onAddActivity,
  onActivityPress,
  onGoodToKnowPress,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Cricket',
    'Chess',
    'Reading',
  ]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Interests and activities</Text>
          <Text style={styles.headerSubtitle}>{`${memberName} · Section F`}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: INTERESTS */}
        <Text style={styles.sectionHeading}>INTERESTS</Text>
        <View style={styles.pillsContainer}>
          {DEFAULT_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.pill, isSelected ? styles.pillActive : styles.pillInactive]}
                onPress={() => toggleInterest(interest)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${interest} interest`}
              >
                <Text
                  style={[
                    styles.pillText,
                    isSelected ? styles.pillTextActive : styles.pillTextInactive,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 2: ACTIVITIES */}
        <Text style={[styles.sectionHeading, { marginTop: 24 }]}>ACTIVITIES</Text>
        <View style={styles.card}>
          {/* Activity 1: Chess class */}
          <TouchableOpacity
            style={styles.activityRow}
            onPress={() => onActivityPress && onActivityPress('chess')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Chess class activity"
          >
            <View style={[styles.activityIconBox, { borderColor: '#4CC38A', backgroundColor: 'transparent' }]}>
              <Feather name="target" size={18} color="#4CC38A" />
            </View>
            <View style={styles.activityInfo}>
              <View style={styles.activityTitleRow}>
                <Text style={styles.activityTitle} numberOfLines={1}>Chess class</Text>
                <View style={styles.badgeBlue}>
                  <Text style={styles.badgeBlueText}>In Calendar</Text>
                </View>
              </View>
              <Text style={styles.activitySubtitle}>Tue and Thu, 5:00 PM</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Activity 2: Cricket coaching */}
          <TouchableOpacity
            style={styles.activityRow}
            onPress={() => onActivityPress && onActivityPress('cricket')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cricket coaching activity"
          >
            <View style={[styles.activityIconBox, { borderColor: '#4CC38A', backgroundColor: 'transparent' }]}>
              <Feather name="target" size={18} color="#4CC38A" />
            </View>
            <View style={styles.activityInfo}>
              <View style={styles.activityTitleRow}>
                <Text style={styles.activityTitle} numberOfLines={1}>Cricket coaching</Text>
                <View style={styles.badgeBlue}>
                  <Text style={styles.badgeBlueText}>In Calendar</Text>
                </View>
              </View>
              <Text style={styles.activitySubtitle}>
                Sat, 7:00 AM · Sector 46 ground
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>
        </View>

        {/* Dashed "+ Add activity" Button */}
        <TouchableOpacity
          style={styles.dashedAddButton}
          onPress={onAddActivity}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add activity"
        >
          <Text style={styles.dashedAddButtonText}>+ Add activity</Text>
        </TouchableOpacity>

        {/* Section 3: GOOD TO KNOW */}
        <Text style={styles.sectionHeading}>GOOD TO KNOW</Text>
        <View style={styles.card}>
          {/* Favourite food */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onGoodToKnowPress && onGoodToKnowPress('favouriteFood')}
            activeOpacity={0.7}
          >
            <Feather name="heart" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Favourite food</Text>
              <Text style={styles.fieldValue}>Rajma chawal</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.dividerField} />

          {/* Gift ideas */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onGoodToKnowPress && onGoodToKnowPress('giftIdeas')}
            activeOpacity={0.7}
          >
            <Feather name="gift" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Gift ideas</Text>
              <Text style={styles.fieldValue}>Lego, chess books</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pinned Bottom Button: Save */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave && onSave({ selectedInterests })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Save interests and activities"
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    marginBottom: 6,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8A97AB',
    marginTop: 2,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#F0923A',
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  pillText: {
    fontSize: 14,
  },
  pillTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  pillTextInactive: {
    color: '#C8D1DC',
    fontFamily: 'Roboto-Medium',
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  activityIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  activityInfo: {
    flex: 1,
    marginRight: 12,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  badgeBlue: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5695E5',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBlueText: {
    fontSize: 11.5,
    fontFamily: 'Roboto-SemiBold',
    color: '#5B9BF1',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  dividerField: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  dashedAddButton: {
    borderWidth: 1.5,
    borderColor: '#3A4556',
    borderStyle: 'dashed',
    borderRadius: 24,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  dashedAddButtonText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0923A',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  fieldIcon: {
    marginRight: 14,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  bottomBar: {
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
});

export default InterestsActivitiesSectionScreen;
