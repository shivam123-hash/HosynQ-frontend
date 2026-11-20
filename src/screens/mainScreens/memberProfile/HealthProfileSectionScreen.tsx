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

export interface HealthProfileSectionScreenProps {
  memberName?: string;
  allowedViewerNames?: string;
  onBack?: () => void;
  onSave?: (data: any) => void;
  onItemPress?: (fieldKey: string) => void;
}

export const HealthProfileSectionScreen: React.FC<HealthProfileSectionScreenProps> = ({
  memberName = 'Aarav',
  allowedViewerNames = 'Priya and Rohan',
  onBack,
  onSave,
  onItemPress,
}) => {
  const insets = useSafeAreaInsets();

  const [healthData] = useState({
    bloodGroup: 'B+',
    allergies: 'Peanuts, dust',
    conditions: 'Mild asthma',
    medicines: 'Inhaler, when needed',
    doctor: 'Dr. Mehta · Paediatrician',
    healthInsurance: 'Star Health · in Family Vault',
    heightAndWeight: '132 cm · 28 kg · 12 Oct',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
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
          <Text style={styles.headerTitle}>Health profile</Text>
          <Text style={styles.headerSubtitle}>{`${memberName} · Section D`}</Text>
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
        {/* Privacy Lock Banner */}
        <View style={styles.privacyBanner}>
          <Feather name="lock" size={16} color="#8A97AB" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            {`Only ${allowedViewerNames} can see this.`}
          </Text>
        </View>

        {/* Health Details Card */}
        <View style={styles.card}>
          {/* Blood group */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('bloodGroup')}
            activeOpacity={0.7}
          >
            <Feather name="activity" size={18} color="#5A6880" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Blood group</Text>
              <Text style={styles.fieldValue}>{healthData.bloodGroup}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Allergies */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('allergies')}
            activeOpacity={0.7}
          >
            <Feather name="alert-circle" size={18} color="#5A6880" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Allergies</Text>
              <Text style={styles.fieldValue}>{healthData.allergies}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Conditions */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('conditions')}
            activeOpacity={0.7}
          >
            <Feather name="heart" size={18} color="#5A6880" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Conditions</Text>
              <Text style={styles.fieldValue}>{healthData.conditions}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Medicines */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('medicines')}
            activeOpacity={0.7}
          >
            <Feather name="paperclip" size={18} color="#5A6880" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Medicines</Text>
              <Text style={styles.fieldValue}>{healthData.medicines}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Doctor */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('doctor')}
            activeOpacity={0.7}
          >
            <Feather name="user" size={18} color="#5A6880" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Doctor</Text>
              <Text style={styles.fieldValue}>{healthData.doctor}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Health insurance */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('insurance')}
            activeOpacity={0.7}
          >
            <Feather name="shield" size={18} color="#5A6880" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Health insurance</Text>
              <Text style={styles.fieldValue}>{healthData.healthInsurance}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Height and weight */}
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => onItemPress && onItemPress('vitals')}
            activeOpacity={0.7}
          >
            <Feather name="edit-3" size={18} color="#5A6880" style={styles.fieldIcon} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>Height and weight</Text>
              <Text style={styles.fieldValue}>{healthData.heightAndWeight}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5A6880" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pinned Bottom Button: Save */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 6 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave && onSave(healthData)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Save health profile"
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
    color: '#8A97AB',
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
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122440',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 14,
    marginBottom: 16,
  },
  bannerIcon: {
    marginRight: 10,
  },
  bannerText: {
    fontSize: 13.5,
    color: '#8A97AB',
    fontWeight: '500',
    flex: 1,
  },
  card: {
    backgroundColor: '#122440',
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
    color: '#8A97AB',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default HealthProfileSectionScreen;
