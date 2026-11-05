import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import { InterestsPicker, DEFAULT_INTERESTS } from './components';

export interface CompleteProfileStep5ScreenProps {
  initialInterests?: string[];
  onBack?: () => void;
  onEnterHosynQ?: (selectedInterests: string[]) => void;
}

const CompleteProfileStep5Screen: React.FC<CompleteProfileStep5ScreenProps> = ({
  initialInterests = [],
  onBack,
  onEnterHosynQ,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests);

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const handleEnter = () => {
    onEnterHosynQ?.(selectedInterests);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header with Back Button */}
      {onBack && (
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Screen Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Unlock personalized reminders & family insights</Text>
      </View>

      {/* Progress Bar (100%) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.progressFill100]} />
        </View>
        <Text style={styles.progressText}>100%</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topContent}>
          {/* Instructions Prompt */}
          <Text style={styles.instructionsText}>
            Select your interests for future recommendations and family activity planning.
          </Text>

          {/* Interests Pill Chips */}
          <InterestsPicker
            selectedInterests={selectedInterests}
            onToggleInterest={handleToggleInterest}
            interestsList={DEFAULT_INTERESTS}
          />
        </View>

        {/* Enter HosynQ Button */}
        <View style={styles.buttonSection}>
          <CommonBtn
            title="Enter HosynQ"
            onPress={handleEnter}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default CompleteProfileStep5Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: RFValue(11.5),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 14,
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#16283E',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressFill100: {
    width: '100%',
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: RFValue(11),
    fontWeight: '600',
    marginLeft: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topContent: {
    width: '100%',
  },
  instructionsText: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    lineHeight: RFValue(18),
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  buttonSection: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 32,
    marginBottom: 10,
  },
});

