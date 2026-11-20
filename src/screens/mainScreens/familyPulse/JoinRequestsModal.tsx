import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export type RequestRole = 'Adult' | 'Admin';

export interface JoinRequestItem {
  id: string;
  name: string;
  phone: string;
  time: string;
  note?: string;
  isUnknown?: boolean;
  role: RequestRole;
  avatarBg: string;
  initial: string;
}

export interface JoinRequestsModalProps {
  visible: boolean;
  onClose: () => void;
  onApprove?: (item: JoinRequestItem) => void;
  onDecline?: (item: JoinRequestItem) => void;
  isScreen?: boolean;
}

const INITIAL_REQUESTS: JoinRequestItem[] = [
  {
    id: 'req-meera',
    name: 'Meera Sharma',
    phone: '+91 98··· ··210',
    time: '2 hours ago',
    note: "Hi! I'm Rohan's sister.",
    isUnknown: false,
    role: 'Adult',
    avatarBg: '#4B244A',
    initial: 'M',
  },
  {
    id: 'req-unknown',
    name: 'Unknown number',
    phone: '+91 70··· ··881',
    time: 'Yesterday',
    isUnknown: true,
    role: 'Adult',
    avatarBg: '#1E324D',
    initial: '?',
  },
];

export const JoinRequestsModal: React.FC<JoinRequestsModalProps> = ({
  visible,
  onClose,
  onApprove,
  onDecline,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<JoinRequestItem[]>(INITIAL_REQUESTS);

  const handleRoleSelect = (id: string, role: RequestRole) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, role } : r))
    );
  };

  const handleApprove = (item: JoinRequestItem) => {
    if (onApprove) {
      onApprove(item);
    } else {
      Alert.alert(
        'Request Approved',
        `${item.name} has been approved as an ${item.role}.`
      );
    }
  };

  const handleDecline = (item: JoinRequestItem) => {
    if (onDecline) {
      onDecline(item);
    } else {
      Alert.alert('Request Declined', `Declined join request from ${item.name}.`);
    }
  };

  const topPadding =
    Math.max(
      insets.top,
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 48
    ) + (Platform.OS === 'ios' ? 8 : 4);

  const mainContent = (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButtonLeft}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Join requests</Text>
      </View>

      {/* Scroll Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle Description */}
        <Text style={styles.subtitleDescription}>
          These people asked to join using your family ID HSQ-4821.
        </Text>

        {/* Request Cards */}
        {requests.map((item) => (
          <View key={item.id} style={styles.requestCard}>
            {/* Header: Avatar, Name, Phone & Time */}
            <View style={styles.cardHeaderRow}>
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: item.avatarBg },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    item.isUnknown && styles.avatarTextUnknown,
                  ]}
                >
                  {item.initial}
                </Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardSubtext}>
                  {`${item.phone} · ${item.time}`}
                </Text>
              </View>
            </View>

            {/* Note Box if provided */}
            {item.note && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteText}>
                  {`“${item.note.replace(/^["“]|["”]$/g, '')}”`}
                </Text>
              </View>
            )}

            {/* Warning Box if unknown */}
            {item.isUnknown && (
              <View style={styles.warningContainer}>
                <Feather
                  name="alert-circle"
                  size={18}
                  color="#F0913A"
                  style={styles.warningIcon}
                />
                <Text style={styles.warningText}>
                  We don't recognise this number. Check with your family before
                  approving.
                </Text>
              </View>
            )}

            {/* Join As Role Selection */}
            <View style={styles.roleSelectionRow}>
              <Text style={styles.joinAsLabel}>Join as</Text>

              <TouchableOpacity
                style={[
                  styles.roleChip,
                  item.role === 'Adult'
                    ? styles.roleChipActive
                    : styles.roleChipInactive,
                ]}
                onPress={() => handleRoleSelect(item.id, 'Adult')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Join as Adult for ${item.name}`}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    item.role === 'Adult'
                      ? styles.roleChipTextActive
                      : styles.roleChipTextInactive,
                  ]}
                >
                  Adult
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleChip,
                  item.role === 'Admin'
                    ? styles.roleChipActive
                    : styles.roleChipInactive,
                ]}
                onPress={() => handleRoleSelect(item.id, 'Admin')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Join as Admin for ${item.name}`}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    item.role === 'Admin'
                      ? styles.roleChipTextActive
                      : styles.roleChipTextInactive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons: Decline & Approve */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => handleDecline(item)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Decline ${item.name}`}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApprove(item)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Approve ${item.name}`}
              >
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Footer Notice */}
        <Text style={styles.footerNotice}>
          Only the Owner and Admins can approve requests.
        </Text>
      </ScrollView>
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerButtonLeft: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  subtitleDescription: {
    fontSize: 14,
    color: '#8A9BAE',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: '#11223A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarTextUnknown: {
    color: '#CAD4DF',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  cardSubtext: {
    fontSize: 13,
    color: '#8A9BAE',
    marginTop: 2,
  },
  noteContainer: {
    backgroundColor: '#0C182A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  noteText: {
    fontSize: 14,
    color: '#CAD4DF',
    lineHeight: 20,
  },
  warningContainer: {
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
    borderWidth: 1,
    borderColor: '#633B18',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#CAD4DF',
    lineHeight: 18,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  joinAsLabel: {
    fontSize: 13,
    color: '#CAD4DF',
    marginRight: 10,
  },
  roleChip: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: '#F0913A',
  },
  roleChipInactive: {
    backgroundColor: '#11223A',
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  roleChipTextInactive: {
    color: '#CAD4DF',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  declineButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#24364D',
    backgroundColor: '#13243B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  approveButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerNotice: {
    fontSize: 12,
    color: '#8A9BAE',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 20,
  },
});

export default JoinRequestsModal;
