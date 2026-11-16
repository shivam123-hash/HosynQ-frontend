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
  reminders?: string[];
  onBack?: () => void;
  onOptionsPress?: () => void;
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
  reminders = ['6 months', '1 month'],
  onBack,
  onOptionsPress,
  onViewFile,
  onRemindAssignPress,
  onEditPress,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedReminders, setSelectedReminders] =
    useState<string[]>(reminders);
  const [autoRenewalEnabled, setAutoRenewalEnabled] = useState<boolean>(true);

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

        {/* Remind Me Before It Expires Pills */}
        <ReminderPillsSelector
          selectedOptions={selectedReminders}
          onToggleOption={toggleReminder}
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
                <View
                  style={[styles.avatarCircle, { backgroundColor: '#78350F' }]}
                >
                  <Text style={styles.avatarText}>P</Text>
                </View>
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: '#1E40AF', marginLeft: 4 },
                  ]}
                >
                  <Text style={styles.avatarText}>R</Text>
                </View>
                <Text style={styles.avatarNamesText}>Priya, Rohan</Text>
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
                Creates tasks in Family Tasks when renewal approaches
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

      {/* Bottom Save / Done Button */}
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
});

