import React from 'react';
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

export interface ProfileCompleteScreenProps {
  memberName?: string;
  nextMemberName?: string;
  onDone?: () => void;
  onSetupNextMember?: () => void;
}

const SyringeIcon: React.FC<{ size?: number; color: string; style?: any }> = ({
  size = 18,
  color,
  style,
}) => {
  const scale = size / 18;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View
        style={{
          width: 18,
          height: 18,
          transform: [{ scale }, { rotate: '-45deg' }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Needle */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: 1.2,
            height: 4.5,
            backgroundColor: color,
          }}
        />
        {/* Barrel / Body */}
        <View
          style={{
            position: 'absolute',
            bottom: 4,
            width: 7,
            height: 9,
            borderWidth: 1.2,
            borderColor: color,
            borderRadius: 1,
            justifyContent: 'space-evenly',
            paddingVertical: 1,
            alignItems: 'center',
          }}
        >
          <View style={{ width: 3.5, height: 1, backgroundColor: color }} />
          <View style={{ width: 2, height: 1, backgroundColor: color }} />
        </View>
        {/* Finger Flange */}
        <View
          style={{
            position: 'absolute',
            top: 4,
            width: 9,
            height: 1.2,
            backgroundColor: color,
            borderRadius: 0.5,
          }}
        />
        {/* Plunger Stem */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: 1.5,
            height: 3,
            backgroundColor: color,
          }}
        />
        {/* Plunger Top Cap */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: 5,
            height: 1.2,
            backgroundColor: color,
            borderRadius: 0.5,
          }}
        />
      </View>
    </View>
  );
};

const ReceiptIcon: React.FC<{ size?: number; color: string }> = ({
  size = 18,
  color,
}) => (
  <View
    style={{
      width: size,
      height: size + 2,
      borderWidth: 1.5,
      borderColor: color,
      borderRadius: 2,
      borderBottomLeftRadius: 1,
      borderBottomRightRadius: 1,
      justifyContent: 'space-evenly',
      paddingHorizontal: 2.5,
      paddingVertical: 2,
      alignItems: 'center',
    }}
  >
    <View style={{ width: '80%', height: 1.5, backgroundColor: color, borderRadius: 0.5 }} />
    <View style={{ width: '80%', height: 1.5, backgroundColor: color, borderRadius: 0.5 }} />
    <View style={{ width: '50%', height: 1.5, backgroundColor: color, borderRadius: 0.5, alignSelf: 'flex-start' }} />
  </View>
);

export const ProfileCompleteScreen: React.FC<ProfileCompleteScreenProps> = ({
  memberName = 'Aarav',
  nextMemberName = 'Anaya',
  onDone,
  onSetupNextMember,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Checkmark Circle Visual */}
        <View style={styles.visualContainer}>
          <View style={styles.outerGlowCircle}>
            <View style={styles.innerCircle}>
              <Feather name="check" size={32} color="#3DC4C4" />
            </View>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>
          {`${memberName}’s profile is complete`}
        </Text>

        {/* Subtitle */}
        <Text style={styles.description}>
          HosynQ will now remind you about renewals,
          vaccines and school dates.
        </Text>

        {/* Section: WHAT HAPPENS NEXT */}
        <Text style={styles.sectionHeading}>WHAT HAPPENS NEXT</Text>
        <View style={styles.card}>
          {/* Reminder 1: Flu shot */}
          <View style={styles.reminderRow}>
            <View style={[styles.iconBox, { borderColor: '#3DC4C4', backgroundColor: 'transparent' }]}>
              <SyringeIcon size={18} color="#3DC4C4" />
            </View>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>Flu shot</Text>
              <Text style={styles.reminderSubtitle}>Reminder on Sun, 8 Nov</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Reminder 2: Passport renewal */}
          <View style={styles.reminderRow}>
            <View style={[styles.iconBox, { borderColor: '#5B9BF1', backgroundColor: 'transparent' }]}>
              <Feather name="columns" size={18} color="#5B9BF1" />
            </View>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>Passport renewal</Text>
              <Text style={styles.reminderSubtitle}>Reminder on Wed, 2 Dec</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Reminder 3: Term 2 school fee */}
          <View style={styles.reminderRow}>
            <View style={[styles.iconBox, { borderColor: '#F06A6A', backgroundColor: 'transparent' }]}>
              <ReceiptIcon size={18} color="#F06A6A" />
            </View>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>Term 2 school fee</Text>
              <Text style={styles.reminderSubtitle}>Due Fri, 11 Dec</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pinned Bottom Buttons */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onDone}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

        {nextMemberName ? (
          <TouchableOpacity
            style={styles.nextMemberButton}
            onPress={onSetupNextMember}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Set up ${nextMemberName}’s profile`}
          >
            <Text style={styles.nextMemberButtonText}>
              {`Set up ${nextMemberName}’s profile`}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  visualContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  outerGlowCircle: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 1.5,
    borderColor: 'rgba(61, 196, 196, 0.35)',
    backgroundColor: 'rgba(16, 42, 43, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#102A2B',
    borderWidth: 1.5,
    borderColor: '#3DC4C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionHeading: {
    width: '100%',
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  reminderSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
  },
  bottomBar: {
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  doneButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextMemberButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  nextMemberButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileCompleteScreen;
