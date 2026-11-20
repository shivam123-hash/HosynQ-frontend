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
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';

export interface MemberProfileScreenProps {
  onBack?: () => void;
  onEditProfile?: () => void;
  onNavigateSection?: (sectionKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => void;
  isHealthConsentGranted?: boolean;
}

export const MemberProfileScreen: React.FC<MemberProfileScreenProps> = ({
  onBack,
  onEditProfile,
  onNavigateSection,
  isHealthConsentGranted = false,
}) => {
  const insets = useSafeAreaInsets();
  const hasConsent = isHealthConsentGranted;

  const handleSectionPress = (sectionKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => {
    if (onNavigateSection) {
      onNavigateSection(sectionKey);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Aarav’s profile</Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditProfile}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={19} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar & Info */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>Aa</Text>
          </View>
          <Text style={styles.name}>Aarav Sharma</Text>
          <Text style={styles.subtitle}>Son · 9 years · Class 4, St. Mary’s</Text>
        </View>

        {/* LIFE PROFILE Dashed Progress Box */}
        <View style={styles.progressBox}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>LIFE PROFILE</Text>
            <Text style={styles.progressPercent}>60%</Text>
          </View>

          <Text style={styles.progressTitle}>Complete your profile</Text>
          <Text style={styles.progressDescription}>
            Unlock personalised reminders and family insights.
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>

          <View style={styles.progressFooterRow}>
            <Text style={styles.progressCountText}>4 of 6 sections done</Text>
            <TouchableOpacity
              onPress={() => handleSectionPress('D')}
              activeOpacity={0.7}
            >
              <Text style={styles.progressActionText}>Add health details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6 Sections Card */}
        <View style={styles.sectionsCard}>
          {/* Section A: Personal Information */}
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => handleSectionPress('A')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Personal information section"
          >
            <View style={[styles.sectionIconBox, { borderColor: '#4285F4' }]}>
              <Feather name="user" size={20} color="#4285F4" />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>A · Personal information</Text>
              <Text style={styles.sectionSubtitle}>Complete</Text>
            </View>
            <View style={styles.badgeDone}>
              <Text style={styles.badgeDoneText}>Done</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#3F5068" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Section B: Education */}
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => handleSectionPress('B')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Education section"
          >
            <View style={[styles.sectionIconBox, { borderColor: '#4CC38A' }]}>
              <Feather name="book-open" size={19} color="#4CC38A" />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>B · Education</Text>
              <Text style={styles.sectionSubtitle}>Complete</Text>
            </View>
            <View style={styles.badgeDone}>
              <Text style={styles.badgeDoneText}>Done</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#3F5068" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Section C: Important documents */}
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => handleSectionPress('C')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Important documents section"
          >
            <View style={[styles.sectionIconBox, { borderColor: '#F06A6D' }]}>
              <Ionicons name="id-card-outline" size={20} color="#F06A6D" />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>C · Important documents</Text>
              <Text style={styles.sectionSubtitle}>3 of 4 · Passport renews Mar 2027</Text>
            </View>
            <View style={styles.badgeOrange}>
              <Text style={styles.badgeOrangeText}>3 of 4</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#3F5068" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Section D: Health profile */}
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => handleSectionPress('D')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Health profile section"
          >
            <View style={[styles.sectionIconBox, { borderColor: '#B588F7' }]}>
              <Feather name="activity" size={20} color="#B588F7" />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>D · Health profile</Text>
              <Text style={styles.sectionSubtitle}>
                {hasConsent ? 'Inhaler, Allergies' : 'Needs your consent first'}
              </Text>
            </View>
            {hasConsent ? (
              <View style={styles.badgeDone}>
                <Text style={styles.badgeDoneText}>Active</Text>
              </View>
            ) : (
              <View style={styles.badgeLocked}>
                <Feather name="lock" size={11} color="#8A9BAE" style={{ marginRight: 4 }} />
                <Text style={styles.badgeLockedText}>Locked</Text>
              </View>
            )}
            <Feather name="chevron-right" size={18} color="#3F5068" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Section E: Vaccination */}
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => handleSectionPress('E')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Vaccination section"
          >
            <View style={[styles.sectionIconBox, { borderColor: '#3CC4C4' }]}>
              <MaterialIcons name="vaccines" size={20} color="#3CC4C4" />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>E · Vaccination</Text>
              <Text style={styles.sectionSubtitle}>Flu shot due 15 Nov</Text>
            </View>
            <View style={styles.badgeOrange}>
              <Text style={styles.badgeOrangeText}>1 due</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#3F5068" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Section F: Interests and activities */}
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => handleSectionPress('F')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Interests and activities section"
          >
            <View style={[styles.sectionIconBox, { borderColor: '#F0923A' }]}>
              <Feather name="star" size={20} color="#F0923A" />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>F · Interests and activities</Text>
              <Text style={styles.sectionSubtitle}>Not started</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#3F5068" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 6,
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
  editButton: {
    position: 'absolute',
    right: 20,
    top: 6,
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
    paddingTop: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#5C4418',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F0923A',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A9BAE',
    marginTop: 4,
  },
  progressBox: {
    backgroundColor: '#0E1B2E',
    borderWidth: 1.5,
    borderColor: '#F0923A',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F0923A',
    letterSpacing: 1.2,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0923A',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  progressDescription: {
    fontSize: 13,
    color: '#8A9BAE',
    lineHeight: 18,
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#1F3352',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F0923A',
    borderRadius: 2.5,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCountText: {
    fontSize: 13,
    color: '#8A9BAE',
  },
  progressActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0923A',
  },
  sectionsCard: {
    backgroundColor: '#112239',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginRight: 14,
  },
  sectionInfo: {
    flex: 1,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  sectionSubtitle: {
    fontSize: 13.5,
    color: '#8A9BAE',
    lineHeight: 18,
  },
  badgeDone: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4CC38A',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  badgeDoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CC38A',
  },
  badgeOrange: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F0923A',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  badgeOrangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F0923A',
  },
  badgeLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2E3E55',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  badgeLockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A9BAE',
  },
  divider: {
    height: 1,
    backgroundColor: '#1A2D4B',
    width: '100%',
  },
});

export default MemberProfileScreen;
