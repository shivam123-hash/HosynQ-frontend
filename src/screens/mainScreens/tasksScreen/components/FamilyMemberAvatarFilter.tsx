import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { FamilyMemberOption } from '../types';

export interface FamilyMemberAvatarFilterProps {
  members: FamilyMemberOption[];
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
}

const FamilyMemberAvatarFilter: React.FC<FamilyMemberAvatarFilterProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {members.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const isEveryone = member.id === 'everyone';

          return (
            <TouchableOpacity
              key={member.id}
              style={styles.memberItem}
              onPress={() => onSelectMember(member.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Filter tasks by ${member.name}`}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: member.avatarBg },
                  isSelected && styles.selectedAvatarBorder,
                ]}
              >
                {isEveryone ? (
                  <Feather name="users" size={20} color={member.avatarColor} />
                ) : (
                  <Text
                    style={[
                      styles.avatarText,
                      { color: member.avatarColor },
                    ]}
                  >
                    {member.initial}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.memberName,
                  isSelected && styles.selectedMemberName,
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

export default FamilyMemberAvatarFilter;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberItem: {
    alignItems: 'center',
    width: 56,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAvatarBorder: {
    borderWidth: 2.5,
    borderColor: '#F0913A',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 12,
    color: '#8A97AB',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedMemberName: {
    color: '#F0913A',
    fontWeight: '700',
  },
});

