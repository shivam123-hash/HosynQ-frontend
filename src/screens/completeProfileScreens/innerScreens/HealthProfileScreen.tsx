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
import CommonBtn from '../../../components/CommonBtn';
import { PersonalInfoHeader } from '../components';

export interface HealthProfileData {
  doctor: string;
  clinicLocation: string;
  hospital: string;
  allergies: string[];
  conditions: string;
  medications: string;
  checkups: string;
  eyesight: string;
}

export interface HealthProfileScreenProps {
  initialData?: Partial<HealthProfileData>;
  onBack?: () => void;
  onSave?: (data: HealthProfileData) => void;
  onDoctorPress?: () => void;
  onClinicPress?: () => void;
  onHospitalPress?: () => void;
  onAddAllergy?: () => void;
  onCheckupsPress?: () => void;
  onEyesightPress?: () => void;
}

const DEFAULT_HEALTH_DATA: HealthProfileData = {
  doctor: 'Dr. Anjali Rao · General physician',
  clinicLocation: 'Rao Clinic, Sector 47',
  hospital: 'CityCare Hospital, Sector 38',
  allergies: ['Penicillin', 'Dust'],
  conditions: 'Migraine',
  medications: 'Vitamin D · once a week',
  checkups: 'Last 12 Mar 2026 · Next Mar 2027',
  eyesight: 'Right -1.25, Left -1.00 · Glasses',
};

const HealthProfileScreen: React.FC<HealthProfileScreenProps> = ({
  initialData,
  onBack,
  onSave,
  onDoctorPress,
  onClinicPress,
  onHospitalPress,
  onAddAllergy,
  onCheckupsPress,
  onEyesightPress,
}) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<HealthProfileData>({
    ...DEFAULT_HEALTH_DATA,
    ...(initialData || {}),
  });

  const handleSave = () => {
    onSave?.(data);
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
      <PersonalInfoHeader
        title="Health profile"
        subtitle="Priya · Section 3 of 5"
        onBack={onBack}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Notice Banner */}
        <View style={styles.privacyBanner}>
          <Feather
            name="lock"
            size={14}
            color="#8E9BAE"
            style={styles.privacyIcon}
          />
          <Text style={styles.privacyText}>Only you and Rohan can see this.</Text>
        </View>

        {/* Doctor & Hospital Group Card */}
        <View style={styles.cardContainer}>
          {/* Doctor */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDoctorPress}
            style={styles.cardRow}
            accessibilityRole="button"
            accessibilityLabel={`Doctor: ${data.doctor}`}
          >
            <View style={styles.iconBox}>
              <Feather name="user" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Doctor</Text>
              <Text style={styles.valueText}>{data.doctor}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Clinic Location */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClinicPress}
            style={styles.cardRow}
            accessibilityRole="button"
            accessibilityLabel={`Clinic location: ${data.clinicLocation}`}
          >
            <View style={styles.iconBox}>
              <Feather name="map-pin" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Clinic location</Text>
              <Text style={styles.valueText}>{data.clinicLocation}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Hospital */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onHospitalPress}
            style={styles.cardRow}
            accessibilityRole="button"
            accessibilityLabel={`Hospital: ${data.hospital}`}
          >
            <View style={styles.iconBox}>
              <Feather name="plus-square" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Hospital</Text>
              <Text style={styles.valueText}>{data.hospital}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Allergies, Conditions & Medications Card */}
        <View style={styles.detailsCard}>
          {/* Allergies */}
          <Text style={styles.fieldSectionLabel}>Allergies</Text>
          <View style={styles.chipsRow}>
            {data.allergies.map((allergy) => (
              <View key={allergy} style={styles.allergyChip}>
                <Text style={styles.allergyChipText}>{allergy}</Text>
              </View>
            ))}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onAddAllergy}
              style={styles.addAllergyButton}
              accessibilityRole="button"
              accessibilityLabel="Add allergy"
            >
              <Text style={styles.addAllergyText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Conditions */}
          <Text style={[styles.fieldSectionLabel, { marginTop: 16 }]}>
            Conditions
          </Text>
          <Text style={styles.fieldValueBold}>{data.conditions}</Text>

          {/* Medications */}
          <Text style={[styles.fieldSectionLabel, { marginTop: 16 }]}>
            Medications
          </Text>
          <Text style={styles.fieldValueBold}>{data.medications}</Text>
        </View>

        {/* Checkups & Eyesight Card */}
        <View style={styles.cardContainer}>
          {/* Checkups */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onCheckupsPress}
            style={styles.cardRow}
            accessibilityRole="button"
            accessibilityLabel={`Checkups: ${data.checkups}`}
          >
            <View style={styles.iconBox}>
              <Feather name="calendar" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Checkups</Text>
              <Text style={styles.valueText}>{data.checkups}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Eyesight */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onEyesightPress}
            style={styles.cardRow}
            accessibilityRole="button"
            accessibilityLabel={`Eyesight: ${data.eyesight}`}
          >
            <View style={styles.iconBox}>
              <Feather name="eye" size={17} color="#8E9BAE" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Eyesight</Text>
              <Text style={styles.valueText}>{data.eyesight}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <CommonBtn
          title="Save"
          onPress={handleSave}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={54}
          borderRadius={27}
        />
      </View>
    </View>
  );
};

export default HealthProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2238',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 8,
  },
  privacyIcon: {
    marginRight: 10,
  },
  privacyText: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    fontWeight: '400',
  },
  cardContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 14,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginBottom: 2,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
  },
  fieldSectionLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    fontWeight: '400',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    backgroundColor: Colors.primary || '#F0913A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  allergyChipText: {
    color: '#071526',
    fontSize: RFValue(12.5),
    fontWeight: '700',
  },
  addAllergyButton: {
    backgroundColor: '#0C1E34',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  addAllergyText: {
    color: '#CBD5E1',
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
  fieldValueBold: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

