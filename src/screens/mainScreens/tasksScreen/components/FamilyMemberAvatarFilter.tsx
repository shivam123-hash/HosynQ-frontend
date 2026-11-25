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
import Fonts from '../../../../units/FontsStyle';
import Colors from '../../../../units/Colors';
import Typography from '../../../../units/Typography';

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
      <View style={styles.cardContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {members.map((member) => {
            const isSelected = selectedMemberId === member.id;
            const isEveryone = member.id === 'everyone';

            const avatarBgColor =
              isEveryone && isSelected
                ? Colors.primary
                : member.avatarBg;

            const avatarIconColor =
              isEveryone && isSelected
                ? Colors.background
                : member.avatarColor;

            return (
              <TouchableOpacity
                key={member.id}
                style={[styles.memberItem, isSelected && styles.selectedMemberItem]}
                onPress={() => onSelectMember(member.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Filter tasks by ${member.name}`}
              >
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: avatarBgColor },
                    isSelected && styles.selectedAvatarBorder,
                  ]}
                >
                  {isEveryone ? (
                    <Feather name="users" size={20} color={avatarIconColor} />
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
    </View>
  );
};

export default FamilyMemberAvatarFilter;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: Colors.tasksMemberFilterBg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 64,
  },
  selectedMemberItem: {
    backgroundColor: Colors.tasksMemberSelectedBg,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedAvatarBorder: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.bold,
  },
  memberName: {
    fontSize: Typography.size.bodySmall,
    color: Colors.textSecondaryMuted,
    marginTop: 6,
    textAlign: 'center',
    fontFamily: Fonts.medium,
  },
  selectedMemberName: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
});

