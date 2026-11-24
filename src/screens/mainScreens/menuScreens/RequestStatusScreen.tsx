import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface RequestStatusScreenProps {
  onBack?: () => void;
  onCancelRequest?: () => void;
  requestId?: string;
  requestTitle?: string;
  status?: string;
}

export const RequestStatusScreen: React.FC<RequestStatusScreenProps> = ({
  onBack,
  onCancelRequest,
  requestId = 'DR-20261102-0042',
  requestTitle = 'Export my data',
  status = 'In progress',
}) => {
  const insets = useSafeAreaInsets();

  const handleCancel = () => {
    Alert.alert(
      'Cancel request',
      'Are you sure you want to cancel this data request?',
      [
        { text: 'Keep request', style: 'cancel' },
        {
          text: 'Cancel request',
          style: 'destructive',
          onPress: onCancelRequest,
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Request status</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.badgeWrapper}>
          <View style={styles.badgeInProgress}>
            <Text style={styles.badgeInProgressText}>{status}</Text>
          </View>
        </View>

        {/* Title & Request ID */}
        <Text style={styles.requestTitle}>{requestTitle}</Text>
        <Text style={styles.requestIdText}>Request ID {requestId}</Text>

        {/* Timeline / Progress Card */}
        <View style={styles.timelineCard}>
          {/* Step 1 */}
          <View style={styles.stepRow}>
            <View style={styles.iconContainer}>
              <Feather name="check-circle" size={20} color="#6FD9A6" />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Request received</Text>
              <Text style={styles.stepSubtitle}>Mon, 2 Nov · 10:30 AM</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Step 2 */}
          <View style={styles.stepRow}>
            <View style={styles.iconContainer}>
              <Feather name="check-circle" size={20} color="#6FD9A6" />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Identity checked</Text>
              <Text style={styles.stepSubtitle}>
                Mon, 2 Nov · 10:32 AM · OTP
              </Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Step 3 */}
          <View style={styles.stepRow}>
            <View style={styles.iconContainer}>
              <View style={styles.loaderArc} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Preparing your file</Text>
              <Text style={styles.stepSubtitle}>
                Usually takes up to [48] hours
              </Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Step 4 */}
          <View style={styles.stepRow}>
            <View style={styles.iconContainer}>
              <View style={styles.pendingCircle} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, { color: '#6D7D93' }]}>
                Ready to download
              </Text>
              <Text style={[styles.stepSubtitle, { color: '#5D6C83' }]}>
                We’ll notify you and email a secure link
              </Text>
            </View>
          </View>
        </View>

        {/* Lock Info Box */}
        <View style={styles.lockInfoCard}>
          <Feather name="lock" size={18} color="#8A97AB" style={{ marginRight: 12, marginTop: 2 }} />
          <Text style={styles.lockInfoText}>
            The download link works for [7] days and only after you sign in.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar with Cancel request */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Cancel request"
        >
          <Text style={styles.cancelButtonText}>Cancel request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0B1A2F',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topBarTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  topBarRightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  badgeWrapper: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badgeInProgress: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F7C08E',
    backgroundColor: 'transparent',
  },
  badgeInProgressText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
    color: '#F7C08E',
  },
  requestTitle: {
    fontSize: 28,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  requestIdText: {
    fontSize: 14,
    color: '#8A97AB',
    marginBottom: 24,
  },
  timelineCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  loaderArc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#F0923A',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  pendingCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#35455C',
    backgroundColor: 'transparent',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginHorizontal: 18,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  lockInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#122440',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 24,
  },
  lockInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#8A97AB',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    color: '#F06A6A',
  },
});
