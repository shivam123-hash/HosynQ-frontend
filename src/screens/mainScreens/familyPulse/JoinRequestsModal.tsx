import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector, RootState } from '../../../redux/store';
import {
  fetchJoinRequestsThunk,
  approveJoinRequestThunk,
  rejectJoinRequestThunk,
} from '../../../redux/features/family/familySlice';
import { JoinRequestsSkeleton } from '../../../components/SkeletonLoader';

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
  initialRequests?: JoinRequestItem[];
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
  initialRequests,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const {
    pendingRequests,
    requestsLoading,
    family,
    myFamilyData,
  } = useAppSelector((state) => state.family);

  const [selectedRoles, setSelectedRoles] = useState<Record<string, RequestRole>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    if (visible || isScreen) {
      dispatch(fetchJoinRequestsThunk());
    }
  }, [visible, isScreen, dispatch]);

  const familyCode =
    myFamilyData?.family?.familyCode || family?.familyCode || 'HSQ-FAMILY';

  const handleRoleSelect = (id: string, role: RequestRole) => {
    setSelectedRoles((prev) => ({ ...prev, [id]: role }));
  };

  const handleApprove = async (item: JoinRequestItem) => {
    if (onApprove) {
      onApprove(item);
      return;
    }

    setApprovingId(item.id);
    const assignedRole = item.role === 'Admin' ? 'FAMILY_ADMIN' : 'ADULT_MEMBER';
    try {
      await dispatch(
        approveJoinRequestThunk({ requestId: item.id, role: assignedRole })
      ).unwrap();
      Alert.alert(
        'Request Approved',
        `${item.name} has been approved as an ${item.role}.`
      );
    } catch (err: any) {
      Alert.alert('Approval Failed', err || 'Could not approve join request.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDecline = async (item: JoinRequestItem) => {
    if (onDecline) {
      onDecline(item);
      return;
    }

    setRejectingId(item.id);
    try {
      await dispatch(rejectJoinRequestThunk(item.id)).unwrap();
      Alert.alert('Request Declined', `Declined join request from ${item.name}.`);
    } catch (err: any) {
      Alert.alert('Decline Failed', err || 'Could not decline join request.');
    } finally {
      setRejectingId(null);
    }
  };

  const effectiveRequests =
    pendingRequests && pendingRequests.length > 0
      ? pendingRequests
      : (initialRequests || INITIAL_REQUESTS);

  const requests: JoinRequestItem[] = effectiveRequests.map((req: any, index: number) => {
    const role = selectedRoles[req.id] || req.role || 'Adult';
    const initial = req.initial || (req.fullName
      ? req.fullName.trim().charAt(0).toUpperCase()
      : '?');
    const isUnknown = req.isUnknown !== undefined
      ? req.isUnknown
      : (!req.fullName || req.fullName.toLowerCase().includes('unknown'));

    let formattedTime = req.time || 'Recently';
    if (req.createdAt) {
      if (typeof req.createdAt === 'string' && (req.createdAt.includes('ago') || req.createdAt.includes('Yesterday'))) {
        formattedTime = req.createdAt;
      } else {
        try {
          const d = new Date(req.createdAt);
          if (!isNaN(d.getTime())) {
            formattedTime = d.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });
          }
        } catch (e) {
          formattedTime = req.createdAt;
        }
      }
    }

    const requestId = req.id || req.requestId || req._id || `request-${index}`;

    return {
      id: String(requestId),
      name: req.fullName || req.name || 'Unknown Applicant',
      phone: req.phoneNumber || req.phone || 'No phone provided',
      time: formattedTime,
      note: req.message || req.note || undefined,
      isUnknown,
      role,
      avatarBg: req.avatarBg || req.avatarColor || '#215C33',
      initial,
    };
  });

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

      {/* Loading Skeleton */}
      {requestsLoading && requests.length === 0 ? (
        <JoinRequestsSkeleton />
      ) : (
        /* Scroll Content */
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
            {`These people asked to join using your family ID ${familyCode}.`}
          </Text>

          {requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="check-circle" size={42} color="#10B981" />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                There are no pending join requests to review right now.
              </Text>
            </View>
          ) : (
            /* Request Cards */
            requests.map((item, index) => {
              const isApproving = approvingId === item.id;
              const isRejecting = rejectingId === item.id;
              const isBusy = isApproving || isRejecting;

              return (
                <View key={item.id || `request-card-${index}`} style={styles.requestCard}>
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
                      disabled={isBusy}
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
                      disabled={isBusy}
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
                      style={[styles.declineButton, isBusy && styles.buttonDisabled]}
                      onPress={() => handleDecline(item)}
                      disabled={isBusy}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Decline ${item.name}`}
                    >
                      {isRejecting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.declineButtonText}>Decline</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.approveButton, isBusy && styles.buttonDisabled]}
                      onPress={() => handleApprove(item)}
                      disabled={isBusy}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel={`Approve ${item.name}`}
                    >
                      {isApproving ? (
                        <ActivityIndicator size="small" color="#0B1A2F" />
                      ) : (
                        <Text style={styles.approveButtonText}>Approve</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          {/* Footer Notice */}
          <Text style={styles.footerNotice}>
            Only the Owner and Admins can approve requests.
          </Text>
        </ScrollView>
      )}
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
    fontFamily: 'Roboto-Bold',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A9BAE',
    textAlign: 'center',
    lineHeight: 20,
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  cardSubtext: {
    fontSize: 13,
    color: '#8A9BAE',
    marginTop: 3,
  },
  noteContainer: {
    backgroundColor: '#14253E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#233754',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  noteText: {
    fontSize: 13,
    color: '#C8D1DC',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    gap: 10,
  },
  warningIcon: {
    flexShrink: 0,
  },
  warningText: {
    flex: 1,
    fontSize: 12.5,
    color: '#F0913A',
    lineHeight: 17,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  joinAsLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#8A9BAE',
    marginRight: 4,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.2,
  },
  roleChipActive: {
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderColor: '#F0913A',
  },
  roleChipInactive: {
    backgroundColor: '#14253E',
    borderColor: '#233754',
  },
  roleChipText: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
  },
  roleChipTextActive: {
    color: '#0B1A2F',
    fontFamily: 'Roboto-Bold',
  },
  roleChipTextInactive: {
    color: '#8A9BAE',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  declineButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A4556',
    backgroundColor: '#14253E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
  },
  approveButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButtonText: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  footerNotice: {
    fontSize: 12.5,
    color: '#637488',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default JoinRequestsModal;