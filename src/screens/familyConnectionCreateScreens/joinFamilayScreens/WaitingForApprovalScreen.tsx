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
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  getMyFamilyThunk,
  clearMyFamilyError,
} from '../../../redux/features/family/familySlice';
import {
  FamilyHeader,
  HourglassProgressCircle,
  WaitingDetailsCard,
} from '../components';

export interface WaitingForApprovalScreenProps {
  familyName?: string;
  familyId?: string;
  requestedTime?: string;
  onBack?: () => void;
  onRemindAdmin?: () => void;
  onCancelRequest?: () => void;
  onApproved?: (familyData?: any) => void;
  onRejected?: () => void;
}

const WaitingForApprovalScreen: React.FC<WaitingForApprovalScreenProps> = ({
  familyName = 'The Sharma Family',
  familyId = 'HSQ-4821',
  requestedTime = 'Today, 11:02 AM',
  onBack,
  onRemindAdmin,
  onCancelRequest,
  onApproved,
  onRejected,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { myFamilyData, myFamilyLoading, myFamilyError } = useAppSelector(
    (state) => state.family
  );

  const [reminded, setReminded] = useState(false);
  const [statusText, setStatusText] = useState<'Pending' | 'Approved' | string>(
    'Pending'
  );

  // 1. In useEffect, call GET /api/v1/family/my-family to check approval status
  useEffect(() => {
    console.log('[WaitingForApprovalScreen] Initial status check on mount...');
    checkApprovalStatus();
  }, []);

  const checkApprovalStatus = async () => {
    try {
      dispatch(clearMyFamilyError());
      const res = await dispatch(getMyFamilyThunk()).unwrap();
      console.log('[WaitingForApprovalScreen] My family status response:', res);

      // If approved and member is now in the family
      if (res.inFamily && res.family) {
        setStatusText('Approved');
        onApproved?.(res.family);
      } else if (res.pendingRequest) {
        setStatusText(res.pendingRequest.status || 'Pending');
      }
    } catch (err) {
      console.log('[WaitingForApprovalScreen] Error checking approval status:', err);
    }
  };

  const handleRefresh = () => {
    if (myFamilyLoading) return;
    console.log('[WaitingForApprovalScreen] User clicked refresh button...');
    checkApprovalStatus();
  };

  const handleRemind = () => {
    setReminded(true);
    onRemindAdmin?.();
    setTimeout(() => {
      setReminded(false);
    }, 2500);
  };

  const displayFamilyName =
    myFamilyData?.family?.name ||
    myFamilyData?.pendingRequest?.familyName ||
    familyName;

  const displayFamilyId =
    myFamilyData?.family?.familyCode ||
    myFamilyData?.pendingRequest?.familyCode ||
    familyId;

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

      {/* Refresh / Re-check Button placed right below progress bar in the right corner */}
      <View style={styles.refreshBarContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleRefresh}
          disabled={myFamilyLoading}
          style={[
            styles.refreshPill,
            myFamilyLoading && styles.refreshPillDisabled,
          ]}
        >
          {myFamilyLoading ? (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={styles.refreshIcon}
            />
          ) : (
            <Feather
              name="refresh-cw"
              size={12}
              color={Colors.primary}
              style={styles.refreshIcon}
            />
          )}
          <Text style={styles.refreshText}>
            {myFamilyLoading ? 'Checking...' : 'Refresh status'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          {/* Hourglass Graphic */}
          <HourglassProgressCircle size={88} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>
            {statusText === 'Approved' ? 'Request Approved!' : 'Waiting for approval'}
          </Text>
          <Text style={styles.subtitle}>
            {statusText === 'Approved'
              ? `You have been approved to join ${displayFamilyName}!`
              : `We've asked the admins of ${displayFamilyName}. You'll get a notification as soon as someone approves.`}
          </Text>

          {/* Details Card */}
          <WaitingDetailsCard
            familyName={displayFamilyName}
            familyId={displayFamilyId}
            requestedTime={requestedTime}
            statusText={statusText}
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          {/* Remind Admin Outlined Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRemind}
            style={[styles.remindButton, reminded && styles.remindButtonActive]}
          >
            <Feather
              name={reminded ? 'check' : 'bell'}
              size={18}
              color={reminded ? '#2DD4BF' : Colors.primary}
              style={styles.remindIcon}
            />
            <Text
              style={[
                styles.remindText,
                reminded && { color: '#2DD4BF' },
              ]}
            >
              {reminded ? 'Reminder sent to admin' : 'Remind the admin'}
            </Text>
          </TouchableOpacity>

          {/* Cancel Request Text Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onCancelRequest}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default WaitingForApprovalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  refreshBarContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 4,
  },
  refreshPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  refreshPillDisabled: {
    opacity: 0.6,
  },
  refreshIcon: {
    marginRight: 6,
  },
  refreshText: {
    color: Colors.primary,
    fontSize: RFValue(11.5),
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
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
    marginTop: 18,
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: RFValue(19),
    paddingHorizontal: 16,
  },
  bottomSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  remindButtonActive: {
    borderColor: '#2DD4BF',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  remindIcon: {
    marginRight: 8,
  },
  remindText: {
    color: Colors.primary,
    fontSize: RFValue(14.5),
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
});
