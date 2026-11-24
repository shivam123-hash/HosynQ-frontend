import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import CommonInput from '../../../components/CommonInput';
import KeyboardAvoidingWrapper from '../../../components/KeyboardAvoidingWrapper';
import QrCodeScannerModal from '../../../components/QrCodeScannerModal';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  requestJoinFamilyThunk,
  clearJoinError,
} from '../../../redux/features/family/familySlice';
import {
  FamilyHeader,
  IdNotFoundErrorCard,
  ScanQrCodeButton,
  InviteLinkInfoCard,
} from '../components';

export const extractFamilyCode = (raw: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim();

  // If it's a URL like http://.../invite/HSQ-4821 or https://.../invite/4821
  if (trimmed.includes('/invite/')) {
    const parts = trimmed.split('/invite/');
    if (parts[1]) {
      const codePart = parts[1].split('?')[0].split('#')[0].trim();
      return codePart.toUpperCase().replace(/\s+/g, '');
    }
  }

  // If it contains JSON
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.familyCode || parsed.familyId) {
      return String(parsed.familyCode || parsed.familyId)
        .toUpperCase()
        .replace(/\s+/g, '');
    }
  } catch {}

  // If it matches pattern HSQ-\d+ or HSQ\d+
  const hsqMatch = trimmed.match(/HSQ-?\s*([A-Za-z0-9]+)/i);
  if (hsqMatch) {
    return `HSQ-${hsqMatch[1].toUpperCase()}`;
  }

  // Fallback: return cleaned string
  return trimmed.toUpperCase().replace(/\s+/g, '');
};

export interface JoinFamilyRequestResult {
  familyId: string;
  familyName: string;
  familyCode: string;
  status: string;
}

export interface JoinFamilyIdScreenProps {
  initialFamilyId?: string;
  initialShowError?: boolean;
  onBack?: () => void;
  onSendJoinRequest?: (result: JoinFamilyRequestResult) => void;
  onScanQrCode?: () => void;
}

const JoinFamilyIdScreen: React.FC<JoinFamilyIdScreenProps> = ({
  initialFamilyId = 'HSQ- 4821',
  initialShowError = false,
  onBack,
  onSendJoinRequest,
  onScanQrCode,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { joinLoading, joinError } = useAppSelector((state) => state.family);

  const [familyId, setFamilyId] = useState(initialFamilyId);
  const [showError, setShowError] = useState(initialShowError);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const executeJoinRequest = async (targetCode: string) => {
    const cleanedCode = targetCode.trim().toUpperCase().replace(/\s+/g, '');

    // If ID is completely empty, trigger error state
    if (!cleanedCode) {
      setShowError(true);
      setErrorMessage('Please enter a valid Family ID');
      return;
    }

    setShowError(false);
    setErrorMessage(null);
    dispatch(clearJoinError());

    try {
      console.log('[JoinFamilyIdScreen] Sending join request for:', cleanedCode);
      const res = await dispatch(
        requestJoinFamilyThunk({ familyCode: cleanedCode })
      ).unwrap();

      console.log('[JoinFamilyIdScreen] Join request response:', res);
      onSendJoinRequest?.({
        familyId: res.familyId,
        familyName: res.familyName,
        familyCode: res.familyCode,
        status: res.status,
      });
    } catch (err: any) {
      console.log('[JoinFamilyIdScreen] Join request failed:', err);
      setShowError(true);
      const msg =
        typeof err === 'string'
          ? err
          : "We couldn't find that Family ID. Check the code with your family.";
      setErrorMessage(msg);
    }
  };

  const handleSendRequest = () => {
    executeJoinRequest(familyId);
  };

  const handleScanSuccess = (scannedRaw: string) => {
    setIsScannerOpen(false);
    const parsedCode = extractFamilyCode(scannedRaw);
    console.log('[JoinFamilyIdScreen] Extracted family code from QR:', parsedCode);
    if (parsedCode) {
      setFamilyId(parsedCode);
      // Automatically send join request with the scanned family code!
      executeJoinRequest(parsedCode);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with Step 4 of 4 and 90% progress */}
      <FamilyHeader
        onBack={onBack}
        stepText="Step 4 of 4"
        progressPercent={90}
      />

      <KeyboardAvoidingWrapper
        style={styles.flexOne}
        contentContainerStyle={styles.scrollContent}
        extraHeight={20}
      >
        <View>
          {/* Title & Subtitle */}
          <View style={styles.headingSection}>
            <Text style={styles.title}>Join your family</Text>
            <Text style={styles.subtitle}>
              Ask whoever set up HosynQ at home for the Family ID.
            </Text>
          </View>

          {/* Family ID Input */}
          <View style={styles.inputWrapper}>
            <CommonInput
              label="Family ID"
              value={familyId}
              onChangeText={(text) => {
                setFamilyId(text);
                if (showError) setShowError(false);
                if (errorMessage) setErrorMessage(null);
                if (joinError) dispatch(clearJoinError());
              }}
              placeholder="HSQ- 4821"
              activeBorderColor={showError ? '#EF4444' : Colors.primary}
              inactiveBorderColor={
                showError ? 'rgba(239, 68, 68, 0.7)' : Colors.inputBorder
              }
            />

            {/* Helper Note (when no error) */}
            {!showError && (
              <Text style={styles.helperText}>
                It's 4 digits after HSQ-, for example HSQ-4821.
              </Text>
            )}

            {/* Error Card when Family ID is not found */}
            {showError && (
              <IdNotFoundErrorCard
                title="We couldn't find that Family ID"
                message={
                  errorMessage ||
                  joinError ||
                  'Check the 4 digits with your family, or ask them to send the invite again.'
                }
              />
            )}
          </View>

          {/* OR Divider */}
          <View style={styles.orDividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Scan QR Code Button */}
          <ScanQrCodeButton
            onPress={() => {
              if (onScanQrCode) {
                onScanQrCode();
              }
              setIsScannerOpen(true);
            }}
          />

          {/* Invite Link Info Card */}
          <InviteLinkInfoCard />
        </View>

        {/* Bottom Section: Send join request */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Send join request"
            onPress={handleSendRequest}
            loading={joinLoading}
            disabled={joinLoading}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(15)}
          />
        </View>
      </KeyboardAvoidingWrapper>

      {/* QR Code Camera Scanner Modal */}
      <QrCodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </View>
  );
};

export default JoinFamilyIdScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headingSection: {
    marginTop: 8,
    marginBottom: 28,
  },
  title: {
    fontSize: RFValue(24),
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    lineHeight: RFValue(32),
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(13.5),
    color: Colors.textSecondary,
    lineHeight: RFValue(20),
  },
  inputWrapper: {
    marginBottom: 24,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: RFValue(11.5),
    marginTop: 8,
    paddingHorizontal: 4,
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    color: Colors.textSecondary,
    fontSize: RFValue(11),
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.5,
    marginHorizontal: 16,
  },
  bottomSection: {
    width: '100%',
    paddingTop: 16,
  },
});
