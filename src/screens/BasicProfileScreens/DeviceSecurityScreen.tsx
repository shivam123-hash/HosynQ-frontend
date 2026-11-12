import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import CommonBtn from '../../components/CommonBtn';
import { SecurityOptionCard } from './components';
import biometricService, {
  BiometricOptionType,
} from '../../units/biometricService';

export type SecurityOptionType = BiometricOptionType;

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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedSensor, setDetectedSensor] = useState<string>('Biometrics');
  const [isFaceIdDevice, setIsFaceIdDevice] = useState(false);

  useEffect(() => {
    // Detect hardware capabilities on mount
    biometricService.checkAvailability().then((res) => {
      setDetectedSensor(res.sensorName);
      if (res.biometryType === 'FaceID' || (Platform.OS === 'ios' && res.available)) {
        setIsFaceIdDevice(true);
        setSelectedSecurity('facelock');
      }
    });
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { available, sensorName } = await biometricService.checkAvailability();

      if (!available) {
        setLoading(false);
        Alert.alert(
          'Biometrics Not Active',
          `Biometric sensor (${sensorName}) was not detected. This happens when:\n1. The app needs a fresh build (run: npm run android) to include the new native package.\n2. Or your phone does not have Fingerprint/Face Lock enabled in Settings.\n\nDo you want to proceed to the next step?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setLoading(false),
            },
            {
              text: 'Proceed Anyway',
              onPress: async () => {
                await biometricService.savePreference(true, selectedSecurity);
                onContinue?.(selectedSecurity);
              },
            },
          ]
        );
        return;
      }

      const promptMsg =
        selectedSecurity === 'facelock'
          ? 'Scan Face ID to set up HosynQ lock'
          : 'Touch fingerprint sensor to set up HosynQ lock';

      console.log('[DeviceSecurityScreen] Prompting for biometric setup:', promptMsg);
      const authResult = await biometricService.authenticate(promptMsg);

      if (!authResult.success) {
        setLoading(false);
        if (authResult.cancelled) {
          console.log('[DeviceSecurityScreen] Biometric setup prompt cancelled by user');
          return;
        }
        setErrorMessage(
          authResult.error || 'Biometric verification failed. Please try again.'
        );
        return;
      }

      console.log('[DeviceSecurityScreen] ✅ Biometric setup successfully verified!');

      // Save preference so app remembers user choice on re-open
      await biometricService.savePreference(true, selectedSecurity);
      onContinue?.(selectedSecurity);
    } catch (error: any) {
      console.log('[DeviceSecurityScreen] Biometric verification warning:', error);
      setLoading(false);
      Alert.alert(
        'Setup Notice',
        error?.message || 'Biometric verification could not be completed. Please rebuild the app to load native drivers.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed',
            onPress: async () => {
              await biometricService.savePreference(true, selectedSecurity);
              onContinue?.(selectedSecurity);
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
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
          {/* Option 1: Fingerprint */}
          <SecurityOptionCard
            id="fingerprint"
            title="Fingerprint"
            description="Fastest. Uses the biometrics already on your phone."
            isRecommended={!isFaceIdDevice}
            isSelected={selectedSecurity === 'fingerprint'}
            onSelect={(id) => {
              setSelectedSecurity(id as SecurityOptionType);
              setErrorMessage(null);
            }}
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
            title={isFaceIdDevice ? 'Face ID' : 'Face lock'}
            description="Quick & secure. Uses facial recognition on your phone."
            isRecommended={isFaceIdDevice}
            isSelected={selectedSecurity === 'facelock'}
            onSelect={(id) => {
              setSelectedSecurity(id as SecurityOptionType);
              setErrorMessage(null);
            }}
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
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color="#EF4444" style={styles.errorIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <CommonBtn
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={loading}
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
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 12,
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
    fontSize: RFValue(11.5),
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  headingSection: {
    marginTop: 18,
    marginBottom: 24,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(13),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18),
  },
  optionsSection: {
    width: '100%',
    gap: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(12),
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSection: {
    width: '100%',
    paddingTop: 24,
    marginTop: 'auto',
    alignItems: 'center',
  },
  securityFooterNote: {
    color: Colors.textSecondary,
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: 14,
  },
});
