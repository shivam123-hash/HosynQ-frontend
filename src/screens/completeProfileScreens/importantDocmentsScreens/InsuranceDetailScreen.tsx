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
  fileName?: string;
  fileDetails?: string;
  onBack?: () => void;
  onOptionsPress?: () => void;
  onViewFile?: () => void;
  onRenewPress?: () => void;
  onEditPress?: () => void;
  onSave?: (data: any) => void;
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
  fileName = 'Star_Health_Policy.pdf',
  fileDetails = 'Policy document · Added 12 Oct 2026',
  onBack,
  onOptionsPress,
  onViewFile,
  onRenewPress,
  onEditPress,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [vaultToggle, setVaultToggle] = useState(saveInFamilyVault);
  const [remindToggle, setRemindToggle] = useState(remindRenewal);

  const handleSave = () => {
    onSave?.({
      saveInFamilyVault: vaultToggle,
      remindRenewal: remindToggle,
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
          onPress={onOptionsPress || onEditPress}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Feather name="more-horizontal" size={20} color="#FFFFFF" />
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
            {FAMILY_MEMBERS.map((m) => (
              <View
                key={m.id}
                style={[styles.memberCircle, { backgroundColor: m.color }]}
              >
                <Text style={styles.memberText}>{m.label}</Text>
              </View>
            ))}
            <Text style={styles.allCoveredBadge}>All 5 covered</Text>
          </View>
        </View>

        {/* Vault & Reminder Toggles */}
        <View style={styles.toggleCardContainer}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>
                Saved in Family Vault › Insurance
              </Text>
              <Text style={styles.toggleSubtitle}>
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

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Remind before renewal</Text>
              <Text style={styles.toggleSubtitle}>
                1 month and 1 week before renewal date
              </Text>
            </View>
            <Switch
              value={remindToggle}
              onValueChange={setRemindToggle}
              trackColor={{ false: '#334155', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="Done"
          onPress={handleSave || onBack}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={52}
          borderRadius={26}
        />
      </View>
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '700',
  },
  allCoveredBadge: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    fontWeight: '600',
    marginLeft: 4,
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
    fontWeight: '600',
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
