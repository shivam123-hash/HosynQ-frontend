import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { AppConfirmationModal, ThreeDotsLoader } from '../../../components';
import ReminderPillsSelector from '../components/ReminderPillsSelector';

export interface InsuranceDetailScreenProps {
  type?: string;
  insurer?: string;
  planName?: string;
  policyNumber?: string;
  sumInsured?: string;
  premiumPerYear?: string;
  renewalDate?: string;
  saveInFamilyVault?: boolean;
  remindRenewal?: boolean;
  coveredMemberIds?: string[];
  coveredMemberNames?: string;
  reminders?: string[];
  remindAssignees?: string;
  familyMembers?: any[];
  userName?: string;
  fileName?: string;
  fileDetails?: string;
  buttonTitle?: string;
  isDeleting?: boolean;
  onBack?: () => void;
  onOptionsPress?: () => void;
  onDeletePress?: () => void;
  onViewFile?: () => void;
  onRenewPress?: () => void;
  onEditPress?: () => void;
  onSave?: (data: any) => void;
  onRemindAssignPress?: () => void;
}

const FAMILY_MEMBERS = [
  { id: '1', label: 'P', color: '#B45309' },
  { id: '2', label: 'R', color: '#1D4ED8' },
  { id: '3', label: 'A', color: '#9333EA' },
  { id: '4', label: 'Aa', color: '#CA8A04' },
  { id: '5', label: 'D', color: '#15803D' },
];

