import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import WorkLocationMapCard from './WorkLocationMapCard';

export interface WorkDetails {
  company: string;
  role: string;
  officeLocation: string;
  workHours: string;
}

export interface WorkDetailsSectionProps {
  sectionTitle?: string;
  details?: Partial<WorkDetails>;
  onChangeCompany?: (value: string) => void;
  onChangeRole?: (value: string) => void;
  onChangeLocation?: (value: string) => void;
  onWorkHoursPress?: () => void;
  onMapPress?: () => void;
}

const DEFAULT_WORK_DETAILS: WorkDetails = {
  company: 'Kaveri Design Studio',
  role: 'Interior designer',
  officeLocation: 'Udyog Vihar Phase 4, Gurugram',
  workHours: 'Mon to Sat, 10:00 AM to 6:30 PM',
};

const WorkDetailsSection: React.FC<WorkDetailsSectionProps> = ({
  sectionTitle = 'WORK',
  details = DEFAULT_WORK_DETAILS,
  onChangeCompany,
  onChangeRole,
  onChangeLocation,
  onWorkHoursPress,
  onMapPress,
}) => {
  const companyValue = details.company ?? DEFAULT_WORK_DETAILS.company;
  const roleValue = details.role ?? DEFAULT_WORK_DETAILS.role;
  const locationValue =
    details.officeLocation ?? DEFAULT_WORK_DETAILS.officeLocation;
  const hoursValue = details.workHours ?? DEFAULT_WORK_DETAILS.workHours;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      {sectionTitle ? (
        <Text style={styles.sectionHeader}>{sectionTitle}</Text>
      ) : null}

      {/* Company Input */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Company</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={companyValue}
            onChangeText={onChangeCompany}
            placeholder="Enter company name"
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      {/* Role Input */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Role</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={roleValue}
            onChangeText={onChangeRole}
            placeholder="Enter role or designation"
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      {/* Office Location Input (Highlighted with Orange Border) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Office location</Text>
        <View style={[styles.inputBox, styles.inputBoxActive]}>
          <Feather
            name="map-pin"
            size={16}
            color="#94A3B8"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.textInput, styles.textInputWithIcon]}
            value={locationValue}
            onChangeText={onChangeLocation}
            placeholder="Search office location"
            placeholderTextColor="#64748B"
            selectionColor="#F0913A"
          />
        </View>
      </View>

      {/* Stylized Map View Mockup */}
      <WorkLocationMapCard onPress={onMapPress} />

      {/* Work Hours Row Card */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onWorkHoursPress}
        style={styles.workHoursCard}
        accessibilityRole="button"
        accessibilityLabel={`Work hours: ${hoursValue}`}
      >
        <View style={styles.clockIconContainer}>
          <Feather name="clock" size={18} color="#8E9BAE" />
        </View>

        <View style={styles.workHoursContent}>
          <Text style={styles.workHoursLabel}>Work hours</Text>
          <Text style={styles.workHoursValue} numberOfLines={1}>
            {hoursValue}
          </Text>
        </View>

        <Feather name="chevron-right" size={18} color="#64748B" />
      </TouchableOpacity>

      {/* Compass Helper Note */}
      <Text style={styles.helperNote}>
        Your office location lets Compass tell your family when you leave work.
      </Text>
    </View>
  );
};

export default WorkDetailsSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionHeader: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 14,
  },
  fieldGroup: {
    marginHorizontal: 20,
    marginBottom: 14,
  },
  fieldLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
    fontWeight: '400',
    marginBottom: 6,
  },
  inputBox: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0B1E36',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputBoxActive: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#F0913A',
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  textInputWithIcon: {
    flex: 1,
  },
  workHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1E36',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
  },
  clockIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workHoursContent: {
    flex: 1,
  },
  workHoursLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '400',
  },
  workHoursValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
    marginTop: 2,
  },
  helperNote: {
    color: '#64748B',
    fontSize: RFValue(11.5),
    lineHeight: 18,
    marginTop: 12,
    marginHorizontal: 22,
  },
});

