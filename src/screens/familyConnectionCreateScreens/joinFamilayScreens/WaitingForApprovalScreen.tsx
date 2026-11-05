import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
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
  onApproved?: () => void;
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
  const [reminded, setReminded] = useState(false);

  const handleRemind = () => {
    setReminded(true);
    onRemindAdmin?.();
    setTimeout(() => {
      setReminded(false);
    }, 2500);
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
          {/* Hourglass Graphic */}
          <HourglassProgressCircle size={88} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>Waiting for approval</Text>
          <Text style={styles.subtitle}>
            We've asked the admins of {familyName}. You'll get a notification as
            soon as someone approves.
          </Text>

          {/* Details Card */}
          <WaitingDetailsCard
            familyName={familyName}
            familyId={familyId}
            requestedTime={requestedTime}
            statusText="Pending"
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
    marginTop: 10,
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
    marginTop: 24,
    alignItems: 'center',
  },
  remindButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindButtonActive: {
    borderColor: '#2DD4BF',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  remindIcon: {
    marginRight: 10,
  },
  remindText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: RFValue(13.5),
    fontWeight: '500',
    textAlign: 'center',
  },
});

