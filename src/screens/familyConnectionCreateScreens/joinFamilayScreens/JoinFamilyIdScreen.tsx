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

  const handleSendRequest = async () => {
    const cleanedCode = familyId.trim().toUpperCase().replace(/\s+/g, '');

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
          <ScanQrCodeButton onPress={onScanQrCode} />

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
    fontWeight: '700',
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
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: 16,
  },
  bottomSection: {
    width: '100%',
    paddingTop: 16,
  },
});
