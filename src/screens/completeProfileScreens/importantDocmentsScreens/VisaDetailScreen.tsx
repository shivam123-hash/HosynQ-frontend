import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { AppConfirmationModal, ThreeDotsLoader } from '../../../components';
import ReminderPillsSelector from '../components/ReminderPillsSelector';

export interface VisaDetailScreenProps {
  country?: string;
  visaType?: string;
  visaNumber?: string;
  linkedPassport?: string;
  validFrom?: string;
  validUntil?: string;
  entries?: string;
  userName?: string;
  fileName?: string;
  fileDetails?: string;
  fileUri?: string;
  reminders?: string[];
  remindAssignees?: string;
  autoRenewalEnabled?: boolean;
  buttonTitle?: string;
  isDeleting?: boolean;
  onBack?: () => void;
  onOptionsPress?: () => void;
  onDeletePress?: () => void;
  onViewFile?: () => void;
  onRemindAssignPress?: () => void;
  onEditPress?: () => void;
  onSave?: (data: any) => void;
}

const VisaDetailScreen: React.FC<VisaDetailScreenProps> = ({
  country = 'United States',
  visaType = 'Tourist or business (B1/B2)',
  visaNumber = 'H1234567',
  linkedPassport = 'Passport ending 4567',
  validFrom = '4 Mar 2017',
  validUntil = '3 Mar 2027',
  entries = 'Multiple',
  userName = 'Priya',
  fileName = 'US_Visa_Priya.pdf',
  fileDetails = '1 page · Added 12 Oct 2026',
  fileUri,
  reminders = ['6 months', '1 month'],
  remindAssignees,
  autoRenewalEnabled: initialAutoRenewal = true,
  buttonTitle = 'Edit',
  isDeleting = false,
  onBack,
  onOptionsPress,
  onDeletePress,
  onViewFile,
  onRemindAssignPress,
  onEditPress,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedReminders, setSelectedReminders] =
    useState<string[]>(reminders);
  const [autoRenewalEnabled, setAutoRenewalEnabled] = useState<boolean>(initialAutoRenewal);

  const assigneeNames = (remindAssignees || userName)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleOptionsPress = () => {
    if (onOptionsPress) {
      onOptionsPress();
    } else if (onDeletePress) {
      setIsDeleteModalVisible(true);
    }
  };

  const toggleReminder = (option: string) => {
    setSelectedReminders((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const handleSave = () => {
    onSave?.({
      selectedReminders,
      autoRenewalEnabled,
    });
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
      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>
            {country === 'United States' ? 'US visa (B1/B2)' : `${country} visa`}
          </Text>
          <Text style={styles.headerSubtitleText}>{userName}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleOptionsPress}
          disabled={isDeleting}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          {isDeleting ? (
            <ThreeDotsLoader color="#F43F5E" size={5} spacing={3} />
          ) : (
            <Feather name="more-horizontal" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Expiring Soon Alert Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertIconBox}>
            <Feather name="clock" size={18} color="#F59E0B" />
          </View>
          <View style={styles.alertTextContainer}>
            <View style={styles.alertTitleRow}>
              <Text style={styles.alertTitle}>Valid until {validUntil}</Text>
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>Soon</Text>
              </View>
            </View>
            <Text style={styles.alertSubtitle}>
              Expires in 4 months. HosynQ will remind you in advance.
            </Text>
          </View>
        </View>

        {/* File Card */}
        <View style={styles.fileCard}>
          <View style={styles.fileIconBadge}>
            <Feather name="file-text" size={18} color="#4A90E2" />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileNameText} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={styles.fileDetailsText}>{fileDetails}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (onViewFile) onViewFile();
              if (fileUri) {
                setIsImageViewerVisible(true);
              } else {
                Alert.alert('Notice', 'No photo/file attached to this visa document.');
              }
            }}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel="View document file"
          >
            <Feather name="eye" size={20} color="#F0913A" />
          </TouchableOpacity>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Row 1: Visa number */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="credit-card" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Visa number</Text>
              <Text style={styles.detailValue}>{visaNumber}</Text>
            </View>
            <Feather name="lock" size={15} color="#64748B" />
          </View>

          <View style={styles.divider} />

          {/* Row 2: Type & Entries */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="globe" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Visa type & entries</Text>
              <Text style={styles.detailValue}>
                {visaType} · {entries}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 3: Linked passport */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="book" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>On passport</Text>
              <Text style={styles.detailValue}>{linkedPassport}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 4: Valid from */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="calendar" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Valid from</Text>
              <Text style={styles.detailValue}>{validFrom}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 5: Valid until */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="clock" size={17} color="#F59E0B" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Valid until</Text>
              <Text style={[styles.detailValue, { color: '#F59E0B' }]}>
                {validUntil}
              </Text>
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
            onPress={onRemindAssignPress}
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
              value={autoRenewalEnabled}
              onValueChange={setAutoRenewalEnabled}
              trackColor={{ false: '#334155', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Save / Edit Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title={buttonTitle || 'Edit'}
          onPress={onEditPress || handleSave || onBack}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={52}
          borderRadius={26}
        />
      </View>

      {/* Full Document Photo Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <View style={styles.viewerBackdrop}>
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerTitle} numberOfLines={1}>
              {fileName || 'Visa Document'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsImageViewerVisible(false)}
              style={styles.viewerCloseBtn}
            >
              <Feather name="x" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.viewerImageContainer}>
            {fileUri ? (
              <Image
                source={{
                  uri:
                    fileUri.startsWith('file://') || fileUri.startsWith('http')
                      ? fileUri
                      : `file://${fileUri}`,
                }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.viewerEmptyText}>No preview image available</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Visa Confirmation Modal */}
      <AppConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Visa?"
        message={`Are you sure you want to delete this ${country} visa? This action cannot be undone.`}
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

export default VisaDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  headerSubtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
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
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
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
  },
  alertTitle: {
    color: '#F59E0B',
    fontSize: RFValue(13),
    fontWeight: '700',
  },
  soonBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  soonBadgeText: {
    color: '#0A111F',
    fontSize: RFValue(9),
    fontWeight: '700',
  },
  alertSubtitle: {
    color: '#CBD5E1',
    fontSize: RFValue(11),
    marginTop: 3,
    lineHeight: 16,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152033',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  fileIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  fileDetailsText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 3,
  },
  eyeButton: {
    padding: 8,
  },
  detailsCard: {
    backgroundColor: '#152033',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailIconBox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  reminderSettingsCard: {
    backgroundColor: '#152033',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
    marginBottom: 18,
  },
  remindWhoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bellIconBox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  remindWhoContent: {
    flex: 1,
  },
  remindWhoLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: RFValue(9),
    fontWeight: '700',
  },
  avatarNamesText: {
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: '500',
    marginLeft: 8,
  },
  autoRenewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  autoRenewalTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  autoRenewalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  autoRenewalSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    marginTop: 2,
    lineHeight: 15,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'space-between',
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewerTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  viewerCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerEmptyText: {
    color: '#8E9BAE',
    fontSize: RFValue(14),
  },
});

