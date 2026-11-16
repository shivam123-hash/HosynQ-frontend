import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../../units/Colors';
import { MemberWorkload } from '../types';

export interface BriefWhoWorkloadProps {
  sectionTitle?: string;
  members: MemberWorkload[];
}

const BriefWhoWorkload: React.FC<BriefWhoWorkloadProps> = ({
  sectionTitle = 'Who’s doing what',
  members,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>

      <View style={styles.card}>
        {members.map((member, index) => {
          const isLast = index === members.length - 1;
          const ratio = Math.min(1, Math.max(0, member.completedTasks / (member.totalTasks || 1)));
          const progressPercent = `${Math.round(ratio * 100)}%`;

          return (
            <View
              key={member.id}
              style={[styles.memberRow, !isLast && styles.rowMargin]}
            >
              {/* Avatar Initial Circle */}
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: member.avatarColor },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    member.textColor ? { color: member.textColor } : null,
                  ]}
                >
                  {member.initials}
                </Text>
              </View>

              {/* Member Name */}
              <Text style={styles.nameText} numberOfLines={1}>
                {member.name}
              </Text>

              {/* Progress Bar Track */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: progressPercent as any },
                  ]}
                />
              </View>

              {/* Task Count Label */}
              <Text style={styles.countLabel}>{member.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: '#B6B8B8',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 32,
  },
  rowMargin: {
    marginBottom: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  nameText: {
    width: 64,
    fontFamily: 'Roboto',
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '500',
    color: '#B6B8B8',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1F3352',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary, // #F0913A
  },
  countLabel: {
    width: 50,
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#B6B8B8',
    textAlign: 'right',
  },
});

export default memo(BriefWhoWorkload);