const InsuranceDetailScreen: React.FC<InsuranceDetailScreenProps> = ({
  type = 'Health',
  insurer = 'Star Health',
  planName = 'Family Floater',
  policyNumber = '•••• 5521',
  sumInsured = '₹10,00,000',
  premiumPerYear = '₹24,600',
  renewalDate = '12 Mar 2027',
  saveInFamilyVault = true,
  remindRenewal = true,
  coveredMemberIds = [],
  coveredMemberNames,
  reminders = ['1 month', '1 week'],
  remindAssignees,
  familyMembers = [],
  userName = 'Priya',
  fileName = 'Star_Health_Policy.pdf',
  fileDetails = 'Policy document · Added 12 Oct 2026',
  buttonTitle = 'Edit',
  isDeleting = false,
  onBack,
  onOptionsPress,
  onDeletePress,
  onViewFile,
  onRenewPress,
  onEditPress,
  onSave,
  onRemindAssignPress,
}) => {
  const insets = useSafeAreaInsets();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [vaultToggle, setVaultToggle] = useState(saveInFamilyVault);
  const [selectedReminders] = useState<string[]>(reminders || ['1 month', '1 week']);

  const coveredList =
    familyMembers.length > 0 && coveredMemberIds.length > 0
      ? familyMembers.filter((m: any) => coveredMemberIds.includes(m.memberId || m.id))
      : familyMembers.length > 0
      ? familyMembers
      : [{ id: '1', name: userName, fullName: userName, avatarColor: '#B45309' }];

  const assigneeNames = (remindAssignees || userName)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSave = () => {
    onSave?.({
      saveInFamilyVault: vaultToggle,
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
            {`${insurer} ${planName}`}
          </Text>
          <Text style={styles.headerSubtitleText}>For the family</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsDeleteModalVisible(true)}
          disabled={isDeleting}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Delete insurance"
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
        {/* Renewal Banner */}
        <View style={styles.renewalBanner}>
          <View style={styles.renewalIconBox}>
            <Feather name="calendar" size={18} color="#3B82F6" />
          </View>
          <View style={styles.renewalTextContainer}>
            <View style={styles.renewalTitleRow}>
              <Text style={styles.renewalTitle}>Renews on {renewalDate}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onRenewPress}
                style={styles.renewAction}
              >
                <Text style={styles.renewActionText}>Renew</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.renewalSubtitle}>
              Next premium payment of {premiumPerYear} due on {renewalDate}.
            </Text>
          </View>
        </View>

        {/* File Card */}
        <View style={styles.fileCard}>
          <View style={styles.fileIconBadge}>
            <Feather name="shield" size={18} color="#4A90E2" />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileNameText} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={styles.fileDetailsText}>{fileDetails}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onViewFile}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel="View document file"
          >
            <Feather name="eye" size={20} color="#F0913A" />
          </TouchableOpacity>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Row 1: Policy number */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="credit-card" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Policy number</Text>
              <Text style={styles.detailValue}>{policyNumber}</Text>
            </View>
            <Feather name="lock" size={15} color="#64748B" />
          </View>

          <View style={styles.divider} />

          {/* Row 2: Insurance type */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="shield" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{type} insurance</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 3: Sum insured */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="award" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Sum insured</Text>
              <Text style={styles.detailValue}>{sumInsured}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 4: Premium a year */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="tag" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Premium a year</Text>
              <Text style={styles.detailValue}>{premiumPerYear}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 5: Next renewal */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Feather name="calendar" size={17} color="#3B82F6" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Renews on</Text>
              <Text style={[styles.detailValue, { color: '#60A5FA' }]}>
                {renewalDate}
              </Text>
            </View>
          </View>
        </View>

        {/* WHO IT COVERS Card */}
        <View style={styles.coversCard}>
          <Text style={styles.coversSectionHeader}>WHO IT COVERS</Text>
          <View style={styles.coversRow}>
            {coveredList.map((m: any, idx: number) => (
              <View
                key={m.memberId || m.id || idx}
                style={[
                  styles.memberCircle,
                  {
                    backgroundColor:
                      m.avatarColor ||
                      ['#B45309', '#1D4ED8', '#9333EA', '#CA8A04', '#15803D'][idx % 5],
                  },
                ]}
              >
                <Text style={styles.memberText}>
                  {(m.fullName || m.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}
            <Text style={styles.allCoveredBadge}>
              {coveredList.length > 0 ? `${coveredList.length} Covered` : 'Covered'}
            </Text>
          </View>
          {coveredMemberNames ? (
            <Text style={styles.coveredNamesDetailText} numberOfLines={1}>
              {coveredMemberNames}
            </Text>
          ) : null}
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
                Saved in Family Vault › Insurance
              </Text>
              <Text style={styles.autoRenewalSubtitle}>
                Accessible by authorized family members
              </Text>
            </View>
            <Switch
              value={vaultToggle}
              onValueChange={setVaultToggle}
              trackColor={{ false: '#334155', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
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

      {/* Delete Insurance Confirmation Modal */}
      <AppConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Insurance Policy?"
        message="Are you sure you want to delete this insurance policy? This action cannot be undone."
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

export default InsuranceDetailScreen;

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
    fontFamily: 'Roboto-Bold',
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
  renewalBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  renewalIconBox: {
    marginRight: 10,
    marginTop: 2,
  },
  renewalTextContainer: {
    flex: 1,
  },
  renewalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  renewalTitle: {
    color: '#60A5FA',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-Bold',
  },
  renewAction: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  renewActionText: {
    color: '#FFFFFF',
    fontSize: RFValue(10.5),
    fontFamily: 'Roboto-Bold',
  },
  renewalSubtitle: {
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
    fontFamily: 'Roboto-SemiBold',
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
    marginBottom: 16,
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
    fontFamily: 'Roboto-SemiBold',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  coversCard: {
    backgroundColor: '#152033',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  coversSectionHeader: {
    color: '#F0913A',
    fontSize: RFValue(10.5),
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  coversRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  memberText: {
    color: '#FFFFFF',
    fontSize: RFValue(11),
    fontFamily: 'Roboto-Bold',
  },
  allCoveredBadge: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    fontFamily: 'Roboto-SemiBold',
    marginLeft: 4,
  },
  coveredNamesDetailText: {
    color: '#CBD5E1',
    fontSize: RFValue(12),
    fontFamily: 'Roboto-Medium',
    marginTop: 8,
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
  toggleCardContainer: {
    backgroundColor: '#152033',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontFamily: 'Roboto-SemiBold',
  },
  toggleSubtitle: {
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
});
