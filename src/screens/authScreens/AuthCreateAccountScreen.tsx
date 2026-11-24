import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../units/Colors';
import ImagePath from '../../units/ImagePath';
import CommonBtn from '../../components/CommonBtn';
import { Fonts } from '../../units';

interface AuthCreateAccountScreenProps {
  onBack?: () => void;
  onContinueMobile?: () => void;
  onContinueGoogle?: () => void;
  onContinueApple?: () => void;
  onUseEmail?: () => void;
  isGoogleLoading?: boolean;
  isAppleLoading?: boolean;
}

const AuthCreateAccountScreen: React.FC<AuthCreateAccountScreenProps> = ({
  onBack,
  onContinueMobile,
  onContinueGoogle,
  onContinueApple,
  onUseEmail,
  isGoogleLoading = false,
  isAppleLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;
  const logoWidth = Math.min(Math.max(screenWidth * 0.52, 170), 230);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.logoSection,
          ]}
        >
          <Image
            source={ImagePath.appIcon}
            style={[
              styles.logo,
              {
                width: logoWidth,
                marginBottom: isSmallScreen ? 14 : 22,
              },
            ]}
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
            loading={isAppleLoading}
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
    justifyContent: 'center',
    flex: 0.8,
  },
  logo: {
    aspectRatio: 4000 / 2232,
    maxHeight: 160,
  },
  title: {
    fontSize: Platform.OS === 'android' ? RFValue(18) : RFValue(21),
    fontFamily: Fonts.medium,
    
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Platform.OS === 'android' ? RFValue(11) : RFValue(12.5),
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? RFValue(16) : RFValue(18),
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
    fontFamily: 'Roboto-SemiBold',
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
