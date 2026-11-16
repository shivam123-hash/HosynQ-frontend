import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  previewInvitationThunk,
  requestJoinFamilyThunk,
  clearJoinError,
  clearPreviewError,
} from '../../../redux/features/family/familySlice';
import {
  FamilyHeader,
  FamilyAvatarCluster,
  FamilyDetailsCard,
} from '../components';

export interface FamilyInviteFoundScreenProps {
  familyName?: string;
  inviterName?: string;
  familyId?: string;
  memberCount?: string;
  sentTime?: string;
  inviteToken?: string;
  onBack?: () => void;
  onAskToJoin?: (response?: any) => void;
  onNotMyFamily?: () => void;
}

const FamilyInviteFoundScreen: React.FC<FamilyInviteFoundScreenProps> = ({
  familyName = 'The Sharma Family',
  inviterName = 'Priya',
  familyId = 'HSQ-4821',
  memberCount = '5 people',
  sentTime = 'Today, 10:48 AM',
  inviteToken,
  onBack,
  onAskToJoin,
  onNotMyFamily,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { previewData, previewLoading, previewError, joinLoading, joinError } =
    useAppSelector((state) => state.family);
  const [localJoinError, setLocalJoinError] = useState<string | null>(null);

  // 1. In useEffect, call the preview API if inviteToken is present
  useEffect(() => {
    if (inviteToken) {
      console.log('[FamilyInviteFoundScreen] Previewing invite for token:', inviteToken);
      dispatch(clearPreviewError());
      dispatch(previewInvitationThunk({ inviteToken }));
    }
  }, [inviteToken, dispatch]);

  const displayFamilyName = previewData?.familyName || familyName;
  const displayInviterName = previewData?.invitedBy || inviterName;
  const displayMemberCount = previewData?.memberCount
    ? `${previewData.memberCount} people`
    : memberCount;
  const displayFamilyId = previewData?.familyCode || familyId;
  const primaryInitial = displayFamilyName.charAt(0).toUpperCase() || 'S';

  // 2. On "Ask to join" button press, send join request with inviteToken
  const handleAskToJoin = async () => {
    setLocalJoinError(null);
    dispatch(clearJoinError());

    const tokenToSend = inviteToken || familyId;
    if (!tokenToSend) {
      setLocalJoinError('Invite token or link is required.');
      return;
    }

    try {
      console.log(
        '[FamilyInviteFoundScreen] Sending join request with inviteToken:',
        tokenToSend
      );
      const res = await dispatch(
        requestJoinFamilyThunk({ inviteToken: tokenToSend })
      ).unwrap();

      console.log('[FamilyInviteFoundScreen] Join request successful:', res);
      onAskToJoin?.(res);
    } catch (err: any) {
      console.log('[FamilyInviteFoundScreen] Join request failed:', err);
      const msg =
        typeof err === 'string'
          ? err
          : 'Failed to submit join request. Please try again.';
      setLocalJoinError(msg);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={90}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          {/* Overlapping Avatar Cluster */}
          <FamilyAvatarCluster primaryInitial={primaryInitial} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>
            {displayInviterName} invited you to {displayFamilyName}
          </Text>

          {previewLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading family details...</Text>
            </View>
          ) : (
            <Text style={styles.subtitle}>
              Join to share tasks, plans and check-ins with everyone at home.
            </Text>
          )}

          {/* Family Details Card Table */}
          <FamilyDetailsCard
            familyId={displayFamilyId}
            memberCount={displayMemberCount}
            invitedBy={`${displayInviterName} · Owner`}
            sentTime={sentTime}
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          {/* Error Banner */}
          {localJoinError || joinError || previewError ? (
            <View style={styles.errorContainer}>
              <Feather
                name="alert-circle"
                size={14}
                color="#EF4444"
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>
                {localJoinError || joinError || previewError}
              </Text>
            </View>
          ) : null}

          <CommonBtn
            title="Ask to join"
            onPress={handleAskToJoin}
            loading={joinLoading}
            disabled={joinLoading}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />

          <Text style={styles.adminApprovalNote}>
            {displayInviterName} or another admin approves your request.
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotMyFamily}
            style={styles.notMyFamilyButton}
          >
            <Text style={styles.notMyFamilyText}>This isn't my family</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default FamilyInviteFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: RFValue(28),
    marginTop: 6,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: RFValue(19),
    paddingHorizontal: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: RFValue(12),
    color: Colors.textSecondary,
  },
  bottomSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(12),
    fontWeight: '500',
    textAlign: 'center',
  },
  adminApprovalNote: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  notMyFamilyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  notMyFamilyText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
    textAlign: 'center',
  },
});
