import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { CALENDAR_FAMILY_MEMBERS } from '../mockData';

export interface CalendarMemberFilterProps {
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
}

export const CalendarMemberFilter: React.FC<CalendarMemberFilterProps> = ({
  selectedMemberId,
  onSelectMember,
}) => {
  const isEveryone = selectedMemberId === 'everyone';

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
              styles.everyoneCircle,
              isEveryone && styles.avatarSelectedRing,
            ]}
          >
            <Feather name="users" size={18} color="#0B1A2F" />
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
        {CALENDAR_FAMILY_MEMBERS.map((member) => {
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
  everyoneCircle: {
    backgroundColor: '#F0923A',
  },
  avatarSelectedRing: {
    borderWidth: 2,
    borderColor: '#F0923A',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A97AB',
    textAlign: 'center',
  },
  everyoneNameActive: {
    color: '#F0923A',
    fontWeight: '700',
  },
  memberNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
