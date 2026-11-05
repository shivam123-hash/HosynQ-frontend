import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import CommonInput from '../../../components/CommonInput';
import KeyboardAvoidingWrapper from '../../../components/KeyboardAvoidingWrapper';
import { AccountAlreadyExistsModal } from './components';

export interface AddMobileNumberScreenProps {
  email?: string;
  defaultPhoneNumber?: string;
  onBack?: () => void;
  onSendCode?: (phoneNumber: string) => void;
  onSkip?: () => void;
  onContinueWithGoogle?: () => void;
}

const AddMobileNumberScreen: React.FC<AddMobileNumberScreenProps> = ({
  email = 'priya.sharma@gmail.com',
  defaultPhoneNumber = '98765 43210',
  onBack,
  onSendCode,
  onSkip,
  onContinueWithGoogle,
}) => {
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSendCode = () => {
    onSendCode?.(phoneNumber || '98765 43210');
  };

  const handleSkip = () => {
    setIsModalVisible(true);
    onSkip?.();
  };

  const initialLetter = email ? email.charAt(0).toUpperCase() : 'P';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header with Orange Round Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingWrapper
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          {/* User Email Pill Badge */}
          <View style={styles.signedInBadge}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{initialLetter}</Text>
            </View>
            <Text style={styles.signedInText} numberOfLines={1}>
              Signed in as {email}
            </Text>
          </View>

          {/* Main Title & Subtitle */}
          <Text style={styles.title}>Add your mobile number</Text>
          <Text style={styles.subtitle}>
            Your family admin approves new members by SMS, and your number helps you get back in if you lose access.
          </Text>

          {/* Mobile Number Input with Orange Border */}
          <CommonInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="98765 43210"
            keyboardType="phone-pad"
            maxLength={15}
            activeBackgroundColor={Colors.cardBackground}
            inactiveBackgroundColor="transparent"
            activeBorderColor={Colors.primary}
            inactiveBorderColor={Colors.primary}
            focusBorderColor={Colors.primary}
            textColor={Colors.text}
            placeholderTextColor="#5C6F84"
            leftOffset={100}
            leftComponent={
              <View style={styles.countryCodeRow}>
                <Text style={styles.countryCodeText}>+91</Text>
                <Feather
                  name="chevron-down"
                  size={14}
                  color={Colors.textSecondary}
                  style={styles.chevronIcon}
                />
                <View style={styles.verticalDivider} />
              </View>
            }
            inputContainerStyle={styles.phoneInputContainer}
          />
        </View>

        {/* Bottom Actions Section */}
        <View style={styles.bottomSection}>
          <CommonBtn
            title="Send Code"
            onPress={handleSendCode}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(14.5)}
          />

          {/* Skip link button: opens the Account Already Exists modal */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingWrapper>

      {/* Account Already Exists Modal */}
      <AccountAlreadyExistsModal
        visible={isModalVisible}
        phoneNumber={`+91 ${phoneNumber || '98765 43210'}`}
        onClose={() => setIsModalVisible(false)}
        onContinueWithGoogle={() => {
          setIsModalVisible(false);
          onContinueWithGoogle?.();
        }}
        onUseDifferentNumber={() => {
          setIsModalVisible(false);
        }}
      />
    </View>
  );
};

export default AddMobileNumberScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 8,
  },
  signedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#193049',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 32,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#382619',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarLetter: {
    color: '#F0913A',
    fontSize: RFValue(11),
    fontWeight: '700',
  },
  signedInText: {
    color: '#8E9AA8',
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18.5),
    paddingHorizontal: 12,
    marginBottom: 32,
  },
  phoneInputContainer: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    height: 58,
    borderRadius: 29,
  },
  countryCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: 4,
    marginRight: 10,
  },
  verticalDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#1F3249',
    marginRight: 4,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  skipButton: {
    paddingVertical: 14,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
    textAlign: 'center',
  },
});

