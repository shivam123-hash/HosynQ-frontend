import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';

export interface AddVaccineFormData {
  vaccineName: string;
  dose: string;
  lastDose: string;
  nextDue: string;
  certificateName?: string;
  remindMe: boolean;
}

export interface AddVaccineScreenProps {
  initialData?: Partial<AddVaccineFormData>;
  onClose?: () => void;
  onSave?: (data: AddVaccineFormData) => void;
  onDosePress?: () => void;
  onLastDosePress?: () => void;
  onNextDuePress?: () => void;
  onRemoveCertificate?: () => void;
}

const QUICK_VACCINES = ['Influenza', 'Typhoid', 'Tdap', 'HPV', 'Hepatitis A'];

const AddVaccineScreen: React.FC<AddVaccineScreenProps> = ({
  initialData,
  onClose,
  onSave,
  onDosePress,
  onLastDosePress,
  onNextDuePress,
  onRemoveCertificate,
}) => {
  const insets = useSafeAreaInsets();
  const [vaccineName, setVaccineName] = useState<string>(
    initialData?.vaccineName || 'Influenza',
  );
  const [dose, setDose] = useState<string>(
    initialData?.dose || 'Yearly dose',
  );
  const [lastDose, setLastDose] = useState<string>(
    initialData?.lastDose || 'Fri, 20 Oct 2026',
  );
  const [nextDue, setNextDue] = useState<string>(
    initialData?.nextDue || 'Oct 2027',
  );
  const [certificateName, setCertificateName] = useState<string | null>(
    initialData?.certificateName ?? 'Flu_certificate_2026.pdf',
  );
  const [remindMe, setRemindMe] = useState<boolean>(
    initialData?.remindMe ?? true,
  );

  const handleSave = () => {
    onSave?.({
      vaccineName,
      dose,
      lastDose,
      nextDue,
      certificateName: certificateName || undefined,
      remindMe,
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
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitleText}>Add vaccine</Text>

        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Vaccine Name Field (Orange Active Border) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Vaccine name</Text>
            <View style={[styles.inputBox, styles.inputBoxActive]}>
              <TextInput
                style={styles.textInput}
                value={vaccineName}
                onChangeText={setVaccineName}
                placeholder="Enter vaccine name"
                placeholderTextColor="#64748B"
                selectionColor="#F0913A"
              />
            </View>
          </View>

          {/* Quick Vaccine Chips */}
          <View style={styles.chipsRow}>
            {QUICK_VACCINES.map((item) => {
              const isSelected = item === vaccineName;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.7}
                  onPress={() => setVaccineName(item)}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected
                        ? styles.chipTextSelected
                        : styles.chipTextUnselected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Details Card: Dose, Last Dose, Next Due */}
          <View style={styles.cardContainer}>
            {/* Dose */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDosePress}
              style={styles.cardRow}
              accessibilityRole="button"
              accessibilityLabel={`Dose: ${dose}`}
            >
              <View style={styles.iconBox}>
                <Ionicons name="eyedrop-outline" size={17} color="#8E9BAE" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>Dose</Text>
                <Text style={styles.rowValue}>{dose}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Last dose */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onLastDosePress}
              style={styles.cardRow}
              accessibilityRole="button"
              accessibilityLabel={`Last dose: ${lastDose}`}
            >
              <View style={styles.iconBox}>
                <Feather name="calendar" size={17} color="#8E9BAE" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>Last dose</Text>
                <Text style={styles.rowValue}>{lastDose}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Next due */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNextDuePress}
              style={styles.cardRow}
              accessibilityRole="button"
              accessibilityLabel={`Next due: ${nextDue}`}
            >
              <View style={styles.iconBox}>
                <Feather name="clock" size={17} color="#8E9BAE" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>Next due · suggested</Text>
                <Text style={styles.rowValue}>{nextDue}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Attached Certificate Card */}
          {certificateName ? (
            <View style={styles.certificateCard}>
              <View style={styles.certIconBox}>
                <Feather name="file-text" size={17} color="#10B981" />
              </View>
              <View style={styles.certInfo}>
                <Text style={styles.certNameText} numberOfLines={1}>
                  {certificateName}
                </Text>
                <Text style={styles.certSubText}>Certificate · 340 KB</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setCertificateName(null);
                  onRemoveCertificate?.();
                }}
                style={styles.certRemoveButton}
                accessibilityRole="button"
                accessibilityLabel="Remove certificate"
              >
                <Feather name="x" size={16} color="#8E9BAE" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Remind Before Next Dose Switch Card */}
          <View style={styles.remindCard}>
            <View style={styles.remindTextContainer}>
              <Text style={styles.remindTitle}>
                Remind me before the next dose
              </Text>
              <Text style={styles.remindSubtitle}>
                2 weeks before · Priya, Rohan
              </Text>
            </View>
            <Switch
              value={remindMe}
              onValueChange={setRemindMe}
              trackColor={{ false: '#1E293B', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </ScrollView>

        {/* Bottom Save Vaccine Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title="Save vaccine"
            onPress={handleSave}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={54}
            borderRadius={27}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddVaccineScreen;

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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontWeight: '700',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
    height: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  fieldGroup: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11.5),
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
    borderColor: '#F0913A',
    borderWidth: 1.5,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: '#0C1E34',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipSelected: {
    backgroundColor: Colors.primary || '#F0913A',
    borderColor: Colors.primary || '#F0913A',
  },
  chipText: {
    fontSize: RFValue(12),
  },
  chipTextUnselected: {
    color: '#CBD5E1',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#071526',
    fontWeight: '700',
  },
  cardContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 6,
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
  rowLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginBottom: 2,
  },
  rowValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  certificateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1E36',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
  },
  certIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  certInfo: {
    flex: 1,
  },
  certNameText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  certSubText: {
    color: '#10B981',
    fontSize: RFValue(11),
    marginTop: 2,
  },
  certRemoveButton: {
    padding: 6,
  },
  remindCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  remindTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  remindTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  remindSubtitle: {
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
});

