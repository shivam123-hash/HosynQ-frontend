import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { CalendarFamilyMember } from '../types';
import { CALENDAR_FAMILY_MEMBERS } from '../mockData';

export interface CalendarMemberFilterProps {
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
  members?: CalendarFamilyMember[];
}

export const CalendarMemberFilter: React.FC<CalendarMemberFilterProps> = ({
  selectedMemberId,
  onSelectMember,
  members,
}) => {
  const isEveryone = selectedMemberId === 'everyone';
  const displayMembers =
    members && members.length > 0
      ? members
      : CALENDAR_FAMILY_MEMBERS;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Everyone Item */}
        <TouchableOpacity
          style={styles.memberItem}
          onPress={() => onSelectMember('everyone')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Filter by everyone"
        >
          <View
            style={[
              styles.avatarCircle,
              isEveryone ? styles.everyoneCircleActive : styles.everyoneCircleInactive,
              isEveryone && styles.avatarSelectedRing,
            ]}
          >
            <Feather
              name="users"
              size={18}
              color={isEveryone ? '#0B1A2F' : '#CAD4DF'}
            />
          </View>
          <Text
            style={[
              styles.memberName,
              isEveryone && styles.everyoneNameActive,
            ]}
          >
            Everyone
          </Text>
        </TouchableOpacity>

        {/* Member Avatars */}
        {displayMembers.map((member) => {
          const isSelected = selectedMemberId === member.id;
          return (
            <TouchableOpacity
              key={member.id}
              style={styles.memberItem}
              onPress={() => onSelectMember(member.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${member.name}`}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: member.color },
                  isSelected && styles.avatarSelectedRing,
                ]}
              >
                <Text
                  style={[
                    styles.avatarInitial,
                    { color: member.textColor || '#FFFFFF' },
                  ]}
                >
                  {member.initial}
                </Text>
              </View>
              <Text
                style={[
                  styles.memberName,
                  isSelected && styles.memberNameActive,
                ]}
                numberOfLines={1}
              >
                {member.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CalendarMemberFilter;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  memberItem: {
    alignItems: 'center',
    minWidth: 58,
    paddingHorizontal: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  everyoneCircleActive: {
    backgroundColor: '#F0923A',
  },
  everyoneCircleInactive: {
    backgroundColor: '#1E3A66',
  },
  avatarSelectedRing: {
    borderWidth: 2.5,
    borderColor: '#F0923A',
  },
  avatarInitial: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
  },
  memberName: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
    textAlign: 'center',
  },
  everyoneNameActive: {
    color: '#F0923A',
    fontFamily: 'Roboto-Bold',
  },
  memberNameActive: {
<<<<<<< HEAD
    color: '#F0923A',
    fontWeight: '700',
=======
    color: '#FFFFFF',
    fontFamily: 'Roboto-Bold',
>>>>>>> 6ab0bfadb2ae5506a9bb0ff92d4fa0201fc048b2
  },
});
