import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import ImagePath from '../../units/ImagePath';
import CommonBtn from '../../components/CommonBtn';

interface AuthCreateAccountScreenProps {
  onBack?: () => void;
  onContinueMobile?: () => void;
  onContinueGoogle?: () => void;
  onContinueApple?: () => void;
  onUseEmail?: () => void;
  isGoogleLoading?: boolean;
}

const AuthCreateAccountScreen: React.FC<AuthCreateAccountScreenProps> = ({
  onBack,
  onContinueMobile,
  onContinueGoogle,
  onContinueApple,
  onUseEmail,
  isGoogleLoading = false,
}) => {
  const insets = useSafeAreaInsets();

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and Brand Name */}
        <View style={styles.logoSection}>
          <Image
            source={ImagePath.appIcon}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Your family, in sync</Text>
          <Text style={styles.subtitle}>
            Tasks, plans, reminders and check-ins for everyone at home, in one place.
          </Text>
        </View>

        {/* Action Buttons Stack */}
        <View style={styles.buttonStack}>
          {/* Continue with mobile number */}
          <CommonBtn
            title="Continue with mobile number"
            onPress={onContinueMobile}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            fontSize={RFValue(13.5)}
          />

          {/* Continue with Google */}
          <CommonBtn
            title="Continue with Google"
            onPress={onContinueGoogle}
            loading={isGoogleLoading}
            backgroundColor={Colors.background}
            borderColor={Colors.border}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            marginTop={14}
            fontSize={RFValue(13.5)}
          />

          {/* Continue with Apple */}
          <CommonBtn
            title="Continue with Apple"
            onPress={onContinueApple}
            backgroundColor={Colors.background}
            borderColor={Colors.border}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            marginTop={14}
            fontSize={RFValue(13.5)}
          />

          {/* Use email instead link */}
          <TouchableOpacity
            onPress={onUseEmail}
            activeOpacity={0.7}
            style={styles.emailLinkContainer}
          >
            <Text style={styles.emailLinkText}>Use email instead</Text>
          </TouchableOpacity>

          {/* Footer Subtext */}
          <Text style={styles.footerText}>
            Already have an account? Pick the option you used before.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AuthCreateAccountScreen;

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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 220,
    height: 90,
    marginBottom: 24,
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: RFValue(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18),
    paddingHorizontal: 16,
  },
  buttonStack: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  emailLinkContainer: {
    paddingVertical: 14,
    marginTop: 8,
  },
  emailLinkText: {
    color: Colors.primary,
    fontSize: RFValue(13.5),
    fontWeight: '600',
    textAlign: 'center',
  },
  footerText: {
    color: '#65788E',
    fontSize: RFValue(11),
    textAlign: 'center',
    marginTop: 12,
    lineHeight: RFValue(16),
    paddingHorizontal: 20,
  },
});
