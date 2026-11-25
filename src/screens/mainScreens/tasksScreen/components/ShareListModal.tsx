import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppSelector } from '../../../../redux';
import { ListGroup } from '../types';

import { Colors, Fonts, Typography } from '../../../../units';

export interface ShareListModalProps {
  visible: boolean;
  list: ListGroup | null;
  onClose: () => void;
  onUpdateShare: (
    listId: string,
    sharedWith: string[],
    isSharedAll: boolean,
    memberIds?: string[]
  ) => void;
  onSendToChat?: (list: ListGroup) => void;
}

interface ShareMemberState {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  isOwner?: boolean;
}

const MEMBERS: ShareMemberState[] = [
  {
    id: 'priya',
    name: 'Priya (you)',
    initial: 'P',
    avatarBg: Colors.tripYellowBg,
    isOwner: true,
  },
  {
    id: 'rohan',
    name: 'Rohan',
    initial: 'R',
    avatarBg: Colors.tripBlueBg,
  },
  {
    id: 'dadi',
    name: 'Dadi',
    initial: 'D',
    avatarBg: Colors.tripGreenBg,
  },
  {
    id: 'anaya',
    name: 'Anaya',
    initial: 'A',
    avatarBg: Colors.tripPinkBg,
  },
  {
    id: 'aarav',
    name: 'Aarav',
    initial: 'Aa',
    avatarBg: Colors.tripYellowBg,
  },
];

const ShareListModal: React.FC<ShareListModalProps> = ({
  visible,
  list,
  onClose,
  onUpdateShare,
  onSendToChat,
}) => {
  const insets = useSafeAreaInsets();
  const familyMembers = useAppSelector(
    (state) =>
      ((state.family.myFamilyData?.family as any)?.members as any[]) ||
      ((state.family.myFamilyData as any)?.members as any[]) ||
      []
  );

  const members: ShareMemberState[] = useMemo(() => {
    if (familyMembers && familyMembers.length > 0) {
      return familyMembers.map((m: any) => {
        const rawName = m.fullName || m.name || 'Member';
        const name = m.isYou ? `${rawName} (you)` : rawName;
        return {
          id: m.memberId || m.id,
          name,
          initial: (rawName.trim()[0] || 'M').toUpperCase(),
          avatarBg: m.avatarColor || Colors.tripBlueBg,
          isOwner: Boolean(m.isYou || m.role === 'ADMIN'),
        };
      });
    }
    return MEMBERS;
  }, [familyMembers]);

  const [sharedMap, setSharedMap] = useState<Record<string, boolean>>({
    rohan: true,
    dadi: true,
    anaya: true,
    aarav: false,
  });

  React.useEffect(() => {
    if (list) {
      const initialMap: Record<string, boolean> = {};
      members.forEach((m) => {
        if (!m.isOwner) {
          initialMap[m.id] = list.isSharedWithAll
            ? true
            : list.sharedWith.some((name) =>
                name.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
              );
        }
      });
      setSharedMap(initialMap);
    }
  }, [list, visible, members]);

  if (!list) return null;

  const handleToggleMember = (id: string, value: boolean) => {
    setSharedMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleDone = () => {
    const activeNames: string[] = [];
    const activeIds: string[] = [];
    members.forEach((m) => {
      if (m.isOwner || sharedMap[m.id]) {
        activeNames.push(m.name.replace(' (you)', ''));
        activeIds.push(m.id);
      }
    });

    const isAll = activeIds.length === members.length;
    onUpdateShare(list.id, activeNames, isAll, isAll ? undefined : activeIds);
    onClose();
  };

  const handleFamilyChatPress = () => {
    if (onSendToChat) {
      onSendToChat(list);
    } else {
      Alert.alert('Shared to Family Chat', `"${list.title}" was shared to your Family Chat.`);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close share modal"
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>Share “{list.title}”</Text>
          <Text style={styles.subtitle}>
            People you share with can add and tick off items
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Member List Card */}
            <View style={styles.membersCard}>
              {members.map((member, idx) => {
                const isShared = Boolean(sharedMap[member.id]);

                return (
                  <View
                    key={member.id}
                    style={[
                      styles.memberRow,
                      idx > 0 && styles.memberRowDivider,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: member.avatarBg },
                      ]}
                    >
                      <Text style={styles.avatarText}>{member.initial}</Text>
                    </View>

                    <View style={styles.memberTextCol}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberSubtitle}>
                        {member.isOwner
                          ? 'Made this list'
                          : isShared
                          ? 'Can add and tick off'
                          : 'Not shared'}
                      </Text>
                    </View>

                    {member.isOwner ? (
                      <View style={styles.ownerBadge}>
                        <Text style={styles.ownerBadgeText}>Owner</Text>
                      </View>
                    ) : (
                      <Switch
                        value={isShared}
                        onValueChange={(val) =>
                          handleToggleMember(member.id, val)
                        }
                        trackColor={{ false: Colors.borderMutedAlt, true: Colors.primary }}
                        thumbColor={Colors.white}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Send to family chat button */}
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={handleFamilyChatPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Send to family chat"
            >
              <Feather
                name="message-square"
                size={18}
                color={Colors.primary}
                style={styles.chatIcon}
              />
              <Text style={styles.chatBtnText}>Send to family chat</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ShareListModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.tasksDarkOverlay,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: Colors.borderBold,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMutedAlt,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.size.titleLarge,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  membersCard: {
    backgroundColor: Colors.transparent,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    marginBottom: 20,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  memberRowDivider: {
    borderTopWidth: 1,
    borderColor: Colors.surfaceNavyAlt,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  memberTextCol: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  memberSubtitle: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondaryMuted,
  },
  ownerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.tasksOrangeTint,
  },
  ownerBadgeText: {
    fontSize: Typography.size.caption,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    marginBottom: 12,
  },
  chatIcon: {
    marginRight: 8,
  },
  chatBtnText: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});

