import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { AppConfirmationModal, ThreeDotsLoader } from '../../../components';
import ReminderPillsSelector from '../components/ReminderPillsSelector';

export interface DrivingLicenceDetailScreenProps {
  userName?: string;
  licenceNumber?: string;
  expiryDate?: string;
  rawExpiryDate?: string | Date;
  issuingRTO?: string;
  reminders?: string[];
  remindAssignees?: string;
  autoRenewalEnabled?: boolean;
  isDeleting?: boolean;
  onBack?: () => void;
  onOptionsPress?: () => void;
  onDeletePress?: () => void;
  onEditPress?: () => void;
  onRenewPress?: () => void;
  onRemindUserPress?: () => void;
  onRemindAssignPress?: () => void;
}

const parseDate = (d?: string | Date): Date | null => {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === 'string') {
    const isoMatch = d.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      return new Date(year, month, day);
    }
    const parts = d.trim().split(/\s+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const monthNames = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
      ];
      const month = monthNames.indexOf(parts[1].toLowerCase().slice(0, 3));
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month !== -1 && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const fallback = new Date(d);
    if (!isNaN(fallback.getTime())) return fallback;
  }
  return null;
};

const DrivingLicenceDetailScreen: React.FC<
  DrivingLicenceDetailScreenProps
> = ({
  userName = 'Rohan',
  licenceNumber = '•••• •••• ----',
  expiryDate = '—',
  rawExpiryDate,
  issuingRTO = 'Gurugram',
  reminders = ['6 months', '1 month'],
  remindAssignees,
  autoRenewalEnabled = true,
  isDeleting = false,
  onBack,
  onOptionsPress,
  onDeletePress,
  onEditPress,
  onRenewPress,
  onRemindUserPress,
  onRemindAssignPress,
}) => {
  const insets = useSafeAreaInsets();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedReminders] = useState<string[]>(reminders || ['6 months', '1 month']);
  const [autoRenewal, setAutoRenewal] = useState<boolean>(autoRenewalEnabled);

  const assigneeNames = (remindAssignees || userName)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const expiry = parseDate(rawExpiryDate || expiryDate);
  const now = new Date();
  const isExpired = expiry ? expiry.getTime() < now.getTime() : false;
  const diffDays = expiry
    ? Math.max(1, Math.floor((now.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleOptionsPress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleActionPress = () => {
    if (onEditPress) {
      onEditPress();
    } else if (onRenewPress) {
      onRenewPress();
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

      {/* Top Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.headerButton}
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Driving licence</Text>
          <Text style={styles.headerSubtitleText}>{userName}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsDeleteModalVisible(true)}
          disabled={isDeleting}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Delete driving licence"
        >
          {isDeleting ? (
            <ThreeDotsLoader color="#EF4444" size={5} spacing={3} />
          ) : (
            <Feather name="trash-2" size={19} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning / Expired Alert Banner (Only shown if document is actually expired) */}
        {isExpired ? (
          <View style={styles.alertBanner}>
            <View style={styles.alertIconBox}>
              <Feather name="alert-circle" size={18} color="#EF4444" />
            </View>
            <View style={styles.alertTextContainer}>
              <View style={styles.alertTitleRow}>
                <Text style={styles.alertTitle}>
                  {diffDays > 0 ? `Expired ${diffDays} days ago` : 'Expired'}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleActionPress}
                  style={styles.renewAction}
                >
                  <Text style={styles.renewActionText}>Renew</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.alertSubtitle}>
                It expired on {expiryDate}. Driving with it isn't allowed.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Card 1: Details Card */}
        <View style={styles.detailsCard}>
          {/* Row 1: Licence number */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="credit-card" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Licence number</Text>
              <Text style={styles.detailValue}>{licenceNumber}</Text>
            </View>
            <Feather name="lock" size={15} color="#64748B" />
          </View>

          <View style={styles.divider} />

          {/* Row 2: Valid till */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather
                name="clock"
                size={17}
                color={isExpired ? '#EF4444' : '#8E9BAE'}
              />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Valid till</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: isExpired ? '#EF4444' : '#FFFFFF' },
                ]}
              >
                {expiryDate}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 3: Issuing RTO */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="map-pin" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Issuing RTO</Text>
              <Text style={styles.detailValue}>{issuingRTO}</Text>
            </View>
          </View>
        </View>

        {/* Remind Me Before It Expires Pills (Read-only on Details screen) */}
        <ReminderPillsSelector
          selectedOptions={selectedReminders}
          disabled={true}
        />

        {/* Reminder Settings Card */}
        <View style={styles.reminderSettingsCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRemindAssignPress || onEditPress}
            style={styles.remindWhoRow}
          >
            <View style={styles.bellIconBox}>
              <Feather name="bell" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.remindWhoContent}>
              <Text style={styles.remindWhoLabel}>Remind</Text>
              <View style={styles.avatarsRow}>
                {assigneeNames.slice(0, 2).map((name, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: idx === 0 ? '#78350F' : '#1E40AF',
                        marginLeft: idx > 0 ? 4 : 0,
                      },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ))}
                <Text style={styles.avatarNamesText} numberOfLines={1}>
                  {remindAssignees || userName}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.autoRenewalRow}>
            <View style={styles.autoRenewalTextContainer}>
              <Text style={styles.autoRenewalTitle}>
                Add a renewal reminder automatically
              </Text>
              <Text style={styles.autoRenewalSubtitle}>
                {`Assigned to ${assigneeNames[0] || userName}, 6 months before`}
              </Text>
            </View>
            <Switch
              value={autoRenewal}
              onValueChange={setAutoRenewal}
              trackColor={{ false: '#334155', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Card 2: Task Action Card (Only shown if overdue) */}
        {isExpired ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleActionPress}
            style={styles.taskCard}
          >
            <View style={styles.taskIconBox}>
              <Feather name="check-square" size={18} color="#EF4444" />
            </View>
            <View style={styles.taskTextContainer}>
              <View style={styles.taskTitleRow}>
                <Text style={styles.taskTitle}>Renew driving licence</Text>
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueBadgeText}>Overdue</Text>
                </View>
              </View>
              <Text style={styles.taskSubtitle}>
                Expired on {expiryDate} · {userName}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {isExpired ? (
          <>
            <Text style={styles.renewedHelper}>
              Renewed? Add the new expiry date and file.
            </Text>

            <CommonBtn
              title="I've renewed it"
              onPress={handleActionPress}
              backgroundColor={Colors.primary || '#F0913A'}
              textColor="#FFFFFF"
              height={52}
              borderRadius={26}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onRemindUserPress}
              style={styles.remindButton}
            >
              <Feather name="bell" size={17} color="#F0913A" />
              <Text style={styles.remindButtonText}>Remind {userName}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <CommonBtn
            title="Edit"
            onPress={handleActionPress}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={52}
            borderRadius={26}
          />
        )}
      </View>

      {/* Delete Driving Licence Confirmation Modal */}
      <AppConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Driving Licence?"
        message="Are you sure you want to delete this driving licence? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeleting}
        iconName="trash-2"
        onConfirm={() => {
          setIsDeleteModalVisible(false);
          onDeletePress?.();
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </View>
  );
};

