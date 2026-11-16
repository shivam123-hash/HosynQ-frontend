import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { PersonalInfoHeader } from '../components';

export interface AadhaarFormData {
  aadhaarNumber: string;
  fullName: string;
  keepLastFourOnly: boolean;
  frontImageAdded: boolean;
  backImageAdded: boolean;
}

export interface AddAadhaarScreenProps {
  initialData?: Partial<AadhaarFormData>;
  userName?: string;
  onClose?: () => void;
  onSave?: (data: AadhaarFormData) => void;
}

export const DEFAULT_AADHAAR_DATA: AadhaarFormData = {
  aadhaarNumber: '•••• •••• 2290',
  fullName: 'Priya Sharma',
  keepLastFourOnly: true,
  frontImageAdded: true,
  backImageAdded: false,
};

const AddAadhaarScreen: React.FC<AddAadhaarScreenProps> = ({
  initialData,
  userName = 'Priya',
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<AadhaarFormData>({
    ...DEFAULT_AADHAAR_DATA,
    ...initialData,
  });

  const [showNumber, setShowNumber] = useState(false);

  const handleSave = () => {
    onSave?.(formData);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with Circular ( X ) Close Button */}
      <PersonalInfoHeader
        title="Add Aadhaar"
        subtitle={`For ${userName} · Optional`}
        onBack={onClose}
        icon="close"
      />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Info Banner */}
          <View style={styles.infoBanner}>
            <Feather
              name="info"
              size={16}
              color="#8E9BAE"
              style={{ marginTop: 2 }}
            />
            <Text style={styles.infoBannerText}>
              Optional. Add it only if it's useful to keep handy.
            </Text>
          </View>

          {/* Top Front and Back Photo Upload Cards */}
          <View style={styles.photoRow}>
            {/* Front Card */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  frontImageAdded: !prev.frontImageAdded,
                }))
              }
              style={[
                styles.photoCard,
                formData.frontImageAdded
                  ? styles.photoCardSuccess
                  : styles.photoCardEmpty,
              ]}
            >
              {formData.frontImageAdded ? (
                <>
                  <View style={styles.checkCircle}>
                    <Feather name="check" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.photoTitle}>Front added</Text>
                  <Text style={styles.photoSubtitle}>Tap to replace</Text>
                </>
              ) : (
                <>
                  <Feather name="camera" size={20} color="#F0913A" />
                  <Text style={styles.photoTitle}>Add front</Text>
                  <Text style={styles.photoSubtitle}>Tap to upload</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Back Card */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  backImageAdded: !prev.backImageAdded,
                }))
              }
              style={[
                styles.photoCard,
                formData.backImageAdded
                  ? styles.photoCardSuccess
                  : styles.photoCardEmpty,
              ]}
            >
              {formData.backImageAdded ? (
                <>
                  <View style={styles.checkCircle}>
                    <Feather name="check" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.photoTitle}>Back added</Text>
                  <Text style={styles.photoSubtitle}>Tap to replace</Text>
                </>
              ) : (
                <>
                  <Feather name="camera" size={20} color="#F0913A" />
                  <Text style={styles.photoTitle}>Add back</Text>
                  <Text style={styles.photoSubtitle}>Optional</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Aadhaar number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Aadhaar number</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.inputBox, styles.inputFlex]}
                value={
                  showNumber
                    ? formData.aadhaarNumber.replace(/•/g, '5')
                    : formData.aadhaarNumber
                }
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, aadhaarNumber: t }))
                }
                placeholder="12 digit Aadhaar number"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowNumber(!showNumber)}
                style={styles.rightIconButton}
              >
                <Feather
                  name={showNumber ? 'eye' : 'eye-off'}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>12 numbers</Text>
          </View>

          {/* Name as on Aadhaar */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Name as on Aadhaar</Text>
            <TextInput
              style={styles.inputBox}
              value={formData.fullName}
              onChangeText={(t) =>
                setFormData((prev) => ({ ...prev, fullName: t }))
              }
              placeholder="Name on card"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Keep only last 4 numbers toggle card */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>
                Keep only the last 4 numbers
              </Text>
              <Text style={styles.toggleSubtitle}>
                We'll show •••• •••• 2290 and delete the rest
              </Text>
            </View>
            <Switch
              value={formData.keepLastFourOnly}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, keepLastFourOnly: v }))
              }
              trackColor={{ false: '#334155', true: '#F0913A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </ScrollView>

        {/* Bottom Save Aadhaar Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title="Save Aadhaar"
            onPress={handleSave}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={52}
            borderRadius={26}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddAadhaarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  flexOne: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#121C2F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    color: '#8E9BAE',
    fontSize: RFValue(12),
    lineHeight: 17,
    marginLeft: 10,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoCard: {
    flex: 1,
    height: 94,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  photoCardSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  photoCardEmpty: {
    backgroundColor: '#131F35',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  photoTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  photoSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: RFValue(12),
    fontWeight: '500',
    marginBottom: 6,
  },
  inputBox: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#121C2F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputFlex: {
    flex: 1,
    paddingRight: 44,
  },
  rightIconButton: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    color: '#64748B',
    fontSize: RFValue(10.5),
    marginTop: 4,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121C2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 6,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  toggleSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 3,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background || '#0A111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

