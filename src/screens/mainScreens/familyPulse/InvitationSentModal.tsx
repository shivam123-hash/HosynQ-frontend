import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface InvitationSentModalProps {
  visible: boolean;
  onClose: () => void;
  inviteeName?: string;
  inviteePhone?: string;
  role?: string;
  timeText?: string;
  initial?: string;
  avatarBg?: string;
  onShareLink?: () => void;
  onInviteAnother?: () => void;
  isScreen?: boolean;
}

export const InvitationSentModal: React.FC<InvitationSentModalProps> = ({
  visible,
  onClose,
  inviteeName = 'Meera',
  inviteePhone = '+91 98765 43210',
  role = 'Adult',
  timeText = 'Invited just now',
  initial = 'M',
  avatarBg = '#3A2A4A',
  onShareLink,
  onInviteAnother,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();

  const handleShareLink = () => {
    if (onShareLink) {
      onShareLink();
    } else {
      Alert.alert(
        'Invite Link',
        'Invite link copied: https://hosynq.app/join/HSQ-4821'
      );
    }
  };

  const handleInviteAnother = () => {
    if (onInviteAnother) {
      onInviteAnother();
    } else {
      onClose();
    }
  };

  const topPadding =
    Math.max(
      insets.top,
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 48
    ) + (Platform.OS === 'ios' ? 8 : 4);

  const mainContent = (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Scrollable Center Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(topPadding, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Concentric Checkmark Circles */}
        <View style={styles.outerCircle}>
          <View style={styles.middleCircle}>
            <View style={styles.innerCheckCircle}>
              <Feather name="check" size={18} color="#6FDAA6" />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.headlineText}>
          {`Invite sent to ${inviteeName}`}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>
          {`We texted ${inviteePhone}. The invite works\nfor [7] days.`}
        </Text>

        {/* Invitee Card */}
        <View style={styles.inviteeCard}>
          <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.inviteeInfo}>
            <Text style={styles.inviteeName}>{inviteeName}</Text>
            <Text style={styles.inviteeSubtext}>{`${role} · ${timeText}`}</Text>
          </View>

          <View style={styles.waitingBadge}>
            <Text style={styles.waitingBadgeText}>Waiting</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pinned Bottom Actions Container with top divider line */}
      <View
        style={[
          styles.bottomActionsContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 4 },
        ]}
      >
        {/* Done Button */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onClose}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

        {/* Share Invite Link Button */}
        <TouchableOpacity
          style={styles.shareLinkButton}
          onPress={handleShareLink}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Share invite link"
        >
          <Feather
            name="link-2"
            size={18}
            color="#F0913A"
            style={styles.buttonIcon}
          />
          <Text style={styles.shareLinkButtonText}>Share invite link</Text>
        </TouchableOpacity>

        {/* Invite someone else */}
        <TouchableOpacity
          style={styles.inviteAnotherButton}
          onPress={handleInviteAnother}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Invite someone else"
        >
          <Text style={styles.inviteAnotherText}>Invite someone else</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isScreen) {
    return mainContent;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {mainContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(111, 218, 166, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  middleCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#6FDAA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCheckCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#6FDAA6',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineText: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 14,
    color: '#8997AB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 44,
  },
  inviteeCard: {
    width: '100%',
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A2A4A',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#D4B8F5',
  },
  inviteeInfo: {
    flex: 1,
    marginLeft: 14,
  },
  inviteeName: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  inviteeSubtext: {
    fontSize: 13,
    color: '#8997AB',
    marginTop: 3,
  },
  waitingBadge: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F7C08E',
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  waitingBadgeText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  bottomActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    backgroundColor: '#0B1A2F',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  doneButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  shareLinkButton: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  shareLinkButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  inviteAnotherButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 6,
  },
  inviteAnotherText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#F0913A',
  },
});

export default InvitationSentModal;