export default DrivingLicenceDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontFamily: 'Roboto-Bold',
  },
  headerSubtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 14,
    marginBottom: 16,
  },
  alertIconBox: {
    marginRight: 10,
    marginTop: 2,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertTitle: {
    color: '#F87171',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-Bold',
  },
  renewAction: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  renewActionText: {
    color: '#F0913A',
    fontSize: RFValue(12.5),
    fontFamily: 'Roboto-Bold',
  },
  alertSubtitle: {
    color: '#94A3B8',
    fontSize: RFValue(11.5),
    lineHeight: 16,
  },
  detailsCard: {
    backgroundColor: '#121C2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailIconBox: {
    width: 28,
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginBottom: 2,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121C2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  taskIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
  },
  overdueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  overdueBadgeText: {
    color: '#EF4444',
    fontSize: RFValue(9.5),
    fontFamily: 'Roboto-Bold',
  },
  taskSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 3,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  renewedHelper: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    textAlign: 'center',
    marginBottom: 10,
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  remindButtonText: {
    color: '#F0913A',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
    marginLeft: 8,
  },
  reminderSettingsCard: {
    backgroundColor: '#131F35',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  remindWhoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bellIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  remindWhoContent: {
    flex: 1,
  },
  remindWhoLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontFamily: 'Roboto-Medium',
    marginBottom: 4,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: RFValue(10),
    fontFamily: 'Roboto-Bold',
  },
  avatarNamesText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  autoRenewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  autoRenewalTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  autoRenewalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
    marginBottom: 2,
  },
  autoRenewalSubtitle: {
    color: '#64748B',
    fontSize: RFValue(11),
  },
});

