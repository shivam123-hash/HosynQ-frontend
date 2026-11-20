import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface PersonalInfoSectionScreenProps {
  memberName?: string;
  onBack?: () => void;
  onSave?: (data: any) => void;
  onItemPress?: (fieldKey: string) => void;
}

export const PersonalInfoSectionScreen: React.FC<PersonalInfoSectionScreenProps> = ({
  memberName = 'Aarav',
  onBack,
  onSave,
  onItemPress,
}) => {
  const insets = useSafeAreaInsets();

  const [formData] = useState({
    fullName: 'Aarav Sharma',
    nickname: 'Aaru',
    dateOfBirth: '12 Jun 2017 · 9 years',
    gender: 'Male',
    bloodGroup: 'B+',
    languages: 'Hindi, English',
    emergencyContact: {
      initial: 'R',
      label: 'Rohan · +91 98••• ••543',
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header with Title and Subtitle */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Personal information</Text>
          <Text style={styles.headerSubtitle}>{`${memberName} · Section A`}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Full Name */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('fullName')}
            activeOpacity={0.7}
          >
            <Feather name="user" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <Text style={styles.fieldValue}>{formData.fullName}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Nickname */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('nickname')}
            activeOpacity={0.7}
          >
            <Feather name="smile" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Nickname</Text>
              <Text style={styles.fieldValue}>{formData.nickname}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Date of Birth */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('dateOfBirth')}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Date of birth</Text>
              <Text style={styles.fieldValue}>{formData.dateOfBirth}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Gender */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('gender')}
            activeOpacity={0.7}
          >
            <Feather name="user" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Gender (optional)</Text>
              <Text style={styles.fieldValue}>{formData.gender}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Blood Group */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('bloodGroup')}
            activeOpacity={0.7}
          >
            <Feather name="activity" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Blood group</Text>
              <Text style={styles.fieldValue}>{formData.bloodGroup}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Languages */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('languages')}
            activeOpacity={0.7}
          >
            <Feather name="globe" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Languages</Text>
              <Text style={styles.fieldValue}>{formData.languages}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Emergency Contact */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('emergencyContact')}
            activeOpacity={0.7}
          >
            <Feather name="phone" size={18} color="#8A9BAE" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Emergency contact</Text>
              <View style={styles.emergencyRow}>
                <View style={styles.avatarMiniCircle}>
                  <Text style={styles.avatarMiniText}>
                    {formData.emergencyContact.initial}
                  </Text>
                </View>
                <Text style={styles.fieldValue}>
                  {formData.emergencyContact.label}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#5C6E82" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pinned Bottom Button: Save */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave && onSave(formData)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Save personal information"
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    marginBottom: 6,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8A9BAE',
    marginTop: 2,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#112239',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  fieldIcon: {
    marginRight: 14,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#8A9BAE',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  avatarMiniCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A3359',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3880FF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 48,
  },
  bottomBar: {
    backgroundColor: '#0B1A2F',
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0923A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PersonalInfoSectionScreen;
