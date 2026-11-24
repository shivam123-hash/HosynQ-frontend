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

export interface DocumentDetailRemindersScreenProps {
  documentTitle?: string;
  userName?: string;
  fileName?: string;
  fileDetails?: string;
  fileUri?: string;
  documentNumber?: string;
  issuedDate?: string;
  expiryDate?: string;
  selectedReminders?: string[];
  autoRenewalEnabled?: boolean;
  remindAssignees?: string;
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

const DocumentDetailRemindersScreen: React.FC<
  DocumentDetailRemindersScreenProps
> = ({
  documentTitle = 'Passport',
  userName = 'User',
  fileName = 'Passport.pdf',
  fileDetails = '1 page · Added',
  fileUri,
  documentNumber = '•••• •••• ----',
  issuedDate = '—',
  expiryDate = '—',
  selectedReminders: initialReminders,
  autoRenewalEnabled: initialAutoRenewal,
  remindAssignees,
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
  const [selectedReminders, setSelectedReminders] = useState<string[]>(
    initialReminders && initialReminders.length > 0
      ? initialReminders
      : ['6 months', '1 month'],
  );
  const [autoRenewalEnabled, setAutoRenewalEnabled] = useState<boolean>(
    initialAutoRenewal ?? true,
  );

  React.useEffect(() => {
    if (initialReminders && initialReminders.length > 0) {
      setSelectedReminders(initialReminders);
    }
  }, [initialReminders]);

  React.useEffect(() => {
    if (initialAutoRenewal !== undefined) {
      setAutoRenewalEnabled(initialAutoRenewal);
    }
  }, [initialAutoRenewal]);

  const toggleReminder = (option: string) => {
    setSelectedReminders((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const assigneeNames = (remindAssignees || userName)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleBottomPress = () => {
    if (onEditPress) {
      onEditPress();
    } else if (onSave) {
      onSave({
        selectedReminders,
        autoRenewalEnabled,
      });
    }
  };

  const handleOptionsPress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
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
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>{documentTitle}</Text>
          <Text style={styles.headerSubtitleText}>{userName}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsDeleteModalVisible(true)}
          disabled={isDeleting}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Delete document"
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
        {/* Document File Card */}
        <View style={styles.fileCard}>
          <View style={styles.fileIconBadge}>
            <View style={styles.fileInnerCircle} />
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
              if (onViewFile) {
                onViewFile();
              }
              if (fileUri) {
                setIsImageViewerVisible(true);
              } else {
                Alert.alert('Notice', 'No photo/file attached to this document.');
              }
            }}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel="View document file"
          >
            <Feather name="eye" size={20} color="#F0913A" />
          </TouchableOpacity>
        </View>

        {/* Document Details Card */}
        <View style={styles.detailsCard}>
          {/* Row 1: Passport number */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="credit-card" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Passport number</Text>
              <Text style={styles.detailValue}>{documentNumber}</Text>
            </View>
            <Feather name="lock" size={15} color="#64748B" />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Row 2: Issued */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="calendar" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Issued</Text>
              <Text style={styles.detailValue}>{issuedDate}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Row 3: Expires */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="clock" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Expires</Text>
              <Text style={styles.detailValue}>{expiryDate}</Text>
            </View>
          </View>
        </View>

        {/* Remind Me Before It Expires Pills (Read-only on Details screen) */}
        <ReminderPillsSelector
          selectedOptions={selectedReminders}
          disabled={true}
        />

        {/* Reminder Target & Auto Renewal Card */}
        <View style={styles.reminderSettingsCard}>
          {/* Remind who */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRemindAssignPress}
            style={styles.remindWhoRow}
            accessibilityRole="button"
            accessibilityLabel={`Remind ${remindAssignees || userName}`}
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
                        backgroundColor: idx === 0 ? '#78350F' : '#2563EB',
                        marginLeft: idx > 0 ? -6 : 0,
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

          {/* Divider */}
          <View style={styles.divider} />

          {/* Auto Renewal Task Row */}
          <View style={styles.autoRenewalRow}>
            <View style={styles.autoRenewalTextContainer}>
              <Text style={styles.autoRenewalTitle}>
                Add a renewal task automatically
              </Text>
              <Text style={styles.autoRenewalSubtitle}>
                {`Assigned to ${assigneeNames[0] || userName}, 6 months before`}
              </Text>
            </View>
            <Switch
              value={autoRenewalEnabled}
              onValueChange={setAutoRenewalEnabled}
              trackColor={{ false: '#1E293B', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button (Edit / Save) */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title={buttonTitle || 'Edit'}
          onPress={handleBottomPress}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
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
              {fileName || documentTitle}
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

      {/* Delete Confirmation Modal */}
      <AppConfirmationModal
        visible={isDeleteModalVisible}
        title={`Delete ${documentTitle}?`}
        message={`Are you sure you want to delete this ${documentTitle.toLowerCase()}? This action cannot be undone.`}
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

export default DocumentDetailRemindersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
  },
  headerSubtitleText: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    marginTop: 2,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2238',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
  },
  fileIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1E324A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInnerCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  fileInfo: {
    flex: 1,
  },
  fileNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
  },
  fileDetailsText: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
  },
  eyeButton: {
    padding: 6,
  },
  detailsCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 16,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailIconBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: RFValue(14),
    fontFamily: 'Roboto-SemiBold',
  },
  reminderSettingsCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 18,
    overflow: 'hidden',
  },
  remindWhoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bellIconBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  remindWhoContent: {
    flex: 1,
  },
  remindWhoLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
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
    fontSize: RFValue(10.5),
    fontFamily: 'Roboto-Bold',
  },
  avatarNamesText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
    marginLeft: 8,
  },
  autoRenewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  autoRenewalTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  autoRenewalTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-SemiBold',
  },
  autoRenewalSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
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
    fontFamily: 'Roboto-Bold',
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

