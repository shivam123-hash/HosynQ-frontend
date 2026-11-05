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
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import { SecurityOptionCard } from './components';

export type SecurityOptionType = 'fingerprint' | 'facelock';

export interface DeviceSecurityScreenProps {
  initialOption?: SecurityOptionType;
  onBack?: () => void;
  onContinue?: (selectedOption: SecurityOptionType) => void;
}

const DeviceSecurityScreen: React.FC<DeviceSecurityScreenProps> = ({
  initialOption = 'fingerprint',
  onBack,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedSecurity, setSelectedSecurity] =
    useState<SecurityOptionType>(initialOption);

  const handleContinue = () => {
    onContinue?.(selectedSecurity);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.stepText}>Step 1 of 3</Text>
      </View>

      {/* 50% Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.progressFill50]} />
        </View>
        <Text style={styles.progressText}>50%</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Subtitle */}
        <View style={styles.headingSection}>
          <Text style={styles.title}>Lock HosynQ on this phone</Text>
          <Text style={styles.subtitle}>
            Your family's documents and locations live here.{'\n'}
            Choose how you unlock the app each time you open it.
          </Text>
        </View>

        {/* 2 Security Options (Fingerprint & Face Lock) */}
        <View style={styles.optionsSection}>
          {/* Option 1: Fingerprint (Recommended) */}
          <SecurityOptionCard
            id="fingerprint"
            title="Fingerprint"
            description="Fastest. Uses the biometrics already on your phone."
            isRecommended={true}
            isSelected={selectedSecurity === 'fingerprint'}
            onSelect={(id) => setSelectedSecurity(id as SecurityOptionType)}
            icon={
              <Ionicons
                name="finger-print-outline"
                size={24}
                color={Colors.primary}
              />
            }
          />

          {/* Option 2: Face Lock */}
          <SecurityOptionCard
            id="facelock"
            title="Face lock"
            description="Quick & secure. Uses facial recognition on your phone."
            isSelected={selectedSecurity === 'facelock'}
            onSelect={(id) => setSelectedSecurity(id as SecurityOptionType)}
            icon={
              <Ionicons
                name="scan-outline"
                size={24}
                color={Colors.primary}
              />
            }
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Continue"
            onPress={handleContinue}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />

          <Text style={styles.securityFooterNote}>
            You can change this anytime in Security.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DeviceSecurityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: RFValue(12.5),
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 12,
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
  progressFill50: {
    width: '50%',
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
  headingSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 26,
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18),
    paddingHorizontal: 12,
  },
  optionsSection: {
    width: '100%',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
  securityFooterNote: {
    color: '#6C7D93',
    fontSize: RFValue(11.5),
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '400',
  },
});

